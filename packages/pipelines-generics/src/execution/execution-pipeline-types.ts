/**
 * ExecutionPipeline types — hierarchy naming law:
 * anything based on the Execution primitive encodes full ancestry
 * (e.g. ExecutionPipeline).
 *
 * ExecutionPipeline — EE for top-level pipeline orchestration (primitive).
 *
 * Phases (ExecutionPipelineSDIVFExecutionPhase*) are SDIVF-only and live in
 * @bitcode/generic-pipelines-execution-pipeline-sdivf — not here.
 */

import { ExecutionPipeline } from './ExecutionPipeline';
import type { ExecutionPipelineLineage } from './ExecutionPipeline';
import { inferExecutionPipelineLineage } from './ExecutionPipeline';
import type { Execution } from '@bitcode/execution-generics/Execution';

// Re-export the pipeline EE class
export { ExecutionPipeline } from './ExecutionPipeline';

// Executor form of ExecutionPipeline lives in execution-pipeline-factory.ts
// as ExecutionPipelineFn (Executor-typed).

// ==================== FACTORY FUNCTIONS ====================
/**
 * Create a pipeline execution EE under optional parent Execution.
 */
export function factoryExecutionPipeline(
  name: string,
  parent?: Execution,
  lineage?: ExecutionPipelineLineage,
): ExecutionPipeline {
  return new ExecutionPipeline(
    `pipeline:${name}`,
    parent,
    lineage ?? inferExecutionPipelineLineage(name),
  );
}
