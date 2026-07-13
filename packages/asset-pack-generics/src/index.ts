/**
 * @bitcode/asset-pack-generics
 *
 * AssetPack **primitive** contracts for Bitcode Protocol.
 *
 * Prefer:
 *   @bitcode/asset-pack-generics              # this package
 *   @bitcode/generic-asset-packs-measured-patch  # MeasuredPatchAssetPack base
 *
 * Product pipelines (synthesize-deposits/reads, settle-reads) consume the
 * measured-patch base; they do not re-define protocol primitives.
 */

export type { AssetPackId, AssetPackIdentity } from './identity';
export {
  ASSET_PACK_SCHEMA_PREFIX,
  isAssetPackId,
  assertAssetPackId,
} from './identity';

export type { AssetPackSourceBinding } from './source-binding';
export { createAssetPackSourceBinding } from './source-binding';

export type {
  AssetPackFileOp,
  AssetPackPatchFileChange,
  AssetPackPatchDescriptor,
} from './patch';
export { createAssetPackPatchDescriptor } from './patch';

export type {
  AssetPack,
  AssetPackDeliveryMechanism,
  AssetPackWrittenAssetKind,
} from './types';
export { ASSET_PACK_WRITTEN_ASSET_KIND_READ_SATISFACTION } from './types';
