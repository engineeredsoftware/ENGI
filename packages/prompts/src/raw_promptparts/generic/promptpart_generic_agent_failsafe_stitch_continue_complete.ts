/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Stitch continue complete"
 * current_version: "0.70.0"
 * versions: ["0.50.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_FAILSAFE_STITCH_CONTINUE_COMPLETE: PromptPart =
  'Continue and complete the previous output' as PromptPart;
