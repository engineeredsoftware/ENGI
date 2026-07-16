/**
 * ExecutionPipelineSDIVFExecutionPhaseRunner — agent-sequence runner for one phase.
 *
 * Builds on ExecutionPipelineExecutor (pipelines-generics primitive) with
 * SDIVF phase-oriented config. Product phases (setup/discovery/…) use this.
 */

import type { Executor } from '@bitcode/execution-generics';
import type { ShortCircuitSignal } from '@bitcode/execution-generics';
import {
  ExecutionPipelineExecutor,
  type AgentStep,
  type PhaseResult,
} from '@bitcode/pipelines-generics/execution/ExecutionPipelineExecutor';
import type { ExecutionPipeline } from '@bitcode/pipelines-generics/execution/execution-pipeline-types';

export type { AgentStep, PhaseResult };

/**
 * Config for running a registered-agent sequence inside one SDIVF phase.
 */
export interface ExecutionPipelineSDIVFExecutionPhaseRunnerConfig {
  phaseName: string;
  sequence: AgentStep[];
  allowShortCircuit?: boolean;
  shortCircuitHandler?: (signal: ShortCircuitSignal) => Promise<void>;
}

/**
 * factoryExecutionPipelineSDIVFExecutionPhaseRunner — Executor that runs
 * PhaseConfig agent steps via ExecutionPipelineExecutor.
 */
export function factoryExecutionPipelineSDIVFExecutionPhaseRunner(
  config: ExecutionPipelineSDIVFExecutionPhaseRunnerConfig,
): Executor<any, PhaseResult> {
  return async (input: any, execution: any): Promise<PhaseResult> => {
    const executor = new ExecutionPipelineExecutor(execution as ExecutionPipeline);
    return await executor.executePhase(config, input);
  };
}
