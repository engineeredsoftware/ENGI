/**
 * @jest-environment node
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
import { GET } from '@/app/api/wallet/btc-balance/route';

const QA_ADDRESS = 'tb1p6x70u8ag7hkmgsve58lxhpgk5fhnanxp2vtuhvccv6n54f2m9mrsxe6wc2';

function installSupabaseMocks(options: {
  user?: { id: string } | null;
  settings?: Record<string, unknown> | null;
}) {
  (createClient as jest.Mock).mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: Object.prototype.hasOwnProperty.call(options, 'user') ? options.user : { id: 'user-1' } },
        error: null,
      }),
    },
  });

  const builder = {
    select: jest.fn(),
    eq: jest.fn(),
    maybeSingle: jest.fn().mockResolvedValue({
      data: options.settings === null ? null : { settings: options.settings },
      error: null,
    }),
  };
  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  (supabaseAdmin.from as jest.Mock).mockReturnValue(builder);
}

function mempoolResponse(confirmed: number, pending = 0) {
  return {
    ok: true,
    json: async () => ({
      chain_stats: { funded_txo_sum: confirmed, spent_txo_sum: 0 },
      mempool_stats: { funded_txo_sum: pending, spent_txo_sum: 0 },
    }),
  };
}

describe('GET /api/wallet/btc-balance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requires a session', async () => {
    installSupabaseMocks({ user: null, settings: null });

    const response = await GET();
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ code: 'wallet_session_required' }),
    );
  });

  it('rejects profiles with no wallet binding address', async () => {
    installSupabaseMocks({ settings: { bitcodeProfile: { walletBinding: null } } });

    const response = await GET();
    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ code: 'wallet_binding_missing' }),
    );
  });

  it('reads the bound address balance, trying testnet4 first for the ambiguous testnet label', async () => {
    installSupabaseMocks({
      settings: {
        bitcodeProfile: {
          walletBinding: {
            address: QA_ADDRESS,
            authAddress: QA_ADDRESS,
            paymentAddress: null,
            network: 'testnet',
          },
        },
      },
    });
    global.fetch = jest.fn(async () => mempoolResponse(125_000, 4_000)) as jest.Mock;

    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        network: 'testnet4',
        confirmedSats: 125_000,
        pendingSats: 4_000,
        confirmedBtc: 0.00125,
      }),
    );
    expect(global.fetch).toHaveBeenCalledWith(
      `https://mempool.space/testnet4/api/address/${QA_ADDRESS}`,
      expect.objectContaining({ cache: 'no-store' }),
    );
  });

  it('falls back to testnet3 when testnet4 shows no funds', async () => {
    installSupabaseMocks({
      settings: {
        bitcodeProfile: {
          walletBinding: { address: QA_ADDRESS, network: 'testnet' },
        },
      },
    });
    global.fetch = jest.fn(async (url: string) =>
      url.includes('/testnet4/') ? mempoolResponse(0, 0) : mempoolResponse(99_000, 0),
    ) as jest.Mock;

    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ ok: true, network: 'testnet3', confirmedSats: 99_000 }),
    );
  });
});
