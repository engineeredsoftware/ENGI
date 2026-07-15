// @ts-nocheck
// Inference is non-configurable (F26-A): the deposit Implementation agent ALWAYS
// runs the formal PTRR hierarchy. Determinism comes from mocking the LLM provider
// at the boundary — never from branches inside the pipeline.
jest.mock('@bitcode/generic-llms', () => require('./support/generic-llms-mock').makeGenericLLMsMock());

import { Execution } from '@bitcode/execution-generics';
import { AgentExecution } from '@bitcode/agent-generics';
import runDepositAssetPackSynthesisAgent from '../agents/implementation/deposit-asset-pack-synthesis-agent';
import { setBoundaryLLMOutput, resetBoundaryLLMOutput } from './support/generic-llms-mock';

const VALID_OPS = new Set(['create', 'modify', 'delete']);

/** Two schema-valid deposit AssetPack options the boundary LLM "synthesizes". */
const MOCK_OPTIONS = [
  {
    kind: 'capability-slice',
    title: 'Session auth capability slice',
    summary:
      'A bounded, source-safe capability slice covering session authentication and token refresh flows.',
    coveredSourcePaths: ['src/auth/session.ts', 'src/auth/token.ts'],
    measurementRationale: 'Covers the complete auth module knowledge with reusable session handling.',
    confidence: 0.82,
    patch: {
      fileChanges: [
        { path: 'src/auth/session.ts', op: 'modify' },
        { path: 'src/auth/refresh.ts', op: 'create' },
      ],
      patchSummary: 'Encodes the session lifecycle knowledge and its refresh entry points.',
    },
  },
  {
    kind: 'implementation-pattern',
    title: 'Retry-with-backoff implementation pattern',
    summary:
      'A reusable implementation pattern for resilient retries with jittered exponential backoff over transport calls.',
    coveredSourcePaths: ['src/net/retry.ts'],
    measurementRationale: 'Bounded pattern knowledge that transfers to any transport layer.',
    confidence: 0.74,
    patch: {
      fileChanges: [{ path: 'src/net/legacy-retry.ts', op: 'delete' }],
      patchSummary: 'Encodes the resilient retry pattern replacing the legacy retry helper.',
    },
  },
];

const INPUT = {
  inventory: {
    paths: ['src/auth/session.ts', 'src/auth/token.ts', 'src/net/retry.ts'],
    samples: [],
  },
  impermissibleSources: ['src/protected'],
};

