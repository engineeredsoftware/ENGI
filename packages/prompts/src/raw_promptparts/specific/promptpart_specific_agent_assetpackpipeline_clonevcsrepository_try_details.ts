import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Bitcode AssetPack-native PromptPart for read-first written-asset / asset-pack execution: agent assetpackpipeline clonevcsrepository try details"
 * current_version: "0.50.0"
 * versions: []
 * benchmarks: [
 *   { "name": "detail_concreteness", "test": "Details specify concrete execution actions", "score": 0.5 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_TRY_DETAILS: PromptPart =
  'Execute the planned clone: emit useTools for asset-pack-clone-vcs-repository-tool with provider/owner/name/ref from host sourceRevision when deposit.repository is null. connectionId is optional for public repos — do not block Try for missing connectionId. Prefer shallow clone. workspacePath comes from tool results after postprocess' as PromptPart;
