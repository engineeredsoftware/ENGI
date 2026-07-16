/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: phase
 * intent: "Read validation roster"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Read validation roster", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEREADS_VALIDATION_ROSTER_DETAILCONTENT: PromptPart = createPromptPart(
  'Read Validation roster (typical): ready-to-finish / readiness validation agents.',
);
