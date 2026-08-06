/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: phase
 * intent: "SDIVF Finish phase objective"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "SDIVF Finish phase objective", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_SDIVFPHASE_FINISH_OBJECTIVE_CORESTATEMENT: PromptPart = createPromptPart(
  'Finish records terminal artifacts and selection envelopes for product surfaces; it does not settle BTC or ship PRs (those are Simple settle).',
);
