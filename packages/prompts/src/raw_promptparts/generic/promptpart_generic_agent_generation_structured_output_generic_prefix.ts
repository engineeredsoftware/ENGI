/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Generic SO prefix"
 * current_version: "0.70.0"
 * versions: ["0.50.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT_GENERIC_PREFIX: PromptPart =
  'Generate structured output for:' as PromptPart;
