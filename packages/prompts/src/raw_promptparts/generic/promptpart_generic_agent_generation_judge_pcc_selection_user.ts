/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "User directive for PrepareConciseContext selection Judge"
 * current_version: "0.70.0"
 * versions: ["0.50.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE_PCC_SELECTION_USER: PromptPart =
  [
  'Judge ONLY the prior PrepareConciseContext key-selection reasoning for minimality and coverage.',
  'Score against pipeline_execution_keys and PCC ranking law (in system). Do not re-select keys; do not emit selectedKeys; do not attempt the agent task.',
].join('\n') as PromptPart;
