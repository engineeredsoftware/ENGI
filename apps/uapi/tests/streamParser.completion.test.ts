import { parseStreamChunk } from '@/streaming/stream-parser';

describe('parseStreamChunk completion mapping', () => {
  it('maps completion summary, processingStats (tokens/measured $BTD/BTC fees), repoSnapshot', () => {
    const payload = {
      type: 'completion',
      result: {
        summary: 'All done.',
        assetPackSynthesisArtifacts: {
          summary: 'Canonical synthesis artifacts.',
          fileChanges: { edited: 4, created: 1, deleted: 0 },
          proofEvidence: ['proof-a'],
          reviewNotes: ['review-a'],
        },
        writtenAssets: {
          summary: 'Stable asset-pack summary.',
          fileChanges: { edited: 2, created: 1, deleted: 0 },
        },
        shippables: {
          pullRequest: { url: 'https://github.com/acme/web/pull/1', title: 'feat: add' },
        },
        deliveryMechanism: {
          pullRequest: { url: 'https://github.com/acme/web/pull/1', title: 'feat: add' },
        },
        read: 'Deliver the audited auth refactor.',
        writtenAssetType: 'read-satisfaction-asset-pack',
        assetPack: { read: 'Deliver the audited auth refactor.', writtenAssetType: 'read-satisfaction-asset-pack', deliveryTarget: 'pr' },
        processingStats: {
          time: '2m 05s',
          tokens: { input: 100, output: 50, total: 150 },
          measuredBtd: 2,
          feeAsset: 'BTC',
          btcFeesPaid: 0.00001,
        },
        repoSnapshot: { org: 'acme', repo: 'web', branch: 'main', commit: 'deadbeef' },
        actions: {
          pullRequest: { url: 'https://github.com/acme/web/pull/1', title: 'feat: add' },
          comments: [{ url: 'https://github.com/acme/web/issues/2#comment-1', title: 'note' }],
          issues: [{ url: 'https://github.com/acme/web/issues/3', title: 'bug' }],
          files: { edited: 3, created: 1, deleted: 0 },
        },
      },
    } as any;

    const chunk = `data: ${JSON.stringify(payload)}\n\n`;
    const parsed = parseStreamChunk(chunk);
    expect(parsed.completion).toBeTruthy();
    expect(parsed.completion?.summary).toBe('All done.');
    expect(parsed.completion?.processingStats?.time).toBe('2m 05s');
    expect(parsed.completion?.processingStats?.tokens?.total).toBe(150);
    expect(parsed.completion?.processingStats?.measuredBtd).toBe(2);
    expect(parsed.completion?.processingStats?.feeAsset).toBe('BTC');
    expect(parsed.completion?.processingStats?.btcFeesPaid).toBe(0.00001);
    expect(parsed.completion?.processingStats?.credits).toBeUndefined();
    expect(parsed.completion?.repoSnapshot?.org).toBe('acme');
    expect(parsed.completion?.shippables?.pullRequest?.url).toContain('/pull/1');
    expect((parsed.completion?.shippables as any)?.comments).toBeUndefined();
    expect((parsed.completion?.shippables as any)?.issues).toBeUndefined();
    expect(parsed.completion?.deliverables).toBeUndefined();
    expect(parsed.completion?.assetPackSynthesisArtifacts?.summary).toBe('Canonical synthesis artifacts.');
    expect(parsed.completion?.assetPackSynthesisArtifacts?.fileChanges?.edited).toBe(4);
    expect(parsed.completion?.assetPackSynthesisArtifacts?.proofEvidence).toEqual(['proof-a']);
    expect(parsed.completion?.assetPackSynthesisArtifacts?.reviewNotes).toEqual(['review-a']);
    expect(parsed.completion?.writtenAssets?.summary).toBe('Stable asset-pack summary.');
    expect(parsed.completion?.writtenAssets?.fileChanges?.edited).toBe(2);
    expect(parsed.completion?.deliveryMechanism?.pullRequest?.url).toContain('/pull/1');
    expect(parsed.completion?.read).toBe('Deliver the audited auth refactor.');
    expect(parsed.completion?.writtenAssetType).toBe('read-satisfaction-asset-pack');
    expect(parsed.completion?.assetPack?.deliveryTarget).toBe('pr');
    expect(parsed.completion?.semanticKind).toBe('asset-pack-written-asset');
  });

  it('drops non-canonical processingStats.credits instead of retaining old economics', () => {
    const payload = {
      type: 'completion',
      result: {
        summary: 'Non-canonical stream shape.',
        processingStats: { time: '4s', credits: 3 },
      },
    } as any;

    const parsed = parseStreamChunk(`data: ${JSON.stringify(payload)}\n\n`);
    expect(parsed.completion?.processingStats?.time).toBe('4s');
    expect(parsed.completion?.processingStats?.measuredBtd).toBeUndefined();
    expect(parsed.completion?.processingStats?.credits).toBeUndefined();
  });

  it('maps AssetPack synthesis artifacts into canonical written assets when no written-assets payload exists', () => {
    const payload = {
      type: 'completion',
      result: {
        assetPackSynthesisArtifacts: {
          summary: 'Only canonical artifacts were emitted.',
          fileChanges: { edited: 6, created: 0, deleted: 1 },
          proofEvidence: ['asset-pack-proof'],
        },
      },
    } as any;

    const parsed = parseStreamChunk(`data: ${JSON.stringify(payload)}\n\n`);
    expect(parsed.completion?.assetPackSynthesisArtifacts?.summary).toBe('Only canonical artifacts were emitted.');
    expect(parsed.completion?.writtenAssets?.summary).toBe('Only canonical artifacts were emitted.');
    expect(parsed.completion?.deliverables).toBeUndefined();
    expect(parsed.completion?.semanticKind).toBe('asset-pack-written-asset');
  });

  it('does not synthesize shippables from summary-only delivery surfaces', () => {
    const payload = {
      type: 'completion',
      result: {
        summary: 'Finished without PR delivery.',
        deliveryMechanism: {
          summary: 'Finish recorded evidence without a PR delivery mechanism.',
        },
        writtenAssets: {
          summary: 'Evidence-only AssetPack surface.',
          fileChanges: { edited: 1, created: 0, deleted: 0 },
        },
      },
    } as any;

    const parsed = parseStreamChunk(`data: ${JSON.stringify(payload)}\n\n`);
    expect(parsed.completion?.writtenAssets?.fileChanges?.edited).toBe(1);
    expect(parsed.completion?.deliveryMechanism?.summary).toBe('Finish recorded evidence without a PR delivery mechanism.');
    expect(parsed.completion?.shippables).toBeNull();
  });
});
