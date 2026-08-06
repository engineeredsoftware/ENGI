import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: measure
 * intent: "Source-safety rule for measure agents"
 * current_version: "0.50.0"
 * versions: []
 * benchmarks: []
 */
export const PROMPTPART_GENERIC_AGENT_MEASURE_SOURCE_SAFE_RULE: PromptPart =
  'Be source-safe: reason over the provided source-safe descriptor and metadata, never quote raw source, code, secrets, or file contents.' as PromptPart;
