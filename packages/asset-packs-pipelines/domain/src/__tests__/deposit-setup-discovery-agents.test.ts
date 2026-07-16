// @ts-nocheck
//
// Deposit Setup + Discovery agent contracts (V48 Gate 3).
//
// Inference is non-configurable (F26-A): the deposit-lens Setup/Discovery agents
// ALWAYS run the formal PTRR hierarchy. Determinism comes from mocking the LLM
// provider at the boundary — never from branches inside the pipeline.
//
// Pins per agent:
// - schema-valid mocked output flows to the expected store + typed result;
// - the PTRR envelope is unwrapped (F26-A/F27): consumers get the typed
//   structured output, never {context, output, finalOutput};
// - deposit Setup is deposit-native: clone → parallel LSP/MCP/obfuscations → danger wall;
// - depository-search guidance (incl. underservedTopics) lands where the
//   Implementation synthesis agent reads it (discovery:depositorySearch on the
//   shared execution node) and reaches the synthesis prompt;
// - a schema-INVALID canned response terminates as a bounded run (no infinite
//   retry storm).
jest.mock('@bitcode/generic-llms', () => require('./support/generic-llms-mock').makeGenericLLMsMock());

import { Execution } from '@bitcode/execution-generics';
import { AgentExecution } from '@bitcode/agent-generics';
import runDepositInputComprehensionAgent from '../agents/setup/deposit-input-comprehension-agent';
import depositInputComprehensionDefault from '../agents/setup/deposit-input-comprehension-agent';
import runDepositCodebaseComprehensionAgent from '../agents/discovery/deposit-codebase-comprehension-agent';
import runDepositDepositorySearchAgent from '../agents/discovery/deposit-depository-search-agent';
import runDepositInherentRegurgitationAgent from '../agents/discovery/deposit-inherent-regurgitation-agent';
import runDepositAssetPackSynthesisAgent from '../agents/implementation/deposit-asset-pack-synthesis-agent';
import { depositSetupPhase } from '../phases/deposit-phases';
import { registerDiscoveryAgents } from '../phases/discovery';
import {
  setBoundaryLLMOutput,
  resetBoundaryLLMOutput,
  getBoundaryLLMCalls,
  getBoundaryLLMPromptText,
  resetBoundaryLLMCalls,
} from './support/generic-llms-mock';

const DEPOSIT_INPUT = {
  obfuscations: 'Withhold the pricing engine internals and every coefficient table.',
  repository: { fullName: 'acme/billing', branch: 'main' },
  inventory: {
    paths: ['src/pricing/engine.ts', 'src/api/routes.ts', 'src/net/retry.ts'],
    samples: [],
  },
  demandContext: [{ topic: 'billing reconciliation', volume: 0.7 }],
};

const MOCK_OBFUSCATION_COMPREHENSION = {
  summary: 'Withhold the pricing engine internals from every synthesized pack.',
  obfuscatedPaths: ['src/pricing/engine.ts'],
  obfuscatedConcepts: ['pricing heuristics'],
  honorNotes: ['Never name the pricing coefficients.'],
};

const MOCK_CODEBASE_COMPREHENSION = {
  summary: 'A billing service exposing reconciliation and resilient transport knowledge.',
  capabilities: ['invoice reconciliation', 'jittered retry transport'],
  knowledgeAreas: ['billing', 'network resilience'],
  notableModules: ['src/api/routes.ts', 'src/net/retry.ts'],
};

const MOCK_DEPOSITORY_GUIDANCE = {
  summary: 'Readers will demand billing reconciliation walkthroughs from this repository.',
  likelyReadTopics: ['billing reconciliation', 'retry patterns'],
  demandAlignment: ['matches the declared billing reconciliation demand context'],
  underservedTopics: ['idempotent invoice replay'],
  readabilityNotes: ['Frame packs around the reconciliation flow, not file layout.'],
};

const MOCK_REGURGITATION = {
  summary: 'Well-known billing-domain patterns bear on synthesizing these packs.',
  relevantKnowledge: ['double-entry reconciliation invariants'],
  patterns: ['retry with jittered exponential backoff'],
  references: ['idempotency-key convention'],
};

