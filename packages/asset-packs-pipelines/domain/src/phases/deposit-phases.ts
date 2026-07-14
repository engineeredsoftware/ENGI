/**
 * Deposit-only SDIVF phase rosters for SynthesizeDepositAssetPacksSDIVFPipeline.
 *
 * Deposit-native sequence (no Fits Finding / Read-Need agents):
 * Setup: clone alone → parallel {LSP, MCP, obfuscations} → danger wall alone.
 * Discovery: parallel {comprehend-codebase, search-depository, inherent-regurgitation}.
 * Implementation: synthesize deposit AssetPacks (patch + measurements + metadata).
 * Validation: single ready-to-finish deposit gate.
 * Finish: store-artifacts → ledgerize → finish-synthesize-deposit-run.
 */

import { type PhaseDelegator, createAgentExecutor } from '@bitcode/pipelines-generics';
import { Executor, sequential, parallel } from '@bitcode/execution-generics';
import type { AssetPackInput, AssetPackOutput } from '../types/PipelineSchemas';

type SetupOutput = AssetPackInput;
type DiscoveryOutput = AssetPackInput;
type ImplementationOutput = AssetPackOutput;
type ValidationOutput = AssetPackOutput;

function registerDepositSetupAgents(agentRegistry: any): void {
  agentRegistry.registerAgent(
    'setup:clone-vcs-repository',
    () =>
      import('../agents/setup/asset-pack-clone-vcs-repository-agent').then((m) => m.default),
  );
  // Compat alias for older telemetry / tests
  agentRegistry.registerAgent(
    'setup:asset-pack-clone-vcs-repository-agent',
    () =>
      import('../agents/setup/asset-pack-clone-vcs-repository-agent').then((m) => m.default),
  );
  agentRegistry.registerAgent(
    'setup:initialize-lsp',
    () => import('../agents/setup/asset-pack-initialize-lsp-agent').then((m) => m.default),
  );
  agentRegistry.registerAgent(
    'setup:initialize-mcps-tools',
    () =>
      import('../agents/setup/asset-pack-initialize-mcps-tools-agent').then((m) => m.default),
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
 * Setup: clone alone → parallel {LSP, MCP, obfuscations} → danger wall alone.
 */
export const depositSetupPhase: PhaseDelegator<AssetPackInput, SetupOutput> = (async (
  input: AssetPackInput,
  execution: any,
) => {
  try {
    registerDepositSetupAgents((execution as any).agents);
  } catch {}

  const exec: Executor<any, any> = sequential(
    createAgentExecutor('setup:clone-vcs-repository'),
    parallel(
      createAgentExecutor('setup:initialize-lsp'),
      createAgentExecutor('setup:initialize-mcps-tools'),
      createAgentExecutor('setup:comprehend-obfuscations'),
    ),
    createAgentExecutor('setup:danger-wall'),
  );

  try {
    return await exec(input, execution);
  } catch (error: any) {
    // ShortCircuitSignal or hard fail: surface as setup terminal error.
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
}) as unknown as PhaseDelegator<AssetPackInput, SetupOutput>;

/**
 * Discovery: three agents in parallel (measure is inside comprehend-codebase).
 */
export const depositDiscoveryPhase: PhaseDelegator<SetupOutput, DiscoveryOutput> = (async (
  input: AssetPackInput,
  execution: any,
) => {
  try {
    const { registerDiscoveryAgents } = await import('./discovery');
    registerDiscoveryAgents((execution as any).agents, 'deposit');
  } catch {}
  // Deposit-native keys (aliases registered below for discovery register).
  try {
    (execution as any).agents?.registerAgent?.(
      'discovery:comprehend-codebase',
      (execution as any).agents?.getAgent?.('discovery:codebase-comprehension') ||
        (() =>
          import('../agents/discovery/deposit-codebase-comprehension-agent').then(
            (m) => m.default,
          )),
    );
    (execution as any).agents?.registerAgent?.(
      'discovery:search-depository',
      (execution as any).agents?.getAgent?.('discovery:depository-search') ||
        (() =>
          import('../agents/discovery/deposit-depository-search-agent').then((m) => m.default)),
    );
  } catch {}

  const exec: Executor<any, any> = parallel(
    createAgentExecutor('discovery:codebase-comprehension'),
    createAgentExecutor('discovery:depository-search'),
    createAgentExecutor('discovery:inherent-regurgitation'),
  );
  return await exec(input, execution);
}) as unknown as PhaseDelegator<SetupOutput, DiscoveryOutput>;

export const depositImplementationPhase: PhaseDelegator<
  DiscoveryOutput,
  ImplementationOutput
> = (async (input: any, execution: any) => {
  try {
    const { registerImplementationAgents } = await import('./implementation');
    registerImplementationAgents((execution as any).agents, 'deposit');
  } catch {}
  const synthesize = createAgentExecutor('implementation:deposit-asset-pack-synthesis');
  return await synthesize(input, execution);
}) as unknown as PhaseDelegator<DiscoveryOutput, ImplementationOutput>;

/**
 * Validation: single ready-to-finish deposit gate (quality + prior phases + obfuscations).
 * During migration still runs deposit-quality then ready-to-finish; target is one agent.
 */
export const depositValidationPhase: PhaseDelegator<
  ImplementationOutput,
  ValidationOutput
> = (async (input: any, execution: any) => {
  try {
    const { registerValidationAgentsForType } = await import('./validation');
    const { resolveWrittenAssetTypeFromExecution } = await import('../semantic-resolution');
    const writtenAssetType = resolveWrittenAssetTypeFromExecution(execution);
    registerValidationAgentsForType(writtenAssetType, (execution as any).agents, 'deposit');
    // Target single-agent key → same ready-to-finish for now; quality still runs first.
    (execution as any).agents?.registerAgent?.(
      'validation:ready-to-finish-asset-packs-synthesis-deposit-pipeline',
      (execution as any).agents?.getAgent?.('validation:asset-pack-ready-to-finish-agent'),
    );
  } catch {}
  const exec: Executor<any, any> = sequential(
    createAgentExecutor('validation:deposit-quality'),
    createAgentExecutor('validation:asset-pack-ready-to-finish-agent'),
  );
  return await exec(input, execution);
}) as unknown as PhaseDelegator<ImplementationOutput, ValidationOutput>;

/**
 * Finish: store-artifacts → ledgerize → finish-synthesize-deposit-run.
 * Migration: upload-for-review as store-artifacts; completion as final finish.
 */
export const depositFinishPhase: PhaseDelegator<ValidationOutput, AssetPackOutput> = (async (
  input: any,
  execution: any,
) => {
  try {
    const { registerFinishAgentsForType } = await import('./finish');
    const { resolveDeliveryMechanismTemplateFromExecution } = await import(
      '../semantic-resolution'
    );
    const deliveryMechanismTemplate = resolveDeliveryMechanismTemplateFromExecution(execution);
    registerFinishAgentsForType(deliveryMechanismTemplate, (execution as any).agents, 'deposit');

    (execution as any).agents?.registerAgent?.(
      'finish:store-artifacts',
      () =>
        import('../agents/finish/upload-asset-packs-for-review-agent').then((m) => m.default),
    );
    (execution as any).agents?.registerAgent?.(
      'finish:ledgerize',
      async (passthrough: any, exec: any) => {
        // Placeholder: ledger update after durable store (Gate follow-on).
        try {
          exec?.store?.('finish', 'ledgerize', {
            status: 'pending-ledger-binding',
            note: 'On-chain ledger update after store-artifacts; bound in ledgerize gate.',
          });
        } catch {}
        return passthrough;
      },
    );
    (execution as any).agents?.registerAgent?.(
      'finish:finish-synthesize-asset-packs-for-deposit-run',
      () => import('../agents/finish/asset-pack-completion-agent').then((m) => m.default),
    );
  } catch {}

  const exec: Executor<any, any> = sequential(
    createAgentExecutor('finish:store-artifacts'),
    createAgentExecutor('finish:ledgerize'),
    createAgentExecutor('finish:finish-synthesize-asset-packs-for-deposit-run'),
  );
  return await exec(input, execution);
}) as unknown as PhaseDelegator<ValidationOutput, AssetPackOutput>;

export const depositPhases = {
  setup: depositSetupPhase,
  discovery: depositDiscoveryPhase,
  implementation: depositImplementationPhase,
  validation: depositValidationPhase,
  finish: depositFinishPhase,
};
