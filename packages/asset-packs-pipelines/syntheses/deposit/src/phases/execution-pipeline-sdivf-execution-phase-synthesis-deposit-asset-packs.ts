/**
 * ExecutionPipelineSDIVFSynthesizeDepositAssetPacks — product-specific ExecutionPipelineSDIVFExecutionPhase implementations.
 *
 * Hierarchy: Execution → Pipeline → SDIVF → SynthesizeDepositAssetPacks → ExecutionPhase*.
 * Phases are exclusively SDIVF concepts (Setup / Discovery / Implementation / Validation / Finish).
 * These are deposit product specializations of the SDIVF ExecutionPhase base
 * (ExecutionPipelineSDIVFExecutionPhaseDelegator), one per SDIVF phase.
 *
 * Setup: clone alone → parallel {LSP, MCP, obfuscations} → danger wall alone.
 * Discovery: parallel {comprehend-codebase, inherent-regurgitation}
 *            → search-depository-for-deposit-relevants (after wave 1).
 * Implementation: synthesize deposit AssetPacks (patch + measurements + metadata).
 * Validation: single ready-to-finish deposit gate.
 * Finish: store-artifacts → ledgerize → finish-synthesize-deposit-run.
 */

import { createAgentExecutor } from '@bitcode/pipelines-generics';
import { type ExecutionPipelineSDIVFExecutionPhaseDelegator } from '@bitcode/generic-pipelines-execution-pipeline-sdivf';
import { Executor, sequential, parallel } from '@bitcode/execution-generics';
import type { AssetPackInput, AssetPackOutput } from '@bitcode/asset-packs-pipelines-syntheses-domain/types/PipelineSchemas';
import {
  DISCOVERY_COMPREHEND_CODEBASE,
  DISCOVERY_INHERENT_REGURGITATION,
  DISCOVERY_SEARCH_DEPOSITORY_FOR_DEPOSIT_RELEVANTS,
} from '@bitcode/asset-packs-pipelines-syntheses-domain/phases/discovery';
import { storeCrossPhaseArtifact } from '@bitcode/asset-packs-pipelines-syntheses-domain/synthesize-asset-packs';

type SetupOutput = AssetPackInput;
type DiscoveryOutput = AssetPackInput;
type ImplementationOutput = AssetPackOutput;
type ValidationOutput = AssetPackOutput;

