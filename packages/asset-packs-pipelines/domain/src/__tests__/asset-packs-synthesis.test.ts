jest.mock('../asset-packs-synthesis-pipeline', () => ({
  synthesizeAssetPackCandidatesFormal: jest.fn(),
}));
jest.mock('../runtime-inference-policy', () => ({
  isAssetPackRealInferenceEnabled: jest.fn(() => true),
}));

import { synthesizeAssetPackCandidatesFormal } from '../asset-packs-synthesis-pipeline';
import {
  applyExclusionsToInventory,
  applyInventoryScope,
  isPathExcluded,
  isPathForcedIncluded,
  normalizeForcedPathList,
  projectInventoryForPrompt,
  synthesizeAssetPackCandidates,
  validateDepositSynthesisOptions,
  DEPOSIT_MEASUREMENT_CATALOG,
} from '../asset-packs-synthesis';
import { buildRealDepositAssetPackOptionSynthesis } from '../deposit-option-real-synthesis';
import { assertDepositAssetPackOptionSynthesisSourceSafe } from '../deposit-asset-pack-options';

// The formal pipeline (PipelineExecution → factoryAgent → Failsafe ∘ Thinkings)
// is mocked here; its own correctness is covered by the agent-generics suites.
// These tests cover the lens contract + fail-closed validation this module owns.
const mockInference = synthesizeAssetPackCandidatesFormal as jest.Mock;
const inferenceOutcome = (options: unknown[]) => ({
  options,
  provider: 'anthropic',
  model: 'claude-sonnet-4-6',
  totalTokens: 1234,
});

const INVENTORY = {
  paths: ['README.md', 'src/app.py', 'src/utils.py', 'secret/keys.py'],
  samples: [
    { path: 'README.md', excerpt: 'A demo python project.' },
    { path: 'secret/keys.py', excerpt: 'KEY = ...' },
  ],
};

function inferenceCandidate(overrides: Record<string, unknown> = {}) {
  return {
    kind: 'capability-slice',
    title: 'Demo Python capability slice',
    summary:
      'A source-safe slice describing the demo application capability, its entry points, and operational behavior for future reading demand.',
    coveredSourcePaths: ['README.md', 'src/app.py'],
    measurements: {
      'source-coverage': 0.6,
      'demand-alignment': 0.7,
      'reuse-likelihood': 0.5,
    },
    measurementRationale:
      'Covers the primary application path and documentation, aligning with demand for runnable demo knowledge.',
    confidence: 0.8,
    ...overrides,
  };
}

