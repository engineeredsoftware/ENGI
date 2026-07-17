import { Prompt } from '@bitcode/prompts/prompt';
import { PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_failsafe_prepare_context';
import { PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_json_only_header';
import { PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_use_this_structured_schema';
import { PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_if_unknown_empty';
import { PROMPTPART_GENERIC_AGENT_GENERATION_REASON } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_reason';
import { PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_judge';
import { PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_structured_output';
import { PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_SYSTEM_IDENTITY } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_comprehendread_system_identity';
import { PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_SYSTEM_ROLE } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_comprehendread_system_role';
import { PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_SYSTEM_INSTRUCTIONS } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_comprehendread_system_instructions';
import { PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_PLAN_STRATEGY } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_comprehendread_plan_strategy';
import { PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_PLAN_ANALYSIS } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_comprehendread_plan_analysis';
import { PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_TRY_DIRECTIVES } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_comprehendread_try_directives';
import { PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_REFINE_OPTIMIZATION } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_comprehendread_refine_optimization';
import { PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_REFINE_ASSESSMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_comprehendread_refine_assessment';
import { PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_RETRY_STRATEGY } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_comprehendread_retry_strategy';
import { PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_RETRY_ERRORHANDLING } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_comprehendread_retry_errorhandling';
import { PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_CONTEXT_AWARENESS_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_comprehendread_context_awareness_detailcontent';
import { PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_PHASE_PLAN_LABEL } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_comprehendread_phase_plan_label';
import { PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_PHASE_TRY_LABEL } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_comprehendread_phase_try_label';
import { PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_PHASE_REFINE_LABEL } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_comprehendread_phase_refine_label';
import { PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_PHASE_RETRY_LABEL } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_comprehendread_phase_retry_label';
import { PROMPTPART_GENERIC_PTRR_PLAN_OBJECTIVE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_plan_objective';
import { PROMPTPART_GENERIC_PTRR_REFINE_OBJECTIVE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_refine_objective';
import { PROMPTPART_GENERIC_PTRR_RETRY_OBJECTIVE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_retry_objective';
import { PROMPTPART_GENERIC_FORMATTING_GIVENTHEFOLLOWING } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_formatting_giventhefollowing';
import { PROMPTPART_GENERIC_FORMATTING_BASEDONTHE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_formatting_basedonthe';
import { PROMPTPART_GENERIC_FORMATTING_AFTERENCOUNTERING } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_formatting_afterencountering';
import { PROMPTPART_GENERIC_PTRR_TRY_OBJECTIVE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_try_objective';
import { PROMPTPART_GENERIC_FORMATTING_EXECUTETHE_FOLLOWING } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_formatting_executethe_following';



/**
 * @doc-comment-developing-promptdevelopment
 * domain: pipeline
 * intent: "Bitcode setup prompt for converting request inputs into Read, writtenAssetType, AssetPack scope, and proof criteria"
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
export function createComprehendReadSystemPrompt(): Prompt {
  const prompt = new Prompt();
  
  prompt.set('identity', PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_SYSTEM_IDENTITY);
  prompt.set('role', PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_SYSTEM_ROLE);
  prompt.set('instructions', PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_SYSTEM_INSTRUCTIONS);
  prompt.set('context_awareness', PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_CONTEXT_AWARENESS_DETAILCONTENT);
  
  // Generic scaffolding
  prompt.set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER as any);
  prompt.set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA as any);
  prompt.set('generation:reason', PROMPTPART_GENERIC_AGENT_GENERATION_REASON as any);
  prompt.set('generation:judge', PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE as any);
  prompt.set('generation:structured_output', PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT as any);
  prompt.set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT as any);

  prompt.require('identity');
  prompt.require('role');
  prompt.require('instructions');
  
  return prompt;
}


/**
 * PLAN step prompt
 */
export function createComprehendReadPlanPrompt(): Prompt {
  const prompt = new Prompt();
  
  prompt.set('phase', PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_PHASE_PLAN_LABEL);
  prompt.set('context_lead', PROMPTPART_GENERIC_FORMATTING_GIVENTHEFOLLOWING);
  prompt.set('objective', PROMPTPART_GENERIC_PTRR_PLAN_OBJECTIVE);
  prompt.set('strategy', PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_PLAN_STRATEGY);
  prompt.set('analysis', PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_PLAN_ANALYSIS);
  
  // Generic scaffolding
  prompt.set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER as any);
  prompt.set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA as any);
  prompt.set('generation:reason', PROMPTPART_GENERIC_AGENT_GENERATION_REASON as any);
  prompt.set('generation:judge', PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE as any);
  prompt.set('generation:structured_output', PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT as any);
  prompt.set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT as any);

  prompt.require('strategy');
  prompt.require('analysis');
  
  return prompt;
}


/**
 * TRY step prompt
 */
export function createComprehendReadTryPrompt(): Prompt {
  const prompt = new Prompt();
  
  prompt.set('phase', PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_PHASE_TRY_LABEL);
  prompt.set('directive', PROMPTPART_GENERIC_FORMATTING_EXECUTETHE_FOLLOWING);
  prompt.set('objective', PROMPTPART_GENERIC_PTRR_TRY_OBJECTIVE);
  prompt.set('execution', PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_TRY_DIRECTIVES);
  // Generic scaffolding
  prompt.set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER as any);
  prompt.set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA as any);
  prompt.set('generation:if_unknown_empty', PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY as any);
  prompt.set('generation:reason', PROMPTPART_GENERIC_AGENT_GENERATION_REASON as any);
  prompt.set('generation:judge', PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE as any);
  prompt.set('generation:structured_output', PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT as any);
  prompt.set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT as any);
  
  prompt.require('execution');
  
  return prompt;
}


/**
 * REFINE step prompt
 */
export function createComprehendReadRefinePrompt(): Prompt {
  const prompt = new Prompt();
  
  prompt.set('phase', PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_PHASE_REFINE_LABEL);
  prompt.set('context_lead', PROMPTPART_GENERIC_FORMATTING_BASEDONTHE);
  prompt.set('objective', PROMPTPART_GENERIC_PTRR_REFINE_OBJECTIVE);
  prompt.set('assessment', PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_REFINE_ASSESSMENT);
  prompt.set('optimization', PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_REFINE_OPTIMIZATION);
  // Generic scaffolding
  prompt.set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER as any);
  prompt.set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA as any);
  prompt.set('generation:reason', PROMPTPART_GENERIC_AGENT_GENERATION_REASON as any);
  prompt.set('generation:judge', PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE as any);
  prompt.set('generation:structured_output', PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT as any);
  prompt.set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT as any);
  
  prompt.require('assessment');
  prompt.require('optimization');
  
  return prompt;
}


/**
 * RETRY step prompt
 */
export function createComprehendReadRetryPrompt(): Prompt {
  const prompt = new Prompt();
  
  prompt.set('phase', PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_PHASE_RETRY_LABEL);
  prompt.set('context_lead', PROMPTPART_GENERIC_FORMATTING_AFTERENCOUNTERING);
  prompt.set('objective', PROMPTPART_GENERIC_PTRR_RETRY_OBJECTIVE);
  prompt.set('error_handling', PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_RETRY_ERRORHANDLING);
  prompt.set('retry_strategy', PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_RETRY_STRATEGY);
  // Generic scaffolding
  prompt.set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER as any);
  prompt.set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA as any);
  prompt.set('generation:if_unknown_empty', PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY as any);
  prompt.set('generation:reason', PROMPTPART_GENERIC_AGENT_GENERATION_REASON as any);
  prompt.set('generation:judge', PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE as any);
  prompt.set('generation:structured_output', PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT as any);
  prompt.set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT as any);
  
  prompt.require('error_handling');
  prompt.require('retry_strategy');
  
  return prompt;
}


/**
 * Main export: Complete prompt sets
 */
export const ComprehendReadPrompts = {
  system: createComprehendReadSystemPrompt,
  plan: createComprehendReadPlanPrompt,
  try: createComprehendReadTryPrompt,
  refine: createComprehendReadRefinePrompt,
  retry: createComprehendReadRetryPrompt
};

export const createComprehendReadPromptSet = () => ComprehendReadPrompts;
