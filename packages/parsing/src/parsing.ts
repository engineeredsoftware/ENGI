// TODO:  gpt-4o-mini object generating could maybe be another fallback? aka call LLM to "parse" (must support "support structured object generation (like gpt-4o-mini) to generate objects." to be worth it, reliable)
//
import { z } from 'zod';
import { log } from '@bitcode/logger';

/**
 * Resolve a ZodObject's shape across zod versions. zod 3 stores `_def.shape`
 * as a LAZY FUNCTION (`() => shape`), so reading it as a plain object —
 * `Object.keys(def.shape)` / `Object.entries(def.shape)` — silently yields
 * nothing. Every shape read in this module goes through this helper.
 */
function resolveObjectShape(schema: z.ZodTypeAny): Record<string, z.ZodTypeAny> | null {
  try {
    const def: any = (schema as any)?._def;
    if (!def || def.typeName !== z.ZodFirstPartyTypeKind.ZodObject || !def.shape) return null;
    const shape = typeof def.shape === 'function' ? def.shape() : def.shape;
    return shape && typeof shape === 'object' ? (shape as Record<string, z.ZodTypeAny>) : null;
  } catch {
    return null;
  }
}

/**
 * Scan for balanced top-level `{...}` spans with a real depth counter,
 * respecting JSON string literals and escapes. Replaces the old fixed regex,
 * which hard-coded THREE levels of brace nesting and simply could not match
 * any object nested deeper — deep generations fell through to the lenient
 * brace-patching heuristics and usually the fallback chain.
 */
function scanBalancedJsonObjects(text: string): string[] {
  const spans: string[] = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (depth === 0) {
      if (ch === '{') {
        depth = 1;
        start = i;
      }
      continue;
    }
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
    } else if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && start >= 0) {
        spans.push(text.slice(start, i + 1));
        start = -1;
        inString = false;
        escaped = false;
      }
    }
  }
  return spans;
}

/**
 * Generic function to extract JSON content from LLM responses with fallbacks
 */
export function extractJsonFromResponse(response: string): string {
  try {
    // Try to find JSON in code blocks first (most common case)
    const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }

    // Scan for balanced-brace objects at any nesting depth
    const matches = scanBalancedJsonObjects(response);

    if (matches.length > 0) {
      // Try each match to find valid JSON
      for (const match of matches) {
        try {
          const potentialJson = match.trim();
          // Verify it's valid JSON by parsing it
          JSON.parse(potentialJson);
          return potentialJson;
        } catch (e) {
          // If parsing fails, continue to the next match
          continue;
        }
      }

      // If no valid JSON found but we have matches, return the last match
      // (which is likely the most complete one)
      return matches[matches.length - 1].trim();
    }

    // Look for JSON-like patterns with a more lenient approach
    // This regex finds anything that looks like a key-value pair
    const jsonLikeContent = response.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
    if (jsonLikeContent.includes(':') && (jsonLikeContent.includes('{') || jsonLikeContent.includes('}'))) {
      // Try to balance braces if needed
      let balancedJson = jsonLikeContent;
      const openBraces = (jsonLikeContent.match(/\{/g) || []).length;
      const closeBraces = (jsonLikeContent.match(/\}/g) || []).length;

      if (openBraces > closeBraces) {
        balancedJson += '}'.repeat(openBraces - closeBraces);
      } else if (closeBraces > openBraces) {
        balancedJson = '{'.repeat(closeBraces - openBraces) + balancedJson;
      }

      // If it doesn't start with {, add it
      if (!balancedJson.trim().startsWith('{')) {
        balancedJson = '{' + balancedJson;
      }

      // If it doesn't end with }, add it
      if (!balancedJson.trim().endsWith('}')) {
        balancedJson = balancedJson + '}';
      }

      return balancedJson.trim();
    }

    // If no JSON patterns found, return the raw response
    return response.trim();

  } catch (error) {
    log('Failed to extract JSON from response', 'error', {
      error: error instanceof Error ? error.message : String(error),
      responsePreview: response.slice(0, 200) + '...'
    });
    // Return the original response instead of throwing, to allow fallback mechanisms to work
    return response.trim();
  }
}


/**
 * Extract all JSON object candidates from a response.
 * Tries code blocks first; then scans for balanced-brace objects (any nesting
 * depth) and returns all matches.
 */
