/**
 * Deposit Implementation phase: three sequential agents on the same AssetPack(s).
 *
 *   1. patch-plan — six-field source-safe descriptors
 *   2. patchfile — write one AssetPackPatchArtifact per pack (7th field)
 *   3. measurements — measure that patch; attach measurements.absolutes
 */

import { createAgentExecutor } from '@bitcode/pipelines-generics';
import { type ExecutionPipelineSDIVFExecutionPhaseDelegator } from '@bitcode/generic-pipelines-execution-pipeline-sdivf';
import { Executor, sequential } from '@bitcode/execution-generics';
import type { AssetPackInput, AssetPackOutput } from '@bitcode/asset-packs-pipelines-syntheses-domain/types/PipelineSchemas';

type DiscoveryOutput = AssetPackInput;
type ImplementationOutput = AssetPackOutput;

const PATCH_PLAN_KEY =
  'implementation:deposit-implementation-agent-asset-packs-patch-plan';
const PATCHFILE_KEY =
  'implementation:deposit-implementation-agent-asset-packs-patchfile';
const MEASUREMENTS_KEY =
  'implementation:deposit-implementation-agent-asset-packs-measurements-synthesis';

export const executionPipelineSDIVFExecutionPhaseImplementationSynthesisDepositAssetPacks: ExecutionPipelineSDIVFExecutionPhaseDelegator<
  DiscoveryOutput,
  ImplementationOutput
> = (async (input: any, execution: any) => {
  const agents = (execution as any)?.agents;
  if (!agents?.registerAgent) {
    throw new Error(
      'Deposit Implementation phase requires execution.agents.registerAgent (fail-closed).',
    );
  }
  const { registerImplementationAgents } = await import(
    '@bitcode/asset-packs-pipelines-syntheses-domain/phases/implementation'
  );
  registerImplementationAgents(agents, 'deposit');

  const exec: Executor<any, any> = sequential(
    createAgentExecutor(PATCH_PLAN_KEY),
    createAgentExecutor(PATCHFILE_KEY),
    createAgentExecutor(MEASUREMENTS_KEY),
  );
  return await exec(input, execution);
}) as unknown as ExecutionPipelineSDIVFExecutionPhaseDelegator<
  DiscoveryOutput,
  ImplementationOutput
>;
