// @ts-nocheck
/**
 * EDGES: absolute facet filters / extraction boundary cases.
 */
import {
  extractAbsoluteFacets,
  assetPassesAbsoluteFilters,
  blendHybridScoreWithAbsolutes,
} from '../../depository-search-absolute-facets';
import { normalizeDepositoryAsset } from '../../depository-search-normalize';
import { runDepositDepositoryAssetPackSearch } from '../../tools/deposit-depository-asset-pack-search';
import type { DepositoryAsset } from '../../depository-search-types';

function baseAsset(overrides: Partial<DepositoryAsset> = {}): DepositoryAsset {
  return {
    assetId: 'edge-1',
    title: 'Edge pack',
    summary: 'edge case',
    artifactKind: 'capability-slice',
    contentUnits: [{ unitId: 'e:u1', unitKind: 'summary', text: 'edge' }],
    metadata: {},
    ...overrides,
  };
}

describe('EDGES: depository absolute facets', () => {
  it('extracts from nested measurements.absolutes product shape', () => {
    const asset = baseAsset({
      metadata: {
        measurements: {
          absolutes: [
            { measurementKind: 'function-count', volume: 0.9, weight: 0.09 },
            { measurementKind: 'api-surface', volume: 0.4, weight: 0.07 },
          ],
        },
      },
    });
    const facets = extractAbsoluteFacets(asset);
    expect(facets.kinds).toEqual(expect.arrayContaining(['function-count', 'api-surface']));
    expect(facets.volumes['function-count']).toBe(0.9);
    expect(facets.composite).toBeGreaterThan(0);
  });

  it('normalizeDepositoryAsset promotes absolutes onto metadata for search', () => {
    const normalized = normalizeDepositoryAsset({
      assetId: 'norm-1',
      title: 'Normalized pack',
      summary: 'has absolutes',
      artifactKind: 'capability-slice',
      measurements: {
        absolutes: [
          { measurementKind: 'lang-span', volume: 0.5, weight: 0.06 },
          { measurementKind: 'modularity', volume: 0.3, weight: 0.05 },
        ],
      },
    });
    expect(normalized?.metadata?.absoluteKinds).toEqual(
      expect.arrayContaining(['lang-span', 'modularity']),
    );
    expect(normalized?.metadata?.absoluteVolumes?.['lang-span']).toBe(0.5);
    expect(normalized?.hasAssetMeasurementEvidence).toBe(true);
  });

  it('requireAllAbsoluteKinds fails when any kind is missing', () => {
    const asset = baseAsset({
      metadata: {
        absoluteKinds: ['function-count', 'type-count'],
        absoluteVolumes: { 'function-count': 0.5, 'type-count': 0.5 },
      },
    });
    expect(
      assetPassesAbsoluteFilters(asset, {
        absoluteKinds: ['function-count', 'test-surface'],
        requireAllAbsoluteKinds: true,
      }),
    ).toBe(false);
    expect(
      assetPassesAbsoluteFilters(asset, {
        absoluteKinds: ['function-count', 'type-count'],
        requireAllAbsoluteKinds: true,
      }),
    ).toBe(true);
  });

  it('minAbsoluteComposite rejects thin measured packs', () => {
    const thin = baseAsset({
      metadata: {
        absoluteKinds: ['function-count'],
        absoluteVolumes: { 'function-count': 0.1 },
      },
    });
    expect(
      assetPassesAbsoluteFilters(thin, { minAbsoluteComposite: 0.5 }),
    ).toBe(false);
  });

  it('empty absolute filters do not gate the corpus', () => {
    const asset = baseAsset({ metadata: {} });
    expect(assetPassesAbsoluteFilters(asset, {})).toBe(true);
    expect(assetPassesAbsoluteFilters(asset, null)).toBe(true);
  });

  it('vector-only hybrid path tolerates missing in-memory assets for unknown ids', async () => {
    const result = await runDepositDepositoryAssetPackSearch({
      product: 'read-need-fits',
      queries: ['auth'],
      assets: [],
      env: { BITCODE_DEPOSITORY_VECTOR_SEARCH: '1' } as any,
      supabase: {
        rpc: async () => ({
          data: [
            {
              asset_id: 'vec-only-1',
              title: 'Vector hit',
              similarity: 0.81,
              absolute_kinds: ['function-count'],
            },
          ],
          error: null,
        }),
      },
      embedQuery: async () => Array.from({ length: 384 }, () => 0.01),
      staticFilters: { absoluteKinds: ['function-count'] },
    });
    expect(result.hits.some((h) => h.assetId === 'vec-only-1')).toBe(true);
    expect(result.vectorStore.status === 'vector-matched' || result.hitCount > 0).toBe(true);
  });

  it('blendHybridScoreWithAbsolutes clamps and is stable for NaN base', () => {
    const asset = baseAsset({
      metadata: {
        absoluteKinds: ['function-count'],
        absoluteVolumes: { 'function-count': 0.9 },
      },
    });
    expect(blendHybridScoreWithAbsolutes(Number.NaN, asset)).toBeGreaterThanOrEqual(0);
    expect(blendHybridScoreWithAbsolutes(2, asset)).toBeLessThanOrEqual(1);
    expect(blendHybridScoreWithAbsolutes(0.5, null)).toBe(0.5);
  });

  it('search with AND absolute kinds + volume floor excludes partial packs', async () => {
    const full = baseAsset({
      assetId: 'full',
      title: 'full measured auth',
      contentUnits: [{ unitId: 'f', unitKind: 'summary', text: 'auth session' }],
      metadata: {
        absoluteKinds: ['function-count', 'test-surface'],
        absoluteVolumes: { 'function-count': 0.7, 'test-surface': 0.6 },
      },
    });
    const partial = baseAsset({
      assetId: 'partial',
      title: 'partial measured auth',
      contentUnits: [{ unitId: 'p', unitKind: 'summary', text: 'auth session' }],
      metadata: {
        absoluteKinds: ['function-count'],
        absoluteVolumes: { 'function-count': 0.7 },
      },
    });
    const result = await runDepositDepositoryAssetPackSearch({
      product: 'deposit-relevants',
      queryTerms: ['auth'],
      assets: [full, partial],
      staticFilters: {
        absoluteKinds: ['function-count', 'test-surface'],
        requireAllAbsoluteKinds: true,
        minAbsoluteVolumes: { 'test-surface': 0.5 },
      },
    });
    expect(result.telemetry.assetCorpusAfterFilters).toBe(1);
    expect(result.hits.map((h) => h.assetId)).toEqual(['full']);
  });
});
