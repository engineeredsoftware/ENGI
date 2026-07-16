/**
 * PTRR step factories — Plan / Try / Retry / Refine.
 *
 * Composed by @bitcode/generic-agents-ptrr (PTRRAgent base).
 * Canonical agent step order: Plan → Try → Retry → Refine.
 *
 * Hierarchy within each step:
 *   FailsafeGeneration ×3 (PCC → ChunkThenSum → Stitch)
 *     → each runs ThinkingsGeneration (Reason → Judge → StructuredOutput)
 *   + tools postprocess after failsafes on Try/Retry only
 *     (Plan: strategy only, empty tool surface by default;
 *      Try/Retry: own useTools + postprocess; Refine: no tools)
 *
 * Failsafe and Thinkings units are Generations.
 * Factories: `@bitcode/agent-generics/generations`.
 * Step tool allowlists: `applyStepToolSurface` on StepExecution.tools.
 */

import {
  sequential,
  parallel,
  conditional,
  retry,
  buildAgentStepWorkUpdate,
  storeAgentStepWorkUpdate,
  getFileChangeStats,
  type ToolUsageUpdate,
} from '@bitcode/execution-generics';
import { Executor } from '@bitcode/execution-generics';
import { log } from '@bitcode/logger';
import type { AgentStep, UsedTool } from '../types';
import { AgentVariationStep } from '../types';
import {
  factoryPrepareConciseContext,
  factoryChunkThenSum,
  factoryStitchUntilComplete,
  factoryReason,
  factoryJudge,
  factoryStructuredOutput,
  factoryToolsExecution,
  factoryValidation
} from '../generations/llm-bound-factories';
import { z } from 'zod';
import { logStepTrace, logStepStart, logStepError } from '../diagnostics/instrumentation';
import { createFailsafeGenerationSequence } from './failsafe-sequence';
import { PlanStepOutputSchema } from './step-schemas';
import { applyStepToolSurface } from '../execution';
import { applyComposedCallSiteNodePrompt } from '@bitcode/execution-generics';
import { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { PROMPTPART_GENERIC_PTRR_STEP_PLAN_NAME_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_step_plan_name_corestatement';
import { PROMPTPART_GENERIC_PTRR_STEP_TRY_NAME_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_step_try_name_corestatement';
import { PROMPTPART_GENERIC_PTRR_STEP_RETRY_NAME_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_step_retry_name_corestatement';
import { PROMPTPART_GENERIC_PTRR_STEP_REFINE_NAME_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_step_refine_name_corestatement';

// StepExecutor is just an Executor - no special type needed
type StepExecutor<TInput = any, TOutput = any> = Executor<TInput, TOutput>;

const PTRR_STEP_NAME: Record<string, PromptPart> = {
  plan: PROMPTPART_GENERIC_PTRR_STEP_PLAN_NAME_CORESTATEMENT,
  try: PROMPTPART_GENERIC_PTRR_STEP_TRY_NAME_CORESTATEMENT,
  retry: PROMPTPART_GENERIC_PTRR_STEP_RETRY_NAME_CORESTATEMENT,
  refine: PROMPTPART_GENERIC_PTRR_STEP_REFINE_NAME_CORESTATEMENT,
};

/** Attach step purpose as call_site:step block (one node → one wire block). */
function attachStepCallSitePrompt(stepExec: any, stepName: string, promptCarrier: any): void {
  if (!stepExec?.prompt || !promptCarrier) return;
  const part = formatStepPromptCarrier(promptCarrier);
  // Correct path under specific_execution (setSpecificExecution prefixes once).
  try {
    stepExec.prompt.setSpecificExecution('step:purpose', part);
  } catch {
    /* ignore */
  }
  const composed = new Prompt();
  // Purpose from product/base step Prompt (raw_promptparts) or its format.
  if (part != null && typeof part !== 'string') {
    composed.set('purpose', part as PromptPart);
  } else if (promptCarrier && typeof promptCarrier.format === 'function') {
    try {
      const { createPromptPartFromPrompt } = require('@bitcode/prompts/parts/PromptPart');
      composed.set('purpose', createPromptPartFromPrompt(promptCarrier));
    } catch {
      /* ignore */
    }
  }
  const namePart =
    PTRR_STEP_NAME[String(stepName).toLowerCase()] ??
    PROMPTPART_GENERIC_PTRR_STEP_PLAN_NAME_CORESTATEMENT;
  composed.set('name', namePart);
  applyComposedCallSiteNodePrompt(stepExec.prompt, composed, `step:${stepName}`);
}

function formatStepPromptCarrier(prompt: any): any {
  if (!prompt) return prompt;

  const explicitPurpose = prompt.get?.('step:purpose');
  if (explicitPurpose) return explicitPurpose;

  if (typeof prompt.format === 'function') {
    return prompt.format();
  }

  return prompt;
}

function normalizeToolUsage(usedTools: UsedTool[] | undefined): ToolUsageUpdate[] {
  return (usedTools || []).map((tool) => ({
    name: tool.tool,
    description: tool.error ? `Error: ${tool.error}` : undefined,
    successful: !tool.error,
    metadata: {
      input: tool.input,
      output: tool.output,
    },
  }));
}

function publishAgentStepWorkUpdate(
  execution: any,
  step: 'Plan' | 'Try' | 'Refine' | 'Retry',
  usedTools: UsedTool[],
  startedAt: number
): void {
  try {
    const agentName = execution.findUp?.('agent', 'name') || 'unknown';
    const phaseName = execution.findUp?.('phase', 'name');
    const iteration = execution.findUp?.('pipeline', 'currentIteration');
    const stats = getFileChangeStats(execution);
    const tools = normalizeToolUsage(usedTools);

    const summaryParts = [
      `${step} step completed for ${agentName}`,
      stats.files.length
        ? `${stats.files.length} file${stats.files.length === 1 ? '' : 's'} changed`
        : 'No file changes',
    ];
    if (tools.length) {
      summaryParts.push(
        `Tools used: ${tools.map((tool) => tool.name).join(', ')}`
      );
    }

    const update = buildAgentStepWorkUpdate({
      execution,
      agent: agentName,
      phase: phaseName,
      step,
      prose: summaryParts.join('. ') + '.',
      tools,
      meta: {
        iteration,
        durationMs: Date.now() - startedAt,
      },
    });

    storeAgentStepWorkUpdate(execution, update);
  } catch (error) {
    // Do not disrupt execution if work update publishing fails
    try {
      console.warn('[WorkUpdate] Failed to publish agent step update', error);
    } catch {}
  }
}

// ==================== PLAN STEP ====================

/**
 * Plan Step Factory - analyzes the Read and creates an execution plan.
 *
 * Uses failsafe parent architecture:
 * 1. PrepareConciseContext (parent) -> runs Reason-Judge-StructuredOutput (children)
 * 2. ChunkThenSum (parent) -> handles any chunking needed
 * 3. StitchUntilComplete (parent) -> ensures complete output
 *
 * `outputSchema` is the PLAN STEP's schema — the plan shape the step is
 * prompted to produce (canonically `PlanStepOutputSchema`), NOT the agent's
 * full output schema. Step outputs validate against step schemas.
 */
export function factoryPlanStep<TInput, TOutput>(
  outputSchema: z.ZodType<TOutput>,
  config?: {
    prompt?: any;
    tools?: any[];
    chunkThreshold?: number;
  }
): AgentStep<TInput, TOutput> {
  // Plan: strategy only (no tools postprocess). Default step tool surface is [].
  const core = createFailsafeGenerationSequence<TInput, TOutput>({
    outputSchema,
    enableParallelChunks: true
  });

  const wrapped: StepExecutor<TInput, TOutput> = async (input, execution) => {
    // Create a step execution node and attach step-level prompt if provided
    const stepExec = new (require('../execution').StepExecution)('plan', execution);
    // Explicitly store step name for downstream logging context
    try { stepExec.store('step', 'name', 'plan'); } catch {}
    // Store agent step start so the stream adapter infers 'agent-start'
    try {
      const phase = (stepExec as any).findUp?.('phase', 'current');
      const agentName = (stepExec as any).findUp?.('agent', 'name');
      if (agentName) stepExec.store(`agent:${agentName}`, 'start', { phase, agent: agentName, step: 'Plan' } as any);
    } catch {}
    const started = Date.now();
    try { logStepStart(stepExec, 'plan'); } catch {}
    if (config?.prompt) {
      attachStepCallSitePrompt(stepExec, 'plan', config.prompt);
    }
    try {
      // Plan default: no usable tools (strategy sans tool docs / useTools).
      applyStepToolSurface(stepExec, config?.tools ?? []);
      try {
        const usable = Object.keys(stepExec.tools.getUsableTools?.() || {});
        stepExec.store('tools', 'usable', usable);
      } catch {}
      const out = await (core as Executor<any, any>)(input, stepExec);
      try { stepExec.store('tools', 'use', (out as any)?.output?.useTools || []); } catch {}
      try { stepExec.store('tools', 'used', []); } catch {}
      try {
        publishAgentStepWorkUpdate(
          stepExec,
          'Plan',
          [] as UsedTool[],
          started
        );
      } catch {}
      try { logStepTrace(stepExec, 'plan'); } catch {}
      // Store agent step complete so the stream adapter infers 'agent-complete'
      try {
        const phase = (stepExec as any).findUp?.('phase', 'current');
        const agentName = (stepExec as any).findUp?.('agent', 'name');
        if (agentName) stepExec.store(`agent:${agentName}`, 'complete', { phase, agent: agentName, step: 'Plan' } as any);
      } catch {}
      return out;
    } catch (err) {
      try { logStepError(stepExec, 'plan', err, Date.now() - started); } catch {}
      throw err;
    }
  };

  return Object.assign(wrapped, {
    type: AgentVariationStep.PLAN,
    description: 'Analyze Read and create execution plan'
  }) as AgentStep<TInput, TOutput>;
}

// ==================== TRY STEP ====================

/**
 * Try Step Factory - Attempts to execute the plan
 * 
 * Uses failsafe parent architecture:
 * 1. PrepareConciseContext -> analyzes what's needed
 * 2. ChunkThenSum -> processes input (chunked or single)
 * 3. StitchUntilComplete -> ensures we got everything
 * 4. Tool execution -> runs AFTER failsafes if reasoning requested tools
 */
export function factoryTryStep<TInput, TOutput>(
  outputSchema: z.ZodType<TOutput>,
  options?: {
    enableParallelChunks?: boolean;
    prompt?: any;
    tools?: any[];
    chunkThreshold?: number;
  }
): AgentStep<TInput, TOutput> {
  const core = createFailsafeGenerationSequence<TInput, TOutput>({
    outputSchema,
    enableParallelChunks: options?.enableParallelChunks ?? true
  });
  const withTools: Executor<any, any> = sequential(
    core as Executor<any, any>,
    conditional(
      (input: any) => input?.output?.useTools?.length > 0,
      require('../generations/llm-bound-factories').factoryToolsExecution() as Executor<any, any>,
      (input) => Promise.resolve(input)
    ) as Executor<any, any>
  );
  
  const wrapped: StepExecutor<TInput, TOutput> = async (input, execution) => {
    const stepExec = new (require('../execution').StepExecution)('try', execution);
    try { stepExec.store('step', 'name', 'try'); } catch {}
    // Store agent step start so the stream adapter infers 'agent-start'
    try {
      const phase = (stepExec as any).findUp?.('phase', 'current');
      const agentName = (stepExec as any).findUp?.('agent', 'name');
      if (agentName) stepExec.store(`agent:${agentName}`, 'start', { phase, agent: agentName, step: 'Try' } as any);
    } catch {}
    const started = Date.now();
    try { logStepStart(stepExec, 'try'); } catch {}
    if (options?.prompt) {
      attachStepCallSitePrompt(stepExec, 'try', options.prompt);
    }
    try {
      // Try: agent catalog tools by default (own useTools + postprocess).
      applyStepToolSurface(stepExec, options?.tools);
      try {
        const usable = Object.keys(stepExec.tools.getUsableTools?.() || {});
        stepExec.store('tools', 'usable', usable);
      } catch {}
      const out = await withTools(input, stepExec);
      // Record selected and used tools
      try { stepExec.store('tools', 'use', (out as any)?.output?.useTools || []); } catch {}
      try { stepExec.store('tools', 'used', (out as any)?.usedTools || []); } catch {}
      try {
        publishAgentStepWorkUpdate(
          stepExec,
          'Try',
          ((out as any)?.usedTools || []) as UsedTool[],
          started
        );
      } catch {}
      try { logStepTrace(stepExec, 'try'); } catch {}
      // Store agent step complete so the stream adapter infers 'agent-complete'
      try {
        const phase = (stepExec as any).findUp?.('phase', 'current');
        const agentName = (stepExec as any).findUp?.('agent', 'name');
        if (agentName) stepExec.store(`agent:${agentName}`, 'complete', { phase, agent: agentName, step: 'Try' } as any);
      } catch {}
      return out;
    } catch (err) {
      try { logStepError(stepExec, 'try', err, Date.now() - started); } catch {}
      throw err;
    }
  };

  return Object.assign(wrapped, {
    type: AgentVariationStep.TRY,
    description: 'Attempt to execute the plan'
  }) as AgentStep<TInput, TOutput>;
}

// ==================== RETRY STEP ====================

/**
 * Retry Step Factory — re-attempt the Try after failures / usedTools evidence.
 *
 * Runs after Try and before Refine. Uses failsafe parent architecture with an
 * optional inner retry wrapper; tools postprocess when useTools is selected
 * (same as Try — accounting for prior step errors via results interpolation).
 */
export function factoryRetryStep<TInput, TOutput>(
  outputSchema: z.ZodType<TOutput>,
  options?: {
    maxAttempts?: number;
    backoff?: number;
    prompt?: any;
    tools?: any[];
  }
): AgentStep<TInput, TOutput> {
  // The core retry logic using failsafe architecture
  const retryCore = createFailsafeGenerationSequence<TInput, TOutput>({
    outputSchema,
    enableParallelChunks: true
  });
  
  // Wrap in retry combinator
  // Zero retries by default: run once unless maxAttempts provided (>0 adds retries)
  const executorWithRetry = retry(
    retryCore as Executor<any, any>,
    {
      // times counts attempts; default 1 means 0 retries
      times: (options?.maxAttempts ?? 0) + 1,
      delay: options?.backoff ?? 0,
      shouldRetry: () => true
    }
  );

  const wrapped: StepExecutor<TInput, TOutput> = async (input, execution) => {
    const stepExec = new (require('../execution').StepExecution)('retry', execution);
    try { stepExec.store('step', 'name', 'retry'); } catch {}
    // Store agent step start so the stream adapter infers 'agent-start'
    try {
      const phase = (stepExec as any).findUp?.('phase', 'current');
      const agentName = (stepExec as any).findUp?.('agent', 'name');
      if (agentName) stepExec.store(`agent:${agentName}`, 'start', { phase, agent: agentName, step: 'Retry' } as any);
    } catch {}
    const started = Date.now();
    try { logStepStart(stepExec, 'retry'); } catch {}
    if (options?.prompt) {
      attachStepCallSitePrompt(stepExec, 'retry', options.prompt);
    }
    try {
      applyStepToolSurface(stepExec, options?.tools);
      try {
        const usable = Object.keys(stepExec.tools.getUsableTools?.() || {});
        stepExec.store('tools', 'usable', usable);
      } catch {}
      // Run retry attempts on the core generation. After the final attempt, run tools once.
      let out = await executorWithRetry(input, stepExec);
      if ((out as any)?.output?.useTools?.length > 0) {
        const toolsExec = require('../generations/llm-bound-factories').factoryToolsExecution();
        out = await toolsExec(out, stepExec);
      }
      // Record selected and used tools
      try { stepExec.store('tools', 'use', (out as any)?.output?.useTools || []); } catch {}
      try { stepExec.store('tools', 'used', (out as any)?.usedTools || []); } catch {}
      try {
        publishAgentStepWorkUpdate(
          stepExec,
          'Retry',
          ((out as any)?.usedTools || []) as UsedTool[],
          started
        );
      } catch {}
      try { logStepTrace(stepExec, 'retry'); } catch {}
      // Store agent step complete so the stream adapter infers 'agent-complete'
      try {
        const phase = (stepExec as any).findUp?.('phase', 'current');
        const agentName = (stepExec as any).findUp?.('agent', 'name');
        if (agentName) stepExec.store(`agent:${agentName}`, 'complete', { phase, agent: agentName, step: 'Retry' } as any);
      } catch {}
      return out;
    } catch (err) {
      try { logStepError(stepExec, 'retry', err, Date.now() - started); } catch {}
      throw err;
    }
  };

  return Object.assign(wrapped, {
    type: AgentVariationStep.RETRY,
    description: 'Re-attempt Try accounting for prior errors and usedTools'
  }) as AgentStep<TInput, TOutput>;
}

// ==================== REFINE STEP ====================

/**
 * Refine Step Factory — final agent return (last PTRR step).
 *
 * Accumulates Plan / Try / Retry results into the agent's typed output.
 * No tools postprocess — synthesis only (same schema as agent output).
 */
export function factoryRefineStep<TInput, TOutput>(
  outputSchema: z.ZodType<TOutput>,
  options?: {
    prompt?: any;
    tools?: any[];
    maxAttempts?: number;
  }
): AgentStep<TInput, TOutput> {
  const core = createFailsafeGenerationSequence<TInput, TOutput>({
    outputSchema,
    enableParallelChunks: true
  });

  const wrapped: StepExecutor<TInput, TOutput> = async (input, execution) => {
    const stepExec = new (require('../execution').StepExecution)('refine', execution);
    try { stepExec.store('step', 'name', 'refine'); } catch {}
    // Store agent step start so the stream adapter infers 'agent-start'
    try {
      const phase = (stepExec as any).findUp?.('phase', 'current');
      const agentName = (stepExec as any).findUp?.('agent', 'name');
      if (agentName) stepExec.store(`agent:${agentName}`, 'start', { phase, agent: agentName, step: 'Refine' } as any);
    } catch {}
    const started = Date.now();
    try { logStepStart(stepExec, 'refine'); } catch {}
    if (options?.prompt) {
      attachStepCallSitePrompt(stepExec, 'refine', options.prompt);
    }
    try {
      // Refine: empty tool surface by default (final agent return only).
      applyStepToolSurface(stepExec, options?.tools ?? []);
      try {
        const usable = Object.keys(stepExec.tools.getUsableTools?.() || {});
        stepExec.store('tools', 'usable', usable);
      } catch {}
      const out = await (core as Executor<any, any>)(input, stepExec);
      try { stepExec.store('tools', 'use', (out as any)?.output?.useTools || []); } catch {}
      try { stepExec.store('tools', 'used', []); } catch {}
      try {
        publishAgentStepWorkUpdate(
          stepExec,
          'Refine',
          [] as UsedTool[],
          started
        );
      } catch {}
      try { logStepTrace(stepExec, 'refine'); } catch {}
      // Store agent step complete so the stream adapter infers 'agent-complete'
      try {
        const phase = (stepExec as any).findUp?.('phase', 'current');
        const agentName = (stepExec as any).findUp?.('agent', 'name');
        if (agentName) stepExec.store(`agent:${agentName}`, 'complete', { phase, agent: agentName, step: 'Refine' } as any);
      } catch {}
      return out;
    } catch (err) {
      try { logStepError(stepExec, 'refine', err, Date.now() - started); } catch {}
      throw err;
    }
  };

  return Object.assign(wrapped, {
    type: AgentVariationStep.REFINE,
    description: 'Synthesize final agent return from Plan/Try/Retry results'
  }) as AgentStep<TInput, TOutput>;
}

// ==================== STEP FACTORY ====================

/**
 * Create a PTRR step based on type.
 *
 * Step outputs validate against STEP schemas: `outputSchema` here is the
 * agent's output schema and applies to Try/Retry/Refine; the Plan step
 * validates against the canonical `PlanStepOutputSchema` (override via
 * `options.outputSchema`).
 */
export function factoryStep<TInput, TOutput>(
  type: AgentVariationStep,
  outputSchema: z.ZodType<TOutput>,
  options?: any
): StepExecutor<TInput, TOutput> {
  switch (type) {
    case AgentVariationStep.PLAN:
      return factoryPlanStep(options?.outputSchema ?? PlanStepOutputSchema, options) as any;

    case AgentVariationStep.TRY:
      return factoryTryStep(outputSchema, options);

    case AgentVariationStep.RETRY:
      return factoryRetryStep(outputSchema, options);

    case AgentVariationStep.REFINE:
      return factoryRefineStep(outputSchema, options);

    default:
      throw new Error(`Unknown step type: ${type}`);
  }
}

// ==================== ACTION FACTORY ====================

/**
 * PTRR Action Factory — full Plan → Try → Retry → Refine cycle as one executor.
 */
export function factoryPTRRAction<TInput, TOutput>(
  config: {
    outputSchema: z.ZodType<TOutput>;
    maxRefinements?: number;
    enableRetry?: boolean;
    chunkThreshold?: number;
  }
): AgentStep<TInput, TOutput> {
  const steps: StepExecutor<any, any>[] = [
    // Always start with Plan — validated against the PLAN STEP schema (the
    // plan shape), not the agent's output schema.
    factoryPlanStep(PlanStepOutputSchema),

    // Try to execute
    factoryTryStep(config.outputSchema, {
      chunkThreshold: config.chunkThreshold
    })
  ];

  // Retry re-attempts Try when prior attempt was not approved
  if (config.enableRetry) {
    steps.push(
      conditional(
        (input) => !input.judgment?.approved,
        factoryRetryStep(config.outputSchema),
        (input) => Promise.resolve(input)
      )
    );
  }

  // Refine last: final agent-typed return
  if (config.maxRefinements && config.maxRefinements > 0) {
    for (let i = 0; i < config.maxRefinements; i++) {
      steps.push(
        conditional(
          (input) => !input.judgment?.approved,
          factoryRefineStep(config.outputSchema),
          (input) => Promise.resolve(input)
        )
      );
    }
  } else {
    // Always end with Refine so the action's last output is agent-typed.
    steps.push(factoryRefineStep(config.outputSchema));
  }

  return Object.assign(
    sequential(...steps) as StepExecutor<TInput, TOutput>,
    {
      type: AgentVariationStep.TRY,
      description: 'Execute the full PTRR action sequence (Plan→Try→Retry→Refine)'
    }
  ) as AgentStep<TInput, TOutput>;
}
