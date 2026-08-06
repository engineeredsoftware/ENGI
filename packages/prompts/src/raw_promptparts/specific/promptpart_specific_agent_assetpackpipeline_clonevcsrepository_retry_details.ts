import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Bitcode AssetPack-native PromptPart for read-first written-asset / asset-pack execution: agent assetpackpipeline clonevcsrepository retry details"
 * current_version: "0.50.0"
 * versions: []
 * benchmarks: [
 *   { "name": "detail_concreteness", "test": "Details specify concrete recovery actions", "score": 0.5 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_RETRY_DETAILS: PromptPart =
  'Re-attempt the Try using prior Try errors and usedTools: adjust ref/shallow/provider params and re-select asset-pack-clone-vcs-repository-tool; return the same agent-shaped clone result' as PromptPart;
