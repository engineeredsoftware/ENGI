/**
 * AssetPack primitive — minimal object to admit a pack on Bitcode Protocol.
 *
 * Hierarchy:
 *   AssetPack                              # this package
 *     → MeasuredPatchAssetPack             # generic-asset-packs/measured-patch
 *         → product pipelines / deposit options / settlement
 */

import type { AssetPackIdentity } from './identity';
import type { AssetPackSourceBinding } from './source-binding';
import type { AssetPackPatchDescriptor } from './patch';

/** Commercial delivery of an AssetPack (GitHub PR is the admitted mechanism). */
export type AssetPackDeliveryMechanism = 'pull-request';

/**
 * Primitive AssetPack — identity + source-safe binding + patch descriptor.
 * No measurements, neediness, or settlement rights (those are base/product).
 */
export interface AssetPack {
  identity: AssetPackIdentity;
  sourceBinding: AssetPackSourceBinding;
  patch: AssetPackPatchDescriptor;
  deliveryMechanism: AssetPackDeliveryMechanism;
}

/** Written-asset kind emitted by synthesis (protocol vocabulary). */
export type AssetPackWrittenAssetKind = 'read-satisfaction-asset-pack';

export const ASSET_PACK_WRITTEN_ASSET_KIND_READ_SATISFACTION: AssetPackWrittenAssetKind =
  'read-satisfaction-asset-pack';