/** A minimal schema-valid deposit AssetPack option for the Implementation agent. */
const MOCK_SYNTHESIS_OPTION = {
  kind: 'capability-slice',
  title: 'Billing reconciliation capability slice',
  summary:
    'A bounded, source-safe capability slice covering invoice reconciliation flows and their retry-safe transport behavior.',
  coveredSourcePaths: ['src/api/routes.ts'],
  measurements: { 'source-coverage': 0.6 },
  measurementRationale: 'Covers the complete reconciliation route knowledge end to end.',
  confidence: 0.8,
  patch: {
    fileChanges: [{ path: 'src/api/routes.ts', op: 'modify' }],
    patchSummary: 'Encodes the reconciliation flow knowledge behind the billing routes.',
  },
};

/** The PTRR envelope keys must never leak through the wrapper output. */
function expectNoEnvelopeLeak(out: any) {
  expect('finalOutput' in out).toBe(false);
  expect('output' in out).toBe(false);
  expect('context' in out).toBe(false);
}

describe('deposit Setup input-comprehension agent (boundary-mocked PTRR)', () => {
  beforeEach(() => {
    resetBoundaryLLMCalls();
    resetBoundaryLLMOutput();
  });
  afterEach(() => resetBoundaryLLMOutput());

  it('flows a schema-valid mocked comprehension to the typed result and the setup stores', async () => {
    setBoundaryLLMOutput({ comprehension: MOCK_OBFUSCATION_COMPREHENSION });
    const exec = new Execution('setup-node');

    const out = await runDepositInputComprehensionAgent(DEPOSIT_INPUT, exec);

    expect(out.success).toBe(true);
    // Envelope unwrap (F26-A/F27): the typed comprehension, never the envelope.
    expect(out.comprehension).toEqual(MOCK_OBFUSCATION_COMPREHENSION);
    expectNoEnvelopeLeak(out);
    // Input forwarding: the wrapper returns {...input} so sequential piping keeps
    // the deposit context flowing to the next agent.
    expect(out.obfuscations).toBe(DEPOSIT_INPUT.obfuscations);
    expect(out.inventory).toBe(DEPOSIT_INPUT.inventory);

    // Both setup store keys carry the SAME comprehension.
    expect(exec.get('setup', 'inputComprehension')).toEqual(MOCK_OBFUSCATION_COMPREHENSION);
    expect(exec.get('setup', 'obfuscationComprehension')).toEqual(MOCK_OBFUSCATION_COMPREHENSION);
    expect(getBoundaryLLMCalls().length).toBeGreaterThan(0);
  }, 30000);

  it('skips LLM when Obfuscations are empty (no monorepo inventory thrash / timeout)', async () => {
    resetBoundaryLLMCalls();
    const exec = new Execution('setup-node-empty-obfuscations');
    const out = await runDepositInputComprehensionAgent(
      {
        ...DEPOSIT_INPUT,
        obfuscations: '',
      },
      exec,
    );

    expect(out.success).toBe(true);
    expect(out.comprehensionMode).toBe('empty-obfuscations-skip-llm');
    expect(out.comprehension).toMatchObject({
      obfuscatedPaths: [],
      obfuscatedConcepts: [],
      honorNotes: [],
    });
    expect(out.comprehension.summary).toMatch(/No explicit obfuscations/i);
    expect(exec.get('setup', 'inputComprehension')).toEqual(out.comprehension);
    expect(exec.get('setup', 'obfuscationComprehension')).toEqual(out.comprehension);
    // Zero provider calls — this is the fix for empty-obfuscation deposit timeouts.
    expect(getBoundaryLLMCalls().length).toBe(0);
  });
});

