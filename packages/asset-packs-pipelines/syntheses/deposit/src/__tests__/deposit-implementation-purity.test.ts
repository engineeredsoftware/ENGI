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
import runPatchfile from '../agents/implementation/deposit-implementation-agent-asset-packs-patchfile-synthesis';
import runMeasurements from '../agents/implementation/deposit-implementation-agent-asset-packs-measurements-synthesis';
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
  it('toDepositMeasuredPack is absolutes-only', () => {
    const pf = toDepositPatchfilePack(MOCK_OPTIONS[0]);
    const pack = toDepositMeasuredPack(pf, [
      { measurementKind: 'file-span', volume: 0.2, magnitude: 2, category: 'absolute' },
    ]);
    expect(pack.measurements).toEqual({
      absolutes: [
        { measurementKind: 'file-span', volume: 0.2, magnitude: 2, category: 'absolute' },
      ],
    });
    expect(hasDepositAbsolutesOnlyShape(pack)).toBe(true);
    expect(hasRequiredAbsolutes(pack)).toBe(true);
    expect(isDepositPresentablePack(pack)).toBe(true);
  });

  it('attachDepositAbsolutes assigns legal shape', () => {
    const pack: any = { title: 'x' };
    attachDepositAbsolutes(pack, [
      { measurementKind: 'function-count', volume: 0.1, magnitude: 3 },
    ]);
    expect(Object.keys(pack.measurements)).toEqual(['absolutes']);
  });

  it('salvaged packs are never presentable', () => {
    const pack = toDepositMeasuredPack(
      { ...toDepositPatchfilePack(MOCK_OPTIONS[0]), salvaged: true, salvageReason: 'test' },
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

  it('model options → measured + presentable', async () => {
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
    const patched = await runPatchfile(
      {
        repository: { fullName: 'o/r' },
        inventory: { paths: ['src/auth/session.ts', 'src/auth/token.ts'] },
      },
      exec,
    );
    expect(patched.success).toBe(true);
    expect(patched.salvaged).toBe(false);

    const measured = await runMeasurements(patched, exec);
    expect(measured.success).toBe(true);
    expect(measured.measured).toBe(true);
    expect(measured.presentable).toBe(true);
    for (const o of measured.options) {
      expect(Object.keys(o.measurements)).toEqual(['absolutes']);
      expect(isDepositPresentablePack(o)).toBe(true);
    }
    expect(exec.get('implementation', 'presentable')).toBe(true);
  }, 120000);
});
