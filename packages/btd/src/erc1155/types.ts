/**
 * Bitcode ERC1155 token identity + multi-rail settle types.
 *
 * Economics (locked):
 * - BTD (id 0): fungible, max 21_000_000 * 10^18, freely transferable
 * - AssetPack (ids ≥ 1): add-only co-ownership NFT; burn forbidden
 * - Never pay in BTD; buyers pay ETH | BTC | SOL at spot
 * - Mint BTD on settle only, to depositor BTD payout slices (needinesses volume)
 */

import { BTD_MAX_MINTABLE_SUPPLY } from '../constants';

/** Fungible BTD token id inside the Bitcode ERC1155. */
export const BITCODE_BTD_TOKEN_ID = 0n;

/** First AssetPack token id (ids increase monotonically). */
export const BITCODE_ASSET_PACK_ID_START = 1n;

/** ERC20-style decimals for fungible BTD balances. */
export const BTD_DECIMALS = 18;

/**
 * 10^BTD_DECIMALS as bigint.
 * Avoid `10n ** n` — some Jest/ts-jest pipelines downlevel `**` to Math.pow.
 */
export const BTD_DECIMALS_SCALE: bigint = (() => {
  let scale = 1n;
  for (let i = 0; i < BTD_DECIMALS; i += 1) scale *= 10n;
  return scale;
})();

/** Max fungible BTD in base units (21_000_000 * 10^18). */
export const BTD_MAX_SUPPLY_BASE_UNITS =
  BigInt(BTD_MAX_MINTABLE_SUPPLY) * BTD_DECIMALS_SCALE;

/** Buyer payment asset. BTD is intentionally absent. */
export type PayAsset = 'ETH' | 'BTC' | 'SOL';

export const PAY_ASSET_DECIMALS: Record<PayAsset, number> = {
  ETH: 18,
  BTC: 8,
  SOL: 9,
};

export interface BitcodeErc1155Config {
  /** Protocol treasury (coin fees + residual external pay). */
  masterAccount: string;
  /** Quote / settlement operator authority. */
  operator: string;
  /** BTC/SOL payment proof attestor (may equal operator on testnet). */
  paymentAttestor?: string;
  /** Fee on depositor coin legs (bps). Default 250 = 2.5%. */
  coinFeeBps?: number;
  name?: string;
  symbol?: string;
}

/** One depositor share of a settle (source-to-shares + payout preference). */
export interface SharePayout {
  depositor: string;
  /** Share of V / pay notional; all weights sum to 10_000. */
  weightBps: number;
  /** Of this share: mint BTD (no fee). btdBps + coinBps === 10000. */
  btdBps: number;
  /** Of this share: external coin leg (fee applies). */
  coinBps: number;
}

/** Operator-signed commercial quote (TS mirror; signatures optional for projected mode). */
export interface SettleQuote {
  assetPackKey: string;
  buyer: string;
  payAsset: PayAsset;
  /** V after needinesses + decay (max mintable notional). */
  btdVolume: bigint;
  /** Exact pay units (wei / sats / lamports). */
  payAmount: bigint;
  rateMicro: number;
  needFitMicro: number;
  decayMicro: number;
  shares: SharePayout[];
  metadataRoot: string;
  deadline: number;
  quoteId: string;
}

export interface AssetPackCoOwnership {
  tokenId: bigint;
  assetPackKey: string;
  coOwners: string[];
  metadataRoot: string;
  createdAt: string;
}

export interface BitcodeErc1155State {
  schema: 'bitcode.erc1155.state';
  config: Required<
    Pick<BitcodeErc1155Config, 'masterAccount' | 'operator' | 'name' | 'symbol'>
  > & {
    paymentAttestor: string;
    coinFeeBps: number;
  };
  btdTotalMinted: bigint;
  balances: Map<string, Map<bigint, bigint>>;
  nextAssetPackTokenId: bigint;
  assetPackTokenByKey: Map<string, bigint>;
  assetPacks: Map<bigint, AssetPackCoOwnership>;
  settlementSequence: bigint;
  quoteConsumed: Set<string>;
  railTxUsed: Set<string>;
}

export interface BtdEarnedReceipt {
  kind: 'btd.erc1155.earned';
  depositor: string;
  amountBaseUnits: bigint;
  assetPackKey: string;
  needFitMicro: number;
  settlementSequence: bigint;
  issuedAt: string;
}

export interface CoinPaidReceipt {
  kind: 'settle.coin-paid';
  depositor: string;
  payAsset: PayAsset;
  netAmount: bigint;
  feeAmount: bigint;
  settlementSequence: bigint;
  issuedAt: string;
}

export interface AssetPackCoOwnReceiptV48 {
  kind: 'asset-pack.erc1155.co-own';
  tokenId: bigint;
  assetPackKey: string;
  addedAccount: string;
  coOwners: string[];
  removedPriorOwner: false;
  settlementSequence: bigint;
  proofRoot: string;
  issuedAt: string;
}

export interface ReadSettledReceipt {
  kind: 'bitcode.erc1155.read-settled';
  quoteId: string;
  assetPackKey: string;
  buyer: string;
  payAsset: PayAsset;
  payAmount: bigint;
  btdVolume: bigint;
  btdMintedTotal: bigint;
  apTokenId: bigint;
  settlementSequence: bigint;
  btdEarned: BtdEarnedReceipt[];
  coinPaid: CoinPaidReceipt[];
  coOwn: AssetPackCoOwnReceiptV48;
  issuedAt: string;
}

export function normalizeAddress(address: string, label = 'address'): string {
  const value = String(address || '').trim();
  if (!value) throw new Error(`${label} must be a non-empty address string.`);
  return value.toLowerCase();
}

export interface SerializedAssetPackCoOwnership {
  tokenId: string;
  assetPackKey: string;
  coOwners: string[];
  metadataRoot: string;
  createdAt: string;
}

export interface SerializedBitcodeErc1155State {
  schema: 'bitcode.erc1155.state';
  config: BitcodeErc1155State['config'];
  btdTotalMinted: string;
  nextAssetPackTokenId: string;
  settlementSequence: string;
  balances: Record<string, Record<string, string>>;
  assetPackTokenByKey: Record<string, string>;
  assetPacks: Record<string, SerializedAssetPackCoOwnership>;
  quoteConsumed: string[];
  railTxUsed: string[];
}
