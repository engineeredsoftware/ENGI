/**
 * Web search with automatic content extraction
 * 
 * @doc-code-tool
 * @prompt SEARCH_WEB_DOC_CODE_TOOL_PROMPT
 */

import { Tool } from '@bitcode/tools-generics';
import { searchWeb } from '@bitcode/web-scrapers-firecrawl';
import { SEARCH_WEB_DOC_CODE_TOOL_PROMPT } from './prompts/SearchWebDocCodeToolPrompt';

export class SearchWebTool extends Tool<typeof searchWeb> {
  use = searchWeb;
}

// Export singleton instance
export const searchWebTool = new SearchWebTool();