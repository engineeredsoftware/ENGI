/**
 * Shared Finish helpers for AssetPack synthesis product SDIVF pipelines.
 *
 * Base SDIVF only defines the Finish phase slot (close run / hand off result).
 * Product deposit/read Finish rosters live in execution-pipeline-sdivf-synthesize-deposit-asset-packs-phase-delegators.ts and
 * execution-pipeline-sdivf-synthesize-read-asset-packs-phase-delegators.ts (store-artifacts → ledgerize → finish-synthesize-run).
 *
 * This module only registers the optional Bitcode review-upload path used by
 * residual shared configs. Buyer-repo PR shipping is not this phase: it is
 * stage `ship-asset-pack-patch-pr` on ExecutionPipelineSimpleSettleAssetPack after BTC
 * finality, BTD rights, and co-ownership (separate Simple base, not SDIVF).
 */

import { factoryExecutionPipelineSDIVFExecutionPhaseRunner, ExecutionPipelineSDIVFExecutionPhaseRunnerConfig } from '@bitcode/generic-pipelines-execution-pipeline-sdivf';
import type { SynthesizeAssetPacksMode } from '../synthesize-asset-packs';

/**
 * Shared Finish sequence: upload artifacts for Bitcode review, then completion.
 * No PR / destination delivery here.
 */
function createFinishSequence(): any[] {
  return [
    { agent: 'finish:upload-asset-packs-for-review' },
    { agent: 'finish:asset-pack-completion' },
  ];
}

/**
 * Finish phase configuration (shared residual path; prefer deposit/read rosters).
 */
export function createFinishPhaseConfig(_deliveryMechanismTemplate?: string): ExecutionPipelineSDIVFExecutionPhaseRunnerConfig {
  return {
    phaseName: 'finish',
    sequence: createFinishSequence(),
    allowShortCircuit: false,
  };
}

/**
 * Create the Finish phase runner.
 */
export function runFinishPhase(deliveryMechanismTemplate?: string) {
  return factoryExecutionPipelineSDIVFExecutionPhaseRunner(createFinishPhaseConfig(deliveryMechanismTemplate));
}

/**
 * Register shared Finish agents (review upload + completion only).
 * PR shipping lives exclusively on settle-asset-pack-pipeline.
 */
export function registerFinishAgentsForType(
  _deliveryMechanismTemplate: string,
  agentRegistry: any,
  _mode?: SynthesizeAssetPacksMode,
): void {
  agentRegistry.registerAgent('finish:upload-asset-packs-for-review', () =>
    import('../agents/finish/upload-asset-packs-for-review-agent').then((m) => m.default),
  );
  agentRegistry.registerAgent('finish:asset-pack-completion', () =>
    import('../agents/finish/asset-pack-completion-agent').then((m) => m.default),
  );
}
