// @ts-nocheck
/**
 * Dry Run Mode Configuration
 * 
 * This module provides configuration and utilities for running the system in "dry run" mode,
 * where LLM calls are skipped and default values are returned immediately.
 */

import { z } from 'zod';
import { log } from '@bitcode/logger';
import { writeStreamMessage, type DataStream } from '@bitcode/api/streams';
import { PIPELINE_CONSTANTS } from '@/lib/engine/constants';

/**
 * Configuration for dry run mode
 */
export interface DryRunConfig {
  enabled: boolean;
  logPrompts: boolean;
  logResponses: boolean;
  mockResponses?: boolean;
  mockResponsesPath?: string;
  recordMode?: boolean;
}

// Global dry run configuration with defaults
let dryRunConfig: DryRunConfig = {
  enabled: process.env.DRY_RUN_MODE === 'true',
  logPrompts: true,
  logResponses: true,
  mockResponses: false,
  mockResponsesPath: './mock_responses',
  recordMode: false
};

/**
 * Configure dry run mode
 * @param config Configuration for dry run mode
 */
export function configureDryRun(config: Partial<DryRunConfig>): void {
  dryRunConfig = {
    ...dryRunConfig,
    ...config
  };

  log('Dry run mode configured', 'info', {
    config: dryRunConfig
  });
}

/**
 * Get the current dry run configuration
 */
export function getDryRunConfig(): DryRunConfig {
  return { ...dryRunConfig };
}

/**
 * Check if dry run mode is enabled
 */
export function isDryRunEnabled(): boolean {
  return process.env.DRY_RUN_MODE === 'true' || PIPELINE_CONSTANTS.DRY_RUN_MODE === true;
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
 * Log a prompt in dry run mode
 * This function logs the full prompt and context without making an actual LLM call
 */
export async function logDryRunPrompt(
  messages: Array<{ role: string; content: string }>,
  purpose: string,
  executionState?: {
    phase?: string;
    agent?: string;
    step?: string;
    failsafe?: string;
    generation?: string;
  },
  correlationId?: string,
  dataStream?: DataStream
): Promise<void> {
  if (!dryRunConfig.enabled || !dryRunConfig.logPrompts) {
    return;
  }

  await writeStreamMessage(dataStream, {
    type: 'thinking',
    message: `DRY RUN prompt: ${purpose}`,
    executionState,
    correlationId,
    metadata: {
      dryRun: true,
      purpose,
      promptPreview: messages.map((m) => ({
        role: m.role,
        preview: m.content.slice(0, 500) + (m.content.length > 500 ? '...' : '')
      })),
      timestamp: new Date().toISOString()
    }
  });

  // Log the full prompt for debugging
  log(`[DRY RUN] LLM prompt for ${purpose}`, 'info', {
    dryRun: true,
    purpose,
    executionState,
    messages: messages.map(m => ({
      role: m.role,
      contentLength: m.content.length,
      contentPreview: m.content.slice(0, 200) + (m.content.length > 200 ? '...' : '')
    }))
  });
}

/**
 * Generate a default response object based on a Zod schema
 * This is used in dry run mode to return sensible default values
 */
export function generateDefaultResponse<T>(schema: z.ZodType<T>): T {
  try {
    // Get the schema definition
    const def = (schema as any)._def;

    // Handle different schema types
    if (def.typeName === 'ZodObject') {
      const result: Record<string, any> = {};

      // Process each property in the schema
      Object.entries(def.shape()).forEach(([key, propertySchema]: [string, any]) => {
        // Special handling for common fields
        if (key === 'nextStepsToolsPlans') {
          // Always provide empty array for tool plans in dry run
          result[key] = [];
        } else if (key === 'success') {
          // Success should default to true in dry run
          result[key] = true;
        } else if (key === '_metadata') {
          result[key] = {
            dryRun: true,
            timestamp: new Date().toISOString()
          };
          // Handle different property types
        } else if (propertySchema._def.typeName === 'ZodString') {
          result[key] = `[DRY RUN] Default ${key}`;
        } else if (propertySchema._def.typeName === 'ZodNumber') {
          result[key] = 0;
        } else if (propertySchema._def.typeName === 'ZodBoolean') {
          result[key] = true;
        } else if (propertySchema._def.typeName === 'ZodArray') {
          result[key] = [];
        } else if (propertySchema._def.typeName === 'ZodObject') {
          result[key] = generateDefaultResponse(propertySchema);
        } else if (propertySchema._def.typeName === 'ZodEnum') {
          // Use the first enum value
          result[key] = propertySchema._def.values[0];
        } else if (propertySchema._def.typeName === 'ZodOptional') {
          // For optional fields, use the inner type
          result[key] = generateDefaultResponse(propertySchema._def.innerType);
        } else {
          // Default fallback
          result[key] = null;
        }
      });

      // Add success field if not present
      if (def.shape().success === undefined) {
        result.success = true;
      }

      return result as T;
    } else if (def.typeName === 'ZodArray') {
      // Return empty array for array schemas
      return [] as unknown as T;
    } else {
      // Default fallback for other schema types
      return {} as T;
    }
  } catch (error) {
    log('Error generating default response for dry run mode', 'error', {
      error: error instanceof Error ? error.message : String(error),
      schema: schema.description || 'unknown schema'
    });

    // Return a basic object with success=true as fallback
    return { success: true } as unknown as T;
  }
}

/**
 * Log a response in dry run mode
 */
export async function logDryRunResponse<T>(
  response: T,
  purpose: string,
  executionState?: {
    phase?: string;
    agent?: string;
    step?: string;
    failsafe?: string;
    generation?: string;
  },
  correlationId?: string,
  dataStream?: DataStream
): Promise<void> {
  if (!dryRunConfig.enabled || !dryRunConfig.logResponses) {
    return;
  }

  await writeStreamMessage(dataStream, {
    type: 'completion',
    progress: 'success',
    message: `DRY RUN response: ${purpose}`,
    executionState,
    correlationId,
    metadata: {
      dryRun: true,
      purpose,
      responsePreview: JSON.stringify(response).slice(0, 500) +
        (JSON.stringify(response).length > 500 ? '...' : ''),
      timestamp: new Date().toISOString()
    }
  });

  // Log the response for debugging
  log(`[DRY RUN] LLM response for ${purpose}`, 'info', {
    dryRun: true,
    purpose,
    executionState,
    response: JSON.stringify(response).slice(0, 500) + (JSON.stringify(response).length > 500 ? '...' : '')
  });
}
