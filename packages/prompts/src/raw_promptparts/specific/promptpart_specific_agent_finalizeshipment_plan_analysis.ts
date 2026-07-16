import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Bitcode Finish PromptPart for planning stored AssetPack evidence and AssetPack delivery"
 * current_version: "0.50.0"
 * versions: []
 * benchmarks: [
 *   { "name": "plan_context_utilization", "test": "Does plan analysis maximize context value?", "score": 0.40 },
 *   { "name": "plan_state_preservation", "test": "Does plan analysis maintain execution continuity?", "score": 0.39 },
 *   { "name": "plan_intelligence_accumulation", "test": "Does plan analysis build on accumulated wisdom?", "score": 0.38 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_FINALIZESHIPMENT_PLAN_ANALYSIS: PromptPart = 
  'Analyze full AssetPack pipeline context for Finish: validated Read-satisfaction artifacts, stored evidence requirements, proof receipts, fit-to-Read checks, delivery-mechanism readiness, AssetPack destination constraints, and operator review evidence' as PromptPart;
