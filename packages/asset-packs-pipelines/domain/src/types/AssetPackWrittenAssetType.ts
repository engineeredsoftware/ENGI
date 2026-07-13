/**
 * Canonical written-asset kind emitted by Bitcode AssetPack synthesis.
 *
 * AssetPack implementation is not modeled as a four-way request-label
 * taxonomy. Commercial AssetPack delivery is GitHub pull-request delivery.
 * Third-party delivery mechanisms must not be admitted until their runtime
 * surface is explicitly specified.
 */
export enum AssetPackWrittenAssetType {
  ReadSatisfactionAssetPack = 'read-satisfaction-asset-pack'
}

export type AssetPackWrittenAssetTypeSingleOrMany =
  | AssetPackWrittenAssetType
  | AssetPackWrittenAssetType[];

export type AssetPackDeliveryMechanismTemplate = 'pull-request';
