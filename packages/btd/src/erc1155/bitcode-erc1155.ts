/**
 * BitcodeERC1155 — TypeScript executable mirror of the settlement contract.
 *
 * - token id 0 = fungible BTD (earn via settle mint; freely transferable)
 * - token ids ≥ 1 = AssetPack co-ownership (add-only; never burn)
 * - Pay rails: ETH | BTC | SOL (never BTD)
 * - Mint on settle to depositor btdBps slices only
 *
 * Live chain: packages/btd/contracts/BitcodeERC1155.sol
 */

import { createHash } from 'crypto';
import { computePayoutSplit } from './payout-split';
import {
  BITCODE_ASSET_PACK_ID_START,
  BITCODE_BTD_TOKEN_ID,
  BTD_MAX_SUPPLY_BASE_UNITS,
  type AssetPackCoOwnReceiptV48,
  type AssetPackCoOwnership,
  type BitcodeErc1155Config,
  type BitcodeErc1155State,
  type BtdEarnedReceipt,
  type CoinPaidReceipt,
  type PayAsset,
  type ReadSettledReceipt,
  type SerializedAssetPackCoOwnership,
  type SerializedBitcodeErc1155State,
  type SettleQuote,
  type SharePayout,
  normalizeAddress,
} from './types';

function emptyBalances(): Map<string, Map<bigint, bigint>> {
  return new Map();
}

function getBalance(state: BitcodeErc1155State, account: string, tokenId: bigint): bigint {
  const byToken = state.balances.get(normalizeAddress(account));
  if (!byToken) return 0n;
  return byToken.get(tokenId) ?? 0n;
}

function setBalance(
  state: BitcodeErc1155State,
  account: string,
  tokenId: bigint,
  amount: bigint,
): void {
  const key = normalizeAddress(account);
  let byToken = state.balances.get(key);
  if (!byToken) {
    byToken = new Map();
    state.balances.set(key, byToken);
  }
  if (amount === 0n) {
    byToken.delete(tokenId);
  } else {
    byToken.set(tokenId, amount);
  }
}

export function createBitcodeErc1155State(config: BitcodeErc1155Config): BitcodeErc1155State {
  const master = normalizeAddress(config.masterAccount, 'masterAccount');
  const operator = normalizeAddress(config.operator, 'operator');
  return {
    schema: 'bitcode.erc1155.state',
    config: {
      masterAccount: master,
      operator,
      paymentAttestor: normalizeAddress(
        config.paymentAttestor || config.operator,
        'paymentAttestor',
      ),
      coinFeeBps:
        typeof config.coinFeeBps === 'number' && config.coinFeeBps >= 0
          ? Math.min(5000, Math.floor(config.coinFeeBps))
          : 250,
      name: config.name || 'Bitcode',
      symbol: config.symbol || 'BTD',
    },
    btdTotalMinted: 0n,
    balances: emptyBalances(),
    nextAssetPackTokenId: BITCODE_ASSET_PACK_ID_START,
    assetPackTokenByKey: new Map(),
    assetPacks: new Map(),
    settlementSequence: 0n,
    quoteConsumed: new Set(),
    railTxUsed: new Set(),
  };
}

export function balanceOf(
  state: BitcodeErc1155State,
  account: string,
  tokenId: bigint,
): bigint {
  return getBalance(state, account, tokenId);
}

export function remainingMintable(state: BitcodeErc1155State): bigint {
  return BTD_MAX_SUPPLY_BASE_UNITS - state.btdTotalMinted;
}

function validateShares(shares: SharePayout[]): void {
  if (!shares.length) throw new Error('InvalidShares: empty shares');
  let weightSum = 0;
  for (const s of shares) {
    if (!s.depositor?.trim()) throw new Error('InvalidShares: zero depositor');
    if (s.btdBps + s.coinBps !== 10_000) {
      throw new Error('InvalidShares: btdBps + coinBps must equal 10000');
    }
    if (s.weightBps <= 0) throw new Error('InvalidShares: weightBps must be positive');
    weightSum += s.weightBps;
  }
  if (weightSum !== 10_000) throw new Error('InvalidShares: weight sum must be 10000');
}

/**
 * Ensure AssetPack token exists with depositor as initial co-owner.
 */
