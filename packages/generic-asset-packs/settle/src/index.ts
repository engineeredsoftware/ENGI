/**
 * @bitcode/generic-asset-packs-settle
 *
 * SettleAssetPack product surface markers. Executable pipeline lives at
 * `@bitcode/asset-packs-pipelines-settle-asset-pack-pipeline` (1:1 AssetPack settle).
 *
 * Stages: validate → settle-btc → mint-btd → settle-btd → settle-asset-pack
 * → ship PR → packs journal. Token law: BitcodeERC1155 (BTD fungible + AP
 * co-ownership) in `@bitcode/btd/erc1155`.
 */

export const ASSET_PACKS_SETTLE_PACKAGE = '@bitcode/generic-asset-packs-settle' as const;

export type SettleAssetPacksStageId =
  | 'validate-settlement-readiness'
  | 'settle-btc'
  | 'mint-btd'
  | 'settle-btd'
  | 'settle-asset-pack'
  | 'ship-asset-pack-patch-pr'
  | 'journal-and-pack-activity';

export const SETTLE_ASSET_PACKS_STAGE_IDS: SettleAssetPacksStageId[] = [
  'validate-settlement-readiness',
  'settle-btc',
  'mint-btd',
  'settle-btd',
  'settle-asset-pack',
  'ship-asset-pack-patch-pr',
  'journal-and-pack-activity',
];

/** Settlement measurement / rights category surface. */
export type SettleAssetPacksMeasurementScope =
  | 'settlement-rights'
  | 'delivery'
  | 'compensation'
  | 'btd-fungible'
  | 'asset-pack-co-ownership';
