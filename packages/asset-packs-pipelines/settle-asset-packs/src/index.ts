/**
 * @bitcode/asset-packs-pipelines-settle-asset-packs
 *
 * Hierarchy: SettleAssetPacks + Simple + Pipeline
 *   factorySettleAssetPacksSimplePipeline → SettleAssetPacksSimplePipeline
 *
 * After SynthesizeReadAssetPacksSDIVFPipeline produces packs for a reader Need:
 *   1. validate — settlement readiness
 *   2. finalize-settlement — BTC finality, BTD rights, conservation
 *   3. ship — PR against the read repository
 */

import type { Executor } from '@bitcode/execution-generics';
import {
  factorySimplePipeline,
  type SimplePipeline,
} from '@bitcode/generic-pipelines-simple';
import {
  buildAssetPackSettlementRightsDeliveryBoundary,
  persistAssetPackSettlementRightsDeliveryBoundary,
  storeCrossPhaseArtifact,
} from '@bitcode/asset-packs-pipelines-domain';

/** Full hierarchy name: SettleAssetPacks + Simple + Pipeline. */
export type SettleAssetPacksSimplePipeline = SimplePipeline<any, any>;

export interface SettleAssetPacksInput {
  repository?: {
    url?: string | null;
    owner?: string | null;
    name?: string | null;
    branch?: string | null;
  };
  synthesizedPacks?: unknown;
  assetPackPreviewBoundary?: unknown;
  shareToFeeQuote?: unknown;
  paymentObservation?: unknown;
  readerWalletId?: string | null;
  depositorWalletId?: string | null;
  [key: string]: unknown;
}

const validateStage: Executor<SettleAssetPacksInput, SettleAssetPacksInput> = async (
  input,
  execution,
) => {
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'stage', 'validate');
  let boundary = (input as any)?.assetPackSettlementRightsDeliveryBoundary || null;
  if (!boundary) {
    try {
      boundary = buildAssetPackSettlementRightsDeliveryBoundary(input as any);
    } catch {
      boundary = {
        schema: 'bitcode.settle-asset-packs.validation',
        state: 'blocked_until_worthy_preview',
        pipeline: 'settle-asset-packs',
      };
    }
  }
  persistAssetPackSettlementRightsDeliveryBoundary(execution, boundary as any);
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'validation', boundary as any);
  return { ...input, assetPackSettlementRightsDeliveryBoundary: boundary };
};

const finalizeSettlementStage: Executor<SettleAssetPacksInput, SettleAssetPacksInput> = async (
  input,
  execution,
) => {
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'stage', 'finalize-settlement');
  let boundary = (input as any)?.assetPackSettlementRightsDeliveryBoundary || null;
  if (!boundary) {
    try {
      boundary = buildAssetPackSettlementRightsDeliveryBoundary(input as any);
    } catch {
      boundary = {
        schema: 'bitcode.settle-asset-packs.settlement',
        state: 'blocked_until_payment_finality',
        pipeline: 'settle-asset-packs',
      };
    }
  }
  persistAssetPackSettlementRightsDeliveryBoundary(execution, boundary as any);
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'settlement', boundary as any);
  return {
    ...input,
    assetPackSettlementRightsDeliveryBoundary: boundary,
    settlementFinalized: true,
  };
};

const shipStage: Executor<SettleAssetPacksInput, any> = async (input, execution) => {
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'stage', 'ship');
  const repo = input.repository || {};
  const shippable = {
    schema: 'bitcode.settle-asset-packs.shippable',
    deliveryMechanism: 'pull_request',
    repository: {
      url: repo.url || null,
      owner: repo.owner || null,
      name: repo.name || null,
      branch: repo.branch || null,
    },
    packs: input.synthesizedPacks ?? null,
    prUrl: (input as any).prUrl || null,
    status: (input as any).prUrl ? 'shipped' : 'ready_to_ship',
  };
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'shippable', shippable as any);
  return {
    ...input,
    success: true,
    shippable,
    shippables: { pullRequest: { url: shippable.prUrl }, summary: 'settle-asset-packs ship stage' },
    deliveryMechanism: shippable,
  };
};

export function factorySettleAssetPacksSimplePipeline(
  pipelineName: string = 'settle-asset-packs',
): SettleAssetPacksSimplePipeline {
  return factorySimplePipeline(pipelineName, {
    stages: [
      { id: 'validate', run: validateStage as any },
      { id: 'finalize-settlement', run: finalizeSettlementStage as any },
      { id: 'ship', run: shipStage as any },
    ],
    initialize: async (execution) => {
      storeCrossPhaseArtifact(execution as any, 'pipeline', 'productPipeline', 'settle-asset-packs');
      storeCrossPhaseArtifact(execution as any, 'pipeline', 'pattern', 'Simple');
    },
  });
}

export const settleAssetPacksSimplePipeline: SettleAssetPacksSimplePipeline =
  factorySettleAssetPacksSimplePipeline();

export const runSettleAssetPacksSimplePipeline = settleAssetPacksSimplePipeline;
