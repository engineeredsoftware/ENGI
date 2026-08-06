/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "User directive for ChunkThenSum prepared-task Reason"
 * current_version: "0.71.0"
 * versions: ["0.50.0", "0.70.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_GENERATION_REASON_PREPARED_TASK_USER: PromptPart =
  [
  'Apply logical reasoning to the agent/step task using prepared context only.',
  'Prefer selectedContext values. Do not re-select keys. Do not invent facts absent from selectedContext.',
  'Plan: omit useTools (strategy only). Try/Retry: emit useTools when the catalog tool must run; prefer host sourceRevision when deposit.repository shells are null.',
  'Refine: omit useTools; finalize return from Plan/Try/Retry evidence only (usedTools results, prior workspacePath). Never invent workspacePath or success without that proof; if proof missing set success false.',
].join('\n') as PromptPart;
