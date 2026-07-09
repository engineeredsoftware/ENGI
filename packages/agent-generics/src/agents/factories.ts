/**
 * Agent Factories - Factory functions for agents
 * 
 * These factories create agent executors that implement
 * the PTRR pattern with 7 substeps.
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
import { factoryPlanStep, factoryTryStep, factoryRefineStep, factoryRetryStep } from '../steps/factories';
import { PlanStepOutputSchema } from '../steps/step-schemas';
import { z } from 'zod';

export type BitcodePTRRStepName = 'plan' | 'try' | 'refine' | 'retry';
export type BitcodePTRRPromptValue = any;
export type BitcodePTRRStepPromptCarrier = BitcodePTRRPromptValue | (() => BitcodePTRRPromptValue);
export type BitcodePTRRStepPromptRegistry = {
  plan: BitcodePTRRStepPromptCarrier;
  try: BitcodePTRRStepPromptCarrier;
  refine: BitcodePTRRStepPromptCarrier;
  retry: BitcodePTRRStepPromptCarrier;
};

type BitcodePTRRPrimaryPromptCarrier = {
  prompt: BitcodePTRRPromptValue;
  stepPrompts: BitcodePTRRStepPromptRegistry;
  prompts?: never;
};

type BitcodePTRRCompactPromptCarrier = {
  prompt?: never;
  stepPrompts?: never;
  prompts: BitcodePTRRStepPromptRegistry & {
    system: BitcodePTRRPromptValue;
  };
};

export type BitcodePTRRPromptCarrier =
  | BitcodePTRRPrimaryPromptCarrier
  | BitcodePTRRCompactPromptCarrier;

export type BitcodePTRRFactoryConfig<TOutput> = BitcodePTRRPromptCarrier & {
  name: string;
  description?: string;
  outputSchema: z.ZodType<TOutput>;
  tools?: any[];
  requiredTools?: string[];
  enforceLLM?: boolean;
  // Step outputs validate against STEP schemas, not the full agent schema:
  // each step's `outputSchema` overrides its canonical default — Plan
  // defaults to `PlanStepOutputSchema` (the execution strategy the Plan
  // objective asks for); Try/Refine/Retry default to the agent's
  // `outputSchema` (their job IS the typed output, and the agent's result is
  // the last step's output).
  plan?: {
    chunkThreshold?: number;
    outputSchema?: z.ZodType<any>;
  };
  try?: {
    chunkThreshold?: number;
    enableParallelChunks?: boolean;
    outputSchema?: z.ZodType<any>;
  };
  refine?: {
    maxAttempts?: number;
    outputSchema?: z.ZodType<any>;
  };
  retry?: {
    maxAttempts?: number;
    backoff?: number;
    outputSchema?: z.ZodType<any>;
  };
};

const BITCODE_PTRR_STEP_NAMES: BitcodePTRRStepName[] = ['plan', 'try', 'refine', 'retry'];

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

function assertBitcodePTRRPromptCarrier(config: BitcodePTRRFactoryConfig<any>): BitcodePTRRStepPromptRegistry {
  const configRecord = config as any;
  const hasPrimaryPrompt = configRecord.prompt !== undefined && configRecord.prompt !== null;
  const hasPrimaryStepPrompts = isObjectRecord(configRecord.stepPrompts);
  const hasCompactPromptCarrier =
    isObjectRecord(configRecord.prompts)
    && configRecord.prompts.system !== undefined
    && configRecord.prompts.system !== null;

  if (hasPrimaryStepPrompts && isObjectRecord(configRecord.prompts)) {
    throw new Error(
      'factoryAgentWithPTRR accepts one Bitcode prompt carrier: use `prompt` + `stepPrompts`, or compact `prompts.system` + plan/try/refine/retry.'
    );
  }

  if (!(hasPrimaryPrompt && hasPrimaryStepPrompts) && !hasCompactPromptCarrier) {
    throw new Error(
      'factoryAgentWithPTRR requires a Bitcode Registry-backed prompt carrier: provide `prompt` + complete `stepPrompts`, or compact `prompts.system` + plan/try/refine/retry.'
    );
  }

  const stepPrompts = (hasCompactPromptCarrier ? configRecord.prompts : configRecord.stepPrompts) as Record<string, unknown>;
  const missingStepPrompts = BITCODE_PTRR_STEP_NAMES.filter((stepName) =>
    stepPrompts[stepName] === undefined || stepPrompts[stepName] === null
  );

  if (missingStepPrompts.length > 0) {
    throw new Error(
      `factoryAgentWithPTRR Bitcode prompt carrier is missing ${missingStepPrompts.join(', ')} step Prompt registries.`
    );
  }

  return stepPrompts as BitcodePTRRStepPromptRegistry;
}

function resolveBitcodePTRRStepPrompt(
  stepName: BitcodePTRRStepName,
  stepPrompt: BitcodePTRRStepPromptCarrier
): BitcodePTRRPromptValue {
  const resolvedPrompt = typeof stepPrompt === 'function' ? stepPrompt() : stepPrompt;

  if (resolvedPrompt === undefined || resolvedPrompt === null) {
    throw new Error(
      `factoryAgentWithPTRR ${stepName} step Prompt registry resolved to an empty value.`
    );
  }

  return resolvedPrompt;
}

function resolveBitcodePTRRAgentPrompt(config: BitcodePTRRFactoryConfig<any>): BitcodePTRRPromptValue {
  const configRecord = config as any;
  return configRecord.prompt ?? configRecord.prompts.system;
}

// ==================== AGENT FACTORY ====================

/**
 * Create an Agent - Builds an executor that sequences PTRR steps
 */
