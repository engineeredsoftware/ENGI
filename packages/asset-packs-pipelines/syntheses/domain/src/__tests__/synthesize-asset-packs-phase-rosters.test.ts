// @ts-nocheck
/**
 * Deposit / read SDIVF phase rosters (V48).
 *
 * Separate product pipelines (no unified lensed roster):
 *   - executionPipelineSDIVFExecutionPhaseSynthesisDepositAssetPacks from phases/execution-pipeline-sdivf-execution-phase-synthesis-deposit-asset-packs
 *   - executionPipelineSDIVFExecutionPhaseSynthesisReadAssetPacks from phases/execution-pipeline-sdivf-execution-phase-synthesis-read-asset-packs
 *
 * These tests pin:
 *  1. per-phase agent ROSTER each product registers (keys + modules), and
 *  2. phase delegators execute the roster (recording stubs; no LLM).
 */

jest.mock('@bitcode/generic-llms', () =>
  require('./support/generic-llms-mock').makeGenericLLMsMock());

import {
  registerDiscoveryAgents,
  DISCOVERY_COMPREHEND_CODEBASE,
  DISCOVERY_INHERENT_REGURGITATION,
  DISCOVERY_SEARCH_DEPOSITORY_FOR_DEPOSIT_RELEVANTS,
  DISCOVERY_SEARCH_DEPOSITORY_FOR_READ_NEED_FITS,
} from '../phases/discovery';
import { registerImplementationAgents } from '../phases/implementation';
import { registerValidationAgentsForType } from '../phases/validation';
import { registerFinishAgentsForType } from '../phases/finish';
import {
  executionPipelineSDIVFExecutionPhaseDiscoverySynthesisDepositAssetPacks,
  executionPipelineSDIVFExecutionPhaseImplementationSynthesisDepositAssetPacks,
  executionPipelineSDIVFExecutionPhaseValidationSynthesisDepositAssetPacks,
  executionPipelineSDIVFExecutionPhaseFinishSynthesisDepositAssetPacks,
} from '../../../deposit/src/phases/execution-pipeline-sdivf-execution-phase-synthesis-deposit-asset-packs';
import {
  executionPipelineSDIVFExecutionPhaseDiscoverySynthesisReadAssetPacks,
  executionPipelineSDIVFExecutionPhaseImplementationSynthesisReadAssetPacks,
  executionPipelineSDIVFExecutionPhaseValidationSynthesisReadAssetPacks,
  executionPipelineSDIVFExecutionPhaseFinishSynthesisReadAssetPacks,
} from '../../../read/src/phases/execution-pipeline-sdivf-execution-phase-synthesis-read-asset-packs';

import depositCodebaseComprehensionAgent from '../../../deposit/src/agents/discovery/deposit-codebase-comprehension-agent';
import depositDepositorySearchAgent from '../../../deposit/src/agents/discovery/deposit-depository-search-agent';
import readDepositorySearchForNeedFitsAgent from '../../../read/src/agents/discovery/read-depository-search-for-need-fits-agent';
import depositInherentRegurgitationAgent from '../../../deposit/src/agents/discovery/deposit-inherent-regurgitation-agent';
import depositAssetPackSynthesisAgent from '../../../deposit/src/agents/implementation/deposit-asset-pack-synthesis-agent';
import readAssetPackSynthesisAgent from '../../../read/src/agents/implementation/read-asset-pack-synthesis-agent';
import depositReadyToFinishAgent from '../../../deposit/src/agents/validation/deposit-ready-to-finish-agent';
import readReadyToFinishAgent from '../../../read/src/agents/validation/read-ready-to-finish-agent';
import depositStoreArtifactsAgent from '../../../deposit/src/agents/finish/deposit-store-artifacts-agent';
import depositLedgerizeAgent from '../agents/finish/deposit-ledgerize-agent';
import depositFinishSynthesizeRunAgent from '../../../deposit/src/agents/finish/deposit-finish-synthesize-run-agent';
import readStoreArtifactsAgent from '../../../read/src/agents/finish/read-store-artifacts-agent';
import readFinishSynthesizeRunAgent from '../../../read/src/agents/finish/read-finish-synthesize-run-agent';

// ---------- roster harness: a recording registry + lazy-loader resolution ----------

function fakeRegistry() {
  const entries = new Map<string, any>();
  return {
    entries,
    registerAgent: (key: string, agent: any) => {
      entries.set(key, agent);
    },
  };
}