export function extractAllJsonObjects(response: string): string[] {
  const candidates: string[] = [];
  try {
    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/g;
    const codeBlocks = [...response.matchAll(codeBlockRegex)].map(m => (m[1] || '').trim()).filter(Boolean);
    candidates.push(...codeBlocks);
  } catch {}
  try {
    const matches = scanBalancedJsonObjects(response).map(m => m.trim()).filter(Boolean);
    candidates.push(...matches);
  } catch {}
  const seen = new Set<string>();
  const unique = candidates.filter(c => { if (seen.has(c)) return false; seen.add(c); return true; });
  return unique.length ? unique : [response.trim()];
}
/**
 * Generic response parser with schema validation and a schema-shaped fallback
 * chain. Parsing is a SINGLE deterministic pass: the input string is immutable,
 * so the old bounded re-parse retries (1s/2s sleeps between identical attempts
 * on the same string) were pure dead latency (~3s per malformed generation)
 * and have been removed.
 */
export async function parseResponse<T>(
  response: string,
  schema: z.ZodType<T>,
  fallback: () => T
): Promise<T> {
  let lastError: Error | undefined;
  const LOG_FULL = process?.env?.BITCODE_LOG_FULL_PROMPTS === '1';
  let lastExtractedJson: string | undefined;

  // Enhanced logging for better debugging
  const schemaDescription = schema.description || 'NO SCHEMA DESCRIPTION PROVIDED';
  const resolvedShape = resolveObjectShape(schema as any) || {};
  const schemaShape = Object.keys(resolvedShape);

  // Check for required fields in schema
  const requiredFields = Object.entries(resolvedShape)
    .filter(([_, fieldSchema]: [string, any]) => !(fieldSchema instanceof z.ZodOptional))
    .map(([key, _]) => key);

  log('[parsing parseResponse] Parsing string response to schema...', 'info', {
    schema: schemaDescription,
    schemaShape,
    requiredFields,
    responseLength: response.length,
    responseSliceStart: response.slice(0, 100),
    responseSliceEnd: response.slice(-100),
    hasJsonBraces: response.trim().startsWith('{') && response.trim().endsWith('}'),
    hasCodeBlock: response.includes('```')
  });

  try {
    // Extract best JSON content (try multiple candidates)
    const candidates = extractAllJsonObjects(response);
    for (const candidate of candidates) {
      try {
        const parsed = JSON.parse(candidate);
        const result = (schema as any).safeParse(parsed);
        if (result.success) {
          if (LOG_FULL) {
            log('[parsing] selected-candidate (full, validated)', 'debug', { schema: schemaDescription, jsonLength: candidate.length, json: candidate });
          }
          return result.data as T;
        }
      } catch {}
    }
    // Fallback to former single-extract approach
    const jsonContent = extractJsonFromResponse(response);
    lastExtractedJson = jsonContent;
    // Optional full logging for debugging
    if (LOG_FULL) {
      log('[parsing] extracted-json (full)', 'debug', {
        schema: schemaDescription,
        jsonLength: jsonContent.length,
        json: jsonContent,
      });
    }

    // Parse JSON
    const parsed = JSON.parse(jsonContent);

    // Validate with schema, will throw if fails
    const validated = schema.parse(parsed);

    log(`Successfully parsed and validated response of type ${typeof validated}!`, 'debug', {
      validateType: typeof validated
    });

    return validated;

  } catch (error) {
    lastError = error instanceof Error ? error : new Error(String(error));

    // Determine error type and extract relevant details
    const errorDetails = {
      type: error instanceof SyntaxError ? 'JSON Syntax Error' :
        error instanceof z.ZodError ? 'Schema Validation Error' :
          'Unknown Error',
      schemaDescription: schema.description || 'unnamed schema'
    };

    // Full error payload logging if enabled
    if (LOG_FULL) {
      log('[parsing] parse-error (full)', 'error', {
        ...errorDetails,
        errorMessage: lastError.message,
        extractedJson: lastExtractedJson,
        originalResponsePreview: response.length > 1000 ? `${response.slice(0, 500)}...${response.slice(-500)}` : response,
      });
    }

    // Enhanced error reporting based on error type
    if (error instanceof SyntaxError) {
      log('JSON Parse Error', 'warn', {
        ...errorDetails,
        message: error.message,
        position: error.message.match(/position (\d+)/)?.[1] || 'unknown',
        inputPreview: {
          around: response.slice(Math.max(0, Number(error.message.match(/position (\d+)/)?.[1] || 0) - 50),
            Number(error.message.match(/position (\d+)/)?.[1] || 0) + 50),
          fullInput: response.length > 1000 ? `${response.slice(0, 500)}...${response.slice(-500)}` : response
        }
      });
    } else if (error instanceof z.ZodError) {
      let inputShape: any = 'Invalid JSON';
      try {
        if (typeof lastExtractedJson === 'string') {
          const parsed = JSON.parse(lastExtractedJson);
          inputShape = typeof parsed === 'object' && parsed !== null ? Object.keys(parsed) : 'Invalid JSON';
        }
      } catch {}
      log('Schema Validation Error', 'warn', {
        ...errorDetails,
        validationErrors: error.issues.map(err => ({
          path: err.path.join('.'),
          code: err.code,
          message: err.message
        })),
        schemaShape,
        inputShape
      });
    } else {
      log('Parsing Error', 'warn', {
        ...errorDetails,
        error: lastError.message,
        inputPreview: response.length > 1000 ?
          `${response.slice(0, 500)}...${response.slice(-500)}` :
          response
      });
    }
  }

  log('Parsing failed - Using fallback', 'error', {
    finalError: {
      message: lastError?.message,
      type: lastError instanceof SyntaxError ? 'JSON Syntax Error' :
        lastError instanceof z.ZodError ? 'Schema Validation Error' :
          'Unknown Error',
      details: lastError instanceof z.ZodError ?
        lastError.issues.map(err => ({
          path: err.path.join('.'),
          message: err.message
        })) : lastError?.message
    },
    schema: {
      description: schema.description || 'unnamed schema',
      shape: schemaShape
    },
    inputPreview: response.length > 1000 ?
      `${response.slice(0, 500)}...${response.slice(-500)}` :
      response,
    fallbackInfo: {
      willUse: true,
      fallbackType: typeof fallback(),
      fallbackIsEmpty: Object.keys(fallback() || {}).length === 0
    }
  });

  // Use a generic approach to create a fallback based on schema shape
  try {
    if (resolveObjectShape(schema as any)) {
      const genericFallback = createGenericFallback(schema, lastError);

      // Try to validate the fallback against the schema
      try {
        return schema.parse(genericFallback);
      } catch (fallbackError) {
        log('Failed to create generic fallback from schema shape', 'debug', {
          error: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
          schemaDescription: schema.description || 'unnamed schema'
        });
        // Continue to general fallback if generic fallback fails
      }
    }
  } catch (error) {
    log('Error creating generic fallback', 'debug', {
      error: error instanceof Error ? error.message : String(error)
    });
    // Continue to general fallback
  }

  // Log the fallback result for debugging
  const fallbackResult = fallback();
  log('Using fallback result', 'info', {
    fallbackKeys: Object.keys(fallbackResult || {}),
    fallbackHasSuccess: typeof fallbackResult === 'object' && fallbackResult !== null && 'success' in fallbackResult,
    fallbackSuccess: (fallbackResult as any)?.success,
    schemaDescription: schema.description
  });

  return fallback();
}

