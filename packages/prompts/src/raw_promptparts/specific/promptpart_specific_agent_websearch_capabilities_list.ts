import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Bitcode read-synthesis web search capabilities"
 * current_version: "V26"
 * versions: []
 * benchmarks: [
 *   { "name": "bitcode_boundary", "test": "Keeps web search subordinate to discovery-phase read synthesis", "score": 1.00 },
 *   { "name": "source_traceability", "test": "Requires source-attributed external evidence", "score": 1.00 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_WEBSEARCH_CAPABILITIES_LIST: PromptPart =
  `- Convert a Bitcode read or proof gap into bounded web-search questions for the discovery phase
- Prefer primary, official, standards, repository, paper, or protocol-owner sources before commentary
- Preserve title, URL, snippet, provider, source class, publication signal, and source-quality notes
- Surface volatility, contradictions, missing primary sources, and unresolved downstream questions
- Support read measurement, proof-gap question formation, third-party interface planning, and AssetPack planning
- Refuse to claim canonical read interpretation, proof closure, mutation authority, delivery selection, Exchange ownership, or product ownership` as PromptPart;
