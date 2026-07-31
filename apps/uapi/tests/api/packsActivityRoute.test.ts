/**
 * @jest-environment node
 *
 * MVP-E2E L1-X1: GET /api/packs/activity source-safe response contracts.
 */

jest.mock('@/app/api/activity/route', () => ({
  GET: jest.fn(),
}));

jest.mock('@bitcode/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}));

import { GET as getActivity } from '@/app/api/activity/route';
import { supabaseAdmin } from '@bitcode/supabase';
import { GET } from '@/app/api/packs/activity/route';

const mockGetActivity = getActivity as jest.Mock;
const mockFrom = supabaseAdmin.from as jest.Mock;

function mockActivityResponse(
  body: Record<string, unknown>,
  status = 200,
): { ok: boolean; status: number; json: () => Promise<Record<string, unknown>> } {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

function activityRecord(partial: Record<string, unknown> = {}) {
  // normalizePackActivityRecord promotes from record.payload (not .metadata).
  const payload = {
    packActivityType: 'depository-assetpack',
    admissionState: 'admitted-to-depository',
    assetPackTitle: 'Session refresh pack',
    output: {},
    context: {
      packActivityType: 'depository-assetpack',
      admissionState: 'admitted-to-depository',
    },
    ...(partial.payload && typeof partial.payload === 'object'
      ? (partial.payload as Record<string, unknown>)
      : {}),
  };
  const { payload: _drop, ...rest } = partial;
  return {
    id: 'act-1',
    kind: 'execution',
    scope: 'personal',
    title: 'Admitted pack',
    summary: 'Source-safe summary',
    timestamp: '2026-07-31T12:00:00.000Z',
    status: 'completed',
    sourceSafety: {
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      unpaidDataPackSourceVisible: false,
      rawPromptVisible: false,
      interpolatedPromptVisible: false,
      rawProviderResponseVisible: false,
      sourceSnippetVisible: false,
    },
    ...rest,
    payload,
  };
}

function emptyChain() {
  const chain: any = {
    select: () => chain,
    eq: () => chain,
    order: () => chain,
    limit: async () => ({ data: [], error: null }),
  };
  return chain;
}

describe('GET /api/packs/activity (MVP-E2E L1-X1)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFrom.mockImplementation(() => emptyChain());
  });

  it('propagates base activity failure', async () => {
    mockGetActivity.mockResolvedValue(
      mockActivityResponse({ ok: false, error: 'session missing' }, 401),
    );
    const response = await GET(new Request('http://localhost/api/packs/activity'));
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, error: 'session missing' }),
    );
  });

  it('returns source-safe envelope with empty records when base activity is empty', async () => {
    mockGetActivity.mockResolvedValue(
      mockActivityResponse({ ok: true, records: [], summary: { total: 0 } }),
    );
    const response = await GET(new Request('http://localhost/api/packs/activity?limit=10'));
    expect(mockGetActivity).toHaveBeenCalled();
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(payload.records).toEqual([]);
    expect(payload.sourceSafety).toEqual(
      expect.objectContaining({
        sourceSafeMetadataOnly: true,
        protectedSourceVisible: false,
        unpaidAssetPackSourceVisible: false,
        rawPromptVisible: false,
        sourceSnippetVisible: false,
      }),
    );
  });

  it('filters unsafe records out of the response', async () => {
    mockGetActivity.mockResolvedValue(
      mockActivityResponse({
        ok: true,
        records: [
          activityRecord({ id: 'safe-1' }),
          activityRecord({
            id: 'unsafe-1',
            sourceSafety: {
              sourceSafeMetadataOnly: false,
              protectedSourceVisible: true,
              unpaidDataPackSourceVisible: false,
              rawPromptVisible: false,
              interpolatedPromptVisible: false,
              rawProviderResponseVisible: false,
              sourceSnippetVisible: false,
            },
            summary: 'Contains Protected Source Body leak marker',
          }),
        ],
      }),
    );

    const response = await GET(new Request('http://localhost/api/packs/activity'));
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(payload.records.every((r: { id: string }) => r.id !== 'unsafe-1')).toBe(true);
    expect(payload.sourceSafety.sourceSafeMetadataOnly).toBe(true);
    const flat = JSON.stringify(payload).toLowerCase();
    expect(flat).not.toContain('protected source body');
  });

  it('mine-only type skips global depository merge (no admin list for network rows)', async () => {
    mockGetActivity.mockResolvedValue(
      mockActivityResponse({ ok: true, records: [activityRecord()] }),
    );
    const response = await GET(
      new Request('http://localhost/api/packs/activity?type=my-assetpacks'),
    );
    expect(response.status).toBe(200);
    expect(mockFrom).not.toHaveBeenCalled();
    const payload = await response.json();
    expect(payload.ok).toBe(true);
  });

  it('forwards a bounded limit to base activity (never > 100)', async () => {
    mockGetActivity.mockImplementation(async (req: Request) => {
      const rawUrl = typeof req.url === 'string' ? req.url : String(req.url ?? '');
      // Route computes Math.min(limit * 2, 100) before calling activity.
      const match = /[?&]limit=(\d+)/.exec(rawUrl);
      if (match) {
        const limit = Number(match[1]);
        expect(limit).toBeGreaterThan(0);
        expect(limit).toBeLessThanOrEqual(100);
      }
      return mockActivityResponse({ ok: true, records: [] });
    });
    const response = await GET(
      new Request('http://localhost/api/packs/activity?limit=999'),
    );
    expect(response.status).toBe(200);
    expect(mockGetActivity).toHaveBeenCalled();
    // Input limit 999 is clamped in packs route: Math.max(1, Math.min(999, 100)) = 100
    // then activity gets min(100*2, 100) = 100.
  });
});