/**
 * Creates a generic fallback object based on the schema shape
 * This is more robust than specific schema handling
 */
function createGenericFallback(schema: z.ZodType<any>, error?: Error): any {
  try {
    // Only handle ZodObject shapes here; otherwise return minimal
    const shape = resolveObjectShape(schema as any);
    if (!shape) {
      return {};
    }

    const out: Record<string, any> = {
      _metadata: {
        fallbackUsed: true,
        timestamp: new Date().toISOString(),
        originalError: error?.message,
        schema: schema.description || 'unnamed schema'
      }
    };

    for (const [key, field] of Object.entries(shape)) {
      // Normalize optional wrapper
      const fieldDef: any = (field as any)?._def;
      const isOptional = fieldDef?.typeName === z.ZodFirstPartyTypeKind.ZodOptional;
      const inner = isOptional ? fieldDef?.innerType : field;
      const innerDef: any = (inner as any)?._def;
      const typeName = innerDef?.typeName;

      if (isOptional) {
        // Skip optional keys to keep fallback minimal
        continue;
      }

      switch (typeName) {
        case z.ZodFirstPartyTypeKind.ZodString:
          out[key] = '';
          break;
        case z.ZodFirstPartyTypeKind.ZodNumber:
          out[key] = 0;
          break;
        case z.ZodFirstPartyTypeKind.ZodBoolean:
          out[key] = false;
          break;
        case z.ZodFirstPartyTypeKind.ZodArray:
          out[key] = [];
          break;
        case z.ZodFirstPartyTypeKind.ZodRecord:
          out[key] = {};
          break;
        case z.ZodFirstPartyTypeKind.ZodEnum: {
          const values = innerDef?.values;
          out[key] = Array.isArray(values) && values.length ? values[0] : null;
          break;
        }
        case z.ZodFirstPartyTypeKind.ZodObject: {
          const nested = createGenericFallback(inner as any, error);
          delete nested._metadata;
          out[key] = nested;
          break;
        }
        default:
          out[key] = null;
      }
    }

    // Common, well-known fields convenience
    if (Object.prototype.hasOwnProperty.call(shape, 'success') && out.success === undefined) {
      out.success = false;
    }
    if (Object.prototype.hasOwnProperty.call(shape, 'error') && out.error === undefined) {
      out.error = error?.message || 'Parsing failed';
    }
    if (Object.prototype.hasOwnProperty.call(shape, 'nextStepsToolsPlans') && out.nextStepsToolsPlans === undefined) {
      out.nextStepsToolsPlans = [];
    }

    log('Created generic fallback from schema', 'debug', {
      schemaDescription: schema.description || 'unnamed schema',
      fallbackKeys: Object.keys(out)
    });

    return out;
  } catch (fallbackError) {
    log('Error creating generic fallback', 'error', {
      error: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
      schemaDescription: schema.description || 'unnamed schema'
    });
    return {
      success: false,
      error: error?.message || 'Parsing failed',
      _metadata: {
        fallbackUsed: true,
        timestamp: new Date().toISOString(),
        originalError: error?.message,
        schema: schema.description || 'unnamed schema'
      }
    };
  }
}

