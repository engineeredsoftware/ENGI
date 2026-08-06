// @ts-nocheck
import { measureAbsoluteSymbolConnectivity, ABSOLUTE_MEASUREMENT_KIND } from '../../index';
describe('CORE: measureAbsoluteSymbolConnectivity', () => {
  it('returns a reading for the absolute kind', () => {
    const result = measureAbsoluteSymbolConnectivity({
      dataPack: {
        title: 'Test DP',
        summary: 'A synthesized source-safe DataPack capability slice for measurement tests.',
        coveredSourcePaths: ['src/a.ts', 'src/b.ts'],
        fileChanges: [{ path: 'src/a.ts', op: 'modify' }],
        confidence: 0.7,
      },
      sources: [{ path: 'src/a.ts', content: 'export function hello() { return 1 }' }],
    });
    expect(result.measurementKind).toBe(ABSOLUTE_MEASUREMENT_KIND);
    expect(result.volume).toBeGreaterThanOrEqual(0);
    expect(result.volume).toBeLessThanOrEqual(1);
    expect(result.status).toBeTruthy();
  });
});
