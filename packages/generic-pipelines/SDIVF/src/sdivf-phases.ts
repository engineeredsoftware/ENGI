/**
 * SDIVFPipeline phase names — base phase shell only.
 *
 * Hierarchy: phases of an SDIVFPipeline (base + Pipeline primitive).
 * Product pipelines supply phase Executors (agents, tools, rosters live
 * above this package — never in the base SDIVF loop).
 */

import type { Executor } from '@bitcode/execution-generics';
import type { PhaseDelegator } from '@bitcode/pipelines-generics/phases/phase-factory';

/** Canonical SDIVFPipeline phase ids (Setup → Discovery → Implementation → Validation → Finish). */
export enum SDIVFPipelinePhase {
  SETUP = 'setup',
  DISCOVERY = 'discovery',
  IMPLEMENTATION = 'implementation',
  VALIDATION = 'validation',
  FINISH = 'finish',
}

/**
 * Order phase executors as SDIVF PhaseDelegators (Executor-typed; no agents).
 * Prefer factorySDIVFPipelineFromExecutors when building product pipelines.
 */
export function factorySDIVFPipelinePhaseDelegators<TInput, TOutput>(config: {
  setup: Executor<TInput, any>;
  discovery: Executor<any, any>;
  implementation: Executor<any, any>;
  validation: Executor<any, any>;
  finish: Executor<any, TOutput>;
}): PhaseDelegator<TInput, TOutput>[] {
  const asDelegator = <TIn, TOut>(
    _phase: SDIVFPipelinePhase,
    run: Executor<TIn, TOut>,
  ): PhaseDelegator<TIn, TOut> => run;

  return [
    asDelegator(SDIVFPipelinePhase.SETUP, config.setup),
    asDelegator(SDIVFPipelinePhase.DISCOVERY, config.discovery),
    asDelegator(SDIVFPipelinePhase.IMPLEMENTATION, config.implementation),
    asDelegator(SDIVFPipelinePhase.VALIDATION, config.validation),
    asDelegator(SDIVFPipelinePhase.FINISH, config.finish),
  ];
}
