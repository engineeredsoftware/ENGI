/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "CS judge chunk priors"
 * current_version: "0.70.0"
 * versions: ["0.50.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE_PREPARED_TASK_CHUNK_PRIORS: PromptPart =
  'This is a chunk pass: priorChunkCompletions are earlier slices; score coherence with them when relevant.' as PromptPart;
