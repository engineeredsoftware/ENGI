/**
 * @bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-reads-asset-packs
 *
 * Product pipeline name: **synthesize-reads-asset-packs-pipeline**
 *
 * Hierarchy (left→right): Execution → Pipeline → SDIVF → SynthesizeReadAssetPacks
 *   factoryExecutionPipelineSDIVFSynthesizeReadAssetPacks
 *     → ExecutionPipelineSDIVFSynthesizeReadAssetPacks
 *
 * Reader's accepted Need is satisfied by finding + synthesizing
 * ReadSynthesizedAssetPack options. Settlement is settle-asset-pack-pipeline
 * (ExecutionPipelineSimpleSettleAssetPack) — one run per bought option.
 */

import type { Execution } from '@bitcode/execution-generics';
import {
  factoryExecutionPipelineSDIVFFromExecutors,
  type ExecutionPipelineSDIVF,
} from '@bitcode/generic-pipelines-execution-pipeline-sdivf';
import {
  initializeAssetPackPipeline,
  factoryPreprocessReadOnly,
  storeCrossPhaseArtifact,
  normalizeAssetPackOutput,
  buildAssetPackPostprocessedResult,
} from '@bitcode/asset-packs-pipelines-syntheses-domain';
import { readPhases } from './phases/read-phases';
import {
  EXECUTION_PIPELINE_SDIVF_SYNTHESIZE_READS_ASSET_PACKS_PROMPT,
  EXECUTION_PHASE_SDIVF_SYNTHESIZE_READS_SETUP_PROMPT,
  EXECUTION_PHASE_SDIVF_SYNTHESIZE_READS_DISCOVERY_PROMPT,
  EXECUTION_PHASE_SDIVF_SYNTHESIZE_READS_IMPLEMENTATION_PROMPT,
  EXECUTION_PHASE_SDIVF_SYNTHESIZE_READS_VALIDATION_PROMPT,
  EXECUTION_PHASE_SDIVF_SYNTHESIZE_READS_FINISH_PROMPT,
} from './prompts/execution-pipeline-sdivf-synthesize-reads-asset-packs-prompts';

/** Full hierarchy name: ExecutionPipelineSDIVFSynthesizeReadAssetPacks. */
export type ExecutionPipelineSDIVFSynthesizeReadAssetPacks = ExecutionPipelineSDIVF<any, any>;

export function factoryExecutionPipelineSDIVFSynthesizeReadAssetPacks(
  pipelineName: string = 'synthesize-reads-asset-packs-pipeline',
): ExecutionPipelineSDIVFSynthesizeReadAssetPacks {
  const maxIterations = 1;
  const sdivf = factoryExecutionPipelineSDIVFFromExecutors(pipelineName, {
    preprocess: factoryPreprocessReadOnly() as any,
    setup: readPhases.setup as any,
    discovery: readPhases.discovery as any,
    implementation: readPhases.implementation as any,
    validation: readPhases.validation as any,
    finish: readPhases.finish as any,
    maxIterations,
    pipelinePromptSpecific: EXECUTION_PIPELINE_SDIVF_SYNTHESIZE_READS_ASSET_PACKS_PROMPT,
    phasePromptSpecific: {
      setup: EXECUTION_PHASE_SDIVF_SYNTHESIZE_READS_SETUP_PROMPT,
      discovery: EXECUTION_PHASE_SDIVF_SYNTHESIZE_READS_DISCOVERY_PROMPT,
      implementation: EXECUTION_PHASE_SDIVF_SYNTHESIZE_READS_IMPLEMENTATION_PROMPT,
      validation: EXECUTION_PHASE_SDIVF_SYNTHESIZE_READS_VALIDATION_PROMPT,
      finish: EXECUTION_PHASE_SDIVF_SYNTHESIZE_READS_FINISH_PROMPT,
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

export const executionPipelineSDIVFSynthesizeReadAssetPacks: ExecutionPipelineSDIVFSynthesizeReadAssetPacks =
  factoryExecutionPipelineSDIVFSynthesizeReadAssetPacks();

export const runExecutionPipelineSDIVFSynthesizeReadAssetPacks = executionPipelineSDIVFSynthesizeReadAssetPacks;

// Co-located read domain (moved from syntheses/domain)
export * from './read-need';
export * from './read-need-review-resynthesis';
export * from './read-fits-finding-runtime';
export * from './reading-pipeline-contract';
export * from './reading-pipeline-observability';
export * from './reading-interface-product-parity';
export * from './reading-local-staging-rehearsal';
export * from './reading-operational-telemetry-repair-readback';
export * from './interface-disclosure-boundary';
export * from './read-neediness-measurements';
export * from './phases/read-phases';