function registerExecutionPipelineSDIVFExecutionPhaseSetupSynthesisDepositAssetPacksAgents(agentRegistry: any): void {
  // One roster key per Setup agent (matches executionPipelineSDIVFExecutionPhaseSetupSynthesisDepositAssetPacks executors).
  agentRegistry.registerAgent(
    'setup:clone-vcs-repository',
    () =>
      import('@bitcode/asset-packs-pipelines-syntheses-domain/agents/setup/asset-pack-clone-vcs-repository-agent').then((m) => m.default),
  );
  agentRegistry.registerAgent(
    'setup:initialize-lsp',
    () => import('@bitcode/asset-packs-pipelines-syntheses-domain/agents/setup/asset-pack-initialize-lsp-agent').then((m) => m.default),
  );
  agentRegistry.registerAgent(
    'setup:initialize-mcps-tools',
    () =>
      import('@bitcode/asset-packs-pipelines-syntheses-domain/agents/setup/asset-pack-initialize-mcps-tools-agent').then((m) => m.default),
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

export const executionPipelineSDIVFExecutionPhaseSetupSynthesisDepositAssetPacks: ExecutionPipelineSDIVFExecutionPhaseDelegator<AssetPackInput, SetupOutput> = (async (
  input: AssetPackInput,
  execution: any,
) => {
  try {
    registerExecutionPipelineSDIVFExecutionPhaseSetupSynthesisDepositAssetPacksAgents((execution as any).agents);
  } catch {}

  // Progressive deposit QA: BITCODE_DEBUG_SETUP_SERIAL=1 runs wave-1 agents
  // sequentially (clone → MCP → obfuscations → LSP) so agent-filter hard-stops
  // do not race a full initialize-lsp PTRR in parallel. Production stays parallel.
  //
  // BITCODE_DEBUG_FAST_SETUP=1 (Discovery QA): Setup phase already Accepted
  // (1.D1–1.D-W). Skip full obfuscations/LSP PTRR so progressive Discovery
  // call-sites are reachable without re-burning ~80 Setup LLM calls each stop.
  // Clone still host-adopts; MCP normalize + danger-wall still run.
  const fastSetup =
    String(process.env.BITCODE_DEBUG_FAST_SETUP || '').toLowerCase() === '1' ||
    String(process.env.BITCODE_DEBUG_FAST_SETUP || '').toLowerCase() === 'true';
  if (fastSetup) {
    (execution as any).agents?.registerAgent?.(
      'setup:comprehend-obfuscations',
      async (passthroughInput: any, exec: any) => {
        // Danger-wall + deposit agents read setup.inputComprehension via
        // storeCrossPhaseArtifact (shared synthesis execution).
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

export const executionPipelineSDIVFExecutionPhaseDiscoverySynthesisDepositAssetPacks: ExecutionPipelineSDIVFExecutionPhaseDelegator<SetupOutput, DiscoveryOutput> = (async (
  input: AssetPackInput,
  execution: any,
) => {
  try {
    const { registerDiscoveryAgents } = await import(
      '@bitcode/asset-packs-pipelines-syntheses-domain/phases/discovery'
    );
    registerDiscoveryAgents((execution as any).agents, 'deposit');
  } catch {}

  // Progressive Discovery QA: when BITCODE_DEBUG_STOP_AGENT_FILTER targets a
  // later wave-1/wave-2 agent, passthrough earlier agents so each stop does not
  // re-burn full multi-tool codebase PTRR (already Accepted 1.D-Agent).
  const stopFilter = String(
    process.env.BITCODE_DEBUG_STOP_AGENT_FILTER || '',
  ).toLowerCase();
  const targetsCodebase =
    !stopFilter ||
    stopFilter.includes('codebasecomprehension') ||
    stopFilter.includes('comprehend-codebase');
  const targetsRegurgitation =
    stopFilter.includes('inherentregurgitation') ||
    stopFilter.includes('inherent-regurgitation') ||
    stopFilter.includes('regurgitation');
  const targetsSearch =
    stopFilter.includes('depository') ||
    stopFilter.includes('search-depository') ||
    stopFilter.includes('searchforrelevants');

  if (stopFilter && !targetsCodebase) {
    (execution as any).agents?.registerAgent?.(
      DISCOVERY_COMPREHEND_CODEBASE,
      async (passthroughInput: any, exec: any) => {
        storeCrossPhaseArtifact(exec, 'discovery', 'codebaseComprehension', {
          schema: 'bitcode.debug.fast-discovery.codebase',
          summary:
            'Fast Discovery: DepositCodebaseComprehension skipped (agent Accepted).',
          capabilities: [],
          knowledgeAreas: [],
          notableModules: [],
        });
        storeCrossPhaseArtifact(exec, 'discovery', 'codebaseAnalysis', {
          schema: 'bitcode.debug.fast-discovery.codebase-analysis',
          skipped: true,
        });
        return passthroughInput;
      },
    );
  }
  if (stopFilter && targetsSearch && !targetsRegurgitation) {
    (execution as any).agents?.registerAgent?.(
      DISCOVERY_INHERENT_REGURGITATION,
      async (passthroughInput: any, exec: any) => {
        storeCrossPhaseArtifact(exec, 'discovery', 'inherentRegurgitation', {
          schema: 'bitcode.debug.fast-discovery.regurgitation',
          summary:
            'Fast Discovery: InherentRegurgitation skipped for depository-search progressive QA.',
          relevantKnowledge: [],
          patterns: [],
          references: [],
        });
        return passthroughInput;
      },
    );
  }

  // Wave 1 parallel → wave 2 depository relevants search (uses comprehension).
  // Progressive Discovery QA: BITCODE_DEBUG_DISCOVERY_SERIAL=1 (or SETUP_SERIAL)
  // runs wave-1 agents sequentially so agent-filter hard-stops do not race the
  // sibling parallel agent past the abort marker.
  const serialDiscovery =
    String(process.env.BITCODE_DEBUG_DISCOVERY_SERIAL || '').toLowerCase() ===
      '1' ||
    String(process.env.BITCODE_DEBUG_DISCOVERY_SERIAL || '').toLowerCase() ===
      'true' ||
    String(process.env.BITCODE_DEBUG_SETUP_SERIAL || '').toLowerCase() ===
      '1' ||
    String(process.env.BITCODE_DEBUG_SETUP_SERIAL || '').toLowerCase() ===
      'true';
  const wave1 = serialDiscovery
    ? sequential(
        createAgentExecutor(DISCOVERY_COMPREHEND_CODEBASE),
        createAgentExecutor(DISCOVERY_INHERENT_REGURGITATION),
      )
    : parallel(
        createAgentExecutor(DISCOVERY_COMPREHEND_CODEBASE),
        createAgentExecutor(DISCOVERY_INHERENT_REGURGITATION),
      );
  const exec: Executor<any, any> = sequential(
    wave1,
    createAgentExecutor(DISCOVERY_SEARCH_DEPOSITORY_FOR_DEPOSIT_RELEVANTS),
  );
  return await exec(input, execution);
}) as unknown as ExecutionPipelineSDIVFExecutionPhaseDelegator<SetupOutput, DiscoveryOutput>;

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
  return await createAgentExecutor('implementation:deposit-asset-pack-synthesis')(input, execution);
}) as unknown as ExecutionPipelineSDIVFExecutionPhaseDelegator<DiscoveryOutput, ImplementationOutput>;

/** Single Validation agent: prior phases + pack quality + obfuscations. */
export const executionPipelineSDIVFExecutionPhaseValidationSynthesisDepositAssetPacks: ExecutionPipelineSDIVFExecutionPhaseDelegator<
  ImplementationOutput,
  ValidationOutput
> = (async (input: any, execution: any) => {
  try {
    // One Validation key only — no deposit-quality / read ready-to-finish aliases.
    (execution as any).agents?.registerAgent?.(
      'validation:ready-to-finish-asset-packs-synthesis-deposit-pipeline',
      () =>
        import('../agents/validation/deposit-ready-to-finish-agent').then((m) => m.default),
    );
  } catch {}
  return await createAgentExecutor(
    'validation:ready-to-finish-asset-packs-synthesis-deposit-pipeline',
  )(input, execution);
}) as unknown as ExecutionPipelineSDIVFExecutionPhaseDelegator<ImplementationOutput, ValidationOutput>;

/** Finish: store-artifacts → ledgerize → finish-synthesize-deposit-run. */
export const executionPipelineSDIVFExecutionPhaseFinishSynthesisDepositAssetPacks: ExecutionPipelineSDIVFExecutionPhaseDelegator<ValidationOutput, AssetPackOutput> = (async (
  input: any,
  execution: any,
) => {
  try {
    (execution as any).agents?.registerAgent?.(
      'finish:store-artifacts',
      () => import('../agents/finish/deposit-store-artifacts-agent').then((m) => m.default),
    );
    (execution as any).agents?.registerAgent?.(
      'finish:ledgerize',
      () => import('@bitcode/asset-packs-pipelines-syntheses-domain/agents/finish/deposit-ledgerize-agent').then((m) => m.default),
    );
    (execution as any).agents?.registerAgent?.(
      'finish:finish-synthesize-asset-packs-for-deposit-run',
      () =>
        import('../agents/finish/deposit-finish-synthesize-run-agent').then((m) => m.default),
    );
  } catch {}

  const exec: Executor<any, any> = sequential(
    createAgentExecutor('finish:store-artifacts'),
    createAgentExecutor('finish:ledgerize'),
    createAgentExecutor('finish:finish-synthesize-asset-packs-for-deposit-run'),
  );
  return await exec(input, execution);
}) as unknown as ExecutionPipelineSDIVFExecutionPhaseDelegator<ValidationOutput, AssetPackOutput>;

export const executionPipelineSDIVFExecutionPhaseSynthesisDepositAssetPacks = {
  setup: executionPipelineSDIVFExecutionPhaseSetupSynthesisDepositAssetPacks,
  discovery: executionPipelineSDIVFExecutionPhaseDiscoverySynthesisDepositAssetPacks,
  implementation: executionPipelineSDIVFExecutionPhaseImplementationSynthesisDepositAssetPacks,
  validation: executionPipelineSDIVFExecutionPhaseValidationSynthesisDepositAssetPacks,
  finish: executionPipelineSDIVFExecutionPhaseFinishSynthesisDepositAssetPacks,
};
