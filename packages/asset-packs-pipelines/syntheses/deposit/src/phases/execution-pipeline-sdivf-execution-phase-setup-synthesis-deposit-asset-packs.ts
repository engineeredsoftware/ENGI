/**
 * Product-specific ExecutionPipelineSDIVFExecutionPhase implementation for
 * SynthesisDepositAssetPacks.
 *
 * Hierarchy (left→right):
 *   Execution → Pipeline → SDIVF → ExecutionPhase → Setup → SynthesisDepositAssetPacks
 *
 * Base type: ExecutionPipelineSDIVFExecutionPhaseDelegator (SDIVF phase base).
 * This file is one SDIVF phase role specializations for the deposit synthesis product.
 */

import { createAgentExecutor } from '@bitcode/pipelines-generics';
import { type ExecutionPipelineSDIVFExecutionPhaseDelegator } from '@bitcode/generic-pipelines-execution-pipeline-sdivf';
import { Executor, sequential, parallel } from '@bitcode/execution-generics';
import type { AssetPackInput } from '@bitcode/asset-packs-pipelines-syntheses-domain/types/PipelineSchemas';
import { storeCrossPhaseArtifact } from '@bitcode/asset-packs-pipelines-syntheses-domain/synthesize-asset-packs';

type SetupOutput = AssetPackInput;

function registerExecutionPipelineSDIVFExecutionPhaseSetupSynthesisDepositAssetPacksAgents(
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
    'setup:comprehend-obfuscations',
    () => import('../agents/setup/deposit-input-comprehension-agent').then((m) => m.default),
  );
  agentRegistry.registerAgent(
    'setup:danger-wall',
    () => import('../agents/setup/deposit-danger-wall-agent').then((m) => m.default),
  );
}

/**
 * ExecutionPipelineSDIVFExecutionPhase Setup specialization for deposit synthesis.
 * Roster: clone → parallel|serial {MCP, obfuscations, LSP} → danger-wall.
 */
export const executionPipelineSDIVFExecutionPhaseSetupSynthesisDepositAssetPacks: ExecutionPipelineSDIVFExecutionPhaseDelegator<
  AssetPackInput,
  SetupOutput
> = (async (input: AssetPackInput, execution: any) => {
  try {
    registerExecutionPipelineSDIVFExecutionPhaseSetupSynthesisDepositAssetPacksAgents(
      (execution as any).agents,
    );
  } catch {}

  // Progressive deposit QA: BITCODE_DEBUG_SETUP_SERIAL=1 runs wave-1 agents
  // sequentially so agent-filter hard-stops do not race initialize-lsp PTRR.
  // BITCODE_DEBUG_FAST_SETUP=1 skips re-PTRR obfuscations/LSP after Setup closed.
  const fastSetup =
    String(process.env.BITCODE_DEBUG_FAST_SETUP || '').toLowerCase() === '1' ||
    String(process.env.BITCODE_DEBUG_FAST_SETUP || '').toLowerCase() === 'true';
  if (fastSetup) {
    (execution as any).agents?.registerAgent?.(
      'setup:comprehend-obfuscations',
      async (passthroughInput: any, exec: any) => {
        const guidance = {
          schema: 'bitcode.debug.fast-setup.obfuscations',
          summary:
            'Fast Setup: obfuscations PTRR skipped (Setup Accepted 1.D10–1.D13).',
          obfuscatedPaths: [] as string[],
          obfuscatedConcepts: [] as string[],
        };
        storeCrossPhaseArtifact(exec, 'setup', 'inputComprehension', guidance);
        storeCrossPhaseArtifact(exec, 'setup', 'obfuscationComprehension', guidance);
        storeCrossPhaseArtifact(exec, 'setup', 'obfuscationGuidance', guidance);
        return passthroughInput;
      },
    );
    (execution as any).agents?.registerAgent?.(
      'setup:initialize-lsp',
      async (passthroughInput: any, exec: any) => {
        storeCrossPhaseArtifact(exec, 'setup', 'lsp', {
          initialized: false,
          residual:
            'fast-setup: LSP PTRR skipped (1.D-L residual still open for live sessions)',
        });
        return passthroughInput;
      },
    );
  }
  const serialSetup =
    String(process.env.BITCODE_DEBUG_SETUP_SERIAL || '').toLowerCase() === '1' ||
    String(process.env.BITCODE_DEBUG_SETUP_SERIAL || '').toLowerCase() === 'true';
  const wave1 = serialSetup
    ? sequential(
        createAgentExecutor('setup:initialize-mcps-tools'),
        createAgentExecutor('setup:comprehend-obfuscations'),
        createAgentExecutor('setup:initialize-lsp'),
      )
    : parallel(
        createAgentExecutor('setup:initialize-lsp'),
        createAgentExecutor('setup:initialize-mcps-tools'),
        createAgentExecutor('setup:comprehend-obfuscations'),
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
