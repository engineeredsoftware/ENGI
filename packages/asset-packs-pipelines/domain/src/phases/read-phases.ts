/**
 * Read-only SDIVF phase rosters for SynthesizeReadAssetPacksSDIVFPipeline.
 *
 * Shape mirrors deposit (same agents/roles; instruction = Need, not Obfuscations):
 * Setup: clone alone → parallel {LSP, MCP, comprehend-needs} → danger-wall alone.
 * Discovery: parallel {comprehend-codebase, search-depository, inherent-regurgitation}.
 * Implementation: synthesize read AssetPacks (patch + absolutes + needinesses *-fit).
 * Validation: single ready-to-finish read gate (A/B/C + needinesses).
 * Finish: store-artifacts → ledgerize → finish-synthesize-read-run (selection envelope).
 *
 * BTC settle / BTD mint / rights / PR ship are **not** this pipeline —
 * they are SettleAssetPackSimplePipeline after the reader pays for options.
 */

import { type PhaseDelegator, createAgentExecutor } from '@bitcode/pipelines-generics';
import { Executor, sequential, parallel } from '@bitcode/execution-generics';
import type { AssetPackInput, AssetPackOutput } from '../types/PipelineSchemas';

type SetupOutput = AssetPackInput;
type DiscoveryOutput = AssetPackInput;
type ImplementationOutput = AssetPackOutput;
type ValidationOutput = AssetPackOutput;

function registerReadSetupAgents(agentRegistry: any): void {
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
    'setup:comprehend-needs',
    () => import('../agents/setup/read-need-comprehension-agent').then((m) => m.default),
  );
  agentRegistry.registerAgent(
    'setup:danger-wall',
    () => import('../agents/setup/read-danger-wall-agent').then((m) => m.default),
  );
}

export const readSetupPhase: PhaseDelegator<AssetPackInput, SetupOutput> = (async (
  input: AssetPackInput,
  execution: any,
) => {
  try {
    registerReadSetupAgents((execution as any).agents);
  } catch {}

  const exec: Executor<any, any> = sequential(
    createAgentExecutor('setup:clone-vcs-repository'),
    parallel(
      createAgentExecutor('setup:initialize-lsp'),
      createAgentExecutor('setup:initialize-mcps-tools'),
      createAgentExecutor('setup:comprehend-needs'),
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

export const readDiscoveryPhase: PhaseDelegator<SetupOutput, DiscoveryOutput> = (async (
  input: AssetPackInput,
  execution: any,
) => {
  try {
    const { registerDiscoveryAgents } = await import('./discovery');
    // Deposit discovery agents (codebase / depository / regurgitation) are shared;
    // register under deposit keys used by the parallel roster below.
    registerDiscoveryAgents((execution as any).agents, 'deposit');
  } catch {}

  const exec: Executor<any, any> = parallel(
    createAgentExecutor('discovery:comprehend-codebase'),
    createAgentExecutor('discovery:search-depository'),
    createAgentExecutor('discovery:inherent-regurgitation'),
  );
  return await exec(input, execution);
}) as unknown as PhaseDelegator<SetupOutput, DiscoveryOutput>;

export const readImplementationPhase: PhaseDelegator<
  DiscoveryOutput,
  ImplementationOutput
> = (async (input: any, execution: any) => {
  try {
    (execution as any).agents?.registerAgent?.(
      'implementation:read-asset-pack-synthesis',
      () => import('../agents/implementation/read-asset-pack-synthesis-agent').then((m) => m.default),
    );
  } catch {}
  return await createAgentExecutor('implementation:read-asset-pack-synthesis')(input, execution);
}) as unknown as PhaseDelegator<DiscoveryOutput, ImplementationOutput>;

export const readValidationPhase: PhaseDelegator<
  ImplementationOutput,
  ValidationOutput
> = (async (input: any, execution: any) => {
  try {
    (execution as any).agents?.registerAgent?.(
      'validation:ready-to-finish-asset-packs-synthesis-read-pipeline',
      () => import('../agents/validation/read-ready-to-finish-agent').then((m) => m.default),
    );
  } catch {}
  return await createAgentExecutor(
    'validation:ready-to-finish-asset-packs-synthesis-read-pipeline',
  )(input, execution);
}) as unknown as PhaseDelegator<ImplementationOutput, ValidationOutput>;

export const readFinishPhase: PhaseDelegator<ValidationOutput, AssetPackOutput> = (async (
  input: any,
  execution: any,
) => {
  try {
    (execution as any).agents?.registerAgent?.(
      'finish:store-artifacts',
      () => import('../agents/finish/read-store-artifacts-agent').then((m) => m.default),
    );
    (execution as any).agents?.registerAgent?.(
      'finish:ledgerize',
      () => import('../agents/finish/deposit-ledgerize-agent').then((m) => m.default),
    );
    (execution as any).agents?.registerAgent?.(
      'finish:finish-synthesize-asset-packs-for-read-run',
      () => import('../agents/finish/read-finish-synthesize-run-agent').then((m) => m.default),
    );
  } catch {}

  const exec: Executor<any, any> = sequential(
    createAgentExecutor('finish:store-artifacts'),
    createAgentExecutor('finish:ledgerize'),
    createAgentExecutor('finish:finish-synthesize-asset-packs-for-read-run'),
  );
  return await exec(input, execution);
}) as unknown as PhaseDelegator<ValidationOutput, AssetPackOutput>;

export const readPhases = {
  setup: readSetupPhase,
  discovery: readDiscoveryPhase,
  implementation: readImplementationPhase,
  validation: readValidationPhase,
  finish: readFinishPhase,
};
