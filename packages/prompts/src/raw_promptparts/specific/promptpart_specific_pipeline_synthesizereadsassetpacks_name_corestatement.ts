/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: pipeline
 * intent: "Product pipeline name for read synthesize"
 * current_version: "0.80.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Product pipeline name for read synthesize", "score": 0.80 }]
 */
import type { PromptPart } from '../../parts/PromptPart';
import { createPromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_PIPELINE_SYNTHESIZEREADSASSETPACKS_NAME_CORESTATEMENT: PromptPart = createPromptPart(
  'synthesize-reads-asset-packs-pipeline',
);
