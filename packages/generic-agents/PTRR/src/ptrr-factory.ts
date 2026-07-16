/**
 * PTRR base Agent implementation factory.
 *
 * Hierarchy:
 *   @bitcode/agent-generics            — Agent / factoryAgent / factoryQuickAgent / PTRR steps
 *   @bitcode/generic-agents-ptrr       — this package (PTRRAgent base: Plan→Try→Retry→Refine)
 *   product / measure / conversation agents — specialize prompts, tools, schemas
 *
 * Canonical step order: Plan → Try → Retry → Refine.
 *   Plan   — (no tools execute) plan the Try, including intended tool use
 *   Try    — primary attempt (tools postprocess when useTools selected)
 *   Retry  — re-attempt Try accounting for prior Try errors / usedTools
 *   Refine — last step; same typed return as the agent (no tools execute)
 *
 * Preferred hierarchy names: PTRRAgent, factoryPTRRAgent.
 *  */

// Value imports of agent-generics are lazy inside factoryPTRRAgent so package
// load does not re-enter agent-generics ↔ generic-agents-ptrr re-exports.
import type { Execution } from '@bitcode/execution-generics/Execution';
import type { Agent, AgentStep } from '@bitcode/agent-generics/types';
import { z } from 'zod';

/**
 * PTRR base Agent (hierarchy name: PTRR + Agent).
 * Product agents compose this pattern with specialized prompts/tools/schemas.
 */
export type PTRRAgent<TInput = any, TOutput = any> = Agent<TInput, TOutput>;

export type BitcodePTRRStepName = 'plan' | 'try' | 'retry' | 'refine';
export type BitcodePTRRPromptValue = any;
export type BitcodePTRRStepPromptCarrier = BitcodePTRRPromptValue | (() => BitcodePTRRPromptValue);
export type BitcodePTRRStepPromptRegistry = {
  plan: BitcodePTRRStepPromptCarrier;
  try: BitcodePTRRStepPromptCarrier;
  retry: BitcodePTRRStepPromptCarrier;
  refine: BitcodePTRRStepPromptCarrier;
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

/** Canonical runtime order — Retry before Refine (final agent return). */
const BITCODE_PTRR_STEP_NAMES: BitcodePTRRStepName[] = ['plan', 'try', 'retry', 'refine'];

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
      'factoryPTRRAgent accepts one Bitcode prompt carrier: use `prompt` + `stepPrompts`, or compact `prompts.system` + plan/try/refine/retry.'
    );
  }

  if (!(hasPrimaryPrompt && hasPrimaryStepPrompts) && !hasCompactPromptCarrier) {
    throw new Error(
      'factoryPTRRAgent requires a Bitcode Registry-backed prompt carrier: provide `prompt` + complete `stepPrompts`, or compact `prompts.system` + plan/try/refine/retry.'
    );
  }

  const stepPrompts = (hasCompactPromptCarrier ? configRecord.prompts : configRecord.stepPrompts) as Record<string, unknown>;
  const missingStepPrompts = BITCODE_PTRR_STEP_NAMES.filter((stepName) =>
    stepPrompts[stepName] === undefined || stepPrompts[stepName] === null
  );

  if (missingStepPrompts.length > 0) {
    throw new Error(
      `factoryPTRRAgent Bitcode prompt carrier is missing ${missingStepPrompts.join(', ')} step Prompt registries.`
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
      `factoryPTRRAgent ${stepName} step Prompt registry resolved to an empty value.`
    );
  }

  return resolvedPrompt;
}

function resolveBitcodePTRRAgentPrompt(config: BitcodePTRRFactoryConfig<any>): BitcodePTRRPromptValue {
  const configRecord = config as any;
  return configRecord.prompt ?? configRecord.prompts.system;
}

/**
 * Create a PTRR base Agent — Plan → Try → Retry → Refine with 7-substep failsafes.
 */
