/**
 * Deposit SDIVF agent prompt contracts (V48 Gate 3).
 *
 * For each deposit-mode SynthesizeAssetPacks agent, run the REAL PTRR machinery
 * (factoryAgentWithPTRR -> Plan/Try/Refine/Retry, each Failsafe x Thinkings)
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
 *  (d) lens purity: no read-lens verbiage (Read-satisfaction / refund) in any
 *      deposit agent's system prompt.
 */

// Inference is non-configurable (F26-A): determinism comes from mocking the LLM
// provider at the boundary, BEFORE importing any agent under test.
jest.mock('@bitcode/generic-llms', () =>
  require('./support/generic-llms-prompt-capture-mock').makeGenericLLMsMock());

import { Execution } from '@bitcode/execution-generics';
import { DEPOSIT_MEASUREMENT_CATALOG } from '../asset-packs-synthesis';
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

/** Synthetic deposit execution tree: the deposit namespace as index.ts seeds it. */
function seedDepositExecution(): Execution {
  const exec = new Execution('pipeline:asset-pack');
  exec.store('deposit', 'repository', {
    repositoryFullName: 'engineeredsoftware/ENGI',
    sourceBranch: 'main',
    sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
  });
  exec.store('deposit', 'obfuscations', 'Withhold the payments engine internals.');
  exec.store('deposit', 'protectedIpExclusions', ['packages/payments/']);
  exec.store('deposit', 'inventory', {
    paths: ['src/telemetry/index.ts', 'src/telemetry/stream.ts', 'src/index.ts'],
    samples: [{ path: 'src/telemetry/index.ts', excerpt: 'export const telemetry = {};' }],
  });
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
  /** Lens-correct PTRR step layers (plan/try/refine/retry). */
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
    identity: 'You are the SynthesizeAssetPacks input-comprehension agent in DEPOSIT mode.',
    requirements: 'From the Obfuscations text and the inventory, derive',
    wrapper: 'Return ONLY {"comprehension": {...}}',
    schemaFields: ['summary', 'obfuscatedPaths', 'obfuscatedConcepts', 'honorNotes'],
    ptrr: [
      'Plan: parse the Obfuscations into the dimensions of what to withhold.',
      'Try: map the Obfuscations onto concrete inventory paths and concepts.',
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
    title: 'DepositCodebaseComprehensionAgent (Discovery: codebase lens)',
    agent: DepositCodebaseComprehensionAgent,
    identity:
      'You are the SynthesizeAssetPacks discovery agent in DEPOSIT mode, discovering from the CODEBASE.',
    requirements: 'From the repository coordinates and the inventory, derive',
    wrapper: 'Return ONLY {"comprehension": {...}}',
    schemaFields: ['summary', 'capabilities', 'knowledgeAreas', 'notableModules'],
    ptrr: [
      'Plan: survey the inventory to map what knowledge and capability the codebase holds.',
      'Try: synthesize the codebase knowledge map — capabilities, knowledge areas, notable modules.',
      'Refine: ensure the map is source-safe, distinct, and grounded in the provided inventory.',
      'Retry: return a minimal source-safe knowledge map rather than failing comprehension.',
    ],
    boundaryOutput: {
      comprehension: {
        summary: 'The repository embodies a telemetry pipeline with streaming composition.',
        capabilities: ['stream telemetry events'],
        knowledgeAreas: ['telemetry'],
        notableModules: ['src/telemetry/index.ts'],
      },
    },
    input: {},
  },
  {
    title: 'DepositDepositorySearchAgent (Discovery: depository lens)',
    agent: DepositDepositorySearchAgent,
    identity:
      'You are the SynthesizeAssetPacks discovery agent in DEPOSIT mode, discovering from the DEPOSITORY.',
    requirements: 'From the repository coordinates, the inventory, and the depositor demand context',
    wrapper: 'Return ONLY {"guidance": {...}}',
    schemaFields: [
      'summary',
      'likelyReadTopics',
      'demandAlignment',
      'underservedTopics',
      'readabilityNotes',
    ],
    ptrr: [
      'Plan: weigh the repository knowledge against likely reader demand and the demand context.',
      'Try: produce read-likelihood guidance — likely topics, demand alignment, readability framing.',
      'Refine: ensure the guidance is grounded in the inventory, demand-aligned, and source-safe.',
      'Retry: return minimal demand guidance rather than failing the search.',
    ],
    boundaryOutput: {
      guidance: {
        summary: 'Telemetry knowledge satisfies streaming observability demand.',
        likelyReadTopics: ['telemetry streaming'],
        demandAlignment: ['matches the telemetry demand signal'],
        underservedTopics: ['stream backpressure'],
        readabilityNotes: ['Frame packs by capability.'],
      },
    },
    input: {},
  },
  {
    title: 'DepositInherentRegurgitationAgent (Discovery: model lens)',
    agent: DepositInherentRegurgitationAgent,
    identity:
      'You are the SynthesizeAssetPacks discovery agent in DEPOSIT mode, discovering from the MODEL itself.',
    requirements: 'Given the repository coordinates and the inventory as context for relevance',
    wrapper: 'Return ONLY {"regurgitation": {...}}',
    schemaFields: ['summary', 'relevantKnowledge', 'patterns', 'references'],
    ptrr: [
      'Plan: identify which of your trained knowledge is relevant',
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
    title: 'DepositAssetPackSynthesisAgent (Implementation: measured patches)',
    agent: DepositAssetPackSynthesisAgent,
    identity: 'You are SynthesizeAssetPacks in DEPOSIT mode.',
    requirements: 'Ground every candidate in the provided Discovery comprehension',
    wrapper: 'Return ONLY {"options":[ ... ]} — the top-level key MUST be "options".',
    schemaFields: [
      'kind',
      'title',
      'summary',
      'coveredSourcePaths',
      'measurements',
      'measurementRationale',
      'confidence',
      'patch',
      'fileChanges',
      'patchSummary',
      'needinessSignal',
      'demand',
      'saturation',
      'rationale',
    ],
    ptrr: [
      'Plan: from the explored repository inventory, the Discovery comprehension, and depositor steering',
      'Try: synthesize each candidate as a measured patch',
      'Refine: ensure each option is distinct, source-safe, obfuscation- and exclusion-honoring',
      'Retry: complete any missing option as a minimal valid source-safe measured patch',
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
    title: 'DepositValidationAgent (Validation: deposit supply quality)',
    agent: DepositValidationAgent,
    identity: 'You are the SynthesizeAssetPacks Validation agent in DEPOSIT mode.',
    requirements: 'Validate the synthesized deposit AssetPacks against these checks',
    wrapper:
      'Return ONLY {"issues":[...],"qualityScore":n,"coverageGaps":[...],"recommendation":"complete"|"iterate"}',
    schemaFields: ['issues', 'qualityScore', 'coverageGaps', 'recommendation'],
    ptrr: [
      'Plan: enumerate the synthesized AssetPacks and the quality dimensions to check.',
      'Try: run each quality, distinctness, source-safety, compliance, patch, and coverage check.',
      'Refine: keep only concrete, source-safe issues and an honest qualityScore and recommendation.',
      'Retry: when evidence is thin, validate the available AssetPack state and name what is missing.',
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

// Read-lens verbiage that must NEVER reach a deposit-mode system prompt: the
// Read-satisfaction / refund framing belongs to the read lens only (F22/F28
// punt law — deposit prompts stay read-framing-free).
const READ_LENS_TOKENS = [/read-satisfaction/i, /refund/i];

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
      `${spec.title}: renders the hierarchical deposit system prompt lens-correctly`,
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

        // (a) Every lens-correct PTRR layer composes into the system prompt.
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

        // (d) Lens purity: no read-lens verbiage under deposit.
        for (const token of READ_LENS_TOKENS) {
          expect(allSystems).not.toMatch(token);
        }
      },
      30000,
    );
  }

  it('DepositAssetPackSynthesisAgent + DepositValidationAgent instructions carry the deposit measurement catalog', async () => {
    // The deposit lens measures with the DEPOSIT catalog kinds (never the read
    // lens's need-fit measurement) — pin the catalog into both prompt contracts.
    const synthesisSpec = SPECS.find((spec) => spec.agent === DepositAssetPackSynthesisAgent)!;
    const validationSpec = SPECS.find((spec) => spec.agent === DepositValidationAgent)!;

    const synthesisCalls = await runAgentAndCapture(synthesisSpec);
    const synthesisSystem = synthesisCalls[0].system;
    const validationCalls = await runAgentAndCapture(validationSpec);
    const validationSystem = validationCalls[0].system;

    expect(DEPOSIT_MEASUREMENT_CATALOG.length).toBeGreaterThan(0);
    for (const measurementSpec of DEPOSIT_MEASUREMENT_CATALOG) {
      expect(synthesisSystem).toContain(measurementSpec.measurementKind);
      expect(validationSystem).toContain(measurementSpec.measurementKind);
    }
  }, 60000);
});
