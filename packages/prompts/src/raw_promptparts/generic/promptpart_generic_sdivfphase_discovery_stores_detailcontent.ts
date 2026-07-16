/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: phase
 * intent: "SDIVF Discovery phase stores"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "SDIVF Discovery phase stores", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_SDIVFPHASE_DISCOVERY_STORES_DETAILCONTENT: PromptPart = createPromptPart(
  'Typical stores: sourceMeasurements, depository search results, knowledge maps.',
);
