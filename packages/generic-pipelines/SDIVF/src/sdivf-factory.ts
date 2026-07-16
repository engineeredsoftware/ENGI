/**
 * SDIVF base Pipeline implementation factories.
 *
 * Hierarchy:
 *   @bitcode/pipelines-generics     — Pipeline / PhaseDelegator primitives
 *   @bitcode/generic-pipelines-sdivf — this package (SDIVF base loop)
 *   @bitcode/asset-packs-pipelines-domain    — SynthesizeDeposit/Read + settle-asset-pack-pipeline
 *
 * Pattern: Setup → [Discovery → Implementation → Validation]* → Finish
 * with bounded DIV iteration. Product pipelines supply phase executors/agents.
 */

import { sequential } from '@bitcode/execution-generics';
import type { Executor } from '@bitcode/execution-generics';
import type { Execution } from '@bitcode/execution-generics/Execution';
import type { Pipeline } from '@bitcode/pipelines-generics/pipeline-factory';
import type {
  PhaseDelegator,
  PipelineExecution,
} from '@bitcode/pipelines-generics/execution/pipeline-types';
import { factoryPipelineExecution } from '@bitcode/pipelines-generics/execution/pipeline-types';
import { descendExecution } from '@bitcode/pipelines-generics/execution/resume';

/**
 * SDIVF base Pipeline (hierarchy name: SDIVF + Pipeline).
 * Product pipelines must extend this pattern:
 *   SynthesizeAssetPacksSDIVFPipeline, settle-asset-pack-pipelineSDIVFPipeline, …
 */
export type SDIVFPipeline<TInput = any, TOutput = any> = Pipeline<TInput, TOutput>;

// ==================== SDIVF CONFIGURATION ====================

async function emitPipelineDataStreamEvent(
  execution: Execution,
  event: Record<string, unknown>
): Promise<void> {
  const dataStream =
    (execution as any).get?.('execution', 'dataStream') ??
    (execution.parent as any)?.get?.('execution', 'dataStream');

  if (!dataStream || typeof dataStream.writeData !== 'function') {
    return;
  }

  try {
    await dataStream.writeData(JSON.stringify(event));
  } catch {
    // Streaming must never decide pipeline success.
  }
}

interface SDIVBaseConfig<TInput = any> {
  setup: PhaseDelegator<TInput, any>;
  discovery: PhaseDelegator<any, any>;
  implementation: PhaseDelegator<any, any>;
  validation: PhaseDelegator<any, any>;
  readyToIterate?: Executor<any, boolean>;
  maxIterations?: number;
  iterationStrategy?: 'sequential' | 'adaptive';
  initialize?: (execution: PipelineExecution, input: TInput) => void | Promise<void>;
}

export interface SDIVFPipelineConfig<TInput = any, TOutput = any> extends SDIVBaseConfig<TInput> {
  finish: PhaseDelegator<any, TOutput>;
  readyToFinish?: Executor<any, boolean>;
}

type SDIVFPhaseName = 'setup' | 'discovery' | 'implementation' | 'validation' | 'finish';

function storePhaseStart(
  execution: PipelineExecution | Execution,
  phase: SDIVFPhaseName,
  input: unknown,
  iteration?: number
): void {
  execution.store('phase', 'current', phase);
  if (typeof iteration === 'number') {
    execution.store('phase', 'iteration', iteration);
  }
  execution.store('phase', 'start', {
    phase,
    currentPhase: phase,
    iteration: iteration ?? null,
    input: summarizePhaseValue(input),
    startedAt: new Date().toISOString(),
  } as any);
}

function storePhaseComplete(
  execution: PipelineExecution | Execution,
  phase: SDIVFPhaseName,
  output: unknown,
  iteration?: number,
  error?: unknown
): void {
  execution.store('phase', 'complete', {
    phase,
    currentPhase: phase,
    iteration: iteration ?? null,
    status: error ? 'failed' : 'completed',
    output: error ? null : summarizePhaseValue(output),
    error: error ? summarizePhaseError(error) : null,
    completedAt: new Date().toISOString(),
  } as any);
}

