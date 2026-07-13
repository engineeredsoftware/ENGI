/**
 * @bitcode/generic-asset-packs-settle
 *
 * SettleAssetPacks product package (hierarchy naming ready):
 *   SettleAssetPacks…Measurement / SettleAssetPacksSDIVFPipeline (Gate 6).
 * Reserved so synthesis and settle stay parallel product packages under
 * packages/asset-packs/* rather than a monolithic pipeline module.
 */

export const ASSET_PACKS_SETTLE_PACKAGE = '@bitcode/generic-asset-packs-settle' as const;

/** Future: SettleAssetPacks measurement category surface. */
export type SettleAssetPacksMeasurementScope = 'settlement-rights' | 'delivery' | 'compensation';
