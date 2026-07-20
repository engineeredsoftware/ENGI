/**
 * Spot quote: BTD Volume V → pay amounts for ETH / BTC / SOL.
 *
 * Production-shaped interface with mock provider default for testnet/CI.
 * Settle never trusts the browser — only server-signed payAmount is binding.
 *
 * Env (documented; read by API layer, not required in this pure module):
 *   BITCODE_SPOT_PROVIDER=mock|http|chainlink
 *   BITCODE_SPOT_HTTP_URL / BITCODE_SPOT_HTTP_API_KEY
 *   BITCODE_CHAINLINK_ETH_USD / BITCODE_CHAINLINK_BTC_USD
 *   BITCODE_BTD_USD_MODE=operator_reference|pool_twap
 *   BITCODE_BTD_USD_REFERENCE / BITCODE_BTD_WETH_POOL
 *   BITCODE_SPOT_MAX_STALENESS_SEC_ETH|BTC|SOL
 */

import {
  BTD_DECIMALS_SCALE,
  PAY_ASSET_DECIMALS,
  type PayAsset,
} from './types';

export type SpotProviderKind = 'mock' | 'http' | 'chainlink';

/** USD per 1 whole unit of asset (ETH, BTC, SOL, or BTD). */
export interface UsdSpotBoard {
  ethUsd: number;
  btcUsd: number;
  solUsd: number;
  /** Protocol reference or market BTD/USD until deep liquidity. */
  btdUsd: number;
  updatedAt: string;
  provider: SpotProviderKind;
}

export interface PayRailQuote {
  payAsset: PayAsset;
  /** Exact integer units (wei / sats / lamports). */
  payAmount: bigint;
  /** Human display string for UI. */
  payAmountDisplay: string;
  /**
   * pay-asset base units per 1 BTD base unit, scaled by 1e6 for quote.rateMicro
   * (audit only; on-chain trusts payAmount).
   */
  rateMicro: number;
  /** USD notional of payAmount (display). */
  payAmountUsd: number;
  rateUpdatedAt: string;
  available: boolean;
  unavailableReason?: string;
  decimals: number;
}

export interface MultiRailSpotQuote {
  schema: 'bitcode.settle.multi-rail-spot';
  btdVolume: bigint;
  board: UsdSpotBoard;
  options: PayRailQuote[];
}

/** Default mock board (testnet/CI). Tunable via createMockSpotBoard. */
export const DEFAULT_MOCK_USD_BOARD: Omit<UsdSpotBoard, 'updatedAt' | 'provider'> = {
  ethUsd: 3500,
  btcUsd: 95_000,
  solUsd: 150,
  /** Reference BTD/USD until external markets exist. */
  btdUsd: 1.4,
};

export function createMockSpotBoard(
  overrides?: Partial<typeof DEFAULT_MOCK_USD_BOARD>,
): UsdSpotBoard {
  return {
    ...DEFAULT_MOCK_USD_BOARD,
    ...overrides,
    updatedAt: new Date().toISOString(),
    provider: 'mock',
  };
}

function scaleForDecimals(decimals: number): bigint {
  let s = 1n;
  for (let i = 0; i < decimals; i += 1) s *= 10n;
  return s;
}

/**
 * Convert BTD volume (18-decimal base units) to pay-asset base units using USD board.
 * payAmount = ceil(V * btdUsd / assetUsd) in asset decimals.
 */
export function btdVolumeToPayAmount(
  btdVolume: bigint,
  payAsset: PayAsset,
  board: UsdSpotBoard,
): { payAmount: bigint; rateMicro: number; payAmountUsd: number } {
  if (btdVolume <= 0n) {
    return { payAmount: 0n, rateMicro: 0, payAmountUsd: 0 };
  }
  const assetUsd =
    payAsset === 'ETH' ? board.ethUsd : payAsset === 'BTC' ? board.btcUsd : board.solUsd;
  if (!(assetUsd > 0) || !(board.btdUsd > 0)) {
    return { payAmount: 0n, rateMicro: 0, payAmountUsd: 0 };
  }

  // Use micro-USD (1e6) integer math to reduce float error.
  const btdUsdMicro = BigInt(Math.round(board.btdUsd * 1e6));
  const assetUsdMicro = BigInt(Math.round(assetUsd * 1e6));
  const assetScale = scaleForDecimals(PAY_ASSET_DECIMALS[payAsset]);

  // payAmount = ceil(btdVolume * btdUsd / assetUsd * assetScale / BTD_SCALE)
  // = ceil(btdVolume * btdUsdMicro * assetScale / (assetUsdMicro * BTD_SCALE))
  const num = btdVolume * btdUsdMicro * assetScale;
  const den = assetUsdMicro * BTD_DECIMALS_SCALE;
  const payAmount = den === 0n ? 0n : (num + den - 1n) / den; // ceil div

  // Whole BTD notional for display USD.
  const wholeBtd = Number(btdVolume) / Number(BTD_DECIMALS_SCALE);
  const payAmountUsd = wholeBtd * board.btdUsd;

  // rateMicro: asset base units per 1 BTD base unit * 1e6
  // ≈ (btdUsd/assetUsd) * assetScale/BTD_SCALE * 1e6
  const rateFloat =
    (board.btdUsd / assetUsd) *
    (Number(assetScale) / Number(BTD_DECIMALS_SCALE)) *
    1e6;
  const rateMicro = Math.max(0, Math.round(rateFloat));

  return { payAmount, rateMicro, payAmountUsd };
}

