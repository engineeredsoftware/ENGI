import {
  getHeaderDeliveryMechanism,
  getHeaderWrittenAssets,
  mergeHeaderSettleDelivery,
  type HeaderAssetPackCompletion,
} from '@/components/bitcode/pipeline/ExecutionsCompleteHeaderContent/ExecutionsCompleteHeaderContent';

describe('executions header semantic mirrors', () => {
  it('prefers AssetPack synthesis artifacts for summary and file changes while preserving delivery mechanisms', () => {
    const assetPackCompletion: HeaderAssetPackCompletion = {
      assetPackSynthesisArtifacts: {
        summary: 'Primary AssetPack synthesis artifact summary.',
        fileChanges: {
          edited: 5,
          created: 2,
          deleted: 0,
          paths: ['src/asset-pack.ts'],
        },
      },
      writtenAssets: {
        summary: 'Stable written asset summary.',
        fileChanges: {
          edited: 3,
          created: 1,
          deleted: 0,
          paths: ['src/index.ts'],
        },
      },
      settleDelivery: {
        pullRequest: {
          title: 'Settled PR',
          url: 'https://example.com/pr/4',
          number: 4,
        },
      },
    };

    expect(getHeaderWrittenAssets(assetPackCompletion)?.summary).toBe('Primary AssetPack synthesis artifact summary.');
    expect(getHeaderDeliveryMechanism(assetPackCompletion)?.pullRequest?.title).toBe('Settled PR');
    expect(
      mergeHeaderSettleDelivery(
        getHeaderWrittenAssets(assetPackCompletion),
        getHeaderDeliveryMechanism(assetPackCompletion),
      ),
    ).toEqual({
      pullRequest: {
        title: 'Settled PR',
        url: 'https://example.com/pr/4',
        number: 4,
      },
      fileChanges: {
        edited: 5,
        created: 2,
        deleted: 0,
        paths: ['src/asset-pack.ts'],
      },
      summary: 'Primary AssetPack synthesis artifact summary.',
    });
  });

  it('does not promote written AssetPack evidence into delivery mechanisms', () => {
    const assetPackCompletion: HeaderAssetPackCompletion = {
      assetPackSynthesisArtifacts: {
        summary: 'Evidence-only AssetPack synthesis.',
        fileChanges: {
          edited: 1,
          created: 0,
          deleted: 0,
          paths: ['src/index.ts'],
        },
      },
    };

    expect(getHeaderDeliveryMechanism(assetPackCompletion)).toBeNull();
    expect(
      mergeHeaderSettleDelivery(
        getHeaderWrittenAssets(assetPackCompletion),
        getHeaderDeliveryMechanism(assetPackCompletion),
      ),
    ).toEqual({
      pullRequest: null,
      fileChanges: {
        edited: 1,
        created: 0,
        deleted: 0,
        paths: ['src/index.ts'],
      },
      summary: 'Evidence-only AssetPack synthesis.',
    });
  });
});
