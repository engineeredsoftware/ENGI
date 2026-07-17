/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "User directive for PrepareConciseContext selection Reason (keys only)"
 * current_version: "0.70.0"
 * versions: ["0.50.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_GENERATION_REASON_PCC_SELECTION_USER: PromptPart = [
  'Reason ONLY about PrepareConciseContext key selection for the task below.',
  'Goals: minimal sufficient keys for THIS PTRR step; prefer populated host sourceRevision/workspace over null repository shells; omit lineage, telemetry, debug, and unrelated phase state.',
  'Do NOT emit selectedKeys (structured_output will). Do NOT select tools (useTools must be omitted — even under Try). Do NOT attempt the agent task itself.',
  "In analysis/reasoningItems/conclusion: name candidate keys using paths present in pipeline_execution_keys, prefer form '<execution-path>#<namespace>:<key>' (root shorthand '#namespace:key' is ok); explain why each is needed for THIS step’s ChunkThenSum/Stitch/task Thinkings. Use reasoningItems (never \"steps\" — reserved for PTRR). State exact recommended key count in conclusion.",
].join('\n') as PromptPart;

export const PROMPTPART_GENERIC_AGENT_GENERATION_REASON_SELECTION_INPUT_LABEL: PromptPart =
  'Selection input:' as PromptPart;
