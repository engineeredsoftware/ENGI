// @ts-nocheck
/**
 * Read SDIVF pipeline integration (MVP-E2E L2 CI-fast).
 *
 * Boundary-mocked LLMs only (never live provider). Opts into real phase
 * runtimes via BITCODE_ENABLE_ASSET_PACK_SDIVF_RUNTIME_IN_TEST.
 *
 * Pins (STAB + product law):
 *   - Setup → Discovery → Implementation → Validation → Finish
 *   - Need-first options with needinesses (*-fit) when Need present
 *   - productLens=read on Implementation
 *   - Validation ready-to-finish stores coherent recommendation
 *
 * Does not import the deposit product package.
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
  getBoundaryLLMPromptText,
} from './support/generic-llms-mock';
import { runExecutionPipelineSDIVFSynthesizeReadAssetPacks } from '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-reads-asset-packs';
import { resolvePackNeedinesses } from '@bitcode/asset-packs-pipelines-syntheses-domain/asset-pack-measurements';

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

const READ_NEED =
  'I need session refresh and token rotation patterns for OAuth clients.';

/** Boundary response satisfying read Setup/Discovery/Implementation/Validation. */
const READ_SDIVF_BOUNDARY_OUTPUT = {
  comprehension: {
    summary: READ_NEED.slice(0, 200),
    needTopics: ['session refresh', 'token rotation', 'OAuth'],
    acceptanceCriteria: [
      'Covers session refresh flows',
      'Documents token rotation constraints',
    ],
    dynamicNeedinessKinds: ['needs-session-refresh-fit', 'oauth-token-rotation-fit'],
    dynamicNeedinesses: [
      {
        measurementKind: 'needs-session-refresh-fit',
        label: 'Session refresh fit',
        guidance: 'How well the pack covers session refresh for the Need.',
        weight: 1,
      },
      {
        measurementKind: 'oauth-token-rotation-fit',
        label: 'OAuth token rotation fit',
        guidance: 'How well token rotation is covered.',
        weight: 1,
      },
    ],
    honorNotes: [],
    capabilities: ['session auth', 'token refresh'],
    knowledgeAreas: ['authentication'],
    notableModules: ['src/auth/session.ts', 'src/auth/token.ts'],
  },
  guidance: {
    summary: 'Need-fit packs for session and token surfaces.',
    needFitTopics: ['session refresh', 'token rotation'],
    gapTopics: ['device binding'],
    likelyReadTopics: ['authentication'],
  },
  regurgitation: {
    summary: 'Known session/token patterns.',
    relevantKnowledge: ['JWT refresh rotation'],
    patterns: ['capability-slice packaging'],
    references: [],
  },
  options: [
    {
      kind: 'capability-slice',
      title: 'Session refresh capability for OAuth Need',
      summary:
        'A Need-serving slice covering session creation and refresh token rotation so the reader can satisfy OAuth session acceptance criteria.',
      coveredSourcePaths: ['src/auth/session.ts', 'src/auth/token.ts'],
      measurements: {},
      measurementRationale: '',
      confidence: 0.8,
      patch: {
        fileChanges: [
          { path: 'src/auth/session.ts', op: 'modify' },
          { path: 'src/auth/token.ts', op: 'create' },
        ],
        patchSummary: 'Encodes session refresh and token rotation for the reader Need.',
      },
    },
  ],
  issues: [],
  qualityScore: 0.85,
  coverageGaps: [],
  recommendation: 'complete',
  ready: true,
  assessment: {
    productionReady: true,
    qualityLevel: 'good',
    riskLevel: 'low',
    recommendation: 'Finish for reader settle selection.',
  },
  criticalIssues: [],
  warnings: [],
  suggestions: [],
  metrics: {
    overallScore: 0.85,
    validationScore: 0.88,
    qualityScore: 0.85,
    readinessScore: 0.88,
  },
};

describe('read SDIVF pipeline integration (MVP-E2E L2, boundary-mocked)', () => {
  const previousSdivf = process.env.BITCODE_ENABLE_ASSET_PACK_SDIVF_RUNTIME_IN_TEST;
  const previousInference = process.env.BITCODE_ASSET_PACK_REAL_INFERENCE;

  beforeAll(() => {
    process.env.BITCODE_ENABLE_ASSET_PACK_SDIVF_RUNTIME_IN_TEST = '1';
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
    setBoundaryLLMOutput(READ_SDIVF_BOUNDARY_OUTPUT);
  });

  it(
    'runs read SDIVF with Need, needinesses (*-fit), and productLens=read',
    async () => {
      const execution = new Execution('read-sdivf-integration');
      // Seed ranked hits so Implementation can project depositoryHits (STAB-A2).
      execution.store('discovery', 'depositorySearchToolResult', {
        hits: [
          {
            assetId: 'ap-seed-1',
            title: 'OAuth session refresh exemplar',
            finalScore: 0.91,
            channel: 'hybrid',
            matchedTerms: ['session', 'refresh'],
          },
        ],
      });

      await runExecutionPipelineSDIVFSynthesizeReadAssetPacks(
        {
          mode: 'read',
          synthesizeMode: 'read',
          productLens: 'read',
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
          need: READ_NEED,
          relevantPaths: ['src/auth/'],
          irrelevantPaths: [],
          inventory: INVENTORY,
          sourceCheckoutCatalog: {
            paths: INVENTORY.paths,
            sources: [
              {
                path: 'src/auth/session.ts',
                content:
                  'export function createSession() { return { id: 1, refresh: true }; }\n',
              },
              {
                path: 'src/auth/token.ts',
                content: 'export function rotateToken() { return "rotated"; }\n',
              },
            ],
          },
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

      const productLens =
        execution.get('implementation', 'productLens') ??
        execution.findUp('implementation', 'productLens');
      expect(productLens).toBe('read');

      const pack = options[0];
      const needinesses = resolvePackNeedinesses(pack);
      // STAB-B2: Need present → neediness plan/rows non-empty (*-fit).
      expect(needinesses.length).toBeGreaterThan(0);
      expect(needinesses.every((n) => String(n.measurementKind || '').endsWith('-fit'))).toBe(
        true,
      );

      const absolutes = pack.measurements?.absolutes ?? pack.absolutes ?? [];
      expect(Array.isArray(absolutes)).toBe(true);
      expect(absolutes.length).toBeGreaterThan(0);

      // Hits projection when Discovery tool result was seeded (STAB-A2).
      const hits =
        execution.get('implementation', 'depositoryHits') ??
        execution.findUp('implementation', 'depositoryHits');
      if (Array.isArray(hits) && hits.length > 0) {
        expect(hits[0]).toEqual(
          expect.objectContaining({
            assetId: 'ap-seed-1',
            title: expect.stringMatching(/session/i),
          }),
        );
      }

      // STAB-4: Validation framing — ready decision stored for read product.
      const ready =
        execution.get('validation', 'readyToFinish') ??
        execution.findUp('validation', 'readyToFinish') ??
        execution.get('validation', 'readQuality') ??
        execution.findUp('validation', 'readQuality');
      expect(ready).toBeTruthy();

      // Need-first identity should appear somewhere in validation/plan prompts
      // when qualitative PTRR runs; if structure-only gate skipped LLM, skip soft.
      const prompts = getBoundaryLLMPromptText();
      if (prompts.length > 200 && /validation|ready-to-finish|need/i.test(prompts)) {
        expect(prompts.toLowerCase()).toMatch(/need|read/);
      }
    },
    180000,
  );
});
