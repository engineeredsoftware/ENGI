/**
 * Deposit-only SDIVF phase rosters for SynthesizeDepositAssetPacksSDIVFPipeline.
 *
 * Setup: clone alone → parallel {LSP, MCP, obfuscations} → danger wall alone.
 * Discovery: parallel {comprehend-codebase, inherent-regurgitation}
 *            → search-depository-for-deposit-relevants (after wave 1).
 * Implementation: synthesize deposit AssetPacks (patch + measurements + metadata).
 * Validation: single ready-to-finish deposit gate.
 * Finish: store-artifacts → ledgerize → finish-synthesize-deposit-run.
 */

import { type PhaseDelegator, createAgentExecutor } from '@bitcode/pipelines-generics';
import { Executor, sequential, parallel } from '@bitcode/execution-generics';
import type { AssetPackInput, AssetPackOutput } from '../types/PipelineSchemas';
import {
  DISCOVERY_COMPREHEND_CODEBASE,
  DISCOVERY_INHERENT_REGURGITATION,
  DISCOVERY_SEARCH_DEPOSITORY_FOR_DEPOSIT_RELEVANTS,
} from './discovery';

type SetupOutput = AssetPackInput;
type DiscoveryOutput = AssetPackInput;
type ImplementationOutput = AssetPackOutput;
type ValidationOutput = AssetPackOutput;

function registerDepositSetupAgents(agentRegistry: any): void {
  // One roster key per Setup agent (matches depositSetupPhase executors).
  agentRegistry.registerAgent(
    'setup:clone-vcs-repository',
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

export const depositDiscoveryPhase: PhaseDelegator<SetupOutput, DiscoveryOutput> = (async (
  input: AssetPackInput,
  execution: any,
) => {
  try {
    const { registerDiscoveryAgents } = await import('./discovery');
    registerDiscoveryAgents((execution as any).agents, 'deposit');
  } catch {}

  // Wave 1 parallel → wave 2 depository relevants search (uses comprehension).
  const exec: Executor<any, any> = sequential(
    parallel(
      createAgentExecutor(DISCOVERY_COMPREHEND_CODEBASE),
      createAgentExecutor(DISCOVERY_INHERENT_REGURGITATION),
    ),
    createAgentExecutor(DISCOVERY_SEARCH_DEPOSITORY_FOR_DEPOSIT_RELEVANTS),
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
  return await createAgentExecutor('implementation:deposit-asset-pack-synthesis')(input, execution);
}) as unknown as PhaseDelegator<DiscoveryOutput, ImplementationOutput>;

/** Single Validation agent: prior phases + pack quality + obfuscations. */
export const depositValidationPhase: PhaseDelegator<
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
}) as unknown as PhaseDelegator<ImplementationOutput, ValidationOutput>;

/** Finish: store-artifacts → ledgerize → finish-synthesize-deposit-run. */
export const depositFinishPhase: PhaseDelegator<ValidationOutput, AssetPackOutput> = (async (
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
      () => import('../agents/finish/deposit-ledgerize-agent').then((m) => m.default),
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
}) as unknown as PhaseDelegator<ValidationOutput, AssetPackOutput>;

export const depositPhases = {
  setup: depositSetupPhase,
  discovery: depositDiscoveryPhase,
  implementation: depositImplementationPhase,
  validation: depositValidationPhase,
  finish: depositFinishPhase,
};
