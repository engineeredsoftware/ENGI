/**
 * Pure depository index helpers (no live Supabase / OpenAI / package barrels).
 */

import { buildDepositoryEmbedText } from '@/lib/depository-index-job';

describe('buildDepositoryEmbedText', () => {
  it('joins source-safe fields for embedding input', () => {
    const text = buildDepositoryEmbedText({
      assetId: 'ap-1',
      title: 'Stripe webhook retries',
      summary: 'Backoff on 429',
      kind: 'capability-slice',
      repositoryFullName: 'acme/payments',
      lifecycle: 'admitted-to-depository',
      topics: ['stripe', 'webhooks'],
      coveredSourcePaths: ['src/payments/stripe.ts', 'src/lib/retry.ts'],
      absoluteKinds: ['function-count', 'lang-span'],
      absoluteVolumes: { 'function-count': 0.42, 'lang-span': 0.25 },
    });
    expect(text).toContain('Stripe webhook retries');
    expect(text).toContain('Backoff on 429');
    expect(text).toContain('capability-slice');
    expect(text).toContain('acme/payments');
    expect(text).toContain('stripe');
    expect(text).toContain('src/payments/stripe.ts');
    expect(text).toContain('function-count');
    expect(text).toContain('function-count:0.420');
    expect(text).toContain('lang-span:0.250');
    expect(text.length).toBeLessThanOrEqual(8000);
  });

  it('skips empty fields', () => {
    const text = buildDepositoryEmbedText({
      assetId: 'ap-2',
      title: 'Only title',
      summary: null,
      kind: null,
    });
    expect(text).toBe('Only title');
  });
});
