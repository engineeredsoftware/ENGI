/**
 * Read Implementation phase: four sequential agents on the same AssetPack(s)
 * — deposit twin.
 *
 *   1. patch-plan — descriptors grounded in Need + Discovery
 *   2. patchfile — write one AssetPackPatchArtifact per pack
 *   3. measurements — absolutes + needinesses (*-fit) + needFit
 *   4. commercial-nl — rich buyer title + description
 *
 * LLM providers receive full source/patch content. Product source-safety is for
 * unpaid user/API surfaces only.
 */

import { createAgentExecutor } from '@bitcode/pipelines-generics';
import { type ExecutionPipelineSDIVFExecutionPhaseDelegator } from '@bitcode/generic-pipelines-execution-pipeline-sdivf';
import { Executor, sequential } from '@bitcode/execution-generics';
import type { AssetPackInput, AssetPackOutput } from '@bitcode/asset-packs-pipelines-syntheses-domain/types/PipelineSchemas';

type DiscoveryOutput = AssetPackInput;
type ImplementationOutput = AssetPackOutput;

const PATCH_PLAN_KEY =
  'implementation:read-implementation-agent-asset-packs-patch-plan';
const PATCHFILE_KEY =
  'implementation:read-implementation-agent-asset-packs-patchfile';
const MEASUREMENTS_KEY =
  'implementation:read-implementation-agent-asset-packs-measurements-synthesis';
const COMMERCIAL_NL_KEY =
  'implementation:read-implementation-agent-asset-packs-commercial-nl';

export const executionPipelineSDIVFExecutionPhaseImplementationSynthesisReadAssetPacks: ExecutionPipelineSDIVFExecutionPhaseDelegator<
  DiscoveryOutput,
  ImplementationOutput
> = (async (input: any, execution: any) => {
  const agents = (execution as any)?.agents;
  if (!agents?.registerAgent) {
    throw new Error(
      'Read Implementation phase requires execution.agents.registerAgent (fail-closed).',
    );
  }
  const { registerImplementationAgents } = await import(
    '@bitcode/asset-packs-pipelines-syntheses-domain/phases/implementation'
  );
  registerImplementationAgents(agents, 'read');

  const exec: Executor<any, any> = sequential(
    createAgentExecutor(PATCH_PLAN_KEY),
    createAgentExecutor(PATCHFILE_KEY),
    createAgentExecutor(MEASUREMENTS_KEY),
    createAgentExecutor(COMMERCIAL_NL_KEY),
  );
  return await exec(input, execution);
}) as unknown as ExecutionPipelineSDIVFExecutionPhaseDelegator<
  DiscoveryOutput,
  ImplementationOutput
>;
