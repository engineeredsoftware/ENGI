/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "StitchUntilComplete user/instruction strings for repair Thinkings"
 * current_version: "0.70.0"
 * versions: ["0.50.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

/** Prefix — factories append the validation error detail (runtime). */
export const PROMPTPART_GENERIC_AGENT_FAILSAFE_STITCH_VALIDATION_PREFIX: PromptPart =
  'The previous output failed schema validation:' as PromptPart;

export const PROMPTPART_GENERIC_AGENT_FAILSAFE_STITCH_VALIDATION_SUFFIX: PromptPart =
  'Return the full corrected JSON object with every required field present and within its constraints.' as PromptPart;

export const PROMPTPART_GENERIC_AGENT_FAILSAFE_STITCH_CONTINUE_COMPLETE: PromptPart =
  'Continue and complete the previous output' as PromptPart;

/** Fallback when a generation sequence has no mapped system PromptPart. */
export const PROMPTPART_GENERIC_AGENT_GENERATION_SEQUENCE_FALLBACK_PREFIX: PromptPart =
  'Execute operation:' as PromptPart;
