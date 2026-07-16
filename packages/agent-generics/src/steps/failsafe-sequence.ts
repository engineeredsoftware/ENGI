/**
 * FailsafeGenerationSequence - canonical failsafe base composition.
 *
 * Logical home: @bitcode/generic-generations-failsafes.
 * Hosted in agent-generics while failsafe factories still require
 * AgentExecution registries. Prepared-context pure types live in
 * @bitcode/generic-generations-failsafes; vocabulary in
 * @bitcode/generation-generics.
 *
 * THREE failsafes in fixed order, each with a DISTINCT trigger and job:
 * 1. PrepareConciseContext — selection-only key Thinkings + value read-in
 * 2. ChunkThenSum — task Thinkings once or per-chunk + sum
 * 3. StitchUntilComplete — repair-only on incomplete/truncated output
 *
 * Sequence: selection → task(×chunks) → repair-only. Tools are step postprocess.
 */

import { sequential, type Executor } from '@bitcode/execution-generics';
import { z } from 'zod';
import {
  factoryPrepareConciseContext,
  factoryChunkThenSum,
  factoryStitchUntilComplete
} from '../generations/llm-bound-factories';
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
