// @ts-nocheck
// Boundary determinism (F26-A): the real-inference path always runs the formal
// measure-agent PTRR hierarchy; the ONLY sanctioned test seam is the boundary
// LLM mock. The inference switch is mocked to a mutable flag so this file can
// exercise BOTH the deterministic and the real (boundary-mocked) paths.
let mockRealInference = false;
jest.mock('../runtime-inference-policy', () => ({
  isAssetPackRealInferenceEnabled: () => mockRealInference,
}));
jest.mock('@bitcode/generic-llms', () => require('./support/generic-llms-mock').makeGenericLLMsMock());

import { Execution } from '@bitcode/execution-generics';
import {
  computeDeterministicAbsolutes,
  computeAbsolutesFromReport,
  mapReadingsToAbsoluteMeasurements,
  mergeReportAndReadings,
  measureAssetPackAbsolutes,
  factoryAssetPackMeasureAbsolutesAgent,
  type MeasurableAssetPackPatch,
} from '../agents/validation/agent-measure-absolutes';
import { SourceStaticAnalysisTool } from '../agents/validation/source-static-analysis-tool';
import {
  ASSET_PACK_ABSOLUTES_CATALOG,
  ASSET_PACK_ABSOLUTE_KINDS,
  validateDepositSynthesisOptions,
} from '../asset-packs-synthesis';
import { setBoundaryLLMOutput, resetBoundaryLLMOutput } from './support/generic-llms-mock';

const PATCH: MeasurableAssetPackPatch = {
  title: 'Auth capability slice',
  summary: 'A bounded capability covering session auth and token refresh.',
  coveredSourcePaths: ['src/auth/session.ts', 'src/auth/token.ts', 'src/auth/index.ts'],
  fileChanges: [
    { path: 'src/auth/session.ts', op: 'modify' },
    { path: 'src/auth/token.ts', op: 'create' },
  ],
  confidence: 0.82,
};

describe('agent-measure-absolutes', () => {
  it('absolutes catalog weights sum to 1', () => {
    const total = ASSET_PACK_ABSOLUTES_CATALOG.reduce((sum, spec) => sum + spec.weight, 0);
    expect(Number(total.toFixed(4))).toBe(1);
  });

  it('deterministic absolutes return the full catalog, category=absolute, sizes carry magnitudes', () => {
    const measurements = computeDeterministicAbsolutes(PATCH);
    expect(measurements.map((m) => m.measurementKind).sort()).toEqual([...ASSET_PACK_ABSOLUTE_KINDS].sort());
    for (const m of measurements) {
      expect(m.category).toBe('absolute');
      expect(m.volume).toBeGreaterThanOrEqual(0);
      expect(m.volume).toBeLessThanOrEqual(1);
    }
    const fileSpan = measurements.find((m) => m.measurementKind === 'file-span');
    expect(fileSpan?.magnitude).toBe(2); // two fileChanges
    expect(fileSpan?.unit).toBe('files');
    const correctness = measurements.find((m) => m.measurementKind === 'correctness-estimate');
    expect(correctness?.volume).toBe(0.82); // = confidence
    expect(correctness?.magnitude).toBeUndefined(); // estimate unit carries no magnitude
  });

  it('maps agent readings onto the catalog and falls back per-missing-reading', () => {
    const readings = [
      { measurementKind: 'function-count', volume: 0.5, magnitude: 20 },
      { measurementKind: 'semantic-volume', volume: 0.66 },
      // type-count, file-span, correctness-estimate omitted -> deterministic fallback
    ];
    const measurements = mapReadingsToAbsoluteMeasurements(readings, PATCH);
    expect(measurements).toHaveLength(ASSET_PACK_ABSOLUTES_CATALOG.length);
    const fn = measurements.find((m) => m.measurementKind === 'function-count');
    expect(fn?.volume).toBe(0.5);
    expect(fn?.magnitude).toBe(20);
    const sem = measurements.find((m) => m.measurementKind === 'semantic-volume');
    expect(sem?.volume).toBe(0.66);
    // omitted file-span falls back to the deterministic exact count (2)
    const fileSpan = measurements.find((m) => m.measurementKind === 'file-span');
    expect(fileSpan?.magnitude).toBe(2);
  });

  it('builds a lens-parameterized measurer agent', () => {
    const deposit = factoryAssetPackMeasureAbsolutesAgent('deposit');
    const read = factoryAssetPackMeasureAbsolutesAgent('read');
    expect(deposit.name).toBe('AssetPackMeasureAbsolutesAgent:deposit');
    expect(read.name).toBe('AssetPackMeasureAbsolutesAgent:read');
    expect(deposit.measurementCategory).toBe('absolute');
    expect(deposit.measurementSpecs).toHaveLength(ASSET_PACK_ABSOLUTES_CATALOG.length);
  });
});

