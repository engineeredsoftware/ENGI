/**
 * MVP-E2E L3-Q: hybrid lexical ranking — commercial NL ≫ path noise.
 * In-memory assets only (no live Supabase / vector RPC).
 */
import type { DepositoryAsset } from '../../depository-search-types';
import { runDepositDepositoryAssetPackSearch } from '../../tools/deposit-depository-asset-pack-search';

function asset(partial: Partial<DepositoryAsset> & { assetId: string }): DepositoryAsset {
  return {
    title: partial.title || partial.assetId,
    summary: partial.summary ?? null,
    artifactKind: partial.artifactKind || 'asset-pack',
    contentUnits: partial.contentUnits || [],
    metadata: partial.metadata ?? null,
    ...partial,
  };
}

describe('MVP-E2E L3 hybrid search ranking', () => {
  it('ranks commercial-NL pack above path-only pack for the same Need phrase', async () => {
    const nlRich = asset({
      assetId: 'ap-nl',
      title: 'Generic pack title',
      contentUnits: [
        {
          unitId: 'c',
          unitKind: 'commercial-nl',
          text: 'Stripe webhook retries with exponential backoff for payment processors',
        },
      ],
      metadata: {
        commercialTitle: 'Stripe webhook retries',
        commercialDescription: 'Exponential backoff on 429 from Stripe webhooks.',
      },
    });
    const pathOnly = asset({
      assetId: 'ap-path',
      title: 'Layout utilities',
      contentUnits: [
        {
          unitId: 'p',
          unitKind: 'paths',
          text: 'src/webhooks/retry-helper.ts src/ui/layout.tsx',
        },
      ],
      metadata: {
        coveredSourcePaths: ['src/webhooks/retry-helper.ts', 'src/ui/layout.tsx'],
      },
    });

    const result = await runDepositDepositoryAssetPackSearch({
      product: 'read-need-fits',
      needText: 'Stripe webhook retries exponential backoff',
      queryTerms: ['Stripe webhook retries'],
      queries: ['Stripe webhook retries'],
      assets: [pathOnly, nlRich],
      maxResults: 10,
      maxPerQuery: 10,
      env: {
        ...process.env,
        BITCODE_DEPOSITORY_VECTOR_SEARCH: '0',
      },
    });

    expect(result.success).toBe(true);
    expect(result.hitCount).toBeGreaterThanOrEqual(1);
    const ids = result.hits.map((h) => h.assetId);
    expect(ids).toContain('ap-nl');
    const nlHit = result.hits.find((h) => h.assetId === 'ap-nl');
    const pathHit = result.hits.find((h) => h.assetId === 'ap-path');
    expect(nlHit?.finalScore ?? 0).toBeGreaterThan(0);
    if (pathHit) {
      expect(nlHit!.finalScore ?? 0).toBeGreaterThan(pathHit.finalScore ?? 0);
    }
    // Top hit should be commercial-NL pack when both match.
    expect(result.hits[0]?.assetId).toBe('ap-nl');
  });

  it('does not rank pure JSON key noise as a hit', async () => {
    const noise = asset({
      assetId: 'ap-noise',
      title: 'Auth helpers',
      contentUnits: [
        { unitId: 's', unitKind: 'summary', text: 'Login form helpers only' },
      ],
      metadata: {
        lifecycleState: 'admitted',
        unrelatedKeyNamedWebhook: true,
      } as Record<string, unknown>,
    });
    const result = await runDepositDepositoryAssetPackSearch({
      product: 'read-need-fits',
      queryTerms: ['webhook'],
      queries: ['webhook'],
      assets: [noise],
      env: { ...process.env, BITCODE_DEPOSITORY_VECTOR_SEARCH: '0' },
    });
    expect(result.hits.every((h) => h.assetId !== 'ap-noise' || (h.finalScore ?? 0) === 0)).toBe(
      true,
    );
    expect(result.hits.filter((h) => h.assetId === 'ap-noise')).toHaveLength(0);
  });
});
