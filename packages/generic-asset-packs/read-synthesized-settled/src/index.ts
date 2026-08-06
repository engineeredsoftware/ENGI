/**
 * @bitcode/generic-asset-packs-read-synthesized-settled
 *
 * ReadSynthesizedSettledAssetPack — product AssetPack after settle-asset-pack-pipeline
 * (buyer paid BTC for a read-synthesized option).
 *
 * Hierarchy (three products over shared synthesis base):
 *   AssetPack (primitive + measurements)
 *     → SynthesisAssetPack
 *         → DepositSynthesizedAssetPack
 *         → ReadSynthesizedAssetPack
 *         → ReadSynthesizedSettledAssetPack   # this package
 *
 * Built from a bought ReadSynthesizedAssetPack after:
 *   settle-btc → mint-btd → settle-btd → settle-asset-pack → ship PR
 *
 * There is no separate generic "settle" AssetPack base — settlement exists only
 * on the read buy path.
 */

import type { SynthesisMeasurementReading } from '@bitcode/generic-asset-packs-synthesis';
import type {
  ReadSynthesizedAssetPack,
  ReadSynthesizedBtdDetails,
  ReadSynthesizedBtcDetails,
} from '@bitcode/generic-asset-packs-read-synthesized';
import { ASSET_PACK_SCHEMA_PREFIX } from '@bitcode/asset-packs-generics';

export const READ_SYNTHESIZED_SETTLED_ASSET_PACK_SCHEMA =
  `${ASSET_PACK_SCHEMA_PREFIX}.read-synthesized-settled` as const;

/** Settled BTD rights after mint-btd + settle-btd. */
export interface ReadSynthesizedSettledBtdRights {
  needFitVolume: number;
  amountBaseUnits: string;
  masterAccount: string;
  buyerAccount: string;
  mintProofRoot?: string | null;
  transferProofRoot?: string | null;
  status: 'transferred' | 'projected';
}

/** BTC payment observation after settle-btc. */
export interface ReadSynthesizedSettledBtcSettlement {
  network: string;
  status: string;
  txId: string | null;
  amountSats: number | null;
  finality: string | null;
  confirmedAt?: string | null;
}

/** ERC1155 AssetPack co-ownership after settle-asset-pack. */
export interface ReadSynthesizedSettledAssetPackRights {
  tokenId: string;
  assetPackKey: string;
  coOwners: string[];
  /** Always false — co-ownership is add-only. */
  removedPriorOwner: false;
  proofRoot?: string | null;
}

/** PR delivery after ship-asset-pack-patch-pr. */
export interface ReadSynthesizedSettledDelivery {
  mechanism: 'pull_request';
  status: 'projected' | 'opened' | 'failed';
  prUrl: string | null;
  headBranch?: string | null;
  baseBranch?: string | null;
  repositoryFullName?: string | null;
}

/**
 * Settled read AssetPack — synthesis base + read needinesses + settlement rights.
 */
export interface ReadSynthesizedSettledAssetPack
  extends Omit<ReadSynthesizedAssetPack, 'identity' | 'settleable' | 'selectable'> {
  // Omit base schema literal so settled product schema does not collapse to `never`.
  identity: Omit<ReadSynthesizedAssetPack['identity'], 'schema'> & {
    schema: typeof READ_SYNTHESIZED_SETTLED_ASSET_PACK_SCHEMA;
  };
  measurements: {
    absolutes: SynthesisMeasurementReading[];
    needinesses: SynthesisMeasurementReading[];
  };
  btdRights: ReadSynthesizedSettledBtdRights;
  btcSettlement: ReadSynthesizedSettledBtcSettlement;
  assetPackRights: ReadSynthesizedSettledAssetPackRights;
  delivery: ReadSynthesizedSettledDelivery;
  settledAt: string;
  settleRunId?: string | null;
  settleable: false;
  selectable: false;
}

export interface BuildReadSynthesizedSettledAssetPackInput {
  readOption: ReadSynthesizedAssetPack;
  btdRights: ReadSynthesizedSettledBtdRights;
  btcSettlement: ReadSynthesizedSettledBtcSettlement;
  assetPackRights: ReadSynthesizedSettledAssetPackRights;
  delivery: ReadSynthesizedSettledDelivery;
  settledAt?: string;
  settleRunId?: string | null;
}

export function buildReadSynthesizedSettledAssetPack(
  input: BuildReadSynthesizedSettledAssetPackInput,
): ReadSynthesizedSettledAssetPack {
  const { readOption } = input;
  return {
    ...readOption,
    identity: {
      ...readOption.identity,
      schema: READ_SYNTHESIZED_SETTLED_ASSET_PACK_SCHEMA,
    },
    measurements: {
      absolutes: [...readOption.measurements.absolutes],
      needinesses: [...readOption.measurements.needinesses],
    },
    btd: {
      needFitVolume: input.btdRights.needFitVolume,
      amountBaseUnits: input.btdRights.amountBaseUnits,
      quoteRoot: readOption.btd?.quoteRoot ?? null,
      proofRoot: input.btdRights.mintProofRoot ?? null,
    } satisfies ReadSynthesizedBtdDetails,
    btc: {
      amountSats: input.btcSettlement.amountSats,
      network: input.btcSettlement.network,
      quoteRoot: readOption.btc?.quoteRoot ?? null,
      finality: input.btcSettlement.finality,
    } satisfies ReadSynthesizedBtcDetails,
    btdRights: input.btdRights,
    btcSettlement: input.btcSettlement,
    assetPackRights: input.assetPackRights,
    delivery: input.delivery,
    settledAt: input.settledAt || new Date().toISOString(),
    settleRunId: input.settleRunId ?? null,
    settleable: false,
    selectable: false,
  };
}

export type {
  ReadSynthesizedAssetPack,
  ReadSynthesizedBtdDetails,
  ReadSynthesizedBtcDetails,
  SynthesisMeasurementReading,
};
