/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: phase
 * intent: "Read finish phase objective"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Read finish phase objective", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEREADS_FINISH_OBJECTIVE_CORESTATEMENT: PromptPart = createPromptPart(
  'Finish (read): store selection envelope and terminal artifacts for /reads; do not settle BTC or ship PRs.',
);
