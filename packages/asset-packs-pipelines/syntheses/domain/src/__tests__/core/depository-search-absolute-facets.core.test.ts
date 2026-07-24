// @ts-nocheck
/**
 * CORE: absolute facets drive depository hybrid search (deposit + read).
 */
import {
  extractAbsoluteFacets,
  absoluteFacetScore,
  assetPassesAbsoluteFilters,
  blendHybridScoreWithAbsolutes,
} from '../../depository-search-absolute-facets';
import { rankAsset } from '../../depository-search-scoring';
import { runDepositDepositoryAssetPackSearch } from '../../tools/deposit-depository-asset-pack-search';
import type { DepositoryAsset } from '../../depository-search-types';

function pack(overrides: Partial<DepositoryAsset> = {}): DepositoryAsset {
  return {
    assetId: 'ap-auth',
    title: 'Auth session capability slice',
    summary: 'Measured deposit pack for session authentication flows.',
    artifactKind: 'capability-slice',
    repositoryFullName: 'acme/payments',
    contentUnits: [
      {
        unitId: 'ap-auth:u1',
        unitKind: 'summary',
        text: 'session auth token refresh capability',
      },
    ],
    metadata: {
      absoluteKinds: [
        'function-count',
        'type-count',
        'file-span',
        'lang-span',
        'test-surface',
        'api-surface',
        'correctness-estimate',
      ],
      absoluteVolumes: {
        'function-count': 0.7,
        'type-count': 0.5,
        'file-span': 0.4,
        'lang-span': 0.25,
        'test-surface': 0.6,
        'api-surface': 0.55,
        'correctness-estimate': 0.8,
      },
      lifecycle: 'admitted-to-depository',
    },
    hasAssetMeasurementEvidence: true,
    ...overrides,
  };
}

describe('CORE: depository absolute facets', () => {
  it('extracts kinds, volumes, and a positive weighted composite', () => {
    const facets = extractAbsoluteFacets(pack());
    expect(facets.kinds).toContain('function-count');
    expect(facets.volumes['function-count']).toBe(0.7);
    expect(facets.composite).toBeGreaterThan(0.3);
    expect(facets.weightedMeasuredCount).toBeGreaterThanOrEqual(5);
  });

  it('filters by absoluteKinds and minAbsoluteVolumes', () => {
    const rich = pack();
    const thin = pack({
      assetId: 'ap-thin',
      metadata: {
        absoluteKinds: ['function-count'],
        absoluteVolumes: { 'function-count': 0.1 },
      },
    });
    expect(
      assetPassesAbsoluteFilters(rich, {
        absoluteKinds: ['test-surface'],
        minAbsoluteVolumes: { 'function-count': 0.5 },
      }),
    ).toBe(true);
    expect(
      assetPassesAbsoluteFilters(thin, {
        absoluteKinds: ['test-surface'],
      }),
    ).toBe(false);
    expect(
      assetPassesAbsoluteFilters(thin, {
        minAbsoluteVolumes: { 'function-count': 0.5 },
      }),
    ).toBe(false);
  });

  it('rankAsset measurement channel prefers richer absolute facets', () => {
    const rich = pack();
    const bare = pack({
      assetId: 'ap-bare',
      metadata: {},
      hasAssetMeasurementEvidence: false,
      assetMeasurement: undefined,
    });
    const read = {
      prompt: 'auth session capability with tests',
      targetArtifactKinds: ['capability-slice'],
      closureCriteria: [],
      failureModes: [],
    };
    const richRank = rankAsset(read as any, rich, [], {
      reviewScore: 0.1,
      worthyScore: 0.2,
      semanticScore: 0.05,
      maxSelectedCandidates: 12,
    });
    const bareRank = rankAsset(read as any, bare, [], {
      reviewScore: 0.1,
      worthyScore: 0.2,
      semanticScore: 0.05,
      maxSelectedCandidates: 12,
    });
    expect(richRank.ranking.channelScores.measurement).toBeGreaterThan(
      bareRank.ranking.channelScores.measurement,
    );
    expect(richRank.ranking.channelScores.absoluteComposite).toBeGreaterThan(0);
    // Presence-only measured packs still clear a strong floor; rich facets score higher.
    expect(richRank.ranking.channelScores.measurement).toBeGreaterThanOrEqual(0.7);
    expect(richRank.ranking.finalScore).toBeGreaterThan(bareRank.ranking.finalScore);
  });

  it('hybrid search tool filters and re-ranks by absolute facets', async () => {
    const rich = pack();
    const other = pack({
      assetId: 'ap-other',
      title: 'Unrelated payments billing slice',
      summary: 'invoice totals only',
      metadata: {
        absoluteKinds: ['file-span'],
        absoluteVolumes: { 'file-span': 0.15 },
      },
      contentUnits: [
        { unitId: 'ap-other:u1', unitKind: 'summary', text: 'invoice billing totals' },
      ],
    });
    const result = await runDepositDepositoryAssetPackSearch({
      product: 'read-need-fits',
      needText: 'session authentication capability',
      queryTerms: ['session', 'authentication', 'auth'],
      assets: [rich, other],
      staticFilters: {
        absoluteKinds: ['function-count', 'test-surface'],
        minAbsoluteVolumes: { 'function-count': 0.4 },
      },
      maxResults: 5,
    });
    expect(result.success).toBe(true);
    expect(result.telemetry.assetCorpusAfterFilters).toBe(1);
    expect(result.hits.some((h) => h.assetId === 'ap-auth')).toBe(true);
    expect(result.hits.some((h) => h.assetId === 'ap-other')).toBe(false);
    const authHit = result.hits.find((h) => h.assetId === 'ap-auth');
    expect(authHit?.finalScore).toBeGreaterThan(0);
  });

  it('blendHybridScoreWithAbsolutes lifts measured packs without inventing hits', () => {
    const rich = pack();
    const bare = pack({
      assetId: 'ap-bare',
      metadata: {},
    });
    const lifted = blendHybridScoreWithAbsolutes(0.4, rich, { absoluteWeight: 0.24 });
    const bareBlend = blendHybridScoreWithAbsolutes(0.4, bare, { absoluteWeight: 0.24 });
    expect(lifted).toBeGreaterThan(bareBlend);
    // Near-zero base is not promoted to a strong hit by absolutes alone.
    expect(blendHybridScoreWithAbsolutes(0.02, rich)).toBeLessThan(0.25);
    expect(absoluteFacetScore(rich)).toBeGreaterThan(absoluteFacetScore(bare));
  });
});
