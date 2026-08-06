import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Bitcode Finish PromptPart for recovery strategy across evidence and AssetPack delivery"
 * current_version: "0.50.0"
 * versions: []
 * benchmarks: [
 *   { "name": "retry_context_utilization", "test": "Does retry strategy maximize context value?", "score": 0.36 },
 *   { "name": "retry_state_preservation", "test": "Does retry strategy maintain execution continuity?", "score": 0.35 },
 *   { "name": "retry_intelligence_accumulation", "test": "Does retry strategy build on accumulated wisdom?", "score": 0.34 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_FINALIZESHIPMENT_RETRY_STRATEGY: PromptPart = 
  'Implement Finish recovery from pipeline history: restore validated artifacts from checkpoints, rebuild AssetPack completion summary fields, re-check Read satisfaction before delivery, retry only the failed delivery mechanism, preserve previous receipts, and maintain Exchange-reread continuity through recovery' as PromptPart;
