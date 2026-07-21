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
 *
 * Operator flag (Failsafe sequence only — Thinkings stay independently gated):
 *   BITCODE_DEBUG_SKIP_FAILSAFES=1
 * runs bare task Thinkings (no PCC / ChunkThenSum / Stitch). Return envelope
 * still exposes { context, output, finalOutput } for step consumers.
 * Must reach the in-box pipeline process (pipeline-host-command-env allowlist).
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
  /** Opt-in independent chunk Thinkings (no prior completions). Canonical CS is sequential with priors. */
  enableParallelChunks?: boolean;
  /** Debug: include only these failsafes (prepare | chunk | stitch). Ignored when skip failsafes is on. */
  onlyFailsafes?: string[];
}

/**
 * When true, createFailsafeGenerationSequence skips all three failsafes and
 * runs task Thinkings once on the step input. Opaque to PTRR steps — only
 * this composition reads it. Default unset = false.
 */
export function isSkipFailsafes(): boolean {
  const raw = String(process?.env?.BITCODE_DEBUG_SKIP_FAILSAFES || '')
    .trim()
    .toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes' || raw === 'on';
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

  // Operator debug: bare task Thinkings (no prepare / chunk / stitch parents).
  // Still returns the stitch-shaped envelope consumers unwrap via finalOutput ?? output.
  if (isSkipFailsafes()) {
    const fn = (async (input: TIn, execution: any) => {
      const result: any = await (thinkings as Executor<any, any>)(input, execution);
      const finalOutput =
        result && typeof result === 'object' && 'output' in result
          ? (result as any).output
          : result?.finalOutput ?? result;
      return {
        ...(result && typeof result === 'object' ? result : {}),
        context:
          result && typeof result === 'object' && result.context && typeof result.context === 'object'
            ? result.context
            : {},
        output: finalOutput,
        finalOutput,
      };
    }) as unknown as FailsafeGenerationSequence<TIn, TOut>;
    (fn as any).__gen = 'failsafes';
    (fn as any).__failsafesMode = 'skip_failsafes';
    return fn;
  }

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
      factoryChunkThenSum(taskGenerations, {
        parallel: options.enableParallelChunks === true,
      }) as Executor<any, any>
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
