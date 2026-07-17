/**
 * @jest-environment node
 *
 * Lightweight unit tests for the single deposit Validation ready-to-finish gate.
 * Heavy PTRR / measure / catalog graph is mocked so A/B/C merge logic is isolated.
 */
jest.mock(
  '../../../../domain/src/agents/validation/agent-measure-absolutes',
  () => ({
  analyzeStaticSource: jest.fn(() => ({
    measuredFromSamples: true,
    estimatedFunctionCount: 4,
    estimatedTypeCount: 1,
    targetFileCount: 1,
    estimatedSymbolCount: 8,
    symbolCount: 8,
    configKeyCount: 0,
    lineCount: 20,
    tokenCount: 80,
    coverageRatio: 1,
    targetLanguageBreakdown: { ts: 1 },
    moduleCount: 1,
  })),
  computeAbsolutesFromReport: jest.fn(() => [
    {
      measurementKind: 'function-count',
      label: 'Functions',
      weight: 0.12,
      volume: 0.4,
      category: 'absolute',
      magnitude: 4,
      unit: 'functions',
    },
  ]),
  measureAssetPackAbsolutes: jest.fn(async () => [
    {
      measurementKind: 'function-count',
      label: 'Functions',
      weight: 0.12,
      volume: 0.4,
      category: 'absolute',
      magnitude: 4,
      unit: 'functions',
    },
  ]),
}));

jest.mock('@bitcode/asset-packs-pipelines-syntheses-domain/asset-packs-synthesis', () => ({
  ASSET_PACK_ABSOLUTES_CATALOG: [
    { measurementKind: 'function-count', label: 'Functions', weight: 0.12 },
  ],
  projectInventoryForPrompt: (catalog: unknown) => catalog,
}));

jest.mock('@bitcode/agent-generics', () => ({
  factoryPTRRAgent: () =>
    async function mockPtrr() {
      return {
        finalOutput: {
          issues: [],
          qualityScore: 0.85,
          coverageGaps: [],
          recommendation: 'complete',
        },
      };
    },
}));

import runReady from '../agents/validation/deposit-ready-to-finish-agent';

function execStub(bag: Record<string, Record<string, unknown>>) {
  const store = new Map<string, unknown>();
  for (const [ns, entries] of Object.entries(bag)) {
    for (const [k, v] of Object.entries(entries)) store.set(`${ns}:${k}`, v);
  }
  return {
    store: (ns: string, key: string, value: unknown) => store.set(`${ns}:${key}`, value),
    get: (ns: string, key: string) => store.get(`${ns}:${key}`),
    findUp: (ns: string, key: string) => store.get(`${ns}:${key}`),
  };
}

describe('deposit-ready-to-finish-agent', () => {
  it('flags prior-phase gaps and missing measurements until attached', async () => {
    const options = [
      {
        title: 'Auth slice capability for deposit',
        summary: 'A source-safe capability describing authentication entry points for readers.',
        coveredSourcePaths: ['src/auth.ts'],
        confidence: 0.7,
        patch: {
          fileChanges: [{ path: 'src/auth.ts', op: 'modify' }],
          patchSummary: 'Auth capability material.',
        },
      },
    ];
    const exec = execStub({
      repository: { workspacePath: '/tmp/ws' },
      setup: { admission: { safe: true } },
      deposit: {
        sourceCheckoutCatalog: {
          paths: ['src/auth.ts'],
          samples: [],
          sources: [{ path: 'src/auth.ts', content: 'export function login() {}' }],
        },
        impermissibleSources: [],
      },
      discovery: {
        codebaseComprehension: { summary: 'ok' },
        depositorySearch: { summary: 'demand ok' },
      },
      implementation: { options },
    });

    const out = await runReady({}, exec);
    expect(Array.isArray(out.options?.[0]?.absolutes)).toBe(true);
    expect(out.options[0].absolutes.length).toBeGreaterThan(0);
    expect(exec.get('validation', 'readyToFinish')).toBeTruthy();
  });

  it('flags obfuscation path violations', async () => {
    const options = [
      {
        title: 'Leaks secret path capability slice',
        summary: 'A source-safe summary that still covers a withheld path incorrectly.',
        coveredSourcePaths: ['secret/keys.ts'],
        confidence: 0.5,
        patch: {
          fileChanges: [{ path: 'secret/keys.ts', op: 'modify' }],
          patchSummary: 'Should be blocked.',
        },
        absolutes: [{ measurementKind: 'function-count', volume: 0.1, weight: 0.12, label: 'F', category: 'absolute' }],
      },
    ];
    const exec = execStub({
      repository: { workspacePath: '/tmp/ws' },
      setup: {
        admission: { safe: true },
        inputComprehension: { summary: 'hide secrets', obfuscatedPaths: ['secret/'] },
      },
      deposit: {
        sourceCheckoutCatalog: { paths: ['secret/keys.ts', 'src/app.ts'], samples: [], sources: [] },
        impermissibleSources: [],
      },
      discovery: {
        codebaseComprehension: { summary: 'ok' },
        depositorySearch: { summary: 'ok' },
      },
      implementation: { options },
    });

    const out = await runReady({}, exec);
    expect(out.issues.some((i: string) => /Obfuscation|exclusion|secret/i.test(i))).toBe(true);
    expect(out.readyToFinish).toBe(false);
  });
});
