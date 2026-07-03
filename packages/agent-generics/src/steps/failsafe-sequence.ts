/**
 * FailsafeGenerationSequence - Canonical failsafes sequence builder
 *
 * Formalizes the default step generation as THREE failsafes in fixed order,
 * each with a DISTINCT trigger and a DISTINCT job:
 *
 * 1. PrepareConciseContext (context failsafe; ALWAYS runs; selection-only):
 *    ONE selection Thinkings against the key-selection schema over the
 *    keys-only root execution state, then the value read-in of exactly the
 *    selected keys.
 * 2. ChunkThenSum (input failsafe; trigger = composed request exceeds the
 *    request limit): ONE task Thinkings when the request fits; per-chunk task
 *    generations + one summing pass when it does not.
 * 3. StitchUntilComplete (output failsafe; trigger = schema-INCOMPLETE or
 *    truncated): repair-only, error-carrying stitch generations, bounded.
 *
 * The sequence is selection -> task(xchunks) -> repair-only; the failsafes do
 * NOT wrap three identical task generations. Tools execution is a Step-level
 * postprocess and is composed by step factories after this core.
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
 * createFailsafeGenerationSequence - Build the default
 * selection -> task(xchunks) -> repair-only step generation
 */
export function createFailsafeGenerationSequence<TIn, TOut>(
  options: FailsafeGenerationOptions<TOut>
): FailsafeGenerationSequence<TIn, TOut> {
  // The task Thinkings (Reason→Judge→StructuredOutput against the step's
  // output schema) — run by ChunkThenSum (once, or per chunk + sum) and by
  // StitchUntilComplete for its repair generations only.
  const thinkings = createThinkingsGeneration<TIn, TOut>(options.outputSchema);
  const taskGenerations: Executor<any, any>[] = [thinkings as Executor<any, any>];

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
    // PCC runs its OWN selection generation (key-selection schema) — it does
    // not wrap the task generation.
    failsafeExecutors.push(factoryPrepareConciseContext() as Executor<any, any>);
  }
  if (!onlyFails.length || onlyFails.includes('chunk')) {
    failsafeExecutors.push(
      factoryChunkThenSum(taskGenerations, { parallel: options.enableParallelChunks ?? true }) as Executor<any, any>
    );
  }
  if (!onlyFails.length || onlyFails.includes('stitch')) {
    failsafeExecutors.push(factoryStitchUntilComplete(taskGenerations, options.outputSchema) as Executor<any, any>);
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