describe('AssetPacksSynthesis core', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalizes exclusions and filters inventory fail-closed before inference', () => {
    const exclusions = normalizeForcedPathList('secret/\n\n  secret/  ');
    expect(exclusions).toEqual(['secret/']);

    const filtered = applyExclusionsToInventory(INVENTORY, exclusions);
    expect(filtered.paths).toEqual(['README.md', 'src/app.py', 'src/utils.py']);
    expect(filtered.samples.map((sample) => sample.path)).toEqual(['README.md']);
    expect(filtered.excludedPathCount).toBe(1);
    expect(isPathExcluded('secret/keys.py', exclusions)).toBe(true);
    expect(isPathExcluded('src/app.py', exclusions)).toBe(false);
  });

  it('scopes inventory by Forced Inclusion roots then Forced Exclusions', () => {
    const scoped = applyInventoryScope(INVENTORY, {
      inclusions: ['src/'],
      exclusions: ['src/utils.py'],
    });
    expect(scoped.paths).toEqual(['src/app.py']);
    expect(scoped.samples).toEqual([]);
    expect(scoped.excludedPathCount).toBe(3);
    expect(isPathForcedIncluded('src/app.py', ['src/'])).toBe(true);
    expect(isPathForcedIncluded('README.md', ['src/'])).toBe(false);
    // Empty inclusions leave the full tree in-scope (minus exclusions).
    expect(isPathForcedIncluded('README.md', [])).toBe(true);
  });

  it('projectInventoryForPrompt omits sources content for PTRR prompts', () => {
    const withSources = {
      ...INVENTORY,
      sources: [
        { path: 'README.md', content: 'SECRET-README-BODY' },
        { path: 'src/app.py', content: 'SECRET-APP-BODY' },
      ],
      totalPathCount: 4,
      excludedPathCount: 0,
    };
    const forPrompt = projectInventoryForPrompt(withSources);
    expect(forPrompt).toMatchObject({
      pathCount: 4,
      sourceFileCount: 2,
    });
    expect(forPrompt).not.toHaveProperty('sources');
    expect(JSON.stringify(forPrompt)).not.toContain('SECRET-');
  });

  it('re-samples prompt excerpts after Forced Inclusion empties pre-scope samples', () => {
    // Pre-scope samples only from out-of-root paths (the monorepo case).
    const provisioned = {
      paths: ['README.md', 'uapi/app.ts', 'uapi/lib.ts', 'secret/keys.py'],
      samples: [{ path: 'README.md', excerpt: 'root readme' }],
      sources: [
        { path: 'README.md', content: '# root' },
        { path: 'uapi/app.ts', content: 'export const app = 1' },
        { path: 'uapi/lib.ts', content: 'export const lib = 2' },
        { path: 'secret/keys.py', content: 'KEY=1' },
      ],
    };
    const scoped = applyInventoryScope(provisioned, {
      inclusions: ['uapi/'],
      exclusions: [],
    });
    expect(scoped.paths).toEqual(['uapi/app.ts', 'uapi/lib.ts']);
    expect(scoped.samples.length).toBeGreaterThan(0);
    expect(scoped.samples.every((s) => s.path.startsWith('uapi/'))).toBe(true);
  });

  it('maps inference candidates through the lens measurement catalog', async () => {
    mockInference.mockResolvedValue(inferenceOutcome([inferenceCandidate()]));

    const result = await synthesizeAssetPackCandidates({
      lens: 'deposit',
      repositoryFullName: 'engineeredsoftware/demo-python',
      sourceBranch: 'main',
      sourceCommit: 'abc123',
      steering: { instructions: 'demo', forcedExclusions: [], demandContext: ['demand'] },
      inventory: { ...INVENTORY, totalPathCount: 4, excludedPathCount: 0 },
      candidateKinds: ['capability-slice', 'implementation-pattern', 'proof-operations-slice'],
    });

    expect(result.candidates).toHaveLength(1);
    const [candidate] = result.candidates;
    expect(candidate.measurements.map((m) => m.measurementKind)).toEqual(
      DEPOSIT_MEASUREMENT_CATALOG.map((spec) => spec.measurementKind),
    );
    expect(candidate.measurements.map((m) => m.weight)).toEqual([0.36, 0.4, 0.24]);
    expect(candidate.measurements[0].volume).toBe(0.6);
    expect(result.droppedCandidateCount).toBe(0);
  });

  it('drops candidates that violate exclusions or reference unknown paths, fail-closed', async () => {
    mockInference.mockResolvedValue(
      inferenceOutcome([
        inferenceCandidate(),
        inferenceCandidate({ title: 'Violates exclusion boundary now', coveredSourcePaths: ['secret/keys.py'] }),
        inferenceCandidate({ title: 'References unknown paths now', coveredSourcePaths: ['made/up.py'] }),
      ]),
    );

    const result = await synthesizeAssetPackCandidates({
      lens: 'deposit',
      repositoryFullName: 'engineeredsoftware/demo-python',
      sourceBranch: 'main',
      sourceCommit: 'abc123',
      steering: { instructions: null, forcedExclusions: ['secret/'], demandContext: [] },
      inventory: { ...INVENTORY, totalPathCount: 4, excludedPathCount: 0 },
      candidateKinds: ['capability-slice'],
    });

    expect(result.candidates).toHaveLength(1);
    expect(result.droppedCandidateCount).toBe(2);
    expect(result.exclusionViolations).toHaveLength(2);
  });

  it('throws when no admissible candidates survive', async () => {
    mockInference.mockResolvedValue(
      inferenceOutcome([inferenceCandidate({ coveredSourcePaths: ['secret/keys.py'] })]),
    );

    await expect(
      synthesizeAssetPackCandidates({
        lens: 'deposit',
        repositoryFullName: 'engineeredsoftware/demo-python',
        sourceBranch: 'main',
        sourceCommit: 'abc123',
        steering: { instructions: null, forcedExclusions: ['secret/'], demandContext: [] },
        inventory: { ...INVENTORY, totalPathCount: 4, excludedPathCount: 0 },
        candidateKinds: ['capability-slice'],
      }),
    ).rejects.toThrow(/no admissible candidates/);
  });
});

