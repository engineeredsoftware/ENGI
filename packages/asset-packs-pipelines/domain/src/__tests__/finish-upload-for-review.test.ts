// @ts-nocheck
/**
 * Finish: store synthesized artifacts for USER review (not Delivery).
 * Delivery = settle PR ship of settled read packs only.
 */
import { Execution } from '@bitcode/execution-generics';
import runUploadAssetPacksForReviewAgent from '../agents/finish/upload-asset-packs-for-review-agent';
import { storeSynthesizeAssetPacksMode } from '../synthesize-asset-packs';

const DEPOSIT_OPTIONS = [
  { optionId: 'opt-1', title: 'AssetPack patch A', measuredBtd: 21 },
  { optionId: 'opt-2', title: 'AssetPack patch B', measuredBtd: 34 },
];

describe('upload-asset-packs-for-review Finish agent', () => {
  it('deposit: stores synthesized options for /deposits review (no Delivery/PR)', async () => {
    const root = new Execution('pipeline:finish-upload-deposit');
    storeSynthesizeAssetPacksMode(root, 'deposit');
    root.store('implementation', 'options', DEPOSIT_OPTIONS);
    root.store('implementation', 'summary', 'Two measured deposit options.');

    const finishNode = root.child('seq-3').child('seq-0');
    const input = { carried: 'from-validation' };
    const result = await runUploadAssetPacksForReviewAgent(input, finishNode);

    expect(result).toMatchObject({
      success: true,
      carried: 'from-validation',
      kind: 'bitcode-review-upload',
      review: {
        surface: '/deposits',
        reviewFor: 'deposit-admission',
        decision: 'pending-user-review',
      },
      options: DEPOSIT_OPTIONS,
      sourceSummary: 'Two measured deposit options.',
      summary: 'Synthesized AssetPacks stored for deposit review on Bitcode.',
    });

    expect(result).not.toHaveProperty('prUrl');
    expect(result).not.toHaveProperty('pullRequest');
    expect(result).not.toHaveProperty('deliveryMechanism');
    expect(result).not.toHaveProperty('settleDelivery');

    expect(root.get('finish', 'uploadForReview')).toMatchObject({
      kind: 'bitcode-review-upload',
      review: { reviewFor: 'deposit-admission' },
    });
    expect(root.get('finish', 'reviewUpload')).toBe('bitcode-review-upload');
    expect(finishNode.findUp('finish', 'reviewUpload')).toBe('bitcode-review-upload');
    expect(root.get('finish', 'deliveryMechanism')).toBeUndefined();
  });

  it('read: stores synthesis artifacts for /reads review (not Delivery)', async () => {
    const root = new Execution('pipeline:finish-upload-read');
    storeSynthesizeAssetPacksMode(root, 'read');
    const artifacts = {
      summary: 'Synthesized AssetPack from source-bound evidence.',
      proofEvidence: ['Proof root retained.'],
    };
    root.store('implementation', 'assetPackSynthesisArtifacts', artifacts);

    const result = await runUploadAssetPacksForReviewAgent({}, root.child('seq-3'));

    expect(result).toMatchObject({
      kind: 'bitcode-review-upload',
      review: {
        surface: '/reads',
        reviewFor: 'purchase',
        decision: 'pending-user-review',
      },
      artifacts,
      summary: 'Synthesized AssetPacks stored for read review on Bitcode.',
    });
    expect(result).not.toHaveProperty('deliveryMechanism');
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
    const writtenAssets = [{ path: '.docs/asset-pack.md' }];
    root.store('implementation', 'writtenAssets', writtenAssets);

    const result = await runUploadAssetPacksForReviewAgent({}, root.child('seq-3'));

    expect(result.artifacts).toEqual(writtenAssets);
    expect(result.options).toBeNull();
    expect(result.sourceSummary).toBe('Synthesized AssetPacks.');
  });
});