/** Resolve a registered entry the way resolveRegisteredAgent does (lazy loaders have arity 0). */
async function resolveEntry(entry: any) {
  if (typeof entry === 'function' && entry.length === 0) {
    const loaded = await entry();
    return typeof loaded === 'function' ? loaded : loaded?.default;
  }
  return entry;
}

describe('per-mode agent rosters (conditional runtime registries)', () => {
  it('deposit discovery registers wave-1 agents + deposit-relevants search', async () => {
    const registry = fakeRegistry();
    registerDiscoveryAgents(registry, 'deposit');

    expect(Array.from(registry.entries.keys())).toEqual([
      DISCOVERY_COMPREHEND_CODEBASE,
      DISCOVERY_INHERENT_REGURGITATION,
      DISCOVERY_SEARCH_DEPOSITORY_FOR_DEPOSIT_RELEVANTS,
    ]);
    expect(await resolveEntry(registry.entries.get(DISCOVERY_COMPREHEND_CODEBASE))).toBe(
      depositCodebaseComprehensionAgent,
    );
    expect(
      await resolveEntry(registry.entries.get(DISCOVERY_SEARCH_DEPOSITORY_FOR_DEPOSIT_RELEVANTS)),
    ).toBe(depositDepositorySearchAgent);
    expect(await resolveEntry(registry.entries.get(DISCOVERY_INHERENT_REGURGITATION))).toBe(
      depositInherentRegurgitationAgent,
    );
  });

  it('read discovery registers wave-1 agents + read-need-fits search', async () => {
    const registry = fakeRegistry();
    registerDiscoveryAgents(registry, 'read');

    expect(Array.from(registry.entries.keys())).toEqual([
      DISCOVERY_COMPREHEND_CODEBASE,
      DISCOVERY_INHERENT_REGURGITATION,
      DISCOVERY_SEARCH_DEPOSITORY_FOR_READ_NEED_FITS,
    ]);
    expect(
      await resolveEntry(registry.entries.get(DISCOVERY_SEARCH_DEPOSITORY_FOR_READ_NEED_FITS)),
    ).toBe(readDepositorySearchForNeedFitsAgent);
  });

  it('default (non-read) discovery registers deposit-relevants search', () => {
    const registry = fakeRegistry();
    registerDiscoveryAgents(registry, undefined);
    expect(Array.from(registry.entries.keys())).toContain(
      DISCOVERY_SEARCH_DEPOSITORY_FOR_DEPOSIT_RELEVANTS,
    );
    expect(Array.from(registry.entries.keys())).not.toContain(
      DISCOVERY_SEARCH_DEPOSITORY_FOR_READ_NEED_FITS,
    );
  });

  it('implementation registers deposit-named vs read synthesis keys by mode', async () => {
    const depositKey = 'implementation:deposit-asset-pack-synthesis';
    const readKey = 'implementation:ReadFitsFindingSynthesisAssetPackSynthesisAgent';

    const depositRegistry = fakeRegistry();
    registerImplementationAgents(depositRegistry, 'deposit');
    expect(Array.from(depositRegistry.entries.keys())).toEqual([depositKey]);
    expect(await resolveEntry(depositRegistry.entries.get(depositKey))).toBe(
      depositAssetPackSynthesisAgent,
    );

    const readRegistry = fakeRegistry();
    registerImplementationAgents(readRegistry, 'read');
    expect(Array.from(readRegistry.entries.keys())).toEqual([readKey]);
  });

  it('deposit validation registers the single deposit ready-to-finish gate', async () => {
    const registry = fakeRegistry();
    registerValidationAgentsForType('read-satisfaction-asset-pack', registry, 'deposit');

    expect(Array.from(registry.entries.keys())).toEqual([
      'validation:ready-to-finish-asset-packs-synthesis-deposit-pipeline',
    ]);
    expect(
      await resolveEntry(
        registry.entries.get(
          'validation:ready-to-finish-asset-packs-synthesis-deposit-pipeline',
        ),
      ),
    ).toBe(depositReadyToFinishAgent);
  });

  it('read validation registers the three parallel validators plus the ReadyToFinish gate', () => {
    const registry = fakeRegistry();
    registerValidationAgentsForType('read-satisfaction-asset-pack', registry, 'read');

    expect(Array.from(registry.entries.keys())).toEqual([
      'validation:validate-last-iterations-validation-phase',
      'validation:validate-discovery-phase',
      'validation:validate-asset-pack-synthesis-artifacts',
      'validation:asset-pack-ready-to-finish-agent',
    ]);
  });

  it.each([['deposit'], ['read']])(
    'finish (mode=%s) registers review-upload + completion only (no PR ship; settle owns PR)',
    async (mode) => {
      const registry = fakeRegistry();
      registerFinishAgentsForType('pull-request', registry, mode as any);

      expect(Array.from(registry.entries.keys())).toEqual([
        'finish:upload-asset-packs-for-review',
        'finish:asset-pack-completion',
      ]);
    },
  );
});