describe('deposit lens adapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds a law-compatible synthesis with real measurements and exclusion posture', async () => {
    mockInference.mockResolvedValue(inferenceOutcome([inferenceCandidate()]));
    const inventory = { ...INVENTORY, totalPathCount: 4, excludedPathCount: 1 };
    const result = await synthesizeAssetPackCandidates({
      lens: 'deposit',
      repositoryFullName: 'engineeredsoftware/demo-python',
      sourceBranch: 'main',
      sourceCommit: 'abc123',
      steering: { instructions: 'demo', forcedExclusions: ['secret/'], demandContext: [] },
      inventory,
      candidateKinds: ['capability-slice'],
    });

    const { synthesis, reviewProjections } = buildRealDepositAssetPackOptionSynthesis(
      {
        repositoryFullName: 'engineeredsoftware/demo-python',
        sourceBranch: 'main',
        sourceCommit: 'abc123',
        obfuscations: 'demo',
        forcedExclusions: ['secret/'],
        createdAt: '2026-06-12T22:00:00.000Z',
      },
      result,
      inventory,
    );

    expect(synthesis.schema).toBe('bitcode.deposit.asset-pack-option-synthesis');
    expect(synthesis.pipeline).toBe('DepositAssetPackOptionSynthesis');
    expect(synthesis.synthesisMode).toBe('real-bounded-inference');
    expect(synthesis.pipelineCore).toBe('AssetPacksSynthesis');
    expect(synthesis.optionCount).toBe(1);
    expect(synthesis.options[0].measurements.map((m) => m.volume)).toEqual([0.6, 0.7, 0.5]);
    expect(synthesis.options[0].roots.optionRoot).toMatch(/^deposit-asset-pack-option:[0-9a-f]{8}$/);
    expect(synthesis.exclusionPosture.forcedExclusionCount).toBe(1);
    expect(synthesis.exclusionPosture.excludedPathCount).toBe(1);
    expect(reviewProjections[0].coveredSourcePaths).toEqual(['README.md', 'src/app.py']);
    // The deposit-decision payload: provenant source becomes available to Bitcode.
    expect(synthesis.options[0].contents?.provenantSourcePaths).toEqual(['README.md', 'src/app.py']);
    expect(synthesis.options[0].contents?.provenantSourceCount).toBe(2);
    expect(synthesis.options[0].roots.contentsRoot).toMatch(/^deposit-option-contents:[0-9a-f]{8}$/);

    const sourceSafety = assertDepositAssetPackOptionSynthesisSourceSafe(synthesis);
    expect(sourceSafety.admitted).toBe(true);
  });

  it('carries the synthesized AP contents (patch descriptor) to the option for the deposit decision', () => {
    const validated = validateDepositSynthesisOptions(
      [
        {
          kind: 'capability-slice',
          title: 'Auth capability slice',
          summary: 'A reusable authentication capability extracted from the source.',
          coveredSourcePaths: ['README.md', 'src/app.py'],
          measurements: { 'source-coverage': 0.6, 'demand-alignment': 0.7, 'reuse-likelihood': 0.5 },
          measurementRationale: 'Covers the auth path.',
          confidence: 0.8,
          // Formal absolutes (Validation measure-agent) are required — no
          // placeholder catalog fallback on the product projection path.
          absolutes: [
            {
              measurementKind: 'function-count',
              label: 'Functions',
              weight: 0.12,
              volume: 0.5,
              category: 'absolute',
              magnitude: 8,
              unit: 'functions',
            },
            {
              measurementKind: 'correctness-estimate',
              label: 'Correctness',
              weight: 0.18,
              volume: 0.7,
              category: 'absolute',
              unit: 'estimate',
            },
          ],
          patch: {
            fileChanges: [
              { path: 'src/app.py', op: 'modify' },
              { path: 'README.md', op: 'create' },
            ],
            patchSummary: 'Encodes the auth capability and its entry points.',
          },
        },
      ],
      {
        lens: 'deposit',
        inventoryPaths: ['README.md', 'src/app.py'],
        forcedExclusions: [],
        candidateKinds: ['capability-slice'],
      },
    );
    expect(validated.candidates[0].patch?.fileChanges).toHaveLength(2);

    const { synthesis } = buildRealDepositAssetPackOptionSynthesis(
      { repositoryFullName: 'engineeredsoftware/demo-python', sourceBranch: 'main', sourceCommit: 'abc123', createdAt: '2026-06-12T22:00:00.000Z' },
      { lens: 'deposit', candidates: validated.candidates, droppedCandidateCount: 0, exclusionViolations: [], inference: { provider: null, model: null, totalTokens: null, durationMs: 1 } },
      { paths: ['README.md', 'src/app.py'], samples: [], totalPathCount: 2, excludedPathCount: 0 },
    );
    const contents = synthesis.options[0].contents!;
    expect(contents.patchSummary).toBe('Encodes the auth capability and its entry points.');
    expect(contents.fileChanges).toEqual([
      { path: 'src/app.py', op: 'modify' },
      { path: 'README.md', op: 'create' },
    ]);
    expect(contents.provenantSourcePaths).toEqual(['README.md', 'src/app.py']);
    // The contents are source-safe (path+op + summary + the depositor's own paths).
    expect(assertDepositAssetPackOptionSynthesisSourceSafe(synthesis).admitted).toBe(true);
  });
});
