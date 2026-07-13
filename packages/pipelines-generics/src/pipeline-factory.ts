/**
 * Pipeline Factory — Pipeline *primitive* factories.
 *
 * Hierarchy naming law (always encode full ancestry):
 *   Pipeline                              — primitive
 *   SDIVFPipeline                         — base + primitive
 *   SynthesizeAssetPacksSDIVFPipeline     — specific + base + primitive
 *
 * SDIVF base: @bitcode/generic-pipelines-sdivf
 * Product:    @bitcode/pipeline-asset-pack
 */

import { sequential, conditional, repeat } from '@bitcode/execution-generics';
import type { Executor } from '@bitcode/execution-generics';
import type { Execution } from '@bitcode/execution-generics/Execution';
import { PhaseDelegator } from './phases/phase-factory';
import { PipelineExecution, factoryPipelineExecution } from './execution/pipeline-types';

// ==================== PIPELINE EXECUTOR ====================

/**
 * Pipeline - The top-level Executor that sequences Phases
 */
export type Pipeline<TInput = any, TOutput = any> = Executor<TInput, TOutput>;

/**
 * Create a Pipeline that sequences Phases
 */
export function factoryPipeline<TInput, TOutput>(
  name: string,
  phases: PhaseDelegator<any, any>[]
): Pipeline<TInput, TOutput> {
  return async (input: TInput, execution: Execution): Promise<TOutput> => {
    // Create pipeline execution
    const pipelineExec = factoryPipelineExecution(name, execution);
    
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
export function factoryPipelineWithDIVFinishLoop<TInput, TOutput>(
  name: string,
  config: {
    setup: PhaseDelegator<TInput, any>;
    discovery: PhaseDelegator<any, any>;
    implementation: PhaseDelegator<any, any>;
    validation: PhaseDelegator<any, any>;
    finish: PhaseDelegator<any, TOutput>;
    maxIterations?: number;
    validationPredicate?: (result: any, execution: Execution) => boolean;
  }
): Pipeline<TInput, TOutput> {
  const maxIterations = config.maxIterations || 3;
  const validationPredicate = config.validationPredicate || 
    ((result, exec) => exec.get('validation', 'passed') === true);
  
  return async (input: TInput, execution: Execution): Promise<TOutput> => {
    // Create pipeline execution
    const pipelineExec = factoryPipelineExecution(name, execution);
    
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
