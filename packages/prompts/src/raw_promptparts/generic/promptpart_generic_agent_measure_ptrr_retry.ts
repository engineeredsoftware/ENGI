import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: measure
 * intent: "PTRR retry step for measure agents"
 * current_version: "0.50.0"
 * versions: []
 * benchmarks: []
 */
export const PROMPTPART_GENERIC_AGENT_MEASURE_PTRR_RETRY: PromptPart =
  'Retry: emit a minimal honest reading for any missing measurement rather than failing the measurement.' as PromptPart;
