import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Bitcode conversation Retry step purpose"
 * current_version: "BITCODE_V26_CONVERSATION_AGENT_PROMPTPART.1"
 * versions: []
 * benchmarks: [
 *   { "name": "step_specificity", "test": "Does the PromptPart specify the Retry role?", "score": 0.95 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_CONVERSATIONAGENT_PTRRRETRY_PURPOSE: PromptPart =
  'Finalize the response, recover incomplete reasoning, fail closed on missing authority or unsafe disclosure, and emit only source-safe admitted pipeline-trigger guidance when the conversation read requires action.' as PromptPart;
