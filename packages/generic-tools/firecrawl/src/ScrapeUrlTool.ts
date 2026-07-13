/**
 * Single webpage content extraction tool
 * 
 * @doc-code-tool
 * @prompt SCRAPE_URL_DOC_CODE_TOOL_PROMPT
 */

import { Tool } from '@bitcode/tools-generics';
import { scrapeUrl } from '@bitcode/web-scrapers-firecrawl';
import { SCRAPE_URL_DOC_CODE_TOOL_PROMPT } from './prompts/ScrapeUrlDocCodeToolPrompt';

export class ScrapeUrlTool extends Tool<typeof scrapeUrl> {
  use = scrapeUrl;
}

// Export singleton instance
export const scrapeUrlTool = new ScrapeUrlTool();