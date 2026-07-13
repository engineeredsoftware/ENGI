import {
  buildMeasuredPatchAssetPack,
  measuredPatchToDepositContents,
  MEASURED_PATCH_ASSET_PACK_SCHEMA,
} from '../index';

describe('MeasuredPatchAssetPack', () => {
  it('builds a measured patch pack with protocol schema', () => {
    const pack = buildMeasuredPatchAssetPack({
      assetPackId: 'ap-1',
      title: 'Auth slice',
      summary: 'Measured auth capability slice',
      repositoryFullName: 'org/repo',
      sourceBranch: 'main',
      sourceCommit: 'deadbeef',
      sourcePathRoots: ['src/auth'],
      fileChanges: [{ path: 'src/auth/index.ts', op: 'modify' }],
      measurements: [
        {
          id: 'm1',
          label: 'Functions',
          measurementKind: 'function-count',
          weight: 1,
          volume: 0.5,
          category: 'absolute',
          magnitude: 12,
          unit: 'functions',
        },
      ],
      absoluteVolume: 0.5,
      neediness: {
        volume: 0.4,
        demand: 0.6,
        saturation: 0.2,
        rationale: 'test',
      },
    });

    expect(pack.identity.schema).toBe(MEASURED_PATCH_ASSET_PACK_SCHEMA);
    expect(pack.deliveryMechanism).toBe('pull-request');
    expect(pack.measurements).toHaveLength(1);
    expect(pack.sourceBinding.protectedSourceVisible).toBe(false);

    const contents = measuredPatchToDepositContents(pack);
    expect(contents.fileChanges[0].path).toBe('src/auth/index.ts');
    expect(contents.provenantSourceCount).toBeGreaterThan(0);
  });
});
