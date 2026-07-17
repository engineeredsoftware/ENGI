/**
 * Product-specific ExecutionPipelineSDIVFExecutionPhase implementation for
 * SynthesisReadAssetPacks.
 *
 * Hierarchy (left→right):
 *   Execution → Pipeline → SDIVF → ExecutionPhase → Implementation → SynthesisReadAssetPacks
 *
 * Base type: ExecutionPipelineSDIVFExecutionPhaseDelegator (SDIVF phase base).
 * This file is one SDIVF phase role specializations for the read synthesis product.
 */

import { createAgentExecutor } from '@bitcode/pipelines-generics';
import { type ExecutionPipelineSDIVFExecutionPhaseDelegator } from '@bitcode/generic-pipelines-execution-pipeline-sdivf';
import type { AssetPackInput, AssetPackOutput } from '@bitcode/asset-packs-pipelines-syntheses-domain/types/PipelineSchemas';

type DiscoveryOutput = AssetPackInput;
type ImplementationOutput = AssetPackOutput;

/** ExecutionPipelineSDIVFExecutionPhase Implementation specialization for read synthesis. */
export const executionPipelineSDIVFExecutionPhaseImplementationSynthesisReadAssetPacks: ExecutionPipelineSDIVFExecutionPhaseDelegator<
  DiscoveryOutput,
  ImplementationOutput
> = (async (input: any, execution: any) => {
  try {
    (execution as any).agents?.registerAgent?.(
      'implementation:read-asset-pack-synthesis',
      () =>
        import('../agents/implementation/read-asset-pack-synthesis-agent').then(
          (m) => m.default,
        ),
    );
  } catch {}
  return await createAgentExecutor('implementation:read-asset-pack-synthesis')(
    input,
    execution,
  );
}) as unknown as ExecutionPipelineSDIVFExecutionPhaseDelegator<
  DiscoveryOutput,
  ImplementationOutput
>;
