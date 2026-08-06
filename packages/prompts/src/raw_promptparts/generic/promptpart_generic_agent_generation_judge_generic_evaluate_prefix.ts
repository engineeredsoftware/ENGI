/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Generic judge evaluate prefix"
 * current_version: "0.70.0"
 * versions: ["0.50.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE_GENERIC_EVALUATE_PREFIX: PromptPart =
  'Evaluate the quality and correctness of:' as PromptPart;
