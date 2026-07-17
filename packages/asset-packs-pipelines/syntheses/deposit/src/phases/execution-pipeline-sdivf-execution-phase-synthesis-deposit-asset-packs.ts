/**
 * Product roster of SDIVF ExecutionPhase specializations for
 * ExecutionPipelineSDIVFSynthesizeDepositAssetPacks.
 *
 * Hierarchy bag (no phase role): Execution → Pipeline → SDIVF → ExecutionPhase →
 * SynthesisDepositAssetPacks. Holds the five product phase implementations —
 * composition only, not the type parent of Setup/Discovery/….
 *
 * Each role file: execution-pipeline-sdivf-execution-phase-{role}-synthesis-deposit-asset-packs.ts
 */

import type { ExecutionPipelineSDIVFExecutionPhaseDelegator } from '@bitcode/generic-pipelines-execution-pipeline-sdivf';
import type { AssetPackInput, AssetPackOutput } from '@bitcode/asset-packs-pipelines-syntheses-domain/types/PipelineSchemas';
import { executionPipelineSDIVFExecutionPhaseSetupSynthesisDepositAssetPacks } from './execution-pipeline-sdivf-execution-phase-setup-synthesis-deposit-asset-packs';
import { executionPipelineSDIVFExecutionPhaseDiscoverySynthesisDepositAssetPacks } from './execution-pipeline-sdivf-execution-phase-discovery-synthesis-deposit-asset-packs';
import { executionPipelineSDIVFExecutionPhaseImplementationSynthesisDepositAssetPacks } from './execution-pipeline-sdivf-execution-phase-implementation-synthesis-deposit-asset-packs';
import { executionPipelineSDIVFExecutionPhaseValidationSynthesisDepositAssetPacks } from './execution-pipeline-sdivf-execution-phase-validation-synthesis-deposit-asset-packs';
import { executionPipelineSDIVFExecutionPhaseFinishSynthesisDepositAssetPacks } from './execution-pipeline-sdivf-execution-phase-finish-synthesis-deposit-asset-packs';

export type ExecutionPipelineSDIVFExecutionPhaseSynthesisDepositAssetPacks = {
  setup: ExecutionPipelineSDIVFExecutionPhaseDelegator<AssetPackInput, AssetPackInput>;
  discovery: ExecutionPipelineSDIVFExecutionPhaseDelegator<AssetPackInput, AssetPackInput>;
  implementation: ExecutionPipelineSDIVFExecutionPhaseDelegator<AssetPackInput, AssetPackOutput>;
  validation: ExecutionPipelineSDIVFExecutionPhaseDelegator<AssetPackOutput, AssetPackOutput>;
  finish: ExecutionPipelineSDIVFExecutionPhaseDelegator<AssetPackOutput, AssetPackOutput>;
};

export const executionPipelineSDIVFExecutionPhaseSynthesisDepositAssetPacks: ExecutionPipelineSDIVFExecutionPhaseSynthesisDepositAssetPacks =
  {
    setup: executionPipelineSDIVFExecutionPhaseSetupSynthesisDepositAssetPacks,
    discovery: executionPipelineSDIVFExecutionPhaseDiscoverySynthesisDepositAssetPacks,
    implementation:
      executionPipelineSDIVFExecutionPhaseImplementationSynthesisDepositAssetPacks,
    validation: executionPipelineSDIVFExecutionPhaseValidationSynthesisDepositAssetPacks,
    finish: executionPipelineSDIVFExecutionPhaseFinishSynthesisDepositAssetPacks,
  };

export {
  executionPipelineSDIVFExecutionPhaseSetupSynthesisDepositAssetPacks,
  executionPipelineSDIVFExecutionPhaseDiscoverySynthesisDepositAssetPacks,
  executionPipelineSDIVFExecutionPhaseImplementationSynthesisDepositAssetPacks,
  executionPipelineSDIVFExecutionPhaseValidationSynthesisDepositAssetPacks,
  executionPipelineSDIVFExecutionPhaseFinishSynthesisDepositAssetPacks,
};
