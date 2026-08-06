/**
 * ThinkingsGeneration - Reason → Judge → StructuredOutput.
 *
 * Logical home: @bitcode/generic-generations-thinkings (base Thinkings).
 * Hosted here while factoryReason/Judge/StructuredOutput still depend on
 * AgentExecution LLM registries. Product code should treat this as the
 * generic-generations Thinkings base, not a product-local helper.
 *
 * Operator flag (Thinkings sequence only — failsafes/PTRR steps stay opaque):
 *   BITCODE_DEBUG_SKIP_THINKINGS_JUDGE_AND_STRUCTURED_OUTPUT=1
 * skips Judge and StructuredOutput; Reason emits reasoning + schema-shaped
 * `output` so the Thinkings return envelope is unchanged for consumers.
 * Default unset = false (full Reason → Judge → StructuredOutput).
 *
 * Product deposit/read runs in a Vercel sandbox: the flag must be present on
 * the *in-box* process env (forwarded via pipeline-host-command-env
 * TRUSTED_PIPELINE_HOST_COMMAND_ENV_KEYS). Setting it only on the Next.js
 * host is a no-op for createThinkingsGeneration inside the box.
 */

import { sequential, type Executor } from '@bitcode/execution-generics';
import { z } from 'zod';
import { factoryReason, factoryJudge, factoryStructuredOutput } from '../generations/llm-bound-factories';

/**
 * Thinkings + Generation hierarchy name (base Thinkings composition of the
 * Generation primitive). Prefer hierarchy-encoded names for product extensions
 * (e.g. MeasureAbsolutesThinkingsGeneration) when introducing specialized bases.
 */
export type ThinkingsGeneration<TIn = any, TOut = any> = Executor<TIn, TOut>;

/**
 * When true, createThinkingsGeneration runs Reason only (no Judge / SO LLM
 * calls). Opaque to PTRR steps and failsafes — only this composition reads it.
 */
export function isSkipThinkingsJudgeAndStructuredOutput(): boolean {
  const raw = String(
    process?.env?.BITCODE_DEBUG_SKIP_THINKINGS_JUDGE_AND_STRUCTURED_OUTPUT || '',
  )
    .trim()
    .toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes' || raw === 'on';
}

export function createThinkingsGeneration<TIn, TOut>(
  outputSchema: z.ZodType<TOut>,
): ThinkingsGeneration<TIn, TOut> {
  // Reason-only path: single LLM generation; Reason is schema-aware so
  // `output` still matches StructuredOutput's schema for step consumers.
  if (isSkipThinkingsJudgeAndStructuredOutput()) {
    const genReasonOnly = factoryReason({ structuredOutputSchema: outputSchema });
    const fn = sequential<any>(genReasonOnly as Executor<any, any>) as unknown as ThinkingsGeneration<
      TIn,
      TOut
    >;
    (fn as any).__gen = 'thinkings';
    (fn as any).__thinkingsMode = 'skip_judge_and_structured_output';
    return fn;
  }

  // Default: Reason → Judge → StructuredOutput (no partial whitelist filter).
  const genReason = factoryReason();
  const genJudge = factoryJudge();
  const genStructured = factoryStructuredOutput(outputSchema);

  const fn = sequential<any>(
    genReason as Executor<any, any>,
    genJudge as Executor<any, any>,
    genStructured as Executor<any, any>,
  ) as unknown as ThinkingsGeneration<TIn, TOut>;
  // Mark for introspection
  (fn as any).__gen = 'thinkings';
  return fn;
}
