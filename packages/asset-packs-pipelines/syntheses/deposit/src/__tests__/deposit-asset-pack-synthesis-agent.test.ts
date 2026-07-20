// @ts-nocheck
// Deposit Implementation: patch-plan → patchfile write → measurements.
jest.mock('@bitcode/generic-llms', () => require('./support/generic-llms-mock').makeGenericLLMsMock());

import { Execution } from '@bitcode/execution-generics';
import runPatchPlan from '../agents/implementation/deposit-implementation-agent-asset-packs-patch-plan';
import runPatchfile from '../agents/implementation/deposit-implementation-agent-asset-packs-patchfile';
import runMeasurements from '../agents/implementation/deposit-implementation-agent-asset-packs-measurements-synthesis';
import { isDepositPresentablePack, hasPatchArtifact } from '../agents/implementation/deposit-implementation-pack-types';
import { setBoundaryLLMOutput, resetBoundaryLLMOutput } from './support/generic-llms-mock';

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

const PATHS = ['src/auth/session.ts', 'src/auth/token.ts', 'src/net/retry.ts'];
const INPUT = {
  inventory: { paths: PATHS, samples: [] },
  impermissibleSources: ['src/protected'],
};

function seedCatalog(exec) {
  exec.store('deposit', 'sourceCheckoutCatalog', {
    paths: PATHS,
    samples: [],
    sources: PATHS.map((path) => ({ path, content: `// ${path}\nexport function f() {}\n` })),
  });
}

async function runFull(input, exec) {
  seedCatalog(exec);
  const planned = await runPatchPlan(input, exec);
  const written = await runPatchfile(planned, exec);
  return runMeasurements(written, exec);
}

describe('patch-plan agent', () => {
  beforeEach(() => setBoundaryLLMOutput({ options: MOCK_OPTIONS }));
  afterEach(() => resetBoundaryLLMOutput());

  it('emits six-field descriptors without patchArtifact', async () => {
    const exec = new Execution('implementation-node');
    seedCatalog(exec);
    const out = await runPatchPlan(INPUT, exec);
    expect(out.success).toBe(true);
    expect(out.semanticKind).toBe('asset-pack-patch-plan');
    expect(out.patchfileWritten).toBe(false);
    for (const o of out.options) {
      expect(o.patchArtifact).toBeUndefined();
      expect(o.measurements).toBeUndefined();
      expect(o.patch.fileChanges.length).toBeGreaterThan(0);
    }
  }, 120000);
});

describe('patchfile write agent', () => {
  beforeEach(() => setBoundaryLLMOutput({ options: MOCK_OPTIONS }));
  afterEach(() => resetBoundaryLLMOutput());

  it('writes one AssetPackPatchArtifact per planned pack (7th field)', async () => {
    const exec = new Execution('implementation-node');
    seedCatalog(exec);
    const planned = await runPatchPlan(INPUT, exec);
    const written = await runPatchfile(planned, exec);
    expect(written.success).toBe(true);
    expect(written.patchfileWritten).toBe(true);
    expect(written.patchArtifacts).toHaveLength(2);
    const ids = new Set();
    for (const o of written.options) {
      expect(hasPatchArtifact(o)).toBe(true);
      expect(o.patchArtifact.format).toMatch(/path-op-json|json/i);
      expect(o.patchArtifact.files.length).toBe(o.patch.fileChanges.length);
      expect(o.patchArtifact.envelopeJson).toContain(o.patchArtifact.artifactId);
      ids.add(o.patchArtifact.artifactId);
    }
    expect(ids.size).toBe(2);
    expect(exec.get('implementation', 'patchfileWritten')).toBe(true);
  }, 120000);
});

describe('full Implementation: plan → write → measure', () => {
  beforeEach(() => setBoundaryLLMOutput({ options: MOCK_OPTIONS }));
  afterEach(() => resetBoundaryLLMOutput());

  it('yields presentable packs with artifact + absolutes only', async () => {
    const exec = new Execution('implementation-node');
    const out = await runFull(INPUT, exec);
    expect(out.success).toBe(true);
    expect(out.measured).toBe(true);
    expect(out.presentable).toBe(true);
    for (const o of out.options) {
      expect(hasPatchArtifact(o)).toBe(true);
      expect(Object.keys(o.measurements)).toEqual(['absolutes']);
      expect(isDepositPresentablePack(o)).toBe(true);
    }
    expect(out.measurementReports.every((r) => r.hasPatchArtifact && r.ok)).toBe(true);
  }, 120000);
});
