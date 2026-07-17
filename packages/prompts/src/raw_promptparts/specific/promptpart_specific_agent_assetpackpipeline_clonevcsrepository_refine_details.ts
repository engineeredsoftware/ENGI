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
  'Final step only (no tools, no useTools): synthesize Plan+Try+Retry into { success, repository, workspacePath, status?, metadata? }. Prefer real tool/host clone evidence; if Try/Retry left workspacePath empty or success false, keep success false — never invent paths or fabricate checkoutMethod/operationTimestamp' as PromptPart;
