import { PROMPTPART_GENERIC_DOCCODE_METADATA_LABEL } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_doccode_metadata_label';
import { PROMPTPART_SPECIFIC_TOOL_REPOSITORYSETUP_ASSET_PACK_METADATA_PIPELINE } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_tool_repositorysetup_assetpack_metadata_pipeline';
import { PROMPTPART_SPECIFIC_TOOL_REPOSITORYSETUP_ASSET_PACK_METADATA_PHASE_SETUP } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_tool_repositorysetup_assetpack_metadata_phase_setup';
import { PROMPTPART_SPECIFIC_TOOL_REPOSITORYSETUP_ASSET_PACK_PURPOSE_ADDENDUM } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_tool_repositorysetup_assetpack_purpose_addendum';
import { PROMPTPART_SPECIFIC_TOOL_REPOSITORYSETUP_ASSET_PACK_CAPABILITIES_ADDENDUM } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_tool_repositorysetup_assetpack_capabilities_addendum';
/**
 * AssetPack Pipeline - Clone VCS Repository Tool
 *
 * Wraps the generic cloneRepositoryTool and attaches a AssetPack-specific
 * DocCodeToolPrompt. Prompt registry supports two operations: override and
 * append. Here we append AssetPack-specific entries to the generic
 * RepositorySetup prompt.
 */

import { Tool } from '@bitcode/tools-generics';
import type { Prompt } from '@bitcode/prompts/prompt';

// Base generic tool + its DocCodeToolPrompt
import {
  cloneRepositoryTool,
  REPOSITORY_SETUP_DOC_CODE_TOOL_PROMPT,
} from '@bitcode/generic-tools-repository-setup';

// PromptParts for AssetPack overlay



// Build an append Prompt in-place using the Prompt API
const ASSET_PACK_CLONE_REPOSITORY_TOOL_OVERLAY_PROMPT: Prompt = (() => {
  const p = REPOSITORY_SETUP_DOC_CODE_TOOL_PROMPT.clone();
  // AssetPack-specific cumulative additions under child paths (append semantics)
  p.set('metadata:label', PROMPTPART_GENERIC_DOCCODE_METADATA_LABEL as any, 5);
  p.set('metadata:pipeline', PROMPTPART_SPECIFIC_TOOL_REPOSITORYSETUP_ASSET_PACK_METADATA_PIPELINE as any, 5);
  p.set('metadata:phase', PROMPTPART_SPECIFIC_TOOL_REPOSITORYSETUP_ASSET_PACK_METADATA_PHASE_SETUP as any, 5);
  p.set('purpose:asset-pack:addendum', PROMPTPART_SPECIFIC_TOOL_REPOSITORYSETUP_ASSET_PACK_PURPOSE_ADDENDUM as any, 5);
  p.set('capabilities:asset-pack:addendum', PROMPTPART_SPECIFIC_TOOL_REPOSITORYSETUP_ASSET_PACK_CAPABILITIES_ADDENDUM as any, 5);
  return p;
})();

// Merge by cloning base and appending entries (registry capability)
export const ASSET_PACK_CLONE_REPOSITORY_TOOL_PROMPT: Prompt = (() => {
  const merged = REPOSITORY_SETUP_DOC_CODE_TOOL_PROMPT.clone();
  merged.merge(ASSET_PACK_CLONE_REPOSITORY_TOOL_OVERLAY_PROMPT);
  return merged;
})();

/**
 * AssetPack wrapper – delegates to the generic tool implementation,
 * but carries AssetPack-specific doc-code prompt via @doc-code-tool.
 */
/**
 * @doc-code-tool
 * @prompt ASSET_PACK_CLONE_REPOSITORY_TOOL_PROMPT
 */
export class AssetPackCloneVCSRepositoryTool extends Tool<typeof cloneRepositoryTool.use> {
  use = (input: Parameters<typeof cloneRepositoryTool.use>[0]) => cloneRepositoryTool.use(input);
}

// Create instance and assign a stable registry key used by agents
export const assetPackCloneVCSRepositoryTool = new AssetPackCloneVCSRepositoryTool();
// Ensure initializeAssetPack registers this tool under a clear name
(assetPackCloneVCSRepositoryTool as any).name = 'asset-pack-clone-vcs-repository-tool';
