/**
 * PTRR step factories — Plan / Try / Refine / Retry.
 *
 * Composed by @bitcode/generic-agents-ptrr (PTRRAgent base).
 *
 * Hierarchy within each step:
 *   FailsafeGeneration ×3 (PCC → ChunkThenSum → Stitch)
 *     → each runs ThinkingsGeneration (Reason → Judge → StructuredOutput)
 *   + tools postprocess after failsafes
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
} from '../substeps/factories';
import { z } from 'zod';
import { logStepTrace, logStepStart, logStepError } from '../diagnostics/instrumentation';
import { createFailsafeGenerationSequence } from './failsafe-sequence';
import { PlanStepOutputSchema } from './step-schemas';

// StepExecutor is just an Executor - no special type needed
type StepExecutor<TInput = any, TOutput = any> = Executor<TInput, TOutput>;

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
  const core = createFailsafeGenerationSequence<TInput, TOutput>({
    outputSchema,
    enableParallelChunks: true
  });
  // Tools execution is a Step postprocess (not a failsafe)
  const withTools: Executor<any, any> = sequential(
    core as Executor<any, any>,
    conditional(
      (input: any) => input?.output?.useTools?.length > 0,
      require('../substeps/factories').factoryToolsExecution() as Executor<any, any>,
      (input) => Promise.resolve(input)
    ) as Executor<any, any>
  );

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
      const part = formatStepPromptCarrier(config.prompt);
      stepExec.prompt.setSpecificExecution('specific_execution:step:purpose', part);
    }
    try {
      // Record usable tools at step start
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
          'Plan',
          ((out as any)?.usedTools || []) as UsedTool[],
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
      require('../substeps/factories').factoryToolsExecution() as Executor<any, any>,
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
      stepExec.prompt.setSpecificExecution('specific_execution:step:purpose', formatStepPromptCarrier(options.prompt));
    }
    try {
      // Record usable tools
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

// ==================== REFINE STEP ====================

/**
 * Refine Step Factory - Improves upon previous attempt
 * 
 * Uses failsafe parent architecture focused on improvement:
 * 1. PrepareConciseContext -> includes previous attempt + judgment
 * 2. ChunkThenSum -> processes improvements
 * 3. StitchUntilComplete -> ensures refined output is complete
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
  const withTools: Executor<any, any> = sequential(
    core as Executor<any, any>,
    conditional(
      (input: any) => input?.output?.useTools?.length > 0,
      require('../substeps/factories').factoryToolsExecution() as Executor<any, any>,
      (input) => Promise.resolve(input)
    ) as Executor<any, any>
  );
  
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
      stepExec.prompt.setSpecificExecution('specific_execution:step:purpose', formatStepPromptCarrier(options.prompt));
    }
    try {
      // Record usable tools
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
          'Refine',
          ((out as any)?.usedTools || []) as UsedTool[],
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
    description: 'Improve upon previous attempt'
  }) as AgentStep<TInput, TOutput>;
}

// ==================== RETRY STEP ====================

/**
 * Retry Step Factory - Complete retry with fresh approach
 * 
 * Uses failsafe parent architecture with retry wrapper:
 * Each retry attempt runs the full failsafe sequence
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
      stepExec.prompt.setSpecificExecution('specific_execution:step:purpose', formatStepPromptCarrier(options.prompt));
    }
    try {
      // Record usable tools
      try {
        const usable = Object.keys(stepExec.tools.getUsableTools?.() || {});
        stepExec.store('tools', 'usable', usable);
      } catch {}
      // Run retry attempts on the core generation. After the final attempt, run tools once.
      let out = await executorWithRetry(input, stepExec);
      if ((out as any)?.output?.useTools?.length > 0) {
        const toolsExec = require('../substeps/factories').factoryToolsExecution();
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
    description: 'Complete retry with fresh approach'
  }) as AgentStep<TInput, TOutput>;
}

// ==================== STEP FACTORY ====================

/**
 * Create a PTRR step based on type.
 *
 * Step outputs validate against STEP schemas: `outputSchema` here is the
 * agent's output schema and applies to Try/Refine/Retry; the Plan step
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

    case AgentVariationStep.REFINE:
      return factoryRefineStep(outputSchema, options);

    case AgentVariationStep.RETRY:
      return factoryRetryStep(outputSchema, options);

    default:
      throw new Error(`Unknown step type: ${type}`);
  }
}

// ==================== ACTION FACTORY ====================

/**
 * PTRR Action Factory - Full PTRR cycle as a single executor
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
  
  // Add refinements
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
  }
  
  // Add retry as fallback
  if (config.enableRetry) {
    steps.push(
      conditional(
        (input) => !input.judgment?.approved,
        factoryRetryStep(config.outputSchema),
        (input) => Promise.resolve(input)
      )
    );
  }
  
  return Object.assign(
    sequential(...steps) as StepExecutor<TInput, TOutput>,
    {
      type: AgentVariationStep.TRY,
      description: 'Execute the full PTRR action sequence'
    }
  ) as AgentStep<TInput, TOutput>;
}
