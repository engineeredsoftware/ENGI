/**
 * AssetPack Pipeline Phases
 * 
 * Implements the 5 canonical SDIVF phases using generic agents.
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
import { synthesizeAssetPacksModeFromExecution } from '../synthesize-asset-packs';
import type {
  AssetPackInput,
  AssetPackOutput,
} from '../types/PipelineSchemas';

type SetupOutput = AssetPackInput;
type DiscoveryOutput = AssetPackInput;
type ImplementationOutput = AssetPackOutput;
type ValidationOutput = AssetPackOutput;

// ==================== SETUP PHASE ====================

/**
 * Setup Phase - repository context, read comprehension, and risk admission.
 * Danger-wall performs Bitcode Read/AssetPack admission before iteration.
 */
// Use the Setup phase runner (executor pattern)
export const setupPhase = assetPackSetupPhaseExecutor as unknown as PhaseDelegator<AssetPackInput, SetupOutput>;

// ==================== DISCOVERY PHASE ====================

/**
 * Discovery Phase - Research and approach planning
 */
// Disable other phases during bring-up (no-op delegators)
export const discoveryPhase: PhaseDelegator<SetupOutput, DiscoveryOutput> = (async (input: AssetPackInput, execution: any) => {
  const mode = synthesizeAssetPacksModeFromExecution(execution) ?? 'read';
  try { registerDiscoveryAgents((execution as any).agents, mode); } catch {}
  const exec: Executor<any, any> = mode === 'deposit'
    ? sequential(
        createAgentExecutor('discovery:codebase-comprehension'),
        createAgentExecutor('discovery:depository-search'),
        createAgentExecutor('discovery:inherent-regurgitation')
      )
    : sequential(
        createAgentExecutor('discovery:gather-context'),
        createAgentExecutor('discovery:understand-requirements'),
        createAgentExecutor('discovery:research-approach'),
        createAgentExecutor('discovery:plan-implementation'),
        createAgentExecutor('discovery:assess-complexity')
      );
  return await exec(input, execution);
}) as unknown as PhaseDelegator<SetupOutput, DiscoveryOutput>;

// ==================== IMPLEMENTATION PHASE ====================

/**
 * Implementation Phase - canonical AssetPack synthesis-artifact production.
 *
 * Pull request, review, issue, and comment labels are Finish delivery-mechanism
 * templates. They do not choose implementation behavior.
 */
export const implementationPhase: PhaseDelegator<DiscoveryOutput, ImplementationOutput> = (async (input: any, execution: any) => {
  const mode = synthesizeAssetPacksModeFromExecution(execution) ?? 'read';
  try { registerImplementationAgents((execution as any).agents, mode); } catch {}
  // Deposit uses a deposit-named key for telemetry clarity; read keeps the
  // historical ReadFitsFindingSynthesis implementation key.
  const synthesize = createAgentExecutor(
    mode === 'deposit'
      ? 'implementation:deposit-asset-pack-synthesis'
      : 'implementation:ReadFitsFindingSynthesisAssetPackSynthesisAgent',
  );
  return await synthesize(input, execution);
}) as unknown as PhaseDelegator<DiscoveryOutput, ImplementationOutput>;

// ==================== VALIDATION PHASE ====================

/**
 * Validation Phase - Quality checks and completion verification
 * Danger-wall has been moved to Setup phase
 */
export const validationPhase: PhaseDelegator<ImplementationOutput, ValidationOutput> = (async (input: any, execution: any) => {
  const mode = synthesizeAssetPacksModeFromExecution(execution) ?? 'read';
  const writtenAssetType = resolveWrittenAssetTypeFromExecution(execution);
  try { registerValidationAgentsForType(writtenAssetType, (execution as any).agents, mode); } catch {}

  const parallelValidators = parallel(
    createAgentExecutor('validation:validate-last-iterations-validation-phase'),
    createAgentExecutor('validation:validate-discovery-phase'),
    createAgentExecutor('validation:validate-asset-pack-synthesis-artifacts')
  );
  // Validators return only { issues: string[] } and also write issues into stores:
  //  - validation/last:issues
  //  - validation/discovery:issues
  //  - validation/implementation:issues
  // The final ReadyToFinish agent reads from these stores to decide.
  // Sequential: validators -> ReadyToFinish
  const readyToFinish = createAgentExecutor('validation:asset-pack-ready-to-finish-agent');

  // Deposit lens: validate the synthesized AssetPacks for quality (the deposit
  // validator writes validation/implementation:issues), then the same ReadyToFinish
  // gate. Read lens keeps the canonical parallel validators -> ReadyToFinish.
  const exec: Executor<any, any> = mode === 'deposit'
    ? sequential(
        createAgentExecutor('validation:deposit-quality'),
        readyToFinish     // Final go/no-go before Finish
      )
    : sequential(
        parallelValidators as any,
        readyToFinish     // Final go/no-go before Finish
      );
  return await exec(input, execution);
}) as unknown as PhaseDelegator<ImplementationOutput, ValidationOutput>;

// ==================== FINISH PHASE ====================

/**
 * Finish Phase - save the pipeline result and deliver AssetPacks /
 * AssetPackPartials through pull-request shippables.
 */
export const finishPhase: PhaseDelegator<ValidationOutput, AssetPackOutput> = (async (input: any, execution: any) => {
  const mode = synthesizeAssetPacksModeFromExecution(execution) ?? 'read';
  const deliveryMechanismTemplate = resolveDeliveryMechanismTemplateFromExecution(execution);
  try { registerFinishAgentsForType(deliveryMechanismTemplate, (execution as any).agents, mode); } catch {}
  const exec: Executor<any, any> = sequential(
    createAgentExecutor('finish:deliver-asset-pack-to-destination-agent'),
    createAgentExecutor('finish:asset-pack-completion')
  );
  return await exec(input, execution);
}) as unknown as PhaseDelegator<ValidationOutput, AssetPackOutput>;

// ==================== EXPORT ALL PHASES ====================

export const assetPackPhases = {
  setup: setupPhase,
  discovery: discoveryPhase,
  implementation: implementationPhase,
  validation: validationPhase,
  finish: finishPhase,
};
