// @ts-nocheck
//
// Context/store contract for the SynthesizeAssetPacks DEPOSIT agents (V48 Gate 3).
//
// Pins, for every deposit agent handler:
//  (a) the typed structured output lands on the SHARED (root) execution under the
//      EXACT namespace:key pairs downstream consumers read (implementation reads
//      discovery:*/setup:inputComprehension; validation reads implementation:options;
//      the ReadyToFinish gate reads validation/implementation:issues; Finish reads
//      implementation:options/assetPack/summary; the /deposits route reads
//      implementation:options). This is the CROSS-PHASE STORE-VISIBILITY LAW:
//      sequential() runs every phase on an ISOLATED seq-N sibling and findUp walks
//      ANCESTORS only, so a producer storing on its own sibling subtree is invisible
//      to every consumer — producers MUST store cross-phase artifacts on the shared
//      execution (storeCrossPhaseArtifact → execution.getRoot()), where the
//      dispatching route reads them with a direct get and every phase sibling
//      resolves them via the upward walk,
//  (b) the PTRR envelope unwrap: factoryPTRRAgent returns
//      { context, output, finalOutput } and the typed fields live ONLY inside the
//      envelope — reading them off the envelope root is undefined (the F26-A/F27
//      latent-bug class), so handlers MUST unwrap finalOutput ?? output ?? raw,
//  (c) the cross-phase read law (F20, generalized): a store written on the SHARED
//      execution is visible from every sibling phase child via the upward walk, and
//      the real consumer handlers resolve those stores from there.
//
// Inference is non-configurable (F26-A): every deposit agent ALWAYS runs the
// formal PTRR hierarchy with real generation. Determinism comes ONLY from mocking
// the LLM provider at the boundary — never from a branch inside the pipeline.
jest.mock('@bitcode/generic-llms', () => require('./support/generic-llms-mock').makeGenericLLMsMock());

import { Execution } from '@bitcode/execution-generics';
import {
  setBoundaryLLMOutput,
  resetBoundaryLLMOutput,
  resetBoundaryLLMCalls,
  getBoundaryLLMPromptText,
} from './support/generic-llms-mock';
import { storeSynthesizeAssetPacksMode } from '../synthesize-asset-packs';
import runDepositInputComprehensionAgent, {
  DepositInputComprehensionAgent,
} from '../agents/setup/deposit-input-comprehension-agent';
import runDepositCodebaseComprehensionAgent, {
  DepositCodebaseComprehensionAgent,
} from '../agents/discovery/deposit-codebase-comprehension-agent';
import runDepositDepositorySearchAgent from '../agents/discovery/deposit-depository-search-agent';
import runDepositInherentRegurgitationAgent from '../agents/discovery/deposit-inherent-regurgitation-agent';
import runDepositAssetPackSynthesisAgent from '../agents/implementation/deposit-asset-pack-synthesis-agent';
import runDepositValidationAgent from '../agents/validation/deposit-validation-agent';
import runUploadAssetPacksForReviewAgent from '../agents/finish/upload-asset-packs-for-review-agent';

const REPOSITORY = {
  owner: 'engineeredsoftware',
  name: 'ENGI',
  fullName: 'engineeredsoftware/ENGI',
  branch: 'main',
};

const INVENTORY = {
  paths: ['src/auth/session.ts', 'src/auth/token.ts', 'src/billing/invoice.ts'],
  samples: [{ path: 'src/auth/session.ts', excerpt: 'export function createSession() {}' }],
};

/** A candidateSchema-valid measured-patch option (deposit implementation output). */
function measuredPatchOption(overrides: Record<string, unknown> = {}) {
  return {
    kind: 'capability-slice',
    title: 'Auth capability slice',
    summary:
      'A bounded, source-safe capability slice covering session authentication and token refresh flows.',
    coveredSourcePaths: ['src/auth/session.ts', 'src/auth/token.ts'],
    measurements: { 'source-coverage': 0.7, 'demand-alignment': 0.6, 'reuse-likelihood': 0.5 },
    measurementRationale: 'Covers both auth modules with moderate demand alignment.',
    confidence: 0.8,
    patch: {
      fileChanges: [
        { path: 'src/auth/session.ts', op: 'modify' },
        { path: 'src/auth/token.ts', op: 'create' },
      ],
      patchSummary: 'Adds a reusable session/token authentication capability.',
    },
    needinessSignal: { demand: 0.7, saturation: 0.3, rationale: 'Auth knowledge is frequently read.' },
    ...overrides,
  };
}

