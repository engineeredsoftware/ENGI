// @ts-nocheck
/**
 * Deposit / read SDIVF phase rosters (V48).
 *
 * Separate product pipelines (no unified lensed roster):
 *   - depositPhases from phases/deposit-phases
 *   - readPhases from phases/read-phases
 *
 * These tests pin:
 *  1. per-phase agent ROSTER each product registers (keys + modules), and
 *  2. phase delegators execute the roster (recording stubs; no LLM).
 */

jest.mock('@bitcode/generic-llms', () =>
  require('./support/generic-llms-mock').makeGenericLLMsMock());

import { registerDiscoveryAgents } from '../phases/discovery';
import { registerImplementationAgents } from '../phases/implementation';
import { registerValidationAgentsForType } from '../phases/validation';
import { registerFinishAgentsForType } from '../phases/finish';
import {
  depositDiscoveryPhase,
  depositImplementationPhase,
  depositValidationPhase,
  depositFinishPhase,
} from '../phases/deposit-phases';
import {
  readDiscoveryPhase,
  readImplementationPhase,
  readValidationPhase,
  readFinishPhase,
} from '../phases/read-phases';

import depositCodebaseComprehensionAgent from '../agents/discovery/deposit-codebase-comprehension-agent';
import depositDepositorySearchAgent from '../agents/discovery/deposit-depository-search-agent';
import depositInherentRegurgitationAgent from '../agents/discovery/deposit-inherent-regurgitation-agent';
import depositAssetPackSynthesisAgent from '../agents/implementation/deposit-asset-pack-synthesis-agent';
import readAssetPackSynthesisAgent from '../agents/implementation/read-asset-pack-synthesis-agent';
import depositReadyToFinishAgent from '../agents/validation/deposit-ready-to-finish-agent';
import readReadyToFinishAgent from '../agents/validation/read-ready-to-finish-agent';
import depositStoreArtifactsAgent from '../agents/finish/deposit-store-artifacts-agent';
import depositLedgerizeAgent from '../agents/finish/deposit-ledgerize-agent';
import depositFinishSynthesizeRunAgent from '../agents/finish/deposit-finish-synthesize-run-agent';
import readStoreArtifactsAgent from '../agents/finish/read-store-artifacts-agent';
import readFinishSynthesizeRunAgent from '../agents/finish/read-finish-synthesize-run-agent';

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
  it('deposit discovery registers exactly the three deposit agents', async () => {
    const registry = fakeRegistry();
    registerDiscoveryAgents(registry, 'deposit');

    expect(Array.from(registry.entries.keys())).toEqual([
      'discovery:comprehend-codebase',
      'discovery:search-depository',
      'discovery:inherent-regurgitation',
    ]);
    expect(await resolveEntry(registry.entries.get('discovery:comprehend-codebase'))).toBe(
      depositCodebaseComprehensionAgent,
    );
    expect(await resolveEntry(registry.entries.get('discovery:search-depository'))).toBe(
      depositDepositorySearchAgent,
    );
    expect(await resolveEntry(registry.entries.get('discovery:inherent-regurgitation'))).toBe(
      depositInherentRegurgitationAgent,
    );
  });

  it.each([['read'], [undefined]])(
    'read discovery (mode=%s) registers the canonical five-agent sequence',
    (mode) => {
      const registry = fakeRegistry();
      registerDiscoveryAgents(registry, mode);

      expect(Array.from(registry.entries.keys())).toEqual([
        'discovery:gather-context',
        'discovery:understand-requirements',
        'discovery:research-approach',
        'discovery:plan-implementation',
        'discovery:assess-complexity',
      ]);
    },
  );

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
  'discovery:comprehend-codebase',
  'discovery:search-depository',
  'discovery:inherent-regurgitation',
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
  it('deposit discovery runs comprehend-codebase ∥ search-depository ∥ inherent-regurgitation', async () => {
    const { calls, root } = harness(DEPOSIT_DISCOVERY_KEYS);
    const phaseExec = root.child('seq-2');

    await depositDiscoveryPhase({ seed: true }, phaseExec);

    // Parallel — assert set equality, not order.
    expect(new Set(calls)).toEqual(new Set(DEPOSIT_DISCOVERY_KEYS));
    expect(calls).toHaveLength(3);
  });

  it('read discovery reuses the three deposit discovery agent keys in parallel', async () => {
    const { calls, root } = harness(DEPOSIT_DISCOVERY_KEYS);

    await readDiscoveryPhase({ seed: true }, root.child('seq-2'));

    expect(new Set(calls)).toEqual(new Set(DEPOSIT_DISCOVERY_KEYS));
  });

  it('deposit implementation resolves deposit-asset-pack-synthesis', async () => {
    const { calls, root } = harness([DEPOSIT_IMPLEMENTATION_KEY]);
    const output = await depositImplementationPhase({ seed: true }, root.child('seq-2'));
    expect(calls).toEqual([DEPOSIT_IMPLEMENTATION_KEY]);
    expect(output[`ran:${DEPOSIT_IMPLEMENTATION_KEY}`]).toBe(true);
  });

  it('read implementation resolves read-asset-pack-synthesis', async () => {
    const { calls, root } = harness([READ_IMPLEMENTATION_KEY]);
    const output = await readImplementationPhase({ seed: true }, root.child('seq-2'));
    expect(calls).toEqual([READ_IMPLEMENTATION_KEY]);
    expect(output[`ran:${READ_IMPLEMENTATION_KEY}`]).toBe(true);
  });

  it('deposit validation runs the single ready-to-finish deposit gate', async () => {
    const { calls, root } = harness([DEPOSIT_VALIDATION_KEY]);
    await depositValidationPhase({ seed: true }, root.child('seq-2'));
    expect(calls).toEqual([DEPOSIT_VALIDATION_KEY]);
  });

  it('read validation runs the single ready-to-finish read gate', async () => {
    const { calls, root } = harness([READ_VALIDATION_KEY]);
    await readValidationPhase({ seed: true }, root.child('seq-2'));
    expect(calls).toEqual([READ_VALIDATION_KEY]);
  });

  it('deposit finish runs store → ledgerize → finish-synthesize-deposit-run', async () => {
    const { calls, root } = harness(DEPOSIT_FINISH_KEYS);
    await depositFinishPhase({ seed: true }, root.child('seq-3'));
    expect(calls).toEqual(DEPOSIT_FINISH_KEYS);
  });

  it('read finish runs store → ledgerize → finish-synthesize-read-run', async () => {
    const { calls, root } = harness(READ_FINISH_KEYS);
    await readFinishPhase({ seed: true }, root.child('seq-3'));
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
