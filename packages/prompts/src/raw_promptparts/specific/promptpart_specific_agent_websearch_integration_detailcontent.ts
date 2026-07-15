import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Bitcode read-synthesis web search integration boundary"
 * current_version: "V26"
 * versions: []
 * benchmarks: [
 *   { "name": "integration_boundary", "test": "Separates web-search support from downstream Bitcode owners", "score": 1.00 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_WEBSEARCH_INTEGRATION_DETAILCONTENT: PromptPart =
  `Integrates as admitted discovery-phase support:
- consumes web-search and content retrieval tools only to gather external evidence for read synthesis
- passes source-attributed findings to downstream read, proof, interface, and AssetPack owners
- keeps stable web-search names as import and registry carriers
- does not own canonical read interpretation, proof generation, source mutation, delivery mechanism selection, or live Exchange/product semantics` as PromptPart;
