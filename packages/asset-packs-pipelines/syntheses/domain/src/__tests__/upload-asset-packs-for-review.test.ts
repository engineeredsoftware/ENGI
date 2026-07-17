// @ts-nocheck
import { Execution } from '@bitcode/execution-generics';
import runUploadAssetPacksForReviewAgent from '../agents/finish/upload-asset-packs-for-review-agent';
import { registerFinishAgentsForType } from '../phases/finish';
import { storeSynthesizeAssetPacksMode } from '../synthesize-asset-packs';

const OPTIONS = [
  {
    kind: 'capability-slice',
    title: 'Session auth capability slice',
    summary: 'A bounded, source-safe capability slice covering session authentication.',
    coveredSourcePaths: ['src/auth/session.ts'],
    patch: {
      fileChanges: [{ path: 'src/auth/session.ts', op: 'modify' }],
      patchSummary: 'Encodes the session lifecycle knowledge.',
    },
  },
];

/**
 * Both synthesis modes Finish by UPLOADING the synthesized artifacts to Bitcode
 * for user review. Opening a pull request is NOT part of synthesis (that moves
 * to the future Gate-6 SettleAssetPack pipeline), so the upload record must
 * carry review semantics and NO PR side effects.
 */
describe('runUploadAssetPacksForReviewAgent', () => {
  it('deposit mode: records a bitcode-review-upload for /deposits admission review', async () => {
    const outer = new Execution('synthesize-asset-packs');
    storeSynthesizeAssetPacksMode(outer, 'deposit');
    // Implementation stores resolved via the upward walk (ancestor of the Finish node).
    outer.store('implementation', 'options', OPTIONS);
    outer.store('implementation', 'assetPack', { repository: { fullName: 'org/repo' } });
    outer.store('implementation', 'summary', 'Synthesized 1 measured deposit AssetPack patch(es).');
    const finishExec = outer.child('finish').child('seq-0');

    const result = await runUploadAssetPacksForReviewAgent({ runId: 'run-1' }, finishExec);

    expect(result.success).toBe(true);
    expect(result.kind).toBe('bitcode-review-upload');
    expect(result).not.toHaveProperty('deliveryMechanism');
    expect(result.review).toEqual({
      surface: '/deposits',
      reviewFor: 'deposit-admission',
      decision: 'pending-user-review',
    });
    expect(result.options).toBe(OPTIONS); // the synthesized options ride in the upload record
    expect(result.assetPack).toEqual({ repository: { fullName: 'org/repo' } });
    expect(result.sourceSummary).toBe('Synthesized 1 measured deposit AssetPack patch(es).');
    expect(result.summary).toBe('Synthesized AssetPacks stored for deposit review on Bitcode.');
    // The runner spreads its input into its result (Finish output chain).
    expect(result.runId).toBe('run-1');

    // Cross-phase law: the upload record is stored on the SHARED (root)
    // execution — where postprocess and the run-level surfaces resolve it —
    // not on the isolated Finish sibling.
    expect(outer.get('finish', 'uploadForReview')).toMatchObject({
      kind: 'bitcode-review-upload',
      review: { surface: '/deposits', reviewFor: 'deposit-admission' },
    });
    expect(outer.get('finish', 'reviewUpload')).toBe('bitcode-review-upload');
    // Still resolvable from the Finish subtree via the upward walk.
    expect(finishExec.findUp('finish', 'reviewUpload')).toBe('bitcode-review-upload');
  });

  it('read mode: uploads for /reads purchase review and carries the synthesis artifacts', async () => {
    const outer = new Execution('synthesize-asset-packs');
    storeSynthesizeAssetPacksMode(outer, 'read');
    const artifacts = [{ artifact: 'fits-finding' }];
    outer.store('implementation', 'assetPackSynthesisArtifacts', artifacts);
    const finishExec = outer.child('finish');

    const result = await runUploadAssetPacksForReviewAgent({}, finishExec);

    expect(result.review).toEqual({
      surface: '/reads',
      reviewFor: 'purchase',
      decision: 'pending-user-review',
    });
    expect(result.artifacts).toBe(artifacts);
    expect(result.kind).toBe('bitcode-review-upload');
    expect(result.summary).toBe('Synthesized AssetPacks stored for read review on Bitcode.');
  });

  it('defaults to read review when no mode was stored', async () => {
    const exec = new Execution('finish-node');
    const result = await runUploadAssetPacksForReviewAgent({}, exec);
    expect(result.review.surface).toBe('/reads');
    expect(result.review.reviewFor).toBe('purchase');
  });

  it('performs upload semantics with NO PR side effects (no PR fields anywhere in the record)', async () => {
    const outer = new Execution('synthesize-asset-packs');
    storeSynthesizeAssetPacksMode(outer, 'deposit');
    outer.store('implementation', 'options', OPTIONS);
    const finishExec = outer.child('finish');

    const result = await runUploadAssetPacksForReviewAgent({}, finishExec);
    // Cross-phase law: stored on the SHARED (root) execution.
    const stored = outer.get('finish', 'uploadForReview');

    for (const record of [result, stored]) {
      const flat = JSON.stringify(record);
      expect(flat).not.toMatch(/prUrl/i);
      expect(flat).not.toMatch(/pullRequest/i);
      expect(flat).not.toMatch(/"branch"/i);
      expect(flat).not.toMatch(/"commit"/i);
    }
    // The upload decision is the user's, pending — never an auto-opened PR.
    expect(stored.review.decision).toBe('pending-user-review');
    expect(outer.get('finish', 'reviewUpload')).toBe('bitcode-review-upload');
  });
});

describe('registerFinishAgentsForType (SynthesizeAssetPacks Finish registry)', () => {
  it('registers review-upload + completion only; never PR shipping agents (settle owns ship)', async () => {
    for (const mode of ['deposit', 'read']) {
      const registrations = new Map<string, any>();
      const registry = {
        registerAgent: (key: string, handler: any) => registrations.set(key, handler),
      };

      registerFinishAgentsForType('pull-request', registry, mode as any);

      expect([...registrations.keys()].sort()).toEqual([
        'finish:asset-pack-completion',
        'finish:upload-asset-packs-for-review',
      ]);
      expect(registrations.has('finish:asset-pack-create-pull-request-delivery-agent')).toBe(false);
      expect(registrations.has('finish:deliver-asset-pack-to-destination-agent')).toBe(false);

      const loader = registrations.get('finish:upload-asset-packs-for-review');
      const resolved = await loader();
      expect(resolved).toBe(runUploadAssetPacksForReviewAgent);
    }
  });
});
