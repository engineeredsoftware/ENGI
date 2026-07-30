import {
  ABSOLUTE_FILTER_CLAUSE_LIMIT,
  EXCHANGE_COMMERCIAL_ABSOLUTE_FACET_PRESETS,
  clampAbsoluteVolume,
  compareAbsoluteVolume,
  formatAbsoluteMeasurementFilterClause,
  measurementsMatchAbsoluteFilters,
  parseAbsoluteMeasurementFilters,
  resolveAbsoluteMeasurementFiltersFromParams,
  serializeAbsoluteMeasurementFilters,
} from '@/components/exchange/models/absolute-measurement-filters';
import { filterPackActivityRecords } from '@/components/bitcode/activity/PackActivityModel/pack-activity-model';
import type { PackActivityRecord } from '@/components/bitcode/activity/PackActivityModel/pack-activity-model';

describe('absolute-measurement-filters', () => {
  it('exports commercial buy/no-buy facet presets for Exchange quick filters', () => {
    expect(EXCHANGE_COMMERCIAL_ABSOLUTE_FACET_PRESETS.length).toBeGreaterThanOrEqual(6);
    const kinds = EXCHANGE_COMMERCIAL_ABSOLUTE_FACET_PRESETS.map((p) => p.kind);
    expect(kinds).toEqual(
      expect.arrayContaining([
        'secret-safety',
        'license-cleanliness',
        'correctness-estimate',
        'copyleft-risk-mass',
      ]),
    );
    for (const p of EXCHANGE_COMMERCIAL_ABSOLUTE_FACET_PRESETS) {
      expect(p.volume).toBeGreaterThanOrEqual(0);
      expect(p.volume).toBeLessThanOrEqual(1);
    }
  });

  it('parses multi-clause absoluteFilters URL segments', () => {
    const clauses = parseAbsoluteMeasurementFilters(
      'function-count:gte:0.4,test-surface:lt:0.2,file-span:eq:0.5',
    );
    expect(clauses).toEqual([
      { kind: 'function-count', op: 'gte', volume: 0.4 },
      { kind: 'test-surface', op: 'lt', volume: 0.2 },
      { kind: 'file-span', op: 'eq', volume: 0.5 },
    ]);
  });

  it('drops invalid segments and clamps volume', () => {
    const clauses = parseAbsoluteMeasurementFilters(
      'bad,function-count:nope:0.3,lang-span:gt:1.5,type-count:lte:0.1',
    );
    expect(clauses).toEqual([
      { kind: 'lang-span', op: 'gt', volume: 1 },
      { kind: 'type-count', op: 'lte', volume: 0.1 },
    ]);
  });

  it('round-trips serialize → parse', () => {
    const input = [
      { kind: 'function-count', op: 'gt' as const, volume: 0.25 },
      { kind: 'test-surface', op: 'eq' as const, volume: 0 },
    ];
    const raw = serializeAbsoluteMeasurementFilters(input);
    expect(raw).toBe('function-count:gt:0.25,test-surface:eq:0');
    expect(parseAbsoluteMeasurementFilters(raw)).toEqual(input);
  });

  it('resolves legacy absoluteKind + minAbsoluteVolume as single gte clause', () => {
    expect(
      resolveAbsoluteMeasurementFiltersFromParams({
        absoluteKind: 'function-count',
        minAbsoluteVolume: '0.4',
      }),
    ).toEqual([{ kind: 'function-count', op: 'gte', volume: 0.4 }]);

    expect(
      resolveAbsoluteMeasurementFiltersFromParams({
        absoluteKind: 'test-surface',
      }),
    ).toEqual([{ kind: 'test-surface', op: 'gte', volume: 0 }]);
  });

  it('prefers absoluteFilters over legacy params', () => {
    expect(
      resolveAbsoluteMeasurementFiltersFromParams({
        absoluteFilters: 'file-span:lt:0.1',
        absoluteKind: 'function-count',
        minAbsoluteVolume: 0.9,
      }),
    ).toEqual([{ kind: 'file-span', op: 'lt', volume: 0.1 }]);
  });

  it('compares volumes with all operators', () => {
    expect(compareAbsoluteVolume(0.5, 'gt', 0.4)).toBe(true);
    expect(compareAbsoluteVolume(0.4, 'gt', 0.4)).toBe(false);
    expect(compareAbsoluteVolume(0.4, 'gte', 0.4)).toBe(true);
    expect(compareAbsoluteVolume(0.3, 'lt', 0.4)).toBe(true);
    expect(compareAbsoluteVolume(0.4, 'lte', 0.4)).toBe(true);
    expect(compareAbsoluteVolume(0.40001, 'eq', 0.4)).toBe(true);
    expect(compareAbsoluteVolume(0.5, 'eq', 0.4)).toBe(false);
  });

  it('clamps volume into [0,1]', () => {
    expect(clampAbsoluteVolume(-1)).toBe(0);
    expect(clampAbsoluteVolume(2)).toBe(1);
    expect(clampAbsoluteVolume(0.123456)).toBe(0.1235);
  });

  it('matches measurements with multi-clause AND semantics', () => {
    const rows = [
      { id: 'absolute:function-count', kind: 'function-count', volume: 0.6 },
      { id: 'absolute:test-surface', kind: 'test-surface', volume: 0.15 },
    ];
    expect(
      measurementsMatchAbsoluteFilters(rows, [
        { kind: 'function-count', op: 'gte', volume: 0.5 },
        { kind: 'test-surface', op: 'lt', volume: 0.2 },
      ]),
    ).toBe(true);
    expect(
      measurementsMatchAbsoluteFilters(rows, [
        { kind: 'function-count', op: 'gte', volume: 0.5 },
        { kind: 'test-surface', op: 'gt', volume: 0.2 },
      ]),
    ).toBe(false);
    expect(
      measurementsMatchAbsoluteFilters(rows, [
        { kind: 'missing-kind', op: 'gte', volume: 0 },
      ]),
    ).toBe(false);
  });

  it('treats gte 0 as presence-only when volume is absent', () => {
    const rows = [{ id: 'absolute:function-count', kind: 'function-count' }];
    expect(
      measurementsMatchAbsoluteFilters(rows, [
        { kind: 'function-count', op: 'gte', volume: 0 },
      ]),
    ).toBe(true);
    expect(
      measurementsMatchAbsoluteFilters(rows, [
        { kind: 'function-count', op: 'gt', volume: 0 },
      ]),
    ).toBe(false);
  });

  it('formats a clause for active-filter chips', () => {
    const label = formatAbsoluteMeasurementFilterClause({
      kind: 'function-count',
      op: 'gte',
      volume: 0.4,
    });
    expect(label).toMatch(/≥/);
    expect(label).toMatch(/0\.4/);
  });

  it('caps clause count at ABSOLUTE_FILTER_CLAUSE_LIMIT', () => {
    const segments = Array.from({ length: ABSOLUTE_FILTER_CLAUSE_LIMIT + 3 }, (_, i) =>
      `kind-${i}:gte:0.1`,
    ).join(',');
    expect(parseAbsoluteMeasurementFilters(segments)).toHaveLength(
      ABSOLUTE_FILTER_CLAUSE_LIMIT,
    );
  });
});

