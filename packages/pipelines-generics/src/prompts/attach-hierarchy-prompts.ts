/**
 * Attach primitive → base → specific Prompt layers onto pipeline / phase EEs.
 *
 * Law: pipeline layers must land on an **ancestor** of every phase/agent node
 * so `buildHierarchicalPrompt` sees them. Sequential composition uses
 * `execution.child('seq-N')` — attaching only on the attach-step's seq child
 * leaves pipeline text off the wire for later seq siblings. Prefer the root
 * PipelineExecution (or greatest parent with an ExecutionPrompt).
 */

import type { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { ExecutionPrompt } from '@bitcode/execution-generics/prompts/ExecutionPrompt';
import { applyPromptRegistryToExecutionPrompt } from './compose-execution-prompt';
import { PRIMITIVE_PIPELINE_PROMPT } from './primitive-pipeline-prompt';
import {
  factoryPrimitivePhasePrompt,
  PRIMITIVE_PHASE_SETUP_PROMPT,
} from './primitive-phase-prompt';

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
 * Host for pipeline-level system text: nearest PipelineExecution-like node
 * (has `.prompt` + agent registry), else the greatest parent (root).
 *
 * Sequential SDIVF steps receive `child(seq-N)`; pipeline attach must not
 * stay on that ephemeral child or later phases never inherit the layers.
 */
export function resolvePipelinePromptHost(execution: any): any {
  if (!execution) return execution;
  let cur: any = execution;
  let pipelineLike: any = null;
  let root: any = execution;
  while (cur) {
    root = cur;
    const hasPrompt = cur.prompt instanceof ExecutionPrompt;
    const hasAgents =
      cur.agents && typeof cur.agents.getAgent === 'function';
    if (hasPrompt && hasAgents) {
      pipelineLike = cur;
    }
    cur = cur.parent;
  }
  return pipelineLike || root || execution;
}

/**
 * Attach pipeline-level layers (primitive always; optional base + specific).
 * Call once when the pipeline EE is created / SDIVF starts.
 * Always resolves to the pipeline root host (see resolvePipelinePromptHost).
 */
export function attachPipelinePromptHierarchy(
  pipelineExec: any,
  layers?: {
    base?: Prompt | null;
    specific?: Prompt | null;
  },
): void {
  const host = resolvePipelinePromptHost(pipelineExec);
  const target = ensureNodePrompt(host);
  applyPromptRegistryToExecutionPrompt(target, PRIMITIVE_PIPELINE_PROMPT, {
    namespace: 'pipeline:primitive',
  });
  if (layers?.base) {
    applyPromptRegistryToExecutionPrompt(target, layers.base, {
      namespace: 'pipeline:base',
    });
  }
  if (layers?.specific) {
    applyPromptRegistryToExecutionPrompt(target, layers.specific, {
      namespace: 'pipeline:specific',
    });
  }
}

/**
 * Attach phase-level layers for the active phase name.
 * Call when entering a phase (on the phase EE or pipeline EE).
 */
export function attachPhasePromptHierarchy(
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
      ? PRIMITIVE_PHASE_SETUP_PROMPT
      : factoryPrimitivePhasePrompt(phaseName);
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
}
