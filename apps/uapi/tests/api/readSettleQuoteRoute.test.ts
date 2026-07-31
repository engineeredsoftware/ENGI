/**
 * @jest-environment node
 *
 * MVP-E2E L1-R2: POST /api/read/settle/quote contract.
 * Asserts session gate + needinesses → BTD multi-rail mock quote (no mainnet).
 */

jest.mock('@bitcode/supabase/ssr/server', () => ({
  createClient: jest.fn(),
}));

import { createClient } from '@bitcode/supabase/ssr/server';
import { POST } from '@/app/api/read/settle/quote/route';

const mockCreateClient = createClient as jest.Mock;

function requestFor(body: unknown) {
  return new Request('http://localhost/api/read/settle/quote', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/read/settle/quote (MVP-E2E L1-R2)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requires a session (L1-A1)', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: null }, error: null }) },
    });
    const response = await POST(
      requestFor({
        measurements: {
          needinesses: [{ measurementKind: 'domain-fit', volume: 0.8, weight: 1 }],
        },
      }),
    );
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ code: 'session_required', ok: false }),
    );
  });

  it('rejects empty / invalid needinesses for BTD volume', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: { id: 'u1' } }, error: null }) },
    });
    const response = await POST(
      requestFor({
        measurements: { needinesses: [] },
      }),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ ok: false }),
    );
  });

  it('returns mock multi-rail quote from *-fit needinesses', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: { id: 'u1' } }, error: null }) },
    });
    const response = await POST(
      requestFor({
        measurements: {
          needinesses: [
            { measurementKind: 'domain-fit', volume: 0.7, weight: 1 },
            { measurementKind: 'language-fit', volume: 0.6, weight: 1 },
          ],
        },
        btdTotalMinted: 0,
      }),
    );
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(typeof payload.needFitVolume).toBe('number');
    expect(payload.needFitVolume).toBeGreaterThan(0);
    expect(typeof payload.btdVolume).toBe('string');
    expect(typeof payload.expiresAt).toBe('string');
    expect(Array.isArray(payload.options)).toBe(true);
    expect(payload.options.length).toBeGreaterThan(0);
    for (const opt of payload.options) {
      expect(opt).toEqual(
        expect.objectContaining({
          payAsset: expect.any(String),
          payAmount: expect.any(String),
          payAmountDisplay: expect.any(String),
        }),
      );
    }
    // Advisory testnet quote — never implies mainnet settlement finality.
    expect(payload).not.toEqual(expect.objectContaining({ mainnet: true }));
  });
});
