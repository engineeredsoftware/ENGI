// @ts-nocheck
/**
 * Finish AssetPack completion evidence (product SDIVF Finish phase).
 * Synthesis Finish never opens PRs and never surfaces settleDelivery /
 * settlePassThrough — even if settle keys exist on a shared EE.
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
    expect((result as any).settlePassThrough).toBeUndefined();
    expect((result as any).settleDelivery).toBeUndefined();
    expect((result as any).shippable).toBeUndefined();
    expect((result.deliveryMechanism as any)?.pullRequest).toBeUndefined();
    expect(result.summary).toContain('octocat/Spoon-Knife');
    expect(result.deliveryMechanism?.readiness).toMatchObject({
      status: 'pending-user-review',
    });
    expect(result.deliveryMechanism?.summary).toContain('octocat/Spoon-Knife');
    expect(result.assetPackSynthesisArtifacts?.summary).toContain('octocat/Spoon-Knife');
  });

  it('ignores settle shippable on the EE — synthesis never emits settle surfaces', async () => {
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
    expect((result as any).settlePassThrough).toBeUndefined();
    expect((result as any).settleDelivery).toBeUndefined();
    expect((result as any).shippable).toBeUndefined();
    expect((result.deliveryMechanism as any)?.pullRequest).toBeUndefined();
  });
});
