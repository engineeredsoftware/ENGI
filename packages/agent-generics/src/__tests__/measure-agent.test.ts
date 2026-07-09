// @ts-nocheck
import {
  factoryMeasureAgent,
  factoryMeasureAgentAbsolutes,
  MeasureAgentOutputSchema,
  MeasurementReadingSchema,
} from '../index';

const SIZES = [
  { measurementKind: 'function-count', label: 'Functions', unit: 'functions', guidance: 'How many functions.', hasMagnitude: true },
  { measurementKind: 'correctness-estimate', label: 'Correctness', unit: 'estimate', guidance: 'Fidelity estimate.' },
];

describe('measure-agent base hierarchy', () => {
  it('factoryMeasureAgent builds a PTRR agent carrying its specs + category', () => {
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

  it('factoryMeasureAgentAbsolutes bases measure-agent with the absolute category', () => {
    const agent = factoryMeasureAgentAbsolutes({
      name: 'test-measure-absolutes',
      subject: 'a synthesized source-safe AssetPack patch',
      measurements: SIZES,
    });
    expect(typeof agent).toBe('function');
    expect(agent.name).toBe('test-measure-absolutes');
    expect(agent.measurementCategory).toBe('absolute');
    expect(agent.measurementSpecs).toHaveLength(2);
  });

  it('rejects an empty measurement catalog', () => {
    expect(() =>
      factoryMeasureAgentAbsolutes({
        name: 'empty',
        subject: 'nothing',
        measurements: [],
      }),
    ).toThrow(/at least one measurement/i);
  });

  it('output schema accepts readings (magnitude optional) and rejects out-of-range volume', () => {
    const ok = MeasureAgentOutputSchema.safeParse({
      measurements: [
        { measurementKind: 'function-count', magnitude: 12, volume: 0.6, rationale: 'twelve functions' },
        { measurementKind: 'correctness-estimate', volume: 0.8, rationale: 'coherent' },
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