describe('validateDepositSynthesisOptions absolutes wiring', () => {
  const baseOption = {
    kind: 'capability-slice',
    title: 'Auth capability slice',
    summary: 'A reusable authentication capability extracted from the source.',
    coveredSourcePaths: ['src/auth.ts'],
    measurements: { 'source-coverage': 0.7, 'demand-alignment': 0.6, 'reuse-likelihood': 0.5 },
    measurementRationale: 'Covers the auth module.',
    confidence: 0.8,
  };
  const context = {
    lens: 'deposit' as const,
    inventoryPaths: ['src/auth.ts'],
    protectedIpExclusions: [],
    candidateKinds: ['capability-slice', 'implementation-pattern', 'proof-operations-slice'],
  };

  it('prefers the formal absolutes over the placeholder catalog', () => {
    const absolutes = [
      { measurementKind: 'function-count', label: 'Functions', weight: 0.18, volume: 0.5, category: 'absolute', magnitude: 12, unit: 'functions' },
      { measurementKind: 'semantic-volume', label: 'Semantic volume', weight: 0.28, volume: 0.66, category: 'absolute', unit: 'normalized' },
    ];
    const out = validateDepositSynthesisOptions([{ ...baseOption, absolutes }], context);
    const measurements = out.candidates[0].measurements;
    expect(measurements.map((m) => m.measurementKind)).toEqual(['function-count', 'semantic-volume']);
    const fn = measurements.find((m) => m.measurementKind === 'function-count');
    expect(fn?.magnitude).toBe(12);
    expect(fn?.category).toBe('absolute');
    expect(fn?.unit).toBe('functions');
    // placeholder kinds are NOT present once formal absolutes are supplied
    expect(measurements.map((m) => m.measurementKind)).not.toContain('source-coverage');
  });

  it('falls back to the placeholder catalog when no absolutes are present', () => {
    const out = validateDepositSynthesisOptions([baseOption], context);
    const kinds = out.candidates[0].measurements.map((m) => m.measurementKind);
    expect(kinds).toContain('source-coverage');
    expect(kinds).toContain('demand-alignment');
    expect(kinds).toContain('reuse-likelihood');
  });
});

describe('tool-grounded absolutes (legitimate static-analysis sizes)', () => {
  it('measures sizes from real static analysis when sources are provided', async () => {
    const patch: MeasurableAssetPackPatch = {
      title: 'Auth slice',
      summary: 'auth capability',
      coveredSourcePaths: ['a.ts'],
      fileChanges: [{ path: 'a.ts', op: 'modify' }],
      confidence: 0.7,
    };
    // real inference is off in tests -> deterministic path returns report sizes
    const absolutes = await measureAssetPackAbsolutes(patch, {
      lens: 'deposit',
      sources: [{ path: 'a.ts', content: 'function f(){}\nfunction g(){}\ninterface T{ x: number }' }],
    });
    expect(absolutes.find((m) => m.measurementKind === 'function-count')?.magnitude).toBe(2);
    expect(absolutes.find((m) => m.measurementKind === 'type-count')?.magnitude).toBe(1);
    expect(absolutes.find((m) => m.measurementKind === 'file-span')?.magnitude).toBe(1);
  });

  it('computeAbsolutesFromReport prefers measured counts but degrades on no source', () => {
    const patch: MeasurableAssetPackPatch = {
      title: 'x', summary: 'y', coveredSourcePaths: ['a.ts', 'b.ts'], confidence: 0.6,
    };
    const measured = computeAbsolutesFromReport(
      { measuredFromSamples: true, estimatedFunctionCount: 30, estimatedTypeCount: 12, targetFileCount: 2,
        sampledFileCount: 2, lineCount: 0, tokenCount: 0, functionCount: 30, typeCount: 12, symbolCount: 0,
        configKeyCount: 0, languageDensities: [], targetLanguageBreakdown: {}, coverageRatio: 1 } as any,
      patch,
    );
    expect(measured.find((m) => m.measurementKind === 'function-count')?.magnitude).toBe(30);
    // no source -> heuristic from covered-path span (2 paths * 3 = 6)
    const heuristic = computeDeterministicAbsolutes(patch);
    expect(heuristic.find((m) => m.measurementKind === 'function-count')?.magnitude).toBe(6);
  });

  it('mergeReportAndReadings clamps agent judgment readings into [0,1]', () => {
    const patch: MeasurableAssetPackPatch = {
      title: 'x', summary: 'y', coveredSourcePaths: ['a.ts'], fileChanges: [{ path: 'a.ts', op: 'modify' }], confidence: 0.5,
    };
    const merged = mergeReportAndReadings(computeDeterministicAbsolutes(patch), [
      { measurementKind: 'correctness-estimate', volume: 7 }, // clamped down
      { measurementKind: 'semantic-volume', volume: -3 }, // clamped up
    ]);
    expect(merged.find((m) => m.measurementKind === 'correctness-estimate')?.volume).toBe(1);
    expect(merged.find((m) => m.measurementKind === 'semantic-volume')?.volume).toBe(0);
  });

  it('mergeReportAndReadings keeps sizes authoritative, takes agent judgment', () => {
    const patch: MeasurableAssetPackPatch = {
      title: 'x', summary: 'y', coveredSourcePaths: ['a.ts'], fileChanges: [{ path: 'a.ts', op: 'modify' }], confidence: 0.5,
    };
    const base = computeDeterministicAbsolutes(patch);
    const baseFnVolume = base.find((m) => m.measurementKind === 'function-count')!.volume;
    const merged = mergeReportAndReadings(base, [
      { measurementKind: 'function-count', volume: 0.99 }, // ignored — size is tool-authoritative
      { measurementKind: 'correctness-estimate', volume: 0.91 }, // taken
      { measurementKind: 'semantic-volume', volume: 0.4 }, // taken
    ]);
    expect(merged.find((m) => m.measurementKind === 'function-count')?.volume).toBe(baseFnVolume);
    expect(merged.find((m) => m.measurementKind === 'correctness-estimate')?.volume).toBe(0.91);
    expect(merged.find((m) => m.measurementKind === 'semantic-volume')?.volume).toBe(0.4);
  });
});

