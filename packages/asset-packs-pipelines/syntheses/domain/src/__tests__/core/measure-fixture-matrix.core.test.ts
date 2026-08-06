/**
 * Core: multi-language measure fixtures (TS / Python / Go) prove structure +
 * identity kinds measure non-zero when manifests and bodies are present.
 */
// @ts-nocheck
jest.mock('../../runtime-inference-policy', () => ({
  isAssetPackRealInferenceEnabled: () => false,
}));
jest.mock('@bitcode/generic-llms', () =>
  require('../support/generic-llms-mock').makeGenericLLMsMock(),
);

import { measureDataPackAbsolutesAndIdentity } from '../../agents/validation/agent-measure-absolutes';
import { resolveMeasureSourceSet } from '../../resolve-measure-source-set';
import { loadMeasureFixture } from '../support/load-measure-fixture';

const STRUCTURE_PROBE = [
  'function-count',
  'type-count',
  'file-span',
  'symbolic-richness',
  'modularity',
  'lang-span',
  'api-surface',
  'dependency-span',
  'config-surface',
] as const;

async function measureFixture(name: string, coveredFilter: (p: string) => boolean) {
  const allBodies = loadMeasureFixture(name);
  const coveredSourcePaths = allBodies.map((b) => b.path).filter(coveredFilter);
  const measureSet = resolveMeasureSourceSet({
    coveredSourcePaths,
    fileChanges: coveredSourcePaths.map((path) => ({ path, op: 'modify' })),
    availableBodies: allBodies,
  });
  const result = await measureDataPackAbsolutesAndIdentity(
    {
      title: `${name} capability slice`,
      summary: `Measured fixture ${name}`,
      coveredSourcePaths,
      fileChanges: coveredSourcePaths.map((path) => ({ path, op: 'modify' })),
      confidence: 0.75,
    },
    { lens: 'deposit', sources: measureSet.sources, preferQualityInference: false },
  );
  return { result, measureSet, allBodies };
}

describe('measure fixture matrix (core)', () => {
  it.each([
    {
      name: 'multi-lang-service',
      filter: (p: string) => p.startsWith('src/') || p.includes('__tests__'),
      minNonZero: 8,
      expectDeps: true,
    },
    {
      name: 'python-api',
      filter: (p: string) => p.startsWith('app/') || p.startsWith('tests/'),
      minNonZero: 6,
      expectDeps: true,
    },
    {
      name: 'go-module',
      filter: (p: string) =>
        p.startsWith('cmd/') || p.startsWith('internal/') || p === 'go.mod',
      minNonZero: 6,
      expectDeps: true,
    },
  ])(
    '$name: structure kinds + identity non-empty',
    async ({ name, filter, minNonZero, expectDeps }) => {
      const { result, measureSet } = await measureFixture(name, filter);
      expect(measureSet.measuredFromBodies).toBeGreaterThan(0);
      expect(result.measureReport.mode).toMatch(/deep|thin/);

      const byKind = new Map(result.absolutes.map((a) => [a.measurementKind, a]));
      const nonZero = STRUCTURE_PROBE.filter((k) => Number(byKind.get(k)?.volume) > 0);
      expect(nonZero.length).toBeGreaterThanOrEqual(minNonZero);
      expect(Number(byKind.get('file-span')?.magnitude) || 0).toBeGreaterThan(0);
      expect(Number(byKind.get('function-count')?.magnitude) || 0).toBeGreaterThan(0);

      if (expectDeps) {
        const deps = result.materialIdentity.inventories.find(
          (i) => i.kind === 'dependencies',
        );
        // Manifests force dep discovery when present in measure set.
        expect(measureSet.manifestCount).toBeGreaterThanOrEqual(1);
        expect(deps?.items?.length || 0).toBeGreaterThan(0);
      }

      // P0 honesty: semantics without quality agent/sensor must not invent from confidence.
      const SEMANTICS_NO_INVENTION = [
        'correctness-estimate',
        'objectives-fidelity',
        'coherence',
        'completeness',
        'capability-clarity',
        'documentation-alignment',
      ] as const;
      for (const kind of SEMANTICS_NO_INVENTION) {
        const row = byKind.get(kind);
        expect(row?.status).toBe('insufficient_evidence');
        expect(Number(row?.volume) || 0).toBe(0);
      }

      // Verification sandbox sensors absent → insufficient (not fake measured).
      for (const kind of ['buildability', 'test-coverage', 'test-pass-rate'] as const) {
        const row = byKind.get(kind);
        expect(row?.status).not.toBe('measured');
        if (!row?.status || row.status === 'insufficient_evidence' || row.status === 'expanded-fill') {
          expect(Number(row?.volume) || 0).toBe(0);
        }
      }
    },
    60000,
  );
});
