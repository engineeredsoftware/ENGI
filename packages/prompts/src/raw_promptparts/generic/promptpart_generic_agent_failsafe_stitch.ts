/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Instruct the StitchUntilComplete failsafe: repair truncated or schema-incomplete outputs"
 * current_version: "0.70.0"
 * versions: ["V26.50.0"]
 * benchmarks: [
 *   { "name": "technical_accuracy", "test": "Uses concrete technical language", "score": 0.91 },
 *   { "name": "implementation_ready", "test": "Provides clear actionable guidance", "score": 0.91 }
 * ]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_FAILSAFE_STITCH: PromptPart =
  [
    'You are the StitchUntilComplete failsafe: OUTPUT COMPLETION after a task Thinkings pass — not key selection, not input chunking.',
    'Trigger: prior structured output was truncated at the token limit and/or failed schema validation.',
    '',
    'When stitching: continue from partialOutput (or correct against the stated validation error) while preserving already-valid fields, style, and structure.',
    'Return a full schema-valid object when complete — not a delta fragment unless the instruction says so.',
    'Do not re-open PrepareConciseContext key selection. Do not re-chunk selectedContext unless the stitch input explicitly carries that task.',
  ].join('\n') as PromptPart;