/** The factoryPTRRAgent return is the {context, output, finalOutput} envelope. */
function expectPTRREnvelope(raw: any) {
  expect(raw).toBeDefined();
  expect(typeof raw).toBe('object');
  expect(raw).toHaveProperty('context');
  expect(raw).toHaveProperty('output');
  expect(raw).toHaveProperty('finalOutput');
}

describe('deposit agent context/store contract', () => {
  beforeAll(() => {
    // Absolutes must take the deterministic descriptor-derived path in tests.
    delete process.env.BITCODE_ASSET_PACK_REAL_INFERENCE;
  });

  beforeEach(() => {
    resetBoundaryLLMOutput();
    resetBoundaryLLMCalls();
  });

  describe('Setup — runDepositInputComprehensionAgent', () => {
    it('unwraps the PTRR envelope and stores the obfuscation comprehension under setup:inputComprehension + setup:obfuscationComprehension', async () => {
      const comprehension = {
        summary: 'Withhold the secret signing module from every synthesized pack.',
        obfuscatedPaths: ['src/secret'],
        obfuscatedConcepts: ['signing keys'],
        honorNotes: ['Never cover src/secret in any AssetPack.'],
      };
      setBoundaryLLMOutput({ comprehension });

      const shared = new Execution('pipeline-root');
      const setupExec = shared.child('seq-1');

      // (b) Envelope pin: the raw PTRR agent returns {context, output, finalOutput};
      // the typed field lives ONLY inside the envelope (F26-A/F27 latent-bug class).
      const raw = await DepositInputComprehensionAgent(
        { obfuscations: 'hide the signing keys', repository: REPOSITORY, inventory: INVENTORY },
        setupExec,
      );
      expectPTRREnvelope(raw);
      expect(raw.finalOutput.comprehension).toEqual(comprehension);
      expect(raw.comprehension).toBeUndefined();

      // (a) Handler contract: unwrap + store on the SHARED execution under the
      // EXACT keys the implementation and validation agents read
      // (setup:inputComprehension) and the dedicated obfuscation record
      // (setup:obfuscationComprehension) — NOT on the producer's seq-1 sibling.
      const result = await runDepositInputComprehensionAgent(
        { obfuscations: 'hide the signing keys', repository: REPOSITORY, inventory: INVENTORY },
        setupExec,
      );
      expect(result.success).toBe(true);
      expect(result.comprehension).toEqual(comprehension);
      expect(shared.get('setup', 'inputComprehension')).toEqual(comprehension);
      expect(shared.get('setup', 'obfuscationComprehension')).toEqual(comprehension);
      // Consumer resolution: the Implementation/Validation phase siblings (and
      // their own sequential children) resolve the guidance via the upward walk.
      expect(shared.child('seq-2').findUp('setup', 'inputComprehension')).toEqual(comprehension);
      expect(shared.child('seq-2').child('seq-0').findUp('setup', 'obfuscationComprehension')).toEqual(
        comprehension,
      );
    }, 60000);
  });

  describe('Discovery — the three deposit discovery lenses', () => {
    it('codebase comprehension stores discovery:codebaseComprehension (the key the synthesis agent reads)', async () => {
      const comprehension = {
        summary: 'A payments platform with distinct auth and billing capabilities.',
        capabilities: ['session auth', 'invoice generation'],
        knowledgeAreas: ['authentication', 'billing'],
        notableModules: ['src/auth/session.ts', 'src/billing/invoice.ts'],
      };
      setBoundaryLLMOutput({ comprehension });

      const shared = new Execution('pipeline-root');
      const discoveryExec = shared.child('seq-2');

      // (b) Envelope pin on a discovery agent.
      const raw = await DepositCodebaseComprehensionAgent(
        { repository: REPOSITORY, inventory: INVENTORY },
        discoveryExec,
      );
      expectPTRREnvelope(raw);
      expect(raw.finalOutput.comprehension).toEqual(comprehension);
      expect(raw.comprehension).toBeUndefined();

      const result = await runDepositCodebaseComprehensionAgent(
        { repository: REPOSITORY, inventory: INVENTORY },
        discoveryExec,
      );
      expect(result.success).toBe(true);
      expect(result.comprehension).toEqual(comprehension);
      // Stored on the SHARED execution (cross-phase law), where the synthesis
      // agent (running under a different sibling) resolves it via the upward walk.
      expect(shared.get('discovery', 'codebaseComprehension')).toEqual(comprehension);
      expect(shared.child('seq-2').findUp('discovery', 'codebaseComprehension')).toEqual(comprehension);
    }, 60000);

    it('depository search stores discovery:depositorySearch (the key the synthesis agent reads)', async () => {
      const guidance = {
        summary: 'Auth knowledge satisfies frequent session-management reads.',
        likelyReadTopics: ['session auth'],
        demandAlignment: ['auth demand context matches the session module'],
        underservedTopics: ['token refresh'],
        readabilityNotes: ['Frame packs by capability, not by file.'],
      };
      setBoundaryLLMOutput({ guidance });

      const shared = new Execution('pipeline-root');
      const discoveryExec = shared.child('seq-2');
      const result = await runDepositDepositorySearchAgent(
        { repository: REPOSITORY, inventory: INVENTORY, demandContext: ['session auth reads'] },
        discoveryExec,
      );
      expect(result.success).toBe(true);
      expect(result.guidance).toEqual(guidance);
      // Stored on the SHARED execution (cross-phase law).
      expect(shared.get('discovery', 'depositorySearch')).toEqual(guidance);
      expect(shared.child('seq-2').findUp('discovery', 'depositorySearch')).toEqual(guidance);
    }, 60000);

    it('inherent regurgitation stores discovery:inherentRegurgitation (the key the synthesis agent reads)', async () => {
      const regurgitation = {
        summary: 'Well-known session-management and billing patterns apply.',
        relevantKnowledge: ['JWT session lifecycles'],
        patterns: ['token rotation'],
        references: ['OWASP session management'],
      };
      setBoundaryLLMOutput({ regurgitation });

      const shared = new Execution('pipeline-root');
      const discoveryExec = shared.child('seq-2');
      const result = await runDepositInherentRegurgitationAgent(
        { repository: REPOSITORY, inventory: INVENTORY },
        discoveryExec,
      );
      expect(result.success).toBe(true);
      expect(result.regurgitation).toEqual(regurgitation);
      // Stored on the SHARED execution (cross-phase law).
      expect(shared.get('discovery', 'inherentRegurgitation')).toEqual(regurgitation);
      expect(shared.child('seq-2').findUp('discovery', 'inherentRegurgitation')).toEqual(regurgitation);
    }, 60000);
  });

  describe('Implementation — runDepositAssetPackSynthesisAgent', () => {
    it('unwraps the envelope and stores the measured-patch options under the EXACT keys the route, validation, and Finish read', async () => {
      const options = [
        measuredPatchOption(),
        measuredPatchOption({
          title: 'Billing implementation pattern',
          kind: 'implementation-pattern',
          summary:
            'A source-safe implementation pattern for invoice generation and billing reconciliation flows.',
          coveredSourcePaths: ['src/billing/invoice.ts'],
          patch: {
            fileChanges: [{ path: 'src/billing/invoice.ts', op: 'modify' }],
            patchSummary: 'Encodes the invoice reconciliation pattern.',
          },
        }),
      ];
      setBoundaryLLMOutput({ options });

      const shared = new Execution('pipeline-root');
      const divExec = shared.child('seq-2');
      const result = await runDepositAssetPackSynthesisAgent(
        {
          repository: REPOSITORY,
          inventory: INVENTORY,
          forcedExclusions: ['src/protected'],
          demandContext: ['session auth reads'],
        },
        divExec,
      );

      expect(result.success).toBe(true);
      expect(result.semanticKind).toBe('asset-pack-written-asset');
      expect(result.options).toEqual(options);
      expect(result.summary).toBe('Synthesized 2 measured deposit AssetPack patch(es).');
      expect(result.assetPack).toEqual({ repository: REPOSITORY });

      // implementation:options — the store the /deposits route's completion read
      // and the deposit validation agent consume; implementation:assetPacks — the
      // SAME array. Stored on the SHARED execution (cross-phase law): the route
      // holds the root, so its `execution.get('implementation','options')`
      // completion read (route.ts) resolves DIRECTLY.
      expect(shared.get('implementation', 'options')).toEqual(options);
      expect(shared.get('implementation', 'assetPacks')).toEqual(options);
      expect(shared.get('implementation', 'options')).toBe(shared.get('implementation', 'assetPacks'));
      // implementation:assetPack + implementation:summary — the stores Finish reads,
      // resolvable from the Finish sibling via the upward walk.
      expect(shared.get('implementation', 'assetPack')).toEqual({ repository: REPOSITORY });
      expect(shared.get('implementation', 'summary')).toBe(
        'Synthesized 2 measured deposit AssetPack patch(es).',
      );
      expect(shared.child('seq-3').child('seq-0').findUp('implementation', 'options')).toEqual(options);
    }, 60000);

    it('threads cross-phase stores written on the SHARED parent into the synthesis generation context (F20 law)', async () => {
      setBoundaryLLMOutput({ options: [measuredPatchOption()] });

      const shared = new Execution('pipeline-root');
      // The deposit data plane + upstream phase outputs, stored on the SHARED
      // parent so sibling phase children resolve them via the upward walk.
      shared.store('deposit', 'repository', REPOSITORY);
      shared.store('deposit', 'obfuscations', 'obfuscations-marker: hide the signing keys');
      shared.store('deposit', 'forcedExclusions', ['src/protected/exclusion-marker.ts']);
      shared.store('deposit', 'inventory', INVENTORY);
      shared.store('deposit', 'demandContext', ['demand-marker: session auth reads']);
      shared.store('setup', 'inputComprehension', {
        summary: 'guidance-marker: withhold the secret module',
        obfuscatedPaths: ['src/secret'],
      });
      shared.store('discovery', 'codebaseComprehension', { summary: 'codebase-marker: auth platform' });
      shared.store('discovery', 'depositorySearch', { summary: 'depository-marker: session reads' });
      shared.store('discovery', 'inherentRegurgitation', { summary: 'regurgitation-marker: JWT patterns' });

      const divExec = shared.child('seq-2');
      const result = await runDepositAssetPackSynthesisAgent({}, divExec);
      expect(result.success).toBe(true);

      // Every cross-phase store resolved from the shared parent must actually
      // reach generation: the boundary mock captured every prompt.
      const promptText = getBoundaryLLMPromptText();
      expect(promptText).toContain('codebase-marker');
      expect(promptText).toContain('depository-marker');
      expect(promptText).toContain('regurgitation-marker');
      expect(promptText).toContain('guidance-marker');
      expect(promptText).toContain('obfuscations-marker');
      expect(promptText).toContain('exclusion-marker');
      expect(promptText).toContain('demand-marker');
    }, 60000);
  });

  describe('Validation — runDepositValidationAgent', () => {
    it('unwraps the agent verdict and stores validation/implementation:issues (the ReadyToFinish gate store) + validation:depositQuality', async () => {
      setBoundaryLLMOutput({ issues: [], qualityScore: 0.75, coverageGaps: [], recommendation: 'complete' });

      const shared = new Execution('pipeline-root');
      const validationExec = shared.child('seq-2');
      const packs = [measuredPatchOption()];
      const result = await runDepositValidationAgent(
        { assetPacks: packs, inventory: INVENTORY, forcedExclusions: [] },
        validationExec,
      );

      // qualityScore 0.75 (not the 1 fallback) proves the envelope unwrap
      // surfaced the agent's typed verdict.
      expect(result.qualityScore).toBe(0.75);
      expect(result.issues).toEqual([]);
      expect(result.recommendation).toBe('complete');

      // validation/implementation:issues — the exact namespace:key the AssetPack
      // ReadyToFinish gate contract names (a bare string[]), stored on the SHARED
      // execution so the gate (a DIFFERENT sequential sibling) resolves it.
      expect(shared.get('validation/implementation', 'issues')).toEqual([]);
      expect(shared.child('seq-1').findUp('validation/implementation', 'issues')).toEqual([]);
      // validation:depositQuality — the full verdict record.
      expect(shared.get('validation', 'depositQuality')).toEqual({
        issues: [],
        qualityScore: 0.75,
        coverageGaps: [],
        recommendation: 'complete',
      });

      // The formal absolutes are attached to each measured patch in place and the
      // measured packs are re-stored ON THE SHARED EXECUTION under the keys the
      // route + Finish read.
      const restored = shared.get('implementation', 'options');
      expect(restored).toBe(packs);
      expect(shared.get('implementation', 'assetPacks')).toBe(packs);
      expect(Array.isArray(restored[0].absolutes)).toBe(true);
      expect(restored[0].absolutes.length).toBeGreaterThan(0);
      for (const measurement of restored[0].absolutes) {
        expect(measurement.category).toBe('absolute');
        expect(measurement.volume).toBeGreaterThanOrEqual(0);
        expect(measurement.volume).toBeLessThanOrEqual(1);
      }
    }, 60000);

    it('forces an iterate verdict when a pack touches an obfuscated/excluded path (deterministic smoke check)', async () => {
      setBoundaryLLMOutput({ issues: [], qualityScore: 0.9, coverageGaps: [], recommendation: 'complete' });

      const shared = new Execution('pipeline-root');
      const validationExec = shared.child('seq-2');
      const violating = measuredPatchOption({
        title: 'Secret-touching slice',
        coveredSourcePaths: ['src/secret/keys.ts'],
        patch: {
          fileChanges: [{ path: 'src/secret/keys.ts', op: 'modify' }],
          patchSummary: 'Touches the withheld module.',
        },
      });
      const result = await runDepositValidationAgent(
        {
          assetPacks: [violating],
          inventory: INVENTORY,
          obfuscationGuidance: { summary: 'withhold secrets', obfuscatedPaths: ['src/secret'] },
          forcedExclusions: [],
        },
        validationExec,
      );

      expect(result.recommendation).toBe('iterate');
      expect(result.issues).toEqual(
        expect.arrayContaining([expect.stringContaining('touches withheld path "src/secret/keys.ts"')]),
      );
      // The gate store carries the same issues verbatim — on the SHARED execution.
      expect(shared.get('validation/implementation', 'issues')).toEqual(result.issues);
    }, 60000);

    it('reads implementation:options and the deposit data plane from the SHARED parent (F20 cross-phase consumer read)', async () => {
      setBoundaryLLMOutput({ issues: [], qualityScore: 0.8, coverageGaps: [], recommendation: 'complete' });

      const shared = new Execution('pipeline-root');
      const packs = [measuredPatchOption()];
      // Producer side of the repaired topology: the options + deposit stores live
      // on the SHARED parent, where every sibling phase child can findUp them.
      shared.store('implementation', 'options', packs);
      shared.store('deposit', 'inventory', INVENTORY);
      shared.store('deposit', 'forcedExclusions', []);
      shared.store('setup', 'inputComprehension', { summary: 'no obfuscations', obfuscatedPaths: [] });

      const validationChild = shared.child('seq-2').child('seq-0');
      const result = await runDepositValidationAgent({}, validationChild);

      // The consumer found the packs across phases (no "No AssetPacks" smoke issue)
      // and the clean packs validate complete.
      expect(result.issues).toEqual([]);
      expect(result.recommendation).toBe('complete');
      // The measured re-store attached absolutes to the SAME array instance the
      // shared parent holds (in-place mutation contract).
      expect(Array.isArray(packs[0].absolutes)).toBe(true);
    }, 60000);
  });

  describe('Finish — runUploadAssetPacksForReviewAgent', () => {
    it('deposit mode: uploads implementation:options read from the shared parent for /deposits admission review', async () => {
      const shared = new Execution('pipeline-root');
      storeSynthesizeAssetPacksMode(shared, 'deposit');
      const options = [measuredPatchOption()];
      shared.store('implementation', 'options', options);
      shared.store('implementation', 'assetPack', { repository: REPOSITORY });
      shared.store('implementation', 'summary', 'Synthesized 1 measured deposit AssetPack patch(es).');

      // Finish runs on its own sibling subtree; the shared-parent stores must
      // resolve via findUp (F20 cross-phase consumer read).
      const finishChild = shared.child('seq-3').child('seq-0');
      const result = await runUploadAssetPacksForReviewAgent({}, finishChild);

      expect(result.success).toBe(true);
      expect(result.deliveryMechanism).toBe('bitcode-review-upload');
      expect(result.review).toEqual({
        surface: '/deposits',
        reviewFor: 'deposit-admission',
        decision: 'pending-user-review',
      });
      expect(result.options).toBe(options);
      expect(result.assetPack).toEqual({ repository: REPOSITORY });
      expect(result.sourceSummary).toBe('Synthesized 1 measured deposit AssetPack patch(es).');

      // The exact Finish store keys — on the SHARED execution (cross-phase law),
      // where postprocess and the run-level surfaces resolve them.
      expect(shared.get('finish', 'uploadForReview')).toMatchObject({
        deliveryMechanism: 'bitcode-review-upload',
        review: { surface: '/deposits', reviewFor: 'deposit-admission' },
        options,
      });
      expect(shared.get('finish', 'deliveryMechanism')).toBe('bitcode-review-upload');
    });

    it('read mode: uploads the implementation synthesis artifacts for /reads purchase review', async () => {
      const shared = new Execution('pipeline-root');
      storeSynthesizeAssetPacksMode(shared, 'read');
      const artifacts = { summary: 'Read synthesis artifacts.', proofEvidence: ['evidence'] };
      shared.store('implementation', 'assetPackSynthesisArtifacts', artifacts);
      shared.store('implementation', 'assetPack', { read: 'the admitted read' });

      const finishChild = shared.child('seq-3').child('seq-0');
      const result = await runUploadAssetPacksForReviewAgent({}, finishChild);

      expect(result.review).toEqual({
        surface: '/reads',
        reviewFor: 'purchase',
        decision: 'pending-user-review',
      });
      expect(result.artifacts).toBe(artifacts);
      expect(shared.get('finish', 'uploadForReview')).toMatchObject({
        review: { surface: '/reads', reviewFor: 'purchase' },
        artifacts,
      });
    });
  });

  describe('cross-phase store visibility (F20 topology law)', () => {
    it('a store written on the SHARED parent is visible from every sibling phase child (and their children) via findUp', () => {
      const shared = new Execution('pipeline-root');
      const options = [measuredPatchOption()];
      shared.store('implementation', 'options', options);
      shared.store('deposit', 'inventory', INVENTORY);
      shared.store('setup', 'inputComprehension', { summary: 'guidance', obfuscatedPaths: [] });
      shared.store('discovery', 'depositorySearch', { summary: 'demand guidance' });

      // sequential() gives preprocess and each phase their own sibling child;
      // agents often run one level deeper (the phase's own sequential children).
      const setupChild = shared.child('seq-1');
      const divChild = shared.child('seq-2');
      const divGrandchild = divChild.child('seq-0');
      const finishGrandchild = shared.child('seq-3').child('seq-0');

      for (const node of [setupChild, divChild, divGrandchild, finishGrandchild]) {
        expect(node.findUp('implementation', 'options')).toBe(options);
        expect(node.findUp('deposit', 'inventory')).toBe(INVENTORY);
        expect(node.findUp('setup', 'inputComprehension')).toEqual({
          summary: 'guidance',
          obfuscatedPaths: [],
        });
        expect(node.findUp('discovery', 'depositorySearch')).toEqual({ summary: 'demand guidance' });
      }
    });
  });
});
