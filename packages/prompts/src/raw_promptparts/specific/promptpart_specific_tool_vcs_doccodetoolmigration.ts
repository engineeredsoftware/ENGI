/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: relationship
 * intent: "Relationship guide for Git interactor and VCS tools"
 * current_version: "V26.00.0"
 * versions: []
 * benchmarks: [
 *   { "name": "import_replacement", "test": "Does '{{content}}' clearly specify the import replacement path? Rate 0-1" },
 *   { "name": "provider_support", "test": "Does '{{content}}' list all supported providers (GitHub, GitLab, Bitbucket)? Rate 0-1" },
 *   { "name": "api_consistency", "test": "Does '{{content}}' mention the consistent APIs benefit? Rate 0-1" }
 * ]
 */

import type { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_TOOL_VCS_DOCCODETOOLMIGRATION: PromptPart = 
  'RELATIONSHIP GUIDE: use @bitcode/generic-tools-vcs for provider-agnostic operations across GitHub, GitLab, and Bitbucket; use @bitcode/generic-tools-git when the active Bitcode workflow needs concrete Git-shaped operation names.' as PromptPart;
