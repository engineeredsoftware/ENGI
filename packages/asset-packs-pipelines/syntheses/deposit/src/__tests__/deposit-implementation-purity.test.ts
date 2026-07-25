/**
 * Deposit Implementation purity + presentable law (agents 1/2 + 2/2).
 *
 * Construction is allowlist-only — no neediness scrub theater.
 * Pins: six-field patchfile, measurements { absolutes } only, salvage never presentable.
 */
// @ts-nocheck
jest.mock('@bitcode/generic-llms', () => require('./support/generic-llms-mock').makeGenericLLMsMock());

import {
  attachDepositAbsolutes,
  hasDepositAbsolutesOnlyShape,
  hasRequiredAbsolutes,
} from '@bitcode/asset-packs-pipelines-syntheses-domain/asset-pack-measurements';
import { DATA_PACK_ABSOLUTES_CATALOG } from '@bitcode/generic-measurements-domain-data-pack-absolutes-catalog';

/** Full commercial catalogue stub (46) with finite volume+magnitude. */
function fullCatalogAbsolutes(seedVolume = 0.2) {
  return DATA_PACK_ABSOLUTES_CATALOG.map((spec) => ({
    measurementKind: spec.measurementKind,
    label: spec.label,
    weight: spec.weight,
    volume: seedVolume,
    magnitude: seedVolume,
    unit: spec.unit,
    category: 'absolute' as const,
  }));
}
import {
  isDepositPresentablePack,
  countSalvagedPacks,
  toDepositMeasuredPack,
  toDepositPatchfilePack,
} from '../agents/implementation/deposit-implementation-pack-types';
import {
  pathViolates,
  normalizeBlockedPathEntries,
  isExcludedPath,
  pathAllowedInCatalog,
  buildCatalogPathSet,
} from '../agents/implementation/deposit-implementation-path-law';
import { Execution } from '@bitcode/execution-generics';
import runPatchPlan from '../agents/implementation/deposit-implementation-agent-asset-packs-patch-plan';
import runPatchfile from '../agents/implementation/deposit-implementation-agent-asset-packs-patchfile';
import runMeasurements from '../agents/implementation/deposit-implementation-agent-asset-packs-measurements-synthesis';
import { hasPatchArtifact } from '../agents/implementation/deposit-implementation-pack-types';
import { setBoundaryLLMOutput, resetBoundaryLLMOutput } from './support/generic-llms-mock';
import {
  projectDepositPatchfileCandidate,
  depositCandidateSetSchema,
} from '../agents/implementation/deposit-asset-pack-synthesis-schema';

const MOCK_OPTIONS = [
  {
    kind: 'capability-slice',
    title: 'Session auth capability slice',
    summary:
      'A bounded, source-safe capability slice covering session authentication and token refresh flows.',
    coveredSourcePaths: ['src/auth/session.ts', 'src/auth/token.ts'],
    confidence: 0.82,
    patch: {
      fileChanges: [
        { path: 'src/auth/session.ts', op: 'modify' },
        { path: 'src/auth/token.ts', op: 'modify' },
      ],
      patchSummary: 'Encodes the session lifecycle knowledge.',
    },
  },
];

describe('allowlist projection (deposit patchfile)', () => {
  it('drops non-product keys from model candidates', () => {
    const projected = projectDepositPatchfileCandidate({
      ...MOCK_OPTIONS[0],
      measurements: { absolutes: [{ volume: 0.9 }], needinesses: [] },
      needinessSignal: { demand: 0.5 },
      junk: true,
    });
    expect(projected).toEqual({
      kind: MOCK_OPTIONS[0].kind,
      title: MOCK_OPTIONS[0].title,
      summary: MOCK_OPTIONS[0].summary,
      coveredSourcePaths: MOCK_OPTIONS[0].coveredSourcePaths,
      confidence: MOCK_OPTIONS[0].confidence,
      patch: {
        fileChanges: MOCK_OPTIONS[0].patch.fileChanges,
        patchSummary: MOCK_OPTIONS[0].patch.patchSummary,
      },
    });
    expect(projected).not.toHaveProperty('measurements');
    expect(projected).not.toHaveProperty('junk');
  });

  it('schema parse projects allowlist', () => {
    const parsed = depositCandidateSetSchema.parse({
      options: [
        {
          ...MOCK_OPTIONS[0],
          measurements: { needinesses: [] },
          extra: 1,
        },
      ],
    });
    expect(parsed.options[0]).not.toHaveProperty('measurements');
    expect(parsed.options[0]).not.toHaveProperty('extra');
  });
});

