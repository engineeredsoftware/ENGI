/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Stitch validation repair suffix"
 * current_version: "0.70.0"
 * versions: ["0.50.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_FAILSAFE_STITCH_VALIDATION_SUFFIX: PromptPart =
  'Return the full corrected JSON object with every required field present and within its constraints.' as PromptPart;
