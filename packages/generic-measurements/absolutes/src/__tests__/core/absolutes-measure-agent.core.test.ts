/**
 * CORE — AbsolutesMeasureAgent (@bitcode/generic-measurements-absolutes).
 *
 * Teaches: category base locks `absolute` + intrinsic framing; does not invent
 * catalogs (product supplies measurements); empty catalogs rejected.
 *
 * Edges: framing content, neediness absence, description pass-through.
 */
// @ts-nocheck
import {
  factoryAbsolutesMeasureAgent,
  ABSOLUTES_CATEGORY_FRAMING,
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

describe('CORE: factoryAbsolutesMeasureAgent', () => {
  it('locks measurementCategory to absolute and attaches product catalog specs', () => {
    const agent = factoryAbsolutesMeasureAgent({
      name: 'test-measure-absolutes',
      subject: 'a synthesized source-safe AssetPack patch',
      measurements: SIZES,
    });

    expect(typeof agent).toBe('function');
    expect(agent.name).toBe('test-measure-absolutes');
    expect(agent.measurementCategory).toBe('absolute');
    expect(agent.measurementSpecs).toHaveLength(2);
    expect(agent.measurementSpecs.map((s) => s.measurementKind)).toEqual([
      'function-count',
      'correctness-estimate',
    ]);
  });

  it('injects intrinsic framing (never reader/Need-relative) into measurePrompt', () => {
    const agent = factoryAbsolutesMeasureAgent({
      name: 'framed',
      subject: 'a deposit patch',
      measurements: SIZES,
    });

    const identity = String(agent.measurePrompt.get('agent:identity') ?? '');
    expect(ABSOLUTES_CATEGORY_FRAMING).toMatch(/INTRINSIC/);
    expect(identity).toContain('INTRINSIC');
    expect(identity).toMatch(/never on any reader, demand, market, or buyer/i);
    expect(identity).not.toMatch(/READER-RELATIVE/);
    expect(identity).not.toMatch(/-fit/);
  });

  it('rejects an empty measurement catalog', () => {
    expect(() =>
      factoryAbsolutesMeasureAgent({
        name: 'empty',
        subject: 'nothing',
        measurements: [],
      }),
    ).toThrow(/at least one measurement/i);
  });
});
