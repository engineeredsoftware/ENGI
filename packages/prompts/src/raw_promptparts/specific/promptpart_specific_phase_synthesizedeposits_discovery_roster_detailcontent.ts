/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: phase
 * intent: "Deposit discovery roster"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Deposit discovery roster", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEDEPOSITS_DISCOVERY_ROSTER_DETAILCONTENT: PromptPart = createPromptPart(
  'Deposit Discovery roster (typical): parallel {comprehend-codebase, inherent-regurgitation} → search-depository-for-deposit-relevants.',
);
