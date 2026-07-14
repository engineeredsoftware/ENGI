/**
 * @bitcode/generic-asset-packs-settled-read-synthesized
 *
 * SettledReadSynthesizedAssetPack — product AssetPack after settle-asset-pack-pipeline.
 *
 * Hierarchy (three product implementations over shared synthesis base):
 *   AssetPack (primitive + measurements)
 *     → SynthesisAssetPack                    # base of all three products
 *         → DepositSynthesizedAssetPack
 *         → ReadSynthesizedAssetPack
 *         → SettledReadSynthesizedAssetPack   # this package
 *
 * Built from a bought ReadSynthesizedAssetPack after:
 *   settle-btc → mint-btd → settle-btd → settle-asset-pack → ship PR
 *
 * Adds: BTD mint/transfer receipts, BTC finality, ERC1155 co-ownership rights,
 * delivery PR reference. Never removes depositor co-ownership.
 */

import type { SynthesisMeasurementReading } from '@bitcode/generic-asset-packs-synthesis/synthesis-asset-pack';
import type {
  ReadSynthesizedAssetPack,
  ReadSynthesizedBtdDetails,
  ReadSynthesizedBtcDetails,
} from '@bitcode/generic-asset-packs-read-synthesized';
import { ASSET_PACK_SCHEMA_PREFIX } from '@bitcode/asset-packs-generics';

export const SETTLED_READ_SYNTHESIZED_ASSET_PACK_SCHEMA =
  `${ASSET_PACK_SCHEMA_PREFIX}.settled-read-synthesized` as const;

/** Settled BTD rights after mint-btd + settle-btd. */
export interface SettledReadBtdRights {
  needFitVolume: number;
  amountBaseUnits: string;
  masterAccount: string;
  buyerAccount: string;
  mintProofRoot?: string | null;
  transferProofRoot?: string | null;
  status: 'transferred' | 'projected';
}

/** BTC payment observation after settle-btc. */
export interface SettledReadBtcSettlement {
  network: string;
  status: string;
  txId: string | null;
  amountSats: number | null;
  finality: string | null;
  confirmedAt?: string | null;
}

/** ERC1155 AssetPack co-ownership after settle-asset-pack. */
export interface SettledReadAssetPackRights {
  tokenId: string;
  assetPackKey: string;
  coOwners: string[];
  /** Always false — co-ownership is add-only. */
  removedPriorOwner: false;
  proofRoot?: string | null;
}

/** PR delivery after ship-asset-pack-patch-pr. */
export interface SettledReadDelivery {
  mechanism: 'pull_request';
  status: 'projected' | 'opened' | 'failed';
  prUrl: string | null;
  headBranch?: string | null;
  baseBranch?: string | null;
  repositoryFullName?: string | null;
}

/**
 * Settled read AssetPack — synthesis base + read needinesses + settlement rights.
 * Extends the commercial shape of ReadSynthesizedAssetPack with settled fields.
 */
export interface SettledReadSynthesizedAssetPack
  extends Omit<ReadSynthesizedAssetPack, 'identity' | 'settleable' | 'selectable'> {
  identity: ReadSynthesizedAssetPack['identity'] & {
    schema: typeof SETTLED_READ_SYNTHESIZED_ASSET_PACK_SCHEMA;
  };
  measurements: {
    absolutes: SynthesisMeasurementReading[];
    needinesses: SynthesisMeasurementReading[];
  };
  /** Settled BTD mint + transfer (needinesses-derived amount). */
  btdRights: SettledReadBtdRights;
  /** BTC-testnet finality observation. */
  btcSettlement: SettledReadBtcSettlement;
  /** ERC1155 co-ownership (buyer added; depositor retained). */
  assetPackRights: SettledReadAssetPackRights;
  /** Patch PR delivery on the read repository. */
  delivery: SettledReadDelivery;
  settledAt: string;
  settleRunId?: string | null;
  /** Post-settle: no longer settleable as an open option. */
  settleable: false;
  selectable: false;
}

export interface BuildSettledReadSynthesizedAssetPackInput {
  /** Bought read option (source of patch + measurements + needFit). */
  readOption: ReadSynthesizedAssetPack;
  btdRights: SettledReadBtdRights;
  btcSettlement: SettledReadBtcSettlement;
  assetPackRights: SettledReadAssetPackRights;
  delivery: SettledReadDelivery;
  settledAt?: string;
  settleRunId?: string | null;
}

export function buildSettledReadSynthesizedAssetPack(
  input: BuildSettledReadSynthesizedAssetPackInput,
): SettledReadSynthesizedAssetPack {
  const { readOption } = input;
  return {
    ...readOption,
    identity: {
      ...readOption.identity,
      schema: SETTLED_READ_SYNTHESIZED_ASSET_PACK_SCHEMA,
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
