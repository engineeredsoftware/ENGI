/**
 * @jest-environment node
 *
 * MVP-E2E L1-P1: POST /api/packs/payout/finalize fail-closed contracts.
 * Session, settleRunId, sellerBtdBps bounds, ownership, pending-payout state.
 */

jest.mock('@bitcode/supabase/ssr/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@bitcode/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}));

import { createClient } from '@bitcode/supabase/ssr/server';
import { supabaseAdmin } from '@bitcode/supabase';
import { GET, POST } from '@/app/api/packs/payout/finalize/route';

const mockCreateClient = createClient as jest.Mock;
const mockFrom = supabaseAdmin.from as jest.Mock;

function postFor(body: unknown) {
  return new Request('http://localhost/api/packs/payout/finalize', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

function sessionUser(id = 'seller-1') {
  mockCreateClient.mockResolvedValue({
    auth: { getUser: async () => ({ data: { user: { id } }, error: null }) },
  });
}

function pendingPayout(overrides: Record<string, unknown> = {}) {
  return {
    schema: 'bitcode.settle.pending-payout',
    status: 'pending-seller-review',
    sellerAccount: '0xseller',
    masterAccount: '0xmaster',
    btdVolume: '1000',
    payAmount: '100',
    payAsset: 'ETH',
    assetPackKey: 'ap-1',
    ...overrides,
  };
}

function mockSelectRow(row: Record<string, unknown> | null, error: unknown = null) {
  const chain: any = {
    select: () => chain,
    eq: () => chain,
    maybeSingle: async () => ({ data: row, error }),
  };
  return chain;
}

function mockUpdateOk() {
  const chain: any = {
    update: () => chain,
    eq: async () => ({ error: null }),
  };
  return chain;
}

describe('POST /api/packs/payout/finalize (MVP-E2E L1-P1)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requires a session (fail-closed)', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: null }, error: null }) },
    });
    const response = await POST(postFor({ settleRunId: 'run-1', sellerBtdBps: 5000 }));
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: 'session_required' }),
    );
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('rejects invalid JSON', async () => {
    sessionUser();
    const response = await POST(postFor('not-json'));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, error: 'Invalid JSON body.' }),
    );
  });

  it('requires settleRunId', async () => {
    sessionUser();
    const response = await POST(postFor({ sellerBtdBps: 5000 }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, error: 'settleRunId required.' }),
    );
  });

  it('rejects sellerBtdBps outside 0..10000', async () => {
    sessionUser();
    const response = await POST(postFor({ settleRunId: 'run-1', sellerBtdBps: 10001 }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, error: 'sellerBtdBps must be 0..10000.' }),
    );
  });

  it('returns 404 when settle run is missing', async () => {
    sessionUser();
    mockFrom.mockReturnValue(mockSelectRow(null));
    const response = await POST(postFor({ settleRunId: 'missing', sellerBtdBps: 5000 }));
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, error: 'Settle run not found.' }),
    );
  });

  it('returns 404 with settle_run_forbidden when caller is not owner', async () => {
    sessionUser('other-user');
    mockFrom.mockReturnValue(
      mockSelectRow({
        id: 'run-1',
        user_id: 'seller-1',
        status: 'completed',
        output: { pendingPayout: pendingPayout() },
        context: {},
      }),
    );
    const response = await POST(postFor({ settleRunId: 'run-1', sellerBtdBps: 5000 }));
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        code: 'settle_run_forbidden',
        error: 'Settle run not found.',
      }),
    );
  });

  it('rejects incomplete settle runs', async () => {
    sessionUser();
    mockFrom.mockReturnValue(
      mockSelectRow({
        id: 'run-1',
        user_id: 'seller-1',
        status: 'running',
        output: { pendingPayout: pendingPayout() },
        context: {},
      }),
    );
    const response = await POST(postFor({ settleRunId: 'run-1', sellerBtdBps: 5000 }));
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, error: 'Settle run is not completed.' }),
    );
  });

  it('rejects when no pending payout is present', async () => {
    sessionUser();
    mockFrom.mockReturnValue(
      mockSelectRow({
        id: 'run-1',
        user_id: 'seller-1',
        status: 'completed',
        output: {},
        context: {},
      }),
    );
    const response = await POST(postFor({ settleRunId: 'run-1', sellerBtdBps: 5000 }));
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, error: 'No pending payout on this settle run.' }),
    );
  });

  it('rejects already-finalized payouts', async () => {
    sessionUser();
    mockFrom.mockReturnValue(
      mockSelectRow({
        id: 'run-1',
        user_id: 'seller-1',
        status: 'completed',
        output: { pendingPayout: pendingPayout({ status: 'finalized' }) },
        context: {},
      }),
    );
    const response = await POST(postFor({ settleRunId: 'run-1', sellerBtdBps: 5000 }));
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, error: 'Payout already finalized.' }),
    );
  });

  it('finalizes seller payout and persists projected split', async () => {
    sessionUser();
    let selectCalls = 0;
    mockFrom.mockImplementation(() => {
      selectCalls += 1;
      if (selectCalls === 1) {
        return mockSelectRow({
          id: 'run-1',
          user_id: 'seller-1',
          status: 'completed',
          output: { pendingPayout: pendingPayout() },
          context: { settlementState: 'settled' },
        });
      }
      return mockUpdateOk();
    });

    const response = await POST(postFor({ settleRunId: 'run-1', sellerBtdBps: 1000 }));
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(payload.settleRunId).toBe('run-1');
    expect(payload.payout).toEqual(
      expect.objectContaining({
        schema: 'bitcode.settle.pending-payout',
        status: 'finalized',
        sellerBtdBpsFinalized: 1000,
      }),
    );
    expect(payload.split).toEqual(
      expect.objectContaining({
        sellerBtdBps: 1000,
        payAsset: 'ETH',
      }),
    );
    expect(payload.preview).toBeTruthy();
    expect(selectCalls).toBe(2);
  });
});

describe('GET /api/packs/payout/finalize (preview)', () => {
  it('returns split preview without writing', async () => {
    const response = await GET(
      new Request(
        'http://localhost/api/packs/payout/finalize?btdVolume=1000&payAmount=100&sellerBtdBps=5000&payAsset=ETH',
      ),
    );
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(payload.split).toEqual(
      expect.objectContaining({
        sellerBtdBps: 5000,
        payAsset: 'ETH',
      }),
    );
    expect(payload.preview).toBeTruthy();
  });
});