export function ensureAssetPackRegistered(
  state: BitcodeErc1155State,
  input: {
    assetPackKey: string;
    depositorAccount: string;
    metadataRoot: string;
    issuedAt?: string;
  },
): { state: BitcodeErc1155State; tokenId: bigint; created: boolean } {
  const key = String(input.assetPackKey || '').trim();
  if (!key) throw new Error('ensureAssetPackRegistered: assetPackKey required.');
  const existing = state.assetPackTokenByKey.get(key);
  if (existing !== undefined) {
    return { state, tokenId: existing, created: false };
  }
  const depositor = normalizeAddress(input.depositorAccount, 'depositorAccount');
  const tokenId = state.nextAssetPackTokenId;
  state.nextAssetPackTokenId = tokenId + 1n;
  state.assetPackTokenByKey.set(key, tokenId);
  const coOwnership: AssetPackCoOwnership = {
    tokenId,
    assetPackKey: key,
    coOwners: [depositor],
    metadataRoot: input.metadataRoot,
    createdAt: input.issuedAt || new Date().toISOString(),
  };
  state.assetPacks.set(tokenId, coOwnership);
  setBalance(state, depositor, tokenId, 1n);
  return { state, tokenId, created: true };
}

function addCoOwner(
  state: BitcodeErc1155State,
  tokenId: bigint,
  assetPackKey: string,
  account: string,
  settlementSequence: bigint,
  issuedAt: string,
): AssetPackCoOwnReceiptV48 {
  const buyer = normalizeAddress(account, 'buyer');
  const pack = state.assetPacks.get(tokenId);
  if (!pack) throw new Error('AssetPackMissing');

  if (!pack.coOwners.includes(buyer)) {
    pack.coOwners = [...pack.coOwners, buyer];
    setBalance(state, buyer, tokenId, getBalance(state, buyer, tokenId) + 1n);
  }

  const proofRoot = `ap-co-own:${createHash('sha256')
    .update(`${tokenId}:${buyer}:${pack.coOwners.join(',')}`)
    .digest('hex')}`;

  return {
    kind: 'asset-pack.erc1155.co-own',
    tokenId,
    assetPackKey,
    addedAccount: buyer,
    coOwners: [...pack.coOwners],
    removedPriorOwner: false,
    settlementSequence,
    proofRoot,
    issuedAt,
  };
}

/**
 * Settle escrow (mirror of on-chain settle):
 * - Mint **100%** of V BTD to master (escrow) — seller finalizes split later
 * - Record external payment (ETH/BTC/SOL)
 * - Add buyer as AssetPack co-owner (entitled rights / patch)
 *
 * Seller payout distribution is `finalizeSellerPayout`.
 */
export function finalizeSettle(
  state: BitcodeErc1155State,
  quote: SettleQuote,
  options?: {
    /** Simulated ETH received (must equal quote.payAmount for ETH). */
    ethPaid?: bigint;
    railTxId?: string;
    nowSec?: number;
    issuedAt?: string;
  },
): { state: BitcodeErc1155State; receipt: ReadSettledReceipt } {
  const nowSec = options?.nowSec ?? Math.floor(Date.now() / 1000);
  const issuedAt = options?.issuedAt || new Date().toISOString();

  if (nowSec > quote.deadline) throw new Error('QuoteExpired');
  if (state.quoteConsumed.has(quote.quoteId)) throw new Error('QuoteConsumed');
  if (quote.btdVolume <= 0n || quote.payAmount <= 0n) throw new Error('ZeroAmount');
  if (!quote.assetPackKey?.trim()) throw new Error('InvalidShares: assetPackKey');
  if (state.btdTotalMinted + quote.btdVolume > BTD_MAX_SUPPLY_BASE_UNITS) {
    throw new Error('SupplyExceeded');
  }

  validateShares(quote.shares);

  if (quote.payAsset === 'ETH') {
    const ethPaid = options?.ethPaid ?? quote.payAmount;
    if (ethPaid !== quote.payAmount) throw new Error('IncorrectPayment');
  } else {
    const railTxId = options?.railTxId;
    if (!railTxId) throw new Error('railTxId required for BTC/SOL');
    if (state.railTxUsed.has(railTxId)) throw new Error('RailTxAlreadyUsed');
    state.railTxUsed.add(railTxId);
  }

  state.quoteConsumed.add(quote.quoteId);
  const settlementSequence = state.settlementSequence + 1n;
  state.settlementSequence = settlementSequence;

  // Always mint full V to master escrow (seller payout finalizes allocation).
  const totalMinted = quote.btdVolume;
  const master = state.config.masterAccount;
  setBalance(
    state,
    master,
    BITCODE_BTD_TOKEN_ID,
    getBalance(state, master, BITCODE_BTD_TOKEN_ID) + totalMinted,
  );
  state.btdTotalMinted += totalMinted;

  const btdEarned: BtdEarnedReceipt[] = [
    {
      kind: 'btd.erc1155.earned',
      depositor: master,
      amountBaseUnits: totalMinted,
      assetPackKey: quote.assetPackKey,
      needFitMicro: quote.needFitMicro,
      settlementSequence,
      issuedAt,
    },
  ];
  // Payment held as pending for seller finalize (accounting only in TS mirror).
  const coinPaid: CoinPaidReceipt[] = [
    {
      kind: 'settle.coin-paid',
      depositor: master,
      payAsset: quote.payAsset,
      netAmount: quote.payAmount,
      feeAmount: 0n,
      settlementSequence,
      issuedAt,
    },
  ];

  const primaryDepositor = normalizeAddress(quote.shares[0].depositor, 'primaryDepositor');
  let tokenId = state.assetPackTokenByKey.get(quote.assetPackKey);
  if (tokenId === undefined) {
    const reg = ensureAssetPackRegistered(state, {
      assetPackKey: quote.assetPackKey,
      depositorAccount: primaryDepositor,
      metadataRoot: quote.metadataRoot,
      issuedAt,
    });
    tokenId = reg.tokenId;
  }

  const coOwn = addCoOwner(
    state,
    tokenId,
    quote.assetPackKey,
    quote.buyer,
    settlementSequence,
    issuedAt,
  );

  const receipt: ReadSettledReceipt = {
    kind: 'bitcode.erc1155.read-settled',
    quoteId: quote.quoteId,
    assetPackKey: quote.assetPackKey,
    buyer: normalizeAddress(quote.buyer),
    payAsset: quote.payAsset,
    payAmount: quote.payAmount,
    btdVolume: quote.btdVolume,
    btdMintedTotal: totalMinted,
    apTokenId: tokenId,
    settlementSequence,
    btdEarned,
    coinPaid,
    coOwn,
    issuedAt,
  };

  return { state, receipt };
}

