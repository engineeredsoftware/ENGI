/**
 * @bitcode/asset-packs-pipelines-synthesize-deposits
 *
 * Hierarchy: SynthesizeDeposits + SDIVF + Pipeline
 *   factorySynthesizeDepositsSDIVFPipeline → SynthesizeDepositsSDIVFPipeline
 *
 * Depositor supplies a repository; pipeline synthesizes measured AssetPack
 * options for Depository review/admission. Not mode/lens-parameterized.
 */

import type { Executor, Execution } from '@bitcode/execution-generics';
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
} from '@bitcode/pipeline-asset-pack';

export type SynthesizeDepositsSDIVFPipeline = SDIVFPipeline<any, any>;

export function factorySynthesizeDepositsSDIVFPipeline(
  pipelineName: string = 'synthesize-deposits',
): SynthesizeDepositsSDIVFPipeline {
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
    storeCrossPhaseArtifact(execution, 'pipeline', 'productPipeline', 'synthesize-deposits');
    return sdivf(input, execution);
  };
}

export const synthesizeDepositsSDIVFPipeline: SynthesizeDepositsSDIVFPipeline =
  factorySynthesizeDepositsSDIVFPipeline();

export const runSynthesizeDepositsSDIVFPipeline = synthesizeDepositsSDIVFPipeline;
