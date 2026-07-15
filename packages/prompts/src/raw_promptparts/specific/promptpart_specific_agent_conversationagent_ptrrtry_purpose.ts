import { PromptPart } from '../../parts/PromptPart';

/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Bitcode conversation Try step purpose"
 * current_version: "BITCODE_V26_CONVERSATION_AGENT_PROMPTPART.1"
 * versions: []
 * benchmarks: [
 *   { "name": "step_specificity", "test": "Does the PromptPart specify the Try role?", "score": 0.95 }
 * ]
 */
export const PROMPTPART_SPECIFIC_AGENT_CONVERSATIONAGENT_PTRRTRY_PURPOSE: PromptPart =
  'Generate the Bitcode response with repository-aware reasoning, cited source-safe context, explicit pipeline trigger candidates when needed, and no protected source, raw prompt, raw provider response, private settlement payload, or unpaid AssetPack source.' as PromptPart;
