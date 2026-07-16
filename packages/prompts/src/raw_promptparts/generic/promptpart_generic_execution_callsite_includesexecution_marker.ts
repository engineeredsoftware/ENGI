/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: system
 * intent: "Marker that pipeline call_site block includes Execution layer"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Marker that pipeline call_site block includes Execution layer", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_EXECUTION_CALLSITE_INCLUDESEXECUTION_MARKER: PromptPart = createPromptPart(
  '1',
);
