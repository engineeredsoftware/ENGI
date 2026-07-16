/**
 * Primitive phase Prompt — fully generic (any pipeline phase).
 * Assembled from raw_promptparts; phase name is a path detail, not a new part SSOT.
 */

import { Prompt } from '@bitcode/prompts/prompt';
import { createPromptPart } from '@bitcode/prompts/parts/PromptPart';
import { PROMPTPART_GENERIC_PHASE_SYSTEM_IDENTITY_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_phase_system_identity_corestatement';
import { PROMPTPART_GENERIC_PHASE_SYSTEM_CONTRACT_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_phase_system_contract_detailcontent';

export function factoryExecutionPhasePrimitivePrompt(phaseName: string): Prompt {
  const p = new Prompt();
  p.set('identity', PROMPTPART_GENERIC_PHASE_SYSTEM_IDENTITY_CORESTATEMENT);
  p.set(
    'name',
    createPromptPart(
      `Active phase name: "${phaseName}". Coordinate only this phase's objective.`,
    ),
  );
  p.set('contract', PROMPTPART_GENERIC_PHASE_SYSTEM_CONTRACT_DETAILCONTENT);
  return p;
}

export const EXECUTION_PHASE_PRIMITIVE_SETUP_PROMPT = factoryExecutionPhasePrimitivePrompt('setup');
export const EXECUTION_PHASE_PRIMITIVE_DISCOVERY_PROMPT = factoryExecutionPhasePrimitivePrompt('discovery');
export const EXECUTION_PHASE_PRIMITIVE_IMPLEMENTATION_PROMPT = factoryExecutionPhasePrimitivePrompt('implementation');
export const EXECUTION_PHASE_PRIMITIVE_VALIDATION_PROMPT = factoryExecutionPhasePrimitivePrompt('validation');
export const EXECUTION_PHASE_PRIMITIVE_FINISH_PROMPT = factoryExecutionPhasePrimitivePrompt('finish');
