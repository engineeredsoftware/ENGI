/**
 * SDIVFPipeline phase names and phase-delegator assembly helpers.
 *
 * Hierarchy: phases of an SDIVFPipeline (base + Pipeline primitive).
 */

import type { Agent } from '@bitcode/agent-generics';
import type { PhaseDelegator } from '@bitcode/pipelines-generics/phases/phase-factory';
import { factoryPhaseDelegator } from '@bitcode/pipelines-generics/phases/phase-factory';

/** Canonical SDIVFPipeline phase ids (Setup → Discovery → Implementation → Validation → Finish). */
export enum SDIVFPipelinePhase {
  SETUP = 'setup',
  DISCOVERY = 'discovery',
  IMPLEMENTATION = 'implementation',
  VALIDATION = 'validation',
  FINISH = 'finish',
}

/**
 * Create ordered SDIVFPipeline PhaseDelegators from agents (one agent per phase).
 * Product pipelines may instead supply phase executors to
 * factorySDIVFPipelineFromExecutors.
 */
export function factorySDIVFPipelinePhaseDelegators<TInput, TOutput>(config: {
  setup: Agent<TInput, any>;
  discovery: Agent<any, any>;
  implementation: Agent<any, any>;
  validation: Agent<any, any>;
  finish: Agent<any, TOutput>;
}): PhaseDelegator<TInput, TOutput>[] {
  return [
    factoryPhaseDelegator(SDIVFPipelinePhase.SETUP, config.setup),
    factoryPhaseDelegator(SDIVFPipelinePhase.DISCOVERY, config.discovery),
    factoryPhaseDelegator(SDIVFPipelinePhase.IMPLEMENTATION, config.implementation),
    factoryPhaseDelegator(SDIVFPipelinePhase.VALIDATION, config.validation),
    factoryPhaseDelegator(SDIVFPipelinePhase.FINISH, config.finish),
  ];
}

