/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "User directive for CS prepared-task Judge"
 * current_version: "0.70.0"
 * versions: ["0.50.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE_PREPARED_TASK_USER: PromptPart =
  'Judge the prior task reasoning against prepared context and the step objective (in system).' as PromptPart;
