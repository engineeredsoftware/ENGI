/**
 * Phase Factory - Creates ExecutionPhaseDelegator Executors that delegate to Agents
 *
 * PhaseDelegators are Executors that coordinate agent execution within
 * a pipeline phase. They delegate work to agents and accumulate results.
 *
 * The generic phase abstraction is reusable (ExecutionPhaseDelegator factories).
 * The SDIVF base pipeline (Setup-[DIV]*-Finish) lives in
 * `@bitcode/generic-pipelines-execution-pipeline-sdivf`, not in this primitive package.
 */

import { sequential, parallel } from '@bitcode/execution-generics';
import type { Executor } from '@bitcode/execution-generics';
import type { Execution } from '@bitcode/execution-generics/Execution';
import { Agent } from '@bitcode/agent-generics';
import { ExecutionPhase, factoryExecutionPhase } from '../execution/pipeline-types';

// ==================== PHASE DELEGATOR ====================

/**
 * ExecutionPhaseDelegator - An Executor that delegates to Agents
 */
export type ExecutionPhaseDelegator<TInput = any, TOutput = any> = Executor<TInput, TOutput>;

/**
 * Create a ExecutionPhaseDelegator that delegates to a single Agent
 */
export function factoryPhaseDelegator<TInput, TOutput>(
  name: string,
  agent: Agent<TInput, TOutput>
): ExecutionPhaseDelegator<TInput, TOutput> {
  return async (input: TInput, execution: Execution): Promise<TOutput> => {
    // Create phase delegation
    const phaseDelegation = factoryExecutionPhase(name, execution);
    
    // Store phase metadata
    phaseDelegation.store('phase', 'name', name);
    phaseDelegation.store('phase', 'startTime', Date.now());
    
    // Delegate to agent
    const result = await agent(input, phaseDelegation);
    
    // Store completion
    phaseDelegation.store('phase', 'endTime', Date.now());
    phaseDelegation.store('phase', 'output', result as any);
    
    return result;
  };
}

/**
 * Create a ExecutionPhaseDelegator that delegates to multiple Agents in sequence
 */
export function factorySequentialPhaseDelegator<TInput, TOutput>(
  name: string,
  agents: Agent<any, any>[]
): ExecutionPhaseDelegator<TInput, TOutput> {
  return async (input: TInput, execution: Execution): Promise<TOutput> => {
    // Create phase delegation
    const phaseDelegation = factoryExecutionPhase(name, execution);
    
    // Store phase metadata
    phaseDelegation.store('phase', 'name', name);
    phaseDelegation.store('phase', 'startTime', Date.now());
    phaseDelegation.store('phase', 'agentCount', agents.length);
    
    // Create sequential executor from agents
    const sequentialAgents = sequential(...agents);
    
    // Execute agents in sequence
    const result = await sequentialAgents(input, phaseDelegation);
    
    // Store completion
    phaseDelegation.store('phase', 'endTime', Date.now());
    phaseDelegation.store('phase', 'output', result as any);
    
    return result as TOutput;
  };
}

/**
 * Create a ExecutionPhaseDelegator that delegates to multiple Agents in parallel
 */
export function factoryParallelPhaseDelegator<TInput, TOutput>(
  name: string,
  agents: Agent<TInput, any>[],
  combiner: (results: any[]) => TOutput
): ExecutionPhaseDelegator<TInput, TOutput> {
  return async (input: TInput, execution: Execution): Promise<TOutput> => {
    // Create phase delegation
    const phaseDelegation = factoryExecutionPhase(name, execution);
    
    // Store phase metadata
    phaseDelegation.store('phase', 'name', name);
    phaseDelegation.store('phase', 'startTime', Date.now());
    phaseDelegation.store('phase', 'agentCount', agents.length);
    phaseDelegation.store('phase', 'parallel', true);
    
    // Create parallel executor from agents
    const parallelAgents = parallel(...agents);
    
    // Execute agents in parallel
    const results = await parallelAgents(input, phaseDelegation);
    
    // Combine results
    const output = combiner(results);
    
    // Store completion
    phaseDelegation.store('phase', 'endTime', Date.now());
    phaseDelegation.store('phase', 'output', output as any);
    
    return output;
  };
}
