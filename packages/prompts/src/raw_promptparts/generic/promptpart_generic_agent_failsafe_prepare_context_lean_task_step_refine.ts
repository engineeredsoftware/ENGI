/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "PCC lean task Refine step law"
 * current_version: "0.70.0"
 * versions: ["0.50.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT_LEAN_TASK_STEP_REFINE: PromptPart =
  'Refine: select keys for final return only — no tools.' as PromptPart;
