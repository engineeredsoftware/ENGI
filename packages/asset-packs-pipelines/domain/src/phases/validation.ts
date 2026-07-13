import { createPhaseRunner, PhaseConfig } from '@bitcode/pipelines-generics';
import {
  registerValidationAgentsForType as registerAgents,
  AssetPackValidationReadyToFinishAgent,
} from '../agents/validation-agents';
import { AssetPackWrittenAssetType } from '../types/AssetPackWrittenAssetType';
import type { SynthesizeAssetPacksMode } from '../synthesize-asset-packs';

/**
 * Validation phase configuration placeholder.
 * The actual execution composition for validation lives in phases/index.ts
 * where three validators run in parallel followed by the AssetPack
 * ReadyToFinish agent that gates the canonical Finish phase.
 */
const validationPhaseConfig: PhaseConfig = {
  phaseName: 'validation',
  sequence: [
    { agent: 'validation:asset-pack-ready-to-finish-agent' }
  ],
  allowShortCircuit: true
};

export const runValidationPhase = createPhaseRunner(validationPhaseConfig);

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
    // Deposit lens: a single quality validator over the synthesized AssetPacks,
    // then the canonical ReadyToFinish gate (it reads validation/implementation:issues).
    agentRegistry.registerAgent('validation:deposit-quality', () =>
      import('../agents/validation/deposit-validation-agent').then(m => m.default),
    );
    agentRegistry.registerAgent(
      'validation:asset-pack-ready-to-finish-agent',
      AssetPackValidationReadyToFinishAgent,
    );
    return;
  }
  registerAgents(writtenAssetType || AssetPackWrittenAssetType.ReadSatisfactionAssetPack, agentRegistry);
}
