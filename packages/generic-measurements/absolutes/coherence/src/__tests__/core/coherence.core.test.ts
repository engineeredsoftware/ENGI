// @ts-nocheck
import { measureAbsoluteCoherence, ABSOLUTE_MEASUREMENT_KIND } from '../../index';

describe('CORE: measureAbsoluteCoherence', () => {
  const basePack = {
    title: 'Test DP',
    summary: 'A synthesized source-safe DataPack capability slice for measurement tests.',
    coveredSourcePaths: ['src/a.ts'],
    fileChanges: [{ path: 'src/a.ts', op: 'modify' }],
    confidence: 0.95,
  };

  it('is insufficient without host/quality signal (no confidence invention)', () => {
    const result = measureAbsoluteCoherence({ dataPack: basePack, sources: [{ path: 'src/a.ts', content: 'export const x = 1' }] });
    expect(result.measurementKind).toBe(ABSOLUTE_MEASUREMENT_KIND);
    expect(result.status).toBe('insufficient_evidence');
    expect(result.volume).toBe(0);
  });

  it('is measured when host supplies a finite signal', () => {
    const result = measureAbsoluteCoherence({
      dataPack: basePack,
      staticSignals: { 'coherence': 0.72 },
    });
    expect(result.status).toBe('measured');
    expect(result.volume).toBeCloseTo(0.72, 3);
  });
});
