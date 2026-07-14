/**
 * Read needinesses: all kinds end with -fit; need-fit is weighted mean.
 */

import {
  slugifyNeedinessKind,
  assertNeedinessKindSuffix,
  measureReadNeedinesses,
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

  it('static catalogue kinds all end with -fit', () => {
    for (const spec of ASSET_PACK_NEEDINESSES_CATALOG) {
      expect(spec.measurementKind.endsWith('-fit')).toBe(true);
    }
  });

  it('measureReadNeedinesses returns static + dynamic *-fit rows with magnitude+volume', () => {
    const rows = measureReadNeedinesses({
      title: 'Auth pack',
      summary: 'Session refresh knowledge for the Need.',
      confidence: 0.8,
      needSummary: 'I need session refresh',
      dynamicKinds: ['needs-session-refresh', 'auth-timeout'],
    });
    expect(rows.length).toBeGreaterThanOrEqual(ASSET_PACK_NEEDINESSES_CATALOG.length + 1);
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
});