describe('deposit Discovery lens agents (boundary-mocked PTRR)', () => {
  beforeEach(() => {
    resetBoundaryLLMCalls();
    resetBoundaryLLMOutput();
  });
  afterEach(() => resetBoundaryLLMOutput());

  it('codebase-comprehension: typed knowledge map result + discovery:codebaseComprehension store', async () => {
    setBoundaryLLMOutput({ comprehension: MOCK_CODEBASE_COMPREHENSION });
    const exec = new Execution('discovery-node');

    const out = await runDepositCodebaseComprehensionAgent(DEPOSIT_INPUT, exec);

    expect(out.success).toBe(true);
    expect(out.comprehension).toEqual(MOCK_CODEBASE_COMPREHENSION);
    expectNoEnvelopeLeak(out);
    expect(exec.get('discovery', 'codebaseComprehension')).toEqual(MOCK_CODEBASE_COMPREHENSION);
  }, 30000);

  it('depository-search: typed guidance (incl. underservedTopics) + discovery:depositorySearch store', async () => {
    setBoundaryLLMOutput({ guidance: MOCK_DEPOSITORY_GUIDANCE });
    const exec = new Execution('discovery-node');

    const out = await runDepositDepositorySearchAgent(DEPOSIT_INPUT, exec);

    expect(out.success).toBe(true);
    // Host enriches guidance with searchQueries and may merge tool underservedTopics.
    expect(out.guidance.summary).toBe(MOCK_DEPOSITORY_GUIDANCE.summary);
    expect(out.guidance.likelyReadTopics).toEqual(MOCK_DEPOSITORY_GUIDANCE.likelyReadTopics);
    expect(out.guidance.underservedTopics).toEqual(
      expect.arrayContaining(['idempotent invoice replay']),
    );
    expect(Array.isArray(out.guidance.searchQueries)).toBe(true);
    expect(out.guidance.searchQueries!.length).toBeGreaterThan(0);
    expectNoEnvelopeLeak(out);
    expect(exec.get('discovery', 'depositorySearch').summary).toBe(MOCK_DEPOSITORY_GUIDANCE.summary);
  }, 30000);

  it('inherent-regurgitation: typed regurgitation result + discovery:inherentRegurgitation store', async () => {
    setBoundaryLLMOutput({ regurgitation: MOCK_REGURGITATION });
    const exec = new Execution('discovery-node');

    const out = await runDepositInherentRegurgitationAgent(DEPOSIT_INPUT, exec);

    expect(out.success).toBe(true);
    expect(out.regurgitation).toEqual(MOCK_REGURGITATION);
    expectNoEnvelopeLeak(out);
    expect(exec.get('discovery', 'inherentRegurgitation')).toEqual(MOCK_REGURGITATION);
  }, 30000);

  it('a minimal model response ({summary} only) satisfies the guidance schema without a retry storm', async () => {
    setBoundaryLLMOutput({ guidance: { summary: 'Minimal demand guidance.' } });
    const exec = new Execution('discovery-node');

    const out = await runDepositDepositorySearchAgent(DEPOSIT_INPUT, exec);

    // One required string; every array dimension is optional — the schema is
    // satisfiable by the leanest well-formed model response. Host still attaches
    // searchQueries for the Depository search tool.
    expect(out.guidance.summary).toBe('Minimal demand guidance.');
    expect(Array.isArray(out.guidance.searchQueries)).toBe(true);
    // No schema-driven retry storm: a straight PTRR run is 4 steps x 3 failsafes
    // x 3 generations = 36 LLM calls; stay comfortably at/below that baseline.
    expect(getBoundaryLLMCalls().length).toBeGreaterThan(0);
    expect(getBoundaryLLMCalls().length).toBeLessThanOrEqual(36);
  }, 30000);

  it('a schema-INVALID canned response terminates as a bounded run (never an infinite retry)', async () => {
    // guidance must be an object; a string can never validate. Every generation
    // in the PTRR run receives this same unusable content.
    setBoundaryLLMOutput({ guidance: 'not-an-object-so-never-schema-valid' });
    const exec = new Execution('discovery-node');

    const settled = await runDepositDepositorySearchAgent(DEPOSIT_INPUT, exec).then(
      (value) => ({ resolved: true, value }),
      (error) => ({ resolved: false, error }),
    );

    // Bounded failure: the run settles (resolve or reject) after a bounded
    // number of boundary LLM calls — it must not spin retries forever.
    const callCount = getBoundaryLLMCalls().length;
    expect(callCount).toBeGreaterThan(0);
    expect(callCount).toBeLessThanOrEqual(200);
    if (settled.resolved) {
      // When the machinery elects to complete anyway, the wrapper still hands
      // downstream a typed guidance object (string summary), never the raw
      // envelope or the unusable model text.
      expect(typeof settled.value.guidance).toBe('object');
      expect(typeof settled.value.guidance.summary).toBe('string');
      expectNoEnvelopeLeak(settled.value);
    }
    // Bounded runtime note: parseResponse is single-pass now (its old fixed
    // 1s+2s re-parse sleeps were removed as dead latency), so this run is
    // bounded by the generation machinery alone — the generous timeout below
    // is headroom, not an invitation to spin.
  }, 120000);

  it('depository-search guidance lands where the Implementation synthesis agent reads it', async () => {
    // Discovery writes discovery:depositorySearch on the execution node...
    setBoundaryLLMOutput({ guidance: MOCK_DEPOSITORY_GUIDANCE });
    const exec = new Execution('shared-node');
    await runDepositDepositorySearchAgent(DEPOSIT_INPUT, exec);
    expect(exec.get('discovery', 'depositorySearch').summary).toBe(MOCK_DEPOSITORY_GUIDANCE.summary);
    expect(exec.get('discovery', 'depositorySearch').underservedTopics).toEqual(
      expect.arrayContaining(['idempotent invoice replay']),
    );

    // ...and the Implementation agent, reading the same node, threads that
    // guidance (summary + underservedTopics) into its synthesis prompt.
    resetBoundaryLLMCalls();
    setBoundaryLLMOutput({ options: [MOCK_SYNTHESIS_OPTION] });
    const out = await runDepositAssetPackSynthesisAgent(DEPOSIT_INPUT, exec);
    expect(out.success).toBe(true);
    expect(out.options).toHaveLength(1);

    const promptText = getBoundaryLLMPromptText();
    expect(promptText).toContain(MOCK_DEPOSITORY_GUIDANCE.summary);
    expect(promptText).toContain('idempotent invoice replay');
  }, 60000);
});

