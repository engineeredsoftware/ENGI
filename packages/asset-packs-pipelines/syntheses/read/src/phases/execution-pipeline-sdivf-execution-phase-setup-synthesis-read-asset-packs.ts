/**
 * Product-specific ExecutionPipelineSDIVFExecutionPhase implementation for
 * SynthesisReadAssetPacks.
 *
 * Hierarchy (left→right):
 *   Execution → Pipeline → SDIVF → ExecutionPhase → Setup → SynthesisReadAssetPacks
 *
 * Base type: ExecutionPipelineSDIVFExecutionPhaseDelegator (SDIVF phase base).
 * This file is one SDIVF phase role specializations for the read synthesis product.
 */

import { createAgentExecutor } from '@bitcode/pipelines-generics';
import { type ExecutionPipelineSDIVFExecutionPhaseDelegator } from '@bitcode/generic-pipelines-execution-pipeline-sdivf';
import { Executor, sequential, parallel } from '@bitcode/execution-generics';
import type { AssetPackInput } from '@bitcode/asset-packs-pipelines-syntheses-domain/types/PipelineSchemas';

type SetupOutput = AssetPackInput;

function registerExecutionPipelineSDIVFExecutionPhaseSetupSynthesisReadAssetPacksAgents(
  agentRegistry: any,
): void {
  agentRegistry.registerAgent(
    'setup:clone-vcs-repository',
    () =>
      import('@bitcode/asset-packs-pipelines-syntheses-domain/agents/setup/asset-pack-clone-vcs-repository-agent').then(
        (m) => m.default,
      ),
  );
  agentRegistry.registerAgent(
    'setup:initialize-lsp',
    () =>
      import('@bitcode/asset-packs-pipelines-syntheses-domain/agents/setup/asset-pack-initialize-lsp-agent').then(
        (m) => m.default,
      ),
  );
  agentRegistry.registerAgent(
    'setup:initialize-mcps-tools',
    () =>
      import('@bitcode/asset-packs-pipelines-syntheses-domain/agents/setup/asset-pack-initialize-mcps-tools-agent').then(
        (m) => m.default,
      ),
  );
  agentRegistry.registerAgent(
    'setup:comprehend-needs',
    () => import('../agents/setup/read-need-comprehension-agent').then((m) => m.default),
  );
  agentRegistry.registerAgent(
    'setup:danger-wall',
    () => import('../agents/setup/read-danger-wall-agent').then((m) => m.default),
  );
}

/**
 * ExecutionPipelineSDIVFExecutionPhase Setup specialization for read synthesis.
 * Roster: clone → parallel {LSP, MCP, comprehend-needs} → danger-wall.
 */
export const executionPipelineSDIVFExecutionPhaseSetupSynthesisReadAssetPacks: ExecutionPipelineSDIVFExecutionPhaseDelegator<
  AssetPackInput,
  SetupOutput
> = (async (input: AssetPackInput, execution: any) => {
  try {
    registerExecutionPipelineSDIVFExecutionPhaseSetupSynthesisReadAssetPacksAgents(
      (execution as any).agents,
    );
  } catch {}

  const serialSetup =
    String(process.env.BITCODE_DEBUG_SETUP_SERIAL || '').toLowerCase() === '1' ||
    String(process.env.BITCODE_DEBUG_SETUP_SERIAL || '').toLowerCase() === 'true';
  const wave1 = serialSetup
    ? sequential(
        createAgentExecutor('setup:initialize-mcps-tools'),
        createAgentExecutor('setup:comprehend-needs'),
        createAgentExecutor('setup:initialize-lsp'),
      )
    : parallel(
        createAgentExecutor('setup:initialize-lsp'),
        createAgentExecutor('setup:initialize-mcps-tools'),
        createAgentExecutor('setup:comprehend-needs'),
      );

  const exec: Executor<any, any> = sequential(
    createAgentExecutor('setup:clone-vcs-repository'),
    wave1,
    createAgentExecutor('setup:danger-wall'),
  );

  try {
    return await exec(input, execution);
  } catch (error: any) {
    const message = error?.message || String(error);
    try {
      (execution as any).store?.('pipeline', 'terminalError', {
        phase: 'setup',
        shortCircuited: true,
        reason: message,
      });
    } catch {}
    throw error;
  }
}) as unknown as ExecutionPipelineSDIVFExecutionPhaseDelegator<AssetPackInput, SetupOutput>;