describe('runDepositAssetPackSynthesisAgent (boundary-mocked PTRR)', () => {
  beforeEach(() => setBoundaryLLMOutput({ options: MOCK_OPTIONS }));
  afterEach(() => resetBoundaryLLMOutput());

  it('synthesizes deposit AssetPack options matching the candidate-set contract', async () => {
    const exec = new Execution('implementation-node');
    const out = await runDepositAssetPackSynthesisAgent(INPUT, exec);

    expect(out.success).toBe(true);
    expect(out.semanticKind).toBe('asset-pack-written-asset');
    expect(out.summary).toBe(
      'Synthesized 2 measured deposit AssetPack(s) (patch + measurements + metadata).',
    );
    expect(Array.isArray(out.options)).toBe(true);
    expect(out.options.length).toBeGreaterThanOrEqual(1);
    expect(out.options.length).toBeLessThanOrEqual(4);

    for (const option of out.options) {
      // The measured option fields.
      expect(typeof option.title).toBe('string');
      expect(option.title.length).toBeGreaterThanOrEqual(8);
      expect(typeof option.summary).toBe('string');
      expect(option.coveredSourcePaths.length).toBeGreaterThanOrEqual(1);
      expect(option.confidence).toBeGreaterThanOrEqual(0);
      expect(option.confidence).toBeLessThanOrEqual(1);
      // Nested measurement kinds: absolutes required; needinesses empty on deposit.
      expect(Array.isArray(option.measurements?.absolutes)).toBe(true);
      expect(option.measurements.absolutes.length).toBeGreaterThan(0);
      expect(option.measurements.needinesses).toEqual([]);
      for (const row of option.measurements.absolutes) {
        expect(row.volume).toBeGreaterThanOrEqual(0);
        expect(row.volume).toBeLessThanOrEqual(1);
        expect(typeof row.magnitude).toBe('number');
      }
      // The SOURCE-SAFE patch descriptor: non-empty path+op fileChanges + summary.
      expect(Array.isArray(option.patch.fileChanges)).toBe(true);
      expect(option.patch.fileChanges.length).toBeGreaterThanOrEqual(1);
      for (const change of option.patch.fileChanges) {
        expect(typeof change.path).toBe('string');
        expect(VALID_OPS.has(change.op)).toBe(true);
      }
      expect(typeof option.patch.patchSummary).toBe('string');
      expect(option.patch.patchSummary.length).toBeGreaterThan(0);
      // Deposit must not carry neediness.
      expect(option.needinessSignal).toBeUndefined();
    }

    // Envelope unwrap (F27): reading `.options` off the returned output must yield
    // the boundary-mocked candidates, not undefined-off-the-envelope.
    expect(out.options.map((o: any) => o.title)).toEqual(MOCK_OPTIONS.map((o) => o.title));
  }, 120000);

  it('stores the SAME options array under implementation:options AND implementation:assetPacks (plus assetPack/summary)', async () => {
    const exec = new Execution('implementation-node');
    const out = await runDepositAssetPackSynthesisAgent(INPUT, exec);

    const options = exec.get('implementation', 'options');
    const assetPacks = exec.get('implementation', 'assetPacks');
    expect(options).toBe(out.options); // same reference as the returned output
    expect(assetPacks).toBe(options); // the SAME array under both keys
    expect(exec.get('implementation', 'assetPack')).toEqual(out.assetPack);
    expect(exec.get('implementation', 'summary')).toBe(
      'Synthesized 2 measured deposit AssetPack(s) (patch + measurements + metadata).',
    );
  }, 120000);

  it('returns success output on a plain Execution without a tool registry (optional-chaining path)', async () => {
    const exec = new Execution('implementation-node'); // no .tools registry
    const out = await runDepositAssetPackSynthesisAgent(INPUT, exec);

    expect(out.success).toBe(true);
    // Without a registry the patch descriptors pass through unchanged.
    expect(out.options[0].patch.fileChanges).toEqual(MOCK_OPTIONS[0].patch.fileChanges);
    expect(out.options[1].patch.fileChanges).toEqual(MOCK_OPTIONS[1].patch.fileChanges);
  }, 120000);

  it('records each patch through the formal AssetPackPatchWriteTool with a path/op-only, source-safe descriptor', async () => {
    const exec = new AgentExecution('implementation-node');
    const out = await runDepositAssetPackSynthesisAgent(INPUT, exec);

    // The agent registered the tool on the execution's registry and invoked it.
    expect(exec.tools.getTool('asset-pack-patch-write')).toBeDefined();

    // ExecutionTool.execute persists args + result into the tool child execution;
    // both MUST be path/op-only (never content, code, or diffs) — that is the
    // source-safety invariant of the code-edit primitive. (Children register in
    // the map under their fully-qualified id, so locate the tool node by suffix.)
    const toolExec = [...exec.children.values()].find((child) =>
      child.id.endsWith('/tool:AssetPackPatchWriteTool'),
    );
    expect(toolExec).toBeDefined();
    const recordedInput = toolExec.get('tool', 'input');
    const recordedResult = toolExec.get('tool', 'result');
    expect(Array.isArray(recordedInput)).toBe(true);
    expect(Object.keys(recordedInput[0]).sort()).toEqual(['assetPackTitle', 'fileChanges']);
    for (const change of recordedInput[0].fileChanges) {
      expect(Object.keys(change).sort()).toEqual(['op', 'path']);
    }
    expect(recordedResult.materialized).toBe(false); // records, does not fs-write
    for (const change of recordedResult.fileChanges) {
      expect(Object.keys(change).sort()).toEqual(['op', 'path']);
    }
    const persisted = JSON.stringify({ recordedInput, recordedResult });
    expect(persisted).not.toContain('"content"');
    expect(persisted).not.toContain('"diff"');

    // The option's fileChanges were replaced with the tool's returned descriptor
    // (path + op only, no materialized flag on the option itself).
    for (const option of out.options) {
      for (const change of option.patch.fileChanges) {
        expect(Object.keys(change).sort()).toEqual(['op', 'path']);
      }
    }
    expect(out.options[0].patch.fileChanges).toEqual(MOCK_OPTIONS[0].patch.fileChanges);
  }, 120000);
});
