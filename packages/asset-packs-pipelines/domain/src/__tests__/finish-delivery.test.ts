// @ts-nocheck
import { Execution } from '@bitcode/execution-generics';

const createBranchUse = jest.fn();
const createOrUpdateFileUse = jest.fn();
const createPullRequestUse = jest.fn();
const emitToolUsage = jest.fn();

jest.mock('@bitcode/vcs-tools', () => ({
  createBranchTool: { use: (input: unknown) => createBranchUse(input) },
  createOrUpdateFileTool: { use: (input: unknown) => createOrUpdateFileUse(input) },
  createPullRequestTool: { use: (input: unknown) => createPullRequestUse(input) },
}));

jest.mock('@bitcode/pipelines-generics', () => ({
  emitToolUsage: (...args: unknown[]) => emitToolUsage(...args),
}));

import deliverAssetPackToDestination from '../agents/finish/deliver-asset-pack-to-destination-agent';

describe('finish pull-request delivery', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    delete process.env.BITCODE_VCS_ALLOW_ENV_TOKEN_FALLBACK;
    delete process.env.GITHUB_TOKEN;
    createBranchUse.mockResolvedValue({ name: 'bitcode/asset-pack-run-123' });
    createOrUpdateFileUse.mockResolvedValue({ path: '.bitcode/asset-packs/run-123.md', content: 'written' });
    createPullRequestUse.mockResolvedValue({
      url: 'https://github.com/engineeredsoftware/ENGI/pull/123',
      number: 123,
      title: 'Bitcode AssetPack delivery run-123',
    });
  });

  function execution() {
    const exec = new Execution('pipeline:asset-pack');
    exec.store('pipeline', 'deliveryMechanismTemplate', 'pull-request');
    exec.store('pipeline', 'writtenAssetType', 'read-satisfaction-asset-pack');
    exec.store('pipeline', 'expressedRead', 'Find a source-bound Fit and synthesize an AssetPack.');
    exec.store('pipeline', 'userId', '18eb2a4c-503f-49f2-ae65-b00b1f9b7fcb');
    exec.store('harness', 'runId', 'run-123');
    exec.store('harness', 'sourceRevision', {
      repositoryFullName: 'engineeredsoftware/ENGI',
      branch: 'main',
      commit: '272b5b1586b28363b57676603a1990bb10df319c',
    });
    exec.store('implementation', 'assetPackSynthesisArtifacts', {
      summary: 'Synthesized AssetPack from source-bound evidence.',
      proofEvidence: ['Proof root is retained.'],
      reviewNotes: ['Finish must ship the pack through a PR.'],
    });
    exec.store('fit', 'result', {
      resultState: 'worthy_fit',
      selectedCandidateAssetIds: ['asset-1'],
      queryRoot: 'sha256:query',
      rankingRoot: 'sha256:ranking',
    });
    return exec;
  }

  it('creates a branch, writes the AssetPack, opens a PR, and records delivery evidence', async () => {
    const exec = execution();

    const result = await deliverAssetPackToDestination({}, exec);

    expect(result.status).toBe('delivered');
    expect(result.prUrl).toContain('/pull/123');
    expect(createBranchUse).toHaveBeenCalledWith(expect.objectContaining({
      provider: 'github',
      owner: 'engineeredsoftware',
      repo: 'ENGI',
      branch: 'bitcode/asset-pack-run-123',
      from: '272b5b1586b28363b57676603a1990bb10df319c',
      userId: '18eb2a4c-503f-49f2-ae65-b00b1f9b7fcb',
    }));
    expect(createOrUpdateFileUse).toHaveBeenCalledWith(expect.objectContaining({
      path: '.bitcode/asset-packs/run-123.md',
      branch: 'bitcode/asset-pack-run-123',
    }));
    expect(createOrUpdateFileUse.mock.calls[0][0].content).toContain('# Bitcode AssetPack');
    expect(createPullRequestUse).toHaveBeenCalledWith(expect.objectContaining({
      sourceBranch: 'bitcode/asset-pack-run-123',
      targetBranch: 'main',
      draft: true,
    }));
    expect(exec.get('finish', 'pullRequestUrl')).toContain('/pull/123');
    expect(exec.get('finish', 'deliveryReadiness')).toMatchObject({
      status: 'delivered',
      prUrl: 'https://github.com/engineeredsoftware/ENGI/pull/123',
      branch: 'bitcode/asset-pack-run-123',
      path: '.bitcode/asset-packs/run-123.md',
    });
    expect(exec.get('finish', 'deliveryPath')).toBe('.bitcode/asset-packs/run-123.md');
    expect(exec.get('tools', 'vcs_create_branch:0')).toMatchObject({
      tool: 'vcs_create_branch',
      ok: true,
      phase: 'finish',
      agent: 'finish:asset-pack-delivery-agent',
    });
    expect(exec.get('tools', 'vcs_create_or_update_file:1')).toMatchObject({
      tool: 'vcs_create_or_update_file',
      ok: true,
      phase: 'finish',
      agent: 'finish:asset-pack-delivery-agent',
    });
    expect(exec.get('tools', 'vcs_create_pull_request:2')).toMatchObject({
      tool: 'vcs_create_pull_request',
      ok: true,
      phase: 'finish',
      agent: 'finish:asset-pack-delivery-agent',
    });
    expect(emitToolUsage).toHaveBeenCalledTimes(3);
    expect(emitToolUsage.mock.calls[1][3]).toMatchObject({
      path: '.bitcode/asset-packs/run-123.md',
      content: {
        root: expect.stringMatching(/^sha256:/),
        bytes: expect.any(Number),
      },
    });
  });

  it('blocks readiness instead of claiming delivery when GitHub authority is absent', async () => {
    const exec = execution();
    exec.store('pipeline', 'userId', undefined);

    const result = await deliverAssetPackToDestination({}, exec);

    expect(result.status).toBe('blocked_readiness');
    expect(result.reason).toContain('GitHub connectionId, pipeline userId, or explicit environment delivery authority');
    expect(createBranchUse).not.toHaveBeenCalled();
    expect(exec.get('finish', 'deliveryReadiness')).toMatchObject({
      status: 'blocked_readiness',
      prUrl: null,
    });
  });

  it('allows explicit environment delivery authority without emitting token material', async () => {
    process.env.BITCODE_VCS_ALLOW_ENV_TOKEN_FALLBACK = '1';
    process.env.GITHUB_TOKEN = 'gh-test-token';
    const exec = execution();
    exec.store('pipeline', 'userId', undefined);

    const result = await deliverAssetPackToDestination({}, exec);

    expect(result.status).toBe('delivered');
    expect(createBranchUse).toHaveBeenCalledWith(expect.not.objectContaining({
      accessToken: expect.anything(),
      auth: expect.anything(),
    }));
    expect(exec.get('tools', 'vcs_create_branch:0').input).not.toHaveProperty('accessToken');
    expect(emitToolUsage.mock.calls[0][2]).not.toHaveProperty('accessToken');
  });
});
