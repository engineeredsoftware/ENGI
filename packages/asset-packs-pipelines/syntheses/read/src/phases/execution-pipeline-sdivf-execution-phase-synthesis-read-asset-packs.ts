/**
 * Product roster of SDIVF ExecutionPhase specializations for
 * ExecutionPipelineSDIVFSynthesizeReadAssetPacks.
 *
 * Hierarchy bag (no phase role): Execution → Pipeline → SDIVF → ExecutionPhase →
 * SynthesisReadAssetPacks. Holds the five product phase implementations —
 * composition only, not the type parent of Setup/Discovery/….
 *
 * Each role file: execution-pipeline-sdivf-execution-phase-{role}-synthesis-read-asset-packs.ts
 */

import type { ExecutionPipelineSDIVFExecutionPhaseDelegator } from '@bitcode/generic-pipelines-execution-pipeline-sdivf';
import type { AssetPackInput, AssetPackOutput } from '@bitcode/asset-packs-pipelines-syntheses-domain/types/PipelineSchemas';
import { executionPipelineSDIVFExecutionPhaseSetupSynthesisReadAssetPacks } from './execution-pipeline-sdivf-execution-phase-setup-synthesis-read-asset-packs';
import { executionPipelineSDIVFExecutionPhaseDiscoverySynthesisReadAssetPacks } from './execution-pipeline-sdivf-execution-phase-discovery-synthesis-read-asset-packs';
import { executionPipelineSDIVFExecutionPhaseImplementationSynthesisReadAssetPacks } from './execution-pipeline-sdivf-execution-phase-implementation-synthesis-read-asset-packs';
import { executionPipelineSDIVFExecutionPhaseValidationSynthesisReadAssetPacks } from './execution-pipeline-sdivf-execution-phase-validation-synthesis-read-asset-packs';
import { executionPipelineSDIVFExecutionPhaseFinishSynthesisReadAssetPacks } from './execution-pipeline-sdivf-execution-phase-finish-synthesis-read-asset-packs';

export type ExecutionPipelineSDIVFExecutionPhaseSynthesisReadAssetPacks = {
  setup: ExecutionPipelineSDIVFExecutionPhaseDelegator<AssetPackInput, AssetPackInput>;
  discovery: ExecutionPipelineSDIVFExecutionPhaseDelegator<AssetPackInput, AssetPackInput>;
  implementation: ExecutionPipelineSDIVFExecutionPhaseDelegator<AssetPackInput, AssetPackOutput>;
  validation: ExecutionPipelineSDIVFExecutionPhaseDelegator<AssetPackOutput, AssetPackOutput>;
  finish: ExecutionPipelineSDIVFExecutionPhaseDelegator<AssetPackOutput, AssetPackOutput>;
};

export const executionPipelineSDIVFExecutionPhaseSynthesisReadAssetPacks: ExecutionPipelineSDIVFExecutionPhaseSynthesisReadAssetPacks =
  {
    setup: executionPipelineSDIVFExecutionPhaseSetupSynthesisReadAssetPacks,
    discovery: executionPipelineSDIVFExecutionPhaseDiscoverySynthesisReadAssetPacks,
    implementation:
      executionPipelineSDIVFExecutionPhaseImplementationSynthesisReadAssetPacks,
    validation: executionPipelineSDIVFExecutionPhaseValidationSynthesisReadAssetPacks,
    finish: executionPipelineSDIVFExecutionPhaseFinishSynthesisReadAssetPacks,
  };

export {
  executionPipelineSDIVFExecutionPhaseSetupSynthesisReadAssetPacks,
  executionPipelineSDIVFExecutionPhaseDiscoverySynthesisReadAssetPacks,
  executionPipelineSDIVFExecutionPhaseImplementationSynthesisReadAssetPacks,
  executionPipelineSDIVFExecutionPhaseValidationSynthesisReadAssetPacks,
  executionPipelineSDIVFExecutionPhaseFinishSynthesisReadAssetPacks,
};
