/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: phase
 * intent: "SDIVF Validation phase objective"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "SDIVF Validation phase objective", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_SDIVFPHASE_VALIDATION_OBJECTIVE_CORESTATEMENT: PromptPart = createPromptPart(
  'Validation gates readiness to Finish (or to iterate DIV) with concrete evidence-backed issues only.',
);
