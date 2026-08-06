import { buildReadSynthesizedAssetPack } from '@bitcode/generic-asset-packs-read-synthesized';
import {
  buildReadSynthesizedSettledAssetPack,
  READ_SYNTHESIZED_SETTLED_ASSET_PACK_SCHEMA,
} from '../index';

describe('ReadSynthesizedSettledAssetPack', () => {
  it('builds settled pack from read option with BTD/BTC/rights/delivery', () => {
    const readOption = buildReadSynthesizedAssetPack({
      assetPackId: 'read-settle-1',
      title: 'Auth fit',
      summary: 'Need-fit option',
      measurements: {
        absolutes: [
          {
            measurementKind: 'functions',
            volume: 0.4,
            magnitude: 8,
            weight: 0.18,
            unit: 'functions',
            category: 'absolute',
          },
        ],
        needinesses: [
          {
            measurementKind: 'language-fit',
            volume: 0.9,
            magnitude: 0.9,
            weight: 0.35,
            unit: 'fit',
            category: 'neediness',
          },
        ],
      },
      needFit: 0.9,
      settleable: true,
    });

    const settled = buildReadSynthesizedSettledAssetPack({
      readOption,
      btdRights: {
        needFitVolume: 0.9,
        amountBaseUnits: '900000000000000000',
        masterAccount: '0xmaster',
        buyerAccount: '0xbuyer',
        status: 'transferred',
      },
      btcSettlement: {
        network: 'btc-testnet',
        status: 'observed-projection',
        txId: null,
        amountSats: 12000,
        finality: 'testnet-projected',
      },
      assetPackRights: {
        tokenId: '1',
        assetPackKey: 'ap-key',
        coOwners: ['0xdepositor', '0xbuyer'],
        removedPriorOwner: false,
      },
      delivery: {
        mechanism: 'pull_request',
        status: 'projected',
        prUrl: null,
      },
      settleRunId: 'run-1',
    });

    expect(settled.identity.schema).toBe(READ_SYNTHESIZED_SETTLED_ASSET_PACK_SCHEMA);
    expect(settled.measurements.needinesses).toHaveLength(1);
    expect(settled.btdRights.status).toBe('transferred');
    expect(settled.btcSettlement.amountSats).toBe(12000);
    expect(settled.assetPackRights.removedPriorOwner).toBe(false);
    expect(settled.assetPackRights.coOwners).toContain('0xbuyer');
    expect(settled.delivery.mechanism).toBe('pull_request');
    expect(settled.settleable).toBe(false);
    expect(settled.selectable).toBe(false);
  });
});
