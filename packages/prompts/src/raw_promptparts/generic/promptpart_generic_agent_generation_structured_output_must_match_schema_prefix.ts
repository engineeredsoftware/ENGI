/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "SO schema match prefix"
 * current_version: "0.70.0"
 * versions: ["0.50.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT_MUST_MATCH_SCHEMA_PREFIX: PromptPart =
  'Output must match schema:' as PromptPart;
