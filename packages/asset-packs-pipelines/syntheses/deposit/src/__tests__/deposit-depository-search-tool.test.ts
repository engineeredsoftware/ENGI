/**
 * @jest-environment node
 */
import { runDepositDepositoryAssetPackSearch } from '@bitcode/asset-packs-pipelines-syntheses-domain/tools/deposit-depository-asset-pack-search';
import {
  buildDepositorySearchQueryPlan,
  extractNeedPrimaryPhrase,
} from '@bitcode/asset-packs-pipelines-syntheses-domain/tools/depository-search-query-plan';

describe('buildDepositorySearchQueryPlan (Need-first)', () => {
  it('keeps the full Need phrase and de-prioritizes path stems for read-need-fits', () => {
    const plan = buildDepositorySearchQueryPlan({
      needText: 'Add retries to payment webhooks when Stripe returns 429',
      paths: ['src/payments/stripe.ts', 'vendor/long-name-library/index.js'],
      product: 'read-need-fits',
      maxTerms: 12,
    });
    expect(plan[0]).toContain('retries');
    expect(plan[0]).toContain('payment');
    expect(plan.some((t) => t.includes('Stripe') || t.toLowerCase().includes('stripe'))).toBe(
      true,
    );
    // Path stems appear but must not be the only anchors
    const pathHeavy = plan.filter((t) => t === 'stripe' || t === 'index');
    expect(pathHeavy.length).toBeLessThanOrEqual(3);
    expect(extractNeedPrimaryPhrase('  fix auth  ')).toBe('fix auth');
  });
});

describe('runDepositDepositoryAssetPackSearch', () => {
  it('returns policy-declared status with empty corpus', async () => {
    const result = await runDepositDepositoryAssetPackSearch({
      queryTerms: ['auth', 'billing'],
      assets: [],
      env: {},
    });
    expect(result.success).toBe(true);
    expect(result.queryTerms).toEqual(['auth', 'billing']);
    expect(result.hitCount).toBe(0);
    expect(result.vectorStore.status).toBe('policy-declared');
    expect(result.embeddingPolicy.vectorStore.rpc).toBe('match_deliverable_vectors');
    expect(result.underservedTopics).toEqual(['auth', 'billing']);
  });

  it('builds Need-first terms and ranks phrase matches for read-need-fits', async () => {
    const need = 'Add retries to payment webhooks when Stripe returns 429';
    const result = await runDepositDepositoryAssetPackSearch({
      needText: need,
      product: 'read-need-fits',
      paths: ['src/unrelated/foo.ts'],
      assets: [
        {
          assetId: 'ap-need',
          title: 'Stripe webhook retry pack',
          contentUnits: [
            {
              unitId: 'u1',
              unitKind: 'summary',
              text: 'Add retries to payment webhooks when Stripe returns 429 with backoff',
            },
          ],
        } as any,
        {
          assetId: 'ap-path',
          title: 'foo utility',
          contentUnits: [{ unitId: 'u2', unitKind: 'summary', text: 'foo helper' }],
        } as any,
      ],
      env: {},
    });
    expect(result.success).toBe(true);
    expect(result.queryTerms[0]).toContain('payment');
    expect(result.hits[0]?.assetId).toBe('ap-need');
    expect(result.hits[0]?.matchedTerms.some((t) => t.includes('retries') || t.length > 20)).toBe(
      true,
    );
  });

  it('lexically ranks provided settled assets', async () => {
    const result = await runDepositDepositoryAssetPackSearch({
      queryTerms: ['invoice', 'billing'],
      assets: [
        {
          assetId: 'ap-1',
          title: 'Invoice reconciliation pack',
          contentUnits: [{ unitId: 'u1', unitKind: 'summary', text: 'billing invoice replay' }],
        } as any,
        {
          assetId: 'ap-2',
          title: 'Unrelated pack',
          contentUnits: [{ unitId: 'u2', unitKind: 'summary', text: 'graphics rendering' }],
        } as any,
      ],
      env: {},
    });
    expect(result.success).toBe(true);
    expect(result.hitCount).toBeGreaterThan(0);
    expect(result.hits.some((h) => h.assetId === 'ap-1')).toBe(true);
    expect(['lexical-only', 'hybrid', 'vector-matched']).toContain(result.vectorStore.status);
  });

  it('hybrid merges vector RPC hits when enabled', async () => {
    const embedQuery = jest.fn(async () => Array(1536).fill(0.01));
    const supabase = {
      rpc: jest.fn(async () => ({
        data: [{ asset_id: 'vec-9', title: 'Vector hit', similarity: 0.91 }],
        error: null,
      })),
    };
    const result = await runDepositDepositoryAssetPackSearch({
      queryTerms: ['auth'],
      assets: [
        {
          assetId: 'lex-1',
          title: 'Auth helpers',
          contentUnits: [{ unitId: 'u', unitKind: 'summary', text: 'auth oauth' }],
        } as any,
      ],
      embedQuery,
      supabase,
      env: { BITCODE_DEPOSITORY_VECTOR_SEARCH: '1' },
    });
    expect(embedQuery).toHaveBeenCalled();
    expect(supabase.rpc).toHaveBeenCalledWith(
      'match_depository_asset_pack_vectors',
      expect.objectContaining({ match_count: expect.any(Number) }),
    );
    expect(result.hits.some((h) => h.assetId === 'vec-9')).toBe(true);
    expect(result.vectorStore.status).toBe('hybrid');
  });

  it('fans out multi-query and unions hits by assetId', async () => {
    const result = await runDepositDepositoryAssetPackSearch({
      queries: ['stripe webhook retries', 'invoice billing'],
      product: 'read-need-fits',
      assets: [
        {
          assetId: 'ap-stripe',
          title: 'Stripe webhook retry pack',
          contentUnits: [
            {
              unitId: 'u1',
              unitKind: 'summary',
              text: 'stripe webhook retries with backoff',
            },
          ],
        } as any,
        {
          assetId: 'ap-invoice',
          title: 'Invoice reconciliation pack',
          contentUnits: [
            { unitId: 'u2', unitKind: 'summary', text: 'invoice billing replay' },
          ],
        } as any,
        {
          assetId: 'ap-noise',
          title: 'Graphics pack',
          contentUnits: [{ unitId: 'u3', unitKind: 'summary', text: 'shaders' }],
        } as any,
      ],
      env: {},
    });
    expect(result.queryCount).toBe(2);
    expect(result.queries).toEqual(['stripe webhook retries', 'invoice billing']);
    expect(result.hits.some((h) => h.assetId === 'ap-stripe')).toBe(true);
    expect(result.hits.some((h) => h.assetId === 'ap-invoice')).toBe(true);
    expect(result.hits.some((h) => h.assetId === 'ap-noise')).toBe(false);
  });

  it('applies static kind filters', async () => {
    const result = await runDepositDepositoryAssetPackSearch({
      queryTerms: ['auth'],
      staticFilters: { kinds: ['capability-slice'] },
      assets: [
        {
          assetId: 'ap-cap',
          title: 'Auth capability',
          artifactKind: 'capability-slice',
          contentUnits: [{ unitId: 'u1', unitKind: 'summary', text: 'auth oauth' }],
        } as any,
        {
          assetId: 'ap-pat',
          title: 'Auth pattern',
          artifactKind: 'implementation-pattern',
          contentUnits: [{ unitId: 'u2', unitKind: 'summary', text: 'auth oauth pattern' }],
        } as any,
      ],
      env: {},
    });
    expect(result.hits.every((h) => h.assetId === 'ap-cap')).toBe(true);
  });
});

