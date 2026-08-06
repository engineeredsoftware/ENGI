import { Prompt } from '@bitcode/prompts/prompt';
import { hierarchicalFormatter } from '@bitcode/prompts/formatters';
import { PROMPTPART_SPECIFIC_SYSTEM_BITCODECONVERSATION_IDENTITY_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_system_bitcodeconversation_identity_corestatement';
import { PROMPTPART_SPECIFIC_SYSTEM_BITCODECONVERSATION_CAPABILITIES_LIST } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_system_bitcodeconversation_capabilities_list';
import { PROMPTPART_SPECIFIC_SYSTEM_BITCODECONVERSATION_USAGE_GUIDANCE } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_system_bitcodeconversation_usage_guidance';

/**
 * @doc-comment-developing-promptdevelopment
 * domain: system
 * intent: "Bitcode Conversations system prompt assembled from specific PromptParts"
 * current_version: "BITCODE_V26_BITCODE_CONVERSATION_SYSTEM_PROMPT_REGISTRY.1"
 * versions: []
 * benchmarks: [
 *   { "name": "hierarchy_enforced", "test": "Does the prompt require identity/capabilities/usage? Rate 0-1", "score": 0.95 },
 *   { "name": "registry_purity", "test": "Does it only compose PromptParts from the specific namespace? Rate 0-1", "score": 0.94 }
 * ]
 *
 * Minimal registry-based system prompt for Bitcode Conversations surfaces.
 */
export class BitcodeConversationSystemPrompt extends Prompt {
  constructor() {
    super();

    this.set('system:identity', PROMPTPART_SPECIFIC_SYSTEM_BITCODECONVERSATION_IDENTITY_CORESTATEMENT);
    this.set('system:capabilities', PROMPTPART_SPECIFIC_SYSTEM_BITCODECONVERSATION_CAPABILITIES_LIST);
    this.set('system:usage', PROMPTPART_SPECIFIC_SYSTEM_BITCODECONVERSATION_USAGE_GUIDANCE);

    this.require('system:identity');
    this.require('system:capabilities');
    this.require('system:usage');
    this.requireHierarchy();
  }

  formatStructured(): string {
    return super.format(hierarchicalFormatter);
  }
}

export const BITCODE_CONVERSATION_SYSTEM_PROMPT = new BitcodeConversationSystemPrompt();
