/**
 * @jest-environment node
 */
import { runDepositDepositoryAssetPackSearch } from '../tools/deposit-depository-asset-pack-search';

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
      'match_deliverable_vectors',
      expect.objectContaining({ match_count: expect.any(Number) }),
    );
    expect(result.hits.some((h) => h.assetId === 'vec-9')).toBe(true);
    expect(result.vectorStore.status).toBe('hybrid');
  });
});
