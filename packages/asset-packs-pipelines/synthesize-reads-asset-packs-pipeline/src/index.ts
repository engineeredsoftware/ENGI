/**
 * @bitcode/asset-packs-pipelines-synthesize-reads-asset-packs-pipeline
 *
 * Product pipeline name: **synthesize-reads-asset-packs-pipeline**
 *
 * Hierarchy: SynthesizeReadAssetPacks + SDIVF + Pipeline
 *   factorySynthesizeReadAssetPacksSDIVFPipeline
 *     → SynthesizeReadAssetPacksSDIVFPipeline
 *
 * Reader's accepted Need is satisfied by finding + synthesizing
 * ReadSynthesizedAssetPack options. Settlement is settle-asset-pack-pipeline
 * (SettleAssetPackSimplePipeline) — one run per bought option.
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
} from '@bitcode/asset-packs-pipelines-domain';
import {
  ASSET_PACKS_SYNTHESIZE_READS_PIPELINE_PROMPT,
  ASSET_PACKS_SETUP_PHASE_READ_PROMPT,
  ASSET_PACKS_DISCOVERY_PHASE_READ_PROMPT,
  ASSET_PACKS_IMPLEMENTATION_PHASE_READ_PROMPT,
  ASSET_PACKS_VALIDATION_PHASE_READ_PROMPT,
  ASSET_PACKS_FINISH_PHASE_READ_PROMPT,
} from '@bitcode/asset-packs-pipelines-domain';

/** Full hierarchy name: SynthesizeReadAssetPacks + SDIVF + Pipeline. */
export type SynthesizeReadAssetPacksSDIVFPipeline = SDIVFPipeline<any, any>;

export function factorySynthesizeReadAssetPacksSDIVFPipeline(
  pipelineName: string = 'synthesize-reads-asset-packs-pipeline',
): SynthesizeReadAssetPacksSDIVFPipeline {
  const maxIterations = 1;
  const sdivf = factorySDIVFPipelineFromExecutors(pipelineName, {
    preprocess: factoryPreprocessReadOnly() as any,
    setup: readPhases.setup as any,
    discovery: readPhases.discovery as any,
    implementation: readPhases.implementation as any,
    validation: readPhases.validation as any,
    finish: readPhases.finish as any,
    maxIterations,
    pipelinePromptSpecific: ASSET_PACKS_SYNTHESIZE_READS_PIPELINE_PROMPT,
    phasePromptSpecific: {
      setup: ASSET_PACKS_SETUP_PHASE_READ_PROMPT,
      discovery: ASSET_PACKS_DISCOVERY_PHASE_READ_PROMPT,
      implementation: ASSET_PACKS_IMPLEMENTATION_PHASE_READ_PROMPT,
      validation: ASSET_PACKS_VALIDATION_PHASE_READ_PROMPT,
      finish: ASSET_PACKS_FINISH_PHASE_READ_PROMPT,
    },
    postprocess: (async (output: any, execution: Execution) => {
      const normalized = normalizeAssetPackOutput(output, execution as any);
      return buildAssetPackPostprocessedResult(execution as any, normalized);
    }) as any,
  });

  return async (input, execution) => {
    await initializeAssetPackPipeline(execution as any);
    storeCrossPhaseArtifact(execution, 'pipeline', 'productPipeline', 'synthesize-reads-asset-packs-pipeline');
    return sdivf(input, execution);
  };
}

export const synthesizeReadAssetPacksSDIVFPipeline: SynthesizeReadAssetPacksSDIVFPipeline =
  factorySynthesizeReadAssetPacksSDIVFPipeline();

export const runSynthesizeReadAssetPacksSDIVFPipeline = synthesizeReadAssetPacksSDIVFPipeline;
