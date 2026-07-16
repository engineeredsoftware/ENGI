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

import { sequential, conditional, repeat } from '@bitcode/execution-generics';
import type { Executor } from '@bitcode/execution-generics';
import type { Execution } from '@bitcode/execution-generics/Execution';
import { ExecutionPhaseDelegator } from './phases/execution-phase-factory';
import { ExecutionPipeline, factoryExecutionPipeline } from './execution/execution-pipeline-types';

// ==================== PIPELINE EXECUTOR ====================

/**
 * Executor form of an ExecutionPipeline (sequences ExecutionPhaseDelegators).
 */
export type ExecutionPipelineFn<TInput = any, TOutput = any> = Executor<TInput, TOutput>;

/** @deprecated Prefer ExecutionPipelineFn */
export type Pipeline<TInput = any, TOutput = any> = ExecutionPipelineFn<TInput, TOutput>;

/**
 * Create an ExecutionPipeline executor that sequences ExecutionPhaseDelegators.
 */
export function factoryExecutionPipelineFromPhases<TInput, TOutput>(
  name: string,
  phases: ExecutionPhaseDelegator<any, any>[]
): ExecutionPipelineFn<TInput, TOutput> {
  return async (input: TInput, execution: Execution): Promise<TOutput> => {
    // Create pipeline execution
    const pipelineExec = factoryExecutionPipeline(name, execution);
    
    // Store pipeline metadata
    pipelineExec.store('pipeline', 'name', name);
    pipelineExec.store('pipeline', 'startTime', Date.now());
    pipelineExec.store('pipeline', 'phaseCount', phases.length);
    
    // Create sequential executor from phases
    const sequentialPhases = sequential(...phases);
    
    // Execute phases in sequence
    const result = await sequentialPhases(input, pipelineExec);
    
    // Store completion
    pipelineExec.store('pipeline', 'endTime', Date.now());
    pipelineExec.store('pipeline', 'output', result as any);
    
    return result as TOutput;
  };
}

/**
 * Create a Pipeline with DIV iteration loop
 * 
 * The DIV (Discovery-Implementation-Validation) loop can iterate
 * multiple times until validation passes or max iterations reached.
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
  }
): Pipeline<TInput, TOutput> {
  const maxIterations = config.maxIterations || 3;
  const validationPredicate = config.validationPredicate || 
    ((result, exec) => exec.get('validation', 'passed') === true);
  
  return async (input: TInput, execution: Execution): Promise<TOutput> => {
    // Create pipeline execution
    const pipelineExec = factoryExecutionPipeline(name, execution);
    
    // Store pipeline metadata
    pipelineExec.store('pipeline', 'name', name);
    pipelineExec.store('pipeline', 'startTime', Date.now());
    pipelineExec.store('pipeline', 'divLoop', true);
    pipelineExec.store('pipeline', 'maxIterations', maxIterations);
    
    // Execute setup phase
    let result = await config.setup(input, pipelineExec);
    
    // DIV iteration loop
    const divLoop = repeat(
      sequential(
        config.discovery,
        config.implementation,
        config.validation
      ),
      {
        times: maxIterations,
        until: (exec) => validationPredicate(result, exec)
      }
    );
    
    // Execute DIV loop
    result = await divLoop(result, pipelineExec);
    
    // Execute Finish phase: save the run result and optionally deliver assets.
    const output = await config.finish(result, pipelineExec);
    
    // Store completion
    pipelineExec.store('pipeline', 'endTime', Date.now());
    pipelineExec.store('pipeline', 'output', output as any);
    pipelineExec.store('pipeline', 'iterations', 
      pipelineExec.get('meta', 'iterations') || 1);
    
    return output;
  };
}

/** @deprecated Prefer factoryExecutionPipelineWithDIVFinishLoop */
export const factoryPipelineWithDIVFinishLoop = factoryExecutionPipelineWithDIVFinishLoop;

/** @deprecated Prefer factoryExecutionPipelineFromPhases */
export const factoryPipeline = factoryExecutionPipelineFromPhases;
