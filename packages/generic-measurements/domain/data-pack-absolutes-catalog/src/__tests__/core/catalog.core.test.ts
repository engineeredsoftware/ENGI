// @ts-nocheck
import {
  DATA_PACK_ABSOLUTES_CATALOG,
  DATA_PACK_ABSOLUTE_KIND_SPECS,
  DATA_PACK_ABSOLUTE_KIND_OPTIONS,
  DATA_PACK_ABSOLUTE_KIND_SELECT_OPTIONS,
  DATA_PACK_ABSOLUTE_KINDS,
  assertDataPackAbsolutesCatalogWeights,
  labelForDataPackAbsoluteKind,
} from '../../index';

describe('CORE: DATA_PACK_ABSOLUTES catalogue', () => {
  it('weighted catalog sums to 1', () => {
    expect(() => assertDataPackAbsolutesCatalogWeights()).not.toThrow();
    const sum = DATA_PACK_ABSOLUTES_CATALOG.reduce((s, r) => s + r.weight, 0);
    expect(Number(sum.toFixed(6))).toBe(1);
  });

  it('full target catalogue excludes learning-gain and has 46 kinds', () => {
    expect(DATA_PACK_ABSOLUTE_KIND_SPECS).toHaveLength(46);
    expect(DATA_PACK_ABSOLUTE_KINDS).toHaveLength(46);
    expect(DATA_PACK_ABSOLUTE_KIND_SPECS.some((s) => s.measurementKind === 'learning-gain')).toBe(false);
  });

  it('weighted subset is 11 live deposit absolutes', () => {
    expect(DATA_PACK_ABSOLUTES_CATALOG).toHaveLength(11);
  });

  it('UI option rows are SSOT-derived for all 46 kinds (+ Any absolute)', () => {
    expect(DATA_PACK_ABSOLUTE_KIND_OPTIONS).toHaveLength(46);
    expect(DATA_PACK_ABSOLUTE_KIND_SELECT_OPTIONS).toHaveLength(47);
    expect(DATA_PACK_ABSOLUTE_KIND_SELECT_OPTIONS[0]).toEqual({
      value: 'all',
      label: 'Any absolute',
    });
    expect(DATA_PACK_ABSOLUTE_KIND_OPTIONS.map((o) => o.value)).toEqual(
      DATA_PACK_ABSOLUTE_KIND_SPECS.map((s) => s.measurementKind),
    );
    expect(labelForDataPackAbsoluteKind('function-count')).toBe('Functions');
    expect(labelForDataPackAbsoluteKind('secret-safety')).toBe('Secret safety');
  });
});
