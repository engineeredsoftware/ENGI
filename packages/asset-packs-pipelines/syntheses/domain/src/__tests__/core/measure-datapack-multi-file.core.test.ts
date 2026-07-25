/**
 * Core: multi-file fixture → deep measure with ≥12 structure/identity kinds > 0.
 * Proves report override bug fix + resolveMeasureSourceSet manifests path.
 */
// @ts-nocheck
let mockRealInference = false;
jest.mock('../../runtime-inference-policy', () => ({
  isAssetPackRealInferenceEnabled: () => mockRealInference,
}));
jest.mock('@bitcode/generic-llms', () =>
  require('../support/generic-llms-mock').makeGenericLLMsMock(),
);

import { measureDataPackAbsolutesAndIdentity } from '../../agents/validation/agent-measure-absolutes';
import { resolveMeasureSourceSet } from '../../resolve-measure-source-set';
import { loadMeasureFixture } from '../support/load-measure-fixture';
import { DATA_PACK_ABSOLUTES_CATALOG } from '@bitcode/generic-measurements-domain-data-pack-absolutes-catalog';

const T0_STRUCTURE_IDENTITY = [
  'function-count',
  'type-count',
  'file-span',
  'symbolic-richness',
  'modularity',
  'lang-span',
  'test-surface',
  'api-surface',
  'dependency-span',
  'config-surface',
  'doc-signal',
  'language-concentration',
  'framework-surface',
  'dependency-class-balance',
  'capability-surface',
  'purpose-clarity',
] as const;

describe('measureDataPackAbsolutesAndIdentity multi-file fixture (core)', () => {
  beforeEach(() => {
    mockRealInference = false;
  });

  it('deep measure on multi-lang-service: ≥12 T0 kinds measured > 0 + identity deps', async () => {
    const allBodies = loadMeasureFixture('multi-lang-service');
    expect(allBodies.length).toBeGreaterThanOrEqual(8);

    const coveredSourcePaths = allBodies
      .map((b) => b.path)
      .filter((p) => p.startsWith('src/') || p.includes('__tests__'));
    const fileChanges = coveredSourcePaths.map((path) => ({
      path,
      op: 'modify' as const,
    }));

    const measureSet = resolveMeasureSourceSet({
      coveredSourcePaths,
      fileChanges,
      availableBodies: allBodies,
    });
    expect(measureSet.measuredFromBodies).toBeGreaterThanOrEqual(6);
    expect(measureSet.manifestCount).toBeGreaterThanOrEqual(1);
    expect(measureSet.sources.some((s) => s.path.endsWith('package.json'))).toBe(
      true,
    );

    const result = await measureDataPackAbsolutesAndIdentity(
      {
        title: 'Multi-lang service capability slice',
        summary:
          'Express + Zod user API with tests, Dockerfile, and package dependencies.',
        coveredSourcePaths,
        fileChanges,
        confidence: 0.8,
        patchSummary: 'Ship multi-lang service handlers and tests',
      },
      {
        lens: 'deposit',
        sources: measureSet.sources,
        preferQualityInference: false,
      },
    );

    expect(result.absolutes.length).toBe(DATA_PACK_ABSOLUTES_CATALOG.length);
    expect(result.measureReport.mode).toMatch(/deep|thin/);
    expect(result.measureReport.measuredFromBodies).toBeGreaterThanOrEqual(6);

    const byKind = new Map(
      result.absolutes.map((a) => [a.measurementKind, a]),
    );
    const nonZero = T0_STRUCTURE_IDENTITY.filter((k) => {
      const row = byKind.get(k);
      return row && Number(row.volume) > 0;
    });
    expect(nonZero.length).toBeGreaterThanOrEqual(12);

    // Structure magnitudes should be real, not expand-fill zeros.
    expect(byKind.get('function-count')?.magnitude ?? 0).toBeGreaterThan(0);
    expect(byKind.get('file-span')?.magnitude ?? 0).toBeGreaterThan(0);
    expect(byKind.get('api-surface')?.magnitude ?? 0).toBeGreaterThan(0);
    expect(byKind.get('dependency-span')?.magnitude ?? 0).toBeGreaterThan(0);

    // Honesty: report-owned structure is measured/estimated, not expanded-fill.
    expect(
      ['measured', 'estimated'].includes(
        String(byKind.get('function-count')?.status),
      ),
    ).toBe(true);

    // Material identity deps inventory non-empty with usage.
    const deps = result.materialIdentity.inventories.find(
      (i) => i.kind === 'dependencies',
    );
    expect(deps).toBeTruthy();
    expect((deps?.items || []).length).toBeGreaterThan(0);
    expect(deps?.totalCount || deps?.items.length || 0).toBeGreaterThan(0);
    const express = deps?.items.find(
      (i) => i.id === 'express' || i.label === 'express',
    );
    expect(express).toBeTruthy();
    expect((express?.fileHitCount || 0) + (express?.usageShare || 0)).toBeGreaterThan(
      0,
    );

    // Hygiene: with bodies, secret-safety should be estimated clean (1) not fill.
    const secret = byKind.get('secret-safety');
    expect(secret?.status).not.toBe('expanded-fill');
    if (secret?.status === 'estimated' || secret?.status === 'measured') {
      expect(secret.volume).toBe(1); // no secrets in fixture
    }
  }, 60000);
});
