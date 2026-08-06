/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Judge sum prefix"
 * current_version: "0.70.0"
 * versions: ["0.50.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE_SUM_PREFIX: PromptPart =
  'Judge the quality of these chunked results:' as PromptPart;
