// @ts-nocheck
import {
  DATA_PACK_ABSOLUTES_CATALOG,
  DATA_PACK_ABSOLUTE_KIND_SPECS,
  DATA_PACK_ABSOLUTE_KIND_OPTIONS,
  DATA_PACK_ABSOLUTE_KIND_SELECT_OPTIONS,
  DATA_PACK_ABSOLUTE_KINDS,
  DATA_PACK_WEIGHTED_ABSOLUTE_KINDS,
  assertDataPackAbsolutesCatalogWeights,
  labelForDataPackAbsoluteKind,
} from '../../index';

describe('CORE: DATA_PACK_ABSOLUTES catalogue (full commercial law)', () => {
  it('commercial catalogue is full vocabulary with Σ weights = 1', () => {
    expect(() => assertDataPackAbsolutesCatalogWeights()).not.toThrow();
    const n = DATA_PACK_ABSOLUTES_CATALOG.length;
    // Commercial law: full catalogue is exactly 65 kinds (not a 11/46 subset).
    expect(n).toBe(65);
    expect(DATA_PACK_ABSOLUTE_KIND_SPECS).toHaveLength(n);
    expect(DATA_PACK_ABSOLUTE_KINDS).toHaveLength(n);
    // Legacy alias points at full catalogue (not a 11-kind subset).
    expect(DATA_PACK_WEIGHTED_ABSOLUTE_KINDS).toEqual(DATA_PACK_ABSOLUTE_KINDS);
    const sum = DATA_PACK_ABSOLUTES_CATALOG.reduce((s, r) => s + r.weight, 0);
    expect(Number(sum.toFixed(6))).toBe(1);
    expect(DATA_PACK_ABSOLUTES_CATALOG.every((r) => r.weight > 0)).toBe(true);
    expect(DATA_PACK_ABSOLUTES_CATALOG.every((r) => r.inWeightedCatalog === true)).toBe(true);
    // Material-identity companions are commercial law.
    expect(DATA_PACK_ABSOLUTE_KINDS).toContain('language-concentration');
    expect(DATA_PACK_ABSOLUTE_KINDS).toContain('framework-surface');
    expect(DATA_PACK_ABSOLUTE_KINDS).toContain('purpose-clarity');
  });

  it('excludes learning-gain', () => {
    expect(DATA_PACK_ABSOLUTE_KIND_SPECS.some((s) => s.measurementKind === 'learning-gain')).toBe(
      false,
    );
  });

  it('UI option rows are SSOT-derived for all catalogue kinds (+ Any absolute)', () => {
    const n = DATA_PACK_ABSOLUTE_KIND_OPTIONS.length;
    expect(DATA_PACK_ABSOLUTE_KIND_SELECT_OPTIONS).toHaveLength(n + 1);
    expect(DATA_PACK_ABSOLUTE_KIND_SELECT_OPTIONS[0]).toEqual({
      value: 'all',
      label: 'Any absolute',
    });
    expect(DATA_PACK_ABSOLUTE_KIND_OPTIONS.map((o) => o.value)).toEqual(
      DATA_PACK_ABSOLUTE_KIND_SPECS.map((s) => s.measurementKind),
    );
    expect(labelForDataPackAbsoluteKind('function-count')).toBe('Functions');
    expect(labelForDataPackAbsoluteKind('secret-safety')).toBe('Secret safety');
    expect(labelForDataPackAbsoluteKind('difficulty')).toBe('Difficulty');
    expect(labelForDataPackAbsoluteKind('language-concentration')).toBe(
      'Language concentration',
    );
  });
});