describe('deposit measured shape', () => {
  it('toDepositMeasuredPack requires patchArtifact for presentable', () => {
    const plan = toDepositPatchfilePack(MOCK_OPTIONS[0]);
    const withArt = {
      ...plan,
      patchArtifact: {
        artifactId: 'artifact-patch-test',
        assetPackId: 'ap-test',
        schema: 'bitcode.artifact.patch',
        productSchema: 'bitcode.artifact.patch.asset-pack',
        format: 'path-op-json',
        patchSummary: plan.patch.patchSummary,
        fileCount: 1,
        files: [{ path: 'src/auth/session.ts', op: 'modify' }],
        name: 'a.patch.json',
        envelopeJson: '{"artifactId":"artifact-patch-test"}',
      },
    };
    const pack = toDepositMeasuredPack(withArt as any, fullCatalogAbsolutes(0.2));
    expect(hasPatchArtifact(pack)).toBe(true);
    expect(hasDepositAbsolutesOnlyShape(pack)).toBe(true);
    expect(hasRequiredAbsolutes(pack)).toBe(true);
    expect(isDepositPresentablePack(pack)).toBe(true);
  });

  it('salvaged packs are never presentable', () => {
    const pack = toDepositMeasuredPack(
      {
        ...toDepositPatchfilePack(MOCK_OPTIONS[0]),
        salvaged: true,
        salvageReason: 'test',
        patchArtifact: {
          artifactId: 'a',
          assetPackId: 'b',
          schema: 's',
          productSchema: 'p',
          format: 'path-op-json',
          patchSummary: 'x',
          fileCount: 1,
          files: [{ path: 'f', op: 'modify' }],
          name: 'n',
          envelopeJson: '{}',
        },
      } as any,
      [{ measurementKind: 'file-span', volume: 0.5, magnitude: 1 }],
    );
    expect(isDepositPresentablePack(pack)).toBe(false);
  });

  it('countSalvagedPacks counts flags', () => {
    expect(countSalvagedPacks([{ salvaged: true }, {}, { salvaged: true }])).toBe(2);
  });
});

describe('shared path law (Validation-aligned)', () => {
  it('pathViolates uses directory prefix', () => {
    expect(pathViolates('src/auth/session.ts', 'src/auth')).toBe(true);
    expect(normalizeBlockedPathEntries(['auth', 'src/secret'])).toEqual(['src/secret']);
  });

  it('pathAllowedInCatalog enforces membership + exclusion', () => {
    const catalog = buildCatalogPathSet(['src/a.ts', 'src/secret/x.ts']);
    expect(pathAllowedInCatalog('src/a.ts', catalog, ['src/secret'])).toBe(true);
    expect(pathAllowedInCatalog('src/secret/x.ts', catalog, ['src/secret'])).toBe(false);
    expect(isExcludedPath('src/secret/x.ts', ['src/secret'])).toBe(true);
  });
});

describe('full Implementation: model path presentable', () => {
  afterEach(() => resetBoundaryLLMOutput());

  it('model options → plan → write artifact → measure presentable', async () => {
    setBoundaryLLMOutput({ options: MOCK_OPTIONS });
    const exec = new Execution('implementation-node');
    exec.store('deposit', 'sourceCheckoutCatalog', {
      paths: ['src/auth/session.ts', 'src/auth/token.ts'],
      samples: [],
      sources: [
        { path: 'src/auth/session.ts', content: 'export function createSession() {}' },
        { path: 'src/auth/token.ts', content: 'export function refresh() {}' },
      ],
    });
    const input = {
      repository: { fullName: 'o/r' },
      inventory: { paths: ['src/auth/session.ts', 'src/auth/token.ts'] },
    };
    const planned = await runPatchPlan(input, exec);
    expect(planned.success).toBe(true);
    const written = await runPatchfile(planned, exec);
    expect(written.patchfileWritten).toBe(true);
    expect(hasPatchArtifact(written.options[0])).toBe(true);

    const measured = await runMeasurements(written, exec);
    expect(measured.success).toBe(true);
    expect(measured.presentable).toBe(true);
    for (const o of measured.options) {
      // Legal deposit bag: absolutes required; materialIdentity / measureReport optional.
      expect(Object.keys(o.measurements)).toContain('absolutes');
      expect(Array.isArray(o.measurements.absolutes)).toBe(true);
      for (const k of Object.keys(o.measurements)) {
        expect(['absolutes', 'materialIdentity', 'measureReport', 'needinesses']).toContain(k);
      }
      expect(isDepositPresentablePack(o)).toBe(true);
    }
  }, 120000);
});