// ---------- delegator-walk harness: run the real product phase delegators over stubs ----------

class FakeAgentsRegistry {
  stubs: Map<string, any>;
  registered: string[] = [];
  constructor(stubs: Map<string, any>) {
    this.stubs = stubs;
  }
  // Recording no-op: keeps the seeded stubs authoritative so no real agent
  // (and therefore no LLM boundary call) can run.
  registerAgent(key: string) {
    this.registered.push(key);
  }
  getAgent(key: string) {
    return this.stubs.get(key);
  }
}

class FakeExec {
  id: string;
  parent: FakeExec | undefined;
  children = new Map<string, FakeExec>();
  values = new Map<string, any>();
  agents: FakeAgentsRegistry;
  constructor(id: string, parent?: FakeExec, agents?: FakeAgentsRegistry) {
    this.id = id;
    this.parent = parent;
    this.agents = agents ?? parent!.agents;
    if (parent) parent.children.set(id, this);
  }
  store(namespace: string, key: string, value: any) {
    this.values.set(`${namespace}\0${key}`, value);
  }
  get(namespace: string, key: string) {
    return this.values.get(`${namespace}\0${key}`);
  }
  findUp(namespace: string, key: string) {
    const value = this.get(namespace, key);
    return value !== undefined ? value : this.parent?.findUp(namespace, key);
  }
  child(id: string) {
    return new FakeExec(`${this.id}/${id}`, this);
  }
  getPath() {
    return this.id.split('/');
  }
}

function harness(keys: string[]) {
  const calls: string[] = [];
  const stubs = new Map<string, any>();
  for (const key of keys) {
    stubs.set(key, async (input: any) => {
      calls.push(key);
      return { ...(input ?? {}), [`ran:${key}`]: true };
    });
  }
  const root = new FakeExec('pipeline-root', undefined, new FakeAgentsRegistry(stubs));
  return { calls, root };
}

const DEPOSIT_DISCOVERY_KEYS = [
  DISCOVERY_COMPREHEND_CODEBASE,
  DISCOVERY_INHERENT_REGURGITATION,
  DISCOVERY_SEARCH_DEPOSITORY_FOR_DEPOSIT_RELEVANTS,
];
const READ_DISCOVERY_KEYS = [
  DISCOVERY_COMPREHEND_CODEBASE,
  DISCOVERY_INHERENT_REGURGITATION,
  DISCOVERY_SEARCH_DEPOSITORY_FOR_READ_NEED_FITS,
];
const DEPOSIT_IMPLEMENTATION_KEY = 'implementation:deposit-asset-pack-synthesis';
const DEPOSIT_VALIDATION_KEY =
  'validation:ready-to-finish-asset-packs-synthesis-deposit-pipeline';
const DEPOSIT_FINISH_KEYS = [
  'finish:store-artifacts',
  'finish:ledgerize',
  'finish:finish-synthesize-asset-packs-for-deposit-run',
];
const READ_IMPLEMENTATION_KEY = 'implementation:read-asset-pack-synthesis';
const READ_VALIDATION_KEY = 'validation:ready-to-finish-asset-packs-synthesis-read-pipeline';
const READ_FINISH_KEYS = [
  'finish:store-artifacts',
  'finish:ledgerize',
  'finish:finish-synthesize-asset-packs-for-read-run',
];

