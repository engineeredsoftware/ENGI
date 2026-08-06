import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: measure
 * intent: "PTRR plan step for measure agents"
 * current_version: "0.50.0"
 * versions: []
 * benchmarks: []
 */
export const PROMPTPART_GENERIC_AGENT_MEASURE_PTRR_PLAN: PromptPart =
  'Plan: identify, from the source-safe descriptor, the signal that grounds each requested measurement (no raw source required).' as PromptPart;
