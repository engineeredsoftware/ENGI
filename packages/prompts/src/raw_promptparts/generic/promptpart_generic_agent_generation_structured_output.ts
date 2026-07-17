/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Instruct substep to format reasoning and judgment into required type without additional thinking"
 * current_version: "0.70.0"
 * versions: ["0.50.0", "0.60.0"]
 * benchmarks: [
 *   { "name": "technical_accuracy", "test": "Uses concrete technical language", "score": 0.60 },
 *   { "name": "implementation_ready", "test": "Provides clear actionable guidance", "score": 0.60 }
 * ]
 */

import { PromptPart } from '../../parts/PromptPart';

/**
 * Generic StructuredOutput instruction.
 * Does **not** mention useTools — tool selection belongs only when the active
 * schema requires it (Try/Retry task SO). PrepareConciseContext selection SO
 * must emit selectedKeys only and must never be told to include useTools.
 */
export const PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT: PromptPart =
  [
    'Format the reasoning and judgment into the required output type.',
    'Do not perform additional reasoning — simply slot the results into the correct JSON structure',
    'with correct types for every required field.',
    'Emit only fields present in the active schema; do not invent extra fields.',
  ].join(' ') as PromptPart;