describe('deposit Setup native sequence (clone → parallel bootstrap → danger wall)', () => {
  it('runs clone alone then parallel LSP/MCP/obfuscations then danger wall (no Fits Finding keys)', async () => {
    const exec = new AgentExecution('pipeline:setup-deposit-test');
    exec.store('synthesize-asset-packs', 'mode', 'deposit');
    exec.store('deposit', 'obfuscations', '');
    const invoked: string[] = [];
    const depositKeys = [
      'setup:clone-vcs-repository',
      'setup:initialize-lsp',
      'setup:initialize-mcps-tools',
      'setup:comprehend-obfuscations',
      'setup:danger-wall',
    ];
    const originalRegister = exec.agents.registerAgent.bind(exec.agents);
    exec.agents.registerAgent = (name: string, agent: any) => {
      if (depositKeys.includes(name)) {
        return originalRegister(name, async (input: any, execution: any) => {
          invoked.push(name);
          if (name === 'setup:comprehend-obfuscations') {
            execution.store('setup', 'inputComprehension', {
              summary: 'No Obfuscations declared.',
              obfuscatedPaths: [],
              obfuscatedConcepts: [],
              honorNotes: [],
            });
          }
          if (name === 'setup:danger-wall') {
            const { default: danger } = await import('../agents/setup/deposit-danger-wall-agent');
            return danger(input, execution);
          }
          return input;
        });
      }
      return originalRegister(name, agent);
    };

    await depositSetupPhase(DEPOSIT_INPUT as any, exec);

    expect(invoked[0]).toBe('setup:clone-vcs-repository');
    expect(invoked[invoked.length - 1]).toBe('setup:danger-wall');
    expect(invoked).toContain('setup:initialize-lsp');
    expect(invoked).toContain('setup:initialize-mcps-tools');
    expect(invoked).toContain('setup:comprehend-obfuscations');
    expect(invoked.some((k) => k.includes('ReadFitsFinding'))).toBe(false);
    expect(exec.get('setup', 'admission')?.safe).toBe(true);
  }, 60000);
});

describe('discovery conditional runtime registry roster', () => {
  function recordingRegistry() {
    const registrations = new Map<string, any>();
    return {
      registrations,
      registerAgent(key: string, agent: any) {
        registrations.set(key, agent);
      },
    };
  }

  it('deposit mode registers wave-1 + search-depository-for-deposit-relevants', () => {
    const registry = recordingRegistry();
    registerDiscoveryAgents(registry, 'deposit');
    expect([...registry.registrations.keys()].sort()).toEqual([
      'discovery:comprehend-codebase',
      'discovery:inherent-regurgitation',
      'discovery:search-depository-for-deposit-relevants',
    ]);
  });

  it('read mode registers wave-1 + search-depository-for-read-need-fits', () => {
    const registry = recordingRegistry();
    registerDiscoveryAgents(registry, 'read');
    expect([...registry.registrations.keys()].sort()).toEqual([
      'discovery:comprehend-codebase',
      'discovery:inherent-regurgitation',
      'discovery:search-depository-for-read-need-fits',
    ]);
  });
});
