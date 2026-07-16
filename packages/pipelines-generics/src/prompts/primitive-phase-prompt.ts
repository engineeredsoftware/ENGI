/**
 * Primitive phase Prompt — fully generic (any pipeline phase).
 */

import { Prompt } from '@bitcode/prompts/prompt';
import { createPromptPart } from '@bitcode/prompts/parts/PromptPart';

export function factoryPrimitivePhasePrompt(phaseName: string): Prompt {
  const p = new Prompt();
  p.set(
    'identity',
    createPromptPart(
      `You are in pipeline phase "${phaseName}": a named segment of the pipeline that coordinates agents toward that phase's objective before control returns to the pipeline shell.`,
    ),
  );
  p.set(
    'contract',
    createPromptPart(
      'Phase law: complete only this phase\'s objective; store cross-phase artifacts for later phases; do not assume later phases have already run.',
    ),
  );
  return p;
}

export const PRIMITIVE_PHASE_SETUP_PROMPT = factoryPrimitivePhasePrompt('setup');
export const PRIMITIVE_PHASE_DISCOVERY_PROMPT = factoryPrimitivePhasePrompt('discovery');
export const PRIMITIVE_PHASE_IMPLEMENTATION_PROMPT = factoryPrimitivePhasePrompt('implementation');
export const PRIMITIVE_PHASE_VALIDATION_PROMPT = factoryPrimitivePhasePrompt('validation');
export const PRIMITIVE_PHASE_FINISH_PROMPT = factoryPrimitivePhasePrompt('finish');
