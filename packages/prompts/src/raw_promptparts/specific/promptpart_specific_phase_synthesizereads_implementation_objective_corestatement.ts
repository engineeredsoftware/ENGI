/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: phase
 * intent: "Read implementation phase objective"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Read implementation phase objective", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEREADS_IMPLEMENTATION_OBJECTIVE_CORESTATEMENT: PromptPart = createPromptPart(
  'Implementation (read): synthesize measured read-satisfaction AssetPack options from Discovery evidence under source-safety and Need steering.',
);
