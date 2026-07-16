/**
 * Phase Delegators - Coordination layer between Pipelines and Agents
 *
 * PhaseDelegators are Executors that delegate work to Agents within
 * pipeline phases. This index re-exports the factory functions.
 *
 * SDIVF phase vocabulary and base loop live in `@bitcode/generic-pipelines-execution-pipeline-sdivf`
 * (re-exported here for compatibility).
 */

export {
  type ExecutionPhaseDelegator,
  factoryPhaseDelegator,
  factorySequentialPhaseDelegator,
  factoryParallelPhaseDelegator,
} from './phase-factory';

export {
  ExecutionPipelineSDIVFPhase,
  factoryExecutionPipelineSDIVFPhaseDelegators,
} from '@bitcode/generic-pipelines-execution-pipeline-sdivf';
