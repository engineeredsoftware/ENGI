import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Bitcode AssetPack-native PromptPart for read-first written-asset / asset-pack execution: agent assetpackpipeline clonevcsrepository refine label"
 * current_version: "0.50.0"
 * versions: []
 * benchmarks: [
 *   { "name": "label_clarity", "test": "Label communicates step purpose", "score": 0.5 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_REFINE_LABEL: PromptPart =
  'REFINE: Final clone agent return' as PromptPart;
