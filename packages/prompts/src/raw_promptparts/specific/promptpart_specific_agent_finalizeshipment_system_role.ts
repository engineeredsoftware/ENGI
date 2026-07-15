import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Bitcode Finish PromptPart for the role that delivers Shippables"
 * current_version: "0.50.0"
 * versions: []
 * benchmarks: [
 *   { "name": "role_context_awareness", "test": "Does role leverage execution context effectively?", "score": 0.43 },
 *   { "name": "role_precision", "test": "Is role precisely defined for production?", "score": 0.42 },
 *   { "name": "role_completeness", "test": "Does role utilize accumulated intelligence?", "score": 0.41 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_FINALIZESHIPMENT_SYSTEM_ROLE: PromptPart = 
  'Your role is to coordinate Finish using complete execution history: verify validation gates, preserve AssetPack evidence, summarize proof and Read satisfaction, deliver requested Shippables through connected-interface mechanisms, and return receipts that Packs and Exchange can reread' as PromptPart;
