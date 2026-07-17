import { factoryExecutionPipelineSDIVFExecutionPhaseRunner, ExecutionPipelineSDIVFExecutionPhaseRunnerConfig } from '@bitcode/generic-pipelines-execution-pipeline-sdivf';
import { registerValidationAgentsForType as registerAgents } from '../agents/validation-agents';
import { AssetPackWrittenAssetType } from '../types/AssetPackWrittenAssetType';
import type { SynthesizeAssetPacksMode } from '../synthesize-asset-packs';

/**
 * Validation phase configuration placeholder (read-path phase runner).
 * Deposit Validation is registered/executed only via execution-pipeline-sdivf-execution-phase-synthesis-deposit-asset-packs
 * (`validation:ready-to-finish-asset-packs-synthesis-deposit-pipeline`).
 */
const validationPhaseConfig: ExecutionPipelineSDIVFExecutionPhaseRunnerConfig = {
  phaseName: 'validation',
  sequence: [
    { agent: 'validation:asset-pack-ready-to-finish-agent' }
  ],
  allowShortCircuit: true
};

export const runValidationPhase = factoryExecutionPipelineSDIVFExecutionPhaseRunner(validationPhaseConfig);

/**
 * Register validation agents (delegates to the canonical agents module).
 */
export function registerValidationAgentsForType(
  writtenAssetType: string,
  agentRegistry: any,
  // mode drives conditional registration: deposit validates the synthesized AP
  // patches for deposit review; read validates fits artifacts.
  mode?: SynthesizeAssetPacksMode,
): void {
  if (mode === 'deposit') {
    // Deposit Validation is a single ready-to-finish gate (A/B/C). Prefer the
    // execution-pipeline-sdivf-execution-phase-synthesis-deposit-asset-packs roster key; this path stays for mode-conditional callers.
    agentRegistry.registerAgent(
      'validation:ready-to-finish-asset-packs-synthesis-deposit-pipeline',
      () =>
        import('../../../deposit/src/agents/validation/deposit-ready-to-finish-agent').then((m) => m.default),
    );
    return;
  }
  registerAgents(writtenAssetType || AssetPackWrittenAssetType.ReadSatisfactionAssetPack, agentRegistry);
}
