/**
 * Product-specific ExecutionPipelineSDIVFExecutionPhase implementation for
 * SynthesisDepositAssetPacks.
 *
 * Hierarchy (left→right):
 *   Execution → Pipeline → SDIVF → ExecutionPhase → Validation → SynthesisDepositAssetPacks
 *
 * Base type: ExecutionPipelineSDIVFExecutionPhaseDelegator (SDIVF phase base).
 * This file is one SDIVF phase role specializations for the deposit synthesis product.
 */

import { createAgentExecutor } from '@bitcode/pipelines-generics';
import { type ExecutionPipelineSDIVFExecutionPhaseDelegator } from '@bitcode/generic-pipelines-execution-pipeline-sdivf';
import type { AssetPackInput, AssetPackOutput } from '@bitcode/asset-packs-pipelines-syntheses-domain/types/PipelineSchemas';

type ImplementationOutput = AssetPackOutput;
type ValidationOutput = AssetPackOutput;

/** ExecutionPipelineSDIVFExecutionPhase Validation specialization for deposit synthesis. */
export const executionPipelineSDIVFExecutionPhaseValidationSynthesisDepositAssetPacks: ExecutionPipelineSDIVFExecutionPhaseDelegator<
  ImplementationOutput,
  ValidationOutput
> = (async (input: any, execution: any) => {
  try {
    (execution as any).agents?.registerAgent?.(
      'validation:ready-to-finish-asset-packs-synthesis-deposit-pipeline',
      () =>
        import('../agents/validation/deposit-ready-to-finish-agent').then((m) => m.default),
    );
  } catch {}
  return await createAgentExecutor(
    'validation:ready-to-finish-asset-packs-synthesis-deposit-pipeline',
  )(input, execution);
}) as unknown as ExecutionPipelineSDIVFExecutionPhaseDelegator<
  ImplementationOutput,
  ValidationOutput
>;
