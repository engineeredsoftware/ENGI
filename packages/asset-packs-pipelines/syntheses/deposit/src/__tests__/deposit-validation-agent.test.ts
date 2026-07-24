// @ts-nocheck
// Inference is non-configurable (F26-A): the deposit Validation agent ALWAYS runs
// the formal PTRR hierarchy. Determinism comes from mocking the LLM provider at
// the boundary. Real inference stays disabled for the absolutes measurement, so
// measureDataPackAbsolutes takes the deterministic static-analysis path.
jest.mock('@bitcode/generic-llms', () => require('./support/generic-llms-mock').makeGenericLLMsMock());

import { Execution } from '@bitcode/execution-generics';
import runDepositValidationAgent from '../agents/validation/deposit-validation-agent';
import { DATA_PACK_ABSOLUTES_CATALOG } from '@bitcode/asset-packs-pipelines-syntheses-domain/asset-packs-synthesis';
import { setBoundaryLLMOutput, resetBoundaryLLMOutput } from './support/generic-llms-mock';

const SIZE_KINDS = new Set(['function-count', 'type-count', 'file-span']);

function makePack(overrides: Record<string, any> = {}) {
  return {
    kind: 'capability-slice',
    title: 'Session auth capability slice',
    summary:
      'A bounded, source-safe capability slice covering session authentication and refresh.',
    coveredSourcePaths: ['src/auth/session.ts'],
    // Nested measurement kinds: deposit absolutes only (neediness is Read-pipeline).
    measurements: {
      absolutes: [
        {
          measurementKind: 'function-count',
          label: 'Functions',
          weight: 0.12,
          volume: 0.3,
          magnitude: 4,
          unit: 'functions',
          category: 'absolute',
        },
      ],
    },
    measurementRationale: 'Covers the auth module knowledge end to end.',
    confidence: 0.8,
    patch: {
      fileChanges: [{ path: 'src/auth/session.ts', op: 'modify' }],
      patchSummary: 'Encodes the session lifecycle knowledge.',
    },
    ...overrides,
  };
}

/** A clean qualitative verdict from the boundary-mocked model. */
function setCleanVerdict() {
  setBoundaryLLMOutput({
    issues: [],
    qualityScore: 0.9,
    coverageGaps: [],
    recommendation: 'complete',
  });
}

