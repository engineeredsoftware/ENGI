/**
 * @bitcode/asset-packs-pipelines-synthesize-deposits-asset-packs-pipeline
 *
 * Product pipeline name: **synthesize-deposits-asset-packs-pipeline**
 *
 * Hierarchy (left→right): Execution → Pipeline → SDIVF → SynthesizeDepositAssetPacks
 *   factoryExecutionPipelineSDIVFSynthesizeDepositAssetPacks
 *     → ExecutionPipelineSDIVFSynthesizeDepositAssetPacks
 *
 * Depositor supplies a repository; pipeline synthesizes DepositSynthesizedAssetPack
 * options for Depository review/admission. Not mode/lens-parameterized.
 */

import type { Execution } from '@bitcode/execution-generics';
import {
  factoryExecutionPipelineSDIVFFromExecutors,
  type ExecutionPipelineSDIVF,
} from '@bitcode/generic-pipelines-sdivf';
import {
  depositPhases,
  initializeAssetPackPipeline,
  factoryPreprocessDepositOnly,
  storeCrossPhaseArtifact,
  normalizeAssetPackOutput,
  buildAssetPackPostprocessedResult,
  EXECUTION_PIPELINE_SDIVF_SYNTHESIZE_DEPOSITS_ASSET_PACKS_PROMPT,
  EXECUTION_PHASE_SDIVF_SYNTHESIZE_DEPOSITS_SETUP_PROMPT,
  EXECUTION_PHASE_SDIVF_SYNTHESIZE_DEPOSITS_DISCOVERY_PROMPT,
  EXECUTION_PHASE_SDIVF_SYNTHESIZE_DEPOSITS_IMPLEMENTATION_PROMPT,
  EXECUTION_PHASE_SDIVF_SYNTHESIZE_DEPOSITS_VALIDATION_PROMPT,
  EXECUTION_PHASE_SDIVF_SYNTHESIZE_DEPOSITS_FINISH_PROMPT,
} from '@bitcode/asset-packs-pipelines-domain';

/** Full hierarchy name: ExecutionPipelineSDIVFSynthesizeDepositAssetPacks. */
export type ExecutionPipelineSDIVFSynthesizeDepositAssetPacks = ExecutionPipelineSDIVF<any, any>;

export function factoryExecutionPipelineSDIVFSynthesizeDepositAssetPacks(
  pipelineName: string = 'synthesize-deposits-asset-packs-pipeline',
): ExecutionPipelineSDIVFSynthesizeDepositAssetPacks {
  const maxIterations = 1;
  const sdivf = factoryExecutionPipelineSDIVFFromExecutors(pipelineName, {
    preprocess: factoryPreprocessDepositOnly() as any,
    setup: depositPhases.setup as any,
    discovery: depositPhases.discovery as any,
    implementation: depositPhases.implementation as any,
    validation: depositPhases.validation as any,
    finish: depositPhases.finish as any,
    maxIterations,
    pipelinePromptSpecific: EXECUTION_PIPELINE_SDIVF_SYNTHESIZE_DEPOSITS_ASSET_PACKS_PROMPT,
    phasePromptSpecific: {
      setup: EXECUTION_PHASE_SDIVF_SYNTHESIZE_DEPOSITS_SETUP_PROMPT,
      discovery: EXECUTION_PHASE_SDIVF_SYNTHESIZE_DEPOSITS_DISCOVERY_PROMPT,
      implementation: EXECUTION_PHASE_SDIVF_SYNTHESIZE_DEPOSITS_IMPLEMENTATION_PROMPT,
      validation: EXECUTION_PHASE_SDIVF_SYNTHESIZE_DEPOSITS_VALIDATION_PROMPT,
      finish: EXECUTION_PHASE_SDIVF_SYNTHESIZE_DEPOSITS_FINISH_PROMPT,
    },
    postprocess: (async (output: any, execution: Execution) => {
      const normalized = normalizeAssetPackOutput(output, execution as any);
      return buildAssetPackPostprocessedResult(execution as any, normalized);
    }) as any,
  });

  return async (input, execution) => {
    await initializeAssetPackPipeline(execution as any);
    storeCrossPhaseArtifact(execution, 'pipeline', 'productPipeline', 'synthesize-deposits-asset-packs-pipeline');
    return sdivf(input, execution);
  };
}

export const executionPipelineSDIVFSynthesizeDepositAssetPacks: ExecutionPipelineSDIVFSynthesizeDepositAssetPacks =
  factoryExecutionPipelineSDIVFSynthesizeDepositAssetPacks();

export const runExecutionPipelineSDIVFSynthesizeDepositAssetPacks = executionPipelineSDIVFSynthesizeDepositAssetPacks;
