/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "PTRR refine step name for call_site"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "PTRR refine step name for call_site", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_PTRR_STEP_REFINE_NAME_CORESTATEMENT: PromptPart = createPromptPart(
  'PTRR step: refine',
);
