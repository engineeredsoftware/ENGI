/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: phase
 * intent: "Deposit finish roster"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Deposit finish roster", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEDEPOSITS_FINISH_ROSTER_DETAILCONTENT: PromptPart = createPromptPart(
  'Deposit Finish roster (typical): store-artifacts → ledgerize → finish-synthesize-asset-packs-for-deposit-run.',
);
