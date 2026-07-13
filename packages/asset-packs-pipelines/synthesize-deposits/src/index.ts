/**
 * @bitcode/asset-packs-pipelines-synthesize-deposits
 *
 * Hierarchy: SynthesizeDepositAssetPacks + SDIVF + Pipeline
 *   factorySynthesizeDepositAssetPacksSDIVFPipeline
 *     → SynthesizeDepositAssetPacksSDIVFPipeline
 *
 * Depositor supplies a repository; pipeline synthesizes measured AssetPack
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
  pipelineName: string = 'synthesize-deposit-asset-packs',
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
    storeCrossPhaseArtifact(execution, 'pipeline', 'productPipeline', 'synthesize-deposit-asset-packs');
    return sdivf(input, execution);
  };
}

export const synthesizeDepositAssetPacksSDIVFPipeline: SynthesizeDepositAssetPacksSDIVFPipeline =
  factorySynthesizeDepositAssetPacksSDIVFPipeline();

export const runSynthesizeDepositAssetPacksSDIVFPipeline = synthesizeDepositAssetPacksSDIVFPipeline;

// --- BC short aliases (pre-rename names) ---
/** @deprecated Prefer SynthesizeDepositAssetPacksSDIVFPipeline */
export type SynthesizeDepositsSDIVFPipeline = SynthesizeDepositAssetPacksSDIVFPipeline;
/** @deprecated Prefer factorySynthesizeDepositAssetPacksSDIVFPipeline */
export const factorySynthesizeDepositsSDIVFPipeline = factorySynthesizeDepositAssetPacksSDIVFPipeline;
/** @deprecated Prefer synthesizeDepositAssetPacksSDIVFPipeline */
export const synthesizeDepositsSDIVFPipeline = synthesizeDepositAssetPacksSDIVFPipeline;
/** @deprecated Prefer runSynthesizeDepositAssetPacksSDIVFPipeline */
export const runSynthesizeDepositsSDIVFPipeline = runSynthesizeDepositAssetPacksSDIVFPipeline;
