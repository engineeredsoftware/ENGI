/**
 * Pure depository index helpers (no live Supabase / OpenAI / package barrels).
 */

import { buildDepositoryEmbedText } from '@/lib/depository-index-job';
import {
  extractAbsoluteFixturesFromMeasurements,
  absoluteFixturesCorpusText,
} from '@bitcode/asset-packs-pipelines-syntheses-domain/depository-absolute-fixtures';

describe('buildDepositoryEmbedText', () => {
  it('prefers commercial NL over title/summary and sections embed', () => {
    const text = buildDepositoryEmbedText({
      assetId: 'ap-1',
      title: 'Internal title',
      summary: 'Internal summary',
      commercialTitle: 'Stripe webhook retries knowledge pack',
      commercialDescription:
        'Buyer-facing guide to exponential backoff on 429 from Stripe webhooks.',
      kind: 'capability-slice',
      repositoryFullName: 'acme/payments',
      lifecycle: 'admitted-to-depository',
      topics: ['stripe', 'webhooks'],
      coveredSourcePaths: ['src/payments/stripe.ts', 'src/lib/retry.ts'],
      absoluteKinds: ['function-count', 'lang-span'],
      absoluteVolumes: { 'function-count': 0.42, 'lang-span': 0.25, noise: 0 },
      absoluteFixtures: [
        {
          measurementKind: 'function-count',
          label: 'Function count',
          descriptor: 'Auth and retry handlers in payments surface',
          volume: 0.42,
          status: 'measured',
        },
      ],
    });
    expect(text).toContain('§nl');
    expect(text).toContain('Stripe webhook retries knowledge pack');
    expect(text).toContain('Buyer-facing guide');
    expect(text).not.toContain('Internal title');
    expect(text).toContain('function-count');
    expect(text).toContain('Auth and retry handlers');
    expect(text).toContain('§abs');
    expect(text).toContain('§meta');
    expect(text.length).toBeLessThanOrEqual(8000);
  });

  it('falls back to title/summary when commercial NL absent', () => {
    const text = buildDepositoryEmbedText({
      assetId: 'ap-2',
      title: 'Only title',
      summary: null,
      kind: null,
    });
    expect(text).toContain('Only title');
    expect(text).toContain('§nl');
  });

  it('skips zero volume noise in abs section when no fixtures', () => {
    const text = buildDepositoryEmbedText({
      assetId: 'ap-3',
      title: 'Pack',
      absoluteVolumes: { 'function-count': 0.5, noise: 0, 'lang-span': 0 },
    });
    expect(text).toContain('function-count:0.500');
    // zero volumes must not dominate embed
    expect(text.match(/noise:0/)).toBeNull();
  });
});

describe('extractAbsoluteFixturesFromMeasurements', () => {
  it('extracts measured rows with descriptors and skips pure fill zeros', () => {
    const fixtures = extractAbsoluteFixturesFromMeasurements({
      absolutes: [
        {
          measurementKind: 'function-count',
          label: 'Functions',
          descriptor: 'Handlers for auth middleware',
          volume: 0.7,
          status: 'measured',
        },
        {
          measurementKind: 'noise',
          volume: 0,
          status: 'expanded-fill',
        },
      ],
    });
    expect(fixtures).toHaveLength(1);
    expect(fixtures[0].measurementKind).toBe('function-count');
    expect(fixtures[0].descriptor).toContain('Handlers');
    expect(absoluteFixturesCorpusText(fixtures)).toContain('Functions:');
  });
});
