// @ts-nocheck
import { Execution } from '@bitcode/execution-generics';
import AssetPackCompletionAgent from '../agents/finish/asset-pack-completion-agent';

describe('finish AssetPack completion evidence', () => {
  it('builds repository and pull-request headers from source-bound finish evidence', async () => {
    const exec = new Execution('pipeline:asset-pack');
    exec.store('pipeline', 'expressedRead', 'Read the deposited source and ship the Fit result.');
    exec.store('pipeline', 'writtenAssetType', 'read-satisfaction-asset-pack');
    exec.store('harness', 'sourceRevision', {
      repositoryFullName: 'engineeredsoftware/ENGI',
      branch: 'main',
      commit: '272b5b1586b28363b57676603a1990bb10df319c',
    });
    exec.store('finish', 'deliveryReadiness', {
      status: 'delivered',
      branch: 'bitcode/asset-pack-run-123',
      path: '.bitcode/asset-packs/run-123.md',
      prUrl: 'https://github.com/engineeredsoftware/ENGI/pull/123',
    });
    exec.store('finish', 'pullRequestUrl', 'https://github.com/engineeredsoftware/ENGI/pull/123');
    exec.store('finish', 'pullRequestNumber', 123);
    exec.store('finish', 'pullRequestTitle', 'Bitcode AssetPack delivery run-123');

    const result = await AssetPackCompletionAgent({}, exec);

    expect(result.repoSnapshot).toEqual({
      org: 'engineeredsoftware',
      repo: 'ENGI',
      branch: 'main',
      commit: '272b5b1586b28363b57676603a1990bb10df319c',
    });
    expect(result.shippables.pullRequest).toMatchObject({
      url: 'https://github.com/engineeredsoftware/ENGI/pull/123',
      number: 123,
    });
    expect(result.deliveryMechanism?.readiness).toMatchObject({
      status: 'delivered',
      branch: 'bitcode/asset-pack-run-123',
    });
    expect(result.deliveryMechanism?.summary).toContain('engineeredsoftware/ENGI');
  });
});
