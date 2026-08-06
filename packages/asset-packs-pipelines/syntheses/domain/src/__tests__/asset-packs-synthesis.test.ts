jest.mock('../asset-packs-synthesis-pipeline', () => ({
  synthesizeAssetPackCandidatesFormal: jest.fn(),
}));
jest.mock('../runtime-inference-policy', () => ({
  isAssetPackRealInferenceEnabled: jest.fn(() => true),
}));

import { synthesizeAssetPackCandidatesFormal } from '../asset-packs-synthesis-pipeline';
import {
  applyInventoryScope,
  isPathImpermissible,
  isPathPermissible,
  normalizeSourcePathList,
  projectInventoryForPrompt,
  projectInventoryForSynthesisProvider,
  synthesizeAssetPackCandidates,
  validateDepositSynthesisOptions,
} from '../asset-packs-synthesis';
import { buildRealDepositAssetPackOptionSynthesis } from '../../../deposit/src/deposit-option-real-synthesis';
import { assertDepositAssetPackOptionSynthesisSourceSafe } from '../../../deposit/src/deposit-asset-pack-options';

// The formal pipeline (ExecutionPipeline → factoryAgent → Failsafe ∘ Thinkings)
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
    synthesisRationale:
      'Covers the primary application path and documentation, aligning with demand for runnable demo knowledge.',
    confidence: 0.8,
    ...overrides,
  };
}

