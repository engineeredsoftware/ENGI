/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: phase
 * intent: "Deposit implementation roster"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Deposit implementation roster", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEDEPOSITS_IMPLEMENTATION_ROSTER_DETAILCONTENT: PromptPart = createPromptPart(
  'Deposit Implementation roster (sequential): patch-plan → patchfile write (one AssetPackPatchArtifact per pack) → measurements.absolutes.',
);
