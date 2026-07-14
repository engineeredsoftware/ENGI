/**
 * SettleAssetPacksSimplePipeline — 1:1 option, needinesses BTD mint, ERC1155 co-own.
 */

import { Execution } from '@bitcode/execution-generics';
import { factorySettleAssetPacksSimplePipeline } from '../index';
import {
  balanceOf,
  BITCODE_BTD_TOKEN_ID,
  computeSettlementBtdFromNeedinesses,
} from '@bitcode/btd/erc1155';

describe('SettleAssetPacksSimplePipeline', () => {
  const option = {
    title: 'Session refresh fit pack',
    kind: 'capability-slice',
    patch: { patchSummary: 'Add refresh token rotation helper.' },
    measurements: {
      absolutes: [
        { kind: 'functions', volume: 0.4, magnitude: 8, weight: 0.18, unit: 'functions' },
      ],
      needinesses: [
        { kind: 'language-fit', volume: 0.9, weight: 0.35 },
        { kind: 'domain-fit', volume: 0.8, weight: 0.35 },
        { kind: 'interface-fit', volume: 0.7, weight: 0.3 },
      ],
    },
  };

  it('rejects multi-option settle (1:1 law)', async () => {
    const pipeline = factorySettleAssetPacksSimplePipeline();
    const exec = new Execution('test:settle:multi');
    await expect(
      pipeline(
        {
          selectedOptions: [option, { ...option, title: 'Other' }],
        } as any,
        exec,
      ),
    ).rejects.toThrow(/1:1/);
  });

  it('runs settle-btc → mint-btd → settle-btd → settle-asset-pack → ship → journal', async () => {
    const pipeline = factorySettleAssetPacksSimplePipeline();
    const exec = new Execution('test:settle:happy');
    const result = await pipeline(
      {
        assetPackOption: option,
        repository: { fullName: 'acme/app', owner: 'acme', name: 'app', branch: 'main' },
        buyerEthereumAddress: '0xBuyerWallet',
        depositorEthereumAddress: '0xDepositorWallet',
        masterEthereumAddress: '0xMasterTreasury',
        userId: 'user-1',
        paymentObservation: {
          network: 'btc-testnet',
          amountSats: 12_000,
          // no txId → projected observation
        },
      } as any,
      exec,
    );

    expect(result.success).toBe(true);
    expect(result.summary).toMatch(/settle-btc → mint-btd → settle-btd → settle-asset-pack/);

    const mint = (result as any).mintBtd;
    expect(mint.agent).toBe('mint-btd');
    expect(mint.settlementBtd.needinessesCount).toBe(3);
    expect(mint.settlementBtd.needFitVolume).toBeGreaterThan(0.7);
    expect(mint.settlementBtd.needFitVolume).toBeLessThan(1);
    // Absolutes must not affect BTD amount
    const onlyNeedinesses = computeSettlementBtdFromNeedinesses(option.measurements);
    expect(String(mint.settlementBtd.amountBaseUnits)).toBe(
      onlyNeedinesses.amountBaseUnits.toString(),
    );

    const settleBtd = (result as any).settleBtd;
    expect(settleBtd.agent).toBe('settle-btd');
    expect(settleBtd.buyerAccount.toLowerCase()).toBe('0xbuyerwallet');
    expect(BigInt(settleBtd.buyerBtdBalance)).toBeGreaterThan(0n);

    const settleAp = (result as any).settleAssetPack;
    expect(settleAp.agent).toBe('settle-asset-pack');
    expect(settleAp.removedPriorOwner).toBe(false);
    expect(settleAp.coOwners.map((a: string) => a.toLowerCase())).toEqual(
      expect.arrayContaining(['0xdepositorwallet', '0xbuyerwallet']),
    );

    const activity = (result as any).packActivity;
    expect(activity.packActivityType).toBe('settled-assetpack');
    expect(activity.mintBtd.needFitVolume).toBe(mint.settlementBtd.needFitVolume);
    expect(activity.settleAssetPack.removedPriorOwner).toBe(false);
    expect(activity.measurements.some((m: any) => m.category === 'neediness')).toBe(true);

    // ERC1155 state: buyer holds BTD; master drained after settle-btd
    const state = (result as any).erc1155State;
    expect(balanceOf(state, '0xBuyerWallet', BITCODE_BTD_TOKEN_ID)).toBeGreaterThan(0n);
    expect(balanceOf(state, '0xMasterTreasury', BITCODE_BTD_TOKEN_ID)).toBe(0n);
  });

  it('mint amount ignores absolutes entirely', () => {
    const withAbs = computeSettlementBtdFromNeedinesses({
      absolutes: [{ kind: 'functions', volume: 1, magnitude: 999, weight: 1 }],
      needinesses: [{ kind: 'language-fit', volume: 0.5, weight: 1 }],
    });
    const withoutAbs = computeSettlementBtdFromNeedinesses({
      needinesses: [{ kind: 'language-fit', volume: 0.5, weight: 1 }],
    });
    expect(withAbs.amountBaseUnits).toBe(withoutAbs.amountBaseUnits);
    expect(withAbs.needFitVolume).toBe(0.5);
  });
});
