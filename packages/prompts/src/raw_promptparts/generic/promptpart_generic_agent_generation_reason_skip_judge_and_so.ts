/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Instruct Reason Thinkings when Judge and StructuredOutput generations are skipped"
 * current_version: "0.10.0"
 * versions: ["0.10.0"]
 * benchmarks: [
 *   { "name": "technical_accuracy", "test": "Uses concrete technical language", "score": 0.60 },
 *   { "name": "implementation_ready", "test": "Provides clear actionable guidance", "score": 0.60 }
 * ]
 */

import { PromptPart } from '../../parts/PromptPart';

/**
 * Appended to Reason user envelope when Thinkings runs Reason-only
 * (BITCODE_DEBUG_SKIP_THINKINGS_JUDGE_AND_STRUCTURED_OUTPUT). Judge and
 * StructuredOutput will not run — Reason must emit both reasoning fields and
 * the final schema-shaped `output` object.
 */
export const PROMPTPART_GENERIC_AGENT_GENERATION_REASON_SKIP_JUDGE_AND_SO: PromptPart =
  [
    'Thinkings mode: Reason only — there is NO Judge generation and NO StructuredOutput generation after this call.',
    'Return ONE JSON object that includes all Reason fields (analysis, reasoningItems, conclusion, confidence, optional useTools when tools are allowed)',
    'AND a complete nested "output" object that fully matches the required structured schema shape below.',
    'Do not omit required output fields; the step will use output exactly as StructuredOutput would have produced it.',
  ].join(' ') as PromptPart;
