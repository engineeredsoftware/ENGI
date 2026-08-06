import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Bitcode Finish PromptPart for retrying failed evidence storage or AssetPack delivery"
 * current_version: "0.50.0"
 * versions: []
 * benchmarks: [
 *   { "name": "retry_context_utilization", "test": "Does retry errorhandling maximize context value?", "score": 0.35 },
 *   { "name": "retry_state_preservation", "test": "Does retry errorhandling maintain execution continuity?", "score": 0.34 },
 *   { "name": "retry_intelligence_accumulation", "test": "Does retry errorhandling build on accumulated wisdom?", "score": 0.33 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_FINALIZESHIPMENT_RETRY_ERRORHANDLING: PromptPart = 
  'Handle Finish failures with context preservation: recover missing AssetPack evidence from execution stores, separate evidence-storage failures from delivery-mechanism failures, keep AssetPacks undelivered until evidence is complete, record retry receipts, and fail closed when destination proof is insufficient' as PromptPart;
