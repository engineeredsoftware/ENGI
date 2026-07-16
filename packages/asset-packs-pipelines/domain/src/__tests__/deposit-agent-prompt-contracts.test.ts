/**
 * Deposit SDIVF agent prompt contracts (V48 Gate 3).
 *
 * For each deposit-mode SynthesizeAssetPacks agent, run the REAL PTRR machinery
 * (factoryPTRRAgent -> Plan/Try/Refine/Retry, each Failsafe x Thinkings)
 * against a synthetic deposit execution tree with the LLM mocked at the boundary
 * (F26-A), capture every wire system prompt exactly as buildHierarchicalPrompt
 * composed it, and pin the prompt contract:
 *
 *  (a) layer order: agent identity renders before the agent requirements, which
 *      render before the PTRR step layers (root-to-leaf within the agent
 *      registry), and the full hierarchical prompt reaches EVERY LLM call;
 *  (b) interpolation correctness: no 'undefined' / '[object Object]' anywhere
 *      in any rendered system prompt;
 *  (c) schema fidelity: the instructions name the agent's actual zod output
 *      field names and the exact top-level JSON wrapper key;
 *  (d) deposit purity: no read-satisfaction / refund verbiage in any deposit
 *      agent system prompt; no vague "inventory" product language — paths are
 *      sourceCheckoutCatalog; no Fits Finding / lens framing.
 */

// Inference is non-configurable (F26-A): determinism comes from mocking the LLM
// provider at the boundary, BEFORE importing any agent under test.
jest.mock('@bitcode/generic-llms', () =>
  require('./support/generic-llms-prompt-capture-mock').makeGenericLLMsMock());

import { Execution } from '@bitcode/execution-generics';
import { ASSET_PACK_ABSOLUTES_CATALOG } from '../asset-packs-synthesis';
import { DepositInputComprehensionAgent } from '../agents/setup/deposit-input-comprehension-agent';
import { DepositCodebaseComprehensionAgent } from '../agents/discovery/deposit-codebase-comprehension-agent';
import { DepositDepositorySearchAgent } from '../agents/discovery/deposit-depository-search-agent';
import { DepositInherentRegurgitationAgent } from '../agents/discovery/deposit-inherent-regurgitation-agent';
import { DepositAssetPackSynthesisAgent } from '../agents/implementation/deposit-asset-pack-synthesis-agent';
import { DepositValidationAgent } from '../agents/validation/deposit-validation-agent';
import {
  setBoundaryLLMOutput,
  resetBoundaryLLMOutput,
  getCapturedLLMCalls,
  resetCapturedLLMCalls,
  type CapturedLLMCall,
} from './support/generic-llms-prompt-capture-mock';

/** Synthetic deposit execution tree: deposit namespace as dispatch seeds it. */
function seedDepositExecution(): Execution {
  const exec = new Execution('pipeline:asset-pack');
  exec.store('deposit', 'repository', {
    repositoryFullName: 'octocat/Spoon-Knife',
    sourceBranch: 'main',
    sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
  });
  exec.store('deposit', 'obfuscations', 'Withhold the payments engine internals.');
  exec.store('deposit', 'impermissibleSources', ['packages/payments/']);
  const catalog = {
    paths: ['src/telemetry/index.ts', 'src/telemetry/stream.ts', 'src/index.ts'],
    samples: [{ path: 'src/telemetry/index.ts', excerpt: 'export const telemetry = {};' }],
  };
  exec.store('deposit', 'sourceCheckoutCatalog', catalog);
  exec.store('deposit', 'demandContext', [
    { id: 'demand-telemetry', label: 'Readers need telemetry pipeline knowledge', weight: 0.8 },
  ]);
  return exec;
}

interface DepositAgentPromptSpec {
  title: string;
  agent: (input: any, execution: Execution) => Promise<any>;
  /** agent:identity sentinel (must render first among the agent layers). */
  identity: string;
  /** agent:requirements sentinel (must render after identity, before PTRR). */
  requirements: string;
  /** The exact top-level JSON wrapper-key instruction. */
  wrapper: string;
  /** The agent's actual zod output field names the instructions must mention. */
  schemaFields: string[];
  /** PTRR step layers (plan/try/refine/retry). */
  ptrr: string[];
  boundaryOutput: Record<string, unknown>;
  input: Record<string, unknown>;
}

