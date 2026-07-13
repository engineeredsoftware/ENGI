/**
 * Read-only SDIVF phase rosters for SynthesizeReadsSDIVFPipeline.
 * No lens/mode branching — this module is read-specific (depository → packs for a Need).
 */

import { type PhaseDelegator, createAgentExecutor } from '@bitcode/pipelines-generics';
import { Executor, sequential, parallel } from '@bitcode/execution-generics';
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

export const readSetupPhase = assetPackSetupPhaseExecutor as unknown as PhaseDelegator<
  AssetPackInput,
  SetupOutput
>;

export const readDiscoveryPhase: PhaseDelegator<SetupOutput, DiscoveryOutput> = (async (
  input: AssetPackInput,
  execution: any,
) => {
  try {
    registerDiscoveryAgents((execution as any).agents, 'read');
  } catch {}
  const exec: Executor<any, any> = sequential(
    createAgentExecutor('discovery:gather-context'),
    createAgentExecutor('discovery:understand-requirements'),
    createAgentExecutor('discovery:research-approach'),
    createAgentExecutor('discovery:plan-implementation'),
    createAgentExecutor('discovery:assess-complexity'),
  );
  return await exec(input, execution);
}) as unknown as PhaseDelegator<SetupOutput, DiscoveryOutput>;

export const readImplementationPhase: PhaseDelegator<
  DiscoveryOutput,
  ImplementationOutput
> = (async (input: any, execution: any) => {
  try {
    registerImplementationAgents((execution as any).agents, 'read');
  } catch {}
  const synthesize = createAgentExecutor(
    'implementation:ReadFitsFindingSynthesisAssetPackSynthesisAgent',
  );
  return await synthesize(input, execution);
}) as unknown as PhaseDelegator<DiscoveryOutput, ImplementationOutput>;

export const readValidationPhase: PhaseDelegator<
  ImplementationOutput,
  ValidationOutput
> = (async (input: any, execution: any) => {
  const writtenAssetType = resolveWrittenAssetTypeFromExecution(execution);
  try {
    registerValidationAgentsForType(writtenAssetType, (execution as any).agents, 'read');
  } catch {}
  const parallelValidators = parallel(
    createAgentExecutor('validation:validate-last-iterations-validation-phase'),
    createAgentExecutor('validation:validate-discovery-phase'),
    createAgentExecutor('validation:validate-asset-pack-synthesis-artifacts'),
  );
  const readyToFinish = createAgentExecutor('validation:asset-pack-ready-to-finish-agent');
  const exec: Executor<any, any> = sequential(parallelValidators as any, readyToFinish);
  return await exec(input, execution);
}) as unknown as PhaseDelegator<ImplementationOutput, ValidationOutput>;

/**
 * Synthesize-reads Finish produces source-safe pack artifacts for settlement;
 * PR ship + BTC/BTD finalize belong on SettleReadsSimplePipeline.
 */
export const readFinishPhase: PhaseDelegator<ValidationOutput, AssetPackOutput> = (async (
  input: any,
  execution: any,
) => {
  const deliveryMechanismTemplate = resolveDeliveryMechanismTemplateFromExecution(execution);
  try {
    registerFinishAgentsForType(deliveryMechanismTemplate, (execution as any).agents, 'read');
  } catch {}
  const exec: Executor<any, any> = sequential(
    createAgentExecutor('finish:deliver-asset-pack-to-destination-agent'),
    createAgentExecutor('finish:asset-pack-completion'),
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
