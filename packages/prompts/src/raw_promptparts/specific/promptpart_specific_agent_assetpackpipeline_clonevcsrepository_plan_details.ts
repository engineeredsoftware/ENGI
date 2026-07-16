import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Bitcode AssetPack-native PromptPart for read-first written-asset / asset-pack execution: agent assetpackpipeline clonevcsrepository plan details"
 * current_version: "0.50.0"
 * versions: []
 * benchmarks: [
 *   { "name": "detail_concreteness", "test": "Details specify concrete planning actions", "score": 0.5 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_PLAN_DETAILS: PromptPart =
  'Plan the Try only (do not execute tools): decide provider, owner/name, branch/ref, and how Try will call asset-pack-clone-vcs-repository-tool; note fallback refs and shallow-clone options for Retry if Try fails' as PromptPart;