describe('runDepositValidationAgent (boundary-mocked PTRR + deterministic smoke checks)', () => {
  const savedRealInference = process.env.BITCODE_ASSET_PACK_REAL_INFERENCE;

  beforeAll(() => {
    delete process.env.BITCODE_ASSET_PACK_REAL_INFERENCE;
  });
  afterAll(() => {
    if (savedRealInference !== undefined) {
      process.env.BITCODE_ASSET_PACK_REAL_INFERENCE = savedRealInference;
    }
  });
  afterEach(() => resetBoundaryLLMOutput());

  it('clean packs + clean model verdict => complete, empty issues, and both stores written', async () => {
    setCleanVerdict();
    const exec = new Execution('validation-node');
    const packs = [makePack()];

    const result = await runDepositValidationAgent({ assetPacks: packs }, exec);

    expect(result.issues).toEqual([]);
    expect(result.recommendation).toBe('complete');
    expect(result.qualityScore).toBe(0.9);
    expect(result.coverageGaps).toEqual([]);
    // The ReadyToFinish gate reads validation/implementation:issues as a bare string[].
    expect(exec.get('validation/implementation', 'issues')).toEqual([]);
    expect(exec.get('validation', 'depositQuality')).toMatchObject({
      issues: [],
      qualityScore: 0.9,
      recommendation: 'complete',
    });
    // The runner spreads its input into its result (the DIV output chain).
    expect(result.assetPacks).toBe(packs);
  }, 120000);

  it('does not attach absolutes (Implementation measures; Validation only validates)', async () => {
    setCleanVerdict();
    const exec = new Execution('validation-node');
    // No pre-attached absolutes — Validation must NOT invent/fill the catalog.
    const packs = [makePack({ measurements: undefined, absolutes: undefined })];

    const result = await runDepositValidationAgent({ assetPacks: packs }, exec);

    expect(packs[0].absolutes).toBeUndefined();
    expect(packs[0].measurements).toBeUndefined();
    expect(result.recommendation).toBe('iterate');
    expect(result.issues.some((i: string) => /measurements\.absolutes|missing measurements/i.test(i))).toBe(
      true,
    );
    // Must not re-write Implementation options as a side effect of measuring.
    expect(exec.get('implementation', 'options')).toBeUndefined();
  }, 120000);

  it('accepts packs that already carry the full formal absolutes catalog', async () => {
    setCleanVerdict();
    const exec = new Execution('validation-node');
    const absolutes = DATA_PACK_ABSOLUTES_CATALOG.map((spec) => ({
      measurementKind: spec.measurementKind,
      label: spec.label,
      weight: spec.weight,
      volume: 0.4,
      magnitude: spec.propertyClass === 'quantity' ? 4 : 0.4,
      unit: spec.unit,
      category: 'absolute' as const,
    }));
    const packs = [makePack({ measurements: { absolutes }, absolutes })];

    const result = await runDepositValidationAgent({ assetPacks: packs }, exec);

    expect(result.recommendation).toBe('complete');
    expect(packs[0].measurements.absolutes).toHaveLength(DATA_PACK_ABSOLUTES_CATALOG.length);
    for (const measurement of packs[0].measurements.absolutes) {
      expect(measurement.category).toBe('absolute');
      if (SIZE_KINDS.has(measurement.measurementKind)) {
        expect(Number.isInteger(measurement.magnitude)).toBe(true);
      }
    }
  }, 120000);

  it('deterministic smoke issues force iterate even when the model says complete', async () => {
    setCleanVerdict(); // model verdict: complete, no issues
    const exec = new Execution('validation-node');
    const packs = [makePack({ confidence: 2 })]; // out-of-range confidence

    const result = await runDepositValidationAgent({ assetPacks: packs }, exec);

    expect(result.recommendation).toBe('iterate');
    expect(result.issues.some((issue: string) => /confidence/.test(issue))).toBe(true);
    expect(exec.get('validation/implementation', 'issues')).toEqual(result.issues);
  }, 120000);

  it('flags the structural smoke matrix: measurements, covered paths, patch coherence, distinctness', async () => {
    setCleanVerdict();
    const exec = new Execution('validation-node');
    const packs = [
      makePack({ title: 'Pack missing measurements', measurements: undefined }),
      makePack({
        title: 'Pack with dishonest measurement',
        measurements: { 'source-coverage': 1.5 },
      }),
      makePack({ title: 'Pack with no covered paths', coveredSourcePaths: [] }),
      makePack({ title: 'Pack with no patch descriptor', patch: undefined }),
      makePack({
        title: 'Pack with no patch summary',
        patch: { fileChanges: [{ path: 'src/auth/session.ts', op: 'modify' }] },
      }),
      makePack({ title: 'Duplicated pack title' }),
      makePack({ title: 'Duplicated pack title' }),
    ];

    const result = await runDepositValidationAgent({ assetPacks: packs }, exec);

    expect(result.recommendation).toBe('iterate');
    const issues = result.issues.join('\n');
    expect(issues).toContain('missing measurements.absolutes');
    expect(issues).toContain('is not an honest 0..1 volume');
    expect(issues).toContain('declares no coveredSourcePaths');
    expect(issues).toContain('has no patch descriptor with fileChanges (patch coherence)');
    expect(issues).toContain('missing a source-safe patchSummary');
    expect(issues).toContain('2 packs share the title "duplicated pack title"');
  }, 120000);

  it('flags exclusion/obfuscation violations on BOTH covered paths and patch fileChange paths', async () => {
    setCleanVerdict();
    const exec = new Execution('validation-node');
    const packs = [
      // Covered path sits UNDER a protected-IP exclusion (directory-prefix semantics).
      makePack({
        title: 'Pack covering an excluded path',
        coveredSourcePaths: ['src/protected/secret-algo.ts'],
      }),
      // Patch fileChange path equals an obfuscated path (exact-match semantics).
      makePack({
        title: 'Pack patching an obfuscated path',
        patch: {
          fileChanges: [{ path: 'src/hidden/keys.ts', op: 'modify' }],
          patchSummary: 'Encodes knowledge over a withheld path.',
        },
      }),
    ];

    const result = await runDepositValidationAgent(
      {
        assetPacks: packs,
        impermissibleSources: ['src/protected'],
        obfuscationGuidance: { obfuscatedPaths: ['src/hidden/keys.ts'] },
      },
      exec,
    );

    expect(result.recommendation).toBe('iterate');
    expect(
      result.issues.some((issue: string) =>
        issue.includes('touches withheld path "src/protected/secret-algo.ts"') &&
        issue.includes('violates exclusion/obfuscation "src/protected"'),
      ),
    ).toBe(true);
    expect(
      result.issues.some((issue: string) =>
        issue.includes('touches withheld path "src/hidden/keys.ts"') &&
        issue.includes('violates exclusion/obfuscation "src/hidden/keys.ts"'),
      ),
    ).toBe(true);
  }, 120000);

  it('fails closed on an empty pack list ("No AssetPacks were synthesized")', async () => {
    setCleanVerdict();
    const exec = new Execution('validation-node');

    const result = await runDepositValidationAgent({ assetPacks: [] }, exec);

    expect(result.issues).toEqual(['No AssetPacks were synthesized to validate.']);
    expect(result.recommendation).toBe('iterate');
    expect(exec.get('validation/implementation', 'issues')).toEqual(result.issues);
    // No packs means no absolutes pass and no re-store of implementation keys.
    expect(exec.get('implementation', 'options')).toBeUndefined();
  }, 120000);

  it('dedupes merged qualitative + smoke issues', async () => {
    setBoundaryLLMOutput({
      issues: ['Overlapping knowledge slices.', 'Overlapping knowledge slices.'],
      qualityScore: 0.4,
      coverageGaps: [],
      recommendation: 'iterate',
    });
    const exec = new Execution('validation-node');

    const result = await runDepositValidationAgent({ assetPacks: [makePack()] }, exec);

    expect(
      result.issues.filter((issue: string) => issue === 'Overlapping knowledge slices.'),
    ).toHaveLength(1);
    expect(result.recommendation).toBe('iterate');
    expect(result.qualityScore).toBe(0.4);
  }, 120000);
});
