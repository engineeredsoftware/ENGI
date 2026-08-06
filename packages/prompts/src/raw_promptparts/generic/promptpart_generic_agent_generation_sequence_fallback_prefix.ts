/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Fallback generation sequence prefix"
 * current_version: "0.70.0"
 * versions: ["0.50.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_GENERATION_SEQUENCE_FALLBACK_PREFIX: PromptPart =
  'Execute operation:' as PromptPart;
