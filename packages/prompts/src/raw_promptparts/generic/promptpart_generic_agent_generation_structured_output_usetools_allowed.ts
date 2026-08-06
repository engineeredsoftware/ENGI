/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "SO useTools allowed when schema includes tools"
 * current_version: "0.70.0"
 * versions: ["0.50.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT_USETOOLS_ALLOWED: PromptPart =
  'Try/Retry only: useTools may appear when the catalog tool must run.' as PromptPart;
