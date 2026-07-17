/**
 * Product-specific ExecutionPipelineSDIVFExecutionPhase implementation for
 * SynthesisReadAssetPacks.
 *
 * Hierarchy (left→right):
 *   Execution → Pipeline → SDIVF → ExecutionPhase → Validation → SynthesisReadAssetPacks
 *
 * Base type: ExecutionPipelineSDIVFExecutionPhaseDelegator (SDIVF phase base).
 * This file is one SDIVF phase role specializations for the read synthesis product.
 */

import { createAgentExecutor } from '@bitcode/pipelines-generics';
import { type ExecutionPipelineSDIVFExecutionPhaseDelegator } from '@bitcode/generic-pipelines-execution-pipeline-sdivf';
import type { AssetPackOutput } from '@bitcode/asset-packs-pipelines-syntheses-domain/types/PipelineSchemas';

type ImplementationOutput = AssetPackOutput;
type ValidationOutput = AssetPackOutput;

/** ExecutionPipelineSDIVFExecutionPhase Validation specialization for read synthesis. */
export const executionPipelineSDIVFExecutionPhaseValidationSynthesisReadAssetPacks: ExecutionPipelineSDIVFExecutionPhaseDelegator<
  ImplementationOutput,
  ValidationOutput
> = (async (input: any, execution: any) => {
  try {
    (execution as any).agents?.registerAgent?.(
      'validation:ready-to-finish-asset-packs-synthesis-read-pipeline',
      () => import('../agents/validation/read-ready-to-finish-agent').then((m) => m.default),
    );
  } catch {}
  return await createAgentExecutor(
    'validation:ready-to-finish-asset-packs-synthesis-read-pipeline',
  )(input, execution);
}) as unknown as ExecutionPipelineSDIVFExecutionPhaseDelegator<
  ImplementationOutput,
  ValidationOutput
>;