export function factoryAgent<TInput = any, TOutput = any>(config: {
  name: string;
  description?: string;
  steps: AgentStep<any, any>[];
}): Agent<TInput, TOutput> {
  const executor = async (input: TInput, execution: Execution) => {
    // Create agent execution
    const agentExec = new AgentExecution(`agent:${config.name}`, execution);
    try { agentExec.store('agent', 'name', config.name); } catch {}
    
    // Store agent metadata
    agentExec.store('agent', 'name', config.name);
    agentExec.store('agent', 'startTime', Date.now());
    
    // Execute steps in sequence (PTRR)
    let result: any = input;
    for (const step of config.steps) {
      result = await step(result, agentExec);
    }
    
    // Store completion
    agentExec.store('agent', 'endTime', Date.now());
    agentExec.store('agent', 'output', result as any);
    
    return result;
  };
  
  // Create the agent object with all required properties
  // Use defineProperty for 'name' since it's read-only on functions
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

// ==================== AGENT WITH PTRR FACTORY ====================

/**
 * Create Agent with PTRR Steps - Creates a complete agent implementation
 * 
 * This factory creates an Agent that implements the full PTRR pattern.
 * Agents are executors that sequence PTRR steps with 7 substeps.
 */
export function factoryAgentWithPTRR<TInput, TOutput>(
  config: BitcodePTRRFactoryConfig<TOutput>
): Agent<TInput, TOutput> {
  const stepPromptRegistry = assertBitcodePTRRPromptCarrier(config);
  const agentPrompt = resolveBitcodePTRRAgentPrompt(config);
  const stepPrompts = {
    plan: resolveBitcodePTRRStepPrompt('plan', stepPromptRegistry.plan),
    try: resolveBitcodePTRRStepPrompt('try', stepPromptRegistry.try),
    refine: resolveBitcodePTRRStepPrompt('refine', stepPromptRegistry.refine),
    retry: resolveBitcodePTRRStepPrompt('retry', stepPromptRegistry.retry)
  };
  // Debug pattern (env-gated): skip semantics via ONLY_* filters
  const onlyStepEnv = String(process?.env?.BITCODE_DEBUG_ONLY_STEP || '').toLowerCase();

  // Step outputs validate against STEP schemas, not the full agent schema:
  // Plan produces the plan (canonical PlanStepOutputSchema); Try/Refine/Retry
  // produce the agent's typed output. Each is overridable per step.
  const stepSchemas = {
    plan: config.plan?.outputSchema ?? PlanStepOutputSchema,
    try: config.try?.outputSchema ?? config.outputSchema,
    refine: config.refine?.outputSchema ?? config.outputSchema,
    retry: config.retry?.outputSchema ?? config.outputSchema
  };

  const steps: AgentStep<any, any>[] = [
    // Plan step - failsafe understanding
    factoryPlanStep(stepSchemas.plan, {
      prompt: stepPrompts.plan,
      tools: config.tools,
      chunkThreshold: config.plan?.chunkThreshold
    }),
    // Try step - initial generation attempt
    factoryTryStep(stepSchemas.try, {
      ...config.try,
      prompt: stepPrompts.try,
      tools: config.tools
    }),

    // Refine step - improve if needed
    factoryRefineStep(stepSchemas.refine, {
      prompt: stepPrompts.refine,
      tools: config.tools,
      maxAttempts: config.refine?.maxAttempts
    }),

    // Retry step - failsafe completion
    factoryRetryStep(stepSchemas.retry, {
      ...config.retry,
      prompt: stepPrompts.retry,
      tools: config.tools
    })
  ];
  // If only a single step is requested for debugging, keep only that step
  if (onlyStepEnv) {
    const map: Record<string, AgentVariationStep> = {
      plan: AgentVariationStep.PLAN,
      try: AgentVariationStep.TRY,
      refine: AgentVariationStep.REFINE,
      retry: AgentVariationStep.RETRY
    };
    const wanted = map[onlyStepEnv];
    if (wanted !== undefined) {
      const keep: AgentStep<any, any>[] = [];
      for (const s of steps) {
        const t = (s as any)?.type as AgentVariationStep | undefined;
        if (t === wanted) { keep.push(s); break; }
      }
      if (keep.length) (steps as any).splice(0, steps.length, ...keep);
    }
  }
  
  // Inline agent creation to avoid bundling issues
  const executor = async (input: TInput, execution: Execution) => {
    // Phase/agent filters: no-op the agent if it doesn't match filters
    try {
      const phase = (execution as any).findUp?.('phase', 'current');
      const onlyPhase = process?.env?.BITCODE_DEBUG_ONLY_PHASE;
      if (onlyPhase && String(phase || '').toLowerCase() !== String(onlyPhase).toLowerCase()) {
        return input as any;
      }
    } catch {}
    try {
      const onlyAgent = process?.env?.BITCODE_DEBUG_ONLY_AGENT;
      if (onlyAgent && !String(config.name).toLowerCase().includes(String(onlyAgent).toLowerCase())) {
        return input as any;
      }
    } catch {}
    // Create agent execution
    const agentExec = new AgentExecution(`agent:${config.name}`, execution);
    // Attach agent-level system prompt if provided
    if (agentPrompt) {
      // Prefer explicit path mapping for clarity
      const get = (k: string) => (typeof agentPrompt.get === 'function' ? agentPrompt.get(k) : undefined);
      const namePart = get('agent:name');
      const identityPart = get('agent:identity');
      if (namePart) agentExec.prompt.setSpecificExecution('specific_execution:agent:name', namePart);
      if (identityPart) agentExec.prompt.setSpecificExecution('specific_execution:agent:identity', identityPart);

      // Merge any remaining parts conservatively under specific_execution
      try {
        const paths = agentPrompt.getAllPaths?.() || [];
        for (const p of paths) {
          if (p === 'agent:name' || p === 'agent:identity') continue;
          const part = agentPrompt.get(p);
          if (part) {
            agentExec.prompt.setSpecificExecution(`specific_execution:${p}`, part);
          }
        }
      } catch {
        // Fallback: set identity if structure unknown
        if (!identityPart) {
          agentExec.prompt.setSpecificExecution('specific_execution:agent:identity', agentPrompt);
        }
      }
    }

    // Store agent metadata
    agentExec.store('agent', 'name', config.name);
    agentExec.store('agent', 'startTime', Date.now());

    // Registry sanity checks for Bitcode prompt/tool execution boundaries.
    const enforceLLM = config.enforceLLM !== false;
    if (enforceLLM) {
      agentExec.llms.ensureDefaultConfigured({ throw: true });
    }
    if (config.requiredTools?.length) {
      agentExec.tools.ensureTools(config.requiredTools, { throw: true });
    }

    // After ensuring required tools exist, restrict accessible tools to that subset if provided
    if (config.requiredTools?.length) {
      agentExec.tools.restrictTo(config.requiredTools);
    }

    // Execute steps in sequence (PTRR)
    let result: any = input;
    for (const step of steps) {
      result = await step(result, agentExec);
    }
    
    // Store completion
    agentExec.store('agent', 'endTime', Date.now());
    agentExec.store('agent', 'output', result as any);
    
    return result;
  };
  
  // Use defineProperty for 'name' since it's read-only on functions
  Object.defineProperty(executor, 'name', {
    value: config.name,
    writable: false,
    enumerable: true,
    configurable: true
  });
  
  const agent = Object.assign(executor, {
    description: config.description,
    steps,
    generations: steps
  }) as Agent<TInput, TOutput>;
  
  return agent;
}

// ==================== AGENT WITH SINGLE STEP FACTORY ====================

/**
 * Create Agent with Single Step - Creates a minimal agent implementation
 * 
 * This factory creates an Agent with a single execution step.
 * For simple agents that don't read full PTRR.
 */
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
  
  // Inline the agent creation to avoid potential circular reference
  const executor: Executor<TInput, TOutput> = async (input, execution) => {
    const agentExec = new AgentExecution(config.name, execution);
    
    // Store agent metadata
    agentExec.store('agent', 'name', config.name);
    agentExec.store('agent', 'startTime', Date.now());
    
    // Execute the single step
    const result = await step(input, agentExec);
    
    // Store completion
    agentExec.store('agent', 'endTime', Date.now());
    agentExec.store('agent', 'output', result as any);
    
    return result;
  };
  
  // Use defineProperty for 'name' since it's read-only on functions
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

// ==================== AGENT WITH GENERATIONS (PREFERRED) ====================
/**
 * factoryAgentWithGenerations - Preferred ergonomic: pass Generations directly.
 * Also sets 'steps' to the same array for stable execution readers.
 */
export function factoryAgentWithGenerations<TInput, TOutput>(config: {
  name: string;
  description?: string;
  generations: AgentStep<any, any>[];
}): Agent<TInput, TOutput> {
  const executor = async (input: TInput, execution: Execution) => {
    const agentExec = new (require('../execution').AgentExecution)(`agent:${config.name}`, execution);
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

/**
 * factoryAgentWithPTRRGenerations - Same as factoryAgentWithPTRR but accepts
 * generationPrompts instead of stepPrompts. Internally maps to PTRR factories.
 */
export function factoryAgentWithPTRRGenerations<TInput, TOutput>(config: {
  name: string;
  description?: string;
  outputSchema: z.ZodType<TOutput>;
  prompt: BitcodePTRRPromptValue;
  generationPrompts: BitcodePTRRStepPromptRegistry;
  tools?: any[];
  requiredTools?: string[];
  enforceLLM?: boolean;
  plan?: { chunkThreshold?: number; outputSchema?: z.ZodType<any> };
  try?: { chunkThreshold?: number; enableParallelChunks?: boolean; outputSchema?: z.ZodType<any> };
  refine?: { maxAttempts?: number; outputSchema?: z.ZodType<any> };
  retry?: { maxAttempts?: number; backoff?: number; outputSchema?: z.ZodType<any> };
}): Agent<TInput, TOutput> {
  const stepPrompts = config.generationPrompts;
  return factoryAgentWithPTRR<TInput, TOutput>({
    name: config.name,
    description: config.description,
    outputSchema: config.outputSchema,
    prompt: config.prompt,
    stepPrompts,
    tools: config.tools,
    requiredTools: config.requiredTools,
    enforceLLM: config.enforceLLM,
    plan: config.plan,
    try: config.try,
    refine: config.refine,
    retry: config.retry
  });
}

// ==================== QUICK AGENT FACTORY ====================
/**
 * factoryQuickAgent - Preferred minimal agent for simple, single-step behaviors.
 *
 * This formalizes the "QuickAgent" concept: an executor with a name/description
 * that does not orchestrate PTRR. It wraps a single typed executor and uses
 * standard AgentExecution/StepExecution for consistent statefulness.
 *
 * Note: factoryAgentWithSingleStep remains available; this is the
 * canonical name to use going forward.
 */
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

  // Tag as quick agent and attach metadata
  (executor as any).description = config.description;
  (executor as any).kind = 'quick-agent';

  return executor;
}
