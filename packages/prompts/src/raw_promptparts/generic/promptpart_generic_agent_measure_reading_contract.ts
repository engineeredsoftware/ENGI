import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: measure
 * intent: "Per-reading field contract for measure agent requirements"
 * current_version: "0.50.0"
 * versions: []
 * benchmarks: []
 */
export const PROMPTPART_GENERIC_AGENT_MEASURE_READING_CONTRACT: PromptPart =
  [
    'Return one reading per measurement, each with:',
    '- measurementKind: EXACTLY the key named below.',
    '- volume: a normalized 0..1 reading (the comparable measure).',
    '- magnitude: for COUNT units (functions, types, files, languages, tests, exports) the raw integer count;',
    '  omit magnitude for estimate / normalized units (volume carries the measure).',
    '- rationale: a short, source-safe justification.',
  ].join('\n') as PromptPart;
