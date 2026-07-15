/**
 * @jest-environment node
 */

const mockCreateDeposit = jest.fn((body?: Record<string, unknown>) => ({
  ok: true,
  asset: { assetId: 'asset-1', repositoryAnchor: body?.repositoryAnchor ?? null },
}));
const mockMakeBitcodeBranch = jest.fn(async (body?: Record<string, unknown>) => ({
  ok: true,
  specVersion: 'V26',
  latestRun: { id: 'run-1', repositoryAnchor: body?.repositoryAnchor ?? null },
}));
const mockGetConnection = jest.fn();
const mockGetAuthFromConnection = jest.fn();
const mockValidateToken = jest.fn();
const mockListRepositories = jest.fn();
const mockReadBitcodeWalletConnectionStatus = jest.fn();

jest.mock('@bitcode/supabase/ssr/server', () => ({ createClient: jest.fn() }));
jest.mock('@/app/api/wallet/_shared', () => ({
  readBitcodeWalletConnectionStatus: jest.fn((...args: unknown[]) =>
    mockReadBitcodeWalletConnectionStatus(...args),
  ),
}));
jest.mock('@bitcode/vcs-generics', () => ({
  VCSConnections: class MockVCSConnections {
    constructor(_supabase: unknown) {}

    getConnection(userId: string, provider: string) {
      return mockGetConnection(userId, provider);
    }

    getAuthFromConnection(connectionId: string) {
      return mockGetAuthFromConnection(connectionId);
    }
  },
  VCSProviderFactory: {
    createFromEnvironment: jest.fn(async () => ({
      validateToken: mockValidateToken,
      listRepositories: mockListRepositories,
    })),
  },
}));

