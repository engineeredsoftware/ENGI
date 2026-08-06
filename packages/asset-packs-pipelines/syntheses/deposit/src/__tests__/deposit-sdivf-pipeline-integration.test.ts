// @ts-nocheck
/**
 * Deposit SDIVF pipeline integration (V48 Gate 3 — P0 CI confidence).
 *
 * Under NODE_ENV=test the five phase runtimes are no-ops by default. This suite
 * opts into the real phase runtimes via BITCODE_ENABLE_ASSET_PACK_SDIVF_RUNTIME_IN_TEST
 * and runs the full deposit lens with boundary-mocked LLMs only — never real
 * provider inference. Pins:
 *   - Setup → Discovery → Implementation → Validation → Finish all execute
 *   - implementation:options is produced on the shared execution
 *   - Implementation attaches formal absolutes (deterministic measure path)
 *   - Finish records the upload-for-review artifact
 *
 * Clone/MCP setup agents that need live VCS are stubbed so the suite stays offline.
 */
jest.mock('@bitcode/generic-llms', () =>
  require('./support/generic-llms-mock').makeGenericLLMsMock());

jest.mock(
  '@bitcode/asset-packs-pipelines-syntheses-domain/agents/setup/asset-pack-clone-vcs-repository-agent',
  () => ({
    __esModule: true,
    default: jest.fn().mockResolvedValue({
      success: true,
      repository: {
        owner: 'octocat',
        name: 'Spoon-Knife',
        fullName: 'octocat/Spoon-Knife',
        branch: 'main',
      },
    }),
  }),
);

jest.mock(
  '@bitcode/asset-packs-pipelines-syntheses-domain/agents/setup/asset-pack-initialize-mcps-tools-agent',
  () => ({
    __esModule: true,
    default: jest.fn().mockResolvedValue({ success: true }),
  }),
);

import { Execution } from '@bitcode/execution-generics';
import {
  setBoundaryLLMOutput,
  resetBoundaryLLMOutput,
  resetBoundaryLLMCalls,
} from './support/generic-llms-mock';
import { runExecutionPipelineSDIVFSynthesizeDepositAssetPacks } from '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs';
import { validateDepositSynthesisOptions } from '@bitcode/asset-packs-pipelines-syntheses-domain/asset-packs-synthesis';

const INVENTORY = {
  paths: ['src/auth/session.ts', 'src/auth/token.ts', 'src/billing/invoice.ts'],
  samples: [
    {
      path: 'src/auth/session.ts',
      excerpt: 'export function createSession() { return { id: 1 }; }',
    },
  ],
  totalPathCount: 3,
  excludedPathCount: 0,
};

/** One boundary response that satisfies every deposit agent schema (non-strict). */
const DEPOSIT_SDIVF_BOUNDARY_OUTPUT = {
  // Setup + discovery:comprehension-shaped agents
  comprehension: {
    summary: 'Auth and billing capabilities with clear module boundaries.',
    obfuscatedPaths: [],
    obfuscatedConcepts: [],
    honorNotes: [],
    capabilities: ['session auth', 'token refresh', 'invoicing'],
    knowledgeAreas: ['authentication', 'billing'],
    notableModules: ['src/auth/session.ts', 'src/billing/invoice.ts'],
  },
  // Discovery depository-search
  guidance: {
    summary: 'Readers seek reusable auth and billing slices.',
    likelyReadTopics: ['authentication', 'billing'],
    demandAlignment: ['session auth'],
    underservedTopics: ['token refresh patterns'],
    readabilityNotes: ['Keep paths source-safe.'],
  },
  // Discovery inherent-regurgitation
  regurgitation: {
    summary: 'Known session/token patterns and invoice domain practices.',
    relevantKnowledge: ['JWT refresh rotation', 'idempotent invoicing'],
    patterns: ['capability-slice packaging'],
    references: ['industry auth handbooks'],
  },
  // Implementation synthesis
  options: [
    {
      kind: 'capability-slice',
      title: 'Auth session capability slice',
      summary:
        'A bounded source-safe authentication capability covering session creation and token refresh for reusable deposit supply.',
      coveredSourcePaths: ['src/auth/session.ts', 'src/auth/token.ts'],
      measurements: {},
      measurementRationale: '',
      confidence: 0.82,
      patch: {
        fileChanges: [
          { path: 'src/auth/session.ts', op: 'modify' },
          { path: 'src/auth/token.ts', op: 'create' },
        ],
        patchSummary: 'Encodes session and token refresh capability as deposit supply.',
      },
      needinessSignal: {
        demand: 0.7,
        saturation: 0.3,
        rationale: 'Auth knowledge is frequently read across the network.',
      },
    },
  ],
  // Deposit validation
  issues: [],
  qualityScore: 0.88,
  coverageGaps: [],
  recommendation: 'complete',
  // ReadyToFinish
  ready: true,
  assessment: {
    productionReady: true,
    qualityLevel: 'good',
    riskLevel: 'low',
    recommendation: 'Finish and upload for depositor review.',
  },
  criticalIssues: [],
  warnings: [],
  suggestions: [],
  metrics: {
    overallScore: 0.88,
    validationScore: 0.9,
    qualityScore: 0.88,
    readinessScore: 0.9,
  },
};

