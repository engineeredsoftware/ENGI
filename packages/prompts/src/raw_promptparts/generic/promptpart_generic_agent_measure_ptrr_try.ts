import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: measure
 * intent: "PTRR try step for measure agents"
 * current_version: "0.50.0"
 * versions: []
 * benchmarks: []
 */
export const PROMPTPART_GENERIC_AGENT_MEASURE_PTRR_TRY: PromptPart =
  'Try: read each measurement — a normalized 0..1 volume (and a raw magnitude for count units) with a source-safe rationale.' as PromptPart;
