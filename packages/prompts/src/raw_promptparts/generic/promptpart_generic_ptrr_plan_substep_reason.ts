/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: system
 * intent: "Ptrr semantic unit: Plan Substep Reason"
 * current_version: "V48.0.0"
 * versions: ["V26.50.0"]
 * benchmarks: [
 *   { "name": "technical_accuracy", "test": "Uses concrete technical language", "score": 0.70 },
 *   { "name": "implementation_ready", "test": "Provides clear actionable guidance", "score": 0.70 }
 * ]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_PTRR_PLAN_SUBSTEP_REASON: PromptPart =
  [
    'PTRR Plan SubStep reason:',
    'Under PrepareConciseContext, reason only about which keys the Plan needs (workspace, repo coordinates, inputs) — no tools, no selectedKeys field.',
    'Under ChunkThenSum / task Plan, reason about the execution strategy for Try (approach and ordered steps), still without executing tools.',
  ].join(' ') as PromptPart;
