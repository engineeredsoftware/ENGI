/**
 * BitcodeERC1155 — TypeScript executable mirror of the settlement contract.
 *
 * One contract:
 * - token id 0 = fungible BTD (Bitcode), max 21_000_000 * 10^18 base units
 * - token ids ≥ 1 = AssetPack co-ownership units (add-only; never burn ownership)
 *
 * Live chain deployment uses contracts/BitcodeERC1155.sol; this module is the
 * authoritative behavior for tests and projected settlement receipts.
 */

import { createHash } from 'crypto';
import {
  BITCODE_ASSET_PACK_ID_START,
  BITCODE_BTD_TOKEN_ID,
  BTD_MAX_SUPPLY_BASE_UNITS,
  type AssetPackCoOwnReceiptV48,
  type AssetPackCoOwnership,
  type BitcodeErc1155Config,
  type BitcodeErc1155State,
  type BtdMintReceiptV48,
  type BtdTransferReceiptV48,
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
  return {
    schema: 'bitcode.erc1155.state',
    config: {
      masterAccount: normalizeAddress(config.masterAccount, 'masterAccount'),
      operator: normalizeAddress(config.operator, 'operator'),
      name: config.name || 'Bitcode',
      symbol: config.symbol || 'BTD',
    },
    btdTotalMinted: 0n,
    balances: emptyBalances(),
    nextAssetPackTokenId: BITCODE_ASSET_PACK_ID_START,
    assetPackTokenByKey: new Map(),
    assetPacks: new Map(),
    settlementSequence: 0n,
  };
}

export function balanceOf(
  state: BitcodeErc1155State,
  account: string,
  tokenId: bigint,
): bigint {
  return getBalance(state, account, tokenId);
}

/**
 * mint-btd: mint fungible BTD to the **master** contract account after BTC settle.
 * Amount is needinesses-derived base units; capped by remaining 21M supply.
 */
export function mintBtdToMaster(
  state: BitcodeErc1155State,
  input: {
    amountBaseUnits: bigint;
    needFitVolume: number;
    weightedNeedinessesSum: number;
    needinessesCount: number;
    assetPackKey: string;
    proofRoot: string;
    issuedAt?: string;
  },
): { state: BitcodeErc1155State; receipt: BtdMintReceiptV48 } {
  if (input.amountBaseUnits <= 0n) {
    throw new Error('mintBtdToMaster: amountBaseUnits must be positive.');
  }
  const nextTotal = state.btdTotalMinted + input.amountBaseUnits;
  if (nextTotal > BTD_MAX_SUPPLY_BASE_UNITS) {
    throw new Error(
      `mintBtdToMaster: exceeds max BTD supply of ${BTD_MAX_SUPPLY_BASE_UNITS.toString()} base units.`,
    );
  }
  const master = state.config.masterAccount;
  const before = getBalance(state, master, BITCODE_BTD_TOKEN_ID);
  setBalance(state, master, BITCODE_BTD_TOKEN_ID, before + input.amountBaseUnits);
  const settlementSequence = state.settlementSequence + 1n;
  state.btdTotalMinted = nextTotal;
  state.settlementSequence = settlementSequence;

  const receipt: BtdMintReceiptV48 = {
    kind: 'btd.erc1155.mint',
    tokenId: BITCODE_BTD_TOKEN_ID,
    to: master,
    amountBaseUnits: input.amountBaseUnits,
    needFitVolume: input.needFitVolume,
    weightedNeedinessesSum: input.weightedNeedinessesSum,
    needinessesCount: input.needinessesCount,
    btdTotalMintedBefore: nextTotal - input.amountBaseUnits,
    btdTotalMintedAfter: nextTotal,
    maxSupplyBaseUnits: BTD_MAX_SUPPLY_BASE_UNITS,
    assetPackKey: input.assetPackKey,
    settlementSequence,
    proofRoot: input.proofRoot,
    issuedAt: input.issuedAt || new Date().toISOString(),
  };
  return { state, receipt };
}

/**
 * settle-btd: transfer fungible BTD from master → buyer Ethereum wallet.
 */
