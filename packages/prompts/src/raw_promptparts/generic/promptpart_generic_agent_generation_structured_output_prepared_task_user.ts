/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "CS prepared-task SO user directive"
 * current_version: "0.70.0"
 * versions: ["0.50.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT_PREPARED_TASK_USER: PromptPart =
  'Generate structured output for the step schema from prior reasoning/judgment and prepared context only.' as PromptPart;
