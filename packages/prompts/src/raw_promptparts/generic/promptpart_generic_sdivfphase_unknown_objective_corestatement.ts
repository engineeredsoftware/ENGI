/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: phase
 * intent: "Fallback SDIVF phase objective"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Fallback SDIVF phase objective", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_SDIVFPHASE_UNKNOWN_OBJECTIVE_CORESTATEMENT: PromptPart = createPromptPart(
  'SDIVF phase (unnamed): complete only this phase objective under phase-local stores.',
);
