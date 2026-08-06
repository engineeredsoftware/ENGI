import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Bitcode conversation Plan step purpose"
 * current_version: "BITCODE_V26_CONVERSATION_AGENT_PROMPTPART.1"
 * versions: []
 * benchmarks: [
 *   { "name": "step_specificity", "test": "Does the PromptPart specify the Plan role?", "score": 0.95 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_CONVERSATIONAGENT_PTRRPLAN_PURPOSE: PromptPart =
  'Plan the Bitcode response by classifying the user read, route authority, source selector inputs, required repository context, disclosure tier, typed output target, and whether an admitted pipeline trigger is warranted.' as PromptPart;
