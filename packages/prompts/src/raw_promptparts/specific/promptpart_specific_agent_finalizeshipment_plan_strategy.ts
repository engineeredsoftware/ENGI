import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Bitcode Finish PromptPart for sequencing evidence storage and AssetPack delivery"
 * current_version: "0.50.0"
 * versions: []
 * benchmarks: [
 *   { "name": "plan_context_utilization", "test": "Does plan strategy maximize context value?", "score": 0.41 },
 *   { "name": "plan_state_preservation", "test": "Does plan strategy maintain execution continuity?", "score": 0.40 },
 *   { "name": "plan_intelligence_accumulation", "test": "Does plan strategy build on accumulated wisdom?", "score": 0.39 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_FINALIZESHIPMENT_PLAN_STRATEGY: PromptPart = 
  'Plan Finish using complete pipeline state: store validated AssetPack evidence first, confirm proof and receipt fields, choose the requested delivery mechanism, record destination-specific delivery evidence, and preserve rereadable operator summary' as PromptPart;
