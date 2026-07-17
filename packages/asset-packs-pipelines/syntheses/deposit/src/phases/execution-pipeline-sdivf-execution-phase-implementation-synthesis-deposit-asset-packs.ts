/**
 * Product-specific ExecutionPipelineSDIVFExecutionPhase implementation for
 * SynthesisDepositAssetPacks.
 *
 * Hierarchy (left→right):
 *   Execution → Pipeline → SDIVF → ExecutionPhase → Implementation → SynthesisDepositAssetPacks
 *
 * Base type: ExecutionPipelineSDIVFExecutionPhaseDelegator (SDIVF phase base).
 * This file is one SDIVF phase role specializations for the deposit synthesis product.
 */

import { createAgentExecutor } from '@bitcode/pipelines-generics';
import { type ExecutionPipelineSDIVFExecutionPhaseDelegator } from '@bitcode/generic-pipelines-execution-pipeline-sdivf';
import type { AssetPackInput, AssetPackOutput } from '@bitcode/asset-packs-pipelines-syntheses-domain/types/PipelineSchemas';

type DiscoveryOutput = AssetPackInput;
type ImplementationOutput = AssetPackOutput;

/** ExecutionPipelineSDIVFExecutionPhase Implementation specialization for deposit synthesis. */
export const executionPipelineSDIVFExecutionPhaseImplementationSynthesisDepositAssetPacks: ExecutionPipelineSDIVFExecutionPhaseDelegator<
  DiscoveryOutput,
  ImplementationOutput
> = (async (input: any, execution: any) => {
  try {
    const { registerImplementationAgents } = await import(
      '@bitcode/asset-packs-pipelines-syntheses-domain/phases/implementation'
    );
    registerImplementationAgents((execution as any).agents, 'deposit');
  } catch {}
  return await createAgentExecutor('implementation:deposit-asset-pack-synthesis')(
    input,
    execution,
  );
}) as unknown as ExecutionPipelineSDIVFExecutionPhaseDelegator<
  DiscoveryOutput,
  ImplementationOutput
>;