describe('AssetPacksSynthesis core', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalizes impermissible sources and filters inventory fail-closed before inference', () => {
    const impermissibleSources = normalizeSourcePathList('secret/\n\n  secret/  ');
    expect(impermissibleSources).toEqual(['secret/']);

    const filtered = applyInventoryScope(INVENTORY, { impermissibleSources });
    expect(filtered.paths).toEqual(['README.md', 'src/app.py', 'src/utils.py']);
    expect(filtered.samples.map((sample) => sample.path)).toEqual(['README.md']);
    expect(filtered.excludedPathCount).toBe(1);
    expect(isPathImpermissible('secret/keys.py', impermissibleSources)).toBe(true);
    expect(isPathImpermissible('src/app.py', impermissibleSources)).toBe(false);
  });

  it('scopes inventory by Permissible sources roots then Impermissible sources', () => {
    const scoped = applyInventoryScope(INVENTORY, {
      permissibleSources: ['src/'],
      impermissibleSources: ['src/utils.py'],
    });
    expect(scoped.paths).toEqual(['src/app.py']);
    expect(scoped.samples).toEqual([]);
    expect(scoped.excludedPathCount).toBe(3);
    expect(isPathPermissible('src/app.py', ['src/'])).toBe(true);
    expect(isPathPermissible('README.md', ['src/'])).toBe(false);
    // Empty permissible sources leave the full tree in-scope (minus impermissible).
    expect(isPathPermissible('README.md', [])).toBe(true);
  });

  it('projectInventoryForPrompt is path/sample-only (lightweight)', () => {
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

  it('projectInventoryForSynthesisProvider includes real file bodies for LLMs', () => {
    const withSources = {
      ...INVENTORY,
      sources: [
        { path: 'README.md', content: 'REAL-README-BODY' },
        { path: 'src/app.py', content: 'REAL-APP-BODY' },
      ],
      totalPathCount: 4,
      excludedPathCount: 0,
    };
    const forSynth = projectInventoryForSynthesisProvider(withSources);
    expect(forSynth?.disclosureNote).toMatch(/SYNTHESIS_PROVIDER_INPUT/i);
    expect(forSynth?.sources?.length).toBeGreaterThanOrEqual(2);
    expect(JSON.stringify(forSynth)).toContain('REAL-README-BODY');
    expect(JSON.stringify(forSynth)).toContain('REAL-APP-BODY');
    expect(forSynth?.sourcesIncluded).toBeGreaterThanOrEqual(2);
  });

  it('re-samples prompt excerpts after Permissible sources empties pre-scope samples', () => {
    // Pre-scope samples only from out-of-root paths (the monorepo case).
    const provisioned = {
      paths: ['README.md', 'apps/uapi/app.ts', 'apps/uapi/lib.ts', 'secret/keys.py'],
      samples: [{ path: 'README.md', excerpt: 'root readme' }],
      sources: [
        { path: 'README.md', content: '# root' },
        { path: 'apps/uapi/app.ts', content: 'export const app = 1' },
        { path: 'apps/uapi/lib.ts', content: 'export const lib = 2' },
        { path: 'secret/keys.py', content: 'KEY=1' },
      ],
    };
    const scoped = applyInventoryScope(provisioned, {
      permissibleSources: ['apps/uapi/'],
      impermissibleSources: [],
    });
    expect(scoped.paths).toEqual(['apps/uapi/app.ts', 'apps/uapi/lib.ts']);
    expect(scoped.samples.length).toBeGreaterThan(0);
    expect(scoped.samples.every((s) => s.path.startsWith('apps/uapi/'))).toBe(true);
  });

  it('admits candidates without inventing absolute measurement volumes', async () => {
    mockInference.mockResolvedValue(inferenceOutcome([inferenceCandidate()]));

    const result = await synthesizeAssetPackCandidates({
      lens: 'deposit',
      repositoryFullName: 'engineeredsoftware/demo-python',
      sourceBranch: 'main',
      sourceCommit: 'abc123',
      steering: { instructions: 'demo', impermissibleSources: [], demandContext: ['demand'] },
      inventory: { ...INVENTORY, totalPathCount: 4, excludedPathCount: 0 },
      candidateKinds: ['capability-slice', 'implementation-pattern', 'proof-operations-slice'],
    });

    expect(result.candidates).toHaveLength(1);
    const [candidate] = result.candidates;
    // Host measure stack attaches DATA_PACK_ABSOLUTES_CATALOG; synthesis leaves empty.
    expect(candidate.measurements).toEqual([]);
    expect(candidate.measurementRationale).toMatch(/primary application path/i);
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
      steering: { instructions: null, impermissibleSources: ['secret/'], demandContext: [] },
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
        steering: { instructions: null, impermissibleSources: ['secret/'], demandContext: [] },
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
      steering: { instructions: 'demo', impermissibleSources: ['secret/'], demandContext: [] },
      inventory,
      candidateKinds: ['capability-slice'],
    });

    const { synthesis, reviewProjections } = buildRealDepositAssetPackOptionSynthesis(
      {
        repositoryFullName: 'engineeredsoftware/demo-python',
        sourceBranch: 'main',
        sourceCommit: 'abc123',
        obfuscations: 'demo',
        impermissibleSources: ['secret/'],
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
    // Formal synthesis no longer invents policy volumes; host measure stack attaches absolutes.
    expect(synthesis.options[0].measurements).toEqual([]);
    expect(synthesis.options[0].roots.optionRoot).toMatch(/^deposit-asset-pack-option:[0-9a-f]{8}$/);
    expect(synthesis.exclusionPosture.impermissibleSourceCount).toBe(1);
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
          synthesisRationale: 'Covers the primary application path with source-safe summary.',
          measurementRationale: 'Covers the auth path.',
          confidence: 0.8,
          // Formal absolutes (Implementation measure path) are required — no
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
        impermissibleSources: [],
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

  it('rehydrates modify bodies from checkout and preserves commercial + artifact bodies', () => {
    const appBody = 'def main():\n    return "auth"\n';
    const createBody = '# Auth notes\nSession lifecycle for deposit.\n';
    const validated = validateDepositSynthesisOptions(
      [
        {
          kind: 'capability-slice',
          title: 'Auth capability slice',
          summary: 'A reusable authentication capability extracted from the source.',
          coveredSourcePaths: ['src/app.py'],
          measurementRationale: 'Covers the auth path.',
          confidence: 0.8,
          commercialTitle: 'Session auth knowledge pack',
          commercialDescription:
            'Buyer-facing description of session auth capability with real module behavior and measurement posture for purchase consideration on the exchange.',
          absolutes: [
            {
              measurementKind: 'function-count',
              label: 'Functions',
              weight: 0.12,
              volume: 0.5,
              category: 'absolute',
              magnitude: 2,
              unit: 'functions',
              status: 'measured',
              descriptor: 'Two functions in the auth surface.',
            },
          ],
          // Path-only on patch (simulates lost content) — rehydrate from inventory + artifact.
          patch: {
            fileChanges: [
              { path: 'src/app.py', op: 'modify' },
              { path: 'docs/auth.md', op: 'create' },
            ],
            patchSummary: 'Auth capability patch.',
          },
          patchArtifact: {
            artifactId: 'artifact-patch-test',
            format: 'unified-diff',
            bodiesComplete: true,
            files: [
              { path: 'src/app.py', op: 'modify', body: appBody },
              { path: 'docs/auth.md', op: 'create', body: createBody },
            ],
            unifiedDiff: null,
          },
        },
      ],
      {
        lens: 'deposit',
        inventoryPaths: ['src/app.py', 'docs/auth.md'],
        impermissibleSources: [],
        candidateKinds: ['capability-slice'],
      },
    );
    expect(validated.candidates[0].patch?.fileChanges?.[0]).toMatchObject({
      path: 'src/app.py',
      op: 'modify',
      content: appBody,
    });
    expect(validated.candidates[0].commercialTitle).toBe('Session auth knowledge pack');
    expect(validated.candidates[0].measurements[0].status).toBe('measured');

    const { synthesis } = buildRealDepositAssetPackOptionSynthesis(
      {
        repositoryFullName: 'engineeredsoftware/demo-python',
        sourceBranch: 'main',
        sourceCommit: 'abc123',
        createdAt: '2026-06-12T22:00:00.000Z',
      },
      {
        lens: 'deposit',
        candidates: validated.candidates,
        droppedCandidateCount: 0,
        exclusionViolations: [],
        inference: { provider: null, model: null, totalTokens: null, durationMs: 1 },
      },
      {
        paths: ['src/app.py', 'docs/auth.md'],
        samples: [],
        sources: [{ path: 'src/app.py', content: appBody }],
        totalPathCount: 2,
        excludedPathCount: 0,
      },
    );
    const contents = synthesis.options[0].contents!;
    expect(contents.fileChanges.find((f) => f.path === 'src/app.py')?.content).toBe(appBody);
    expect(contents.fileChanges.find((f) => f.path === 'docs/auth.md')?.content).toBe(createBody);
    expect(contents.unifiedDiff).toContain('diff --git');
    expect(contents.unifiedDiff).toContain('+def main():');
    expect(synthesis.options[0].title).toBe('Session auth knowledge pack');
    expect(synthesis.options[0].summary).toContain('Buyer-facing description');
  });
});
