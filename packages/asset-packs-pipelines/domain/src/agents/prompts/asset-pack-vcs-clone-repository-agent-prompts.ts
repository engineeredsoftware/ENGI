import { PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_failsafe_prepare_context';
import { PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_json_only_header';
import { PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_use_this_structured_schema';
import { PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_if_unknown_empty';
import { PROMPTPART_GENERIC_AGENT_GENERATION_REASON } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_reason';
import { PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_judge';
import { PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_structured_output';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_SYSTEM_IDENTITY } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_system_identity';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_SYSTEM_PURPOSE } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_system_purpose';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_SYSTEM_CONSTRAINTS } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_system_constraints';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_PLAN_LABEL } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_plan_label';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_PLAN_DETAILS } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_plan_details';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_TRY_LABEL } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_try_label';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_TRY_DETAILS } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_try_details';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_REFINE_LABEL } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_refine_label';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_REFINE_DETAILS } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_refine_details';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_RETRY_LABEL } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_retry_label';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_RETRY_DETAILS } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_retry_details';
/**
 * AssetPack Pipeline – Clone VCS Repository agent prompts (overlay only)
 *
 * These are AssetPack-specific Prompt instances that will be merged onto
 * the generic VCS agent prompts via Prompt.clone().merge().
 */
/**
 * @doc-comment-developing-promptdevelopment
 * domain: agent
 * intent: "Bitcode setup overlays for cloning repository context into the AssetPack execution workspace"
 * current_version: "0.50.0"
  * benchmarks: [
 *   { "name": "technical_accuracy", "test": "Concrete directives and purpose", "score": 0.50 },
 *   { "name": "implementation_ready", "test": "Usable by registry formatter", "score": 0.50 }
 * ]
 */

import { Prompt } from '@bitcode/prompts/prompt';



export const DP_CLONE_VCS_SYSTEM_PROMPT: Prompt = (() => {
  const p = new Prompt();
  // Append AssetPack-specific content to generic keys by using child paths
  p.set('agent:identity:asset-pack:addendum', PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_SYSTEM_IDENTITY as any);
  p.set('agent:purpose:asset-pack:addendum', PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_SYSTEM_PURPOSE as any);
  p.set('agent:constraints:asset-pack:addendum', PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_SYSTEM_CONSTRAINTS as any);
  p.set('pipeline', 'asset-pack' as any);
  p.set('phase', 'setup' as any);
  p.set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER as any);
  p.set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA as any);
  p.set('generation:if_unknown_empty', PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY as any);
  p.set('generation:reason', PROMPTPART_GENERIC_AGENT_GENERATION_REASON as any);
  p.set('generation:judge', PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE as any);
  p.set('generation:structured_output', PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT as any);
  p.set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT as any);
  p.set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER as any);
  p.set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA as any);
  p.set('generation:if_unknown_empty', PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY as any);
  p.set('generation:reason', PROMPTPART_GENERIC_AGENT_GENERATION_REASON as any);
  p.set('generation:judge', PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE as any);
  p.set('generation:structured_output', PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT as any);
  p.set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT as any);
  return p;
})();

export const DP_CLONE_VCS_PLAN_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set('step:label:asset-pack:addendum', PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_PLAN_LABEL as any);
  p.set('step:details:asset-pack:addendum', PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_PLAN_DETAILS as any);
  p.set('pipeline', 'asset-pack' as any);
  p.set('phase', 'setup' as any);
  p.set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER as any);
  p.set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA as any);
  p.set('generation:reason', PROMPTPART_GENERIC_AGENT_GENERATION_REASON as any);
  p.set('generation:judge', PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE as any);
  p.set('generation:structured_output', PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT as any);
  p.set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT as any);
  p.set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER as any);
  p.set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA as any);
  p.set('generation:if_unknown_empty', PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY as any);
  p.set('generation:reason', PROMPTPART_GENERIC_AGENT_GENERATION_REASON as any);
  p.set('generation:judge', PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE as any);
  p.set('generation:structured_output', PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT as any);
  p.set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT as any);
  return p;
})();

export const DP_CLONE_VCS_TRY_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set('step:label:asset-pack:addendum', PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_TRY_LABEL as any);
  p.set('step:details:asset-pack:addendum', PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_TRY_DETAILS as any);
  p.set('pipeline', 'asset-pack' as any);
  p.set('phase', 'setup' as any);
  p.set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER as any);
  p.set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA as any);
  p.set('generation:if_unknown_empty', PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY as any);
  p.set('generation:reason', PROMPTPART_GENERIC_AGENT_GENERATION_REASON as any);
  p.set('generation:judge', PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE as any);
  p.set('generation:structured_output', PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT as any);
  p.set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT as any);
  p.set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER as any);
  p.set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA as any);
  p.set('generation:if_unknown_empty', PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY as any);
  p.set('generation:reason', PROMPTPART_GENERIC_AGENT_GENERATION_REASON as any);
  p.set('generation:judge', PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE as any);
  p.set('generation:structured_output', PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT as any);
  p.set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT as any);
  return p;
})();

export const DP_CLONE_VCS_REFINE_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set('step:label:asset-pack:addendum', PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_REFINE_LABEL as any);
  p.set('step:details:asset-pack:addendum', PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_REFINE_DETAILS as any);
  p.set('pipeline', 'asset-pack' as any);
  p.set('phase', 'setup' as any);
  p.set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER as any);
  p.set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA as any);
  p.set('generation:reason', PROMPTPART_GENERIC_AGENT_GENERATION_REASON as any);
  p.set('generation:judge', PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE as any);
  p.set('generation:structured_output', PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT as any);
  p.set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT as any);
  p.set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER as any);
  p.set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA as any);
  p.set('generation:if_unknown_empty', PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY as any);
  p.set('generation:reason', PROMPTPART_GENERIC_AGENT_GENERATION_REASON as any);
  p.set('generation:judge', PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE as any);
  p.set('generation:structured_output', PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT as any);
  p.set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT as any);
  return p;
})();

export const DP_CLONE_VCS_RETRY_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set('step:label:asset-pack:addendum', PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_RETRY_LABEL as any);
  p.set('step:details:asset-pack:addendum', PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_RETRY_DETAILS as any);
  p.set('pipeline', 'asset-pack' as any);
  p.set('phase', 'setup' as any);
  p.set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER as any);
  p.set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA as any);
  p.set('generation:if_unknown_empty', PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY as any);
  p.set('generation:reason', PROMPTPART_GENERIC_AGENT_GENERATION_REASON as any);
  p.set('generation:judge', PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE as any);
  p.set('generation:structured_output', PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT as any);
  p.set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT as any);
  p.set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER as any);
  p.set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA as any);
  p.set('generation:if_unknown_empty', PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY as any);
  p.set('generation:reason', PROMPTPART_GENERIC_AGENT_GENERATION_REASON as any);
  p.set('generation:judge', PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE as any);
  p.set('generation:structured_output', PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT as any);
  p.set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT as any);
  return p;
})();
