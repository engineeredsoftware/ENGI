/**
 * FailsafeGenerationSequence - Canonical 3×3 sequence builder
 *
 * Formalizes the default step implementation: three failsafe parents, each
 * running the exact same three-generation children (Reason → Judge → Output).
 * Tools execution is a Step-level postprocess and is composed by step
 * factories after this core.
 */

import { sequential, type Executor } from '@bitcode/execution-generics';
import { z } from 'zod';
import {
  factoryPrepareConciseContext,
  factoryChunkThenSum,
  factoryStitchUntilComplete
} from '../substeps/factories';
import { createThinkingsGeneration } from './thinkings-generation';

export type FailsafeGenerationSequence<TIn = any, TOut = any> = Executor<TIn, TOut>;

export interface FailsafeGenerationOptions<TOut> {
  outputSchema: z.ZodType<TOut>;
  enableParallelChunks?: boolean;  // chunking strategy
  // Debug env slicing (honors BITCODE_DEBUG_* environment variables)
  onlyGenerations?: string[];      // ['reason','judge','structured_output']
  onlyFailsafes?: string[];        // ['prepare','chunk','stitch']
}

/**
 * createFailsafeGenerationSequence - Build the default 3×3 + tools step
 */
export function createFailsafeGenerationSequence<TIn, TOut>(
  options: FailsafeGenerationOptions<TOut>
): FailsafeGenerationSequence<TIn, TOut> {
  // Single neutral typed generation (Reason→Judge→StructuredOutput)
  const thinkings = createThinkingsGeneration<TIn, TOut>(options.outputSchema);
  const children: Executor<any, any>[] = [thinkings as Executor<any, any>];

  // Optional debug filtering via env or passed arrays
  // Thinkings generation handles internal filtering of reason/judge/structured
  // via BITCODE_DEBUG_ONLY_GENERATIONS. Always include it here.
  const gens = children;

  const onlyFails = (options.onlyFailsafes && options.onlyFailsafes.length)
    ? options.onlyFailsafes
    : String(process?.env?.BITCODE_DEBUG_ONLY_FAILSAFES || '')
        .toLowerCase()
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

  // Compose the 3 failsafes with optional filtering
  const failsafeExecutors: Executor<any, any>[] = [];
  if (!onlyFails.length || onlyFails.includes('prepare')) {
    failsafeExecutors.push(factoryPrepareConciseContext(gens) as Executor<any, any>);
  }
  if (!onlyFails.length || onlyFails.includes('chunk')) {
    failsafeExecutors.push(
      factoryChunkThenSum(gens, { parallel: options.enableParallelChunks ?? true }) as Executor<any, any>
    );
  }
  if (!onlyFails.length || onlyFails.includes('stitch')) {
    failsafeExecutors.push(factoryStitchUntilComplete(gens, options.outputSchema) as Executor<any, any>);
  }

  const core = sequential<any>(...failsafeExecutors);

  return core as unknown as FailsafeGenerationSequence<TIn, TOut>;
}

// Alias with a name that fully conveys the sequence purpose
export function createContextfulFailsafedThinkingsGeneration<TIn, TOut>(
  options: FailsafeGenerationOptions<TOut>
): FailsafeGenerationSequence<TIn, TOut> {
  return createFailsafeGenerationSequence<TIn, TOut>(options);
}

// Short alias emphasizing agentic nature
export const createFailsafedGeneration = createContextfulFailsafedThinkingsGeneration;
