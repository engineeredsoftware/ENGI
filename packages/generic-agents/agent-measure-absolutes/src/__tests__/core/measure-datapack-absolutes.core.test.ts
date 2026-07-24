// @ts-nocheck
import {
  listAbsoluteMeasureKinds,
  measureDataPackWeightedAbsoluteReadings,
  measureDataPackAllAbsolutes,
  DATA_PACK_ABSOLUTES_CATALOG,
} from '../../index';

describe('CORE: agent-measure-absolutes registry', () => {
  it('registers every bare absolute kind package', () => {
    expect(listAbsoluteMeasureKinds().length).toBe(46);
    expect(listAbsoluteMeasureKinds()).toContain('function-count');
    expect(listAbsoluteMeasureKinds()).not.toContain('learning-gain');
  });

  it('measures weighted catalogue for a DataPack', () => {
    const readings = measureDataPackWeightedAbsoluteReadings({
      dataPack: {
        title: 'Auth slice',
        summary: 'A synthesized source-safe DataPack covering session authentication flows.',
        coveredSourcePaths: ['src/auth/session.ts', 'src/auth/session.test.ts'],
        fileChanges: [
          { path: 'src/auth/session.ts', op: 'modify' },
          { path: 'src/auth/session.test.ts', op: 'create' },
        ],
        confidence: 0.8,
      },
      sources: [
        { path: 'src/auth/session.ts', content: 'export function login() { return true }\nexport type Session = {};' },
        { path: 'src/auth/session.test.ts', content: 'describe("login", () => { it("works", () => {}) })' },
      ],
    });
    expect(readings).toHaveLength(DATA_PACK_ABSOLUTES_CATALOG.length);
    expect(readings.every((r) => r.category === 'absolute')).toBe(true);
    expect(readings.every((r) => r.volume >= 0 && r.volume <= 1)).toBe(true);
    const fileSpan = readings.find((r) => r.measurementKind === 'file-span');
    expect(fileSpan?.magnitude).toBeGreaterThanOrEqual(2);
  });

  it('runs full catalogue without throwing', () => {
    const all = measureDataPackAllAbsolutes({
      dataPack: { coveredSourcePaths: ['a.ts'], confidence: 0.5 },
    });
    expect(all).toHaveLength(46);
  });
});
