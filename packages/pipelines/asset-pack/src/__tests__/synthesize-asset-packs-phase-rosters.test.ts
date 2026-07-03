// @ts-nocheck
/**
 * SynthesizeAssetPacks conditional runtime registries (V48 Gate 3).
 *
 * ONE SDIVF pipeline, two modes (deposit | read). Each phase resolves the mode
 * from the execution (F20 upward walk) and registers/resolves the
 * mode-appropriate agents under stable phase keys. These tests pin:
 *
 *  1. the exact per-phase agent ROSTER each mode registers (keys + which
 *     concrete agent module each key resolves to), and
 *  2. the per-phase execution order, observed by running the real phase
 *     delegators against a stub agent registry and walking the execution tree
 *     the delegators build (agent start/complete rows on seq-N children).
 *
 * Inference is non-configurable (F26-A): no real agent may run here, so the
 * delegator-walk harness resolves every phase key to a recording stub, and the
 * LLM boundary is mocked defensively for the real agent modules imported for
 * identity comparison.
 */
jest.mock('@bitcode/generic-llms', () =>
  require('./support/generic-llms-mock').makeGenericLLMsMock());

import { registerDiscoveryAgents } from '../phases/discovery';
import { registerImplementationAgents } from '../phases/implementation';
import { registerValidationAgentsForType } from '../phases/validation';
import { registerFinishAgentsForType } from '../phases/finish';
import { discoveryPhase, implementationPhase, validationPhase, finishPhase } from '../phases';
import { storeSynthesizeAssetPacksMode } from '../synthesize-asset-packs';

import depositCodebaseComprehensionAgent from '../agents/discovery/deposit-codebase-comprehension-agent';
import depositDepositorySearchAgent from '../agents/discovery/deposit-depository-search-agent';
import depositInherentRegurgitationAgent from '../agents/discovery/deposit-inherent-regurgitation-agent';
import depositAssetPackSynthesisAgent from '../agents/implementation/deposit-asset-pack-synthesis-agent';
import readFitsFindingSynthesisAssetPackSynthesisAgent from '../agents/implementation/read-fits-finding-synthesis-asset-pack-synthesis-agent';
import depositValidationAgent from '../agents/validation/deposit-validation-agent';
import { AssetPackValidationReadyToFinishAgent } from '../agents/validation-agents';
import uploadAssetPacksForReviewAgent from '../agents/finish/upload-asset-packs-for-review-agent';
import assetPackCompletionAgent from '../agents/finish/asset-pack-completion-agent';

// ---------- roster harness: a recording registry + lazy-loader resolution ----------

