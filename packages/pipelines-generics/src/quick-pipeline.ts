/**
 * ExecutionPipelineQuick — minimal ExecutionPipeline wrapper around a single executor.
 *
 * Formalizes non-SDIVF ExecutionPipelines that consist of a single executor
 * (often an agent sequence or loop) without SDIVF phase semantics.
 */

import type { Executor } from '@bitcode/execution-generics';
import type { ExecutionPipelineFn } from './execution-pipeline-factory';
import { factoryExecutionPipeline } from './execution/execution-pipeline-types';

export type ExecutionPipelineQuickStage<TInput = any, TOutput = any> = Executor<TInput, TOutput>;

export interface ExecutionPipelineQuickConfig<TInput = any, TOutput = any> {
  stage: ExecutionPipelineQuickStage<TInput, TOutput>;
  initialize?: (execution: any, input: TInput) => void | Promise<void>;
}

export function factoryExecutionPipelineQuick<TInput = any, TOutput = any>(
  name: string,
  cfg: ExecutionPipelineQuickConfig<TInput, TOutput>,
): ExecutionPipelineFn<TInput, TOutput> {
  return async (input, execution) => {
    const pipelineExec = factoryExecutionPipeline(name, execution as any);
    try {
      pipelineExec.store('pipeline', 'name', name);
      pipelineExec.store('pipeline', 'pattern', 'QUICK');
      pipelineExec.store('pipeline', 'startTime', Date.now());
    } catch {}
    if (typeof cfg.initialize === 'function') {
      await cfg.initialize(pipelineExec as any, input);
    }
    const out = await cfg.stage(input, pipelineExec as any);
    try {
      pipelineExec.store('pipeline', 'endTime', Date.now());
      pipelineExec.store('pipeline', 'output', out as any);
    } catch {}
    return out;
  };
}
