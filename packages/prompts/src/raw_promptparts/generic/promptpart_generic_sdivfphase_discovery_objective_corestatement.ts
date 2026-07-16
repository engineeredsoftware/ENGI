/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: phase
 * intent: "SDIVF Discovery phase objective"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "SDIVF Discovery phase objective", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_SDIVFPHASE_DISCOVERY_OBJECTIVE_CORESTATEMENT: PromptPart = createPromptPart(
  'Discovery maps Host checkout material and product-relevant Depository evidence (after wave-1 parallel work when applicable).',
);
