/**
 * Factories for ExecutionPipelineSDIVFExecutionPhaseDelegator executors.
 *
 * PhaseDelegators coordinate agent (or other executor) work inside one
 * ExecutionPipelineSDIVF phase. They create a phase EE, store phase metadata,
 * and delegate to agent(s).
 *
 * Hierarchy: owned by @bitcode/generic-pipelines-execution-pipeline-sdivf only.
 */

import { sequential, parallel } from '@bitcode/execution-generics';
import type { Execution } from '@bitcode/execution-generics/Execution';
import { Agent } from '@bitcode/agent-generics';
import {
  type ExecutionPipelineSDIVFExecutionPhaseDelegator,
  factoryExecutionPipelineSDIVFExecutionPhase,
} from './execution-pipeline-sdivf-execution-phase';

/**
 * Single-agent phase delegator under an ExecutionPipelineSDIVF.
 */
export function factoryExecutionPipelineSDIVFExecutionPhaseDelegator<TInput, TOutput>(
  name: string,
  agent: Agent<TInput, TOutput>,
): ExecutionPipelineSDIVFExecutionPhaseDelegator<TInput, TOutput> {
  return async (input: TInput, execution: Execution): Promise<TOutput> => {
    const phaseDelegation = factoryExecutionPipelineSDIVFExecutionPhase(name, execution);

    phaseDelegation.store('phase', 'name', name);
    phaseDelegation.store('phase', 'startTime', Date.now());

    const result = await agent(input, phaseDelegation);

    phaseDelegation.store('phase', 'endTime', Date.now());
    phaseDelegation.store('phase', 'output', result as any);

    return result;
  };
}

/**
 * Sequential multi-agent phase delegator under an ExecutionPipelineSDIVF.
 */
export function factoryExecutionPipelineSDIVFSequentialExecutionPhaseDelegator<
  TInput,
  TOutput,
>(
  name: string,
  agents: Agent<any, any>[],
): ExecutionPipelineSDIVFExecutionPhaseDelegator<TInput, TOutput> {
  return async (input: TInput, execution: Execution): Promise<TOutput> => {
    const phaseDelegation = factoryExecutionPipelineSDIVFExecutionPhase(name, execution);

    phaseDelegation.store('phase', 'name', name);
    phaseDelegation.store('phase', 'startTime', Date.now());
    phaseDelegation.store('phase', 'agentCount', agents.length);

    const sequentialAgents = sequential(...agents);
    const result = await sequentialAgents(input, phaseDelegation);

    phaseDelegation.store('phase', 'endTime', Date.now());
    phaseDelegation.store('phase', 'output', result as any);

    return result as TOutput;
  };
}

/**
 * Parallel multi-agent phase delegator under an ExecutionPipelineSDIVF.
 */
export function factoryExecutionPipelineSDIVFParallelExecutionPhaseDelegator<
  TInput,
  TOutput,
>(
  name: string,
  agents: Agent<TInput, any>[],
  combiner: (results: any[]) => TOutput,
): ExecutionPipelineSDIVFExecutionPhaseDelegator<TInput, TOutput> {
  return async (input: TInput, execution: Execution): Promise<TOutput> => {
    const phaseDelegation = factoryExecutionPipelineSDIVFExecutionPhase(name, execution);

    phaseDelegation.store('phase', 'name', name);
    phaseDelegation.store('phase', 'startTime', Date.now());
    phaseDelegation.store('phase', 'agentCount', agents.length);
    phaseDelegation.store('phase', 'parallel', true);

    const parallelAgents = parallel(...agents);
    const results = await parallelAgents(input, phaseDelegation);
    const output = combiner(results);

    phaseDelegation.store('phase', 'endTime', Date.now());
    phaseDelegation.store('phase', 'output', output as any);

    return output;
  };
}