async function runObservedPhase<TIn, TOut>(
  phase: SDIVFPhaseName,
  input: TIn,
  execution: PipelineExecution,
  delegate: PhaseDelegator<TIn, TOut>,
  iteration?: number
): Promise<TOut> {
  storePhaseStart(execution, phase, input, iteration);
  try {
    const output = await delegate(input, execution);
    storePhaseComplete(execution, phase, output, iteration);
    return output;
  } catch (error) {
    storePhaseComplete(execution, phase, null, iteration, error);
    throw error;
  }
}

async function runObservedExecutorPhase<TIn, TOut>(
  phase: SDIVFPhaseName,
  input: TIn,
  execution: Execution,
  executor: Executor<TIn, TOut>,
  iteration?: number
): Promise<TOut> {
  storePhaseStart(execution, phase, input, iteration);
  try {
    const output = await executor(input, execution);
    storePhaseComplete(execution, phase, output, iteration);
    return output;
  } catch (error) {
    storePhaseComplete(execution, phase, null, iteration, error);
    throw error;
  }
}

function summarizePhaseValue(value: unknown): unknown {
  try {
    if (value == null) return value;
    if (typeof value === 'string') {
      return value.length > 500 ? `${value.slice(0, 500)}... [truncated]` : value;
    }
    if (Array.isArray(value)) {
      return {
        type: 'array',
        length: value.length,
        sample: summarizePhaseValue(value[0]),
      };
    }
    if (typeof value === 'object') {
      const objectValue = value as Record<string, unknown>;
      const keys = Object.keys(objectValue);
      return {
        type: 'object',
        keys: keys.slice(0, 20),
        sample: keys.slice(0, 8).reduce<Record<string, unknown>>((acc, key) => {
          acc[key] = summarizePhaseValue(objectValue[key]);
          return acc;
        }, {}),
      };
    }
    return value;
  } catch {
    return '[unserializable]';
  }
}

function summarizePhaseError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack ? error.stack.split('\n').slice(0, 6).join('\n') : undefined,
    };
  }
  return { message: String(error) };
}

// ==================== SDIVF PIPELINE FACTORY ====================

/**
 * Create an SDIVF reference pipeline with built-in DIV iteration.
 *
 * Pattern: Setup -> [Discovery -> Implementation -> Validation]* -> Finish
 * 
 * The DIV loop iterates until:
 * 1. Validation passes (readyToFinish returns true)
 * 2. Max iterations reached
 * 3. Error occurs (handled gracefully)
 */
