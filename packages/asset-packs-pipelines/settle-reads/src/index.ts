/**
 * @bitcode/asset-packs-pipelines-settle-reads
 *
 * Hierarchy: SettleReads + Simple + Pipeline
 *   factorySettleReadsSimplePipeline → SettleReadsSimplePipeline
 *
 * After SynthesizeReadsSDIVFPipeline produces packs for a reader Need, this
 * Simple pipeline:
 *   1. validate — settlement readiness (preview, quote, payment posture)
 *   2. finalize-settlement — BTC finality, BTD mint/read/rights, conservation
 *   3. ship — open pull-request(s) against the repository supplied when reading
 *
 * Linear stages (no SDIVF DIV loop) — parity with QuickAgent vs PTRRAgent.
 */

import type { Executor, Execution } from '@bitcode/execution-generics';
import {
  factorySimplePipeline,
  type SimplePipeline,
} from '@bitcode/generic-pipelines-simple';
import {
  buildAssetPackSettlementRightsDeliveryBoundary,
  persistAssetPackSettlementRightsDeliveryBoundary,
  storeCrossPhaseArtifact,
} from '@bitcode/pipeline-asset-pack';

export type SettleReadsSimplePipeline = SimplePipeline<any, any>;

export interface SettleReadsInput {
  /** Repository the reader provided (PR target). */
  repository?: {
    url?: string | null;
    owner?: string | null;
    name?: string | null;
    branch?: string | null;
  };
  /** Synthesize-reads output / selected packs ready to settle. */
  synthesizedPacks?: unknown;
  assetPackPreviewBoundary?: unknown;
  shareToFeeQuote?: unknown;
  paymentObservation?: unknown;
  readerWalletId?: string | null;
  depositorWalletId?: string | null;
  [key: string]: unknown;
}

const validateStage: Executor<SettleReadsInput, SettleReadsInput> = async (input, execution) => {
  storeCrossPhaseArtifact(execution, 'settle-reads', 'stage', 'validate');
  let boundary = (input as any)?.assetPackSettlementRightsDeliveryBoundary || null;
  if (!boundary) {
    try {
      boundary = buildAssetPackSettlementRightsDeliveryBoundary(input as any);
    } catch {
      boundary = {
        schema: 'bitcode.settle-reads.validation',
        state: 'blocked_until_worthy_preview',
        pipeline: 'settle-reads',
      };
    }
  }
  persistAssetPackSettlementRightsDeliveryBoundary(execution, boundary as any);
  storeCrossPhaseArtifact(execution, 'settle-reads', 'validation', boundary as any);
  return { ...input, assetPackSettlementRightsDeliveryBoundary: boundary };
};

const finalizeSettlementStage: Executor<SettleReadsInput, SettleReadsInput> = async (
  input,
  execution,
) => {
  storeCrossPhaseArtifact(execution, 'settle-reads', 'stage', 'finalize-settlement');
  // Boundary builder owns BTC observation, BTD mint/read/rights, conservation.
  let boundary = (input as any)?.assetPackSettlementRightsDeliveryBoundary || null;
  if (!boundary) {
    try {
      boundary = buildAssetPackSettlementRightsDeliveryBoundary(input as any);
    } catch {
      boundary = {
        schema: 'bitcode.settle-reads.settlement',
        state: 'blocked_until_payment_finality',
        pipeline: 'settle-reads',
      };
    }
  }
  persistAssetPackSettlementRightsDeliveryBoundary(execution, boundary as any);
  storeCrossPhaseArtifact(execution, 'settle-reads', 'settlement', boundary as any);
  return {
    ...input,
    assetPackSettlementRightsDeliveryBoundary: boundary,
    settlementFinalized: true,
  };
};

const shipStage: Executor<SettleReadsInput, any> = async (input, execution) => {
  storeCrossPhaseArtifact(execution, 'settle-reads', 'stage', 'ship');
  const repo = input.repository || {};
  // Delivery agents under pipeline-asset-pack open PRs against the read repo.
  // Stage records intent + coordinates; host/agent wiring attaches real PR URLs.
  const shippable = {
    schema: 'bitcode.settle-reads.shippable',
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
  storeCrossPhaseArtifact(execution, 'settle-reads', 'shippable', shippable as any);
  return {
    ...input,
    success: true,
    shippable,
    shippables: { pullRequest: { url: shippable.prUrl }, summary: 'settle-reads ship stage' },
    deliveryMechanism: shippable,
  };
};

export function factorySettleReadsSimplePipeline(
  pipelineName: string = 'settle-reads',
): SettleReadsSimplePipeline {
  return factorySimplePipeline(pipelineName, {
    stages: [
      { id: 'validate', run: validateStage as any },
      { id: 'finalize-settlement', run: finalizeSettlementStage as any },
      { id: 'ship', run: shipStage as any },
    ],
    initialize: async (execution) => {
      storeCrossPhaseArtifact(execution as any, 'pipeline', 'productPipeline', 'settle-reads');
      storeCrossPhaseArtifact(execution as any, 'pipeline', 'pattern', 'Simple');
    },
  });
}

export const settleReadsSimplePipeline: SettleReadsSimplePipeline =
  factorySettleReadsSimplePipeline();

export const runSettleReadsSimplePipeline = settleReadsSimplePipeline;