export function factoryPTRRAgent<TInput, TOutput>(
  config: BitcodePTRRFactoryConfig<TOutput>
): PTRRAgent<TInput, TOutput> {
  // Lazy require keeps agent-generics package evaluation off the module graph
  // of this factory file (agent-generics root re-exports this package).
  // Plain require (no `typeof import(...)`) — type-query imports re-enter
  // agent-generics root re-exports of this package and stack-overflow ts-jest.
  const {
    factoryPlanStep,
    factoryTryStep,
    factoryRefineStep,
    factoryRetryStep,
  } = require('@bitcode/agent-generics/steps/factories');
  const { PlanStepOutputSchema } = require('@bitcode/agent-generics/steps/step-schemas');
  const { AgentVariationStep } = require('@bitcode/agent-generics/types');
  const { AgentExecution } = require('@bitcode/agent-generics/execution');

  const stepPromptRegistry = assertBitcodePTRRPromptCarrier(config);
  const agentPrompt = resolveBitcodePTRRAgentPrompt(config);
  const stepPrompts = {
    plan: resolveBitcodePTRRStepPrompt('plan', stepPromptRegistry.plan),
    try: resolveBitcodePTRRStepPrompt('try', stepPromptRegistry.try),
    retry: resolveBitcodePTRRStepPrompt('retry', stepPromptRegistry.retry),
    refine: resolveBitcodePTRRStepPrompt('refine', stepPromptRegistry.refine)
  };
  const onlyStepEnv = String(process?.env?.BITCODE_DEBUG_ONLY_STEP || '').toLowerCase();

  // Try + Retry produce agent-shaped attempts; Refine is last and returns the
  // agent contract (same default schema). Plan uses the canonical plan shape.
  const stepSchemas = {
    plan: config.plan?.outputSchema ?? PlanStepOutputSchema,
    try: config.try?.outputSchema ?? config.outputSchema,
    retry: config.retry?.outputSchema ?? config.outputSchema,
    refine: config.refine?.outputSchema ?? config.outputSchema
  };

  const steps: AgentStep<any, any>[] = [
    factoryPlanStep(stepSchemas.plan, {
      prompt: stepPrompts.plan,
      tools: config.tools,
      chunkThreshold: config.plan?.chunkThreshold
    }),
    factoryTryStep(stepSchemas.try, {
      ...config.try,
      prompt: stepPrompts.try,
      tools: config.tools
    }),
    factoryRetryStep(stepSchemas.retry, {
      ...config.retry,
      prompt: stepPrompts.retry,
      tools: config.tools
    }),
    factoryRefineStep(stepSchemas.refine, {
      prompt: stepPrompts.refine,
      tools: config.tools,
      maxAttempts: config.refine?.maxAttempts
    })
  ];
  if (onlyStepEnv) {
    const map: Record<string, any> = {
      plan: AgentVariationStep.PLAN,
      try: AgentVariationStep.TRY,
      retry: AgentVariationStep.RETRY,
      refine: AgentVariationStep.REFINE
    };
    const wanted = map[onlyStepEnv];
    if (wanted !== undefined) {
      const keep: AgentStep<any, any>[] = [];
      for (const s of steps) {
        const t = (s as any)?.type;
        if (t === wanted) { keep.push(s); break; }
      }
      if (keep.length) (steps as any).splice(0, steps.length, ...keep);
    }
  }

  const executor = async (input: TInput, execution: Execution) => {
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
    const agentExec = new AgentExecution(`agent:${config.name}`, execution);
    if (agentPrompt) {
      const get = (k: string) => (typeof agentPrompt.get === 'function' ? agentPrompt.get(k) : undefined);
      const namePart = get('agent:name');
      const identityPart = get('agent:identity');
      if (namePart) agentExec.prompt.setSpecificExecution('specific_execution:agent:name', namePart);
      if (identityPart) agentExec.prompt.setSpecificExecution('specific_execution:agent:identity', identityPart);

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
        if (!identityPart) {
          agentExec.prompt.setSpecificExecution('specific_execution:agent:identity', agentPrompt);
        }
      }
    }

    agentExec.store('agent', 'name', config.name);
    agentExec.store('agent', 'startTime', Date.now());

    const enforceLLM = config.enforceLLM !== false;
    if (enforceLLM) {
      agentExec.llms.ensureDefaultConfigured({ throw: true });
    }
    if (config.requiredTools?.length) {
      agentExec.tools.ensureTools(config.requiredTools, { throw: true });
    }

    if (config.requiredTools?.length) {
      agentExec.tools.restrictTo(config.requiredTools);
    }

    let result: any = input;
    for (const step of steps) {
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
    steps,
    generations: steps
  }) as PTRRAgent<TInput, TOutput>;

  return agent;
}

/**
 * Same as factoryPTRRAgent but accepts generationPrompts instead of stepPrompts.
 */
export function factoryPTRRAgentWithGenerations<TInput, TOutput>(config: {
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
}): PTRRAgent<TInput, TOutput> {
  const stepPrompts = config.generationPrompts;
  return factoryPTRRAgent<TInput, TOutput>({
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

