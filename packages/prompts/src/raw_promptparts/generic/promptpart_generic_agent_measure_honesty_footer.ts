import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: measure
 * intent: "Honesty and output-shape footer for measure requirements"
 * current_version: "0.50.0"
 * versions: []
 * benchmarks: []
 */
export const PROMPTPART_GENERIC_AGENT_MEASURE_HONESTY_FOOTER: PromptPart =
  [
    'Measure honestly — an empty or trivial artifact reads low; do not inflate.',
    'summary: at most 700 characters (one short paragraph).',
    'rationale: at most 700 characters each; prefer one sentence.',
    'Return ONLY {"measurements":[ ... ],"summary":string}.',
  ].join('\n') as PromptPart;
