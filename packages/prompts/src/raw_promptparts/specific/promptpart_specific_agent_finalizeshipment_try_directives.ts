import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Bitcode Finish PromptPart for executing evidence storage and AssetPack delivery"
 * current_version: "0.50.0"
 * versions: []
 * benchmarks: [
 *   { "name": "try_context_utilization", "test": "Does try execution maximize context value?", "score": 0.39 },
 *   { "name": "try_state_preservation", "test": "Does try execution maintain execution continuity?", "score": 0.38 },
 *   { "name": "try_intelligence_accumulation", "test": "Does try execution build on accumulated wisdom?", "score": 0.37 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_FINALIZESHIPMENT_TRY_DIRECTIVES: PromptPart = 
  'Execute Finish with full context orchestration: persist final AssetPack evidence, create the final summary, map validated artifacts to settle-ready evidence, call the destination delivery mechanism, capture PR/issue/comment/review identifiers or URLs, and archive proof-visible receipts for future reread' as PromptPart;
