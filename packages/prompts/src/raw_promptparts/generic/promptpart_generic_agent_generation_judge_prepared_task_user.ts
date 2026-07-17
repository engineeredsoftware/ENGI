/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "User directive for ChunkThenSum prepared-task Judge"
 * current_version: "0.70.0"
 * versions: ["0.50.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE_PREPARED_TASK_USER: PromptPart =
  'Judge the prior task reasoning against prepared context and the step objective (in system).' as PromptPart;

export const PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE_PREPARED_TASK_CHUNK_PRIORS: PromptPart =
  'This is a chunk pass: priorChunkCompletions are earlier slices; score coherence with them when relevant.' as PromptPart;

export const PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE_SUM_PREFIX: PromptPart =
  'Judge the quality of these chunked results:' as PromptPart;

export const PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE_GENERIC_EVALUATE_PREFIX: PromptPart =
  'Evaluate the quality and correctness of:' as PromptPart;
