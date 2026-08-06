/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: phase
 * intent: "SDIVF phase name label: discovery"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "SDIVF phase name label: discovery", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_SDIVFPHASE_DISCOVERY_NAME_CORESTATEMENT: PromptPart = createPromptPart(
  'discovery',
);
