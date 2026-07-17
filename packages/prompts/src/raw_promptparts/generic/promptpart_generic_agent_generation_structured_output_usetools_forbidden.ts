/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "SO useTools forbidden when schema omits tools"
 * current_version: "0.71.0"
 * versions: ["0.50.0", "0.70.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT_USETOOLS_FORBIDDEN: PromptPart =
  'This step schema has no useTools — never emit useTools.' as PromptPart;
