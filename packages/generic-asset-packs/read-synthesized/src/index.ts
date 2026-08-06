/**
 * @bitcode/generic-asset-packs-read-synthesized
 *
 * ReadSynthesizedAssetPack — SynthesisAssetPack specialized for reading.
 *
 * Law:
 * - Built from shared synthesis base (same patch + absolutes shape as deposit).
 * - Includes **needinesses** (*-fit) and commercial **BTD / BTC** quote fields.
 * - need-fit composite is derived (not a raw measure-agent target).
 * - After selection, settle is 1:1 SettleAssetPack (not this package).
 *
 * Hierarchy:
 *   AssetPack → SynthesisAssetPack → ReadSynthesizedAssetPack
 */

import type {
  SynthesisAssetPack,
  SynthesisMeasurementReading,
  BuildSynthesisAssetPackInput,
} from '@bitcode/generic-asset-packs-synthesis';
import { buildSynthesisAssetPack } from '@bitcode/generic-asset-packs-synthesis';
import { ASSET_PACK_SCHEMA_PREFIX } from '@bitcode/asset-packs-generics';

export const READ_SYNTHESIZED_ASSET_PACK_SCHEMA =
  `${ASSET_PACK_SCHEMA_PREFIX}.read-synthesized` as const;

/** Source-safe BTD quote / mint projection attached on read options. */
export interface ReadSynthesizedBtdDetails {
  /** needFitVolume ∈ [0,1] from needinesses-weighted scalar. */
  needFitVolume?: number | null;
  /** Fungible BTD base units (string for JSON safety) when projected. */
  amountBaseUnits?: string | null;
  quoteRoot?: string | null;
  proofRoot?: string | null;
}

/** Source-safe BTC-testnet quote projection for settle-btc. */
export interface ReadSynthesizedBtcDetails {
  amountSats?: number | null;
  network?: string | null;
  quoteRoot?: string | null;
  finality?: string | null;
}

export interface ReadSynthesizedAssetPack extends Omit<SynthesisAssetPack, 'identity'> {
  // Omit base schema literal so product schema does not collapse to `never`.
  identity: Omit<SynthesisAssetPack['identity'], 'schema'> & {
    schema: typeof READ_SYNTHESIZED_ASSET_PACK_SCHEMA;
  };
  /** Nested absolutes + needinesses (*-fit). */
  measurements: {
    absolutes: SynthesisMeasurementReading[];
    needinesses: SynthesisMeasurementReading[];
  };
  /** Derived need-fit composite (weighted mean of needinesses). */
  needFit?: number | null;
  selectable?: boolean;
  settleable?: boolean;
  kind?: string | null;
  /** BTD commercial projection (mint amount after settle-btc). */
  btd?: ReadSynthesizedBtdDetails | null;
  /** BTC-testnet commercial projection for payment observation. */
  btc?: ReadSynthesizedBtcDetails | null;
}

export function buildReadSynthesizedAssetPack(
  input: BuildSynthesisAssetPackInput & {
    kind?: string | null;
    needFit?: number | null;
    selectable?: boolean;
    settleable?: boolean;
    btd?: ReadSynthesizedBtdDetails | null;
    btc?: ReadSynthesizedBtcDetails | null;
  },
): ReadSynthesizedAssetPack {
  const base = buildSynthesisAssetPack(input);
  return {
    ...base,
    identity: {
      ...base.identity,
      schema: READ_SYNTHESIZED_ASSET_PACK_SCHEMA,
    },
    measurements: {
      absolutes: [...base.measurements.absolutes],
      needinesses: [...base.measurements.needinesses],
    },
    kind: input.kind ?? null,
    needFit: input.needFit ?? null,
    selectable: input.selectable ?? true,
    settleable: input.settleable ?? true,
    btd: input.btd ?? null,
    btc: input.btc ?? null,
  };
}

export type { SynthesisAssetPack, SynthesisMeasurementReading };
