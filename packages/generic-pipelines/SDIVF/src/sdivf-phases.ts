/**
 * SDIVF phase names and phase-delegator assembly helpers.
 *
 * PhaseDelegator construction uses pipelines-generics phase factories; the
 * SDIVF phase vocabulary and ordered assembly live here as the base layer.
 */

import type { Agent } from '@bitcode/agent-generics';
import type { PhaseDelegator } from '@bitcode/pipelines-generics/phases/phase-factory';
import { factoryPhaseDelegator } from '@bitcode/pipelines-generics/phases/phase-factory';

/** Canonical SDIVF phase ids (Setup → Discovery → Implementation → Validation → Finish). */
export enum SDIVFPhase {
  SETUP = 'setup',
  DISCOVERY = 'discovery',
  IMPLEMENTATION = 'implementation',
  VALIDATION = 'validation',
  FINISH = 'finish',
}

/**
 * Create ordered SDIVF PhaseDelegators from agents (one agent per phase).
 * Product pipelines may instead supply already-composed phase executors to
 * factorySDIVFExecutorPipeline.
 */
export function factorySDIVFPhaseDelegators<TInput, TOutput>(config: {
  setup: Agent<TInput, any>;
  discovery: Agent<any, any>;
  implementation: Agent<any, any>;
  validation: Agent<any, any>;
  finish: Agent<any, TOutput>;
}): PhaseDelegator<TInput, TOutput>[] {
  return [
    factoryPhaseDelegator(SDIVFPhase.SETUP, config.setup),
    factoryPhaseDelegator(SDIVFPhase.DISCOVERY, config.discovery),
    factoryPhaseDelegator(SDIVFPhase.IMPLEMENTATION, config.implementation),
    factoryPhaseDelegator(SDIVFPhase.VALIDATION, config.validation),
    factoryPhaseDelegator(SDIVFPhase.FINISH, config.finish),
  ];
}
