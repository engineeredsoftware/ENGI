/**
 * Deposit-only SDIVF phase rosters for SynthesizeDepositAssetPacksSDIVFPipeline.
 * No lens/mode branching — this module is deposit-specific.
 */

import { type PhaseDelegator, createAgentExecutor } from '@bitcode/pipelines-generics';
import { Executor, sequential } from '@bitcode/execution-generics';
import { assetPackSetupPhaseExecutor } from './setup';
import { registerDiscoveryAgents } from './discovery';
import { registerImplementationAgents } from './implementation';
import { registerValidationAgentsForType } from './validation';
import { registerFinishAgentsForType } from './finish';
import {
  resolveDeliveryMechanismTemplateFromExecution,
  resolveWrittenAssetTypeFromExecution,
} from '../semantic-resolution';
import type { AssetPackInput, AssetPackOutput } from '../types/PipelineSchemas';

type SetupOutput = AssetPackInput;
type DiscoveryOutput = AssetPackInput;
type ImplementationOutput = AssetPackOutput;
type ValidationOutput = AssetPackOutput;

export const depositSetupPhase = assetPackSetupPhaseExecutor as unknown as PhaseDelegator<
  AssetPackInput,
  SetupOutput
>;

export const depositDiscoveryPhase: PhaseDelegator<SetupOutput, DiscoveryOutput> = (async (
  input: AssetPackInput,
  execution: any,
) => {
  try {
    registerDiscoveryAgents((execution as any).agents, 'deposit');
  } catch {}
  const exec: Executor<any, any> = sequential(
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
    registerImplementationAgents((execution as any).agents, 'deposit');
  } catch {}
  const synthesize = createAgentExecutor('implementation:deposit-asset-pack-synthesis');
  return await synthesize(input, execution);
}) as unknown as PhaseDelegator<DiscoveryOutput, ImplementationOutput>;

export const depositValidationPhase: PhaseDelegator<
  ImplementationOutput,
  ValidationOutput
> = (async (input: any, execution: any) => {
  const writtenAssetType = resolveWrittenAssetTypeFromExecution(execution);
  try {
    registerValidationAgentsForType(writtenAssetType, (execution as any).agents, 'deposit');
  } catch {}
  const readyToFinish = createAgentExecutor('validation:asset-pack-ready-to-finish-agent');
  const exec: Executor<any, any> = sequential(
    createAgentExecutor('validation:deposit-quality'),
    readyToFinish,
  );
  return await exec(input, execution);
}) as unknown as PhaseDelegator<ImplementationOutput, ValidationOutput>;

export const depositFinishPhase: PhaseDelegator<ValidationOutput, AssetPackOutput> = (async (
  input: any,
  execution: any,
) => {
  const deliveryMechanismTemplate = resolveDeliveryMechanismTemplateFromExecution(execution);
  try {
    registerFinishAgentsForType(deliveryMechanismTemplate, (execution as any).agents, 'deposit');
  } catch {}
  const exec: Executor<any, any> = sequential(
    createAgentExecutor('finish:deliver-asset-pack-to-destination-agent'),
    createAgentExecutor('finish:asset-pack-completion'),
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
