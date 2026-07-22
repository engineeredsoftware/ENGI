/**
 * CORE — AbsolutesMeasureAgent specialization of MeasureAgent.
 */
// @ts-nocheck
import { factoryAbsolutesMeasureAgent } from '../../index';

const SIZES = [
  {
    measurementKind: 'function-count',
    label: 'Functions',
    unit: 'functions',
    guidance: 'How many functions.',
    hasMagnitude: true,
  },
];

describe('CORE: factoryAbsolutesMeasureAgent', () => {
  it('bases measure-agent with the absolute category', () => {
    const agent = factoryAbsolutesMeasureAgent({
      name: 'test-measure-absolutes',
      subject: 'a synthesized source-safe AssetPack patch',
      measurements: SIZES,
    });
    expect(typeof agent).toBe('function');
    expect(agent.name).toBe('test-measure-absolutes');
    expect(agent.measurementCategory).toBe('absolute');
    expect(agent.measurementSpecs).toHaveLength(1);
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