/**
 * Helper to create a safe fallback object matching a schema. This is the last fallback after at least a few parsing methods have failed and
* will attempt to build the right object key by key.
 */
export function createFallbackResponse<T>(
  schema: z.ZodType<T>,
  error: Error,
  taskType?: string
  // TODO: raw - take raw and try to stuff them into fields?
): T {
  try {
    // Start with minimal valid object
    const fallback: any = {
      success: false,
      error: error.message,
      taskType
    };

    // Add required fields based on schema shape
    const shape = resolveObjectShape(schema as any);
    if (shape) {
      for (const [key, field] of Object.entries(shape)) {
        if (key === 'success' || key === 'error' || key === 'taskType') continue;
        const fieldDef: any = (field as any)?._def;
        const isOptional = fieldDef?.typeName === z.ZodFirstPartyTypeKind.ZodOptional;
        const inner = isOptional ? fieldDef?.innerType : field;
        const innerDef: any = (inner as any)?._def;
        const typeName = innerDef?.typeName;
        if (isOptional) continue;
        switch (typeName) {
          case z.ZodFirstPartyTypeKind.ZodArray:
            fallback[key] = [];
            break;
          case z.ZodFirstPartyTypeKind.ZodNumber:
            fallback[key] = 0;
            break;
          case z.ZodFirstPartyTypeKind.ZodString:
            fallback[key] = '';
            break;
          case z.ZodFirstPartyTypeKind.ZodObject:
            fallback[key] = createFallbackResponse(inner as any, error);
            break;
          case z.ZodFirstPartyTypeKind.ZodBoolean:
            fallback[key] = false;
            break;
          case z.ZodFirstPartyTypeKind.ZodEnum: {
            const enumValues = innerDef?.values;
            fallback[key] = Array.isArray(enumValues) && enumValues.length ? enumValues[0] : null;
            break;
          }
          case z.ZodFirstPartyTypeKind.ZodRecord:
            fallback[key] = {};
            break;
          default:
            fallback[key] = null;
        }
      }
    }

    // Add nextStepsToolsPlans if it's required by the schema
    if (shape && (shape as any).nextStepsToolsPlans && !fallback.nextStepsToolsPlans) {
      fallback.nextStepsToolsPlans = [];
    }

    // Try to parse with the schema
    return schema.parse(fallback);
  } catch (parseError) {
    // If parsing fails, create a minimal object that satisfies the schema
    log('Failed to create fallback response with schema', 'error', {
      error: parseError instanceof Error ? parseError.message : String(parseError),
      originalError: error.message,
      schemaDescription: schema.description
    });

    // Create a truly minimal object
    const minimalFallback: any = {
      success: false,
      error: error.message,
    };

    try {
      return schema.parse(minimalFallback);
    } catch (finalError) {
      // Last resort: return an empty object and hope for the best
      log('Failed to create even minimal fallback', 'error', {
        error: finalError instanceof Error ? finalError.message : String(finalError)
      });
      return {} as T;
    }
  }
}
