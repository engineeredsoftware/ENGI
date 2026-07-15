/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Bitcode read-synthesis web research capabilities for discovery-phase source support"
 * current_version: "V26"
 * versions: []
 * benchmarks: [
 *   { "name": "bitcode_boundary", "test": "Keeps web research inside discovery-phase read synthesis", "score": 1.00 },
 *   { "name": "implementation_ready", "test": "Lists concrete source-attribution behavior", "score": 1.00 }
 * ]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_SPECIFIC_AGENT_WEBRESEARCHER_CAPABILITIES_LIST: PromptPart =
  `- Derive bounded web research queries from a Bitcode read during discovery-phase synthesis
- Gather external evidence only as source material for read synthesis, proof-gap question formation, third-party interface constraints, or AssetPack planning
- Prefer primary, official, repository, standard, paper, or vendor-owned sources before commentary
- Preserve title, URL, snippet, source class, publication metadata, provider, and evidence-use rationale
- Mark source quality, volatility, contradictions, and unresolved gaps for downstream Bitcode owners
- Feed auxiliary context into read synthesis, proof inspection, interface planning, and AssetPack synthesis
- Refuse browser-automation product, mutation, delivery, canonical read interpretation, canonical proof, and live Exchange/product ownership claims` as PromptPart;
