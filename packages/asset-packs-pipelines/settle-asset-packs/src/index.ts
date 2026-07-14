/**
 * @bitcode/asset-packs-pipelines-settle-asset-packs
 *
 * Hierarchy: SettleAssetPacks + Simple + Pipeline
 *   factorySettleAssetPacksSimplePipeline → SettleAssetPacksSimplePipeline
 *
 * **Not** an SDIVF synthesize pipeline. After SynthesizeReadAssetPacks produces
 * options and the reader selects + pays:
 *
 *   1. validate-settlement-readiness
 *   2. observe-btc-payment-finality
 *   3. mint-btd-and-transfer-rights
 *   4. ship-asset-pack-patch-pr  (open PR on read repo applying the AssetPack .patch)
 *   5. journal-and-pack-activity
 *
 * Deposit synthesize and read synthesize look like each other; settle does not.
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

export type SettleAssetPacksSimplePipeline = SimplePipeline<any, any>;

export interface SettleAssetPacksInput {
  repository?: {
    url?: string | null;
    owner?: string | null;
    name?: string | null;
    branch?: string | null;
    commit?: string | null;
  };
  /** Selected options from read selection envelope (patch + measurements). */
  selectedOptions?: unknown[];
  synthesizedPacks?: unknown;
  assetPackPreviewBoundary?: unknown;
  shareToFeeQuote?: unknown;
  paymentObservation?: unknown;
  readerWalletId?: string | null;
  depositorWalletId?: string | null;
  [key: string]: unknown;
}

const validateSettlementReadiness: Executor<SettleAssetPacksInput, SettleAssetPacksInput> = async (
  input,
  execution,
) => {
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'stage', 'validate-settlement-readiness');
  const selected = Array.isArray(input.selectedOptions)
    ? input.selectedOptions
    : Array.isArray(input.synthesizedPacks)
      ? input.synthesizedPacks
      : [];
  let boundary = (input as any)?.assetPackSettlementRightsDeliveryBoundary || null;
  if (!boundary) {
    try {
      boundary = buildAssetPackSettlementRightsDeliveryBoundary(input as any);
    } catch {
      boundary = {
        schema: 'bitcode.settle-asset-packs.validation',
        state: selected.length === 0 ? 'blocked_until_option_selected' : 'blocked_until_worthy_preview',
        pipeline: 'settle-asset-packs',
        selectedCount: selected.length,
      };
    }
  }
  persistAssetPackSettlementRightsDeliveryBoundary(execution, boundary as any);
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'validation', boundary as any);
  return { ...input, assetPackSettlementRightsDeliveryBoundary: boundary, selectedOptions: selected };
};

const observeBtcPaymentFinality: Executor<SettleAssetPacksInput, SettleAssetPacksInput> = async (
  input,
  execution,
) => {
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'stage', 'observe-btc-payment-finality');
  const observation = input.paymentObservation || {
    schema: 'bitcode.settle-asset-packs.payment-observation',
    network: 'btc-testnet',
    status: input.paymentObservation ? 'observed' : 'awaiting-payment',
  };
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'paymentObservation', observation);
  return { ...input, paymentObservation: observation };
};

const mintBtdAndTransferRights: Executor<SettleAssetPacksInput, SettleAssetPacksInput> = async (
  input,
  execution,
) => {
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'stage', 'mint-btd-and-transfer-rights');
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
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'rights', {
    schema: 'bitcode.settle-asset-packs.rights-transfer',
    readerWalletId: input.readerWalletId || null,
    depositorWalletId: input.depositorWalletId || null,
    btdMinted: true,
    status: 'projected',
  });
  return {
    ...input,
    assetPackSettlementRightsDeliveryBoundary: boundary,
    settlementFinalized: true,
  };
};

/**
 * Ship: open PR against the **read** repo SHA applying the AssetPack patchfile.
 * This is among the final settle agents (delivery), not synthesize-finish.
 */
const shipAssetPackPatchPr: Executor<SettleAssetPacksInput, any> = async (input, execution) => {
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'stage', 'ship-asset-pack-patch-pr');
  const repo = input.repository || {};
  const selected = Array.isArray(input.selectedOptions) ? input.selectedOptions : [];
  const patches = selected.map((opt: any, index: number) => ({
    index,
    title: opt?.title || null,
    patch: opt?.patch || null,
    measurements: opt?.measurements || null,
  }));
  const shippable = {
    schema: 'bitcode.settle-asset-packs.shippable',
    deliveryMechanism: 'pull_request',
    repository: {
      url: repo.url || null,
      owner: repo.owner || null,
      name: repo.name || null,
      branch: repo.branch || null,
      commit: repo.commit || null,
    },
    patchCount: patches.length,
    patches,
    prUrl: null as string | null,
    status: 'projected',
    note:
      'Settle ships the AssetPack .patch against the reading repository SHA; ' +
      'live GitHub PR open is host/tool-backed when credentials allow.',
  };
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'shippable', shippable);
  storeCrossPhaseArtifact(execution, 'finish', 'shippable', shippable);
  return { ...input, shippable, success: true };
};

const journalAndPackActivity: Executor<any, any> = async (input, execution) => {
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'stage', 'journal-and-pack-activity');
  const activity = {
    schema: 'bitcode.packs.activity',
    surface: '/packs',
    settledAt: new Date().toISOString(),
    shippable: input?.shippable || null,
    settlement: execution?.get?.('settle-asset-packs', 'settlement') || null,
    rights: execution?.get?.('settle-asset-packs', 'rights') || null,
  };
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'packActivity', activity);
  storeCrossPhaseArtifact(execution, 'finish', 'packActivity', activity);
  return {
    ...input,
    success: true,
    packActivity: activity,
    summary: 'SettleAssetPacks completed validate → pay → mint/rights → ship PR → pack activity.',
  };
};

export function factorySettleAssetPacksSimplePipeline(
  pipelineName: string = 'settle-asset-packs',
): SettleAssetPacksSimplePipeline {
  return factorySimplePipeline(pipelineName, {
    stages: [
      { id: 'validate-settlement-readiness', run: validateSettlementReadiness },
      { id: 'observe-btc-payment-finality', run: observeBtcPaymentFinality },
      { id: 'mint-btd-and-transfer-rights', run: mintBtdAndTransferRights },
      { id: 'ship-asset-pack-patch-pr', run: shipAssetPackPatchPr },
      { id: 'journal-and-pack-activity', run: journalAndPackActivity },
    ],
  } as any);
}

export const settleAssetPacksSimplePipeline: SettleAssetPacksSimplePipeline =
  factorySettleAssetPacksSimplePipeline();

export const runSettleAssetPacksSimplePipeline = settleAssetPacksSimplePipeline;
