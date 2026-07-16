/**
 * QuickPipeline - Minimal pipeline wrapper around a single "QuickPhase".
 *
 * Intent: formalize non-SDIVF pipelines that consist of a single executor
 * (often an agent sequence or loop) without introducing phase semantics.
 * Phase is SDIVF-specific; QuickPipeline has no phases.
 */

import type { Executor } from '@bitcode/execution-generics';
import type { Pipeline } from './pipeline-factory';
import { factoryExecutionPipeline } from './execution/pipeline-types';

export type QuickPhase<TInput = any, TOutput = any> = Executor<TInput, TOutput>;

export interface QuickPipelineConfig<TInput = any, TOutput = any> {
  phase: QuickPhase<TInput, TOutput>;
  initialize?: (execution: any, input: TInput) => void | Promise<void>;
}

export function factoryQuickPipeline<TInput = any, TOutput = any>(
  name: string,
  cfg: QuickPipelineConfig<TInput, TOutput>
): Pipeline<TInput, TOutput> {
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
    const out = await cfg.phase(input, pipelineExec as any);
    try {
      pipelineExec.store('pipeline', 'endTime', Date.now());
      pipelineExec.store('pipeline', 'output', out as any);
    } catch {}
    return out;
  };
}
