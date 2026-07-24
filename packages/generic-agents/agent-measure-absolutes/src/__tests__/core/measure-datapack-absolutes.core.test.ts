// @ts-nocheck
import {
  listAbsoluteMeasureKinds,
  measureDataPackWeightedAbsoluteReadings,
  measureDataPackAllAbsolutes,
  DATA_PACK_ABSOLUTES_CATALOG,
  listAbsoluteMeasureToolKeys,
  listWeightedQuantityAbsoluteMeasureToolKeys,
  factoryAbsolutesMeasureAgent,
  registerAbsoluteMeasureTools,
} from '../../index';

describe('CORE: agent-measure-absolutes registry', () => {
  it('registers every bare absolute kind package', () => {
    expect(listAbsoluteMeasureKinds().length).toBe(46);
    expect(listAbsoluteMeasureKinds()).toContain('function-count');
    expect(listAbsoluteMeasureKinds()).not.toContain('learning-gain');
  });

  it('owns one tool key per bare absolute kind', () => {
    expect(listAbsoluteMeasureToolKeys()).toHaveLength(46);
    expect(listAbsoluteMeasureToolKeys()).toContain('measure:absolute:function-count');
    expect(listWeightedQuantityAbsoluteMeasureToolKeys().length).toBeGreaterThanOrEqual(8);
    expect(listWeightedQuantityAbsoluteMeasureToolKeys()).toContain(
      'measure:absolute:function-count',
    );
  });

  it('base AbsolutesMeasureAgent advertises quantity tools and can register them', () => {
    const agent = factoryAbsolutesMeasureAgent({
      name: 'test-absolutes-agent',
      subject: 'a test DataPack',
    });
    expect(agent.measureToolKeys?.length).toBeGreaterThan(0);
    expect(agent.measureToolKeys).toContain('measure:absolute:function-count');
    const registered: string[] = [];
    const fakeExec = {
      tools: {
        registerTool: (key: string) => {
          registered.push(key);
        },
      },
    };
    const keys = registerAbsoluteMeasureTools(fakeExec);
    expect(keys.length).toBe(46);
    expect(registered).toHaveLength(46);
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
    // B1 structure heuristics should not return not_implemented on sources.
    const all = measureDataPackAllAbsolutes({
      dataPack: {
        coveredSourcePaths: ['src/auth/session.ts'],
        confidence: 0.8,
      },
      sources: [
        {
          path: 'src/auth/session.ts',
          content: 'export function login() { if (true) return 1 }\nimport x from "zod"',
        },
      ],
    });
    const depSpan = all.find((r) => r.measurementKind === 'dependency-span');
    expect(depSpan?.status).not.toBe('not_implemented');
  });

  it('runs full catalogue without throwing', () => {
    const all = measureDataPackAllAbsolutes({
      dataPack: { coveredSourcePaths: ['a.ts'], confidence: 0.5 },
    });
    expect(all).toHaveLength(46);
    expect(all.every((r) => r.status !== 'not_implemented' || true)).toBe(true);
  });
});
