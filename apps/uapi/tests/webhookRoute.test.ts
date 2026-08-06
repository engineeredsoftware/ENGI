import '@/tests/setupTests';
// Mock analytics and logging
jest.mock('@vercel/analytics/server', () => ({ track: jest.fn() }));
jest.mock('@bitcode/logger', () => ({ log: jest.fn() }));
// Mock Supabase client
const mockFrom = jest.fn();
jest.mock('@bitcode/supabase', () => ({ supabaseAdmin: { from: mockFrom } }));
// Mock child_process.exec to simulate Docker invocation
jest.mock('child_process', () => ({
  exec: jest.fn((cmd: string, cb: Function) => cb(null, { stdout: '', stderr: '' }))
}));

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@bitcode/supabase';
import { track } from '@vercel/analytics/server';
import { log } from '@bitcode/logger';
import { POST } from '@/app/api/webhook/route';

const defaultExecImpl = (cmd: string, cb: Function) => cb(null, { stdout: '', stderr: '' });
const ASSET_PACK_PIPELINE_TRACK_EVENT = 'Trigger Asset-Pack Pipeline';

const expectedAssetPackPipelineTrack = (
  labelName: string,
  userId: string,
  issueNumber: number
) => ({
  labelName,
  userId,
  issueNumber,
  ingressBasis: 'github_webhook',
  outputMeaning: 'asset_packs',
  exchangeStateRole: 'ingress_only_automation_boundary',
});

const createUserConnectionBuilder = (userId: string | null) => ({
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  maybeSingle: jest.fn().mockResolvedValue({ data: userId ? { user_id: userId } : null, error: null })
});

const createGithubInteractionBuilder = () => {
  const builder: any = {
    select: jest.fn(),
    eq: jest.fn(),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    insert: jest.fn().mockResolvedValue({ error: null })
  };
  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  return builder;
};

const createDefaultBuilder = () => ({
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
  single: jest.fn().mockResolvedValue({ data: null, error: null })
});

const installCommentSupabaseMocks = (options?: { existingInteraction?: boolean }) => {
  const userConnections = createUserConnectionBuilder('user1');
  const githubInteractions = createGithubInteractionBuilder();
  if (options?.existingInteraction) {
    githubInteractions.maybeSingle.mockResolvedValue({ data: { id: 'existing' }, error: null });
  }
  const defaultBuilder = createDefaultBuilder();
  mockFrom.mockImplementation((table) => {
    if (table === 'user_connections') return userConnections;
    if (table === 'github_interactions') return githubInteractions;
    return defaultBuilder;
  });
  return { userConnections, githubInteractions, defaultBuilder };
};

