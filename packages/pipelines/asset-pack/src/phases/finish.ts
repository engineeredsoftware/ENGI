/**
 * Finish Phase - AssetPack Pipeline
 * 
 * Final phase that saves the run result and performs Delivering when requested:
 * 1. Provide AssetPacks/AssetPackPartials to third-party destinations
 * 2. Gather completion metrics from all phases
 * 3. Generate AssetPack completion evidence
 * 4. Finalize the pipeline run
 */

import { createPhaseRunner, PhaseConfig } from '@bitcode/pipelines-generics';
import type { SynthesizeAssetPacksMode } from '../synthesize-asset-packs';

/**
 * Create the canonical Finish sequence for AssetPack runs.
*
 * Delivery-mechanism templates are consumed by the Deliver agent; they do not
 * change the broad Finish sequence.
 */
function createFinishSequence(_deliveryMechanismTemplate: string): any[] {
  // Exactly two agents: Deliver (PTRR) then AssetPackCompletion (Quick).
  return [
    { agent: 'finish:deliver-asset-pack-to-destination-agent' },
    { agent: 'finish:asset-pack-completion' }
  ];
}

/**
 * Finish phase configuration.
 */
export function createFinishPhaseConfig(deliveryMechanismTemplate: string): PhaseConfig {
  return {
    phaseName: 'finish',
    sequence: createFinishSequence(deliveryMechanismTemplate),
    allowShortCircuit: false // Finish never short-circuits
  };
}

/**
 * Create the Finish phase runner.
 */
export function runFinishPhase(deliveryMechanismTemplate: string) {
  return createPhaseRunner(createFinishPhaseConfig(deliveryMechanismTemplate));
}

/**
 * Register Finish agents for the requested delivery-mechanism template.
 * Called after validation phase.
 */
export function registerFinishAgentsForType(
  _deliveryMechanismTemplate: string,
  agentRegistry: any,
  // BOTH synthesis modes Finish by uploading the synthesized artifacts to
  // Bitcode for user review (deposit: before Depository admission; read: before
  // purchase). Opening a pull request is NO LONGER part of synthesis — PR /
  // settlement delivery moves to the future Gate-6 SettleAssetPacks pipeline
  // (the legacy deliver-asset-pack-to-destination-agent is retained for it).
  _mode?: SynthesizeAssetPacksMode,
): void {
  agentRegistry.registerAgent('finish:deliver-asset-pack-to-destination-agent', () =>
    import('../agents/finish/upload-asset-packs-for-review-agent').then(m => m.default),
  );
  agentRegistry.registerAgent('finish:asset-pack-completion', () =>
    import('../agents/finish/asset-pack-completion-agent').then(m => m.default),
  );
}