export function transferBtdFromMasterToBuyer(
  state: BitcodeErc1155State,
  input: {
    buyerAccount: string;
    amountBaseUnits: bigint;
    assetPackKey: string;
    proofRoot?: string;
    issuedAt?: string;
  },
): { state: BitcodeErc1155State; receipt: BtdTransferReceiptV48 } {
  const buyer = normalizeAddress(input.buyerAccount, 'buyerAccount');
  const master = state.config.masterAccount;
  if (input.amountBaseUnits <= 0n) {
    throw new Error('transferBtdFromMasterToBuyer: amountBaseUnits must be positive.');
  }
  const masterBal = getBalance(state, master, BITCODE_BTD_TOKEN_ID);
  if (masterBal < input.amountBaseUnits) {
    throw new Error('transferBtdFromMasterToBuyer: master BTD balance insufficient.');
  }
  setBalance(state, master, BITCODE_BTD_TOKEN_ID, masterBal - input.amountBaseUnits);
  setBalance(
    state,
    buyer,
    BITCODE_BTD_TOKEN_ID,
    getBalance(state, buyer, BITCODE_BTD_TOKEN_ID) + input.amountBaseUnits,
  );
  const settlementSequence = state.settlementSequence + 1n;
  state.settlementSequence = settlementSequence;
  const proofRoot =
    input.proofRoot ||
    `btd-transfer:${createHash('sha256')
      .update(`${master}:${buyer}:${input.amountBaseUnits}:${input.assetPackKey}`)
      .digest('hex')}`;

  const receipt: BtdTransferReceiptV48 = {
    kind: 'btd.erc1155.transfer',
    tokenId: BITCODE_BTD_TOKEN_ID,
    from: master,
    to: buyer,
    amountBaseUnits: input.amountBaseUnits,
    assetPackKey: input.assetPackKey,
    settlementSequence,
    proofRoot,
    issuedAt: input.issuedAt || new Date().toISOString(),
  };
  return { state, receipt };
}

/**
 * Ensure AssetPack token exists with depositor as initial co-owner.
 * If already registered, returns existing token id without removing anyone.
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
  // Mint co-ownership unit to depositor (balance 1).
  setBalance(state, depositor, tokenId, 1n);
  return { state, tokenId, created: true };
}

/**
 * settle-asset-pack: **add** buyer as equal co-owner. Never removes depositor
 * or any prior co-owner. AssetPacks cannot be burned/removed from ownership.
 */
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
  const buyer = normalizeAddress(input.buyerAccount, 'buyerAccount');
  let tokenId = state.assetPackTokenByKey.get(input.assetPackKey);
  if (tokenId === undefined) {
    if (!input.depositorAccount) {
      throw new Error(
        'addAssetPackCoOwner: AssetPack not registered and depositorAccount missing for first mint.',
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
  const pack = state.assetPacks.get(tokenId);
  if (!pack) throw new Error('addAssetPackCoOwner: missing co-ownership registry row.');

  if (!pack.coOwners.includes(buyer)) {
    pack.coOwners = [...pack.coOwners, buyer];
    // Add-only: mint +1 ownership unit to buyer; never decrement others.
    setBalance(state, buyer, tokenId, getBalance(state, buyer, tokenId) + 1n);
  }

  const settlementSequence = state.settlementSequence + 1n;
  state.settlementSequence = settlementSequence;
  const proofRoot =
    input.proofRoot ||
    `ap-co-own:${createHash('sha256')
      .update(`${tokenId}:${buyer}:${pack.coOwners.join(',')}`)
      .digest('hex')}`;

  const receipt: AssetPackCoOwnReceiptV48 = {
    kind: 'asset-pack.erc1155.co-own',
    tokenId,
    assetPackKey: pack.assetPackKey,
    addedAccount: buyer,
    coOwners: [...pack.coOwners],
    removedPriorOwner: false,
    settlementSequence,
    proofRoot,
    issuedAt: input.issuedAt || new Date().toISOString(),
  };
  return { state, receipt };
}

/** AssetPack ownership can never be removed (V48 law). */
export function burnAssetPackOwnership(): never {
  throw new Error(
    'AssetPack co-ownership is add-only: burn/remove is forbidden (V48 BitcodeERC1155 law).',
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

export function serializeBitcodeErc1155State(state: BitcodeErc1155State): Record<string, unknown> {
  const balances: Record<string, Record<string, string>> = {};
  for (const [account, byToken] of state.balances.entries()) {
    balances[account] = {};
    for (const [tokenId, amount] of byToken.entries()) {
      balances[account][tokenId.toString()] = amount.toString();
    }
  }
  const assetPacks: Record<string, unknown> = {};
  for (const [tokenId, pack] of state.assetPacks.entries()) {
    assetPacks[tokenId.toString()] = {
      ...pack,
      tokenId: pack.tokenId.toString(),
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
  };
}
