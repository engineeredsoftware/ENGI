/**
 * BitcodeERC1155 TypeScript mirror — multi-rail settle + needinesses volume.
 */

import {
  applyBtdSupplyDecay,
  assertPositiveSettlementBtd,
  balanceOf,
  BITCODE_BTD_TOKEN_ID,
  BTD_MAX_SUPPLY_BASE_UNITS,
  buildMultiRailSpotQuote,
  burnAssetPackOwnership,
  computePayoutSplit,
  computeSettlementBtdFromNeedinesses,
  createBitcodeErc1155State,
  createMockSpotBoard,
  finalizeSellerPayout,
  finalizeSettle,
  isAssetPackCoOwner,
  needFitVolumeToBaseUnits,
  remainingMintable,
  transferBtd,
  type SettleQuote,
} from '../src/erc1155';

describe('computeSettlementBtdFromNeedinesses (rawV)', () => {
  it('computes weighted need-fit scalar from needinesses only', () => {
    const result = computeSettlementBtdFromNeedinesses({
      needinesses: [
        { measurementKind: 'language-fit', volume: 1, weight: 0.5 },
        { measurementKind: 'domain-fit', volume: 0, weight: 0.5 },
      ],
    });
    expect(result.needFitVolume).toBeCloseTo(0.5, 6);
    expect(result.amountBaseUnits).toBe(needFitVolumeToBaseUnits(0.5));
  });

  it('fails closed when needinesses empty', () => {
    const empty = computeSettlementBtdFromNeedinesses({ needinesses: [] });
    expect(empty.amountBaseUnits).toBe(0n);
    expect(() => assertPositiveSettlementBtd(empty)).toThrow(/needinesses/);
  });
});

describe('applyBtdSupplyDecay', () => {
  it('decays raw volume by residual supply fraction', () => {
    const raw = needFitVolumeToBaseUnits(1);
    const halfMinted = BTD_MAX_SUPPLY_BASE_UNITS / 2n;
    const result = applyBtdSupplyDecay({
      rawVolumeBaseUnits: raw,
      btdTotalMinted: halfMinted,
    });
    expect(result.decay).toBeCloseTo(0.5, 5);
    expect(result.btdVolume).toBe(raw / 2n);
  });

  it('returns zero when fully minted', () => {
    const result = applyBtdSupplyDecay({
      rawVolumeBaseUnits: needFitVolumeToBaseUnits(1),
      btdTotalMinted: BTD_MAX_SUPPLY_BASE_UNITS,
    });
    expect(result.btdVolume).toBe(0n);
    expect(result.decay).toBe(0);
  });
});

describe('buildMultiRailSpotQuote (mock)', () => {
  it('returns ETH/BTC/SOL options for positive volume', () => {
    const V = needFitVolumeToBaseUnits(0.5);
    const quote = buildMultiRailSpotQuote(V, createMockSpotBoard());
    expect(quote.options).toHaveLength(3);
    for (const opt of quote.options) {
      expect(opt.available).toBe(true);
      expect(opt.payAmount > 0n).toBe(true);
      expect(['ETH', 'BTC', 'SOL']).toContain(opt.payAsset);
    }
  });
});

