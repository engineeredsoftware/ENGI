/**
 * @bitcode/asset-packs-pipelines-synthesize-reads
 *
 * Hierarchy: SynthesizeReads + SDIVF + Pipeline
 *   factorySynthesizeReadsSDIVFPipeline → SynthesizeReadsSDIVFPipeline
 *
 * Reader's accepted Need is satisfied by finding + synthesizing Need-fitting
 * AssetPacks from the Depository. Settlement (BTC/BTD/rights/PR ship) is
 * SettleReadsSimplePipeline — not this factory.
 */

import type { Execution } from '@bitcode/execution-generics';
import {
  factorySDIVFPipelineFromExecutors,
  type SDIVFPipeline,
} from '@bitcode/generic-pipelines-sdivf';
import {
  readPhases,
  initializeAssetPackPipeline,
  storeCrossPhaseArtifact,
  normalizeAssetPackOutput,
  buildAssetPackPostprocessedResult,
  factoryPreprocessReadOnly,
} from '@bitcode/pipeline-asset-pack';

export type SynthesizeReadsSDIVFPipeline = SDIVFPipeline<any, any>;

export function factorySynthesizeReadsSDIVFPipeline(
  pipelineName: string = 'synthesize-reads',
): SynthesizeReadsSDIVFPipeline {
  const maxIterations = 1;
  const sdivf = factorySDIVFPipelineFromExecutors(pipelineName, {
    preprocess: factoryPreprocessReadOnly() as any,
    setup: readPhases.setup as any,
    discovery: readPhases.discovery as any,
    implementation: readPhases.implementation as any,
    validation: readPhases.validation as any,
    finish: readPhases.finish as any,
    maxIterations,
    postprocess: (async (output: any, execution: Execution) => {
      const normalized = normalizeAssetPackOutput(output, execution as any);
      return buildAssetPackPostprocessedResult(execution as any, normalized);
    }) as any,
  });

  return async (input, execution) => {
    await initializeAssetPackPipeline(execution as any);
    storeCrossPhaseArtifact(execution, 'pipeline', 'productPipeline', 'synthesize-reads');
    return sdivf(input, execution);
  };
}

export const synthesizeReadsSDIVFPipeline: SynthesizeReadsSDIVFPipeline =
  factorySynthesizeReadsSDIVFPipeline();

export const runSynthesizeReadsSDIVFPipeline = synthesizeReadsSDIVFPipeline;
