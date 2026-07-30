/**
 * Read-side buyer measurement projection — commercial buy/no-buy signals.
 */
import {
  assessSelectedOptionsForSettle,
  buildReadBuyerMeasurementProjection,
  computeNeedFitFromReadings,
  recommendationLabel,
} from '@/components/reads/models/read-buyer-measurement-projection';

describe('read-buyer-measurement-projection', () => {
  it('computes need-fit as weighted mean of static *-fit rows', () => {
    const needFit = computeNeedFitFromReadings([
      { measurementKind: 'language-fit', volume: 1, weight: 0.35 },
      { measurementKind: 'domain-fit', volume: 0.5, weight: 0.35 },
      { measurementKind: 'interface-fit', volume: 0, weight: 0.3 },
    ]);
    // (0.35*1 + 0.35*0.5 + 0.3*0) / 1 = 0.525
    expect(needFit).toBeCloseTo(0.525, 5);
  });

  it('ignores composite need-fit row when computing from needinesses', () => {
    const needFit = computeNeedFitFromReadings([
      { measurementKind: 'need-fit', volume: 0.99, weight: 1 },
      { measurementKind: 'language-fit', volume: 0.2, weight: 1 },
    ]);
    expect(needFit).toBeCloseTo(0.2, 5);
  });

  it('recommends buy when fit is strong and gates pass', () => {
    const p = buildReadBuyerMeasurementProjection({
      needFit: 0.72,
      needinesses: [
        { measurementKind: 'language-fit', volume: 0.8, label: 'Language fit' },
        { measurementKind: 'domain-fit', volume: 0.7, label: 'Domain fit' },
        { measurementKind: 'interface-fit', volume: 0.65, label: 'Interface fit' },
      ],
      absolutes: [
        {
          measurementKind: 'secret-safety',
          volume: 0.9,
          status: 'measured',
          label: 'Secret safety',
        },
        {
          measurementKind: 'pii-exposure',
          volume: 0.1,
          status: 'measured',
          label: 'PII exposure',
        },
        {
          measurementKind: 'license-cleanliness',
          volume: 0.85,
          status: 'measured',
          label: 'License cleanliness',
        },
        {
          measurementKind: 'correctness-estimate',
          volume: 0.7,
          status: 'measured',
          label: 'Correctness',
        },
      ],
    });
    expect(p.recommendation).toBe('buy_recommended');
    expect(p.needFitVolume).toBeCloseTo(0.72, 5);
    expect(p.needFitSource).toBe('option');
    expect(p.fitRows).toHaveLength(3);
    expect(p.fitRows.every((r) => r.present)).toBe(true);
    expect(recommendationLabel(p.recommendation)).toMatch(/Buy recommended/i);
  });

  it('hard-blocks buy when a safety gate is insufficient_evidence', () => {
    const p = buildReadBuyerMeasurementProjection({
      needFit: 0.9,
      needinesses: [
        { measurementKind: 'language-fit', volume: 0.9 },
        { measurementKind: 'domain-fit', volume: 0.9 },
        { measurementKind: 'interface-fit', volume: 0.9 },
      ],
      absolutes: [
        {
          measurementKind: 'secret-safety',
          volume: 0.95,
          status: 'insufficient_evidence',
        },
        { measurementKind: 'pii-exposure', volume: 0.05, status: 'measured' },
        { measurementKind: 'license-cleanliness', volume: 0.9, status: 'measured' },
      ],
    });
    expect(p.recommendation).toBe('do_not_buy');
    expect(p.gateChips.find((g) => g.measurementKind === 'secret-safety')?.hardBlock).toBe(
      true,
    );
    expect(p.recommendationReasons.join(' ')).toMatch(/Secret safety|secret-safety|gate/i);
  });

  it('do_not_buy on low need-fit even if gates look fine', () => {
    const p = buildReadBuyerMeasurementProjection({
      needinesses: [
        { measurementKind: 'language-fit', volume: 0.1 },
        { measurementKind: 'domain-fit', volume: 0.1 },
        { measurementKind: 'interface-fit', volume: 0.1 },
      ],
      absolutes: [
        { measurementKind: 'secret-safety', volume: 0.9, status: 'measured' },
        { measurementKind: 'pii-exposure', volume: 0.05, status: 'measured' },
        { measurementKind: 'license-cleanliness', volume: 0.9, status: 'measured' },
      ],
    });
    expect(p.needFitVolume).toBeCloseTo(0.1, 5);
    expect(p.recommendation).toBe('do_not_buy');
  });

  it('cannot_assess when needinesses are missing', () => {
    const p = buildReadBuyerMeasurementProjection({
      needinesses: [],
      absolutes: [
        { measurementKind: 'correctness-estimate', volume: 0.8, status: 'estimated' },
      ],
    });
    expect(p.recommendation).toBe('cannot_assess');
    expect(p.needFitVolume).toBeNull();
    expect(p.honesty.estimated).toBe(1);
  });

  it('assessSelectedOptionsForSettle blocks low need-fit selection', () => {
    const blocked = assessSelectedOptionsForSettle([
      {
        index: 0,
        title: 'Weak fit pack',
        measurements: {
          needinesses: [
            { measurementKind: 'language-fit', volume: 0.1 },
            { measurementKind: 'domain-fit', volume: 0.1 },
            { measurementKind: 'interface-fit', volume: 0.1 },
          ],
          absolutes: [
            { measurementKind: 'secret-safety', volume: 0.9, status: 'measured' },
            { measurementKind: 'pii-exposure', volume: 0.05, status: 'measured' },
            { measurementKind: 'license-cleanliness', volume: 0.9, status: 'measured' },
          ],
        },
      },
    ]);
    expect(blocked.allowed).toBe(false);
    expect(blocked.worstRecommendation).toBe('do_not_buy');
    expect(blocked.blockers[0]).toMatch(/Weak fit pack/);
  });

  it('assessSelectedOptionsForSettle blocks missing needinesses', () => {
    const blocked = assessSelectedOptionsForSettle([
      {
        index: 1,
        title: 'No fit rows',
        measurements: { needinesses: [], absolutes: [] },
      },
    ]);
    expect(blocked.allowed).toBe(false);
    expect(blocked.worstRecommendation).toBe('cannot_assess');
  });

  it('assessSelectedOptionsForSettle allows strong fit with caution on penalties', () => {
    const ok = assessSelectedOptionsForSettle([
      {
        index: 0,
        title: 'Solid pack',
        needFit: 0.7,
        measurements: {
          needinesses: [
            { measurementKind: 'language-fit', volume: 0.7 },
            { measurementKind: 'domain-fit', volume: 0.7 },
            { measurementKind: 'interface-fit', volume: 0.7 },
          ],
          absolutes: [
            { measurementKind: 'secret-safety', volume: 0.85, status: 'measured' },
            { measurementKind: 'pii-exposure', volume: 0.1, status: 'measured' },
            { measurementKind: 'license-cleanliness', volume: 0.85, status: 'measured' },
            {
              measurementKind: 'copyleft-risk-mass',
              volume: 0.7,
              status: 'estimated',
            },
          ],
        },
      },
    ]);
    expect(ok.allowed).toBe(true);
    expect(ok.caution).toBe(true);
    expect(ok.worstRecommendation).toBe('buy_with_caution');
  });

  it('soft-warns on high copyleft risk mass', () => {
    const p = buildReadBuyerMeasurementProjection({
      needFit: 0.7,
      needinesses: [
        { measurementKind: 'language-fit', volume: 0.7 },
        { measurementKind: 'domain-fit', volume: 0.7 },
        { measurementKind: 'interface-fit', volume: 0.7 },
      ],
      absolutes: [
        { measurementKind: 'secret-safety', volume: 0.8, status: 'measured' },
        { measurementKind: 'pii-exposure', volume: 0.1, status: 'measured' },
        { measurementKind: 'license-cleanliness', volume: 0.8, status: 'measured' },
        {
          measurementKind: 'copyleft-risk-mass',
          volume: 0.7,
          status: 'estimated',
          label: 'Copyleft risk mass',
        },
      ],
    });
    expect(p.recommendation).toBe('buy_with_caution');
    expect(
      p.penaltyChips.find((c) => c.measurementKind === 'copyleft-risk-mass')?.softWarn,
    ).toBe(true);
  });
});