describe('BitcodeERC1155 finalizeSettle', () => {
  const master = '0xmaster';
  const buyer = '0xbuyer';
  const depositor = '0xdepositor';

  function fresh() {
    return createBitcodeErc1155State({
      masterAccount: master,
      operator: '0xoperator',
      coinFeeBps: 250,
    });
  }

  function baseQuote(overrides?: Partial<SettleQuote>): SettleQuote {
    const raw = computeSettlementBtdFromNeedinesses({
      needinesses: [
        { measurementKind: 'language-fit', volume: 1, weight: 1 },
        { measurementKind: 'domain-fit', volume: 1, weight: 1 },
      ],
    });
    const decayed = applyBtdSupplyDecay({
      rawVolumeBaseUnits: raw.amountBaseUnits,
      btdTotalMinted: 0n,
    });
    const spots = buildMultiRailSpotQuote(decayed.btdVolume, createMockSpotBoard());
    const eth = spots.options.find((o) => o.payAsset === 'ETH')!;
    return {
      assetPackKey: 'ap-read-1',
      buyer,
      payAsset: 'ETH',
      btdVolume: decayed.btdVolume,
      payAmount: eth.payAmount,
      rateMicro: eth.rateMicro,
      needFitMicro: Math.round(raw.needFitVolume * 1e6),
      decayMicro: decayed.decayMicro,
      shares: [
        {
          depositor,
          weightBps: 10_000,
          btdBps: 10_000,
          coinBps: 0,
        },
      ],
      metadataRoot: 'meta:ap-read-1',
      deadline: Math.floor(Date.now() / 1000) + 600,
      quoteId: 'quote-1',
      ...overrides,
    };
  }

  it('mints full V BTD to master escrow; buyer gets co-own only', () => {
    let state = fresh();
    const quote = baseQuote();
    const { state: next, receipt } = finalizeSettle(state, quote, {
      ethPaid: quote.payAmount,
    });
    state = next;

    expect(receipt.btdMintedTotal).toBe(quote.btdVolume);
    expect(balanceOf(state, master, BITCODE_BTD_TOKEN_ID)).toBe(quote.btdVolume);
    expect(balanceOf(state, buyer, BITCODE_BTD_TOKEN_ID)).toBe(0n);
    expect(balanceOf(state, depositor, BITCODE_BTD_TOKEN_ID)).toBe(0n);
    expect(isAssetPackCoOwner(state, 'ap-read-1', buyer)).toBe(true);
    expect(isAssetPackCoOwner(state, 'ap-read-1', depositor)).toBe(true);
    expect(state.btdTotalMinted).toBe(quote.btdVolume);
  });

  it('seller payout 10% BTD / 90% ETH gives inverse to treasury', () => {
    let state = fresh();
    const quote = baseQuote({ quoteId: 'payout-1' });
    const settled = finalizeSettle(state, quote, { ethPaid: quote.payAmount });
    state = settled.state;

    const split = computePayoutSplit({
      btdVolume: quote.btdVolume,
      payAmount: quote.payAmount,
      payAsset: 'ETH',
      sellerBtdBps: 1000,
    });
    expect(split.sellerBtdBps).toBe(1000);
    expect(split.sellerEthBps).toBe(9000);
    expect(split.treasuryBtdBps).toBe(9000);
    expect(split.treasuryEthBps).toBe(1000);

    const paid = finalizeSellerPayout(state, {
      sellerAccount: depositor,
      sellerBtdBps: 1000,
      btdVolume: quote.btdVolume,
      payAmount: quote.payAmount,
      payAsset: 'ETH',
      assetPackKey: quote.assetPackKey,
    });
    state = paid.state;
    expect(balanceOf(state, depositor, BITCODE_BTD_TOKEN_ID)).toBe(split.sellerBtd);
    expect(balanceOf(state, master, BITCODE_BTD_TOKEN_ID)).toBe(split.treasuryBtd);
    expect(paid.receipt.sellerPay).toBe(split.sellerPay);
    expect(paid.receipt.treasuryPay).toBe(split.treasuryPay);
  });

  it('rejects quote replay', () => {
    const state = fresh();
    const quote = baseQuote({ quoteId: 'replay' });
    finalizeSettle(state, quote, { ethPaid: quote.payAmount });
    expect(() => finalizeSettle(state, quote, { ethPaid: quote.payAmount })).toThrow(
      /QuoteConsumed/,
    );
  });

  it('rejects incorrect ETH payment', () => {
    const state = fresh();
    const quote = baseQuote({ quoteId: 'bad-pay' });
    expect(() =>
      finalizeSettle(state, quote, { ethPaid: quote.payAmount - 1n }),
    ).toThrow(/IncorrectPayment/);
  });

  it('rejects expired quote', () => {
    const state = fresh();
    const quote = baseQuote({
      quoteId: 'expired',
      deadline: Math.floor(Date.now() / 1000) - 10,
    });
    expect(() => finalizeSettle(state, quote, { ethPaid: quote.payAmount })).toThrow(
      /QuoteExpired/,
    );
  });

  it('forbids burn', () => {
    expect(() => burnAssetPackOwnership()).toThrow(/burn/);
  });

  it('allows BTD transfer after mint (market path from escrow)', () => {
    let state = fresh();
    const quote = baseQuote({ quoteId: 'xfer' });
    const settled = finalizeSettle(state, quote, { ethPaid: quote.payAmount });
    state = settled.state;
    state = transferBtd(state, {
      from: master,
      to: buyer,
      amountBaseUnits: 1n,
    });
    expect(balanceOf(state, buyer, BITCODE_BTD_TOKEN_ID)).toBe(1n);
  });

  it('tracks remaining mintable under 21M cap', () => {
    const state = fresh();
    expect(remainingMintable(state)).toBe(BTD_MAX_SUPPLY_BASE_UNITS);
  });

  it('finalizes BTC path with railTxId', () => {
    let state = fresh();
    const quote = baseQuote({
      quoteId: 'btc-1',
      payAsset: 'BTC',
      payAmount: 1500n, // sats-scale fixture
    });
    const { state: next, receipt } = finalizeSettle(state, quote, {
      railTxId: 'btc-txid-hash-1',
    });
    state = next;
    expect(receipt.payAsset).toBe('BTC');
    expect(state.railTxUsed.has('btc-txid-hash-1')).toBe(true);
    expect(() =>
      finalizeSettle(state, { ...quote, quoteId: 'btc-2' }, { railTxId: 'btc-txid-hash-1' }),
    ).toThrow(/RailTxAlreadyUsed/);
  });
});
