/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Stitch reason continue prefix"
 * current_version: "0.70.0"
 * versions: ["0.50.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_GENERATION_REASON_STITCH_CONTINUE_PREFIX: PromptPart =
  'Continue reasoning from this partial output:' as PromptPart;
