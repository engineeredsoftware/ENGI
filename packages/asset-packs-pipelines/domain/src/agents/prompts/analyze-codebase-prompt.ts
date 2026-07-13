import { Prompt } from '@bitcode/prompts/prompt';
import { PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_SYSTEM_IDENTITY } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_analyzecodebase_system_identity';
import { PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_SYSTEM_ROLE } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_analyzecodebase_system_role';
import { PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_SYSTEM_INSTRUCTIONS } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_analyzecodebase_system_instructions';
import { PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_PURPOSE_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_analyzecodebase_purpose_corestatement';
import { PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_PLAN_STRATEGY } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_analyzecodebase_plan_strategy';
import { PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_PLAN_ANALYSIS } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_analyzecodebase_plan_analysis';
import { PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_TRY_DIRECTIVES } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_analyzecodebase_try_directives';
import { PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_REFINE_OPTIMIZATION } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_analyzecodebase_refine_optimization';
import { PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_REFINE_ASSESSMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_analyzecodebase_refine_assessment';
import { PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_RETRY_STRATEGY } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_analyzecodebase_retry_strategy';
import { PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_RETRY_ERRORHANDLING } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_analyzecodebase_retry_errorhandling';
import { PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_CONTEXT_AWARENESS_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_analyzecodebase_context_awareness_detailcontent';
import { PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_PHASE_PLAN_LABEL } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_analyzecodebase_phase_plan_label';
import { PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_PHASE_TRY_LABEL } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_analyzecodebase_phase_try_label';
import { PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_PHASE_REFINE_LABEL } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_analyzecodebase_phase_refine_label';
import { PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_PHASE_RETRY_LABEL } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_analyzecodebase_phase_retry_label';
import { PROMPTPART_GENERIC_PTRR_PLAN_OBJECTIVE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_plan_objective';
import { PROMPTPART_GENERIC_PTRR_REFINE_OBJECTIVE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_refine_objective';
import { PROMPTPART_GENERIC_PTRR_RETRY_OBJECTIVE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_retry_objective';
import { PROMPTPART_GENERIC_FORMATTING_GIVENTHEFOLLOWING } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_formatting_giventhefollowing';
import { PROMPTPART_GENERIC_FORMATTING_BASEDONTHE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_formatting_basedonthe';
import { PROMPTPART_GENERIC_FORMATTING_AFTERENCOUNTERING } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_formatting_afterencountering';
import { PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_failsafe_prepare_context';
import { PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_json_only_header';
import { PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_use_this_structured_schema';
import { PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_if_unknown_empty';
import { PROMPTPART_GENERIC_AGENT_GENERATION_REASON } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_reason';
import { PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_judge';
import { PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_structured_output';

// Import actual PromptParts with canonical naming


// import actual promptparts with canonical naming












import { PROMPTPART_GENERIC_PTRR_TRY_OBJECTIVE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_try_objective';



import { PROMPTPART_GENERIC_FORMATTING_EXECUTETHE_FOLLOWING } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_formatting_executethe_following';




/**
 * @doc-comment-developing-promptdevelopment
 * domain: agent
 * intent: "Bitcode discovery system prompt for analyzing repository structure as Read and AssetPack context evidence"
 * current_version: "0.50.0"
 * dependencies: {
 *   "PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_SYSTEM_IDENTITY": "0.50.0",
 *   "PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_SYSTEM_ROLE": "0.50.0",
 *   "PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_SYSTEM_INSTRUCTIONS": "0.50.0",
 *   "PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_PURPOSE_CORESTATEMENT": "0.50.0"
 * }
 * benchmarks: [
 *   { "name": "technical_accuracy", "test": "Concrete directives and purpose", "score": 0.46 },
 *   { "name": "implementation_ready", "test": "Usable by registry formatter", "score": 0.46 }
 * ]
 */
export function createAnalyzeCodebaseSystemPrompt(): Prompt {
  const prompt = new Prompt();
  
  prompt.set('identity', PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_SYSTEM_IDENTITY);
  prompt.set('role', PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_SYSTEM_ROLE);
  prompt.set('instructions', PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_SYSTEM_INSTRUCTIONS);
  prompt.set('purpose', PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_PURPOSE_CORESTATEMENT);
  prompt.set('context_awareness', PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_CONTEXT_AWARENESS_DETAILCONTENT);
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
 * @doc-comment-developing-promptdevelopment
 * domain: agent
 * intent: "Bitcode discovery plan-step prompt for choosing repository analysis paths that clarify Read and AssetPack scope"
 * current_version: "0.50.0"
 * dependencies: {
 *   "PROMPTPART_GENERIC_PTRR_PLAN_OBJECTIVE": "0.50.0",
 *   "PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_PLAN_STRATEGY": "0.50.0",
 *   "PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_PLAN_ANALYSIS": "0.50.0"
 * }
 * benchmarks: [
 *   { "name": "technical_accuracy", "test": "Concrete directives and purpose", "score": 0.46 },
 *   { "name": "implementation_ready", "test": "Usable by registry formatter", "score": 0.46 }
 * ]
 */
export function createAnalyzeCodebasePlanPrompt(): Prompt {
  const prompt = new Prompt();
  // Generic scaffolding
  prompt.set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER as any);
  prompt.set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA as any);
  prompt.set('generation:reason', PROMPTPART_GENERIC_AGENT_GENERATION_REASON as any);
  prompt.set('generation:judge', PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE as any);
  prompt.set('generation:structured_output', PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT as any);
  prompt.set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT as any);
  prompt.set('phase', PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_PHASE_PLAN_LABEL);
  prompt.set('context_lead', PROMPTPART_GENERIC_FORMATTING_GIVENTHEFOLLOWING);
  prompt.set('objective', PROMPTPART_GENERIC_PTRR_PLAN_OBJECTIVE);
  prompt.set('strategy', PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_PLAN_STRATEGY);
  prompt.set('analysis', PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_PLAN_ANALYSIS);
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
 * @doc-comment-developing-promptdevelopment
 * domain: agent
 * intent: "Bitcode discovery try-step prompt for extracting source evidence that supports writtenAssetType and proof planning"
 * current_version: "0.50.0"
 * dependencies: {
 *   "PROMPTPART_GENERIC_PTRR_TRY_OBJECTIVE": "0.50.0",
 *   "PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_TRY_DIRECTIVES": "0.50.0"
 * }
 * benchmarks: [
 *   { "name": "technical_accuracy", "test": "Concrete directives and purpose", "score": 0.46 },
 *   { "name": "implementation_ready", "test": "Usable by registry formatter", "score": 0.46 }
 * ]
 */
export function createAnalyzeCodebaseTryPrompt(): Prompt {
  const prompt = new Prompt();
  
  prompt.set('phase', PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_PHASE_TRY_LABEL);
  prompt.set('directive', PROMPTPART_GENERIC_FORMATTING_EXECUTETHE_FOLLOWING);
  prompt.set('objective', PROMPTPART_GENERIC_PTRR_TRY_OBJECTIVE);
  prompt.set('execution', PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_TRY_DIRECTIVES);
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
 * @doc-comment-developing-promptdevelopment
 * domain: agent
 * intent: "Bitcode discovery refine-step prompt for correcting repository analysis gaps before implementation planning"
 * current_version: "0.50.0"
 * dependencies: {
 *   "PROMPTPART_GENERIC_PTRR_REFINE_OBJECTIVE": "0.50.0",
 *   "PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_REFINE_ASSESSMENT": "0.50.0",
 *   "PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_REFINE_OPTIMIZATION": "0.50.0"
 * }
 * benchmarks: [
 *   { "name": "technical_accuracy", "test": "Concrete directives and purpose", "score": 0.46 },
 *   { "name": "implementation_ready", "test": "Usable by registry formatter", "score": 0.46 }
 * ]
 */
export function createAnalyzeCodebaseRefinePrompt(): Prompt {
  const prompt = new Prompt();
  
  prompt.set('phase', PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_PHASE_REFINE_LABEL);
  prompt.set('context_lead', PROMPTPART_GENERIC_FORMATTING_BASEDONTHE);
  prompt.set('objective', PROMPTPART_GENERIC_PTRR_REFINE_OBJECTIVE);
  prompt.set('assessment', PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_REFINE_ASSESSMENT);
  prompt.set('optimization', PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_REFINE_OPTIMIZATION);
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
 * @doc-comment-developing-promptdevelopment
 * domain: agent
 * intent: "Bitcode discovery retry-step prompt for recovering missing repository context without losing Read alignment"
 * current_version: "0.50.0"
 * dependencies: {
 *   "PROMPTPART_GENERIC_PTRR_RETRY_OBJECTIVE": "0.50.0",
 *   "PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_RETRY_ERRORHANDLING": "0.50.0",
 *   "PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_RETRY_STRATEGY": "0.50.0"
 * }
 * benchmarks: [
 *   { "name": "technical_accuracy", "test": "Concrete directives and purpose", "score": 0.46 },
 *   { "name": "implementation_ready", "test": "Usable by registry formatter", "score": 0.46 }
 * ]
 */
export function createAnalyzeCodebaseRetryPrompt(): Prompt {
  const prompt = new Prompt();
  
  prompt.set('phase', PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_PHASE_RETRY_LABEL);
  prompt.set('context_lead', PROMPTPART_GENERIC_FORMATTING_AFTERENCOUNTERING);
  prompt.set('objective', PROMPTPART_GENERIC_PTRR_RETRY_OBJECTIVE);
  prompt.set('error_handling', PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_RETRY_ERRORHANDLING);
  prompt.set('retry_strategy', PROMPTPART_SPECIFIC_AGENT_ANALYZECODEBASE_RETRY_STRATEGY);
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
 * Main export: Complete prompt set for AnalyzeCodebase agent
 */
export const AnalyzeCodebasePrompts = {
  system: createAnalyzeCodebaseSystemPrompt,
  plan: createAnalyzeCodebasePlanPrompt,
  try: createAnalyzeCodebaseTryPrompt,
  refine: createAnalyzeCodebaseRefinePrompt,
  retry: createAnalyzeCodebaseRetryPrompt
};
