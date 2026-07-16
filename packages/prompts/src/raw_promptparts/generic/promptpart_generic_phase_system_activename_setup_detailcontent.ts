/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: phase
 * intent: "Primitive active phase name for setup"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Primitive active phase name for setup", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_PHASE_SYSTEM_ACTIVENAME_SETUP_DETAILCONTENT: PromptPart = createPromptPart(
  'Active phase name: "setup". Coordinate only this phase\'s objective.',
);