const SYNTHESIS_OPTION = {
  kind: 'capability-slice',
  title: 'Telemetry pipeline knowledge pack',
  summary:
    'A source-safe knowledge slice covering the telemetry pipeline, its stream composition, and its review surface.',
  coveredSourcePaths: ['src/telemetry/index.ts'],
  measurements: { 'source-coverage': 0.5, 'demand-alignment': 0.6, 'reuse-likelihood': 0.7 },
  measurementRationale: 'Grounded in the Discovery comprehension of the telemetry modules.',
  confidence: 0.8,
  patch: {
    fileChanges: [{ path: 'src/telemetry/index.ts', op: 'modify' }],
    patchSummary: 'Encodes the telemetry pipeline knowledge slice as a reviewable patch.',
  },
  needinessSignal: { demand: 0.7, saturation: 0.2, rationale: 'Telemetry topic is underserved.' },
};

const SPECS: DepositAgentPromptSpec[] = [
  {
    title: 'DepositInputComprehensionAgent (Setup: comprehend Obfuscations)',
    agent: DepositInputComprehensionAgent,
    identity: 'You are the SynthesizeAssetPacks Setup agent that comprehends depositor OBFUSCATIONS.',
    requirements: 'From the Obfuscations text and the sourceCheckoutCatalog, derive',
    wrapper: 'Return ONLY {"comprehension": {...}}',
    schemaFields: ['summary', 'obfuscatedPaths', 'obfuscatedConcepts', 'honorNotes'],
    ptrr: [
      'Plan: parse the Obfuscations into the dimensions of what to withhold.',
      'Try: map the Obfuscations onto concrete sourceCheckoutCatalog paths and concepts.',
      'Refine: ensure nothing the depositor wants withheld is left exposed.',
      'Retry: return conservative obfuscation guidance when evidence is thin.',
    ],
    boundaryOutput: {
      comprehension: {
        summary: 'Withhold the payments engine internals from every synthesized pack.',
        obfuscatedPaths: ['packages/payments/engine.ts'],
        obfuscatedConcepts: ['settlement keys'],
        honorNotes: ['Never name payments engine internals in pack summaries.'],
      },
    },
    input: { obfuscations: 'Withhold the payments engine internals.' },
  },
  {
    title: 'DepositCodebaseComprehensionAgent (Discovery: comprehend-codebase)',
    agent: DepositCodebaseComprehensionAgent,
    identity:
      'You are the SynthesizeAssetPacks Discovery agent that comprehends the depositor Host checkout (sourceCheckoutCatalog).',
    requirements: 'You receive: repository coordinates, sourceCheckoutCatalog paths, fileTree structure,',
    wrapper: 'Return ONLY {"comprehension": {...}}',
    schemaFields: [
      'summary',
      'capabilities',
      'knowledgeAreas',
      'notableModules',
      'measurementInsights',
      'structureInsights',
    ],
    ptrr: [
      'Plan: combine absolute measurements, LSP signals, file-tree structure, and key file',
      'Try: synthesize the codebase knowledge map — capabilities, knowledge areas, notable',
      'Refine: ensure the map is source-safe, grounded in provided sourceCheckoutCatalog evidence',
      'Retry: return a minimal source-safe knowledge map grounded in path list and measurements',
    ],
    boundaryOutput: {
      comprehension: {
        summary: 'The repository embodies a telemetry pipeline with streaming composition.',
        capabilities: ['stream telemetry events'],
        knowledgeAreas: ['telemetry'],
        notableModules: ['src/telemetry/index.ts'],
        measurementInsights: ['rich absolute sizes on telemetry modules'],
        structureInsights: ['src/telemetry is a top-level capability cluster'],
      },
    },
    input: {},
  },
  {
    title: 'DepositDepositorySearchAgent (Discovery: search-depository)',
    agent: DepositDepositorySearchAgent,
    identity:
      'You are the SynthesizeAssetPacks Discovery agent that searches the Bitcode Depository',
    requirements: 'From repository coordinates, sourceCheckoutCatalog (paths/samples), obfuscation guidance,',
    wrapper: 'Return ONLY {"guidance": {...}, "searchQueries": [...]}',
    schemaFields: [
      'summary',
      'likelyReadTopics',
      'demandAlignment',
      'underservedTopics',
      'readabilityNotes',
      'searchQueries',
    ],
    ptrr: [
      'Plan: from sourceCheckoutCatalog paths, measurements, obfuscations, and demand context,',
      'Try: produce demand guidance and the searchQueries list the Depository search tool will run.',
      'Refine: ensure queries and guidance are grounded in sourceCheckoutCatalog evidence, demand-aligned, and source-safe.',
      'Retry: return minimal demand guidance and broad searchQueries rather than failing.',
    ],
    boundaryOutput: {
      guidance: {
        summary: 'Telemetry knowledge satisfies streaming observability demand.',
        likelyReadTopics: ['telemetry streaming'],
        demandAlignment: ['matches the telemetry demand signal'],
        underservedTopics: ['stream backpressure'],
        readabilityNotes: ['Frame packs by capability.'],
        searchQueries: ['telemetry', 'streaming'],
      },
      searchQueries: ['telemetry', 'streaming'],
    },
    input: {},
  },
  {
    title: 'DepositInherentRegurgitationAgent (Discovery: inherent-regurgitation)',
    agent: DepositInherentRegurgitationAgent,
    identity:
      'You are the SynthesizeAssetPacks Discovery agent that contributes model-inherent knowledge for deposit AssetPack synthesis.',
    requirements: 'Given repository coordinates and sourceCheckoutCatalog path context, derive from',
    wrapper: 'Return ONLY {"regurgitation": {...}}',
    schemaFields: ['summary', 'relevantKnowledge', 'patterns', 'references'],
    ptrr: [
      'Plan: identify which of your trained knowledge is relevant to this repository domain.',
      'Try: regurgitate relevant knowledge, well-known patterns, best practices, and references.',
      'Refine: ensure the knowledge is relevant, generally-known, and source-safe.',
      'Retry: return minimal relevant knowledge rather than failing the regurgitation.',
    ],
    boundaryOutput: {
      regurgitation: {
        summary: 'Telemetry pipelines commonly follow the observer pattern.',
        relevantKnowledge: ['event stream fan-out'],
        patterns: ['observer pattern'],
        references: ['OpenTelemetry semantic conventions'],
      },
    },
    input: {},
  },
  {
    title: 'DepositAssetPackSynthesisAgent (Implementation: patch + measurements + metadata)',
    agent: DepositAssetPackSynthesisAgent,
    identity: 'You are SynthesizeAssetPacks Implementation for deposit.',
    requirements: 'Ground every candidate in Discovery comprehension',
    wrapper: 'Return ONLY {"options":[ ... ]} — top-level key MUST be "options".',
    schemaFields: [
      'kind',
      'title',
      'summary',
      'coveredSourcePaths',
      'confidence',
      'patch',
      'fileChanges',
      'patchSummary',
    ],
    ptrr: [
      'Plan: from the sourceCheckoutCatalog, Discovery comprehension (including absolute',
      'Try: synthesize each candidate as digital material',
      'Refine: ensure each option is distinct, source-safe, obfuscation- and exclusion-honoring',
      'Retry: complete any missing option as a minimal valid source-safe patch',
    ],
    boundaryOutput: {
      options: [
        SYNTHESIS_OPTION,
        {
          ...SYNTHESIS_OPTION,
          kind: 'implementation-pattern',
          title: 'Streaming composition pattern pack',
          summary:
            'A source-safe knowledge slice covering the streaming composition pattern the repository applies end to end.',
          coveredSourcePaths: ['src/telemetry/stream.ts'],
          patch: {
            fileChanges: [{ path: 'src/telemetry/stream.ts', op: 'modify' }],
            patchSummary: 'Encodes the streaming composition pattern as a reviewable patch.',
          },
        },
      ],
    },
    input: {},
  },
  {
    title: 'DepositValidationAgent (Validation: ready-to-finish A/B/C)',
    agent: DepositValidationAgent,
    identity: 'You are the SynthesizeAssetPacks Validation ready-to-finish agent for deposit.',
    requirements: 'Validate the deposit synthesis run as a single ready-to-finish gate (A/B/C).',
    wrapper:
      'Return ONLY {"issues":[...],"qualityScore":n,"coverageGaps":[...],"recommendation":"complete"|"iterate"}',
    schemaFields: ['issues', 'qualityScore', 'coverageGaps', 'recommendation'],
    ptrr: [
      'Plan: enumerate prior-phase signals and each AssetPack; walk A (sanity), B (patch +',
      'Try: run A/B/C checks — prior phases, pack quality (patch + measurements + metadata),',
      'Refine: keep only concrete, source-safe issues and an honest qualityScore and recommendation.',
      'Retry: when evidence is thin, validate the available AssetPack state and name what is missing for ready-to-finish.',
    ],
    boundaryOutput: {
      issues: [],
      qualityScore: 0.9,
      coverageGaps: [],
      recommendation: 'complete',
    },
    input: { assetPacks: [SYNTHESIS_OPTION] },
  },
];

