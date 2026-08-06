import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Bitcode Finish PromptPart for assessing stored evidence and AssetPack delivery quality"
 * current_version: "0.50.0"
 * versions: []
 * benchmarks: [
 *   { "name": "refine_context_utilization", "test": "Does refine assessment maximize context value?", "score": 0.37 },
 *   { "name": "refine_state_preservation", "test": "Does refine assessment maintain execution continuity?", "score": 0.36 },
 *   { "name": "refine_intelligence_accumulation", "test": "Does refine assessment build on accumulated wisdom?", "score": 0.35 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_FINALIZESHIPMENT_REFINE_ASSESSMENT: PromptPart = 
  'Assess Finish quality against complete context: Read satisfaction, AssetPack evidence completeness, proof receipt availability, summary clarity, delivery-mechanism fit, AssetPack traceability, destination response evidence, and safe reread through Exchange and product surfaces' as PromptPart;
