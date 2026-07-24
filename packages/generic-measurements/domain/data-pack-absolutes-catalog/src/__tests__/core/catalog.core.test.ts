// @ts-nocheck
import {
  DATA_PACK_ABSOLUTES_CATALOG,
  DATA_PACK_ABSOLUTE_KIND_SPECS,
  assertDataPackAbsolutesCatalogWeights,
} from '../../index';

describe('CORE: DATA_PACK_ABSOLUTES catalogue', () => {
  it('weighted catalog sums to 1', () => {
    expect(() => assertDataPackAbsolutesCatalogWeights()).not.toThrow();
    const sum = DATA_PACK_ABSOLUTES_CATALOG.reduce((s, r) => s + r.weight, 0);
    expect(Number(sum.toFixed(6))).toBe(1);
  });

  it('full target catalogue excludes learning-gain and has 46 kinds', () => {
    expect(DATA_PACK_ABSOLUTE_KIND_SPECS).toHaveLength(46);
    expect(DATA_PACK_ABSOLUTE_KIND_SPECS.some((s) => s.measurementKind === 'learning-gain')).toBe(false);
  });

  it('weighted subset is 11 live deposit absolutes', () => {
    expect(DATA_PACK_ABSOLUTES_CATALOG).toHaveLength(11);
  });
});
