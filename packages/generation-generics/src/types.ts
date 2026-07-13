/**
 * Generation primitives — vocabulary for failsafe parents and thinkings children.
 *
 * Hierarchy (names encode full ancestry):
 *   Generation                              # primitive (typed Executor)
 *     → FailsafeGeneration                  # base: PCC / ChunkThenSum / Stitch
 *     → ThinkingsGeneration                 # base: Reason → Judge → StructuredOutput
 *         (each FailsafeGeneration runs Thinkings as its child generation sequence)
 *
 * Package hierarchy:
 *   @bitcode/execution-generics             Executor / Execution
 *   @bitcode/generation-generics            this package (Generation types + kind enums)
 *   @bitcode/generic-generations/failsafes  FailsafeGeneration base surface
 *   @bitcode/generic-generations/thinkings  ThinkingsGeneration base surface
 *   @bitcode/agent-generics                 Agent composition; LLM-bound factories (for now)
 *   @bitcode/generic-agents-ptrr            PTRRAgent steps compose Failsafe + Thinkings
 *   product                                 specialized agents / generations
 */

import type { Executor } from '@bitcode/execution-generics';

/**
 * Generation — typed Executor used as the atomic intelligence unit
 * (Thinkings, or a failsafe-wrapped sequence of Thinkings).
 */
export type Generation<TInput = any, TOutput = any> = Executor<TInput, TOutput>;

/**
 * FailsafeGeneration kinds — fixed order, distinct triggers.
 * Parents within a PTRR step; each runs ThinkingsGeneration children.
 *
 * 1. CONTEXT SIGNAL/NOISE — key selection + value read-in
 * 2. BIG INPUT — task generation; chunk when request exceeds limit
 * 3. BIG OUTPUT — schema-incomplete / truncated repair only
 */
export enum FailsafeGeneration {
  PREPARE_CONCISE_CONTEXT = 'prepare_concise_context',
  CHUNK_THEN_SUM = 'chunk_then_sum',
  STITCH_UNTIL_COMPLETE = 'stitch_until_complete',
}


/**
 * ThinkingsGeneration kinds — ALWAYS Reason → Judge → StructuredOutput.
 * Children of each FailsafeGeneration (and the core of a Thinkings sequence).
 */
export enum ThinkingsGeneration {
  REASON = 'reason',
  JUDGE = 'judge',
  STRUCTURED_OUTPUT = 'structured_output',
}


export interface Reasoning {
  analysis: string;
  steps: string[];
  conclusion: string;
  confidence: number;
  useTools?: Array<{ name: string; input: any; reason: string; tool?: unknown }>;
  toolsCombinator?: string;
}

export interface Judgment {
  quality: number;
  issues: string[];
  suggestions: string[];
  approved: boolean;
}

/**
 * Spec contract for each FailsafeGeneration kind (purpose / I/O).
 */
export interface FailsafeContext {
  [FailsafeGeneration.PREPARE_CONCISE_CONTEXT]: {
    purpose: 'CONTEXT SIGNAL/NOISE';
    input: 'Keys-only tree of the FULL root execution state (values never included)';
    output: 'Selected keys + the read-in selected context values';
  };
  [FailsafeGeneration.CHUNK_THEN_SUM]: {
    purpose: 'BIG INPUT';
    input: 'Task input + PCC-selected context values';
    output: 'Task result (one pass, or per-chunk passes + one summing pass)';
  };
  [FailsafeGeneration.STITCH_UNTIL_COMPLETE]: {
    purpose: 'CONVERSATIONSUTPUT';
    input: 'Potentially truncated output';
    output: 'Complete validated output matching schema';
  };
}
