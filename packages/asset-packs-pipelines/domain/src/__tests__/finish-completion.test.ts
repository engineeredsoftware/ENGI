// @ts-nocheck
/**
 * Finish AssetPack completion evidence (product SDIVF Finish phase).
 * Buyer-repo PR URL is only present when settle Simple already stored a
 * shippable on the shared execution — Finish itself does not open PRs and
 * does not author settleDelivery (settlement-exclusive surface).
 */
import { Execution } from '@bitcode/execution-generics';
import AssetPackCompletionAgent from '../agents/finish/asset-pack-completion-agent';

describe('finish AssetPack completion evidence', () => {
  it('builds repository snapshot without inventing settleDelivery or a Finish PR', async () => {
    const exec = new Execution('pipeline:asset-pack');
    exec.store('pipeline', 'expressedRead', 'Read the deposited source and prepare Fit options.');
    exec.store('pipeline', 'writtenAssetType', 'read-satisfaction-asset-pack');
    exec.store('harness', 'sourceRevision', {
      repositoryFullName: 'octocat/Spoon-Knife',
      branch: 'main',
      commit: '272b5b1586b28363b57676603a1990bb10df319c',
    });
    exec.store('finish', 'deliveryReadiness', {
      status: 'pending-user-review',
      branch: null,
      path: '.proofs/asset-packs/run-123.md',
    });

    const result = await AssetPackCompletionAgent({}, exec);

    expect(result.repoSnapshot).toEqual({
      org: 'octocat',
      repo: 'Spoon-Knife',
      branch: 'main',
      commit: '272b5b1586b28363b57676603a1990bb10df319c',
    });
    expect(result.settlePassThrough).toBeUndefined();
    expect((result as any).settleDelivery).toBeUndefined();
    expect(result.summary).toContain('octocat/Spoon-Knife');
    expect(result.deliveryMechanism?.readiness).toMatchObject({
      status: 'pending-user-review',
    });
    expect(result.deliveryMechanism?.summary).toContain('octocat/Spoon-Knife');
    expect(result.assetPackSynthesisArtifacts?.summary).toContain('octocat/Spoon-Knife');
  });

  it('passes through settle shippable PR only as settlePassThrough when settle already ran', async () => {
    const exec = new Execution('pipeline:asset-pack');
    exec.store('pipeline', 'expressedRead', 'Need: type-safe plain object check');
    exec.store('harness', 'sourceRevision', {
      repositoryFullName: 'octocat/Spoon-Knife',
      branch: 'main',
      commit: 'abc',
    });
    exec.store('settle-asset-pack-pipeline', 'shippable', {
      prUrl: 'https://github.com/octocat/Spoon-Knife/pull/123',
      optionTitle: 'Bitcode AssetPack delivery',
    });

    const result = await AssetPackCompletionAgent({}, exec);
    expect(result.settlePassThrough?.pullRequest).toMatchObject({
      url: 'https://github.com/octocat/Spoon-Knife/pull/123',
    });
    expect((result as any).settleDelivery).toBeUndefined();
  });
});
