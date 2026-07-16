/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: phase
 * intent: "Read discovery roster"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Read discovery roster", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEREADS_DISCOVERY_ROSTER_DETAILCONTENT: PromptPart = createPromptPart(
  'Read Discovery roster (typical): parallel {comprehend-codebase, inherent-regurgitation} → search-depository-for-read-need-fits.',
);
