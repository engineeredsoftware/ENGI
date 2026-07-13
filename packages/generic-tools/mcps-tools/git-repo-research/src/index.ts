/**
 * Git Repository Research MCP Tools - Modern Tool Class Architecture
 * 
 * Git repository semantic search and analysis tools using the Tool class pattern.
 */

import { Tool } from '@bitcode/tools-generics';
// Inline a fail-closed placeholder so this retained MCP package does not
// require a missing @bitcode/generic-vcs-git-repo-research workspace package at compile time.
async function _gitRepoSemanticSearch(input: {
  repository?: string;
  query?: string;
  branch?: string;
  path?: string;
  limit?: number;
  [key: string]: unknown;
}): Promise<{
  ok: false;
  unavailable: true;
  tool: 'gitRepoSemanticSearch';
  reason: string;
  input: {
    repository?: string;
    query?: string;
    branch?: string;
    path?: string;
    limit?: number;
    [key: string]: unknown;
  };
}> {
  return {
    ok: false,
    unavailable: true,
    tool: 'gitRepoSemanticSearch',
    reason: 'git repository research is not available in this retained runtime',
    input,
  };
}

// Import DocCodeToolPrompt
import { GIT_REPO_RESEARCH_MCP_DOC_CODE_TOOL_PROMPT } from './prompts/GitRepoResearchMCPDocCodeToolPrompt';

/**
 * Git Repository Semantic Search Tool for intelligent code search and analysis
 * 
 * @doc-code-tool
 * @prompt GIT_REPO_RESEARCH_MCP_DOC_CODE_TOOL_PROMPT
 */
class GitRepoSemanticSearchTool extends Tool<typeof _gitRepoSemanticSearch> {
  use = _gitRepoSemanticSearch;
}

// Export singleton instances - proper non-barrel exports
export const gitRepoSemanticSearchTool = new GitRepoSemanticSearchTool();

// Export DocCodeToolPrompt instance
export { GIT_REPO_RESEARCH_MCP_DOC_CODE_TOOL_PROMPT };

// Export classes for type safety and extensibility
export { GitRepoSemanticSearchTool };
