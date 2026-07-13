/**
 * AssetPack identity — protocol-level id + schema.
 */

/** Opaque AssetPack id (ledger / depository subject). */
export type AssetPackId = string;

/** Canonical schema prefix for Bitcode AssetPack protocol objects. */
export const ASSET_PACK_SCHEMA_PREFIX = 'bitcode.asset-pack' as const;

export interface AssetPackIdentity {
  assetPackId: AssetPackId;
  /** Full schema string, e.g. bitcode.asset-pack.measured-patch */
  schema: string;
}

export function isAssetPackId(value: unknown): value is AssetPackId {
  return typeof value === 'string' && value.trim().length > 0;
}

export function assertAssetPackId(value: unknown, field = 'assetPackId'): AssetPackId {
  if (!isAssetPackId(value)) {
    throw new Error(`${field} must be a non-empty string.`);
  }
  return value.trim();
}
