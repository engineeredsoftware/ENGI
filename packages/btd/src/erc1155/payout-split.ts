/**
 * Seller payout finalize split (ETH pay rail for now; same math for BTC/SOL).
 *
 * Law: 100% of BTD Volume V is minted at settle into escrow (master).
 * Seller chooses `sellerBtdBps` ∈ [0, 10000] on pack detail:
 *   - Seller receives sellerBtdBps/10000 of escrowed BTD
 *   - Treasury receives the remainder of BTD
 *   - Seller receives (10000 - sellerBtdBps)/10000 of paid ETH (inverse)
 *   - Treasury receives sellerBtdBps/10000 of paid ETH
 *
 * Example: sellerBtdBps = 1000 (10% BTD / 90% ETH for seller)
 *   seller:  10% BTD + 90% ETH
 *   treasury: 90% BTD + 10% ETH
 */

import type { PayAsset } from './types';

export interface PayoutSplitInput {
  /** Full needinesses BTD volume minted at settle (base units). */
  btdVolume: bigint;
  /** Full external payment held at settle (wei/sats/lamports). */
  payAmount: bigint;
  payAsset: PayAsset;
  /**
   * Seller preference: bps of compensation taken as BTD (rest as payAsset).
   * 0 = all payAsset for seller (treasury keeps all BTD).
   * 10000 = all BTD for seller (treasury keeps all payAsset).
   */
  sellerBtdBps: number;
}

export interface PayoutSplitResult {
  schema: 'bitcode.settle.payout-split';
  sellerBtdBps: number;
  sellerEthBps: number;
  treasuryBtdBps: number;
  treasuryEthBps: number;
  sellerBtd: bigint;
  treasuryBtd: bigint;
  sellerPay: bigint;
  treasuryPay: bigint;
  payAsset: PayAsset;
  btdVolume: bigint;
  payAmount: bigint;
}

export function clampSellerBtdBps(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(10_000, Math.round(value)));
}

/**
 * Compute inverse seller/treasury split. Does not mutate balances.
 */
export function computePayoutSplit(input: PayoutSplitInput): PayoutSplitResult {
  const sellerBtdBps = clampSellerBtdBps(input.sellerBtdBps);
  const sellerEthBps = 10_000 - sellerBtdBps;
  const treasuryBtdBps = sellerEthBps; // inverse of seller BTD share
  const treasuryEthBps = sellerBtdBps; // inverse of seller ETH share

  const btdVolume = input.btdVolume < 0n ? 0n : input.btdVolume;
  const payAmount = input.payAmount < 0n ? 0n : input.payAmount;

  const sellerBtd = (btdVolume * BigInt(sellerBtdBps)) / 10_000n;
  const treasuryBtd = btdVolume - sellerBtd;
  const sellerPay = (payAmount * BigInt(sellerEthBps)) / 10_000n;
  const treasuryPay = payAmount - sellerPay;

  return {
    schema: 'bitcode.settle.payout-split',
    sellerBtdBps,
    sellerEthBps,
    treasuryBtdBps,
    treasuryEthBps,
    sellerBtd,
    treasuryBtd,
    sellerPay,
    treasuryPay,
    payAsset: input.payAsset,
    btdVolume,
    payAmount,
  };
}

export interface PayoutPreviewRow {
  party: 'seller' | 'treasury';
  btdBaseUnits: string;
  payAmount: string;
  payAsset: PayAsset;
  btdBps: number;
  payBps: number;
}

export function payoutSplitToPreview(split: PayoutSplitResult): PayoutPreviewRow[] {
  return [
    {
      party: 'seller',
      btdBaseUnits: split.sellerBtd.toString(),
      payAmount: split.sellerPay.toString(),
      payAsset: split.payAsset,
      btdBps: split.sellerBtdBps,
      payBps: split.sellerEthBps,
    },
    {
      party: 'treasury',
      btdBaseUnits: split.treasuryBtd.toString(),
      payAmount: split.treasuryPay.toString(),
      payAsset: split.payAsset,
      btdBps: split.treasuryBtdBps,
      payBps: split.treasuryEthBps,
    },
  ];
}
