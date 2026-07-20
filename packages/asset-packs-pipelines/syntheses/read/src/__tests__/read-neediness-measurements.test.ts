/**
 * Read needinesses: all kinds end with -fit; need-fit is weighted mean.
 */

import {
  slugifyNeedinessKind,
  assertNeedinessKindSuffix,
  humanizeNeedinessLabel,
  planDynamicNeedinessesFromContext,
  measureReadNeedinesses,
  measureReadNeedinessesDeterministic,
  computeNeedFitVolume,
  ASSET_PACK_NEEDINESSES_CATALOG,
} from '../read-neediness-measurements';

describe('read-neediness-measurements', () => {
  it('slugify forces -fit suffix', () => {
    expect(slugifyNeedinessKind('needs session refresh')).toBe('needs-session-refresh-fit');
    expect(slugifyNeedinessKind('language-fit')).toBe('language-fit');
    expect(assertNeedinessKindSuffix('domain-fit')).toBe(true);
    expect(assertNeedinessKindSuffix('domain')).toBe(false);
  });

  it('humanizeNeedinessLabel title-cases stems', () => {
    expect(humanizeNeedinessLabel('needs-session-refresh-fit')).toBe('Needs Session Refresh');
  });

  it('static catalogue kinds all end with -fit', () => {
    for (const spec of ASSET_PACK_NEEDINESSES_CATALOG) {
      expect(spec.measurementKind.endsWith('-fit')).toBe(true);
    }
  });

  it('planDynamicNeedinessesFromContext produces labeled *-fit rows from Need + paths', () => {
    const plan = planDynamicNeedinessesFromContext({
      needText: 'Add retries to payment webhooks',
      needTopics: ['payment webhooks', 'retries'],
      pathHints: ['src/payments/stripe.ts'],
    });
    expect(plan.length).toBeGreaterThanOrEqual(2);
    for (const row of plan) {
      expect(row.measurementKind.endsWith('-fit')).toBe(true);
      expect(row.label.length).toBeGreaterThan(2);
      expect(row.guidance.length).toBeGreaterThan(10);
      expect(row.weight).toBeGreaterThan(0);
    }
  });

  it('measureReadNeedinessesDeterministic returns static + dynamic *-fit rows with magnitude+volume', () => {
    const rows = measureReadNeedinessesDeterministic({
      title: 'Auth pack',
      summary: 'Session refresh knowledge for the Need.',
      confidence: 0.8,
      needSummary: 'I need session refresh',
      dynamicNeedinesses: [
        {
          measurementKind: 'needs-session-refresh-fit',
          label: 'Session refresh fit',
          guidance: 'How well session refresh is covered.',
          weight: 1,
        },
        {
          measurementKind: 'auth-timeout-fit',
          label: 'Auth timeout fit',
          guidance: 'Timeout handling for auth sessions.',
          weight: 1,
        },
      ],
    });
    expect(rows.length).toBeGreaterThanOrEqual(ASSET_PACK_NEEDINESSES_CATALOG.length + 1);
    const weightSum = rows.reduce((s, r) => s + r.weight, 0);
    expect(weightSum).toBeGreaterThan(0.99);
    expect(weightSum).toBeLessThan(1.01);
    const dyn = rows.find((r) => r.measurementKind === 'needs-session-refresh-fit');
    expect(dyn?.label).toBe('Session refresh fit');
    expect(dyn?.propertyClass).toBe('dynamic-inferred');
    for (const row of rows) {
      expect(row.measurementKind.endsWith('-fit')).toBe(true);
      expect(row.category).toBe('neediness');
      expect(row.volume).toBeGreaterThanOrEqual(0);
      expect(row.volume).toBeLessThanOrEqual(1);
      expect(typeof row.magnitude).toBe('number');
    }
    const needFit = computeNeedFitVolume(rows);
    expect(needFit).toBeGreaterThanOrEqual(0);
    expect(needFit).toBeLessThanOrEqual(1);
  });

  it('async measureReadNeedinesses falls back when real inference is off', async () => {
    const saved = process.env.BITCODE_ASSET_PACK_REAL_INFERENCE;
    process.env.BITCODE_ASSET_PACK_REAL_INFERENCE = '0';
    try {
      const rows = await measureReadNeedinesses({
        title: 'Auth pack',
        summary: 'Session refresh knowledge for the Need.',
        confidence: 0.7,
        dynamicKinds: ['needs-auth-fit'],
      });
      expect(rows.every((r) => r.measurementKind.endsWith('-fit'))).toBe(true);
      expect(rows.some((r) => r.measurementKind.includes('auth'))).toBe(true);
    } finally {
      if (saved !== undefined) process.env.BITCODE_ASSET_PACK_REAL_INFERENCE = saved;
      else delete process.env.BITCODE_ASSET_PACK_REAL_INFERENCE;
    }
  });
});

