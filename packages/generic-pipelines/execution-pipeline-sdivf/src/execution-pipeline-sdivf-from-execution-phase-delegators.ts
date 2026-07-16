/**
 * Compose an ExecutionPipelineSDIVF from ordered ExecutionPhaseDelegators.
 *
 * These helpers are SDIVF-only (phase vocabulary). Generic ExecutionPipeline
 * composition without phases lives in pipelines-generics / execution-pipeline-simple.
 */

import { sequential, repeat } from '@bitcode/execution-generics';
import type { Execution } from '@bitcode/execution-generics/Execution';
import type { ExecutionPipelineFn } from '@bitcode/pipelines-generics/execution-pipeline-factory';
import { factoryExecutionPipeline } from '@bitcode/pipelines-generics/execution/execution-pipeline-types';
import type { ExecutionPipelineSDIVFExecutionPhaseDelegator } from './execution-pipeline-sdivf-execution-phase';

/**
 * factoryExecutionPipelineSDIVFFromExecutionPhaseDelegators — sequence phase
 * delegators under one ExecutionPipeline EE (no DIV loop).
 */
export function factoryExecutionPipelineSDIVFFromExecutionPhaseDelegators<
  TInput,
  TOutput,
>(
  name: string,
  phases: ExecutionPipelineSDIVFExecutionPhaseDelegator<any, any>[],
): ExecutionPipelineFn<TInput, TOutput> {
  return async (input: TInput, execution: Execution): Promise<TOutput> => {
    const pipelineExec = factoryExecutionPipeline(name, execution);

    pipelineExec.store('pipeline', 'name', name);
    pipelineExec.store('pipeline', 'startTime', Date.now());
    pipelineExec.store('pipeline', 'phaseCount', phases.length);
    pipelineExec.store('pipeline', 'pattern', 'SDIVF');

    const sequentialPhases = sequential(...phases);
    const result = await sequentialPhases(input, pipelineExec);

    pipelineExec.store('pipeline', 'endTime', Date.now());
    pipelineExec.store('pipeline', 'output', result as any);

    return result as TOutput;
  };
}

/**
 * factoryExecutionPipelineSDIVFWithDIVFinishLoop — Setup → [DIV]* → Finish
 * with bounded iterations. Prefer factoryExecutionPipelineSDIVF for full
 * observability + prompt attach.
 */
export function factoryExecutionPipelineSDIVFWithDIVFinishLoop<TInput, TOutput>(
  name: string,
  config: {
    setup: ExecutionPipelineSDIVFExecutionPhaseDelegator<TInput, any>;
    discovery: ExecutionPipelineSDIVFExecutionPhaseDelegator<any, any>;
    implementation: ExecutionPipelineSDIVFExecutionPhaseDelegator<any, any>;
    validation: ExecutionPipelineSDIVFExecutionPhaseDelegator<any, any>;
    finish: ExecutionPipelineSDIVFExecutionPhaseDelegator<any, TOutput>;
    maxIterations?: number;
    validationPredicate?: (result: any, execution: Execution) => boolean;
  },
): ExecutionPipelineFn<TInput, TOutput> {
  const maxIterations = config.maxIterations || 3;
  const validationPredicate =
    config.validationPredicate || ((result, exec) => exec.get('validation', 'passed') === true);

  return async (input: TInput, execution: Execution): Promise<TOutput> => {
    const pipelineExec = factoryExecutionPipeline(name, execution);

    pipelineExec.store('pipeline', 'name', name);
    pipelineExec.store('pipeline', 'startTime', Date.now());
    pipelineExec.store('pipeline', 'divLoop', true);
    pipelineExec.store('pipeline', 'maxIterations', maxIterations);
    pipelineExec.store('pipeline', 'pattern', 'SDIVF');

    let result = await config.setup(input, pipelineExec);

    const divLoop = repeat(
      sequential(config.discovery, config.implementation, config.validation),
      {
        times: maxIterations,
        until: (exec) => validationPredicate(result, exec),
      },
    );

    result = await divLoop(result, pipelineExec);

    const output = await config.finish(result, pipelineExec);

    pipelineExec.store('pipeline', 'endTime', Date.now());
    pipelineExec.store('pipeline', 'output', output as any);
    pipelineExec.store('pipeline', 'iterations', pipelineExec.get('meta', 'iterations') || 1);

    return output;
  };
}