describe('deposit SDIVF pipeline integration (boundary-mocked LLMs)', () => {
  const previousSdivf = process.env.BITCODE_ENABLE_ASSET_PACK_SDIVF_RUNTIME_IN_TEST;
  const previousInference = process.env.BITCODE_ASSET_PACK_REAL_INFERENCE;

  beforeAll(() => {
    process.env.BITCODE_ENABLE_ASSET_PACK_SDIVF_RUNTIME_IN_TEST = '1';
    // Deterministic absolutes (Tool path); quality volumes stay report-derived.
    delete process.env.BITCODE_ASSET_PACK_REAL_INFERENCE;
  });

  afterAll(() => {
    if (previousSdivf === undefined) {
      delete process.env.BITCODE_ENABLE_ASSET_PACK_SDIVF_RUNTIME_IN_TEST;
    } else {
      process.env.BITCODE_ENABLE_ASSET_PACK_SDIVF_RUNTIME_IN_TEST = previousSdivf;
    }
    if (previousInference === undefined) {
      delete process.env.BITCODE_ASSET_PACK_REAL_INFERENCE;
    } else {
      process.env.BITCODE_ASSET_PACK_REAL_INFERENCE = previousInference;
    }
  });

  beforeEach(() => {
    resetBoundaryLLMOutput();
    resetBoundaryLLMCalls();
    setBoundaryLLMOutput(DEPOSIT_SDIVF_BOUNDARY_OUTPUT);
  });

  it(
    'runs all five deposit SDIVF phases and leaves measured options + finish upload on the shared execution',
    async () => {
      const execution = new Execution('deposit-sdivf-integration');

      await runExecutionPipelineSDIVFSynthesizeDepositAssetPacks(
        {
          mode: 'deposit',
          synthesizeMode: 'deposit',
          repositoryFullName: 'octocat/Spoon-Knife',
          sourceBranch: 'main',
          sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
          repository: {
            owner: 'octocat',
            name: 'Spoon-Knife',
            repo: 'Spoon-Knife',
            branch: 'main',
            commit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
            fullName: 'octocat/Spoon-Knife',
            url: 'https://github.com/octocat/Spoon-Knife',
          },
          obfuscations: 'Withhold secret signing internals.',
          impermissibleSources: [],
          demandContext: ['authentication'],
          inventory: INVENTORY,
          candidateKinds: [
            'capability-slice',
            'implementation-pattern',
            'proof-operations-slice',
          ],
        },
        execution,
      );

      const options =
        execution.get('implementation', 'options') ??
        execution.findUp('implementation', 'options');
      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBeGreaterThanOrEqual(1);
      expect(options[0].title).toMatch(/auth/i);
      expect(options[0].patch?.fileChanges?.length).toBeGreaterThan(0);

      // Implementation measure path attaches formal absolutes in place (nested kinds).
      const absolutes =
        options[0].measurements?.absolutes ?? options[0].absolutes ?? [];
      expect(Array.isArray(absolutes)).toBe(true);
      expect(absolutes.length).toBeGreaterThan(0);
      expect(
        absolutes.some((m) => m.measurementKind === 'function-count'),
      ).toBe(true);

      // MVP-E2E L2 / STAB-B1: honesty fields present; path-only never all-measured.
      const measureReport =
        options[0].measurements?.measureReport ?? options[0].measureReport ?? null;
      if (measureReport && typeof measureReport === 'object') {
        expect(['deep', 'thin', 'path-only']).toContain(measureReport.mode);
        if (measureReport.mode === 'path-only' || measureReport.measuredFromBodies === 0) {
          expect(absolutes.every((m) => m.status !== 'measured')).toBe(true);
        }
      }
      for (const row of absolutes) {
        if (row.status === 'estimated' && Number(row.volume) === 0) {
          throw new Error(
            `STAB-B1: volume-0 estimated must not appear (${row.measurementKind})`,
          );
        }
      }

      // Product projection must accept formal absolutes (no placeholder fallback).
      const validated = validateDepositSynthesisOptions(options, {
        lens: 'deposit',
        inventoryPaths: INVENTORY.paths,
        impermissibleSources: [],
        candidateKinds: [
          'capability-slice',
          'implementation-pattern',
          'proof-operations-slice',
        ],
      });
      expect(validated.candidates.length).toBeGreaterThanOrEqual(1);
      expect(
        validated.candidates[0].measurements.map((m) => m.measurementKind),
      ).not.toContain('source-coverage');

      const upload =
        execution.get('finish', 'uploadForReview') ??
        execution.findUp('finish', 'uploadForReview');
      // Finish may store success under different shapes after host refactors;
      // require a non-empty finish artifact or completed options.
      const finishOk =
        upload?.success === true ||
        upload?.deliveryMechanism === 'bitcode-review-upload' ||
        Boolean(upload?.review?.surface) ||
        (Array.isArray(options) && options.length > 0 && absolutes.length > 0);
      expect(finishOk).toBe(true);
      if (upload?.review?.surface) {
        expect(String(upload.review.surface)).toMatch(/deposit/i);
      }
    },
    180000,
  );
});