export function factorySDIVFPipeline<TInput, TOutput>(
  name: string,
  config: SDIVFPipelineConfig<TInput, TOutput>
): SDIVFPipeline<TInput, TOutput> {
  const maxIterations = config.maxIterations || 3;
  
  return async (input: TInput, execution: Execution): Promise<TOutput> => {
    // Create pipeline execution
    const pipelineExec = factoryPipelineExecution(name, execution);
    pipelineExec.store('pipeline', 'start', { name });
    await emitPipelineDataStreamEvent(pipelineExec, {
      type: 'pipeline',
      status: 'start',
      name,
      pattern: 'SDIVF'
    });
    
    // Optional resume-at (deep execution) support: if caller provides a
    // resume descriptor under execution.get('resume','startAt'), record a resume
    // marker at the precise nested execution node for visibility and tooling.
    try {
      const startAt: any = (execution as any).get?.('resume', 'startAt');
      if (startAt && Array.isArray(startAt.path)) {
        const node = descendExecution(execution, startAt.path);
        await node.store('status', 'resumed', {
          ...startAt.state,
          message: 'resumed_at_node'
        } as any);
      }
    } catch {}
    
    // Initialize pipeline-level registries/prompts/tools if provided
    if (typeof config.initialize === 'function') {
      await config.initialize(pipelineExec, input);
    }
    
    // Store SDIVF metadata
    pipelineExec.store('pipeline', 'pattern', 'SDIVF');
    pipelineExec.store('pipeline', 'phaseModel', 'Setup-[Discovery-Implementation-Validation]*-Finish');
    pipelineExec.store('pipeline', 'name', name);
    pipelineExec.store('pipeline', 'startTime', Date.now());
    pipelineExec.store('pipeline', 'maxIterations', maxIterations);
    
    // ========== SETUP PHASE ==========
    let result = await runObservedPhase('setup', input, pipelineExec, config.setup);
    
    // Check if we should iterate (optional)
    if (config.readyToIterate) {
      const shouldProceed = await config.readyToIterate(result, pipelineExec);
      if (!shouldProceed) {
        pipelineExec.store('pipeline', 'earlyExit', 'setup');
        throw new Error('Not ready to iterate after setup');
      }
    }
    
    // ========== DIV ITERATION LOOP ==========
    let iterations = 0;
    let validationPassed = false;
    
    while (iterations < maxIterations && !validationPassed) {
      iterations++;
      pipelineExec.store('pipeline', 'currentIteration', iterations);
      
      // Discovery Phase
      result = await runObservedPhase('discovery', result, pipelineExec, config.discovery, iterations);
      
      // Implementation Phase
      result = await runObservedPhase('implementation', result, pipelineExec, config.implementation, iterations);
      
      // Validation Phase
      result = await runObservedPhase('validation', result, pipelineExec, config.validation, iterations);
      
      // Check if ready to finish
      if (config.readyToFinish) {
        validationPassed = await config.readyToFinish(result, pipelineExec);
      } else {
        // Default: check if validation.passed is true
        validationPassed = pipelineExec.get('validation', 'passed') === true ||
                          (result as any).passed === true ||
                          (result as any).ready === true;
      }
      
      pipelineExec.store('iteration', String(iterations), {
        passed: validationPassed,
        result: result
      } as any);
      
      // If not passing and not last iteration, continue loop
      if (!validationPassed && iterations < maxIterations) {
        pipelineExec.store('pipeline', 'iterating', true);
        // Optionally transform result for next iteration
        if (config.iterationStrategy === 'adaptive') {
          // In adaptive mode, we might modify approach based on validation feedback
          const feedback = pipelineExec.get('validation', 'feedback');
          if (feedback) {
            (result as any).previousFeedback = feedback;
          }
        }
      }
    }
    
    // Check if we succeeded
    if (!validationPassed) {
      pipelineExec.store('pipeline', 'maxIterationsReached', true);
      // Could throw or continue to finish with partial results.
      // throw new Error(`Max iterations (${maxIterations}) reached without validation passing`);
    }
    
    // ========== FINISH PHASE ==========
    pipelineExec.store('finish', 'responsibility', 'save-results-and-close-run');
    const output = await runObservedPhase('finish', result, pipelineExec, config.finish);
    
    // Store completion metadata
    pipelineExec.store('pipeline', 'endTime', Date.now());
    pipelineExec.store('pipeline', 'totalIterations', iterations);
    pipelineExec.store('pipeline', 'success', validationPassed);
    pipelineExec.store('pipeline', 'output', output as any);
    
    pipelineExec.store('pipeline', 'completion', { name, success: validationPassed });
    await emitPipelineDataStreamEvent(pipelineExec, {
      type: 'pipeline',
      status: 'end',
      name,
      pattern: 'SDIVF',
      success: validationPassed
    });
    return output;
  };
}

// ==================== COMPOSED SDIVF EXECUTOR ====================

export interface SDIVFPipelineExecutorConfig<TInput = any, TOutput = any> {
  // Phase executors (already-resolved functions)
  setup: Executor<TInput, any>;
  discovery?: Executor<any, any>;
  implementation?: Executor<any, any>;
  validation?: Executor<any, any>;
  finish?: Executor<any, TOutput>;
  // Loop controls
  maxIterations?: number; // default: 3
  /**
   * Iterate-vs-complete gate: runs after each Validation phase with the
   * validation result. Returning true exits the DIV loop early (ready to
   * finish); returning false iterates again (bounded by maxIterations).
   * Defaults to the shared validation-signal check (see
   * executorValidationSignalsReadyToFinish).
   */
  readyToFinish?: Executor<any, boolean>;
  // Optional preprocess/postprocess hooks
  preprocess?: Executor<TInput, TInput>;
  // Runs at the start of each DIV loop iteration (before Discovery)
  iterationPreprocess?: Executor<any, any>;
  postprocess?: Executor<TOutput, TOutput>;
}

/**
 * Default iterate-vs-complete signal for the executor-variant DIV loop.
 *
 * Mirrors the factorySDIVFPipeline gate (validation:passed store, or
 * passed/ready on the threaded result), extended with the CROSS-PHASE
 * readiness artifact the AssetPack ReadyToFinish agent stores on the SHARED
 * root execution (`validation:readyToFinish` with a `finalApproval` verdict) —
 * resolvable from the DIV sibling via the ancestors-only findUp walk.
 */
