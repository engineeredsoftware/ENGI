/**
 * Attach call-site Prompt layers onto pipeline Execution nodes.
 *
 * Organization:
 *   - compose / apply / Execution primitive → @bitcode/execution-generics
 *   - pipeline primitive Prompt assembly → this package
 *   - phase attach (SDIVF-only) → @bitcode/generic-pipelines-execution-pipeline-sdivf
 *   - base (SDIVF) / specific (product) → generic-pipelines / asset-packs-pipelines
 *
 * Law (.docs/PROMPTING.md):
 *   - Pipeline node composes Execution ⊕ Pipeline ⊕ base ⊕ specific **once**
 *   - Phase node composes Phase ⊕ base ⊕ specific only (no Execution re-emit)
 *     — see attachExecutionPipelineSDIVFExecutionPhasePromptHierarchy
 *   - Attach pipeline layers on root ExecutionPipeline (not seq-N child)
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
import { EXECUTION_PIPELINE_PRIMITIVE_PROMPT } from './execution-pipeline-primitive-prompt';

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
 * Host for pipeline-level system text: nearest ExecutionPipeline-like node
 * (has `.prompt` + agent registry), else the greatest parent (root).
 */
export function resolveExecutionPipelinePromptHost(execution: any): any {
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
export function attachExecutionPipelinePromptHierarchy(
  pipelineExec: any,
  layers?: {
    base?: Prompt | null;
    specific?: Prompt | null;
  },
): void {
  const host = resolveExecutionPipelinePromptHost(pipelineExec);
  const target = ensureNodePrompt(host);

  // Also apply layered paths for hierarchicalFormatter / path audits
  applyPromptRegistryToExecutionPrompt(target, PRIMITIVE_EXECUTION_SYSTEM_PROMPT, {
    namespace: 'execution:primitive',
  });
  applyPromptRegistryToExecutionPrompt(target, EXECUTION_PIPELINE_PRIMITIVE_PROMPT, {
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
    { namespace: 'pipeline:primitive', prompt: EXECUTION_PIPELINE_PRIMITIVE_PROMPT },
    { namespace: 'pipeline:base', prompt: layers?.base ?? null },
    { namespace: 'pipeline:specific', prompt: layers?.specific ?? null },
  ]);
  applyComposedCallSiteNodePrompt(target, composed, 'pipeline', {
    includesExecution: true,
  });
}
