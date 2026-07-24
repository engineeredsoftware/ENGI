import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: measure
 * intent: "PTRR refine step for measure agents"
 * current_version: "0.50.0"
 * versions: []
 * benchmarks: []
 */
export const PROMPTPART_GENERIC_AGENT_MEASURE_PTRR_REFINE: PromptPart =
  'Refine: ensure every requested measurement has exactly one honest reading, units are respected (counts carry a magnitude), and no rationale leaks raw source.' as PromptPart;