export interface SellerPayoutFinalizeInput {
  sellerAccount: string;
  sellerBtdBps: number;
  btdVolume: bigint;
  payAmount: bigint;
  payAsset: PayAsset;
  assetPackKey: string;
  issuedAt?: string;
}

export interface SellerPayoutFinalizeReceipt {
  kind: 'bitcode.erc1155.seller-payout-finalized';
  assetPackKey: string;
  sellerAccount: string;
  sellerBtdBps: number;
  sellerBtd: bigint;
  treasuryBtd: bigint;
  sellerPay: bigint;
  treasuryPay: bigint;
  payAsset: PayAsset;
  settlementSequence: bigint;
  issuedAt: string;
}

/**
 * Seller finalizes payout from escrow (master holds full BTD + pay accounting).
 * Inverse treasury split via computePayoutSplit.
 */
export function finalizeSellerPayout(
  state: BitcodeErc1155State,
  input: SellerPayoutFinalizeInput,
): { state: BitcodeErc1155State; receipt: SellerPayoutFinalizeReceipt } {
  const seller = normalizeAddress(input.sellerAccount, 'sellerAccount');
  const master = state.config.masterAccount;
  const split = computePayoutSplit({
    btdVolume: input.btdVolume,
    payAmount: input.payAmount,
    payAsset: input.payAsset,
    sellerBtdBps: input.sellerBtdBps,
  });

  const masterBtd = getBalance(state, master, BITCODE_BTD_TOKEN_ID);
  if (masterBtd < split.sellerBtd + split.treasuryBtd) {
    // Allow if master holds at least sellerBtd (treasury share already conceptually master).
    if (masterBtd < split.sellerBtd) {
      throw new Error('InsufficientBalance: escrow BTD for seller payout');
    }
  }

  // Move seller BTD out of master; treasury share remains on master.
  if (split.sellerBtd > 0n) {
    setBalance(state, master, BITCODE_BTD_TOKEN_ID, masterBtd - split.sellerBtd);
    setBalance(
      state,
      seller,
      BITCODE_BTD_TOKEN_ID,
      getBalance(state, seller, BITCODE_BTD_TOKEN_ID) + split.sellerBtd,
    );
  }

  const settlementSequence = state.settlementSequence + 1n;
  state.settlementSequence = settlementSequence;
  const issuedAt = input.issuedAt || new Date().toISOString();

  return {
    state,
    receipt: {
      kind: 'bitcode.erc1155.seller-payout-finalized',
      assetPackKey: input.assetPackKey,
      sellerAccount: seller,
      sellerBtdBps: split.sellerBtdBps,
      sellerBtd: split.sellerBtd,
      treasuryBtd: split.treasuryBtd,
      sellerPay: split.sellerPay,
      treasuryPay: split.treasuryPay,
      payAsset: split.payAsset,
      settlementSequence,
      issuedAt,
    },
  };
}

/** AssetPack ownership can never be removed (V48+ law). */
export function burnAssetPackOwnership(): never {
  throw new Error(
    'AssetPack co-ownership is add-only: burn/remove is forbidden (BitcodeERC1155 law).',
  );
}

