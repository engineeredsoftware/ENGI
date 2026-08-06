import {
  countExpandedFillAbsolutes,
  countMeasuredAbsolutes,
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
        status: 'measured',
      },
      {
        measurementKind: 'correctness-estimate',
        weight: 0.18,
        volume: 0.8,
        category: 'absolute',
        status: 'estimated',
      },
    ]);
    expect(expanded.length).toBeGreaterThanOrEqual(65);
    expect(hasFullAbsoluteCatalog(expanded)).toBe(true);
    const fn = expanded.find((m) => m.measurementKind === 'function-count');
    expect(fn?.volume).toBe(0.5);
    expect(fn?.magnitude).toBe(20);
    expect(fn?.status).toBe('measured');
    // Catalogue weight wins over legacy 0.12
    expect(fn?.weight).toBe(
      DATA_PACK_ABSOLUTES_CATALOG.find((r) => r.measurementKind === 'function-count')?.weight,
    );
    const secret = expanded.find((m) => m.measurementKind === 'secret-safety');
    expect(secret?.volume).toBe(0);
    expect(secret?.weight).toBeGreaterThan(0);
    expect(secret?.status).toBe('expanded-fill');
    expect(secret?.descriptor).toMatch(/Not measured|expanded-fill/i);
    expect(countExpandedFillAbsolutes(expanded)).toBeGreaterThan(50);
    expect(countMeasuredAbsolutes(expanded)).toBe(2);
  });

  it('preserves prior status and never claims measured zero for fill rows', () => {
    const expanded = expandAbsoluteMeasurementsToFullCatalog([
      {
        measurementKind: 'secret-safety',
        volume: 0,
        magnitude: 0,
        status: 'not_run',
      },
    ]);
    const secret = expanded.find((m) => m.measurementKind === 'secret-safety');
    expect(secret?.status).toBe('not_run');
    expect(secret?.volume).toBe(0);
    const missing = expanded.find((m) => m.measurementKind === 'function-count');
    expect(missing?.status).toBe('expanded-fill');
    expect(missing?.volume).toBe(0);
  });

  it('buyer descriptors cover full catalogue kinds', () => {
    expect(ABSOLUTE_MEASUREMENT_BUYER_DESCRIPTOR_LIST.length).toBe(
      DATA_PACK_ABSOLUTES_CATALOG.length,
    );
    expect(descriptorForAbsoluteKind('difficulty')?.label).toBeTruthy();
    expect(descriptorForAbsoluteKind('secret-safety')?.descriptor).toMatch(/Gate|secret/i);
  });
});
