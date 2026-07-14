/**
 * SimplePipeline base — linear stage sequence (no DIV iteration loop).
 *
 * Hierarchy:
 *   @bitcode/pipelines-generics          Pipeline / Executor primitives
 *   @bitcode/generic-pipelines-simple    this package (Simple + Pipeline)
 *   product                              e.g. SettleAssetPackSimplePipeline
 *
 * Parity: QuickAgent vs PTRRAgent — Simple is the non-iterating pipeline base;
 * SDIVF is the iterative Setup-[DIV]*-Finish base.
 */

import { sequential, type Executor } from '@bitcode/execution-generics';
import type { Execution } from '@bitcode/execution-generics/Execution';
import type { Pipeline } from '@bitcode/pipelines-generics/pipeline-factory';
import {
  factoryPipelineExecution,
  type PipelineExecution,
} from '@bitcode/pipelines-generics/execution/pipeline-types';

/**
 * Simple base Pipeline (hierarchy name: Simple + Pipeline).
 * Product pipelines: SettleAssetPackSimplePipeline, …
 */
export type SimplePipeline<TInput = any, TOutput = any> = Pipeline<TInput, TOutput>;

export interface SimplePipelineStage<TIn = any, TOut = any> {
  /** Stage id for telemetry (e.g. validate, finalize-settlement, ship). */
  id: string;
  run: Executor<TIn, TOut>;
}

export interface SimplePipelineConfig<TInput = any, TOutput = any> {
  /** Ordered linear stages; each receives the previous stage output. */
  stages: SimplePipelineStage[];
  preprocess?: Executor<TInput, any>;
  postprocess?: Executor<any, TOutput>;
  initialize?: (execution: PipelineExecution, input: TInput) => void | Promise<void>;
}

/**
 * factorySimplePipeline — linear SimplePipeline (no Setup-DIV-Finish loop).
 */
export function factorySimplePipeline<TInput = any, TOutput = any>(
  name: string,
  config: SimplePipelineConfig<TInput, TOutput>,
): SimplePipeline<TInput, TOutput> {
  if (!config.stages?.length) {
    throw new Error('factorySimplePipeline requires at least one stage.');
  }

  return async (input: TInput, execution: Execution): Promise<TOutput> => {
    const pipelineExec = factoryPipelineExecution(name, execution);
    pipelineExec.store('pipeline', 'start', { name });
    pipelineExec.store('pipeline', 'pattern', 'Simple');
    pipelineExec.store('pipeline', 'phaseModel', 'linear-stages');
    pipelineExec.store('pipeline', 'name', name);
    pipelineExec.store('pipeline', 'startTime', Date.now());
    pipelineExec.store(
      'pipeline',
      'stages',
      config.stages.map((s) => s.id),
    );

    if (typeof config.initialize === 'function') {
      await config.initialize(pipelineExec, input);
    }

    let result: any = input;
    if (config.preprocess) {
      pipelineExec.store('phase', 'current', 'preprocess');
      result = await config.preprocess(result, pipelineExec);
    }

    for (const stage of config.stages) {
      pipelineExec.store('phase', 'current', stage.id);
      pipelineExec.store('phase', 'start', {
        phase: stage.id,
        startedAt: new Date().toISOString(),
      } as any);
      try {
        result = await stage.run(result, pipelineExec);
        pipelineExec.store('phase', 'complete', {
          phase: stage.id,
          status: 'completed',
          completedAt: new Date().toISOString(),
        } as any);
      } catch (error) {
        pipelineExec.store('phase', 'complete', {
          phase: stage.id,
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
          completedAt: new Date().toISOString(),
        } as any);
        throw error;
      }
    }

    if (config.postprocess) {
      pipelineExec.store('phase', 'current', 'postprocess');
      result = await config.postprocess(result, pipelineExec);
    }

    pipelineExec.store('pipeline', 'endTime', Date.now());
    pipelineExec.store('pipeline', 'success', true);
    pipelineExec.store('pipeline', 'output', result as any);
    pipelineExec.store('pipeline', 'completion', { name, success: true });

    return result as TOutput;
  };
}

/**
 * factorySimplePipelineFromExecutors — stages supplied as a plain ordered list
 * of executors (ids auto-numbered stage-0…).
 */
export function factorySimplePipelineFromExecutors<TInput = any, TOutput = any>(
  name: string,
  stages: Executor<any, any>[],
  options?: Omit<SimplePipelineConfig<TInput, TOutput>, 'stages'>,
): SimplePipeline<TInput, TOutput> {
  return factorySimplePipeline(name, {
    ...options,
    stages: stages.map((run, i) => ({ id: `stage-${i}`, run })),
  });
}

/** Convenience: compose stages with sequential under one Simple pipeline name. */
export function factorySimpleSequentialPipeline<TInput = any, TOutput = any>(
  name: string,
  stages: Executor<any, any>[],
): SimplePipeline<TInput, TOutput> {
  const body = sequential(...stages) as Executor<TInput, TOutput>;
  return factorySimplePipeline(name, {
    stages: [{ id: 'body', run: body }],
  });
}
