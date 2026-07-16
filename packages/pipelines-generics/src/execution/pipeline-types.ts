/**
 * Pipeline Execution Types - Clean pipeline-specific execution
 * 
 * Pipeline/ExecutionPipeline - The EE pair for top-level pipeline orchestration
 * ExecutionPhaseDelegator/ExecutionPhase - The Executor/Execution pair for phase delegation to agents
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

// ==================== PIPELINE (EE) ====================
/**
 * Pipeline - The top-level Executor that sequences Phases
 * Uses ExecutionPipeline with all registries
 */
export type Pipeline<TInput = any, TOutput = any> = 
  (input: TInput, execution: ExecutionPipeline) => Promise<TOutput>;

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
