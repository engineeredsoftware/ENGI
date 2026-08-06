/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Generic reason solve prefix"
 * current_version: "0.70.0"
 * versions: ["0.50.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_GENERATION_REASON_GENERIC_SOLVE_PREFIX: PromptPart =
  'Apply logical reasoning to solve:' as PromptPart;
