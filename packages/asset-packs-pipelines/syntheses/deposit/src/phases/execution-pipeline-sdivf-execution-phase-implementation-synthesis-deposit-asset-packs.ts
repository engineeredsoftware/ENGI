/**
 * Product-specific ExecutionPipelineSDIVFExecutionPhase implementation for
 * SynthesisDepositAssetPacks.
 *
 * Hierarchy (left→right):
 *   Execution → Pipeline → SDIVF → ExecutionPhase → Implementation → SynthesisDepositAssetPacks
 *
 * Implementation is TWO sequential agents building the same AssetPack(s):
 *   1. deposit-implementation-agent-asset-packs-patchfile-synthesis
 *      — one source-safe patchfile + metadata per pack
 *   2. deposit-implementation-agent-asset-packs-measurements-synthesis
 *      — measure each patchfile; attach measurements.absolutes only
 *
 * Deposit AssetPack = patch + absolute measurements + metadata.
 * Neediness is Read-pipeline only.
 *
 * Registration failures are fail-closed (no silent catch): a missing agent
 * registry must not produce an opaque empty Implementation phase.
 */

import { createAgentExecutor } from '@bitcode/pipelines-generics';
import { type ExecutionPipelineSDIVFExecutionPhaseDelegator } from '@bitcode/generic-pipelines-execution-pipeline-sdivf';
import { Executor, sequential } from '@bitcode/execution-generics';
import type { AssetPackInput, AssetPackOutput } from '@bitcode/asset-packs-pipelines-syntheses-domain/types/PipelineSchemas';

type DiscoveryOutput = AssetPackInput;
type ImplementationOutput = AssetPackOutput;

const PATCHFILE_KEY =
  'implementation:deposit-implementation-agent-asset-packs-patchfile-synthesis';
const MEASUREMENTS_KEY =
  'implementation:deposit-implementation-agent-asset-packs-measurements-synthesis';

/** ExecutionPipelineSDIVFExecutionPhase Implementation specialization for deposit synthesis. */
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

  // Sequential: patchfile first, then measurements on that patchfile.
  const exec: Executor<any, any> = sequential(
    createAgentExecutor(PATCHFILE_KEY),
    createAgentExecutor(MEASUREMENTS_KEY),
  );
  return await exec(input, execution);
}) as unknown as ExecutionPipelineSDIVFExecutionPhaseDelegator<
  DiscoveryOutput,
  ImplementationOutput
>;
