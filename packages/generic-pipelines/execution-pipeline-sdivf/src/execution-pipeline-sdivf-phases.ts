/**
 * ExecutionPipelineSDIVF phase ids and PhaseDelegator ordering helpers.
 *
 * Hierarchy: phases of an ExecutionPipelineSDIVF (base + Pipeline primitive).
 * Product pipelines supply phase Executors (agents, tools, rosters live
 * above this package — never in the base SDIVF loop).
 */

import type { Executor } from '@bitcode/execution-generics';
import type { ExecutionPipelineSDIVFExecutionPhaseDelegator } from './execution-pipeline-sdivf-execution-phase';

/** Canonical ExecutionPipelineSDIVF phase ids (Setup → Discovery → Implementation → Validation → Finish). */
export enum ExecutionPipelineSDIVFPhase {
  SETUP = 'setup',
  DISCOVERY = 'discovery',
  IMPLEMENTATION = 'implementation',
  VALIDATION = 'validation',
  FINISH = 'finish',
}

/**
 * Order phase executors as SDIVF ExecutionPhaseDelegators (Executor-typed; no agents).
 * Prefer factoryExecutionPipelineSDIVFFromExecutors when building product pipelines.
 */
export function factoryExecutionPipelineSDIVFPhaseDelegators<TInput, TOutput>(config: {
  setup: Executor<TInput, any>;
  discovery: Executor<any, any>;
  implementation: Executor<any, any>;
  validation: Executor<any, any>;
  finish: Executor<any, TOutput>;
}): ExecutionPipelineSDIVFExecutionPhaseDelegator<TInput, TOutput>[] {
  const asDelegator = <TIn, TOut>(
    _phase: ExecutionPipelineSDIVFPhase,
    run: Executor<TIn, TOut>,
  ): ExecutionPipelineSDIVFExecutionPhaseDelegator<TIn, TOut> => run;

  return [
    asDelegator(ExecutionPipelineSDIVFPhase.SETUP, config.setup),
    asDelegator(ExecutionPipelineSDIVFPhase.DISCOVERY, config.discovery),
    asDelegator(ExecutionPipelineSDIVFPhase.IMPLEMENTATION, config.implementation),
    asDelegator(ExecutionPipelineSDIVFPhase.VALIDATION, config.validation),
    asDelegator(ExecutionPipelineSDIVFPhase.FINISH, config.finish),
  ];
}