export function isAssetPackCoOwner(
  state: BitcodeErc1155State,
  assetPackKey: string,
  account: string,
): boolean {
  const tokenId = state.assetPackTokenByKey.get(assetPackKey);
  if (tokenId === undefined) return false;
  const pack = state.assetPacks.get(tokenId);
  if (!pack) return false;
  return pack.coOwners.includes(normalizeAddress(account));
}

/** Transfer fungible BTD only (market path). */
export function transferBtd(
  state: BitcodeErc1155State,
  input: { from: string; to: string; amountBaseUnits: bigint },
): BitcodeErc1155State {
  if (input.amountBaseUnits <= 0n) throw new Error('ZeroAmount');
  const from = normalizeAddress(input.from, 'from');
  const to = normalizeAddress(input.to, 'to');
  const bal = getBalance(state, from, BITCODE_BTD_TOKEN_ID);
  if (bal < input.amountBaseUnits) throw new Error('InsufficientBalance');
  setBalance(state, from, BITCODE_BTD_TOKEN_ID, bal - input.amountBaseUnits);
  setBalance(
    state,
    to,
    BITCODE_BTD_TOKEN_ID,
    getBalance(state, to, BITCODE_BTD_TOKEN_ID) + input.amountBaseUnits,
  );
  return state;
}

export function serializeBitcodeErc1155State(
  state: BitcodeErc1155State,
): SerializedBitcodeErc1155State {
  const balances: Record<string, Record<string, string>> = {};
  for (const [account, byToken] of state.balances.entries()) {
    balances[account] = {};
    for (const [tokenId, amount] of byToken.entries()) {
      balances[account][tokenId.toString()] = amount.toString();
    }
  }
  const assetPacks: Record<string, SerializedAssetPackCoOwnership> = {};
  for (const [tokenId, pack] of state.assetPacks.entries()) {
    assetPacks[tokenId.toString()] = {
      tokenId: pack.tokenId.toString(),
      assetPackKey: pack.assetPackKey,
      coOwners: [...pack.coOwners],
      metadataRoot: pack.metadataRoot,
      createdAt: pack.createdAt,
    };
  }
  const assetPackTokenByKey: Record<string, string> = {};
  for (const [key, id] of state.assetPackTokenByKey.entries()) {
    assetPackTokenByKey[key] = id.toString();
  }
  return {
    schema: state.schema,
    config: state.config,
    btdTotalMinted: state.btdTotalMinted.toString(),
    nextAssetPackTokenId: state.nextAssetPackTokenId.toString(),
    settlementSequence: state.settlementSequence.toString(),
    balances,
    assetPackTokenByKey,
    assetPacks,
    quoteConsumed: [...state.quoteConsumed],
    railTxUsed: [...state.railTxUsed],
  };
}

// ---------------------------------------------------------------------------
// Legacy aliases (deprecated paths — kept so old imports fail clearly)
// ---------------------------------------------------------------------------

/** @deprecated Pay-with-BTD removed. Use finalizeSettle with external pay rails. */
export function mintBtdToMaster(): never {
  throw new Error(
    'mintBtdToMaster removed: BTD mints only on settle to depositor earn slices (finalizeSettle).',
  );
}

/** @deprecated Pay-with-BTD removed. */
export function transferBtdFromMasterToBuyer(): never {
  throw new Error(
    'transferBtdFromMasterToBuyer removed: buyers pay ETH/BTC/SOL; depositors earn minted BTD.',
  );
}

/** @deprecated Prefer finalizeSettle which adds co-owner after pay. */
export function addAssetPackCoOwner(
  state: BitcodeErc1155State,
  input: {
    assetPackKey: string;
    buyerAccount: string;
    depositorAccount?: string;
    metadataRoot?: string;
    proofRoot?: string;
    issuedAt?: string;
  },
): { state: BitcodeErc1155State; receipt: AssetPackCoOwnReceiptV48 } {
  let tokenId = state.assetPackTokenByKey.get(input.assetPackKey);
  if (tokenId === undefined) {
    if (!input.depositorAccount) {
      throw new Error(
        'addAssetPackCoOwner: AssetPack not registered and depositorAccount missing.',
      );
    }
    const registered = ensureAssetPackRegistered(state, {
      assetPackKey: input.assetPackKey,
      depositorAccount: input.depositorAccount,
      metadataRoot: input.metadataRoot || `ap:${input.assetPackKey}`,
      issuedAt: input.issuedAt,
    });
    tokenId = registered.tokenId;
  }
  const settlementSequence = state.settlementSequence + 1n;
  state.settlementSequence = settlementSequence;
  const receipt = addCoOwner(
    state,
    tokenId,
    input.assetPackKey,
    input.buyerAccount,
    settlementSequence,
    input.issuedAt || new Date().toISOString(),
  );
  return { state, receipt };
}

export type { PayAsset, SettleQuote, SharePayout };
