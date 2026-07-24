/** Catalogs re-export from @bitcode/generic-asset-packs-synthesis. */

export {
  DEPOSIT_SYNTHESIS_POLICY_CATALOG,
  READ_SYNTHESIS_POLICY_CATALOG,
  synthesisPolicyCatalogForMode,
  /** @deprecated Use DEPOSIT_SYNTHESIS_POLICY_CATALOG */
  DEPOSIT_MEASUREMENT_CATALOG,
  /** @deprecated Use READ_SYNTHESIS_POLICY_CATALOG */
  READ_MEASUREMENT_CATALOG,
  /** @deprecated Use synthesisPolicyCatalogForMode */
  measurementCatalogForLens,
  DATA_PACK_ABSOLUTES_CATALOG,
  DATA_PACK_ABSOLUTE_KINDS,
  DATA_PACK_WEIGHTED_ABSOLUTE_KINDS,
  DATA_PACK_ABSOLUTE_KIND_SPECS,
  DATA_PACK_ABSOLUTES_PRODUCT_CATALOG,
  assertDataPackAbsolutesCatalogWeights,
  /** @deprecated Use DATA_PACK_ABSOLUTES_CATALOG */
  ASSET_PACK_ABSOLUTES_CATALOG,
  /** @deprecated Use DATA_PACK_WEIGHTED_ABSOLUTE_KINDS */
  ASSET_PACK_ABSOLUTE_KINDS,
  DEPOSIT_NEEDINESS_MEASUREMENT,
} from '@bitcode/generic-asset-packs-synthesis';

/** @deprecated */
export { assertDataPackAbsolutesCatalogWeights as assertAbsolutesCatalogWeights } from '@bitcode/generic-asset-packs-synthesis';
