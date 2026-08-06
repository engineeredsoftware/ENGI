/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Sum reason prefix"
 * current_version: "0.70.0"
 * versions: ["0.50.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_GENERATION_REASON_SUM_PREFIX: PromptPart =
  'Reason about how to combine these chunk results:' as PromptPart;
