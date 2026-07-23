/**
 * EDGES — MeasureAgent base bounds, clamps, category variants, rejection shapes.
 */
// @ts-nocheck
import {
  factoryMeasureAgent,
  createMeasurePrompt,
  MeasurementOutputSchema,
  MeasurementReadingSchema,
} from '../../index';
import {
  NEEDINESS_LIKE_SPECS,
  QUANTITY_AND_QUALITY_SPECS,
} from '../support/measure-fixtures';

describe('EDGES: factoryMeasureAgent input rejection', () => {
  it('rejects null/undefined measurements the same as empty', () => {
    expect(() =>
      factoryMeasureAgent({
        name: 'null-specs',
        subject: 'x',
        category: 'absolute',
        categoryFraming: 'f',
        measurements: null,
      }),
    ).toThrow(/at least one measurement/i);

    expect(() =>
      factoryMeasureAgent({
        name: 'undef-specs',
        subject: 'x',
        category: 'absolute',
        categoryFraming: 'f',
        // omit measurements
      }),
    ).toThrow(/at least one measurement/i);
  });

  it('createMeasurePrompt rejects empty catalogs independently of the factory', () => {
    expect(() =>
      createMeasurePrompt({
        name: 'p',
        subject: 'x',
        category: 'neediness',
        categoryFraming: 'reader-relative',
        measurements: [],
      }),
    ).toThrow(/at least one measurement/i);
  });
});

describe('EDGES: category framing (neediness vs absolute)', () => {
  it('carries neediness category without inventing absolute framing', () => {
    const agent = factoryMeasureAgent({
      name: 'neediness-base',
      subject: 'a pack under a stated Need',
      category: 'neediness',
      categoryFraming: 'You measure NEEDINESSES — READER-RELATIVE properties.',
      measurements: NEEDINESS_LIKE_SPECS,
    });

    expect(agent.measurementCategory).toBe('neediness');
    expect(agent.measurementSpecs[0].measurementKind).toBe('language-fit');
    const identity = String(agent.measurePrompt.get('agent:identity') ?? '');
    expect(identity).toMatch(/READER-RELATIVE/);
    expect(identity).not.toMatch(/INTRINSIC properties of digital material/);
  });
});

describe('EDGES: schema clamps and optional fields', () => {
  it('soft-clamps summary and rationale past 700 characters', () => {
    const long = 'x'.repeat(900);
    const parsed = MeasurementOutputSchema.safeParse({
      measurements: [
        {
          measurementKind: 'function-count',
          volume: 0.2,
          magnitude: 3,
          rationale: long,
        },
      ],
      summary: long,
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.summary.length).toBeLessThanOrEqual(700);
      expect(parsed.data.measurements[0].rationale?.length).toBeLessThanOrEqual(700);
    }
  });

  it('allows missing optional rationale and magnitude', () => {
    const parsed = MeasurementReadingSchema.safeParse({
      measurementKind: 'correctness-estimate',
      volume: 0.55,
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects empty measurementKind', () => {
    const parsed = MeasurementReadingSchema.safeParse({
      measurementKind: '',
      volume: 0.5,
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects empty measurements array on output', () => {
    const parsed = MeasurementOutputSchema.safeParse({
      measurements: [],
      summary: 'none',
    });
    expect(parsed.success).toBe(false);
  });
});

describe('EDGES: factory still builds when optional step knobs are provided', () => {
  it('accepts custom plan/try/refine/retry thresholds without throwing', () => {
    const agent = factoryMeasureAgent({
      name: 'tuned',
      subject: 'artifact',
      category: 'absolute',
      categoryFraming: 'framing',
      measurements: QUANTITY_AND_QUALITY_SPECS,
      plan: { chunkThreshold: 100 },
      try: { chunkThreshold: 200 },
      refine: { maxAttempts: 1 },
      retry: { maxAttempts: 0 },
    });
    expect(agent.name).toBe('tuned');
    expect(agent.measurementSpecs).toHaveLength(2);
  });
});