// Read-satisfaction / refund framing belongs to read pipelines only — deposit
// prompts stay free of that vocabulary (F22/F28).
const FORBIDDEN_DEPOSIT_PROMPT_TOKENS = [
  /read-satisfaction/i,
  /refund/i,
  /fits finding/i,
  /deposit lens/i,
  /read lens/i,
];

async function runAgentAndCapture(spec: DepositAgentPromptSpec): Promise<CapturedLLMCall[]> {
  resetCapturedLLMCalls();
  setBoundaryLLMOutput(spec.boundaryOutput);
  const exec = seedDepositExecution();
  await spec.agent(spec.input, exec);
  return getCapturedLLMCalls();
}

describe('Deposit SDIVF agent prompt contracts (boundary-mocked PTRR)', () => {
  afterEach(() => {
    resetBoundaryLLMOutput();
    resetCapturedLLMCalls();
  });

  for (const spec of SPECS) {
    it(
      `${spec.title}: renders the hierarchical deposit system prompt correctly`,
      async () => {
        const calls = await runAgentAndCapture(spec);

        // The full PTRR hierarchy actually ran (plan/try/refine/retry, each a
        // Failsafe x Thinkings generation => many boundary LLM calls).
        expect(calls.length).toBeGreaterThanOrEqual(4);

        // (a) The hierarchical system prompt reaches EVERY LLM call: each wire
        // system message carries the agent identity (F26-A: no bypass branch).
        for (const call of calls) {
          expect(call.system).toContain(spec.identity);
        }

        // (a) Layer order within the agent registry, root-to-leaf: identity ->
        // requirements -> PTRR step layers (pinned on the first wire call).
        const first = calls[0].system;
        const identityAt = first.indexOf(spec.identity);
        const requirementsAt = first.indexOf(spec.requirements);
        const planAt = first.indexOf(spec.ptrr[0]);
        expect(identityAt).toBeGreaterThanOrEqual(0);
        expect(requirementsAt).toBeGreaterThan(identityAt);
        expect(planAt).toBeGreaterThan(requirementsAt);

        // (a) Every PTRR layer composes into the system prompt.
        for (const ptrrLayer of spec.ptrr) {
          expect(first).toContain(ptrrLayer);
        }

        const allSystems = calls.map((call) => call.system).join('\n\n');

        // (b) Interpolation correctness: nothing rendered as a raw object or a
        // missing value anywhere in any composed system prompt.
        expect(allSystems).not.toContain('[object Object]');
        expect(allSystems).not.toContain('undefined');

        // (c) Schema fidelity: the instructions name the agent's actual zod
        // output field names and the exact top-level JSON wrapper key.
        expect(first).toContain(spec.wrapper);
        for (const field of spec.schemaFields) {
          expect(first).toContain(field);
        }

        // (d) Deposit purity: no read-satisfaction / lens / Fits Finding framing.
        for (const token of FORBIDDEN_DEPOSIT_PROMPT_TOKENS) {
          expect(allSystems).not.toMatch(token);
        }

        // Canonical catalog naming (not vague "inventory" product language in prompts).
        if (allSystems.includes('inventory')) {
          // Dual-write keys may appear only if we slip; fail on bare inventory path language.
          expect(allSystems).not.toMatch(/\binventory paths\b/i);
          expect(allSystems).not.toMatch(/\brepository inventory\b/i);
          expect(allSystems).not.toMatch(/\bexplored repository inventory\b/i);
        }
      },
      30000,
    );
  }

  it('Implementation synthesizes material; host attaches measurements; Validation names absolute kinds', async () => {
    // LLM does not invent absolute volumes; Implementation host attaches them.
    // Validation A/B/C requires absolutes and names the measure-agent catalog.
    const synthesisSpec = SPECS.find((spec) => spec.agent === DepositAssetPackSynthesisAgent)!;
    const validationSpec = SPECS.find((spec) => spec.agent === DepositValidationAgent)!;

    const synthesisCalls = await runAgentAndCapture(synthesisSpec);
    const synthesisSystem = synthesisCalls[0].system;
    const validationCalls = await runAgentAndCapture(validationSpec);
    const validationSystem = validationCalls[0].system;

    expect(synthesisSystem).toMatch(/patch \+ measurements \+ metadata/i);
    expect(synthesisSystem).toMatch(/do NOT invent absolute/i);
    expect(synthesisSystem).toMatch(/sourceCheckoutCatalog/i);
    expect(synthesisSystem).toMatch(/needinesses/i);
    expect(synthesisSystem).not.toMatch(/needinessSignal/i);
    expect(synthesisSystem).not.toMatch(/Validation measures those/i);

    expect(validationSystem).toMatch(/ready-to-finish gate \(A\/B\/C\)/i);
    expect(validationSystem).toMatch(/sourceCheckoutCatalog/i);
    expect(ASSET_PACK_ABSOLUTES_CATALOG.length).toBeGreaterThan(0);
    for (const measurementSpec of ASSET_PACK_ABSOLUTES_CATALOG) {
      expect(validationSystem).toContain(measurementSpec.measurementKind);
    }
    // Placeholder catalog kinds must not drive synthesis prompts.
    expect(synthesisSystem).not.toContain('source-coverage');
    expect(synthesisSystem).not.toContain('demand-alignment');
  }, 60000);
});
