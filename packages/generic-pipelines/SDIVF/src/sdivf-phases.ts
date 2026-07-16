/**
 * ExecutionPipelineSDIVF phase names — base phase shell only.
 *
 * Hierarchy: phases of an ExecutionPipelineSDIVF (base + Pipeline primitive).
 * Product pipelines supply phase Executors (agents, tools, rosters live
 * above this package — never in the base SDIVF loop).
 */

import type { Executor } from '@bitcode/execution-generics';
import type { ExecutionPhaseDelegator } from '@bitcode/pipelines-generics/phases/phase-factory';

/** Canonical ExecutionPipelineSDIVF phase ids (Setup → Discovery → Implementation → Validation → Finish). */
export enum ExecutionPipelineSDIVFPhase {
  SETUP = 'setup',
  DISCOVERY = 'discovery',
  IMPLEMENTATION = 'implementation',
  VALIDATION = 'validation',
  FINISH = 'finish',
}

/**
 * Order phase executors as SDIVF PhaseDelegators (Executor-typed; no agents).
 * Prefer factoryExecutionPipelineSDIVFFromExecutors when building product pipelines.
 */
export function factoryExecutionPipelineSDIVFPhaseDelegators<TInput, TOutput>(config: {
  setup: Executor<TInput, any>;
  discovery: Executor<any, any>;
  implementation: Executor<any, any>;
  validation: Executor<any, any>;
  finish: Executor<any, TOutput>;
}): ExecutionPhaseDelegator<TInput, TOutput>[] {
  const asDelegator = <TIn, TOut>(
    _phase: ExecutionPipelineSDIVFPhase,
    run: Executor<TIn, TOut>,
  ): ExecutionPhaseDelegator<TIn, TOut> => run;

  return [
    asDelegator(ExecutionPipelineSDIVFPhase.SETUP, config.setup),
    asDelegator(ExecutionPipelineSDIVFPhase.DISCOVERY, config.discovery),
    asDelegator(ExecutionPipelineSDIVFPhase.IMPLEMENTATION, config.implementation),
    asDelegator(ExecutionPipelineSDIVFPhase.VALIDATION, config.validation),
    asDelegator(ExecutionPipelineSDIVFPhase.FINISH, config.finish),
  ];
}
