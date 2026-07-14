/**
 * BitcodeERC1155 TypeScript mirror + needinesses → BTD mint law.
 */

import {
  addAssetPackCoOwner,
  assertPositiveSettlementBtd,
  balanceOf,
  BITCODE_BTD_TOKEN_ID,
  BTD_MAX_SUPPLY_BASE_UNITS,
  burnAssetPackOwnership,
  computeSettlementBtdFromNeedinesses,
  createBitcodeErc1155State,
  isAssetPackCoOwner,
  mintBtdToMaster,
  needFitVolumeToBaseUnits,
  transferBtdFromMasterToBuyer,
} from '../src/erc1155';

describe('computeSettlementBtdFromNeedinesses', () => {
  it('computes weighted need-fit scalar from needinesses only', () => {
    const result = computeSettlementBtdFromNeedinesses({
      needinesses: [
        { measurementKind: 'language-fit', volume: 1, weight: 0.5 },
        { measurementKind: 'domain-fit', volume: 0, weight: 0.5 },
      ],
    });
    expect(result.needFitVolume).toBeCloseTo(0.5, 6);
    expect(result.weightedNeedinessesSum).toBeCloseTo(0.5, 6);
    expect(result.amountBaseUnits).toBe(needFitVolumeToBaseUnits(0.5));
    expect(result.needinessesCount).toBe(2);
  });

  it('fails closed when needinesses empty', () => {
    const empty = computeSettlementBtdFromNeedinesses({ needinesses: [] });
    expect(empty.amountBaseUnits).toBe(0n);
    expect(() => assertPositiveSettlementBtd(empty)).toThrow(/needinesses/);
  });

  it('ignores need-fit composite rows and non -fit kinds', () => {
    const result = computeSettlementBtdFromNeedinesses({
      needinesses: [
        { kind: 'need-fit', volume: 1, weight: 1 },
        { kind: 'bogus', volume: 1, weight: 1 },
        { measurementKind: 'language-fit', volume: 0.8, weight: 1 },
      ],
    });
    expect(result.needinessesCount).toBe(1);
    expect(result.needFitVolume).toBeCloseTo(0.8, 6);
  });

  it('accepts measurements carrier and kind alias forms (still strongly typed)', () => {
    const fromCarrier = computeSettlementBtdFromNeedinesses({
      measurements: {
        needinesses: [{ kind: 'language-fit', volume: 1, weight: 1 }],
      },
    });
    const fromArray = computeSettlementBtdFromNeedinesses([
      { measurementKind: 'language-fit', volume: 1, weight: 1 },
    ]);
    expect(fromCarrier.amountBaseUnits).toBe(fromArray.amountBaseUnits);
  });
});

describe('BitcodeERC1155 state machine', () => {
  const master = '0xMaster';
  const buyer = '0xBuyer';
  const depositor = '0xDepositor';

  function fresh() {
    return createBitcodeErc1155State({
      masterAccount: master,
      operator: '0xOperator',
    });
  }

  it('mints BTD to master then transfers to buyer under 21M cap', () => {
    let state = fresh();
    const amount = needFitVolumeToBaseUnits(0.81);
    const minted = mintBtdToMaster(state, {
      amountBaseUnits: amount,
      needFitVolume: 0.81,
      weightedNeedinessesSum: 0.81,
      needinessesCount: 3,
      assetPackKey: 'ap-1',
      proofRoot: 'proof-1',
    });
    state = minted.state;
    expect(balanceOf(state, master, BITCODE_BTD_TOKEN_ID)).toBe(amount);
    expect(state.btdTotalMinted).toBe(amount);

    const transferred = transferBtdFromMasterToBuyer(state, {
      buyerAccount: buyer,
      amountBaseUnits: amount,
      assetPackKey: 'ap-1',
    });
    state = transferred.state;
    expect(balanceOf(state, master, BITCODE_BTD_TOKEN_ID)).toBe(0n);
    expect(balanceOf(state, buyer, BITCODE_BTD_TOKEN_ID)).toBe(amount);
  });

  it('rejects mint beyond max supply', () => {
    const state = fresh();
    expect(() =>
      mintBtdToMaster(state, {
        amountBaseUnits: BTD_MAX_SUPPLY_BASE_UNITS + 1n,
        needFitVolume: 1,
        weightedNeedinessesSum: 1,
        needinessesCount: 1,
        assetPackKey: 'ap-overflow',
        proofRoot: 'x',
      }),
    ).toThrow(/max BTD supply/);
  });

  it('adds buyer as co-owner without removing depositor', () => {
    let state = fresh();
    const first = addAssetPackCoOwner(state, {
      assetPackKey: 'pack-auth',
      buyerAccount: buyer,
      depositorAccount: depositor,
      metadataRoot: 'meta-root',
    });
    state = first.state;
    expect(first.receipt.removedPriorOwner).toBe(false);
    expect(first.receipt.coOwners.map((a) => a.toLowerCase())).toEqual([
      depositor.toLowerCase(),
      buyer.toLowerCase(),
    ]);
    expect(isAssetPackCoOwner(state, 'pack-auth', depositor)).toBe(true);
    expect(isAssetPackCoOwner(state, 'pack-auth', buyer)).toBe(true);

    // Second settle for same pack is idempotent for buyer
    const second = addAssetPackCoOwner(state, {
      assetPackKey: 'pack-auth',
      buyerAccount: buyer,
    });
    expect(second.receipt.coOwners).toHaveLength(2);
    expect(isAssetPackCoOwner(second.state, 'pack-auth', depositor)).toBe(true);
  });

  it('forbids burning AssetPack ownership', () => {
    expect(() => burnAssetPackOwnership()).toThrow(/add-only/);
  });
});
