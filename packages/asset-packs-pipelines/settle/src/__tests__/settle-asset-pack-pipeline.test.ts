/**
 * ExecutionPipelineSimpleSettleAssetPack — 1:1 option, needinesses BTD mint, ERC1155 co-own.
 */

import { Execution } from '@bitcode/execution-generics';
import {
  factoryExecutionPipelineSimpleSettleAssetPack,
  type SettleAssetPackOption,
  type SettleAssetPackInput,
} from '../index';
import {
  balanceOf,
  BITCODE_BTD_TOKEN_ID,
  computeSettlementBtdFromNeedinesses,
} from '@bitcode/btd/erc1155';

describe('ExecutionPipelineSimpleSettleAssetPack', () => {
  const option: SettleAssetPackOption = {
    title: 'Session refresh fit pack',
    kind: 'capability-slice',
    patch: { patchSummary: 'Add refresh token rotation helper.' },
    measurements: {
      absolutes: [
        {
          kind: 'functions',
          volume: 0.4,
          magnitude: 8,
          weight: 0.18,
          unit: 'functions',
        },
      ],
      needinesses: [
        { kind: 'language-fit', volume: 0.9, weight: 0.35 },
        { kind: 'domain-fit', volume: 0.8, weight: 0.35 },
        { kind: 'interface-fit', volume: 0.7, weight: 0.3 },
      ],
    },
  };

  it('rejects multi-option settle (1:1 law)', async () => {
    const pipeline = factoryExecutionPipelineSimpleSettleAssetPack();
    const exec = new Execution('test:settle:multi');
    const input: SettleAssetPackInput = {
      selectedOptions: [option, { ...option, title: 'Other' }],
    };
    await expect(pipeline(input, exec)).rejects.toThrow(/1:1/);
  });

  it('runs settle-btc → mint-btd → settle-btd → settle-asset-pack → ship → journal', async () => {
    const pipeline = factoryExecutionPipelineSimpleSettleAssetPack();
    const exec = new Execution('test:settle:happy');
    const input: SettleAssetPackInput = {
      assetPackOption: option,
      repository: { fullName: 'acme/app', owner: 'acme', name: 'app', branch: 'main' },
      buyerEthereumAddress: '0xBuyerWallet',
      depositorEthereumAddress: '0xDepositorWallet',
      masterEthereumAddress: '0xMasterTreasury',
      userId: 'user-1',
      paymentObservation: {
        network: 'btc-testnet',
        amountSats: 12_000,
      },
    };
    const result = await pipeline(input, exec);

    expect(result.success).toBe(true);
    expect(result.summary).toMatch(/settle-btc → mint-btd → settle-btd → settle-asset-pack/);
    expect(result.readSynthesizedSettledAssetPack?.identity.schema).toMatch(/read-synthesized-settled/);
    expect(result.readSynthesizedSettledAssetPack?.btdRights.status).toBe('transferred');
    expect(result.readSynthesizedSettledAssetPack?.assetPackRights.removedPriorOwner).toBe(false);
    expect(result.readSynthesizedSettledAssetPack?.settleable).toBe(false);

    const mint = result.mintBtd;
    expect(mint.agent).toBe('mint-btd');
    expect(mint.settlementBtd.needinessesCount).toBe(3);
    expect(mint.settlementBtd.needFitVolume).toBeGreaterThan(0.7);
    expect(mint.settlementBtd.needFitVolume).toBeLessThan(1);
    const onlyNeedinesses = computeSettlementBtdFromNeedinesses(option.measurements);
    expect(String(mint.settlementBtd.amountBaseUnits)).toBe(
      onlyNeedinesses.amountBaseUnits.toString(),
    );

    const settleBtd = result.settleBtd;
    expect(settleBtd.agent).toBe('settle-btd');
    expect(settleBtd.buyerAccount.toLowerCase()).toBe('0xbuyerwallet');
    expect(BigInt(settleBtd.buyerBtdBalance)).toBeGreaterThan(0n);

    const settleAp = result.settleAssetPack;
    expect(settleAp.agent).toBe('settle-asset-pack');
    expect(settleAp.removedPriorOwner).toBe(false);
    expect(settleAp.coOwners.map((a) => a.toLowerCase())).toEqual(
      expect.arrayContaining(['0xdepositorwallet', '0xbuyerwallet']),
    );

    const activity = result.packActivity;
    expect(activity.packActivityType).toBe('settled-assetpack');
    expect(activity.mintBtd?.needFitVolume).toBe(mint.settlementBtd.needFitVolume);
    expect(activity.settleAssetPack?.removedPriorOwner).toBe(false);
    expect(activity.measurements.some((m) => m.category === 'neediness')).toBe(true);

    const state = result.erc1155State;
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
