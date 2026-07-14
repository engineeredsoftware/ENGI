import {
  assertAssetPackId,
  createAssetPackPatchDescriptor,
  createAssetPackSourceBinding,
  emptyAssetPackMeasurements,
  ASSET_PACK_SCHEMA_PREFIX,
  type AssetPack,
} from '../index';

describe('asset-pack-generics primitives', () => {
  it('builds a minimal AssetPack with measurements carrier and without raw source', () => {
    const pack: AssetPack = {
      identity: {
        assetPackId: assertAssetPackId('asset-pack-test-1'),
        schema: `${ASSET_PACK_SCHEMA_PREFIX}.minimal`,
      },
      sourceBinding: createAssetPackSourceBinding({
        repositoryFullName: 'org/repo',
        sourceBranch: 'main',
        sourceCommit: 'abc123',
        sourcePathRoots: ['src/'],
      }),
      patch: createAssetPackPatchDescriptor({
        patchSummary: 'Add feature',
        fileChanges: [{ path: 'src/a.ts', op: 'add' }],
      }),
      deliveryMechanism: 'pull-request',
      measurements: emptyAssetPackMeasurements(),
    };

    expect(pack.sourceBinding.rawSourceStoredExternally).toBe(true);
    expect(pack.sourceBinding.protectedSourceVisible).toBe(false);
    expect(pack.patch.fileChanges).toHaveLength(1);
    expect(pack.identity.assetPackId).toBe('asset-pack-test-1');
    expect(pack.measurements.absolutes).toEqual([]);
    expect(pack.measurements.needinesses).toEqual([]);
  });

  it('rejects empty asset pack ids', () => {
    expect(() => assertAssetPackId('')).toThrow(/non-empty/);
  });
});
