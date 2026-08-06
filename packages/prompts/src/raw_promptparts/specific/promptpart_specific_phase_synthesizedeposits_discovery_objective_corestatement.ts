/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: phase
 * intent: "Deposit discovery phase objective"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Deposit discovery phase objective", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEDEPOSITS_DISCOVERY_OBJECTIVE_CORESTATEMENT: PromptPart = createPromptPart(
  'Discovery (deposit): map Host checkout supply and relevant Depository evidence under depositor Obfuscations.',
);
