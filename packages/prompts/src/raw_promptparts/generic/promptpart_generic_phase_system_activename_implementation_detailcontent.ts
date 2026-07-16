/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: phase
 * intent: "Primitive active phase name for implementation"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Primitive active phase name for implementation", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_PHASE_SYSTEM_ACTIVENAME_IMPLEMENTATION_DETAILCONTENT: PromptPart = createPromptPart(
  'Active phase name: "implementation". Coordinate only this phase\'s objective.',
);
