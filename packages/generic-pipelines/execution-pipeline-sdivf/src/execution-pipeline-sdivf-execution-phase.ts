/**
 * ExecutionPipelineSDIVFExecutionPhase — EE node for one SDIVF phase segment.
 *
 * Hierarchy (full ancestry left→right):
 *   Execution (execution-generics)
 *     → ExecutionPipeline (pipelines-generics primitive)
 *       → ExecutionPipelineSDIVF (this package)
 *         → ExecutionPipelineSDIVFExecutionPhase (this module)
 *
 * Phases are exclusively an ExecutionPipelineSDIVF concept. They do not live
 * in @bitcode/pipelines-generics (primitives only: ExecutionPipeline EE).
 *
 * Owns an ExecutionPrompt (phase primitive/base/specific layers) and proxies
 * tools/llms/agents from the parent ExecutionPipeline.
 */

import type { Executor } from '@bitcode/execution-generics';
import { Execution } from '@bitcode/execution-generics/Execution';
import { ExecutionPrompt } from '@bitcode/execution-generics/prompts/ExecutionPrompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';

/**
 * ExecutionPipelineSDIVFExecutionPhaseDelegator — Executor that runs work for
 * one SDIVF phase (often coordinating agents under the phase EE).
 */
export type ExecutionPipelineSDIVFExecutionPhaseDelegator<
  TInput = any,
  TOutput = any,
> = Executor<TInput, TOutput>;

/**
 * Execution state for a single Setup | Discovery | Implementation | Validation | Finish
 * segment under an ExecutionPipelineSDIVF.
 */
export class ExecutionPipelineSDIVFExecutionPhase extends Execution {
  readonly prompt: ExecutionPrompt;

  constructor(id: string, parent?: Execution) {
    super(id, parent);
    this.prompt = new ExecutionPrompt();
    this.prompt.set('generic_system', ' ' as PromptPart);
    this.prompt.set('specific_execution', ' ' as PromptPart);
  }

  get tools(): any {
    let cur: any = this.parent;
    while (cur && !('tools' in cur)) cur = cur.parent;
    return cur?.tools;
  }
  get llms(): any {
    let cur: any = this.parent;
    while (cur && !('llms' in cur)) cur = cur.parent;
    return cur?.llms;
  }
  get agents(): any {
    let cur: any = this.parent;
    while (cur && !('agents' in cur)) cur = cur.parent;
    return cur?.agents;
  }
}

/**
 * factoryExecutionPipelineSDIVFExecutionPhase — create a phase EE under a pipeline.
 */
export function factoryExecutionPipelineSDIVFExecutionPhase(
  phase: string,
  parent: Execution,
): ExecutionPipelineSDIVFExecutionPhase {
  return new ExecutionPipelineSDIVFExecutionPhase(`phase:${phase}`, parent);
}
