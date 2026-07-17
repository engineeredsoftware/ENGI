/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "User directive for PCC selection StructuredOutput"
 * current_version: "0.70.0"
 * versions: ["0.50.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT_PCC_SELECTION_USER: PromptPart =
  [
  'Emit ONLY { "selectedKeys": string[] } for PrepareConciseContext.',
  'Slot from prior reasoning and judgment; do not re-reason.',
  'Despite approved:false, emit the best legal minimal selectedKeys now.',
  'Use path form from pipeline_execution_keys (e.g. #deposit:repository). Never invent keys. Never include useTools.',
].join('\n') as PromptPart;
