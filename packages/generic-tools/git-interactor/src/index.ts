/**
 * Bitcode Git interactor tool suite.
 *
 * These tools expose Git-shaped repository operations for Bitcode AssetPack,
 * Terminal, and interface workflows while the operation implementations route
 * through `@bitcode/generic-vcs-git` and the provider-agnostic VCS layer.
 *
 * @purpose Git repository operations with Bitcode's distributed version control intelligence, VCS provider integration, atomic operation guarantees, and production-grade workflow automation for repository-bound AssetPack and Terminal flows
 * @capabilities Repository metadata, file listing, branch/reference lookup, pull request creation, issue/comment operations, file content mutation, and Git/VCS evidence retrieval through Bitcode repository anchors
 * @specificity Generic
 */

import { Tool } from '@bitcode/tools-generics';
import {
  cloneRepository,
  createFileContent,
  createIssue,
  createPullRequest,
  createReference,
  deleteFileContent,
  getAllBranches,
  getFileInfo,
  getIssueWithComments,
  getReferenceInfo,
  getRepository,
  isLatestCommentFromBot,
  leaveCommentOnIssue,
  listGitFiles,
  reviewPullRequest,
  updateFileContent,
} from '@bitcode/generic-vcs-git';
import { vcsTools } from '@bitcode/generic-tools-vcs';
import { GIT_INTERACTOR_DOC_CODE_TOOL_PROMPT } from './prompts/GitInteractorDocCodeToolPrompt';

type BitcodeGitOperation = (...args: any[]) => any;

function createBitcodeGitTool<T extends BitcodeGitOperation>(operation: T) {
  /**
   * @doc-code-tool
   * @prompt GIT_INTERACTOR_DOC_CODE_TOOL_PROMPT
   */
  class BitcodeGitTool extends Tool<T> {
    use = operation;
  }

  return new BitcodeGitTool();
}

export const cloneRepositoryTool = createBitcodeGitTool(cloneRepository);
export const listGitFilesTool = createBitcodeGitTool(listGitFiles);
export const getRepositoryTool = createBitcodeGitTool(getRepository);
export const createPullRequestTool = createBitcodeGitTool(createPullRequest);
export const createReferenceTool = createBitcodeGitTool(createReference);
export const leaveCommentOnIssueTool = createBitcodeGitTool(leaveCommentOnIssue);
export const reviewPullRequestTool = createBitcodeGitTool(reviewPullRequest);
export const createIssueTool = createBitcodeGitTool(createIssue);
export const getAllBranchesTool = createBitcodeGitTool(getAllBranches);
export const getReferenceInfoTool = createBitcodeGitTool(getReferenceInfo);
export const getFileInfoTool = createBitcodeGitTool(getFileInfo);
export const createFileContentTool = createBitcodeGitTool(createFileContent);
export const updateFileContentTool = createBitcodeGitTool(updateFileContent);
export const deleteFileContentTool = createBitcodeGitTool(deleteFileContent);
export const isLatestCommentFromBotTool = createBitcodeGitTool(isLatestCommentFromBot);
export const getIssueWithCommentsTool = createBitcodeGitTool(getIssueWithComments);

export const bitcodeGitInteractorTools = [
  cloneRepositoryTool,
  listGitFilesTool,
  getRepositoryTool,
  createPullRequestTool,
  createReferenceTool,
  leaveCommentOnIssueTool,
  reviewPullRequestTool,
  createIssueTool,
  getAllBranchesTool,
  getReferenceInfoTool,
  getFileInfoTool,
  createFileContentTool,
  updateFileContentTool,
  deleteFileContentTool,
  isLatestCommentFromBotTool,
  getIssueWithCommentsTool,
];

export {
  GIT_INTERACTOR_DOC_CODE_TOOL_PROMPT,
  cloneRepository,
  createFileContent,
  createIssue,
  createPullRequest,
  createReference,
  deleteFileContent,
  getAllBranches,
  getFileInfo,
  getIssueWithComments,
  getReferenceInfo,
  getRepository,
  isLatestCommentFromBot,
  leaveCommentOnIssue,
  listGitFiles,
  reviewPullRequest,
  updateFileContent,
  vcsTools,
};
