// @ts-nocheck
/**
 * Finish law (V48 Gate 3): BOTH synthesis modes finish by uploading the
 * synthesized AssetPack artifacts to Bitcode for USER review — deposit before
 * Depository admission, read before purchase. Opening a pull request is NOT
 * part of synthesis (PR/settlement delivery is reserved for the future Gate-6
 * SettleAssetPack pipeline).
 *
 * Pins the upload-for-review agent's behavior: mode-appropriate review surface,
 * 'bitcode-review-upload' delivery mechanism (never a PR shape), resolution of
 * the Implementation stores from ANCESTOR nodes (node-local get + ancestors-only
 * findUp), input spreading, and the finish stores it writes.
 */
import { Execution } from '@bitcode/execution-generics';
import runUploadAssetPacksForReviewAgent from '../agents/finish/upload-asset-packs-for-review-agent';
import { storeSynthesizeAssetPacksMode } from '../synthesize-asset-packs';

const DEPOSIT_OPTIONS = [
  { optionId: 'opt-1', title: 'AssetPack patch A', measuredBtd: 21 },
  { optionId: 'opt-2', title: 'AssetPack patch B', measuredBtd: 34 },
];

describe('upload-asset-packs-for-review Finish agent', () => {
  it('deposit: uploads the synthesized options for /deposits admission review (no PR fields)', async () => {
    const root = new Execution('pipeline:finish-upload-deposit');
    storeSynthesizeAssetPacksMode(root, 'deposit');
    root.store('implementation', 'options', DEPOSIT_OPTIONS);
    root.store('implementation', 'summary', 'Two measured deposit options.');

    // Finish runs on a descendant node; the stores resolve via the upward walk.
    const finishNode = root.child('seq-3').child('seq-0');
    const input = { carried: 'from-validation' };
    const result = await runUploadAssetPacksForReviewAgent(input, finishNode);

    expect(result).toMatchObject({
      success: true,
      carried: 'from-validation', // input is spread through
      deliveryMechanism: 'bitcode-review-upload',
      review: {
        surface: '/deposits',
        reviewFor: 'deposit-admission',
        decision: 'pending-user-review',
      },
      options: DEPOSIT_OPTIONS,
      sourceSummary: 'Two measured deposit options.',
      summary: 'Synthesized AssetPacks uploaded to Bitcode for deposit review.',
    });

    // Never a pull-request shippable.
    expect(result).not.toHaveProperty('prUrl');
    expect(result).not.toHaveProperty('pullRequest');

    // The upload is recorded on the SHARED (root) execution for downstream
    // completion (cross-phase store-visibility law) — the finish node still
    // resolves it via the upward walk.
    expect(root.get('finish', 'uploadForReview')).toMatchObject({
      deliveryMechanism: 'bitcode-review-upload',
      review: { reviewFor: 'deposit-admission' },
    });
    expect(root.get('finish', 'deliveryMechanism')).toBe('bitcode-review-upload');
    expect(finishNode.findUp('finish', 'deliveryMechanism')).toBe('bitcode-review-upload');
  });

  it('read: uploads the synthesis artifacts for /reads purchase review', async () => {
    const root = new Execution('pipeline:finish-upload-read');
    storeSynthesizeAssetPacksMode(root, 'read');
    const artifacts = {
      summary: 'Synthesized AssetPack from source-bound evidence.',
      proofEvidence: ['Proof root retained.'],
    };
    root.store('implementation', 'assetPackSynthesisArtifacts', artifacts);

    const result = await runUploadAssetPacksForReviewAgent({}, root.child('seq-3'));

    expect(result).toMatchObject({
      deliveryMechanism: 'bitcode-review-upload',
      review: {
        surface: '/reads',
        reviewFor: 'purchase',
        decision: 'pending-user-review',
      },
      artifacts,
      summary: 'Synthesized AssetPacks uploaded to Bitcode for read review.',
    });
  });

  it('defaults to the read lens when no mode was stored', async () => {
    const root = new Execution('pipeline:finish-upload-default');

    const result = await runUploadAssetPacksForReviewAgent({}, root);

    expect(result.review.surface).toBe('/reads');
    expect(result.review.reviewFor).toBe('purchase');
  });

  it('falls back to writtenAssets and null options when Implementation stored neither', async () => {
    const root = new Execution('pipeline:finish-upload-fallback');
    storeSynthesizeAssetPacksMode(root, 'read');
    const writtenAssets = [{ path: 'docs/asset-pack.md' }];
    root.store('implementation', 'writtenAssets', writtenAssets);

    const result = await runUploadAssetPacksForReviewAgent({}, root.child('seq-3'));

    expect(result.artifacts).toEqual(writtenAssets);
    expect(result.options).toBeNull();
    expect(result.sourceSummary).toBe('Synthesized AssetPacks.');
  });
});
