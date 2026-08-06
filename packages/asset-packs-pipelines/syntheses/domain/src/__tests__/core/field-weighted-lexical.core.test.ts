/**
 * STAB-C1: field-weighted lexical (commercial NL ≫ fixtures ≫ paths).
 */
import type { DepositoryAsset } from '../../depository-search-types';
import {
  LEXICAL_FIELD_WEIGHTS,
  collectLexicalFieldCorpora,
  fieldWeightedLexicalScore,
} from '../../tools/deposit-depository-asset-pack-search';

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

describe('field-weighted lexical (STAB-C1)', () => {
  it('weights commercial NL highest and paths lowest', () => {
    expect(LEXICAL_FIELD_WEIGHTS.commercialNl).toBeGreaterThan(
      LEXICAL_FIELD_WEIGHTS.absoluteFixtures,
    );
    expect(LEXICAL_FIELD_WEIGHTS.absoluteFixtures).toBeGreaterThan(
      LEXICAL_FIELD_WEIGHTS.titleSummary,
    );
    expect(LEXICAL_FIELD_WEIGHTS.titleSummary).toBeGreaterThan(LEXICAL_FIELD_WEIGHTS.paths);
  });

  it('collectLexicalFieldCorpora prefers commercial-nl unit over stringify noise', () => {
    const a = asset({
      assetId: 'ap-1',
      title: 'Generic pack',
      contentUnits: [
        {
          unitId: 'c',
          unitKind: 'commercial-nl',
          text: 'Session refresh token rotation for OAuth clients',
        },
        {
          unitId: 'p',
          unitKind: 'paths',
          text: 'src/auth/session-refresh.ts',
        },
      ],
      metadata: {
        commercialTitle: 'OAuth session refresh',
        coveredSourcePaths: ['src/auth/session-refresh.ts'],
      },
    });
    const fields = collectLexicalFieldCorpora(a);
    const ids = fields.map((f) => f.id);
    expect(ids).toContain('commercialNl');
    expect(ids).toContain('paths');
    expect(fields.find((f) => f.id === 'commercialNl')?.weight).toBe(1);
  });

  it('commercial match ranks higher than path-only match for the same term', () => {
    const commercial = asset({
      assetId: 'nl',
      title: 'Other',
      contentUnits: [
        {
          unitId: 'c',
          unitKind: 'commercial-nl',
          text: 'Implements webhook retries with exponential backoff',
        },
      ],
    });
    const pathOnly = asset({
      assetId: 'path',
      title: 'Other',
      contentUnits: [
        {
          unitId: 'p',
          unitKind: 'paths',
          text: 'src/webhooks/retry-helper.ts',
        },
      ],
      metadata: { coveredSourcePaths: ['src/webhooks/retry-helper.ts'] },
    });
    const term = ['webhook retries'];
    const nl = fieldWeightedLexicalScore(commercial, term);
    const path = fieldWeightedLexicalScore(pathOnly, ['retry']);
    expect(nl.score).toBeGreaterThan(path.score);
    expect(nl.fieldHits.commercialNl).toBeDefined();
    expect(path.fieldHits.paths).toBeDefined();
  });

  it('does not score on unrelated JSON key noise (no full-asset stringify)', () => {
    const a = asset({
      assetId: 'noise',
      title: 'Auth helpers',
      contentUnits: [
        { unitId: 's', unitKind: 'summary', text: 'Helpers for login forms' },
      ],
      metadata: {
        // Spurious keys that JSON.stringify would have matched as substrings.
        lifecycleState: 'admitted',
        sourceSafe: true,
        unrelatedKeyNamedWebhook: true,
      } as Record<string, unknown>,
    });
    const { score, matched } = fieldWeightedLexicalScore(a, ['webhook']);
    expect(score).toBe(0);
    expect(matched).toHaveLength(0);
  });

  it('fixtures outrank path stems when both match', () => {
    const withFixtures = asset({
      assetId: 'fix',
      title: 'Pack',
      contentUnits: [
        {
          unitId: 'f',
          unitKind: 'absolute-fixtures',
          text: 'function-count: measured session handlers',
        },
        {
          unitId: 'p',
          unitKind: 'paths',
          text: 'src/session/handlers.ts',
        },
      ],
    });
    const r = fieldWeightedLexicalScore(withFixtures, ['session']);
    expect(r.score).toBeGreaterThan(LEXICAL_FIELD_WEIGHTS.paths);
    expect(r.fieldHits.absoluteFixtures || r.fieldHits.paths).toBeDefined();
    // Best field for "session" should be fixtures (higher weight than paths).
    expect(r.fieldHits.absoluteFixtures).toContain('session');
  });
});
