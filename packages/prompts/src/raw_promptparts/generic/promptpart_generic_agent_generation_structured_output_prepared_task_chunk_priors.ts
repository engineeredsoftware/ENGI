/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "CS SO chunk priors"
 * current_version: "0.70.0"
 * versions: ["0.50.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT_PREPARED_TASK_CHUNK_PRIORS: PromptPart =
  'Chunk pass: priorChunkCompletions are earlier slices; emit output for this slice consistent with them when relevant.' as PromptPart;
