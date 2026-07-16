/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: phase
 * intent: "Fallback SDIVF phase stores"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Fallback SDIVF phase stores", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_SDIVFPHASE_UNKNOWN_STORES_DETAILCONTENT: PromptPart = createPromptPart(
  'Phase-local stores only.',
);
