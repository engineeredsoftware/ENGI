/**
 * Primitive phase Prompt — fully generic (any pipeline phase).
 * Assembled from raw_promptparts; phase name is a path detail, not a new part SSOT.
 */

import { Prompt } from '@bitcode/prompts/prompt';
import { createPromptPart } from '@bitcode/prompts/parts/PromptPart';
import { PROMPTPART_GENERIC_PHASE_SYSTEM_IDENTITY_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_phase_system_identity_corestatement';
import { PROMPTPART_GENERIC_PHASE_SYSTEM_CONTRACT_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_phase_system_contract_detailcontent';

export function factoryPrimitivePhasePrompt(phaseName: string): Prompt {
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

export const PRIMITIVE_PHASE_SETUP_PROMPT = factoryPrimitivePhasePrompt('setup');
export const PRIMITIVE_PHASE_DISCOVERY_PROMPT = factoryPrimitivePhasePrompt('discovery');
export const PRIMITIVE_PHASE_IMPLEMENTATION_PROMPT = factoryPrimitivePhasePrompt('implementation');
export const PRIMITIVE_PHASE_VALIDATION_PROMPT = factoryPrimitivePhasePrompt('validation');
export const PRIMITIVE_PHASE_FINISH_PROMPT = factoryPrimitivePhasePrompt('finish');
