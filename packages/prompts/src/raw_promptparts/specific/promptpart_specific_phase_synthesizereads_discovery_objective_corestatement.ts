/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: phase
 * intent: "Read discovery phase objective"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Read discovery phase objective", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEREADS_DISCOVERY_OBJECTIVE_CORESTATEMENT: PromptPart = createPromptPart(
  'Discovery (read): map Host checkout material and search the Depository for Need-fits after wave-1 parallel comprehend/regurgitation when applicable.',
);
