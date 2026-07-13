/**
 * Generation primitives — vocabulary for failsafe parents and thinking children.
 *
 * Hierarchy:
 *   @bitcode/execution-generics          Executor / Execution
 *   @bitcode/generation-generics         this package (Generation types + enums)
 *   @bitcode/generic-generations/*       base failsafe / thinkings implementations
 *   @bitcode/agent-generics              Agent + PTRR composition over generations
 *   product (e.g. pipeline-asset-pack)   specialized agents / synthesis generations
 */

import type { Executor } from '@bitcode/execution-generics';

/**
 * Generation — typed Executor used as the atomic intelligence unit
 * (Thinkings, or a failsafe-wrapped sequence of Thinkings).
 */
export type Generation<TInput = any, TOutput = any> = Executor<TInput, TOutput>;

/**
 * Failsafe parents: fixed order, distinct triggers.
 * 1. CONTEXT SIGNAL/NOISE — key selection + value read-in
 * 2. BIG INPUT — task generation; chunk when request exceeds limit
 * 3. BIG OUTPUT — schema-incomplete / truncated repair only
 */
export enum FailsafeMetaSubStep {
  PREPARE_CONCISE_CONTEXT = 'prepare_concise_context',
  CHUNK_THEN_SUM = 'chunk_then_sum',
  STITCH_UNTIL_COMPLETE = 'stitch_until_complete',
}

/**
 * Thinkings children: ALWAYS Reason → Judge → StructuredOutput.
 */
export enum GenerationSubMetaSubStep {
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

export interface FailsafeContext {
  [FailsafeMetaSubStep.PREPARE_CONCISE_CONTEXT]: {
    purpose: 'CONTEXT SIGNAL/NOISE';
    input: 'Keys-only tree of the FULL root execution state (values never included)';
    output: 'Selected keys + the read-in selected context values';
  };
  [FailsafeMetaSubStep.CHUNK_THEN_SUM]: {
    purpose: 'BIG INPUT';
    input: 'Task input + PCC-selected context values';
    output: 'Task result (one pass, or per-chunk passes + one summing pass)';
  };
  [FailsafeMetaSubStep.STITCH_UNTIL_COMPLETE]: {
    purpose: 'CONVERSATIONSUTPUT';
    input: 'Potentially truncated output';
    output: 'Complete validated output matching schema';
  };
}
