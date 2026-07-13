/**
 * Phase Delegators - Coordination layer between Pipelines and Agents
 *
 * PhaseDelegators are Executors that delegate work to Agents within
 * pipeline phases. This index re-exports the factory functions.
 *
 * SDIVF phase vocabulary and base loop live in `@bitcode/generic-pipelines-sdivf`
 * (re-exported here for compatibility).
 */

export {
  type PhaseDelegator,
  factoryPhaseDelegator,
  factorySequentialPhaseDelegator,
  factoryParallelPhaseDelegator,
} from './phase-factory';

export {
  SDIVFPipelinePhase,
  SDIVFPhase,
  factorySDIVFPipelinePhaseDelegators,
  factorySDIVFPhaseDelegators,
} from '@bitcode/generic-pipelines-sdivf';