jest.mock('@/lib/bitcode-app-context', () => {
  return {
    getBitcodeAppContext: () => ({
      createDeposit: mockCreateDeposit,
      makeBitcodeBranch: mockMakeBitcodeBranch,
    }),
    readBitcodeRequestBody: async (request: Request) => {
      const text = await request.text();
      return text.trim() ? (JSON.parse(text) as Record<string, unknown>) : {};
    },
    toBitcodeErrorResponse: (error: unknown) => {
      const resolvedError = error instanceof Error ? (error as Error & { statusCode?: number }) : new Error('Unknown error.');
      return new Response(
        JSON.stringify({ error: resolvedError.message || 'Unknown error.' }),
        {
          status: resolvedError.statusCode || 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    },
  };
});

import { createClient } from '@bitcode/supabase/ssr/server';
import { POST as postDeposit } from '@/app/api/deposits/route';
import { POST as postMakeBitcodeBranch } from '@/app/api/make-bitcode-branch/route';

type MockSupabaseBuilder = {
  select: jest.Mock;
  eq: jest.Mock;
  limit: jest.Mock;
  maybeSingle: jest.Mock;
};

function createBuilder(result: { data: unknown; error: unknown }): MockSupabaseBuilder {
  const builder = {
    select: jest.fn(),
    eq: jest.fn(),
    limit: jest.fn(),
    maybeSingle: jest.fn().mockResolvedValue(result),
  } as MockSupabaseBuilder;
  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.limit.mockReturnValue(builder);
  return builder;
}

function createRepositoryInventoryBuilder(repositoryFullNames: string[]): MockSupabaseBuilder {
  const builder = {
    select: jest.fn(),
    eq: jest.fn(),
    limit: jest.fn(),
    maybeSingle: jest.fn(),
  } as MockSupabaseBuilder;
  const filters: Record<string, unknown> = {};

  builder.select.mockReturnValue(builder);
  builder.eq.mockImplementation((column: string, value: unknown) => {
    filters[column] = value;
    return builder;
  });
  builder.limit.mockReturnValue(builder);
  builder.maybeSingle.mockImplementation(async () => {
    const exactRepositoryAnchor =
      typeof filters.repo_full_name === 'string' ? filters.repo_full_name : null;
    const matchedRepository = exactRepositoryAnchor
      ? repositoryFullNames.find((entry) => entry === exactRepositoryAnchor) || null
      : null;
    const anyRepository = repositoryFullNames[0] || null;

    return {
      data: exactRepositoryAnchor
        ? matchedRepository
          ? { repo_full_name: matchedRepository }
          : null
        : anyRepository
          ? { repo_full_name: anyRepository }
          : null,
      error: null,
    };
  });

  return builder;
}

function installSupabaseReadinessMocks(options: {
  user?: { id: string } | null;
  githubConnection?: Record<string, unknown> | null;
  validRepositoryProvider?: boolean;
  walletConnectionStatus?: Record<string, unknown> | null;
  profile?: Record<string, unknown> | null;
  userError?: { message: string } | null;
  storedRepositoryInventory?: string[];
  liveRepositoryInventory?: string[];
}) {
  const profileBuilder = createBuilder({ data: options.profile ?? null, error: null });
  const connectionBuilder = createBuilder({
    data: options.githubConnection ? { connection_data: options.githubConnection } : null,
    error: null,
  });
  const from = jest.fn((table: string) => {
    if (table === 'user_profiles') return profileBuilder;
    if (table === 'user_connections') return connectionBuilder;
    if (table === 'vcs_repositories') {
      return createRepositoryInventoryBuilder(options.storedRepositoryInventory || []);
    }
    throw new Error(`Unexpected table ${table}`);
  });

  (createClient as jest.Mock).mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: options.user ?? null },
        error: options.userError ?? null,
      }),
    },
    from,
  });

  mockGetConnection.mockResolvedValue(
    options.githubConnection
      ? { id: 'connection-1', connectionData: options.githubConnection }
      : null,
  );
  mockGetAuthFromConnection.mockResolvedValue(
    options.githubConnection ? { provider: 'github', token: 'test-token' } : null,
  );
  mockValidateToken.mockResolvedValue(options.validRepositoryProvider ?? Boolean(options.githubConnection));
  mockListRepositories.mockResolvedValue(
    (options.liveRepositoryInventory || []).map((fullName) => ({
      id: fullName,
      name: fullName.split('/')[1] || fullName,
      fullName,
    })),
  );
  const walletBinding = (options.profile as any)?.settings?.bitcodeProfile?.walletBinding ?? null;
  mockReadBitcodeWalletConnectionStatus.mockResolvedValue(
    options.walletConnectionStatus ??
      (walletBinding?.status === 'verified'
        ? {
            connected: true,
            provider: walletBinding.provider ?? 'walletconnect',
            valid: true,
            address: walletBinding.address ?? null,
            verificationState: 'verified',
          }
        : walletBinding?.address
          ? {
              connected: false,
              provider: walletBinding.provider ?? 'manual',
              valid: false,
              address: walletBinding.address ?? null,
              verificationState: walletBinding.status ?? 'manual',
            }
          : null),
  );

  return { from, profileBuilder, connectionBuilder };
}