function executorValidationSignalsReadyToFinish(result: any, exec: any): boolean {
  const readShared = (namespace: string, key: string): unknown => {
    try {
      return exec?.get?.(namespace, key) ?? exec?.findUp?.(namespace, key);
    } catch {
      return undefined;
    }
  };
  const readiness = readShared('validation', 'readyToFinish') as
    | { finalApproval?: unknown }
    | undefined;
  if (readiness && (readiness as any).finalApproval === true) return true;
  if (readShared('validation', 'passed') === true) return true;
  return result?.passed === true || result?.ready === true || result?.finalApproval === true;
}

/**
 * factorySDIVFPipelineFromExecutors — build an SDIVFPipeline from phase Executors.
 * Hierarchy return type: SDIVFPipeline. Construction uses execution-generics
 * sequential composition: [preprocess] → Setup → [DIV]* → Finish → [postprocess].
 */
export function factorySDIVFPipelineFromExecutors<TInput, TOutput>(
  name: string,
  cfg: SDIVFPipelineExecutorConfig<TInput, TOutput>
): SDIVFPipeline<TInput, TOutput> {
  const maxIter = cfg.maxIterations ?? 3;

  // Optional preprocess/postprocess
  const preprocess = cfg.preprocess ?? (async (i) => i);
  const postprocess = cfg.postprocess ?? (async (o) => o as TOutput);

  // Optional phases default to identity if absent
  const discovery = cfg.discovery ?? (async (x) => x);
  const implementation = cfg.implementation ?? (async (x) => x);
  const validation = cfg.validation ?? (async (x) => x);
  const finish = cfg.finish ?? (async (x) => x as TOutput);

  // Compose complete pipeline
  const pipelineExec: Executor<TInput, TOutput> = sequential<any>(
    preprocess as any,
    // Optional resume-at marker for visibility before setup runs
    async (input, exec) => {
      try {
        const startAt: any = (exec as any).get?.('resume', 'startAt');
        if (startAt && Array.isArray(startAt.path)) {
          const node = descendExecution(exec as any, startAt.path);
          await node.store('status', 'resumed', {
            ...startAt.state,
            message: 'resumed_at_node'
          } as any);
        }
      } catch {}
      return runObservedExecutorPhase('setup', input, exec as Execution, cfg.setup as any);
    },
    // Repeat DIV sequence up to max iterations, exiting early once Validation
    // signals ready-to-finish (iterate-vs-complete gate).
    async (input, exec) => {
      let current: any = input;
      let validationPassed = false;
      let iterations = 0;
      for (let i = 0; i < maxIter && !validationPassed; i++) {
        const iteration = i + 1;
        iterations = iteration;
        // Optional per-iteration preprocess (e.g., fetch Evidence Document updates for context)
        if (cfg.iterationPreprocess) {
          try { current = await cfg.iterationPreprocess(current, exec); } catch {}
        }
        current = await runObservedExecutorPhase('discovery', current, exec as Execution, discovery as any, iteration);
        current = await runObservedExecutorPhase('implementation', current, exec as Execution, implementation as any, iteration);
        current = await runObservedExecutorPhase('validation', current, exec as Execution, validation as any, iteration);
        // Iterate-vs-complete gate: stop looping the moment validation is ready.
        validationPassed = cfg.readyToFinish
          ? (await cfg.readyToFinish(current, exec)) === true
          : executorValidationSignalsReadyToFinish(current, exec);
        try {
          (exec as Execution).store('iteration', String(iteration), { passed: validationPassed } as any);
        } catch {}
      }
      try {
        (exec as Execution).store('pipeline', 'totalIterations', iterations);
        (exec as Execution).store('pipeline', 'validationPassed', validationPassed);
        if (!validationPassed) {
          (exec as Execution).store('pipeline', 'maxIterationsReached', true);
        }
      } catch {}
      return current;
    },
    async (input, exec) => runObservedExecutorPhase('finish', input, exec as Execution, finish as any),
    postprocess as any
  ) as Executor<TInput, TOutput>;

  return pipelineExec;
}

