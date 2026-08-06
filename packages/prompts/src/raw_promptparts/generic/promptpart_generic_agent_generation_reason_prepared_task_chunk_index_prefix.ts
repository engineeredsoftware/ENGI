/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "CS reason chunk index prefix"
 * current_version: "0.70.0"
 * versions: ["0.50.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_GENERATION_REASON_PREPARED_TASK_CHUNK_INDEX_PREFIX: PromptPart =
  'This is chunk' as PromptPart;
