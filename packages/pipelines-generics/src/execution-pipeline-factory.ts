/**
 * ExecutionPipeline executor form (primitive layer).
 *
 * Hierarchy naming law (always encode full ancestry left→right):
 *   ExecutionPipeline                              — primitive (based on Execution)
 *   ExecutionPipelineSDIVF                         — base + primitive (generic-pipelines)
 *   ExecutionPipelineSDIVFSynthesizeAssetPacks     — specific + base + primitive
 *
 * Phase composition and DIV loops live in
 * @bitcode/generic-pipelines-execution-pipeline-sdivf.
 * Linear stages live in @bitcode/generic-pipelines-execution-pipeline-simple.
 */

import type { Executor } from '@bitcode/execution-generics';

/**
 * Executor form of an ExecutionPipeline (any composition of Executors).
 */
export type ExecutionPipelineFn<TInput = any, TOutput = any> = Executor<TInput, TOutput>;