describe('Bitcode transaction write routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockValidateToken.mockResolvedValue(true);
    mockListRepositories.mockResolvedValue([]);
    mockReadBitcodeWalletConnectionStatus.mockResolvedValue(null);
  });

  it('rejects deposit writes when the operator is unauthenticated', async () => {
    installSupabaseReadinessMocks({
      user: null,
      userError: { message: 'no auth' },
    });

    const response = await postDeposit(
      new Request('http://localhost/api/deposits', {
        method: 'POST',
        body: JSON.stringify({ repositoryAnchor: 'bitcode/bitcode', title: 'asset draft' }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toContain('review-only mode');
    expect(mockCreateDeposit).not.toHaveBeenCalled();
  });

  it('rejects deposit writes while wallet verification remains staged', async () => {
    installSupabaseReadinessMocks({
      user: { id: 'user-1' },
      githubConnection: { installationId: 123 },
      profile: {
        id: 'user-1',
        settings: {
          bitcodeProfile: {
            walletBinding: {
              address: 'bc1qbitcodeoperator',
              provider: 'manual',
              status: 'manual',
              boundAt: '2026-04-22T00:00:00.000Z',
            },
          },
        },
      },
    });

    const response = await postDeposit(
      new Request('http://localhost/api/deposits', {
        method: 'POST',
        body: JSON.stringify({ repositoryAnchor: 'bitcode/bitcode', title: 'asset draft' }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.error).toContain('signed settlement remains staged');
    expect(mockCreateDeposit).not.toHaveBeenCalled();
  });

  it('accepts deposit writes for provider-backed pending wallet signatures during V28 staging', async () => {
    installSupabaseReadinessMocks({
      user: { id: 'user-1' },
      githubConnection: { installationId: 123 },
      storedRepositoryInventory: ['bitcode/bitcode'],
      walletConnectionStatus: {
        connected: true,
        provider: 'leather',
        valid: true,
        address: 'bc1qbitcodeoperator',
        verificationState: 'pending',
        metadata: {
          source: 'wallet_provider_connection',
          proofKind: 'bitcoin_message_signature',
        },
      },
      profile: {
        id: 'user-1',
        settings: {
          bitcodeProfile: {
            walletBinding: {
              address: 'bc1qbitcodeoperator',
              provider: 'leather',
              status: 'pending',
              proofKind: 'bitcoin_message_signature',
              boundAt: '2026-04-22T00:00:00.000Z',
            },
          },
        },
      },
    });

    const response = await postDeposit(
      new Request('http://localhost/api/deposits', {
        method: 'POST',
        body: JSON.stringify({ repositoryAnchor: 'bitcode/bitcode', title: 'asset draft' }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mockCreateDeposit).toHaveBeenCalledWith(
      expect.objectContaining({
        repositoryAnchor: 'bitcode/bitcode',
        repositoryProvider: 'github',
      }),
    );
  });

  it('rejects branch writes when the repository anchor is missing', async () => {
    installSupabaseReadinessMocks({
      user: { id: 'user-1' },
      githubConnection: { installationId: 123 },
      profile: {
        id: 'user-1',
        settings: {
          bitcodeProfile: {
            walletBinding: {
              address: 'bc1qbitcodeoperator',
              provider: 'walletconnect',
              status: 'verified',
              boundAt: '2026-04-22T00:00:00.000Z',
            },
          },
        },
      },
    });

    const response = await postMakeBitcodeBranch(
      new Request('http://localhost/api/make-bitcode-branch', {
        method: 'POST',
        body: JSON.stringify({ scenarioId: 'read-1', branchMode: 'patch', principal: 'reviewer' }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.error).toContain('Select a repository anchor');
    expect(mockMakeBitcodeBranch).not.toHaveBeenCalled();
  });

  it('accepts ready deposit and branch writes once verified signing and repository scope are present', async () => {
    installSupabaseReadinessMocks({
      user: { id: 'user-1' },
      githubConnection: { installationId: 123 },
      storedRepositoryInventory: ['bitcode/bitcode', 'bitcode/bitcode-core'],
      profile: {
        id: 'user-1',
        settings: {
          bitcodeProfile: {
            walletBinding: {
              address: 'bc1qbitcodeoperator',
              provider: 'walletconnect',
              status: 'verified',
              boundAt: '2026-04-22T00:00:00.000Z',
            },
          },
        },
      },
    });

    const depositResponse = await postDeposit(
      new Request('http://localhost/api/deposits', {
        method: 'POST',
        body: JSON.stringify({
          repositoryAnchor: 'bitcode/bitcode',
          sourceRepo: 'bitcode/bitcode',
          title: 'asset draft',
        }),
      }),
    );
    const branchResponse = await postMakeBitcodeBranch(
      new Request('http://localhost/api/make-bitcode-branch', {
        method: 'POST',
        body: JSON.stringify({
          repositoryAnchor: 'bitcode/bitcode',
          scenarioId: 'read-1',
          branchMode: 'patch',
          principal: 'reviewer',
        }),
      }),
    );

    expect(depositResponse.status).toBe(200);
    expect(branchResponse.status).toBe(200);
    expect(mockCreateDeposit).toHaveBeenCalledWith(
      expect.objectContaining({
        repositoryAnchor: 'bitcode/bitcode',
        repositoryProvider: 'github',
      }),
    );
    expect(mockMakeBitcodeBranch).toHaveBeenCalledWith(
      expect.objectContaining({
        repositoryAnchor: 'bitcode/bitcode',
        repositoryProvider: 'github',
      }),
    );
  });

  it('rejects deposit writes when the requested repository anchor is outside the connected provider inventory', async () => {
    installSupabaseReadinessMocks({
      user: { id: 'user-1' },
      githubConnection: { installationId: 123 },
      storedRepositoryInventory: ['bitcode/bitcode', 'bitcode/bitcode-core'],
      profile: {
        id: 'user-1',
        settings: {
          bitcodeProfile: {
            walletBinding: {
              address: 'bc1qbitcodeoperator',
              provider: 'walletconnect',
              status: 'verified',
              boundAt: '2026-04-22T00:00:00.000Z',
            },
          },
        },
      },
    });

    const response = await postDeposit(
      new Request('http://localhost/api/deposits', {
        method: 'POST',
        body: JSON.stringify({
          repositoryAnchor: 'bitcode/not-admitted',
          repositoryProvider: 'github',
          title: 'asset draft',
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.error).toContain('not present in the connected GitHub repository inventory');
    expect(mockCreateDeposit).not.toHaveBeenCalled();
  });

  it('rejects settlement-bearing writes when the saved repository provider session is no longer valid', async () => {
    installSupabaseReadinessMocks({
      user: { id: 'user-1' },
      githubConnection: { installationId: 123 },
      validRepositoryProvider: false,
      storedRepositoryInventory: ['bitcode/bitcode'],
      profile: {
        id: 'user-1',
        settings: {
          bitcodeProfile: {
            walletBinding: {
              address: 'bc1qbitcodeoperator',
              provider: 'walletconnect',
              status: 'verified',
              boundAt: '2026-04-22T00:00:00.000Z',
            },
          },
        },
      },
    });

    const response = await postDeposit(
      new Request('http://localhost/api/deposits', {
        method: 'POST',
        body: JSON.stringify({
          repositoryAnchor: 'bitcode/bitcode',
          repositoryProvider: 'github',
          title: 'asset draft',
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.error).toContain('Reconnect GitHub');
    expect(mockCreateDeposit).not.toHaveBeenCalled();
  });

  it('rejects settlement-bearing writes when saved verified wallet signer posture lacks a live wallet-provider session', async () => {
    installSupabaseReadinessMocks({
      user: { id: 'user-1' },
      githubConnection: { installationId: 123 },
      storedRepositoryInventory: ['bitcode/bitcode'],
      walletConnectionStatus: {
        connected: false,
        provider: 'walletconnect',
        valid: false,
        address: 'bc1qbitcodeoperator',
        verificationState: 'verified',
      },
      profile: {
        id: 'user-1',
        settings: {
          bitcodeProfile: {
            walletBinding: {
              address: 'bc1qbitcodeoperator',
              provider: 'walletconnect',
              status: 'verified',
              boundAt: '2026-04-22T00:00:00.000Z',
            },
          },
        },
      },
    });

    const response = await postDeposit(
      new Request('http://localhost/api/deposits', {
        method: 'POST',
        body: JSON.stringify({
          repositoryAnchor: 'bitcode/bitcode',
          repositoryProvider: 'github',
          title: 'asset draft',
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.error).toContain('live wallet-provider signing session is no longer available');
    expect(mockCreateDeposit).not.toHaveBeenCalled();
  });
});
