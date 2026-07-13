import { Prompt } from '@bitcode/prompts/prompt';
/**
 * @doc-comment-developing-promptdevelopment
 * domain: system
 * intent: "Bitcode Terminal conversation system prompt assembled from specific PromptParts"
 * current_version: "BITCODE_V26_BITCODETERMINAL_CONVERSATION_SYSTEM_PROMPT_REGISTRY.1"
 * versions: []
 * benchmarks: [
 *   { "name": "hierarchy_enforced", "test": "Does the prompt require identity/capabilities/usage? Rate 0-1", "score": 0.95 },
 *   { "name": "registry_purity", "test": "Does it only compose PromptParts from the specific namespace? Rate 0-1", "score": 0.94 }
 * ]
 *
 * Minimal registry-based system prompt for Bitcode Terminal conversation surfaces.
 */
export declare class BitcodeTerminalConversationSystemPrompt extends Prompt {
    constructor();
    formatStructured(): string;
}
export declare const BITCODE_TERMINAL_CONVERSATION_SYSTEM_PROMPT: BitcodeTerminalConversationSystemPrompt;
