/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: phase
 * intent: "SDIVF phase name label: finish"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "SDIVF phase name label: finish", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_SDIVFPHASE_FINISH_NAME_CORESTATEMENT: PromptPart = createPromptPart(
  'finish',
);
