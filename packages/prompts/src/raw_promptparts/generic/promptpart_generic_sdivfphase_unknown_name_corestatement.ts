/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: phase
 * intent: "Fallback SDIVF phase name"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Fallback SDIVF phase name", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_SDIVFPHASE_UNKNOWN_NAME_CORESTATEMENT: PromptPart = createPromptPart(
  'unknown',
);
