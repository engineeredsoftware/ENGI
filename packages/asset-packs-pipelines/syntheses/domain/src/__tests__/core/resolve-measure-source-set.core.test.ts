/**
 * Core: resolveMeasureSourceSet deepens DP measure bodies with manifests + tests.
 */
import {
  isMeasureManifestPath,
  resolveMeasureSourceSet,
} from '../../resolve-measure-source-set';

describe('resolveMeasureSourceSet (core)', () => {
  const bodies = [
    { path: 'src/service.ts', content: 'export function run() { return 1; }' },
    { path: 'src/service.test.ts', content: 'test("run", () => {});' },
    { path: 'src/util.ts', content: 'export const x = 1;' },
    { path: 'package.json', content: '{"name":"svc","dependencies":{"express":"4"}}' },
    { path: 'pnpm-lock.yaml', content: 'lockfileVersion: 9' },
    { path: 'README.md', content: '# svc' },
    { path: 'other/unrelated.ts', content: 'export const y = 2;' },
  ];

  it('includes covered bodies + manifests outside path scope', () => {
    const result = resolveMeasureSourceSet({
      coveredSourcePaths: ['src/service.ts', 'src/util.ts'],
      fileChanges: [{ path: 'src/service.ts', op: 'modify' }],
      availableBodies: bodies,
    });
    const paths = result.sources.map((s) => s.path);
    expect(paths).toContain('src/service.ts');
    expect(paths).toContain('src/util.ts');
    expect(paths).toContain('package.json');
    expect(paths).toContain('pnpm-lock.yaml');
    expect(paths).toContain('src/service.test.ts');
    expect(paths).not.toContain('other/unrelated.ts');
    expect(result.manifestCount).toBeGreaterThanOrEqual(2);
    expect(result.measuredFromBodies).toBeGreaterThanOrEqual(4);
    expect(result.mode).toBe('thin');
    expect(result.truncated).toBe(false);
  });

  it('path-only when no bodies available', () => {
    const result = resolveMeasureSourceSet({
      coveredSourcePaths: ['a.ts', 'b.ts'],
      availableBodies: [],
    });
    expect(result.sources).toEqual([]);
    expect(result.mode).toBe('path-only');
    expect(result.coveredPathCount).toBe(2);
  });

  it('truncates with telemetry when over maxBodies', () => {
    const many = Array.from({ length: 20 }, (_, i) => ({
      path: `src/f${i}.ts`,
      content: `export const n${i} = ${i};`,
    }));
    const result = resolveMeasureSourceSet({
      coveredSourcePaths: many.map((m) => m.path),
      availableBodies: many,
      maxBodies: 5,
    });
    expect(result.sources).toHaveLength(5);
    expect(result.truncated).toBe(true);
    expect(result.measuredFromBodies).toBe(5);
  });

  it('isMeasureManifestPath recognizes lockfiles and go.mod', () => {
    expect(isMeasureManifestPath('package.json')).toBe(true);
    expect(isMeasureManifestPath('apps/api/go.mod')).toBe(true);
    expect(isMeasureManifestPath('src/service.ts')).toBe(false);
  });

  it('mode deep when many bodies', () => {
    const many = Array.from({ length: 10 }, (_, i) => ({
      path: `src/m${i}.ts`,
      content: `export const v = ${i};`,
    }));
    const result = resolveMeasureSourceSet({
      coveredSourcePaths: many.map((m) => m.path),
      availableBodies: many,
    });
    expect(result.mode).toBe('deep');
  });
});
