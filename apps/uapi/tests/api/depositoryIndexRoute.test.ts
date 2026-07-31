/**
 * @jest-environment node
 *
 * MVP-E2E L1-S1 / L1-A1: POST /api/depository/index contract.
 */

jest.mock('@bitcode/supabase/ssr/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@vercel/functions', () => ({
  waitUntil: jest.fn((promise: Promise<unknown>) => promise),
}));

jest.mock('@/lib/depository-index-job', () => ({
  indexDepositoryAssetPack: jest.fn(),
}));

import { createClient } from '@bitcode/supabase/ssr/server';
import { indexDepositoryAssetPack } from '@/lib/depository-index-job';
import { waitUntil } from '@vercel/functions';
import { POST } from '@/app/api/depository/index/route';

const mockCreateClient = createClient as jest.Mock;
const mockIndex = indexDepositoryAssetPack as jest.Mock;
const mockWaitUntil = waitUntil as jest.Mock;

function requestFor(body: unknown) {
  return new Request('http://localhost/api/depository/index', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/depository/index (MVP-E2E L1-S1)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIndex.mockResolvedValue({
      ok: true,
      assetId: 'ap-e2e-1',
      embeddingState: 'skipped',
    });
  });

  it('requires a session (L1-A1)', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: null }, error: null }) },
    });
    const response = await POST(requestFor({ assetId: 'ap-1' }));
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ code: 'session_required', ok: false }),
    );
    expect(mockIndex).not.toHaveBeenCalled();
  });

  it('rejects invalid JSON', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: { id: 'u1' } }, error: null }) },
    });
    const response = await POST(
      new Request('http://localhost/api/depository/index', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: 'not-json',
      }),
    );
    expect(response.status).toBe(400);
  });

  it('requires assetId', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: { id: 'u1' } }, error: null }) },
    });
    const response = await POST(requestFor({ title: 'Missing id' }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ ok: false }),
    );
    expect(mockIndex).not.toHaveBeenCalled();
  });

  it('sync indexes commercial NL + fixtures payload', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: { id: 'u1' } }, error: null }) },
    });
    const response = await POST(
      requestFor({
        assetId: 'ap-e2e-1',
        commercialTitle: 'Webhook retries pack',
        commercialDescription: 'Exponential backoff for Stripe webhooks.',
        absoluteFixtures: [
          {
            measurementKind: 'function-count',
            label: 'Functions',
            descriptor: 'Retry helpers',
            volume: 0.4,
            status: 'measured',
          },
        ],
        skipEmbed: true,
        sync: true,
      }),
    );
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(payload.assetId).toBe('ap-e2e-1');
    expect(mockIndex).toHaveBeenCalledWith(
      expect.objectContaining({
        assetId: 'ap-e2e-1',
        commercialTitle: 'Webhook retries pack',
        commercialDescription: 'Exponential backoff for Stripe webhooks.',
        skipEmbed: true,
        absoluteFixtures: [
          expect.objectContaining({ measurementKind: 'function-count', volume: 0.4 }),
        ],
      }),
    );
    expect(mockWaitUntil).not.toHaveBeenCalled();
  });

  it('async mode enqueues background index via waitUntil', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: { id: 'u1' } }, error: null }) },
    });
    const response = await POST(
      requestFor({
        assetId: 'ap-async',
        title: 'Pack',
        skipEmbed: true,
      }),
    );
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({
        ok: true,
        assetId: 'ap-async',
        status: 'indexing',
      }),
    );
    expect(mockWaitUntil).toHaveBeenCalledTimes(1);
  });
});
