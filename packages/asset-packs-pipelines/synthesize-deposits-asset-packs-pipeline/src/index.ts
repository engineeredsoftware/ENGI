/**
 * @bitcode/asset-packs-pipelines-synthesize-deposits-asset-packs-pipeline
 *
 * Product pipeline name: **synthesize-deposits-asset-packs-pipeline**
 *
 * Hierarchy: SynthesizeDepositAssetPacks + SDIVF + Pipeline
 *   factorySynthesizeDepositAssetPacksSDIVFPipeline
 *     → SynthesizeDepositAssetPacksSDIVFPipeline
 *
 * Depositor supplies a repository; pipeline synthesizes DepositSynthesizedAssetPack
 * options for Depository review/admission. Not mode/lens-parameterized.
 */

import type { Execution } from '@bitcode/execution-generics';
import {
  factorySDIVFPipelineFromExecutors,
  type SDIVFPipeline,
} from '@bitcode/generic-pipelines-sdivf';
import {
  depositPhases,
  initializeAssetPackPipeline,
  factoryPreprocessDepositOnly,
  storeCrossPhaseArtifact,
  normalizeAssetPackOutput,
  buildAssetPackPostprocessedResult,
} from '@bitcode/asset-packs-pipelines-domain';

/** Full hierarchy name: SynthesizeDepositAssetPacks + SDIVF + Pipeline. */
export type SynthesizeDepositAssetPacksSDIVFPipeline = SDIVFPipeline<any, any>;

export function factorySynthesizeDepositAssetPacksSDIVFPipeline(
  pipelineName: string = 'synthesize-deposits-asset-packs-pipeline',
): SynthesizeDepositAssetPacksSDIVFPipeline {
  const maxIterations = 1;
  const sdivf = factorySDIVFPipelineFromExecutors(pipelineName, {
    preprocess: factoryPreprocessDepositOnly() as any,
    setup: depositPhases.setup as any,
    discovery: depositPhases.discovery as any,
    implementation: depositPhases.implementation as any,
    validation: depositPhases.validation as any,
    finish: depositPhases.finish as any,
    maxIterations,
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

export const synthesizeDepositAssetPacksSDIVFPipeline: SynthesizeDepositAssetPacksSDIVFPipeline =
  factorySynthesizeDepositAssetPacksSDIVFPipeline();

export const runSynthesizeDepositAssetPacksSDIVFPipeline = synthesizeDepositAssetPacksSDIVFPipeline;
