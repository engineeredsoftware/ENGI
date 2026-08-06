/**
 * `$BTD` wallet-read and measurement utilities.
 *
 * V26 treats `$BTD` as a non-fungible AssetPack share/read-right and measured
 * Bitcode content amount. It is not a fungible fee token. BTC pays fees.
 *
 * The persistence schema still exposes the historical `user_credits` table as
 * a storage carrier for aggregate read posture until the schema is re-cut, but
 * this package must not mutate that table as a spendable balance bucket.
 */

import { supabaseAdmin } from '@bitcode/supabase';
import { getUsdPricingForApiModel } from '@bitcode/generic-llms-models/src/pricing';
import {
  BTD_ASSET_SEMANTICS,
  BITCODE_FEE_ASSET,
  BTD_MAX_MINTABLE_SUPPLY,
} from './constants';

export {
  BTD_ASSET_SEMANTICS,
  BITCODE_FEE_ASSET,
  BTD_MAX_MINTABLE_SUPPLY,
} from './constants';

export interface GenerationTokens {
  inputTokens: number;
  outputTokens: number;
}

export interface BtdHoldingRead {
  userId: string;
  btdBalance: number;
  semantics: typeof BTD_ASSET_SEMANTICS;
  source: 'wallet_read' | 'storage_read';
}

export interface BtcFeeEstimate {
  feeAsset: typeof BITCODE_FEE_ASSET;
  btcFeesPaid: number | null;
  btcFeeUsdEquivalent: number;
  feeStatus: 'estimated' | 'wallet_settled';
}

/**
 * Raised when a caller attempts to use `$BTD` as a fungible spend/debit token.
 */
export class BtdFungibleMutationRejectedError extends Error {
  public readonly code = 'BTD_IS_NON_FUNGIBLE';

  constructor(message = '$BTD is a non-fungible AssetPack share/read-right, not a spendable balance.') {
    super(message);
    this.name = 'BtdFungibleMutationRejectedError';
  }
}

export async function getBtdBalance(userId: string): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('user_credits')
    .select('balance')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Error fetching BTD holdings for user ${userId}: ${error.message}`);
  }

  return typeof data?.balance === 'number' ? data.balance : 0;
}

export const getBalance = getBtdBalance;

export async function readBtdHoldings(userId: string): Promise<BtdHoldingRead> {
  return {
    userId,
    btdBalance: await getBtdBalance(userId),
    semantics: BTD_ASSET_SEMANTICS,
    source: 'storage_read',
  };
}

export function rejectFungibleBtdMutation(): never {
  throw new BtdFungibleMutationRejectedError();
}

/** Rough estimate tokens from text (approximately four characters per token). */
export function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

/**
 * Computes the BTC-fee basis for a given generation.
 *
 * V26 has enough local information to calculate the USD-equivalent model cost.
 * The actual BTC payment transaction belongs to wallet/settlement surfaces, so
 * `btcFeesPaid` remains null until a wallet-settled value is supplied.
 * Extend `@bitcode/generic-llms-models` pricing when Bitcode supports new models or vendors.
 */
export function calculateLlmBtcFeeEstimate(
  model: string,
  tokens: GenerationTokens,
): BtcFeeEstimate {
  const pricing = getUsdPricingForApiModel(model);
  if (!pricing) {
    throw new Error(`Unsupported / unknown model for BTC fee calculation: ${model}`);
  }

  const usd =
    (tokens.inputTokens * pricing.input + tokens.outputTokens * pricing.output) / 1_000_000;

  return {
    feeAsset: BITCODE_FEE_ASSET,
    btcFeesPaid: null,
    btcFeeUsdEquivalent: Number(usd.toFixed(6)),
    feeStatus: 'estimated',
  };
}

export function calculateMeasuredBtdFromTokens(tokens: GenerationTokens): number {
  const total = Math.max(0, tokens.inputTokens) + Math.max(0, tokens.outputTokens);
  return Math.max(1, Math.ceil(total / 1000));
}

export function assertBtdMintableSupplyLimit(
  currentMintedBtd: number,
  proposedMintBtd: number,
): number {
  if (!Number.isFinite(currentMintedBtd) || !Number.isFinite(proposedMintBtd)) {
    throw new Error('$BTD mint supply inputs must be finite numbers.');
  }

  const nextSupply = Math.max(0, currentMintedBtd) + Math.max(0, proposedMintBtd);

  if (nextSupply > BTD_MAX_MINTABLE_SUPPLY) {
    throw new Error(
      `$BTD minting is capped at ${BTD_MAX_MINTABLE_SUPPLY.toLocaleString()} measured non-fungible shares.`,
    );
  }

  return nextSupply;
}

export function buildGenerationBitcodeAccounting(
  model: string,
  tokens: GenerationTokens,
): BtcFeeEstimate & {
  measuredBtd: number;
  btdSemantics: typeof BTD_ASSET_SEMANTICS;
} {
  return {
    ...calculateLlmBtcFeeEstimate(model, tokens),
    measuredBtd: calculateMeasuredBtdFromTokens(tokens),
    btdSemantics: BTD_ASSET_SEMANTICS,
  };
}

export * from './api-schema-compatibility-matrix';
export * from './bitcoin-fees';
export * from './btc-fee-operation';
export * from './bitcoin-provider';
export * from './bridge-readiness';
export * from './chatgpt-app-action-contract';
export * from './access';
export * from './allocation';
export * from './ancestry';
export * from './api-boundaries';
export * from './authority';
export * from './auxillaries-support';
export * from './constants';
/** V48 BitcodeERC1155: fungible BTD + AssetPack co-ownership. */
export * from './erc1155';
export * from './deployment-lanes';
export * from './deployment-readiness-rehearsal';
export * from './deployment-promotion-readiness-report';
export * from './deployment-host-capability-catalog';
export * from './deployment-storage-posture';
export * from './exchange';
export * from './interface-contract-catalog';
export * from './interface-contract-regression';
export * from './interface-authorization-policy';
export * from './interface-consumer-ux-regression-proof';
export * from './interface-telemetry-proof-hook';
export * from './interface-integration';
export * from './interface-integration-contract';
export * from './ledger-anchor';
export * from './measuremint';
export * from './migration-approval-gate';
export * from './mcp-tool-contract';
export * from './plans';
export * from './range';
export * from './read-license-assetpack-rights-contract';
export * from './receipts';
export * from './reconciliation';
export * from './replay';
export * from './revenue';
export * from './rollback-upgrade-repair-playbook';
export * from './runtime-observer-repair-job';
export * from './semantic-volume';
export * from './settlement';
export * from './secret-rotation-plan';
export * from './source-to-shares';
export * from './supply';
export * from './telemetry';
export * from './journal';
/** product-era journal export names — prefer `./journal` symbols in new code. */
export * from './journal';
export * from './operational-health';
/** product-era operational-health export names — prefer `./operational-health` in new code. */
export * from './terminal-operational-health';
export * from './testnet-mainnet-readiness-rehearsal';
export * from './upgrade';
export * from './wallet';
