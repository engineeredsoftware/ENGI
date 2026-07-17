/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "User directive for ChunkThenSum prepared-task StructuredOutput"
 * current_version: "0.70.0"
 * versions: ["0.50.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT_PREPARED_TASK_USER: PromptPart =
  'Generate structured output for the step schema from prior reasoning/judgment and prepared context only.' as PromptPart;

/** When active step schema includes useTools (Try/Retry task SO). */
export const PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT_USETOOLS_ALLOWED: PromptPart =
  'Try/Retry only: useTools may appear when the catalog tool must run.' as PromptPart;

/** When active step schema has no useTools (Plan/Refine/PCC). */
export const PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT_USETOOLS_FORBIDDEN: PromptPart =
  'This step schema has no useTools — never emit useTools, invent tool names, or claim pending/scheduled tool execution.' as PromptPart;

export const PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT_PREPARED_TASK_CHUNK_PRIORS: PromptPart =
  'Chunk pass: priorChunkCompletions are earlier slices; emit output for this slice consistent with them when relevant.' as PromptPart;

export const PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT_GENERIC_PREFIX: PromptPart =
  'Generate structured output for:' as PromptPart;

/** Prefix for dynamic "Output must match schema: …" — factories append the shape. */
export const PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT_MUST_MATCH_SCHEMA_PREFIX: PromptPart =
  'Output must match schema:' as PromptPart;
