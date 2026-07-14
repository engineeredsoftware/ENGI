/**
 * @bitcode/generic-asset-packs-deposit-synthesized
 *
 * DepositSynthesizedAssetPack — SynthesisAssetPack specialized for deposit.
 *
 * Law:
 * - Built from shared synthesis base (title, patch, absolutes, provenant paths).
 * - `measurements.needinesses` is always `[]` (needinesses are read-only).
 * - **Obfuscations are never stored** on the AssetPack (sensitive deposit input).
 * - Deposit-only commercial fields: kind, confidence, coveredSourcePaths, etc.
 *
 * Hierarchy:
 *   AssetPack → SynthesisAssetPack → DepositSynthesizedAssetPack
 */

import type {
  SynthesisAssetPack,
  SynthesisMeasurementReading,
  BuildSynthesisAssetPackInput,
} from '@bitcode/generic-asset-packs-synthesis';
import {
  buildSynthesisAssetPack,
  SYNTHESIS_ASSET_PACK_SCHEMA,
  synthesisAssetPackToDepositContents,
} from '@bitcode/generic-asset-packs-synthesis';
import { ASSET_PACK_SCHEMA_PREFIX } from '@bitcode/asset-packs-generics';

export const DEPOSIT_SYNTHESIZED_ASSET_PACK_SCHEMA =
  `${ASSET_PACK_SCHEMA_PREFIX}.deposit-synthesized` as const;

/**
 * Deposit-synthesized AssetPack. Extends shared synthesis fields.
 * Explicitly excludes obfuscations from the type surface.
 */
export interface DepositSynthesizedAssetPack extends Omit<SynthesisAssetPack, 'identity' | 'measurements'> {
  // Omit base schema literal so product schema does not collapse to `never`.
  identity: Omit<SynthesisAssetPack['identity'], 'schema'> & {
    schema: typeof DEPOSIT_SYNTHESIZED_ASSET_PACK_SCHEMA | typeof SYNTHESIS_ASSET_PACK_SCHEMA;
  };
  /**
   * Nested measurements with needinesses forced empty on deposit.
   * Absolutes only for commercial deposit options.
   */
  measurements: {
    absolutes: SynthesisMeasurementReading[];
    needinesses: [];
  };
  /** Deposit option kind (capability-slice | implementation-pattern | proof-operations-slice). */
  kind?: string | null;
  confidence?: number | null;
  coveredSourcePaths?: string[];
  // obfuscations — deliberately omitted; never store on AssetPack
}

export function buildDepositSynthesizedAssetPack(
  input: BuildSynthesisAssetPackInput & {
    kind?: string | null;
    confidence?: number | null;
    coveredSourcePaths?: string[] | null;
  },
): DepositSynthesizedAssetPack {
  const base = buildSynthesisAssetPack(input);
  // Force needinesses empty — deposit law (even if input accidentally included them).
  const measurements: DepositSynthesizedAssetPack['measurements'] = {
    absolutes: [...base.measurements.absolutes],
    needinesses: [],
  };

  return {
    ...base,
    identity: {
      ...base.identity,
      schema: DEPOSIT_SYNTHESIZED_ASSET_PACK_SCHEMA,
    },
    measurements,
    kind: input.kind ?? null,
    confidence: input.confidence ?? null,
    coveredSourcePaths: Array.isArray(input.coveredSourcePaths)
      ? input.coveredSourcePaths.filter((p) => typeof p === 'string' && p.length > 0)
      : base.provenantSourcePaths.slice(),
  };
}

export function assertNoObfuscationsOnAssetPack(pack: DepositSynthesizedAssetPack): void {
  const bag = pack as DepositSynthesizedAssetPack & { obfuscations?: unknown };
  if (bag.obfuscations !== undefined) {
    throw new Error(
      'Obfuscations must never be stored on a DepositSynthesizedAssetPack (sensitive deposit input only).',
    );
  }
}

export { synthesisAssetPackToDepositContents };
export type { SynthesisAssetPack, SynthesisMeasurementReading };