describe('measureAssetPackAbsolutes real-inference path (boundary-mocked measure-agent)', () => {
  const PATCH: MeasurableAssetPackPatch = {
    title: 'Auth slice',
    summary: 'auth capability',
    coveredSourcePaths: ['a.ts'],
    fileChanges: [{ path: 'a.ts', op: 'modify' }],
    confidence: 0.7,
  };
  const SOURCES = [
    { path: 'a.ts', content: 'function f(){}\nfunction g(){}\ninterface T{ x: number }' },
  ];

  beforeEach(() => {
    mockRealInference = true;
  });
  afterEach(() => {
    mockRealInference = false;
    resetBoundaryLLMOutput();
    jest.restoreAllMocks();
  });

  it('takes the agent judgment readings, keeps sizes tool-authoritative, and never calls tool.execute', async () => {
    const executeSpy = jest.spyOn(SourceStaticAnalysisTool.prototype, 'execute');
    setBoundaryLLMOutput({
      measurements: [
        // Judgment readings — taken from the agent (pins the envelope unwrap: if the
        // PTRR envelope were read directly these would be lost and correctness would
        // fall back to the confidence-derived 0.7).
        { measurementKind: 'correctness-estimate', volume: 0.91, rationale: 'Grounded in the measured counts.' },
        { measurementKind: 'semantic-volume', volume: 0.44, rationale: 'Moderate legible knowledge volume.' },
        // A size reading — MUST be ignored: sizes are static-analysis-authoritative.
        { measurementKind: 'function-count', volume: 0.99, magnitude: 999, rationale: 'Inflated size reading.' },
      ],
      summary: 'Measured the absolutes of the patch descriptor.',
    });

    const absolutes = await measureAssetPackAbsolutes(PATCH, {
      lens: 'deposit',
      execution: new Execution('validation-node'),
      sources: SOURCES,
    });

    expect(absolutes.map((m) => m.measurementKind).sort()).toEqual([...ASSET_PACK_ABSOLUTE_KINDS].sort());
    // Sizes stay tool-grounded (2 functions in the provided source, not the agent's 999).
    const fn = absolutes.find((m) => m.measurementKind === 'function-count');
    expect(fn?.magnitude).toBe(2);
    expect(fn?.volume).toBe(0.05); // 2 / 40 normalizer
    // Agent judgment readings are taken.
    expect(absolutes.find((m) => m.measurementKind === 'correctness-estimate')?.volume).toBe(0.91);
    expect(absolutes.find((m) => m.measurementKind === 'semantic-volume')?.volume).toBe(0.44);
    // Source-safety: only use() runs (in-memory samples); execute() would persist the
    // raw source args into a tool child execution and must never be called.
    expect(executeSpy).not.toHaveBeenCalled();
  }, 30000);

  it('falls back to the report absolutes when the agent readings match no catalog kind', async () => {
    setBoundaryLLMOutput({
      measurements: [
        { measurementKind: 'unknown-kind', volume: 0.9, rationale: 'Not a catalog measurement.' },
      ],
      summary: 'Readings that ground nothing.',
    });

    const absolutes = await measureAssetPackAbsolutes(PATCH, {
      lens: 'deposit',
      execution: new Execution('validation-node'),
      sources: SOURCES,
    });

    // Identical to the deterministic report-derived absolutes: correctness stays
    // confidence-derived, sizes stay measured.
    expect(absolutes.find((m) => m.measurementKind === 'correctness-estimate')?.volume).toBe(0.7);
    expect(absolutes.find((m) => m.measurementKind === 'function-count')?.magnitude).toBe(2);
    expect(absolutes.find((m) => m.measurementKind === 'type-count')?.magnitude).toBe(1);
  }, 30000);
});
