// @ts-nocheck
// Deposit Implementation agents 1/2 + 2/2 — boundary-mocked PTRR for patchfile;
// host measure path for absolutes.
//
// Product law:
//   deposit AP = patchfile + absolutes + metadata
//   neediness is Read-only
//   salvage is never presentable
jest.mock('@bitcode/generic-llms', () => require('./support/generic-llms-mock').makeGenericLLMsMock());

import { Execution } from '@bitcode/execution-generics';
import { AgentExecution } from '@bitcode/agent-generics';
import runDepositImplementationAgentAssetPacksPatchfileSynthesis from '../agents/implementation/deposit-implementation-agent-asset-packs-patchfile-synthesis';
import runDepositImplementationAgentAssetPacksMeasurementsSynthesis from '../agents/implementation/deposit-implementation-agent-asset-packs-measurements-synthesis';
import { isDepositPresentablePack } from '../agents/implementation/deposit-implementation-pack-types';
import { setBoundaryLLMOutput, resetBoundaryLLMOutput } from './support/generic-llms-mock';

const VALID_OPS = new Set(['create', 'modify', 'delete']);

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
    confidence: 0.74,
    patch: {
      fileChanges: [{ path: 'src/net/retry.ts', op: 'modify' }],
      patchSummary: 'Encodes the resilient retry pattern.',
    },
  },
];

const INPUT = {
  inventory: {
    paths: ['src/auth/session.ts', 'src/auth/token.ts', 'src/auth/refresh.ts', 'src/net/retry.ts'],
    samples: [],
  },
  impermissibleSources: ['src/protected'],
};

function seedCatalog(exec) {
  exec.store('deposit', 'sourceCheckoutCatalog', {
    paths: INPUT.inventory.paths,
    samples: [],
    sources: INPUT.inventory.paths.map((path) => ({
      path,
      content: `// ${path}\nexport function f() {}\n`,
    })),
  });
}

async function runFullImplementation(input, exec) {
  seedCatalog(exec);
  const patched = await runDepositImplementationAgentAssetPacksPatchfileSynthesis(input, exec);
  return runDepositImplementationAgentAssetPacksMeasurementsSynthesis(patched, exec);
}

describe('deposit-implementation-agent-asset-packs-patchfile-synthesis', () => {
  beforeEach(() => setBoundaryLLMOutput({ options: MOCK_OPTIONS }));
  afterEach(() => resetBoundaryLLMOutput());

  it('synthesizes patchfile+metadata only (no measurements) for each AssetPack', async () => {
    const exec = new Execution('implementation-node');
    seedCatalog(exec);
    const out = await runDepositImplementationAgentAssetPacksPatchfileSynthesis(INPUT, exec);

    expect(out.success).toBe(true);
    expect(out.semanticKind).toBe('asset-pack-patchfile-synthesized');
    expect(out.measured).toBe(false);
    expect(out.salvaged).toBe(false);
    expect(out.presentable).toBeUndefined();
    expect(Array.isArray(out.options)).toBe(true);
    expect(out.options.length).toBe(2);

    for (const option of out.options) {
      expect(option.measurements).toBeUndefined();
      expect(option.absolutes).toBeUndefined();
      expect(option.salvaged).toBeUndefined();
      expect(Array.isArray(option.patch.fileChanges)).toBe(true);
      for (const change of option.patch.fileChanges) {
        expect(VALID_OPS.has(change.op) || typeof change.op === 'string').toBe(true);
      }
    }
    expect(exec.get('implementation', 'measured')).toBe(false);
    expect(exec.get('implementation', 'presentable')).toBe(false);
  }, 120000);

  it('records each patchfile through AssetPackPatchWriteTool', async () => {
    const exec = new AgentExecution('implementation-node');
    seedCatalog(exec);
    await runDepositImplementationAgentAssetPacksPatchfileSynthesis(INPUT, exec);
    expect(exec.tools.getTool('asset-pack-patch-write')).toBeDefined();
  }, 120000);
});

describe('deposit-implementation-agent-asset-packs-measurements-synthesis', () => {
  beforeEach(() => setBoundaryLLMOutput({ options: MOCK_OPTIONS }));
  afterEach(() => resetBoundaryLLMOutput());

  it('measures each patchfile and attaches measurements.absolutes only', async () => {
    const exec = new Execution('implementation-node');
    const out = await runFullImplementation(INPUT, exec);

    expect(out.success).toBe(true);
    expect(out.measured).toBe(true);
    expect(out.presentable).toBe(true);
    expect(out.salvaged).toBe(false);
    expect(out.summary).toMatch(/presentable deposit AssetPack/);

    for (const option of out.options) {
      expect(Array.isArray(option.measurements?.absolutes)).toBe(true);
      expect(option.measurements.absolutes.length).toBeGreaterThan(0);
      expect(option.measurements).not.toHaveProperty('needinesses');
      expect(option.needinessSignal).toBeUndefined();
      expect(isDepositPresentablePack(option)).toBe(true);
      for (const row of option.measurements.absolutes) {
        expect(row.volume).toBeGreaterThanOrEqual(0);
        expect(row.volume).toBeLessThanOrEqual(1);
        expect(typeof row.magnitude).toBe('number');
      }
    }

    expect(exec.get('implementation', 'measured')).toBe(true);
    expect(exec.get('implementation', 'presentable')).toBe(true);
    const reports = exec.get('implementation', 'measurementReports');
    expect(reports).toHaveLength(2);
    expect(reports.every((r) => r.ok && r.depositShapeOk)).toBe(true);
  }, 120000);

  it('returns success on plain Execution without tool registry', async () => {
    const exec = new Execution('implementation-node');
    const out = await runFullImplementation(INPUT, exec);
    expect(out.success).toBe(true);
    expect(out.options.length).toBe(2);
  }, 120000);
});
