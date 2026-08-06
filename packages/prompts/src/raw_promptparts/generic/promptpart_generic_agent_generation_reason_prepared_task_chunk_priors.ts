/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "CS reason chunk priors clause"
 * current_version: "0.70.0"
 * versions: ["0.50.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_GENERATION_REASON_PREPARED_TASK_CHUNK_PRIORS: PromptPart =
  'Chunk pass: incorporate priorChunkCompletions from earlier slices; reason about this selectedContext slice in that light.' as PromptPart;
