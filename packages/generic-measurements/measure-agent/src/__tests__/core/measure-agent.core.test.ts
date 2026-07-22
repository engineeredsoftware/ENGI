/**
 * CORE — MeasureAgent base (@bitcode/generic-measurements-measure-agent).
 *
 * Teaches: factoryMeasureAgent builds a PTRR agent with specs + category;
 * empty catalogs are rejected; measurement output schema is honest-volume only.
 *
 * Specializations (Absolutes / Needinesses) live in their own packages.
 */
// @ts-nocheck
import {
  factoryMeasureAgent,
  MeasurementOutputSchema,
  MeasurementReadingSchema,
} from '../../index';

const SIZES = [
  {
    measurementKind: 'function-count',
    label: 'Functions',
    unit: 'functions',
    guidance: 'How many functions.',
    hasMagnitude: true,
  },
  {
    measurementKind: 'correctness-estimate',
    label: 'Correctness',
    unit: 'estimate',
    guidance: 'Fidelity estimate.',
  },
];

describe('CORE: factoryMeasureAgent', () => {
  it('builds a PTRR agent carrying measurement specs and category', () => {
    const agent = factoryMeasureAgent({
      name: 'test-measure-agent',
      subject: 'a synthesized artifact',
      category: 'absolute',
      categoryFraming: 'Absolutes are intrinsic.',
      measurements: SIZES,
    });
    expect(typeof agent).toBe('function');
    expect(agent.name).toBe('test-measure-agent');
    expect(agent.measurementCategory).toBe('absolute');
    expect(agent.measurementSpecs).toHaveLength(2);
    expect(agent.measurementSpecs[0].measurementKind).toBe('function-count');
  });

  it('rejects an empty measurement catalog', () => {
    expect(() =>
      factoryMeasureAgent({
        name: 'empty',
        subject: 'nothing',
        category: 'absolute',
        categoryFraming: 'n/a',
        measurements: [],
      }),
    ).toThrow(/at least one measurement/i);
  });

  it('output schema accepts readings and rejects out-of-range volume', () => {
    const ok = MeasurementOutputSchema.safeParse({
      measurements: [
        {
          measurementKind: 'function-count',
          magnitude: 12,
          volume: 0.6,
          rationale: 'twelve functions',
        },
        {
          measurementKind: 'correctness-estimate',
          volume: 0.8,
          rationale: 'coherent',
        },
      ],
      summary: 'measured',
    });
    expect(ok.success).toBe(true);

    const bad = MeasurementReadingSchema.safeParse({
      measurementKind: 'semantic-volume',
      volume: 1.5,
      rationale: 'too big',
    });
    expect(bad.success).toBe(false);
  });
});
