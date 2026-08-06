import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Bitcode AssetPack-native PromptPart for read-first written-asset / asset-pack execution: agent assetpackpipeline clonevcsrepository system purpose"
 * current_version: "0.50.0"
 * versions: []
 * benchmarks: [
 *   { "name": "purpose_concreteness", "test": "Specifies concrete responsibilities", "score": 0.5 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_SYSTEM_PURPOSE: PromptPart =
  'Clone provider repositories reliably, set a workspace path, and persist minimal metadata required for SDIVF Discovery' as PromptPart;
