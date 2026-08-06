/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: phase
 * intent: "Deposit implementation phase objective"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Deposit implementation phase objective", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEDEPOSITS_IMPLEMENTATION_OBJECTIVE_CORESTATEMENT: PromptPart = createPromptPart(
  'Implementation (deposit): synthesize measured DepositSynthesizedAssetPack options from Discovery evidence under source-safety and Obfuscations.',
);
