/**
 * ExecutionPipeline types — hierarchy naming law:
 * anything based on the Execution primitive encodes full ancestry
 * (e.g. ExecutionPipeline, ExecutionPhase, ExecutionPhaseDelegator).
 *
 * ExecutionPipeline — EE for top-level pipeline orchestration
 * ExecutionPhaseDelegator / ExecutionPhase — Executor/Execution pair for phases
 */

import type { Executor } from '@bitcode/execution-generics';
import { Execution } from '@bitcode/execution-generics/Execution';
import { ExecutionPrompt } from '@bitcode/execution-generics/prompts/ExecutionPrompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import {
  ExecutionPipeline,
  type ExecutionPipelineLineage,
  inferExecutionPipelineLineage
} from './ExecutionPipeline';

// Re-export the pipeline EE class
export { ExecutionPipeline } from './ExecutionPipeline';

// Executor form of ExecutionPipeline lives in execution-pipeline-factory.ts
// as ExecutionPipelineFn (Executor-typed).

// ==================== PHASE DELEGATOR ====================
/**
 * ExecutionPhaseDelegator - An Executor that delegates work to Agents
 * Coordinates agent execution within a pipeline phase
 */
export type ExecutionPhaseDelegator<TInput = any, TOutput = any> = Executor<TInput, TOutput>;

/**
 * ExecutionPhase - Execution state for a phase segment.
 * Owns an ExecutionPrompt (phase primitive/base/specific layers) and proxies
 * tools/llms/agents from the parent ExecutionPipeline.
 */
export class ExecutionPhase extends Execution {
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

// ==================== FACTORY FUNCTIONS ====================
/**
 * Create a pipeline execution
 */
export function factoryExecutionPipeline(
  name: string,
  parent?: Execution,
  lineage?: ExecutionPipelineLineage
): ExecutionPipeline {
  return new ExecutionPipeline(
    `pipeline:${name}`,
    parent,
    lineage ?? inferExecutionPipelineLineage(name)
  );
}

/**
 * Create phase delegation execution
 */
export function factoryExecutionPhase(phase: string, parent: Execution): ExecutionPhase {
  return new ExecutionPhase(`phase:${phase}`, parent);
}
