/**
 * AssetPack primitive — minimal object to admit a pack on Bitcode Protocol.
 *
 * Hierarchy:
 *   AssetPack                              # this package (includes measurements)
 *     → SynthesisAssetPack                 # generic-asset-packs/synthesis (base of all 3 products)
 *         → DepositSynthesizedAssetPack
 *         → ReadSynthesizedAssetPack
 *         → SettledReadSynthesizedAssetPack
 *
 * Measurements are part of the primitive shape via @bitcode/measurement-generics
 * (nested absolutes | needinesses kinds). Product packages refine commercial
 * fields; they do not re-own the measurements carrier type.
 */

import type { AssetPackMeasurements } from '@bitcode/measurement-generics';
import { emptyAssetPackMeasurements } from '@bitcode/measurement-generics';
import type { AssetPackIdentity } from './identity';
import type { AssetPackSourceBinding } from './source-binding';
import type { AssetPackPatchDescriptor } from './patch';

/** Commercial delivery of an AssetPack (GitHub PR is the admitted mechanism). */
export type AssetPackDeliveryMechanism = 'pull-request';

/**
 * Primitive AssetPack — identity + source-safe binding + patch + measurements.
 *
 * - `measurements.absolutes` / `measurements.needinesses` are the only formal
 *   measurement kinds on the pack (V48).
 * - Deposit product law: `needinesses` is always `[]`.
 * - Read product law: `needinesses` populated; need-fit is a composite, not a
 *   raw row stored as an absolute.
 * - Obfuscations are never stored on an AssetPack (sensitive; deposit input only).
 */
export interface AssetPack {
  identity: AssetPackIdentity;
  sourceBinding: AssetPackSourceBinding;
  patch: AssetPackPatchDescriptor;
  deliveryMechanism: AssetPackDeliveryMechanism;
  /**
   * Nested measurement kinds from @bitcode/measurement-generics.
   * Required on every AssetPack (may be empty arrays).
   */
  measurements: AssetPackMeasurements;
}

/** Written-asset kind emitted by synthesis (protocol vocabulary). */
export type AssetPackWrittenAssetKind = 'read-satisfaction-asset-pack';

export const ASSET_PACK_WRITTEN_ASSET_KIND_READ_SATISFACTION: AssetPackWrittenAssetKind =
  'read-satisfaction-asset-pack';

export type { AssetPackMeasurements };
export { emptyAssetPackMeasurements };
