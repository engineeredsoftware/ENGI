/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: pipeline
 * intent: "ExecutionPipelineSDIVFSynthesizeReadAssetPacks product identity"
 * current_version: "0.81.0"
 * versions: []
 * benchmarks: [{ "name": "clarity", "test": "Read synthesize product pipeline", "score": 0.81 }]
 */
import { PromptPart } from '../../parts/PromptPart';
/** Product-specific read pipeline identity (separate from deposit; not a dual lens). */
export const PROMPTPART_SPECIFIC_PIPELINE_SYNTHESIZEREADSASSETPACKS_LENS_CORESTATEMENT: PromptPart =
  "Product pipeline: ExecutionPipelineSDIVFSynthesizeReadAssetPacks. Steering is the reader's accepted Need. Setup comprehends needs; Discovery finds Need-fits; Implementation synthesizes read-satisfaction options; Validation gates Need readiness; Finish stores selection envelope for /reads. This is not the deposit synthesis pipeline." as PromptPart;
