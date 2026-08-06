const mockUserProfiles = {
  isAdmin: jest.fn(),
};
const mockCreateClient = jest.fn();
const mockSendServerEvent = jest.fn();

jest.mock(
  'next/server',
  () => ({
    NextResponse: {},
  }),
  { virtual: true },
);

jest.mock('@bitcode/observability', () => ({
  traceRoute: (_name: string, fn: unknown) => fn,
}));

jest.mock('@bitcode/logger', () => ({
  log: jest.fn(),
}));

jest.mock('@bitcode/api/responses', () => ({
  createJsonResponse: (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  createErrorResponse: (error: unknown) =>
    new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    ),
  createAuthErrorResponse: () =>
    new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    }),
}));

jest.mock('@bitcode/external-telemetry-google', () => ({
  sendServerEvent: (...args: unknown[]) => mockSendServerEvent(...args),
}));

jest.mock(
  '@bitcode/supabase/ssr/server',
  () => ({
    createClient: () => mockCreateClient(),
  }),
  { virtual: true },
);

jest.mock('@bitcode/supabase', () => ({
  supabaseAdmin: {},
}));

jest.mock('@bitcode/orm', () => ({
  createAdminClient: () => ({
    userProfiles: mockUserProfiles,
    userBtdBalances: {},
    userBtdTransactions: {},
    userModelPreferences: {},
    notifications: {},
  }),
  hydrateBitcodeProfile: (profile: unknown) => profile,
  UserApiKeysModel: jest.fn().mockImplementation(() => ({})),
}));

import { rejectBtdBalanceMutation } from '../user';

describe('user BTD mutation route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects unauthenticated generic BTD mutation', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: async () => ({ data: { user: null }, error: { message: 'no auth' } }),
      },
    });

    const response = await rejectBtdBalanceMutation(
      new Request('https://bitcode.test/api/user/btd', { method: 'POST' }) as never,
    );

    expect(response.status).toBe(401);
  });

  it('rejects non-admin generic BTD mutation before mutation side effects', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: async () => ({ data: { user: { id: 'user-1' } }, error: null }),
      },
    });
    mockUserProfiles.isAdmin.mockResolvedValue(false);

    const response = await rejectBtdBalanceMutation(
      new Request('https://bitcode.test/api/user/btd', { method: 'POST' }) as never,
    );

    expect(response.status).toBe(403);
    expect(mockSendServerEvent).not.toHaveBeenCalled();
  });

  it('rejects admin generic BTD mutation as non-fungible source-share law', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: async () => ({ data: { user: { id: 'admin-1' } }, error: null }),
      },
    });
    mockUserProfiles.isAdmin.mockResolvedValue(true);

    const response = await rejectBtdBalanceMutation(
      new Request('https://bitcode.test/api/user/btd', { method: 'POST' }) as never,
    );
    const body = await response.json();

    expect(response.status).toBe(410);
    expect(body.error).toContain('non-fungible asset-pack share/read-right');
    expect(body.acquisitionPaths.terminalReadMinting).toContain('/reads');
    expect(mockSendServerEvent).toHaveBeenCalledWith('generic_btd_mutation_rejected', {
      admin_id: 'admin-1',
      reason: 'btd_is_non_fungible_asset_pack_share_read_right',
    });
  });
});
