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
  'Final step only (no tools, no useTools, never invent tool names): synthesize Plan+Try+Retry into { success, repository, workspacePath, status?, metadata? }. Copy workspacePath only from prior usedTools / Try-Retry proof. If no path in evidence: success false, status incomplete-no-tool-proof — never pending-tool-execution, never cloneRepositoryTool / VCS_API_WORKFLOW' as PromptPart;
