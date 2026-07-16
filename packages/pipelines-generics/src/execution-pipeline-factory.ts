/**
 * ExecutionPipeline factories (primitive layer).
 *
 * Hierarchy naming law (always encode full ancestry left→right):
 *   ExecutionPipeline                              — primitive (based on Execution)
 *   ExecutionPipelineSDIVF                         — base + primitive
 *   ExecutionPipelineSDIVFSynthesizeAssetPacks     — specific + base + primitive
 *
 * SDIVF base: @bitcode/generic-pipelines-execution-pipeline-sdivf
 * Product:    @bitcode/asset-packs-pipelines-execution-pipeline-*
 */

import { sequential, repeat } from '@bitcode/execution-generics';
import type { Executor } from '@bitcode/execution-generics';
import type { Execution } from '@bitcode/execution-generics/Execution';
import { ExecutionPhaseDelegator } from './phases/execution-phase-factory';
import { factoryExecutionPipeline } from './execution/execution-pipeline-types';

/**
 * Executor form of an ExecutionPipeline (sequences ExecutionPhaseDelegators).
 */
export type ExecutionPipelineFn<TInput = any, TOutput = any> = Executor<TInput, TOutput>;

/**
 * Create an ExecutionPipeline executor that sequences ExecutionPhaseDelegators.
 */
export function factoryExecutionPipelineFromPhases<TInput, TOutput>(
  name: string,
  phases: ExecutionPhaseDelegator<any, any>[],
): ExecutionPipelineFn<TInput, TOutput> {
  return async (input: TInput, execution: Execution): Promise<TOutput> => {
    const pipelineExec = factoryExecutionPipeline(name, execution);

    pipelineExec.store('pipeline', 'name', name);
    pipelineExec.store('pipeline', 'startTime', Date.now());
    pipelineExec.store('pipeline', 'phaseCount', phases.length);

    const sequentialPhases = sequential(...phases);
    const result = await sequentialPhases(input, pipelineExec);

    pipelineExec.store('pipeline', 'endTime', Date.now());
    pipelineExec.store('pipeline', 'output', result as any);

    return result as TOutput;
  };
}

/**
 * Create an ExecutionPipeline with a bounded DIV iteration loop
 * (Discovery → Implementation → Validation), then Finish.
 */
export function factoryExecutionPipelineWithDIVFinishLoop<TInput, TOutput>(
  name: string,
  config: {
    setup: ExecutionPhaseDelegator<TInput, any>;
    discovery: ExecutionPhaseDelegator<any, any>;
    implementation: ExecutionPhaseDelegator<any, any>;
    validation: ExecutionPhaseDelegator<any, any>;
    finish: ExecutionPhaseDelegator<any, TOutput>;
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
