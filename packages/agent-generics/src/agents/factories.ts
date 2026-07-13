/**
 * Agent primitive factories (non-PTRR).
 *
 * PTRR base (`factoryPTRRAgent`) lives in `@bitcode/generic-agents-ptrr`
 * and is re-exported from this package's root index — not from this file —
 * to avoid load cycles.
 *
 * @doc-code
 * type: agent-factories
 * purpose: Create type-safe agent executors
 * pattern: factory-functions
 */

import type { Executor } from '@bitcode/execution-generics';
import type { Execution } from '@bitcode/execution-generics/Execution';
import {
  AgentExecution,
  StepExecution
} from '../execution';
import { Agent, AgentStep, AgentVariationStep } from '../types';

// ==================== PTRR base (prefer @bitcode/generic-agents-ptrr) ====================
// Deep-import surface (`@bitcode/agent-generics/agents/factories`).
// Safe: PTRR factory does not import this file (only steps/execution/types).

export {
  factoryPTRRAgent,
  factoryPTRRAgentWithGenerations,
  type PTRRAgent,
  type BitcodePTRRFactoryConfig,
  type BitcodePTRRPromptCarrier,
  type BitcodePTRRPromptValue,
  type BitcodePTRRStepName,
  type BitcodePTRRStepPromptCarrier,
  type BitcodePTRRStepPromptRegistry,
} from '@bitcode/generic-agents-ptrr';

// ==================== AGENT FACTORY ====================

/**
 * Create an Agent - Builds an executor that sequences arbitrary steps
 */
export function factoryAgent<TInput = any, TOutput = any>(config: {
  name: string;
  description?: string;
  steps: AgentStep<any, any>[];
}): Agent<TInput, TOutput> {
  const executor = async (input: TInput, execution: Execution) => {
    const agentExec = new AgentExecution(`agent:${config.name}`, execution);
    try { agentExec.store('agent', 'name', config.name); } catch {}

    agentExec.store('agent', 'name', config.name);
    agentExec.store('agent', 'startTime', Date.now());

    let result: any = input;
    for (const step of config.steps) {
      result = await step(result, agentExec);
    }

    agentExec.store('agent', 'endTime', Date.now());
    agentExec.store('agent', 'output', result as any);

    return result;
  };

  Object.defineProperty(executor, 'name', {
    value: config.name,
    writable: false,
    enumerable: true,
    configurable: true
  });

  const agent = Object.assign(executor, {
    description: config.description,
    steps: config.steps,
    generations: config.steps
  }) as Agent<TInput, TOutput>;

  return agent;
}

// ==================== AGENT WITH SINGLE STEP FACTORY ====================

export function factoryAgentWithSingleStep<TInput, TOutput>(config: {
  name: string;
  description?: string;
  execute: (input: TInput, execution: Execution) => Promise<TOutput>;
}): Agent<TInput, TOutput> {
  const stepExecutor: Executor<TInput, TOutput> = async (input, execution) => {
    const stepExec = new StepExecution('execute', execution);
    return await config.execute(input, stepExec);
  };

  const step = Object.assign(stepExecutor, {
    type: AgentVariationStep.TRY,
    description: config.description || 'Direct execution'
  }) as AgentStep<TInput, TOutput>;

  const executor: Executor<TInput, TOutput> = async (input, execution) => {
    const agentExec = new AgentExecution(config.name, execution);

    agentExec.store('agent', 'name', config.name);
    agentExec.store('agent', 'startTime', Date.now());

    const result = await step(input, agentExec);

    agentExec.store('agent', 'endTime', Date.now());
    agentExec.store('agent', 'output', result as any);

    return result;
  };

  Object.defineProperty(executor, 'name', {
    value: config.name,
    writable: false,
    enumerable: true,
    configurable: true
  });

  const agent = Object.assign(executor, {
    description: config.description,
    steps: [step],
    generations: [step]
  }) as Agent<TInput, TOutput>;

  return agent;
}

// ==================== AGENT WITH GENERATIONS ====================

export function factoryAgentWithGenerations<TInput, TOutput>(config: {
  name: string;
  description?: string;
  generations: AgentStep<any, any>[];
}): Agent<TInput, TOutput> {
  const executor = async (input: TInput, execution: Execution) => {
    const agentExec = new AgentExecution(`agent:${config.name}`, execution);
    agentExec.store('agent', 'name', config.name);
    agentExec.store('agent', 'startTime', Date.now());
    let result: any = input;
    for (const gen of config.generations) {
      result = await gen(result, agentExec);
    }
    agentExec.store('agent', 'endTime', Date.now());
    agentExec.store('agent', 'output', result as any);
    return result;
  };
  Object.defineProperty(executor, 'name', { value: config.name, writable: false, enumerable: true, configurable: true });
  return Object.assign(executor, {
    description: config.description,
    generations: config.generations,
    steps: config.generations
  }) as Agent<TInput, TOutput>;
}

// ==================== QUICK AGENT FACTORY ====================

export function factoryQuickAgent<TInput, TOutput>(config: {
  name: string;
  description?: string;
  execute: (input: TInput, execution: Execution) => Promise<TOutput>;
}) {
  const stepExecutor: Executor<TInput, TOutput> = async (input, execution) => {
    const stepExec = new StepExecution('execute', execution);
    return await config.execute(input, stepExec);
  };

  const executor = (async (input, execution) => {
    const agentExec = new AgentExecution(config.name, execution);
    try {
      agentExec.store('agent', 'name', config.name);
      agentExec.store('agent', 'startTime', Date.now());
    } catch {}
    const result = await stepExecutor(input, agentExec);
    try {
      agentExec.store('agent', 'endTime', Date.now());
      agentExec.store('agent', 'output', result as any);
    } catch {}
    return result;
  }) as Executor<TInput, TOutput>;

  Object.defineProperty(executor, 'name', {
    value: config.name,
    writable: false,
    enumerable: true,
    configurable: true
  });

  (executor as any).description = config.description;
  (executor as any).kind = 'quick-agent';

  return executor;
}
