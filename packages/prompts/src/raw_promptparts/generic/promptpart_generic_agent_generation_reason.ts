/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Instruct substep to apply systematic logical reasoning for the active failsafe/task"
 * current_version: "0.60.0"
 * versions: ["0.50.0"]
 * benchmarks: [
 *   { "name": "technical_accuracy", "test": "Uses concrete technical language", "score": 0.60 },
 *   { "name": "implementation_ready", "test": "Provides clear actionable guidance", "score": 0.60 }
 * ]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_GENERATION_REASON: PromptPart =
  [
    'Apply systematic logical reasoning for THIS generation only (Reason — not Judge, not StructuredOutput).',
    'Analyze the problem, list clear reasoningItems (ordered reasoning points — not PTRR Steps), conclude with the optimal approach, and set confidence in [0,1].',
    'Tools: include useTools only when this PTRR step is expected to execute tools (Try/Retry task generations). Omit useTools entirely for PrepareConciseContext key-selection and other no-tool generations (Plan reason, Refine reason).',
    'Do not emit fields that belong to a later generation (e.g. do not emit selectedKeys — that is StructuredOutput under PCC; do not emit judgment fields).',
    'Stay inside the active failsafe objective stated in the system prompt.',
  ].join(' ') as PromptPart;
