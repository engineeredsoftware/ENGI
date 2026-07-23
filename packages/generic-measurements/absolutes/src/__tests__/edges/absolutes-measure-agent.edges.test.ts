/**
 * EDGES — AbsolutesMeasureAgent framing and config pass-through.
 */
// @ts-nocheck
import {
  factoryAbsolutesMeasureAgent,
  ABSOLUTES_CATEGORY_FRAMING,
} from '../../index';

const SPEC = [
  {
    measurementKind: 'modularity',
    label: 'Modularity',
    unit: 'modules',
    guidance: 'Distinct modules.',
    hasMagnitude: true,
  },
];

describe('EDGES: framing export and requirements listing', () => {
  it('exports ABSOLUTES_CATEGORY_FRAMING for prompt-identity consumers', () => {
    expect(ABSOLUTES_CATEGORY_FRAMING.length).toBeGreaterThan(40);
    expect(ABSOLUTES_CATEGORY_FRAMING).toMatch(/tool-measured/i);
    expect(ABSOLUTES_CATEGORY_FRAMING).toMatch(/do not invent sizes/i);
  });

  it('lists product measurement kinds in requirements (not free-form invent)', () => {
    const agent = factoryAbsolutesMeasureAgent({
      name: 'req',
      subject: 'patch',
      measurements: SPEC,
    });
    const requirements = String(agent.measurePrompt.get('agent:requirements') ?? '');
    expect(requirements).toMatch(/modularity/);
    expect(requirements).toMatch(/\[modules\]/);
    expect(requirements).toMatch(/Measure the absolute measurements/i);
  });
});

describe('EDGES: description and step knobs pass-through', () => {
  it('uses custom description when provided', () => {
    const agent = factoryAbsolutesMeasureAgent({
      name: 'custom',
      description: 'Deposit absolute measurer',
      subject: 'patch',
      measurements: SPEC,
    });
    expect(agent.description).toBe('Deposit absolute measurer');
  });

  it('defaults description from category + subject when omitted', () => {
    const agent = factoryAbsolutesMeasureAgent({
      name: 'default-desc',
      subject: 'a deposit option patch',
      measurements: SPEC,
    });
    expect(agent.description).toMatch(/absolute measurements of a deposit option patch/i);
  });

  it('accepts refine/retry knobs without throwing', () => {
    const agent = factoryAbsolutesMeasureAgent({
      name: 'knobs',
      subject: 'patch',
      measurements: SPEC,
      plan: { chunkThreshold: 50 },
      try: { chunkThreshold: 90 },
      refine: { maxAttempts: 3 },
      retry: { maxAttempts: 2 },
    });
    expect(agent.measurementCategory).toBe('absolute');
  });
});
