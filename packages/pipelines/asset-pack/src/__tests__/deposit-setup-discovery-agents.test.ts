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
// - the deposit Setup punts (setup-plan + danger-wall) are no-LLM passthroughs
//   registered by the conditional runtime registry, and the danger-wall punt
//   never emits a short-circuit signal;
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
import { assetPackSetupPhaseExecutor } from '../phases/setup';
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

/** A minimal schema-valid measured-patch option for the Implementation agent. */
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
    expect(out.guidance).toEqual(MOCK_DEPOSITORY_GUIDANCE);
    expect(out.guidance.underservedTopics).toEqual(['idempotent invoice replay']);
    expectNoEnvelopeLeak(out);
    expect(exec.get('discovery', 'depositorySearch')).toEqual(MOCK_DEPOSITORY_GUIDANCE);
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

  it('a minimal model response ({summary} only) satisfies the lens schemas without a retry storm', async () => {
    setBoundaryLLMOutput({ guidance: { summary: 'Minimal demand guidance.' } });
    const exec = new Execution('discovery-node');

    const out = await runDepositDepositorySearchAgent(DEPOSIT_INPUT, exec);

    // One required string; every array dimension is optional — the schema is
    // satisfiable by the leanest well-formed model response.
    expect(out.guidance).toEqual({ summary: 'Minimal demand guidance.' });
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
    // Bounded runtime note: each failed parse waits parseResponse's fixed
    // 1s+2s repair delays, so this run takes ~25s of deterministic backoff —
    // the generous timeout below is headroom, not an invitation to spin.
  }, 120000);

  it('depository-search guidance lands where the Implementation synthesis agent reads it', async () => {
    // Discovery writes discovery:depositorySearch on the execution node...
    setBoundaryLLMOutput({ guidance: MOCK_DEPOSITORY_GUIDANCE });
    const exec = new Execution('shared-node');
    await runDepositDepositorySearchAgent(DEPOSIT_INPUT, exec);
    expect(exec.get('discovery', 'depositorySearch')).toEqual(MOCK_DEPOSITORY_GUIDANCE);

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

describe('deposit Setup conditional runtime registry (punts + comprehension override)', () => {
  beforeEach(() => {
    resetBoundaryLLMCalls();
    resetBoundaryLLMOutput();
  });
  afterEach(() => resetBoundaryLLMOutput());

  /** Register recording stubs for every agent key the setup sequence resolves. */
  function registerRecordingSetupStubs(exec: any) {
    const invoked: string[] = [];
    const stubs: Record<string, any> = {};
    const keys = [
      'setup:asset-pack-clone-vcs-repository-agent',
      'setup:ReadFitsFindingSynthesisSetupPlanAgent',
      'setup:ReadFitsFindingSynthesisReadComprehensionAgent',
      'setup:asset-pack-danger-wall-agent',
      'setup:asset-pack-initialize-mcps-tools-agent',
    ];
    for (const key of keys) {
      // Arity >= 1 so resolveRegisteredAgent treats these as agents, not loaders.
      const stub = async (input: any, _execution: any) => {
        invoked.push(key);
        return input;
      };
      stubs[key] = stub;
      exec.agents.registerAgent(key, stub);
    }
    return { invoked, stubs };
  }

  it('deposit mode punts setup-plan + danger-wall to no-LLM passthroughs and runs the deposit comprehension', async () => {
    setBoundaryLLMOutput({ comprehension: MOCK_OBFUSCATION_COMPREHENSION });
    const exec = new AgentExecution('pipeline:setup-test');
    exec.store('synthesize-asset-packs', 'mode', 'deposit');
    const { invoked, stubs } = registerRecordingSetupStubs(exec);

    const result = await assetPackSetupPhaseExecutor(DEPOSIT_INPUT, exec);

    // Pure sequence-and-save: the phase forwards its input unchanged.
    expect(result).toBe(DEPOSIT_INPUT);

    // The punted keys and the comprehension key were re-registered away from the
    // canonical registrations; clone + MCPs-init still run the canonical slots.
    expect(invoked).toContain('setup:asset-pack-clone-vcs-repository-agent');
    expect(invoked).toContain('setup:asset-pack-initialize-mcps-tools-agent');
    expect(invoked).not.toContain('setup:ReadFitsFindingSynthesisSetupPlanAgent');
    expect(invoked).not.toContain('setup:asset-pack-danger-wall-agent');
    expect(invoked).not.toContain('setup:ReadFitsFindingSynthesisReadComprehensionAgent');

    // The comprehension slot now resolves to the deposit input-comprehension
    // agent, which ran the boundary-mocked PTRR and stored setup evidence.
    expect(exec.agents.getAgent('setup:ReadFitsFindingSynthesisReadComprehensionAgent')).toBe(
      depositInputComprehensionDefault,
    );
    expect(exec.get('setup', 'inputComprehension')).toEqual(MOCK_OBFUSCATION_COMPREHENSION);
    expect(getBoundaryLLMCalls().length).toBeGreaterThan(0);

    // The punts NEVER invoke the LLM: calling the registered passthroughs
    // directly performs zero boundary LLM calls and forwards the input.
    const setupPlanPunt = exec.agents.getAgent('setup:ReadFitsFindingSynthesisSetupPlanAgent');
    const dangerWallPunt = exec.agents.getAgent('setup:asset-pack-danger-wall-agent');
    expect(setupPlanPunt).not.toBe(stubs['setup:ReadFitsFindingSynthesisSetupPlanAgent']);
    expect(dangerWallPunt).not.toBe(stubs['setup:asset-pack-danger-wall-agent']);

    resetBoundaryLLMCalls();
    const sentinel = { marker: 'punt-passthrough' };
    const setupPlanOut = await setupPlanPunt(sentinel, exec);
    const dangerWallOut = await dangerWallPunt(sentinel, exec);
    expect(setupPlanOut).toBe(sentinel);
    expect(dangerWallOut).toBe(sentinel);
    expect(getBoundaryLLMCalls().length).toBe(0);
    // The danger-wall punt never emits a short-circuit signal.
    expect(dangerWallOut.signal).toBeUndefined();
  }, 60000);

  it('read mode leaves the canonical setup registrations untouched (no punts, no re-registration)', async () => {
    const exec = new AgentExecution('pipeline:setup-test');
    // No mode stored -> the executor resolves 'read'.
    const { invoked, stubs } = registerRecordingSetupStubs(exec);

    const result = await assetPackSetupPhaseExecutor(DEPOSIT_INPUT, exec);

    expect(result).toBe(DEPOSIT_INPUT);
    // Every canonical slot ran exactly the registration it started with.
    expect(invoked).toEqual([
      'setup:asset-pack-clone-vcs-repository-agent',
      'setup:ReadFitsFindingSynthesisSetupPlanAgent',
      'setup:ReadFitsFindingSynthesisReadComprehensionAgent',
      'setup:asset-pack-danger-wall-agent',
      'setup:asset-pack-initialize-mcps-tools-agent',
    ]);
    for (const [key, stub] of Object.entries(stubs)) {
      expect(exec.agents.getAgent(key)).toBe(stub);
    }
    expect(getBoundaryLLMCalls().length).toBe(0);
  }, 30000);
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

  it('deposit mode registers exactly the three deposit lenses and never touches the read roster', () => {
    const registry = recordingRegistry();
    registerDiscoveryAgents(registry, 'deposit');
    expect([...registry.registrations.keys()].sort()).toEqual([
      'discovery:codebase-comprehension',
      'discovery:depository-search',
      'discovery:inherent-regurgitation',
    ]);
  });

  it('default/read mode registers the canonical five-agent read roster intact', () => {
    for (const mode of [undefined, 'read']) {
      const registry = recordingRegistry();
      registerDiscoveryAgents(registry, mode);
      expect([...registry.registrations.keys()]).toEqual([
        'discovery:gather-context',
        'discovery:understand-requirements',
        'discovery:research-approach',
        'discovery:plan-implementation',
        'discovery:assess-complexity',
      ]);
    }
  });
});
