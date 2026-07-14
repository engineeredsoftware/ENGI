import {
  buildReadSynthesizedAssetPack,
  READ_SYNTHESIZED_ASSET_PACK_SCHEMA,
} from '../index';

describe('ReadSynthesizedAssetPack', () => {
  it('builds read pack with needinesses and BTD/BTC commercial fields', () => {
    const pack = buildReadSynthesizedAssetPack({
      assetPackId: 'read-1',
      title: 'Session refresh fit',
      summary: 'Need-fit option',
      repositoryFullName: 'org/app',
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
      btd: { needFitVolume: 0.9, amountBaseUnits: '900000000000000000' },
      btc: { amountSats: 12_000, network: 'btc-testnet' },
      settleable: true,
    });

    expect(pack.identity.schema).toBe(READ_SYNTHESIZED_ASSET_PACK_SCHEMA);
    expect(pack.measurements.needinesses).toHaveLength(1);
    expect(pack.measurements.absolutes).toHaveLength(1);
    expect(pack.needFit).toBe(0.9);
    expect(pack.btd?.needFitVolume).toBe(0.9);
    expect(pack.btc?.amountSats).toBe(12_000);
    expect(pack.settleable).toBe(true);
  });
});
