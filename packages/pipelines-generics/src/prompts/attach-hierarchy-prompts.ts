/**
 * Attach call-site Prompt layers onto pipeline / phase Execution nodes.
 *
 * Organization:
 *   - compose / apply / Execution primitive → @bitcode/execution-generics
 *   - pipeline/phase primitive Prompt assembly → this package
 *   - base (SDIVF) / specific (product) → generic-pipelines / asset-packs-pipelines
 *
 * Law (.docs/PROMPTING.md):
 *   - Pipeline node composes Execution ⊕ Pipeline ⊕ base ⊕ specific **once**
 *   - Phase node composes Phase ⊕ base ⊕ specific only (no Execution re-emit)
 *   - Attach pipeline layers on root PipelineExecution (not seq-N child)
 */

import type { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { ExecutionPrompt } from '@bitcode/execution-generics/prompts/ExecutionPrompt';
import {
  applyComposedCallSiteNodePrompt,
  applyPromptRegistryToExecutionPrompt,
  composeNamespacedPromptLayers,
  PRIMITIVE_EXECUTION_SYSTEM_PROMPT,
} from '@bitcode/execution-generics';
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
 * Attach pipeline call-site block:
 *   Execution ⊕ Pipeline primitive ⊕ optional base ⊕ optional specific
 * as one composed PromptPart (includes_execution marker set).
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

  // Also apply layered paths for hierarchicalFormatter / path audits
  applyPromptRegistryToExecutionPrompt(target, PRIMITIVE_EXECUTION_SYSTEM_PROMPT, {
    namespace: 'execution:primitive',
  });
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

  // Canonical call-site node block (Execution once; namespaced so layers
  // do not clobber each other on identity/contract paths).
  const composed = composeNamespacedPromptLayers([
    { namespace: 'execution', prompt: PRIMITIVE_EXECUTION_SYSTEM_PROMPT },
    { namespace: 'pipeline:primitive', prompt: PRIMITIVE_PIPELINE_PROMPT },
    { namespace: 'pipeline:base', prompt: layers?.base ?? null },
    { namespace: 'pipeline:specific', prompt: layers?.specific ?? null },
  ]);
  applyComposedCallSiteNodePrompt(target, composed, 'pipeline', {
    includesExecution: true,
  });
}

/**
 * Attach phase call-site block (no Execution layer).
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

  const composed = composeNamespacedPromptLayers([
    { namespace: `phase:primitive:${phaseName}`, prompt: primitive },
    { namespace: `phase:base:${phaseName}`, prompt: layers?.base ?? null },
    { namespace: `phase:specific:${phaseName}`, prompt: layers?.specific ?? null },
  ]);
  applyComposedCallSiteNodePrompt(target, composed, `phase:${phaseName}`);
}
