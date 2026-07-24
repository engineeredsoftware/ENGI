import {
  expandAbsoluteMeasurementsToFullCatalog,
  hasFullAbsoluteCatalog,
} from '@/components/exchange/models/expand-absolute-measurements';
import {
  ABSOLUTE_MEASUREMENT_BUYER_DESCRIPTOR_LIST,
  descriptorForAbsoluteKind,
} from '@/components/exchange/models/exchange-measurement-descriptors';

describe('expandAbsoluteMeasurementsToFullCatalog (46-kind law)', () => {
  it('expands legacy 8-row bag to 46 with SSOT weights', () => {
    const expanded = expandAbsoluteMeasurementsToFullCatalog([
      {
        measurementKind: 'function-count',
        label: 'Functions',
        weight: 0.12,
        volume: 0.5,
        magnitude: 20,
        unit: 'functions',
        category: 'absolute',
      },
      {
        measurementKind: 'correctness-estimate',
        weight: 0.18,
        volume: 0.8,
        category: 'absolute',
      },
    ]);
    expect(expanded).toHaveLength(46);
    expect(hasFullAbsoluteCatalog(expanded)).toBe(true);
    const fn = expanded.find((m) => m.measurementKind === 'function-count');
    expect(fn?.volume).toBe(0.5);
    expect(fn?.magnitude).toBe(20);
    // Catalogue weight wins over legacy 0.12
    expect(fn?.weight).toBe(0.035);
    const secret = expanded.find((m) => m.measurementKind === 'secret-safety');
    expect(secret?.volume).toBe(0);
    expect(secret?.weight).toBeGreaterThan(0);
  });

  it('buyer descriptors cover all 46 catalogue kinds', () => {
    expect(ABSOLUTE_MEASUREMENT_BUYER_DESCRIPTOR_LIST).toHaveLength(46);
    expect(descriptorForAbsoluteKind('difficulty')?.label).toBeTruthy();
    expect(descriptorForAbsoluteKind('secret-safety')?.descriptor).toMatch(/Gate|secret/i);
  });
});
