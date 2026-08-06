/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "PCC lean task Try step law"
 * current_version: "0.70.0"
 * versions: ["0.50.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT_LEAN_TASK_STEP_TRY: PromptPart =
  'Try: select keys so task Thinkings can execute the plan (coords + safety + tools:usable); PCC itself never useTools.' as PromptPart;
