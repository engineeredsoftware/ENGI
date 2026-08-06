/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "PCC lean task active step prefix"
 * current_version: "0.70.0"
 * versions: ["0.50.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT_LEAN_TASK_STEP_ACTIVE_PREFIX: PromptPart =
  'Active step:' as PromptPart;
