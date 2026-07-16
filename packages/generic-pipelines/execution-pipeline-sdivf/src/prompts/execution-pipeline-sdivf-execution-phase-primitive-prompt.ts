/**
 * Primitive phase Prompt for ExecutionPipelineSDIVFExecutionPhase nodes.
 *
 * Fully generic phase identity (any SDIVF phase name). Assembled from
 * raw_promptparts only. Lives with SDIVF base — phases are not pipeline primitives.
 */

import { Prompt } from '@bitcode/prompts/prompt';
import { PROMPTPART_GENERIC_PHASE_SYSTEM_IDENTITY_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_phase_system_identity_corestatement';
import { PROMPTPART_GENERIC_PHASE_SYSTEM_CONTRACT_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_phase_system_contract_detailcontent';
import { PROMPTPART_GENERIC_PHASE_SYSTEM_ACTIVENAME_SETUP_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_phase_system_activename_setup_detailcontent';
import { PROMPTPART_GENERIC_PHASE_SYSTEM_ACTIVENAME_DISCOVERY_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_phase_system_activename_discovery_detailcontent';
import { PROMPTPART_GENERIC_PHASE_SYSTEM_ACTIVENAME_IMPLEMENTATION_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_phase_system_activename_implementation_detailcontent';
import { PROMPTPART_GENERIC_PHASE_SYSTEM_ACTIVENAME_VALIDATION_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_phase_system_activename_validation_detailcontent';
import { PROMPTPART_GENERIC_PHASE_SYSTEM_ACTIVENAME_FINISH_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_phase_system_activename_finish_detailcontent';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';

const ACTIVE_NAME: Record<string, PromptPart> = {
  setup: PROMPTPART_GENERIC_PHASE_SYSTEM_ACTIVENAME_SETUP_DETAILCONTENT,
  discovery: PROMPTPART_GENERIC_PHASE_SYSTEM_ACTIVENAME_DISCOVERY_DETAILCONTENT,
  implementation: PROMPTPART_GENERIC_PHASE_SYSTEM_ACTIVENAME_IMPLEMENTATION_DETAILCONTENT,
  validation: PROMPTPART_GENERIC_PHASE_SYSTEM_ACTIVENAME_VALIDATION_DETAILCONTENT,
  finish: PROMPTPART_GENERIC_PHASE_SYSTEM_ACTIVENAME_FINISH_DETAILCONTENT,
};

export function factoryExecutionPipelineSDIVFExecutionPhasePrimitivePrompt(
  phaseName: string,
): Prompt {
  const p = new Prompt();
  p.set('identity', PROMPTPART_GENERIC_PHASE_SYSTEM_IDENTITY_CORESTATEMENT);
  const active =
    ACTIVE_NAME[String(phaseName).toLowerCase()] ??
    PROMPTPART_GENERIC_PHASE_SYSTEM_ACTIVENAME_SETUP_DETAILCONTENT;
  p.set('name', active);
  p.set('contract', PROMPTPART_GENERIC_PHASE_SYSTEM_CONTRACT_DETAILCONTENT);
  return p;
}

export const EXECUTION_PIPELINE_SDIVF_EXECUTION_PHASE_PRIMITIVE_SETUP_PROMPT =
  factoryExecutionPipelineSDIVFExecutionPhasePrimitivePrompt('setup');
export const EXECUTION_PIPELINE_SDIVF_EXECUTION_PHASE_PRIMITIVE_DISCOVERY_PROMPT =
  factoryExecutionPipelineSDIVFExecutionPhasePrimitivePrompt('discovery');
export const EXECUTION_PIPELINE_SDIVF_EXECUTION_PHASE_PRIMITIVE_IMPLEMENTATION_PROMPT =
  factoryExecutionPipelineSDIVFExecutionPhasePrimitivePrompt('implementation');
export const EXECUTION_PIPELINE_SDIVF_EXECUTION_PHASE_PRIMITIVE_VALIDATION_PROMPT =
  factoryExecutionPipelineSDIVFExecutionPhasePrimitivePrompt('validation');
export const EXECUTION_PIPELINE_SDIVF_EXECUTION_PHASE_PRIMITIVE_FINISH_PROMPT =
  factoryExecutionPipelineSDIVFExecutionPhasePrimitivePrompt('finish');
