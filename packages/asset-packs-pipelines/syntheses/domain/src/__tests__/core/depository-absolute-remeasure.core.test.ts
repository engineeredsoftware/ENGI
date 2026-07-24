// @ts-nocheck
import {
  collectAbsoluteVolumesFromUnknown,
  expandAbsoluteVolumesToFullCatalog,
  mergeAbsoluteVolumeMaps,
} from '../../depository-absolute-facets-expand';
import { remeasureDataPackAbsoluteFacets } from '../../depository-absolute-remeasure';
import { DATA_PACK_ABSOLUTES_CATALOG } from '@bitcode/generic-measurements-domain-data-pack-absolutes-catalog';

describe('CORE: depository absolute remeasure / expand (46-kind law)', () => {
  it('expands partial volumes to all 46 kinds (missing → 0)', () => {
    const expanded = expandAbsoluteVolumesToFullCatalog({
      'function-count': 0.5,
      'lang-span': 0.25,
    });
    expect(expanded.catalogSize).toBeGreaterThanOrEqual(65);
    expect(expanded.absoluteKinds.length).toBeGreaterThanOrEqual(65);
    expect(Object.keys(expanded.absoluteVolumes).length).toBeGreaterThanOrEqual(65);
    expect(expanded.absoluteVolumes['function-count']).toBe(0.5);
    expect(expanded.absoluteVolumes['lang-span']).toBe(0.25);
    expect(expanded.absoluteVolumes['secret-safety']).toBe(0);
    expect(expanded.measuredKindCount).toBe(2);
  });

  it('collects volumes from index + nested measurement shapes', () => {
    const fromIndex = collectAbsoluteVolumesFromUnknown({
      absolute_volumes: { 'function-count': 0.4 },
      absolute_kinds: ['function-count'],
    });
    expect(fromIndex['function-count']).toBe(0.4);

    const fromNested = collectAbsoluteVolumesFromUnknown({
      measurements: {
        absolutes: [
          { measurementKind: 'type-count', volume: 0.3 },
          { kind: 'file-span', volume: 0.2 },
        ],
      },
    });
    expect(fromNested['type-count']).toBe(0.3);
    expect(fromNested['file-span']).toBe(0.2);
  });

  it('merges volume maps with max per kind', () => {
    const merged = mergeAbsoluteVolumeMaps(
      { 'function-count': 0.2, 'lang-span': 0.9 },
      { 'function-count': 0.5 },
    );
    expect(merged['function-count']).toBe(0.5);
    expect(merged['lang-span']).toBe(0.9);
  });

  it('remeasures DataPack surface to full catalogue and preserves prior non-zero', () => {
    const result = remeasureDataPackAbsoluteFacets({
      title: 'Auth slice',
      summary: 'Session authentication capability.',
      coveredSourcePaths: ['src/auth/session.ts', 'src/auth/session.test.ts'],
      fileChanges: [
        { path: 'src/auth/session.ts', op: 'modify' },
        { path: 'src/auth/session.test.ts', op: 'create' },
      ],
      confidence: 0.8,
      sources: [
        {
          path: 'src/auth/session.ts',
          content: 'export function login() { return true }\nexport type Session = {};',
        },
      ],
      // Prior legacy partial (only 2 of old 11)
      priorVolumes: {
        'function-count': 0.99,
        'objectives-fidelity': 0.77,
      },
    });

    expect(result.mode).toBe('remeasured');
    expect(result.absoluteKinds).toHaveLength(DATA_PACK_ABSOLUTES_CATALOG.length);
    expect(result.catalogSize).toBeGreaterThanOrEqual(65);
    // Prior high function-count preserved or improved (max merge).
    expect(result.absoluteVolumes['function-count']).toBeGreaterThanOrEqual(0.99);
    expect(result.absoluteVolumes['objectives-fidelity']).toBeGreaterThanOrEqual(0.77);
    // File span should be measured from paths.
    expect(result.absoluteVolumes['file-span']).toBeGreaterThan(0);
  });

  it('expanded-only when no DataPack surface (still full 46)', () => {
    const result = remeasureDataPackAbsoluteFacets({
      priorVolumes: { 'api-surface': 0.4 },
    });
    expect(result.mode).toBe('expanded-only');
    expect(result.absoluteKinds.length).toBeGreaterThanOrEqual(65);
    expect(result.absoluteVolumes['api-surface']).toBe(0.4);
    expect(result.absoluteVolumes['function-count']).toBe(0);
  });
});
