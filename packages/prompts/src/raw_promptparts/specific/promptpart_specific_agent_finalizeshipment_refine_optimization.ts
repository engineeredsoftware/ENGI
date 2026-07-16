import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Bitcode Finish PromptPart for optimizing evidence and AssetPack delivery"
 * current_version: "0.50.0"
 * versions: []
 * benchmarks: [
 *   { "name": "refine_context_utilization", "test": "Does refine optimization maximize context value?", "score": 0.38 },
 *   { "name": "refine_state_preservation", "test": "Does refine optimization maintain execution continuity?", "score": 0.37 },
 *   { "name": "refine_intelligence_accumulation", "test": "Does refine optimization build on accumulated wisdom?", "score": 0.36 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_FINALIZESHIPMENT_REFINE_OPTIMIZATION: PromptPart = 
  'Refine Finish using pipeline evidence: tighten AssetPack receipt wording, remove unsupported claims, improve proof references, clarify AssetPack boundaries, align delivery-mechanism metadata with destination requirements, and preserve reusable Read-satisfaction learnings for future source-to-shares runs' as PromptPart;
