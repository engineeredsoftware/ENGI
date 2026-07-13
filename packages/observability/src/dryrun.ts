/**
 * @file dryrun.ts
 * @description Provides utilities for running the pipeline in dry run mode
 * 
 * Dry run mode allows testing the pipeline without making actual LLM calls or
 * external changes. This is useful for development, testing, and debugging.
 */

import { z } from 'zod';
import { log } from '@bitcode/logger';
// import { PIPELINE_CONSTANTS } from '@/lib/engine/constants';
import { writeStreamMessage, type DataStream } from '@bitcode/api/streams';
// import { ChatCompletionRequestMessage } from '@/lib/steps/meta';

// Temporary stubs
const PIPELINE_CONSTANTS = { DRY_RUN_MODE: false };
type ChatCompletionRequestMessage = any;

function resolveDataStream(): DataStream | undefined {
  return undefined;
}

/**
 * Checks if dry run mode is enabled
 */
export function isDryRunEnabled(): boolean {
  return process.env.DRY_RUN === 'true' || PIPELINE_CONSTANTS.DRY_RUN_MODE === true;
}

/**
 * Checks if a tool should be executed even in dry run mode
 * Repository cloning and file tracking should still work in dry run mode
 */
export function shouldExecuteInDryRun(toolName: string): boolean {
  const nonLlmTools = [
    'cloneRepository',
    'identifyCriticalPaths',
    'filterRelevantFiles',
    'findCodeSnippets',
    'analyzeFileContent',
    'fixGitPermissions',
    'cleanWorkingDir'
  ];

  return nonLlmTools.includes(toolName);
}

/**
 * Logs a prompt that would have been sent to the LLM in dry run mode
 */
export async function logDryRunPrompt(
  messages: ChatCompletionRequestMessage[],
  purpose: string,
  executionState: {
    phase: string;
    agent: string;
    step: string;
    failsafe?: string;
    generation?: string;
  },
  correlationId?: string
): Promise<void> {
  // Log the prompt
  log('DRY RUN: LLM prompt that would have been sent', 'info', {
    purpose,
    messageCount: messages.length,
    systemPrompt: messages.find(m => m.role === 'system')?.content?.slice(0, 200) + '...',
    executionState,
    correlationId,
    timestamp: new Date().toISOString()
  });

  // Stream the status
  const dataStream = resolveDataStream();
  await writeStreamMessage(dataStream, {
    type: 'status',
    progress: 'info',
    message: `DRY RUN: LLM prompt for ${purpose}`,
    detail: messages.map(m => `${m.role}: ${m.content}`).join('\n'),
    metadata: { dryRun: true, purpose, correlationId }
  });
}

/**
 * Logs a response that would have been received from the LLM in dry run mode
 */
export async function logDryRunResponse(
  response: any,
  purpose: string,
  executionState: {
    phase: string;
    agent: string;
    step: string;
    failsafe?: string;
    generation?: string;
  },
  correlationId?: string
): Promise<void> {
  // Log the response
  log('DRY RUN: Simulated LLM response', 'info', {
    purpose,
    responseType: typeof response,
    responsePreview: JSON.stringify(response).slice(0, 200) + '...',
    executionState,
    correlationId,
    timestamp: new Date().toISOString()
  });

  // Stream the status
  const dataStream = resolveDataStream();
  await writeStreamMessage(dataStream, {
    type: 'status',
    progress: 'info',
    message: `DRY RUN: Simulated LLM response for ${purpose}`,
    detail: JSON.stringify(response).slice(0, 200),
    metadata: { dryRun: true, purpose, correlationId }
  });
}

/**
 * Generates a default response based on the schema
 */
export function generateDefaultResponse<T>(schema: z.ZodType<T>): T {
  try {
    // Convert schema to JSON schema
    const jsonSchema = schema.safeParse({});

    // If the schema has a default value, use it
    if (jsonSchema.success) {
      return jsonSchema.data as T;
    }

    // Try to use the default JSON response from constants
    try {
      const defaultJson = JSON.parse(PIPELINE_CONSTANTS.DRY_RUN_LLM_RESPONSE_JSON);
      const parsed = schema.safeParse(defaultJson);
      if (parsed.success) {
        return parsed.data;
      }
    } catch (e) {
      // Ignore parsing errors and continue to fallback
    }

    // Create a minimal valid object based on the schema
    const result = createMinimalValidObject(schema);

    // Add metadata
    if (typeof result === 'object' && result !== null) {
      (result as any)._metadata = {
        ...(result as any)._metadata || {},
        dryRun: true,
        timestamp: new Date().toISOString(),
        schema: schema.description || 'unknown'
      };
    }

    return result;
  } catch (error) {
    log('Error generating default response for dry run', 'error', {
      error: error instanceof Error ? error.message : String(error),
      schema: schema.description || 'unknown'
    });

    // Ultimate fallback
    return {
      success: true,
      _metadata: {
        dryRun: true,
        timestamp: new Date().toISOString(),
        schema: schema.description || 'unknown',
        fallbackUsed: true,
        error: error instanceof Error ? error.message : String(error)
      }
    } as unknown as T;
  }
}

/**
 * Creates a minimal valid object based on a Zod schema
 */
function createMinimalValidObject<T>(schema: z.ZodType<T>): T {
  // Handle primitive types
  if (schema instanceof z.ZodString) return '' as unknown as T;
  if (schema instanceof z.ZodNumber) return 0 as unknown as T;
  if (schema instanceof z.ZodBoolean) return false as unknown as T;
  if (schema instanceof z.ZodArray) return [] as unknown as T;
  if (schema instanceof z.ZodNull) return null as unknown as T;

  // Handle objects
  if (schema instanceof z.ZodObject) {
    const shape = schema._def.shape();
    const result: Record<string, any> = {};

    // Process each property
    for (const [key, propSchema] of Object.entries(shape)) {
      // Skip optional properties to keep the object minimal
      if (propSchema instanceof z.ZodOptional) continue;

      // Recursively create values for required properties
      result[key] = createMinimalValidObject(propSchema as z.ZodType<any>);
    }

    // Add metadata
    result._metadata = {
      dryRun: true,
      timestamp: new Date().toISOString(),
      schema: schema.description || 'unknown'
    };

    return result as T;
  }

  // Handle enums
  if (schema instanceof z.ZodEnum) {
    const values = schema._def.values;
    return values[0] as unknown as T;
  }

  // Handle unions
  if (schema instanceof z.ZodUnion) {
    const options = schema._def.options;
    return createMinimalValidObject(options[0]);
  }

  // Default fallback
  return {
    success: true,
    _metadata: {
      dryRun: true,
      timestamp: new Date().toISOString(),
      schema: schema.description || 'unknown'
    }
  } as unknown as T;
}
