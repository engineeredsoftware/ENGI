import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Bitcode AssetPack-native PromptPart for read-first written-asset / asset-pack execution: agent assetpackpipeline clonevcsrepository refine details"
 * current_version: "0.50.0"
 * versions: []
 * benchmarks: [
 *   { "name": "detail_concreteness", "test": "Details specify concrete refinement actions", "score": 0.5 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_REFINE_DETAILS: PromptPart =
  'Final step only (no tools): synthesize Plan+Try+Retry into the agent return object { success, repository, workspacePath, status?, metadata? }; prefer successful clone evidence and record hostProvision/workingTree' as PromptPart;
