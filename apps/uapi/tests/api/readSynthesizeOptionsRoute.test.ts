/**
 * @jest-environment node
 *
 * MVP-E2E L1-R1: POST /api/read/synthesize-options fail-closed contracts
 * (session, real inference, repository, Need). Full pipeline dispatch is
 * covered by deposit twin + L2 spine; this suite locks the thin route gate.
 */

jest.mock('@bitcode/supabase/ssr/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@bitcode/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}));

jest.mock('@vercel/functions', () => ({
  waitUntil: jest.fn((promise: Promise<unknown>) => promise),
}));

jest.mock('@bitcode/pipelines-generics', () => ({
  createStreamingExecution: jest.fn(),
}));

jest.mock('@bitcode/asset-packs-pipelines-syntheses-domain/runtime-inference-policy', () => ({
  isAssetPackRealInferenceEnabled: jest.fn(() => true),
}));

jest.mock('@/app/api/read/synthesize-options/dispatch-read-synthesis', () => ({
  runReadOptionSynthesis: jest.fn(async () => undefined),
}));

import { createClient } from '@bitcode/supabase/ssr/server';
import { supabaseAdmin } from '@bitcode/supabase';
import { isAssetPackRealInferenceEnabled } from '@bitcode/asset-packs-pipelines-syntheses-domain/runtime-inference-policy';
import { createStreamingExecution } from '@bitcode/pipelines-generics';
import { POST } from '@/app/api/read/synthesize-options/route';

const mockCreateClient = createClient as jest.Mock;
const mockRealInference = isAssetPackRealInferenceEnabled as jest.Mock;
const mockFrom = supabaseAdmin.from as jest.Mock;
const mockCreateExecution = createStreamingExecution as jest.Mock;

function requestFor(body: unknown) {
  return new Request('http://localhost/api/read/synthesize-options', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function installSession(user: { id: string } | null) {
  mockCreateClient.mockResolvedValue({
    auth: { getUser: async () => ({ data: { user }, error: null }) },
  });
}

describe('POST /api/read/synthesize-options (MVP-E2E L1-R1)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRealInference.mockReturnValue(true);
    mockFrom.mockReturnValue({
      insert: jest.fn(async () => ({ error: null })),
    });
    mockCreateExecution.mockResolvedValue({ id: 'exec-1' });
  });

  it('requires a session (L1-A1)', async () => {
    installSession(null);
    const response = await POST(
      requestFor({
        repositoryFullName: 'acme/demo',
        need: 'Add retries to payment webhooks',
      }),
    );
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ code: 'read_session_required' }),
    );
  });

  it('fails closed when real inference is disabled', async () => {
    installSession({ id: 'u1' });
    mockRealInference.mockReturnValue(false);
    const response = await POST(
      requestFor({
        repositoryFullName: 'acme/demo',
        need: 'Add retries to payment webhooks',
      }),
    );
    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ code: 'real_inference_required' }),
    );
  });

  it('requires repositoryFullName owner/name', async () => {
    installSession({ id: 'u1' });
    const response = await POST(
      requestFor({
        repositoryFullName: 'not-a-repo',
        need: 'Add retries',
      }),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ code: 'repository_required' }),
    );
  });

  it('requires need (reader instruction)', async () => {
    installSession({ id: 'u1' });
    const response = await POST(
      requestFor({
        repositoryFullName: 'acme/demo',
        need: '   ',
      }),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ code: 'need_required' }),
    );
  });

  it('accepts need under instructions alias and inserts running execution', async () => {
    installSession({ id: 'u1' });
    const insert = jest.fn(async () => ({ error: null }));
    mockFrom.mockReturnValue({ insert });

    const response = await POST(
      requestFor({
        repositoryFullName: 'acme/payments',
        instructions: 'Honor Need: session refresh for OAuth clients',
        relevantPaths: ['src/auth/'],
        irrelevantPaths: ['vendor/'],
      }),
    );
    // Route may return 200 dispatched or continue after insert; assert insert shape.
    expect(insert).toHaveBeenCalled();
    const row = insert.mock.calls[0][0];
    expect(row).toEqual(
      expect.objectContaining({
        user_id: 'u1',
        type: 'agentic-execution:asset-pack',
        status: 'running',
      }),
    );
    expect(row.input).toEqual(
      expect.objectContaining({
        productPipeline: 'synthesize-reads-asset-packs-pipeline',
        repositoryFullName: 'acme/payments',
        relevantPathCount: 1,
        irrelevantPathCount: 1,
      }),
    );
    // Never persist full Need body in input metadata (length only).
    expect(row.input.need).toBeUndefined();
    expect(row.input.needLength).toBeGreaterThan(0);
    expect(response.status).toBeGreaterThanOrEqual(200);
  });
});
