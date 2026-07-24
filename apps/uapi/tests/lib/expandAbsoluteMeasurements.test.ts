import {
  expandAbsoluteMeasurementsToFullCatalog,
  hasFullAbsoluteCatalog,
} from '@/components/exchange/models/expand-absolute-measurements';
import {
  ABSOLUTE_MEASUREMENT_BUYER_DESCRIPTOR_LIST,
  descriptorForAbsoluteKind,
} from '@/components/exchange/models/exchange-measurement-descriptors';
import { DATA_PACK_ABSOLUTES_CATALOG } from '@bitcode/generic-measurements-domain-data-pack-absolutes-catalog';

describe('expandAbsoluteMeasurementsToFullCatalog (full catalogue law)', () => {
  it('expands partial bag to full catalogue with SSOT weights', () => {
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
    expect(expanded.length).toBeGreaterThanOrEqual(65);
    expect(hasFullAbsoluteCatalog(expanded)).toBe(true);
    const fn = expanded.find((m) => m.measurementKind === 'function-count');
    expect(fn?.volume).toBe(0.5);
    expect(fn?.magnitude).toBe(20);
    // Catalogue weight wins over legacy 0.12
    expect(fn?.weight).toBe(
      DATA_PACK_ABSOLUTES_CATALOG.find((r) => r.measurementKind === 'function-count')?.weight,
    );
    const secret = expanded.find((m) => m.measurementKind === 'secret-safety');
    expect(secret?.volume).toBe(0);
    expect(secret?.weight).toBeGreaterThan(0);
  });

  it('buyer descriptors cover full catalogue kinds', () => {
    expect(ABSOLUTE_MEASUREMENT_BUYER_DESCRIPTOR_LIST.length).toBe(
      DATA_PACK_ABSOLUTES_CATALOG.length,
    );
    expect(descriptorForAbsoluteKind('difficulty')?.label).toBeTruthy();
    expect(descriptorForAbsoluteKind('secret-safety')?.descriptor).toMatch(/Gate|secret/i);
  });
});
