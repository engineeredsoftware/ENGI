import { Prompt } from '@bitcode/prompts/prompt';
import { hierarchicalFormatter } from '@bitcode/prompts/formatters';
import { PROMPTPART_SPECIFIC_SYSTEM_BITCODETERMINALCONVERSATION_IDENTITY_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_system_bitcodeterminalconversation_identity_corestatement';
import { PROMPTPART_SPECIFIC_SYSTEM_BITCODETERMINALCONVERSATION_CAPABILITIES_LIST } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_system_bitcodeterminalconversation_capabilities_list';
import { PROMPTPART_SPECIFIC_SYSTEM_BITCODETERMINALCONVERSATION_USAGE_GUIDANCE } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_system_bitcodeterminalconversation_usage_guidance';

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
export class BitcodeTerminalConversationSystemPrompt extends Prompt {
  constructor() {
    super();

    this.set('system:identity', PROMPTPART_SPECIFIC_SYSTEM_BITCODETERMINALCONVERSATION_IDENTITY_CORESTATEMENT);
    this.set('system:capabilities', PROMPTPART_SPECIFIC_SYSTEM_BITCODETERMINALCONVERSATION_CAPABILITIES_LIST);
    this.set('system:usage', PROMPTPART_SPECIFIC_SYSTEM_BITCODETERMINALCONVERSATION_USAGE_GUIDANCE);

    this.require('system:identity');
    this.require('system:capabilities');
    this.require('system:usage');
    this.requireHierarchy();
  }

  formatStructured(): string {
    return super.format(hierarchicalFormatter);
  }
}

export const BITCODE_TERMINAL_CONVERSATION_SYSTEM_PROMPT = new BitcodeTerminalConversationSystemPrompt();
