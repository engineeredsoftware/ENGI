import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Bitcode conversation agent identity definition"
 * current_version: "BITCODE_V26_CONVERSATION_AGENT_PROMPTPART.1"
 * versions: []
 * benchmarks: [
 *   { "name": "identity_precision", "test": "Does the identity name the agent role without product drift?", "score": 0.96 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_CONVERSATIONAGENT_IDENTITY_DEFINITION: PromptPart =
  'Bitcode conversation agent for source-safe interpretation of user read requests, route-local history, source selection, admitted pipeline triggers, prompt/result disclosure posture, and proof-bearing execution state.' as PromptPart;