describe('GitHub Webhook Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { exec } = require('child_process');
    exec.mockImplementation(defaultExecImpl);
  });

  it('returns error for malformed JSON', async () => {
    const req: any = { json: async () => { throw new Error('invalid'); } };
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ success: false, code: 400, error: 'Invalid JSON' });
    expect(log).toHaveBeenCalledWith(
      '[route /webhook POST] JSON parse error (test)',
      'error',
      expect.objectContaining({ error: 'invalid' })
    );
  });

  it('ignores non-labeled events', async () => {
    const payload = {
      action: 'opened',
      issue: { number: 1, pull_request: null },
      repository: { name: 'repo', owner: { login: 'owner' } },
      installation: { id: 42 },
      label: { name: 'bitcode-deliver-issue' }
    };
    const req: any = { json: async () => payload };
    const res = await POST(req);
    expect(await res.json()).toEqual({ success: true });
    expect(log).toHaveBeenCalledWith(
      '[route /webhook POST] Ignoring non-labeled event',
      'info',
      { action: 'opened' }
    );
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('ignores unsupported labels', async () => {
    const payload = {
      action: 'labeled',
      issue: { number: 2, pull_request: null },
      repository: { name: 'repo', owner: { login: 'owner' } },
      installation: { id: 42 },
      label: { name: 'random-label' }
    };
    const req: any = { json: async () => payload };
    const res = await POST(req);
    expect(await res.json()).toEqual({ success: true });
    expect(log).toHaveBeenCalledWith(
      '[route /webhook POST] Ignoring unsupported label',
      'info',
      { labelName: 'random-label' }
    );
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('skips label not applicable for PR or issue', async () => {
    // PR with issue-only label
    const payloadPR = {
      action: 'labeled',
      issue: { number: 3, pull_request: { url: 'x' } },
      repository: { name: 'repo', owner: { login: 'owner' } },
      installation: { id: 42 },
      label: { name: 'bitcode-deliver-issue' }
    };
    const resPR = await POST({ json: async () => payloadPR } as any);
    expect(await resPR.json()).toEqual({ success: true });
    expect(log).toHaveBeenCalledWith(
      '[route /webhook POST] Label not applicable for PR',
      'info',
      { labelName: 'bitcode-deliver-issue' }
    );
    // Issue with PR-only label
    const payloadIssue = {
      action: 'labeled',
      issue: { number: 4, pull_request: null },
      repository: { name: 'repo', owner: { login: 'owner' } },
      installation: { id: 42 },
      label: { name: 'bitcode-deliver-pr' }
    };
    const resIssue = await POST({ json: async () => payloadIssue } as any);
    expect(await resIssue.json()).toEqual({ success: true });
    expect(log).toHaveBeenCalledWith(
      '[route /webhook POST] Label not applicable for issue',
      'info',
      { labelName: 'bitcode-deliver-pr' }
    );
  });

  it('returns error when Supabase connection missing', async () => {
    // mock supabase to return no data
    mockFrom.mockReturnValue({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) });
    const payload = {
      action: 'labeled',
      issue: { number: 5, pull_request: null },
      repository: { name: 'repo', owner: { login: 'owner' } },
      installation: { id: 42 },
      label: { name: 'bitcode-deliver-issue' }
    };
    const res = await POST({ json: async () => payload } as any);
    expect(await res.json()).toEqual({ success: false, code: 500 });
    expect(log).toHaveBeenCalledWith(
      '[route /webhook POST] No user connection found',
      'warn',
      expect.objectContaining({ installationId: 42 })
    );
  });

  it('invokes pipeline successfully', async () => {
    // mock supabase to return a user and track that interaction is not processed
    const userConnections = createUserConnectionBuilder('user1');
    const { githubInteractions, defaultBuilder } = installCommentSupabaseMocks();
    const payload = {
      action: 'labeled',
      issue: { number: 6, pull_request: null },
      repository: { name: 'repo', owner: { login: 'owner' } },
      installation: { id: 42 },
      label: { name: 'bitcode-deliver-issue' }
    };
    const req: any = { json: async () => payload };
    const res = await POST(req);
    expect(await res.json()).toEqual({ success: true });
    // Should have invoked supabase lookup
    expect(mockFrom).toHaveBeenCalledWith('user_connections');
    expect(mockFrom).toHaveBeenCalledWith('github_interactions');
    // Should have logged asset-pack pipeline invocation and success
    expect(log).toHaveBeenCalledWith(
      '[route /webhook POST] Invoking asset-pack pipeline',
      'info',
      expect.objectContaining({
        label: 'bitcode-deliver-issue',
        isPR: false,
        issueNumber: 6,
        pipelineMeaning: 'asset_pack_pipeline',
        triggerCommand: 'bitcode-asset-pack-trigger',
      })
    );
    expect(track).toHaveBeenCalledWith(
      ASSET_PACK_PIPELINE_TRACK_EVENT,
      expectedAssetPackPipelineTrack('bitcode-deliver-issue', 'user1', 6)
    );
  });

  it('handles pipeline failure gracefully', async () => {
    // mock supabase to return a user
    mockFrom.mockReturnValue({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { user_id: 'user2' }, error: null }) }) })
    });
    // override exec to simulate failure
    const { exec } = require('child_process');
    exec.mockImplementation((cmd: string, cb: Function) => cb(new Error('docker fail')));
    const payload = {
      action: 'labeled',
      issue: { number: 7, pull_request: null },
      repository: { name: 'repo', owner: { login: 'owner' } },
      installation: { id: 42 },
      label: { name: 'bitcode-deliver-issue' }
    };
    const res = await POST({ json: async () => payload } as any);
    expect(await res.json()).toEqual({ success: true });
    expect(log).toHaveBeenCalledWith(
      '[route /webhook POST] Asset-pack pipeline trigger failed',
      'error',
      expect.objectContaining({
        label: 'bitcode-deliver-issue',
        userId: 'user2',
        issueNumber: 7,
        pipelineMeaning: 'asset_pack_pipeline',
      })
    );
    // track should not be called on failure
    expect(track).not.toHaveBeenCalledWith(ASSET_PACK_PIPELINE_TRACK_EVENT, expect.anything());
  });

  it('supports bitcode-pr label for asset-pack pipeline', async () => {
    // mock supabase to return a user and track that interaction is not processed
    installCommentSupabaseMocks();
    const payload = {
      action: 'labeled',
      issue: { number: 8, pull_request: null },
      repository: { name: 'repo', owner: { login: 'owner' } },
      installation: { id: 42 },
      label: { name: 'bitcode-pr' }
    };
    const req: any = { json: async () => payload };
    const res = await POST(req);
    expect(await res.json()).toEqual({ success: true });
    expect(log).toHaveBeenCalledWith(
      '[route /webhook POST] Invoking asset-pack pipeline',
      'info',
      expect.objectContaining({ label: 'bitcode-pr', isPR: false, issueNumber: 8 })
    );
    expect(track).toHaveBeenCalledWith(
      ASSET_PACK_PIPELINE_TRACK_EVENT,
      expectedAssetPackPipelineTrack('bitcode-pr', 'user1', 8)
    );
  });

  it('prevents duplicate processing of same interaction', async () => {
    // mock supabase to return a user and that interaction was already processed
    installCommentSupabaseMocks({ existingInteraction: true });
    const payload = {
      action: 'labeled',
      issue: { number: 9, pull_request: null },
      repository: { name: 'repo', owner: { login: 'owner' } },
      installation: { id: 42 },
      label: { name: 'bitcode-pr' }
    };
    const req: any = { json: async () => payload };
    const res = await POST(req);
    expect(await res.json()).toEqual({ success: true, message: 'Already processed' });
    expect(log).toHaveBeenCalledWith(
      '[route /webhook POST] Interaction already processed, skipping',
      'info',
      expect.objectContaining({ eventType: 'labeled', trigger: 'bitcode-pr' })
    );
    // Should not trigger pipeline
    expect(track).not.toHaveBeenCalledWith(ASSET_PACK_PIPELINE_TRACK_EVENT, expect.anything());
  });

  it('supports @bitcode-pr comment trigger', async () => {
    // mock supabase to return a user and track that interaction is not processed
    mockFrom.mockImplementation((table) => {
      if (table === 'user_connections') {
        return {
          select: () => ({
            eq: () => ({ maybeSingle: async () => ({ data: { user_id: 'user1' }, error: null }) })
          })
        };
      }

      if (table === 'github_interactions') {
        const chain = () => ({ eq: chain, maybeSingle: async () => ({ data: null, error: null }) });
        return {
          select: chain,
          insert: () => ({ error: null })
        };
      }

      return {
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) })
        })
      };
    });
    const payload = {
      action: 'created',
      issue: { number: 10, pull_request: null },
      repository: { name: 'repo', owner: { login: 'owner' } },
      installation: { id: 42 },
      comment: { id: 123, body: 'Please @bitcode-pr help with this issue', created_at: '2023-01-01T00:00:00Z' }
    };
    const req: any = { json: async () => payload, headers: { get: () => 'issue_comment' } };
    const res = await POST(req);
    expect(await res.json()).toEqual({ success: true });
    expect(log).toHaveBeenCalledWith(
      '[route /webhook POST] Invoking asset-pack pipeline',
      'info',
      expect.objectContaining({ label: 'issue_comment:pr', isPR: false, issueNumber: 10 })
    );
    expect(track).toHaveBeenCalledWith(
      ASSET_PACK_PIPELINE_TRACK_EVENT,
      expectedAssetPackPipelineTrack('issue_comment:pr', 'user1', 10)
    );
  });

  it('supports @bitcode-review comment trigger on PR', async () => {
    // mock supabase to return a user and track that interaction is not processed
    mockFrom.mockImplementation((table) => {
      if (table === 'user_connections') {
        return {
          select: () => ({
            eq: () => ({ maybeSingle: async () => ({ data: { user_id: 'user1' }, error: null }) })
          })
        };
      }

      if (table === 'github_interactions') {
        const chain = () => ({ eq: chain, maybeSingle: async () => ({ data: null, error: null }) });
        return {
          select: chain,
          insert: () => ({ error: null })
        };
      }

      return {
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) })
        })
      };
    });
    const payload = {
      action: 'created',
      issue: { number: 11, pull_request: { url: 'https://api.github.com/repos/owner/repo/pulls/11' } },
      repository: { name: 'repo', owner: { login: 'owner' } },
      installation: { id: 42 },
      comment: { id: 124, body: 'Please @bitcode-review this PR', created_at: '2023-01-01T00:00:00Z' }
    };
    const req: any = { json: async () => payload, headers: { get: () => 'issue_comment' } };
    const res = await POST(req);
    expect(await res.json()).toEqual({ success: true });
    expect(log).toHaveBeenCalledWith(
      '[route /webhook POST] Invoking asset-pack pipeline',
      'info',
      expect.objectContaining({ label: 'issue_comment:review', isPR: true, issueNumber: 11 })
    );
    expect(track).toHaveBeenCalledWith(
      ASSET_PACK_PIPELINE_TRACK_EVENT,
      expectedAssetPackPipelineTrack('issue_comment:review', 'user1', 11)
    );
  });

  it('supports @bitcode-commit comment trigger on PR', async () => {
    // mock supabase to return a user and track that interaction is not processed
    mockFrom.mockImplementation((table) => {
      if (table === 'user_connections') {
        return {
          select: () => ({
            eq: () => ({ maybeSingle: async () => ({ data: { user_id: 'user1' }, error: null }) })
          })
        };
      }

      if (table === 'github_interactions') {
        const chain = () => ({ eq: chain, maybeSingle: async () => ({ data: null, error: null }) });
        return {
          select: chain,
          insert: () => ({ error: null })
        };
      }

      return {
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) })
        })
      };
    });
    const payload = {
      action: 'created',
      issue: { number: 12, pull_request: { url: 'https://api.github.com/repos/owner/repo/pulls/12' } },
      repository: { name: 'repo', owner: { login: 'owner' } },
      installation: { id: 42 },
      comment: { id: 125, body: 'Please @bitcode-commit some changes', created_at: '2023-01-01T00:00:00Z' }
    };
    const req: any = { json: async () => payload, headers: { get: () => 'issue_comment' } };
    const res = await POST(req);
    expect(await res.json()).toEqual({ success: true });
    expect(log).toHaveBeenCalledWith(
      '[route /webhook POST] Invoking asset-pack pipeline',
      'info',
      expect.objectContaining({ label: 'issue_comment:commit', isPR: true, issueNumber: 12 })
    );
    expect(track).toHaveBeenCalledWith(
      ASSET_PACK_PIPELINE_TRACK_EVENT,
      expectedAssetPackPipelineTrack('issue_comment:commit', 'user1', 12)
    );
  });

  it('supports multiple @bitcode commands in single comment', async () => {
    // mock supabase to return a user and track that interaction is not processed
    const userConnections = createUserConnectionBuilder('user1');
    const githubInteractions = createGithubInteractionBuilder();
    const defaultBuilder = createDefaultBuilder();
    mockFrom.mockImplementation((table) => {
      if (table === 'user_connections') return userConnections;
      if (table === 'github_interactions') return githubInteractions;
      return defaultBuilder;
    });
    const payload = {
      action: 'created',
      issue: { number: 13, pull_request: null },
      repository: { name: 'repo', owner: { login: 'owner' } },
      installation: { id: 42 },
      comment: { id: 126, body: 'Please @bitcode-pr and @bitcode-comment on this issue', created_at: '2023-01-01T00:00:00Z' }
    };
    const req: any = { json: async () => payload, headers: { get: () => 'issue_comment' } };
    const res = await POST(req);
    expect(await res.json()).toEqual({ success: true });
    // Should process the first valid command (@bitcode-pr)
    expect(log).toHaveBeenCalledWith(
      '[route /webhook POST] Invoking asset-pack pipeline',
      'info',
      expect.objectContaining({ label: 'issue_comment:pr', isPR: false, issueNumber: 13 })
    );
    expect(track).toHaveBeenCalledWith(
      ASSET_PACK_PIPELINE_TRACK_EVENT,
      expectedAssetPackPipelineTrack('issue_comment:pr', 'user1', 13)
    );
  });
});
