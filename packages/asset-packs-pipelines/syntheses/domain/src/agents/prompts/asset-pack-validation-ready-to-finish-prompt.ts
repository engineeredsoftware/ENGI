import { Prompt } from '@bitcode/prompts/prompt';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATIONREADYTOFINISH_IDENTITY_DEFINITION } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackvalidationreadytofinish_identity_definition';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATIONREADYTOFINISH_PURPOSE_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackvalidationreadytofinish_purpose_corestatement';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATIONREADYTOFINISH_CAPABILITIES_LIST } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackvalidationreadytofinish_capabilities_list';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATIONREADYTOFINISH_TOOLS_AVAILABLE } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackvalidationreadytofinish_tools_available';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATIONREADYTOFINISH_REQUIREMENTS_CONTEXT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackvalidationreadytofinish_requirements_context';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATIONREADYTOFINISH_PTRRPLAN_PURPOSE } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackvalidationreadytofinish_ptrrplan_purpose';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATIONREADYTOFINISH_PTRRTRY_PURPOSE } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackvalidationreadytofinish_ptrrtry_purpose';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATIONREADYTOFINISH_PTRRREFINE_PURPOSE } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackvalidationreadytofinish_ptrrrefine_purpose';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATIONREADYTOFINISH_PTRRRETRY_PURPOSE } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackvalidationreadytofinish_ptrrretry_purpose';
import { PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_failsafe_prepare_context';
import { PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_json_only_header';
import { PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_use_this_structured_schema';
import { PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_if_unknown_empty';
import { PROMPTPART_GENERIC_AGENT_GENERATION_REASON } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_reason';
import { PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_judge';
import { PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_structured_output';











/**
 * @doc-comment-developing-promptdevelopment
 * domain: pipeline
 * intent: "Bitcode AssetPack validation prompt for deciding whether validated Read-satisfaction AssetPack synthesis artifacts are ready to enter Finish"
 * current_version: "0.50.0"
 * dependencies: {
 *   "PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT": "0.50.0",
 *   "PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER": "0.50.0",
 *   "PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA": "0.50.0",
 *   "PROMPTPART_GENERIC_AGENT_GENERATION_REASON": "0.50.0",
 *   "PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE": "0.50.0",
 *   "PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT": "0.50.0"
 * }
 * benchmarks: [
 *   { "name": "technical_accuracy", "test": "Concrete directives and purpose", "score": 0.46 },
 *   { "name": "implementation_ready", "test": "Usable by registry formatter", "score": 0.46 }
 * ]
 */
export function createAssetPackValidationReadyToFinishAgentPrompt(): Prompt {
  const prompt = new Prompt();
  
  // Agent identity and purpose
  prompt.set('agent/identity', PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATIONREADYTOFINISH_IDENTITY_DEFINITION);
  prompt.set('agent/purpose', PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATIONREADYTOFINISH_PURPOSE_CORESTATEMENT);
  prompt.set('agent/capabilities', PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATIONREADYTOFINISH_CAPABILITIES_LIST);
  prompt.set('agent/tools', PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATIONREADYTOFINISH_TOOLS_AVAILABLE);
  prompt.set('agent/requirements', PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATIONREADYTOFINISH_REQUIREMENTS_CONTEXT);
  
  // PTRR step purposes
  prompt.set('ptrr/plan/purpose', PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATIONREADYTOFINISH_PTRRPLAN_PURPOSE);
  prompt.set('ptrr/try/purpose', PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATIONREADYTOFINISH_PTRRTRY_PURPOSE);
  prompt.set('ptrr/refine/purpose', PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATIONREADYTOFINISH_PTRRREFINE_PURPOSE);
  prompt.set('ptrr/retry/purpose', PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATIONREADYTOFINISH_PTRRRETRY_PURPOSE);
  // Generic generation/failsafe scaffolding for agent-level prompt
  prompt.set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER as any);
  prompt.set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA as any);
  prompt.set('generation:reason', PROMPTPART_GENERIC_AGENT_GENERATION_REASON as any);
  prompt.set('generation:judge', PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE as any);
  prompt.set('generation:structured_output', PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT as any);
  prompt.set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT as any);
  
  // Require core paths
  prompt.require('agent/identity');
  prompt.require('agent/purpose');
  prompt.requirePattern('ptrr/*/purpose');
  
  return prompt;
}

/**
 * Get step-specific prompts
 */
export const AssetPackValidationReadyToFinishAgentPromptSteps = {
  plan: () => {
    const prompt = new Prompt();
    prompt.set('step', PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATIONREADYTOFINISH_PTRRPLAN_PURPOSE);
    prompt.set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER as any);
    prompt.set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA as any);
    prompt.set('generation:reason', PROMPTPART_GENERIC_AGENT_GENERATION_REASON as any);
    prompt.set('generation:judge', PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE as any);
    prompt.set('generation:structured_output', PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT as any);
    prompt.set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT as any);
    return prompt;
  },
  try: () => {
    const prompt = new Prompt();
    prompt.set('step', PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATIONREADYTOFINISH_PTRRTRY_PURPOSE);
    prompt.set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER as any);
    prompt.set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA as any);
    prompt.set('generation:if_unknown_empty', PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY as any);
    prompt.set('generation:reason', PROMPTPART_GENERIC_AGENT_GENERATION_REASON as any);
    prompt.set('generation:judge', PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE as any);
    prompt.set('generation:structured_output', PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT as any);
    prompt.set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT as any);
    return prompt;
  },
  refine: () => {
    const prompt = new Prompt();
    prompt.set('step', PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATIONREADYTOFINISH_PTRRREFINE_PURPOSE);
    prompt.set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER as any);
    prompt.set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA as any);
    prompt.set('generation:reason', PROMPTPART_GENERIC_AGENT_GENERATION_REASON as any);
    prompt.set('generation:judge', PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE as any);
    prompt.set('generation:structured_output', PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT as any);
    prompt.set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT as any);
    return prompt;
  },
  retry: () => {
    const prompt = new Prompt();
    prompt.set('step', PROMPTPART_SPECIFIC_AGENT_ASSETPACKVALIDATIONREADYTOFINISH_PTRRRETRY_PURPOSE);
    prompt.set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER as any);
    prompt.set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA as any);
    prompt.set('generation:if_unknown_empty', PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY as any);
    prompt.set('generation:reason', PROMPTPART_GENERIC_AGENT_GENERATION_REASON as any);
    prompt.set('generation:judge', PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE as any);
    prompt.set('generation:structured_output', PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT as any);
    prompt.set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT as any);
    return prompt;
  }
};
