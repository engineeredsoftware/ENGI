/**
 * Bitcode ERC1155 token identity (V48 settlement law).
 *
 * One contract hosts:
 * - **BTD** (token id 0): fungible Bitcode, finite max supply 21_000_000 whole tokens
 * - **AssetPack** (token ids ≥ 1): non-fungible commercial objects with **add-only
 *   co-ownership** (depositor retains; buyer is added; never removed)
 *
 * Settlement is 1:1 AssetPack : SettleAssetPackSimplePipeline run.
 */

import { BTD_MAX_MINTABLE_SUPPLY } from '../constants';

/** Fungible BTD token id inside the Bitcode ERC1155. */
export const BITCODE_BTD_TOKEN_ID = 0n;

/** First AssetPack token id (ids increase monotonically). */
export const BITCODE_ASSET_PACK_ID_START = 1n;

/** ERC20-style decimals for fungible BTD balances. */
export const BTD_DECIMALS = 18;

export const BTD_DECIMALS_SCALE = 10n ** BigInt(BTD_DECIMALS);

/** Max fungible BTD in base units (21_000_000 * 10^18). */
export const BTD_MAX_SUPPLY_BASE_UNITS =
  BigInt(BTD_MAX_MINTABLE_SUPPLY) * BTD_DECIMALS_SCALE;

export type BitcodeTokenKind = 'btd-fungible' | 'asset-pack-nft';

export interface BitcodeErc1155Config {
  /** Master/treasury that receives minted BTD before settle-btd transfer. */
  masterAccount: string;
  /** Contract operator / minter authority. */
  operator: string;
  name?: string;
  symbol?: string;
}

export interface AssetPackCoOwnership {
  tokenId: bigint;
  assetPackKey: string;
  /** Ordered unique co-owners; first is typically the depositor/minter. */
  coOwners: string[];
  /** Metadata root (source-safe); never protected source body. */
  metadataRoot: string;
  createdAt: string;
}

export interface BitcodeErc1155State {
  schema: 'bitcode.erc1155.state';
  config: BitcodeErc1155Config;
  /** Fungible BTD total minted (base units). */
  btdTotalMinted: bigint;
  /** balances[account][tokenId] */
  balances: Map<string, Map<bigint, bigint>>;
  /** next AssetPack token id to assign */
  nextAssetPackTokenId: bigint;
  /** assetPackKey → tokenId */
  assetPackTokenByKey: Map<string, bigint>;
  /** tokenId → co-ownership registry */
  assetPacks: Map<bigint, AssetPackCoOwnership>;
  /** Sequential settlement nonce for receipts */
  settlementSequence: bigint;
}

export interface BtdMintReceiptV48 {
  kind: 'btd.erc1155.mint';
  tokenId: typeof BITCODE_BTD_TOKEN_ID;
  to: string;
  amountBaseUnits: bigint;
  needFitVolume: number;
  weightedNeedinessesSum: number;
  needinessesCount: number;
  btdTotalMintedBefore: bigint;
  btdTotalMintedAfter: bigint;
  maxSupplyBaseUnits: bigint;
  assetPackKey: string;
  settlementSequence: bigint;
  proofRoot: string;
  issuedAt: string;
}

export interface BtdTransferReceiptV48 {
  kind: 'btd.erc1155.transfer';
  tokenId: typeof BITCODE_BTD_TOKEN_ID;
  from: string;
  to: string;
  amountBaseUnits: bigint;
  assetPackKey: string;
  settlementSequence: bigint;
  proofRoot: string;
  issuedAt: string;
}

export interface AssetPackCoOwnReceiptV48 {
  kind: 'asset-pack.erc1155.co-own';
  tokenId: bigint;
  assetPackKey: string;
  addedAccount: string;
  coOwners: string[];
  /** Always false — co-ownership is add-only; never removes prior owners. */
  removedPriorOwner: false;
  settlementSequence: bigint;
  proofRoot: string;
  issuedAt: string;
}

export function normalizeAddress(address: string, label = 'address'): string {
  const value = String(address || '').trim();
  if (!value) throw new Error(`${label} must be a non-empty address string.`);
  return value.toLowerCase();
}

/** JSON-safe serialization of BitcodeErc1155State (bigint → string). */
export interface SerializedAssetPackCoOwnership {
  tokenId: string;
  assetPackKey: string;
  coOwners: string[];
  metadataRoot: string;
  createdAt: string;
}

export interface SerializedBitcodeErc1155State {
  schema: 'bitcode.erc1155.state';
  config: BitcodeErc1155Config;
  btdTotalMinted: string;
  nextAssetPackTokenId: string;
  settlementSequence: string;
  balances: Record<string, Record<string, string>>;
  assetPackTokenByKey: Record<string, string>;
  assetPacks: Record<string, SerializedAssetPackCoOwnership>;
}
