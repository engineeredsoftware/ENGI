/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "CS reason prepared input label"
 * current_version: "0.70.0"
 * versions: ["0.50.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_GENERATION_REASON_PREPARED_TASK_INPUT_LABEL: PromptPart =
  'Task input (prepared):' as PromptPart;