function fakeRegistry() {
  const entries = new Map<string, any>();
  return {
    entries,
    registerAgent: (key: string, agent: any) => { entries.set(key, agent); },
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
  it('deposit discovery registers exactly the three deposit lenses', async () => {
    const registry = fakeRegistry();
    registerDiscoveryAgents(registry, 'deposit');

    expect(Array.from(registry.entries.keys())).toEqual([
      'discovery:codebase-comprehension',
      'discovery:depository-search',
      'discovery:inherent-regurgitation',
    ]);
    expect(await resolveEntry(registry.entries.get('discovery:codebase-comprehension')))
      .toBe(depositCodebaseComprehensionAgent);
    expect(await resolveEntry(registry.entries.get('discovery:depository-search')))
      .toBe(depositDepositorySearchAgent);
    expect(await resolveEntry(registry.entries.get('discovery:inherent-regurgitation')))
      .toBe(depositInherentRegurgitationAgent);
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

  it('implementation registers the mode-appropriate synthesis agent under the SHARED key', async () => {
    const sharedKey = 'implementation:ReadFitsFindingSynthesisAssetPackSynthesisAgent';

    const depositRegistry = fakeRegistry();
    registerImplementationAgents(depositRegistry, 'deposit');
    expect(Array.from(depositRegistry.entries.keys())).toEqual([sharedKey]);
    expect(await resolveEntry(depositRegistry.entries.get(sharedKey)))
      .toBe(depositAssetPackSynthesisAgent);

    const readRegistry = fakeRegistry();
    registerImplementationAgents(readRegistry, 'read');
    expect(Array.from(readRegistry.entries.keys())).toEqual([sharedKey]);
    expect(await resolveEntry(readRegistry.entries.get(sharedKey)))
      .toBe(readFitsFindingSynthesisAssetPackSynthesisAgent);
  });

  it('deposit validation registers the quality validator then the ReadyToFinish gate', async () => {
    const registry = fakeRegistry();
    registerValidationAgentsForType('read-satisfaction-asset-pack', registry, 'deposit');

    expect(Array.from(registry.entries.keys())).toEqual([
      'validation:deposit-quality',
      'validation:asset-pack-ready-to-finish-agent',
    ]);
    expect(await resolveEntry(registry.entries.get('validation:deposit-quality')))
      .toBe(depositValidationAgent);
    expect(registry.entries.get('validation:asset-pack-ready-to-finish-agent'))
      .toBe(AssetPackValidationReadyToFinishAgent);
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
    expect(registry.entries.get('validation:asset-pack-ready-to-finish-agent'))
      .toBe(AssetPackValidationReadyToFinishAgent);
  });

  it.each([['deposit'], ['read']])(
    'finish (mode=%s) registers ONLY the upload-for-review deliver agent + completion (no PR creation)',
    async (mode) => {
      const registry = fakeRegistry();
      registerFinishAgentsForType('pull-request', registry, mode);

      expect(Array.from(registry.entries.keys())).toEqual([
        'finish:deliver-asset-pack-to-destination-agent',
        'finish:asset-pack-completion',
      ]);
      // The deliver key resolves to the Gate-3 upload-for-review agent, NOT the
      // legacy pull-request delivery agent (that is reserved for the future
      // Gate-6 SettleAssetPacks pipeline).
      expect(await resolveEntry(registry.entries.get('finish:deliver-asset-pack-to-destination-agent')))
        .toBe(uploadAssetPacksForReviewAgent);
      expect(await resolveEntry(registry.entries.get('finish:asset-pack-completion')))
        .toBe(assetPackCompletionAgent);
    },
  );
});

// ---------- delegator-walk harness: run the real phase delegators over stubs ----------

class FakeAgentsRegistry {
  stubs: Map<string, any>;
  registered: string[] = [];
  constructor(stubs: Map<string, any>) { this.stubs = stubs; }
  // Recording no-op: keeps the seeded stubs authoritative so no real agent
  // (and therefore no LLM boundary call) can run.
  registerAgent(key: string) { this.registered.push(key); }
  getAgent(key: string) { return this.stubs.get(key); }
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
  store(namespace: string, key: string, value: any) { this.values.set(`${namespace} ${key}`, value); }
  get(namespace: string, key: string) { return this.values.get(`${namespace} ${key}`); }
  findUp(namespace: string, key: string) {
    const value = this.get(namespace, key);
    return value !== undefined ? value : this.parent?.findUp(namespace, key);
  }
  child(id: string) { return new FakeExec(`${this.id}/${id}`, this); }
  getPath() { return this.id.split('/'); }
}

function harness(mode: 'deposit' | 'read', keys: string[]) {
  const calls: string[] = [];
  const stubs = new Map<string, any>();
  for (const key of keys) {
    stubs.set(key, async (input: any) => {
      calls.push(key);
      return { ...(input ?? {}), [`ran:${key}`]: true };
    });
  }
  const root = new FakeExec('pipeline-root', undefined, new FakeAgentsRegistry(stubs));
  storeSynthesizeAssetPacksMode(root, mode);
  return { calls, root };
}

/** Collect executed agent rows (namespace `agent:<key>`, key `complete`) across a subtree, in tree order. */
function walkAgentCompletions(node: FakeExec): Array<{ node: string; agent: string; status: string }> {
  const rows: Array<{ node: string; agent: string; status: string }> = [];
  for (const [storeKey, value] of node.values.entries()) {
    const [namespace, key] = storeKey.split(' ');
    if (namespace.startsWith('agent:') && key === 'complete') {
      rows.push({ node: node.id, agent: namespace.slice('agent:'.length), status: value?.status });
    }
  }
  for (const child of node.children.values()) rows.push(...walkAgentCompletions(child));
  return rows;
}

const DEPOSIT_DISCOVERY_KEYS = [
  'discovery:codebase-comprehension',
  'discovery:depository-search',
  'discovery:inherent-regurgitation',
];
const READ_DISCOVERY_KEYS = [
  'discovery:gather-context',
  'discovery:understand-requirements',
  'discovery:research-approach',
  'discovery:plan-implementation',
  'discovery:assess-complexity',
];
const IMPLEMENTATION_KEY = 'implementation:ReadFitsFindingSynthesisAssetPackSynthesisAgent';
const READ_VALIDATION_KEYS = [
  'validation:validate-last-iterations-validation-phase',
  'validation:validate-discovery-phase',
  'validation:validate-asset-pack-synthesis-artifacts',
  'validation:asset-pack-ready-to-finish-agent',
];
const FINISH_KEYS = [
  'finish:deliver-asset-pack-to-destination-agent',
  'finish:asset-pack-completion',
];

describe('phase delegators execute the mode roster in order (execution-tree walk)', () => {
  it('deposit discovery runs codebase-comprehension → depository-search → inherent-regurgitation', async () => {
    const { calls, root } = harness('deposit', DEPOSIT_DISCOVERY_KEYS);
    const phaseExec = root.child('seq-2');

    const output = await discoveryPhase({ seed: true }, phaseExec);

    expect(calls).toEqual(DEPOSIT_DISCOVERY_KEYS);
    // The three agents thread sequentially: the output carries every marker.
    expect(output).toMatchObject({
      seed: true,
      'ran:discovery:codebase-comprehension': true,
      'ran:discovery:depository-search': true,
      'ran:discovery:inherent-regurgitation': true,
    });
    // Walking the execution tree shows one completed agent row per seq child.
    expect(walkAgentCompletions(phaseExec)).toEqual([
      { node: 'pipeline-root/seq-2/seq-0', agent: 'discovery:codebase-comprehension', status: 'completed' },
      { node: 'pipeline-root/seq-2/seq-1', agent: 'discovery:depository-search', status: 'completed' },
      { node: 'pipeline-root/seq-2/seq-2', agent: 'discovery:inherent-regurgitation', status: 'completed' },
    ]);
  });

  it('read discovery runs the canonical five-agent sequence', async () => {
    const { calls, root } = harness('read', READ_DISCOVERY_KEYS);

    await discoveryPhase({ seed: true }, root.child('seq-2'));

    expect(calls).toEqual(READ_DISCOVERY_KEYS);
  });

  it('implementation resolves the single shared synthesis key in both modes', async () => {
    for (const mode of ['deposit', 'read'] as const) {
      const { calls, root } = harness(mode, [IMPLEMENTATION_KEY]);
      const output = await implementationPhase({ seed: true }, root.child('seq-2'));
      expect(calls).toEqual([IMPLEMENTATION_KEY]);
      expect(output[`ran:${IMPLEMENTATION_KEY}`]).toBe(true);
    }
  });

  it('deposit validation runs deposit-quality then the ReadyToFinish gate', async () => {
    const { calls, root } = harness('deposit', [
      'validation:deposit-quality',
      'validation:asset-pack-ready-to-finish-agent',
    ]);

    await validationPhase({ seed: true }, root.child('seq-2'));

    expect(calls).toEqual([
      'validation:deposit-quality',
      'validation:asset-pack-ready-to-finish-agent',
    ]);
  });

  it('read validation runs the three parallel validators then the ReadyToFinish gate', async () => {
    const { calls, root } = harness('read', READ_VALIDATION_KEYS);

    await validationPhase({ seed: true }, root.child('seq-2'));

    // Parallel trio first (assert as a set — they run concurrently), gate last.
    expect(calls).toHaveLength(4);
    expect(new Set(calls.slice(0, 3))).toEqual(new Set(READ_VALIDATION_KEYS.slice(0, 3)));
    expect(calls[3]).toBe('validation:asset-pack-ready-to-finish-agent');
  });

  it.each([['deposit'], ['read']])(
    'finish (mode=%s) runs deliver-to-destination (upload) then completion',
    async (mode) => {
      const { calls, root } = harness(mode, FINISH_KEYS);

      await finishPhase({ seed: true }, root.child('seq-3'));

      expect(calls).toEqual(FINISH_KEYS);
    },
  );
});
