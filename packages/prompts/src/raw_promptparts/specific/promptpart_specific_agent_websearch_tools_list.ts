import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Bitcode read-synthesis web search tools"
 * current_version: "V26"
 * versions: []
 * benchmarks: [
 *   { "name": "tool_boundary", "test": "Names admitted web evidence tools and their limits", "score": 1.00 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_WEBSEARCH_TOOLS_LIST: PromptPart =
  `- search: run bounded web queries for source-attributed read-synthesis evidence
- searchWithUrlIntelligence: use provided URLs only to improve query targeting for the active read
- multiProviderSearch: compare providers when source coverage or volatility requires corroboration
- getContents: retrieve specific source pages for attribution, snippet verification, and source-quality assessment
- no tool may mutate repository state, deliver AssetPacks, assert proof closure, or define Exchange/product semantics` as PromptPart;