describe('product phase delegators execute the roster (execution-tree walk)', () => {
  it('deposit discovery: parallel(comprehend, regurgitation) then deposit-relevants search', async () => {
    const { calls, root } = harness(DEPOSIT_DISCOVERY_KEYS);
    const phaseExec = root.child('seq-2');

    await executionPipelineSDIVFExecutionPhaseDiscoverySynthesisDepositAssetPacks({ seed: true }, phaseExec);

    expect(calls).toHaveLength(3);
    // Wave 1 (either order) then wave 2 search last.
    expect(new Set(calls.slice(0, 2))).toEqual(
      new Set([DISCOVERY_COMPREHEND_CODEBASE, DISCOVERY_INHERENT_REGURGITATION]),
    );
    expect(calls[2]).toBe(DISCOVERY_SEARCH_DEPOSITORY_FOR_DEPOSIT_RELEVANTS);
  });

  it('read discovery: parallel(comprehend, regurgitation) then read-need-fits search', async () => {
    const { calls, root } = harness(READ_DISCOVERY_KEYS);

    await executionPipelineSDIVFExecutionPhaseDiscoverySynthesisReadAssetPacks({ seed: true }, root.child('seq-2'));

    expect(calls).toHaveLength(3);
    expect(new Set(calls.slice(0, 2))).toEqual(
      new Set([DISCOVERY_COMPREHEND_CODEBASE, DISCOVERY_INHERENT_REGURGITATION]),
    );
    expect(calls[2]).toBe(DISCOVERY_SEARCH_DEPOSITORY_FOR_READ_NEED_FITS);
  });

  it('deposit implementation resolves deposit-asset-pack-synthesis', async () => {
    const { calls, root } = harness([DEPOSIT_IMPLEMENTATION_KEY]);
    const output = await executionPipelineSDIVFExecutionPhaseImplementationSynthesisDepositAssetPacks({ seed: true }, root.child('seq-2'));
    expect(calls).toEqual([DEPOSIT_IMPLEMENTATION_KEY]);
    expect(output[`ran:${DEPOSIT_IMPLEMENTATION_KEY}`]).toBe(true);
  });

  it('read implementation resolves read-asset-pack-synthesis', async () => {
    const { calls, root } = harness([READ_IMPLEMENTATION_KEY]);
    const output = await executionPipelineSDIVFExecutionPhaseImplementationSynthesisReadAssetPacks({ seed: true }, root.child('seq-2'));
    expect(calls).toEqual([READ_IMPLEMENTATION_KEY]);
    expect(output[`ran:${READ_IMPLEMENTATION_KEY}`]).toBe(true);
  });

  it('deposit validation runs the single ready-to-finish deposit gate', async () => {
    const { calls, root } = harness([DEPOSIT_VALIDATION_KEY]);
    await executionPipelineSDIVFExecutionPhaseValidationSynthesisDepositAssetPacks({ seed: true }, root.child('seq-2'));
    expect(calls).toEqual([DEPOSIT_VALIDATION_KEY]);
  });

  it('read validation runs the single ready-to-finish read gate', async () => {
    const { calls, root } = harness([READ_VALIDATION_KEY]);
    await executionPipelineSDIVFExecutionPhaseValidationSynthesisReadAssetPacks({ seed: true }, root.child('seq-2'));
    expect(calls).toEqual([READ_VALIDATION_KEY]);
  });

  it('deposit finish runs store → ledgerize → finish-synthesize-deposit-run', async () => {
    const { calls, root } = harness(DEPOSIT_FINISH_KEYS);
    await executionPipelineSDIVFExecutionPhaseFinishSynthesisDepositAssetPacks({ seed: true }, root.child('seq-3'));
    expect(calls).toEqual(DEPOSIT_FINISH_KEYS);
  });

  it('read finish runs store → ledgerize → finish-synthesize-read-run', async () => {
    const { calls, root } = harness(READ_FINISH_KEYS);
    await executionPipelineSDIVFExecutionPhaseFinishSynthesisReadAssetPacks({ seed: true }, root.child('seq-3'));
    expect(calls).toEqual(READ_FINISH_KEYS);
  });
});

// Identity smoke: product finish agents resolve to the expected modules when
// registered by deposit/read finish phases (not the legacy deliver/completion pair).
describe('product finish agent module identity', () => {
  it('deposit finish keys load store/ledgerize/finish-run modules', async () => {
    expect(depositStoreArtifactsAgent).toBeDefined();
    expect(depositLedgerizeAgent).toBeDefined();
    expect(depositFinishSynthesizeRunAgent).toBeDefined();
    expect(readStoreArtifactsAgent).toBeDefined();
    expect(readFinishSynthesizeRunAgent).toBeDefined();
    expect(readReadyToFinishAgent).toBeDefined();
    expect(readAssetPackSynthesisAgent).toBeDefined();
  });
});