function formatPayAmount(payAmount: bigint, decimals: number): string {
  if (payAmount === 0n) return '0';
  const scale = scaleForDecimals(decimals);
  const whole = payAmount / scale;
  const frac = payAmount % scale;
  if (frac === 0n) return whole.toString();
  const fracStr = frac.toString().padStart(decimals, '0').replace(/0+$/, '');
  return `${whole.toString()}.${fracStr}`;
}

/**
 * Build three-rail spot options for a BTD volume.
 * Rails with invalid rates are marked available: false (fail-closed per rail).
 */
export function buildMultiRailSpotQuote(
  btdVolume: bigint,
  board: UsdSpotBoard = createMockSpotBoard(),
): MultiRailSpotQuote {
  const assets: PayAsset[] = ['ETH', 'BTC', 'SOL'];
  const options: PayRailQuote[] = assets.map((payAsset) => {
    const decimals = PAY_ASSET_DECIMALS[payAsset];
    if (btdVolume <= 0n) {
      return {
        payAsset,
        payAmount: 0n,
        payAmountDisplay: '0',
        rateMicro: 0,
        payAmountUsd: 0,
        rateUpdatedAt: board.updatedAt,
        available: false,
        unavailableReason: 'BTD volume is zero',
        decimals,
      };
    }
    const { payAmount, rateMicro, payAmountUsd } = btdVolumeToPayAmount(
      btdVolume,
      payAsset,
      board,
    );
    if (payAmount <= 0n) {
      return {
        payAsset,
        payAmount: 0n,
        payAmountDisplay: '0',
        rateMicro: 0,
        payAmountUsd: 0,
        rateUpdatedAt: board.updatedAt,
        available: false,
        unavailableReason: 'Spot rate unavailable',
        decimals,
      };
    }
    return {
      payAsset,
      payAmount,
      payAmountDisplay: formatPayAmount(payAmount, decimals),
      rateMicro,
      payAmountUsd,
      rateUpdatedAt: board.updatedAt,
      available: true,
      decimals,
    };
  });

  return {
    schema: 'bitcode.settle.multi-rail-spot',
    btdVolume,
    board,
    options,
  };
}

/**
 * Spot provider interface (production-shaped).
 * Mock implementation is the testnet/CI default.
 */
export interface SpotQuoteProvider {
  readonly kind: SpotProviderKind;
  fetchUsdBoard(): Promise<UsdSpotBoard>;
}

export class MockSpotQuoteProvider implements SpotQuoteProvider {
  readonly kind = 'mock' as const;
  constructor(private readonly overrides?: Partial<typeof DEFAULT_MOCK_USD_BOARD>) {}

  async fetchUsdBoard(): Promise<UsdSpotBoard> {
    return createMockSpotBoard(this.overrides);
  }
}

/**
 * HTTP provider stub — production-shaped; throws until API layer wires real fetch.
 * Implement against CoinGecko/CMC/exchange using BITCODE_SPOT_HTTP_* env.
 */
export class HttpSpotQuoteProvider implements SpotQuoteProvider {
  readonly kind = 'http' as const;
  constructor(
    private readonly fetchBoard: () => Promise<Omit<UsdSpotBoard, 'provider'>>,
  ) {}

  async fetchUsdBoard(): Promise<UsdSpotBoard> {
    const board = await this.fetchBoard();
    return { ...board, provider: 'http' };
  }
}

export async function quoteMultiRailWithProvider(
  btdVolume: bigint,
  provider: SpotQuoteProvider = new MockSpotQuoteProvider(),
): Promise<MultiRailSpotQuote> {
  const board = await provider.fetchUsdBoard();
  return buildMultiRailSpotQuote(btdVolume, board);
}
