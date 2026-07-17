/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Lean PCC preparation carrier lines (keys-selection task identity only)"
 * current_version: "0.70.0"
 * versions: ["0.50.0"]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT_LEAN_TASK_HEADER: PromptPart =
  'PrepareConciseContext selection task (keys only — values are not shown).' as PromptPart;

export const PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT_LEAN_TASK_PRODUCT_PREFIX: PromptPart =
  'Product/pipeline:' as PromptPart;

export const PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT_LEAN_TASK_PHASE_PREFIX: PromptPart =
  'Phase:' as PromptPart;

export const PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT_LEAN_TASK_AGENT_PREFIX: PromptPart =
  'Agent:' as PromptPart;

export const PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT_LEAN_TASK_STEP_PREFIX: PromptPart =
  'PTRR step:' as PromptPart;

export const PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT_LEAN_TASK_STEP_PLAN: PromptPart =
  'Plan: select keys for strategy only — no tools during PCC or Plan task SO.' as PromptPart;

export const PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT_LEAN_TASK_STEP_TRY: PromptPart =
  'Try: select keys so task Thinkings can execute the plan (coords + safety + tools:usable); PCC itself never useTools.' as PromptPart;

export const PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT_LEAN_TASK_STEP_RETRY: PromptPart =
  'Retry: select keys for re-attempt (include prior errors/usedTools if present); PCC never useTools.' as PromptPart;

export const PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT_LEAN_TASK_STEP_REFINE: PromptPart =
  'Refine: select keys for final return only — no tools.' as PromptPart;

/** Prefix — factories append " {step}." for unknown steps. */
export const PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT_LEAN_TASK_STEP_ACTIVE_PREFIX: PromptPart =
  'Active step:' as PromptPart;

export const PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT_LEAN_TASK_SELECT_FOOTER: PromptPart =
  'Select minimal keys for THIS step after value read-in. Never attempt the agent task here.' as PromptPart;
