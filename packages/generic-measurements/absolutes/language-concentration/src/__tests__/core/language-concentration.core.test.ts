// @ts-nocheck
import { measureAbsoluteLanguageConcentration, ABSOLUTE_MEASUREMENT_KIND } from '../../index';

describe('CORE: measureAbsoluteLanguageConcentration', () => {
  const basePack = {
    title: 'Test DP',
    summary: 'A synthesized source-safe DataPack capability slice for measurement tests.',
    coveredSourcePaths: ['src/a.ts', 'package.json'],
    fileChanges: [{ path: 'src/a.ts', op: 'modify' }],
    confidence: 0.7,
  };

  it('returns a reading for the absolute kind', () => {
    const result = measureAbsoluteLanguageConcentration({
      dataPack: basePack,
      sources: [
        { path: 'src/a.ts', content: 'export function hello() { return 1 }' },
        { path: 'package.json', content: JSON.stringify({ name: 'x', dependencies: { express: '1' } }) },
      ],
    });
    expect(result.measurementKind).toBe(ABSOLUTE_MEASUREMENT_KIND);
    expect(result.volume).toBeGreaterThanOrEqual(0);
    expect(result.volume).toBeLessThanOrEqual(1);
    expect(['measured', 'estimated', 'insufficient_evidence', 'not_implemented', 'not_run']).toContain(
      result.status,
    );
  });

  it('accepts host staticSignals when provided', () => {
    const result = measureAbsoluteLanguageConcentration({
      dataPack: basePack,
      staticSignals: { 'language-concentration': 0.55 },
    });
    expect(result.measurementKind).toBe(ABSOLUTE_MEASUREMENT_KIND);
    // Host signal path should not crash; volume stays in range.
    expect(result.volume).toBeGreaterThanOrEqual(0);
    expect(result.volume).toBeLessThanOrEqual(1);
  });
});
