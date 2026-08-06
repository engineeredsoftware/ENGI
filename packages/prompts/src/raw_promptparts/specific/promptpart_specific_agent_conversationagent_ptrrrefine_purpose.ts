import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Bitcode conversation Refine step purpose"
 * current_version: "BITCODE_V26_CONVERSATION_AGENT_PROMPTPART.1"
 * versions: []
 * benchmarks: [
 *   { "name": "step_specificity", "test": "Does the PromptPart specify the Refine role?", "score": 0.95 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_CONVERSATIONAGENT_PTRRREFINE_PURPOSE: PromptPart =
  'Refine the response for Bitcode clarity, evidence quality, route-local source selection, stream-log metadata, formatting, typed schema alignment, and the product prompt contract.' as PromptPart;
