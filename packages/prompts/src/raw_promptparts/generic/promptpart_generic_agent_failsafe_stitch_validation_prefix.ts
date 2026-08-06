/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Stitch validation error prefix"
 * current_version: "0.70.0"
 * versions: ["0.50.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_FAILSAFE_STITCH_VALIDATION_PREFIX: PromptPart =
  'The previous output failed schema validation:' as PromptPart;
