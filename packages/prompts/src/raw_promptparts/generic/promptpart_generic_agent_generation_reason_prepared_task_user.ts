/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "User directive for ChunkThenSum prepared-task Reason (no re-selection)"
 * current_version: "0.70.0"
 * versions: ["0.50.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_GENERATION_REASON_PREPARED_TASK_USER: PromptPart = [
  'Apply logical reasoning to the agent/step task using prepared context only.',
  'Prefer selectedContext values. Do not re-select keys. Do not invent facts absent from selectedContext.',
  'Plan: omit useTools (strategy only). Try/Retry: emit useTools when the catalog tool must run; prefer host sourceRevision when deposit.repository shells are null.',
  'Refine: FORBIDDEN useTools / inventing tool names / status pending|scheduled|blocked for tools. Finalize from Plan/Try/Retry evidence only (usedTools results, prior workspacePath). Never invent workspacePath or success without that proof; if proof missing set success false.',
].join('\n') as PromptPart;

export const PROMPTPART_GENERIC_AGENT_GENERATION_REASON_PREPARED_TASK_CHUNK_PRIORS: PromptPart =
  'Chunk pass: incorporate priorChunkCompletions from earlier slices; reason about this selectedContext slice in that light.' as PromptPart;

/** Prefix only — factories append " {index} of {count}." */
export const PROMPTPART_GENERIC_AGENT_GENERATION_REASON_PREPARED_TASK_CHUNK_INDEX_PREFIX: PromptPart =
  'This is chunk' as PromptPart;

export const PROMPTPART_GENERIC_AGENT_GENERATION_REASON_PREPARED_TASK_INPUT_LABEL: PromptPart =
  'Task input (prepared):' as PromptPart;

export const PROMPTPART_GENERIC_AGENT_GENERATION_REASON_STITCH_CONTINUE_PREFIX: PromptPart =
  'Continue reasoning from this partial output:' as PromptPart;

export const PROMPTPART_GENERIC_AGENT_GENERATION_REASON_STITCH_CONTEXT_LABEL: PromptPart =
  'Original task context:' as PromptPart;

export const PROMPTPART_GENERIC_AGENT_GENERATION_REASON_SUM_PREFIX: PromptPart =
  'Reason about how to combine these chunk results:' as PromptPart;

export const PROMPTPART_GENERIC_AGENT_GENERATION_REASON_GENERIC_SOLVE_PREFIX: PromptPart =
  'Apply logical reasoning to solve:' as PromptPart;
