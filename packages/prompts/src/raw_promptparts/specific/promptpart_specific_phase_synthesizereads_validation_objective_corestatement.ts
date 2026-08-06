/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: phase
 * intent: "Read validation phase objective"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Read validation phase objective", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEREADS_VALIDATION_OBJECTIVE_CORESTATEMENT: PromptPart = createPromptPart(
  'Validation (read): gate Need readiness to Finish (or iterate DIV) with concrete evidence-backed issues only — not settlement.',
);