describe('filterPackActivityRecords absolute filters', () => {
  function pack(
    id: string,
    measurements: PackActivityRecord['measurements'],
  ): PackActivityRecord {
    return {
      id,
      type: 'depository-assetpack',
      title: id,
      description: '',
      timestamp: '2026-05-28T10:00:00.000Z',
      state: 'admitted',
      scope: 'network',
      repository: null,
      assetPackTitle: id,
      assetPackKind: 'code',
      estimatedBtd: null,
      estimatedBtdCells: null,
      settlementState: null,
      compensationState: null,
      deliveryState: null,
      repairState: null,
      rightsState: null,
      measurements,
      values: [],
      proofRoots: [],
      commodityState: {} as PackActivityRecord['commodityState'],
      accounting: null,
      governance: null,
      sourceSafety: { safe: true, reasons: [] },
      metadata: {},
    };
  }

  const highFn = pack('high-fn', [
    { id: 'absolute:function-count', label: 'Functions', value: 0.8, unit: null, root: null, kind: 'function-count', volume: 0.8 },
    { id: 'absolute:test-surface', label: 'Tests', value: 0.1, unit: null, root: null, kind: 'test-surface', volume: 0.1 },
  ]);
  const lowFn = pack('low-fn', [
    { id: 'absolute:function-count', label: 'Functions', value: 0.2, unit: null, root: null, kind: 'function-count', volume: 0.2 },
    { id: 'absolute:test-surface', label: 'Tests', value: 0.9, unit: null, root: null, kind: 'test-surface', volume: 0.9 },
  ]);

  it('filters by multi absoluteFilters AND', () => {
    const out = filterPackActivityRecords([highFn, lowFn], {
      absoluteFilters: [
        { kind: 'function-count', op: 'gte', volume: 0.5 },
        { kind: 'test-surface', op: 'lt', volume: 0.3 },
      ],
    });
    expect(out.map((r) => r.id)).toEqual(['high-fn']);
  });

  it('honors legacy absoluteKind + minAbsoluteVolume as gte', () => {
    const out = filterPackActivityRecords([highFn, lowFn], {
      absoluteKind: 'function-count',
      minAbsoluteVolume: 0.5,
    });
    expect(out.map((r) => r.id)).toEqual(['high-fn']);
  });

  it('supports eq / gt / lte operators', () => {
    const eq = filterPackActivityRecords([highFn, lowFn], {
      absoluteFilters: [{ kind: 'test-surface', op: 'eq', volume: 0.1 }],
    });
    expect(eq.map((r) => r.id)).toEqual(['high-fn']);

    const gt = filterPackActivityRecords([highFn, lowFn], {
      absoluteFilters: [{ kind: 'function-count', op: 'gt', volume: 0.5 }],
    });
    expect(gt.map((r) => r.id)).toEqual(['high-fn']);

    const lte = filterPackActivityRecords([highFn, lowFn], {
      absoluteFilters: [{ kind: 'function-count', op: 'lte', volume: 0.2 }],
    });
    expect(lte.map((r) => r.id)).toEqual(['low-fn']);
  });
});
