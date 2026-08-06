/**
 * Attach call-site Prompt layers onto an ExecutionPipelineSDIVFExecutionPhase node.
 *
 * Law (.docs/PROMPTING.md):
 *   - Pipeline node composes Execution ⊕ Pipeline ⊕ base ⊕ specific **once**
 *     (attachExecutionPipelinePromptHierarchy in pipelines-generics)
 *   - Phase node composes Phase ⊕ base ⊕ specific only (no Execution re-emit)
 *
 * Hierarchy ownership:
 *   - pipeline attach → @bitcode/pipelines-generics (primitive)
 *   - phase attach → this package (SDIVF-only concept)
 */

import type { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { ExecutionPrompt } from '@bitcode/execution-generics/prompts/ExecutionPrompt';
import {
  applyComposedCallSiteNodePrompt,
  applyPromptRegistryToExecutionPrompt,
  composeNamespacedPromptLayers,
} from '@bitcode/execution-generics';
import {
  factoryExecutionPipelineSDIVFExecutionPhasePrimitivePrompt,
  EXECUTION_PIPELINE_SDIVF_EXECUTION_PHASE_PRIMITIVE_SETUP_PROMPT,
} from './execution-pipeline-sdivf-execution-phase-primitive-prompt';

function ensureNodePrompt(execution: any): ExecutionPrompt {
  if (execution.prompt instanceof ExecutionPrompt) {
    return execution.prompt;
  }
  const prompt = new ExecutionPrompt();
  prompt.set('generic_system', ' ' as PromptPart);
  prompt.set('specific_execution', ' ' as PromptPart);
  try {
    execution.prompt = prompt;
  } catch {
    /* some frozen hosts */
  }
  return prompt;
}

/**
 * Attach ExecutionPipelineSDIVFExecutionPhase call-site block (no Execution layer).
 */
export function attachExecutionPipelineSDIVFExecutionPhasePromptHierarchy(
  phaseExec: any,
  phaseName: string,
  layers?: {
    base?: Prompt | null;
    specific?: Prompt | null;
  },
): void {
  const target = ensureNodePrompt(phaseExec);
  const primitive =
    phaseName === 'setup'
      ? EXECUTION_PIPELINE_SDIVF_EXECUTION_PHASE_PRIMITIVE_SETUP_PROMPT
      : factoryExecutionPipelineSDIVFExecutionPhasePrimitivePrompt(phaseName);

  applyPromptRegistryToExecutionPrompt(target, primitive, {
    namespace: `phase:primitive:${phaseName}`,
  });
  if (layers?.base) {
    applyPromptRegistryToExecutionPrompt(target, layers.base, {
      namespace: `phase:base:${phaseName}`,
    });
  }
  if (layers?.specific) {
    applyPromptRegistryToExecutionPrompt(target, layers.specific, {
      namespace: `phase:specific:${phaseName}`,
    });
  }

  const composed = composeNamespacedPromptLayers([
    { namespace: `phase:primitive:${phaseName}`, prompt: primitive },
    { namespace: `phase:base:${phaseName}`, prompt: layers?.base ?? null },
    { namespace: `phase:specific:${phaseName}`, prompt: layers?.specific ?? null },
  ]);
  applyComposedCallSiteNodePrompt(target, composed, `phase:${phaseName}`);
}
