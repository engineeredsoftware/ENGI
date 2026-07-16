/**
 * Pipeline Execution Types - Clean pipeline-specific execution
 * 
 * Pipeline/PipelineExecution - The EE pair for top-level pipeline orchestration
 * PhaseDelegator/PhaseDelegation - The Executor/Execution pair for phase delegation to agents
 */

import type { Executor } from '@bitcode/execution-generics';
import { Execution } from '@bitcode/execution-generics/Execution';
import { ExecutionPrompt } from '@bitcode/execution-generics/prompts/ExecutionPrompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import {
  PipelineExecution as PipelineExecutionBase,
  type PipelineExecutionLineage,
  inferPipelineExecutionLineage
} from './PipelineExecution';

// Re-export the new PipelineExecution
export { PipelineExecution } from './PipelineExecution';

// ==================== PIPELINE (EE) ====================
/**
 * Pipeline - The top-level Executor that sequences Phases
 * Uses the new PipelineExecution with all registries
 */
export type Pipeline<TInput = any, TOutput = any> = 
  (input: TInput, execution: PipelineExecutionBase) => Promise<TOutput>;

// ==================== PHASE DELEGATOR ====================
/**
 * PhaseDelegator - An Executor that delegates work to Agents
 * Coordinates agent execution within a pipeline phase
 */
export type PhaseDelegator<TInput = any, TOutput = any> = Executor<TInput, TOutput>;

/**
 * PhaseDelegation - Execution state for a phase segment.
 * Owns an ExecutionPrompt (phase primitive/base/specific layers) and proxies
 * tools/llms/agents from the parent PipelineExecution.
 */
export class PhaseDelegation extends Execution {
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
export function factoryPipelineExecution(
  name: string,
  parent?: Execution,
  lineage?: PipelineExecutionLineage
): PipelineExecutionBase {
  return new PipelineExecutionBase(
    `pipeline:${name}`,
    parent,
    lineage ?? inferPipelineExecutionLineage(name)
  );
}

/**
 * Create phase delegation execution
 */
export function factoryPhaseDelegation(phase: string, parent: Execution): PhaseDelegation {
  return new PhaseDelegation(`phase:${phase}`, parent);
}
