/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Optional tools clause for Try/Retry task SO when schema allows useTools"
 * current_version: "0.70.0"
 * versions: ["0.50.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT_TOOLS_IF_SCHEMA: PromptPart =
  'If the active schema includes useTools and judgment approved tool use, include useTools[{ name, input, reason }] as specified by that schema; otherwise omit useTools.' as PromptPart;
