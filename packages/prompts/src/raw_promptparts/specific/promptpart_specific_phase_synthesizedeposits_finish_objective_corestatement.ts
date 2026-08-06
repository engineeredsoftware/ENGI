/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: phase
 * intent: "Deposit finish phase objective"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Deposit finish phase objective", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEDEPOSITS_FINISH_OBJECTIVE_CORESTATEMENT: PromptPart = createPromptPart(
  'Finish (deposit): store deposit options and terminal artifacts for /deposits review/admission — not PR ship (settle is Simple).',
);
