/**
 * CORE — MeasureAgent base (@bitcode/generic-agents-agent-measure).
 *
 * Teaches the default product surface by reading this file alone:
 * - factoryMeasureAgent builds a PTRR executor with specs + category
 * - measurePrompt carries identity, requirements, and ptrr:* steps
 * - empty catalogs are rejected (models must not invent a catalog)
 * - MeasurementOutputSchema is honest volume-only (0..1) with optional magnitude
 *
 * Edges (clamps, categories, null inputs): edges/measure-agent.edges.test.ts
 * Specializations (Absolutes / Needinesses): their packages.
 */
// @ts-nocheck
import {
  factoryMeasureAgent,
  createMeasurePrompt,
  MeasurementOutputSchema,
  MeasurementReadingSchema,
} from '../../index';
import { QUANTITY_AND_QUALITY_SPECS } from '../support/measure-fixtures';

describe('CORE: factoryMeasureAgent', () => {
  it('builds a PTRR agent carrying measurement specs, category, and measurePrompt', () => {
    const agent = factoryMeasureAgent({
      name: 'test-measure-agent',
      subject: 'a synthesized artifact',
      category: 'absolute',
      categoryFraming: 'Absolutes are intrinsic.',
      measurements: QUANTITY_AND_QUALITY_SPECS,
    });

    expect(typeof agent).toBe('function');
    expect(agent.name).toBe('test-measure-agent');
    expect(agent.description).toMatch(/absolute measurements of a synthesized artifact/i);
    expect(agent.measurementCategory).toBe('absolute');
    expect(agent.measurementSpecs).toHaveLength(2);
    expect(agent.measurementSpecs[0].measurementKind).toBe('function-count');
    expect(agent.measurePrompt).toBeDefined();
    expect(agent.measurePrompt.get('agent:identity')).toBeTruthy();
    expect(agent.measurePrompt.get('agent:requirements')).toBeTruthy();
    expect(agent.measurePrompt.get('ptrr:plan')).toBeTruthy();
    expect(agent.measurePrompt.get('ptrr:try')).toBeTruthy();
    expect(agent.measurePrompt.get('ptrr:refine')).toBeTruthy();
    expect(agent.measurePrompt.get('ptrr:retry')).toBeTruthy();
  });

  it('default description names category + subject; custom description wins', () => {
    const defaulted = factoryMeasureAgent({
      name: 'd',
      subject: 'the deposit patch',
      category: 'absolute',
      categoryFraming: 'framing',
      measurements: QUANTITY_AND_QUALITY_SPECS,
    });
    expect(defaulted.description).toBe(
      'Measures the absolute measurements of the deposit patch.',
    );

    const custom = factoryMeasureAgent({
      name: 'c',
      description: 'Custom measure description',
      subject: 'the deposit patch',
      category: 'absolute',
      categoryFraming: 'framing',
      measurements: QUANTITY_AND_QUALITY_SPECS,
    });
    expect(custom.description).toBe('Custom measure description');
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
});

describe('CORE: createMeasurePrompt', () => {
  it('embeds subject, category framing, and each measurementKind in requirements', () => {
    const prompt = createMeasurePrompt({
      name: 'p',
      subject: 'a synthesized source-safe AssetPack patch',
      category: 'absolute',
      categoryFraming: 'Absolutes depend ONLY on the artifact.',
      measurements: QUANTITY_AND_QUALITY_SPECS,
    });

    const identity = String(prompt.get('agent:identity') ?? '');
    const requirements = String(prompt.get('agent:requirements') ?? '');

    expect(identity).toMatch(/MEASURE agent/i);
    expect(identity).toMatch(/a synthesized source-safe AssetPack patch/);
    expect(identity).toMatch(/Absolutes depend ONLY on the artifact/);
    expect(identity).toMatch(/source-safe/i);
    expect(identity).toMatch(/do NOT synthesize/i);

    expect(requirements).toMatch(/function-count/);
    expect(requirements).toMatch(/correctness-estimate/);
    expect(requirements).toMatch(/volume/);
    expect(requirements).toMatch(/Return ONLY/);
  });
});

describe('CORE: MeasurementOutputSchema / MeasurementReadingSchema', () => {
  it('accepts complete readings and rejects out-of-range volume', () => {
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
      measurementKind: 'function-count',
      volume: 1.5,
      rationale: 'too big',
    });
    expect(bad.success).toBe(false);
  });

  it('accepts volume boundaries 0 and 1', () => {
    for (const volume of [0, 1]) {
      const parsed = MeasurementReadingSchema.safeParse({
        measurementKind: 'file-span',
        volume,
        magnitude: 0,
      });
      expect(parsed.success).toBe(true);
    }
  });
});
