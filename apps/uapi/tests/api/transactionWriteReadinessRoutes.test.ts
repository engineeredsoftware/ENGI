/**
 * @jest-environment node
 *
 * Settlement readiness gate unit tests. Formerly exercised through deleted
 * protocol-demo host shims (/api/deposits, /api/make-bitcode-branch); those
 * routes are gone. Product deposit/read APIs use their own write surfaces.
 */

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

import { createClient } from '@bitcode/supabase/ssr/server';
import { requireBitcodeSignedTransactionReadiness } from '@/components/bitcode/pipeline/models/transaction-route-readiness';

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
}

async function expectReadinessRejection(
  body: Record<string, unknown>,
  expected: { statusCode: number; messageIncludes: string },
) {
  try {
    await requireBitcodeSignedTransactionReadiness(body, { requiresRepositoryAnchor: true });
    throw new Error('expected requireBitcodeSignedTransactionReadiness to reject');
  } catch (error) {
    const resolved = error as Error & { statusCode?: number };
    expect(resolved.statusCode).toBe(expected.statusCode);
    expect(resolved.message).toContain(expected.messageIncludes);
  }
}

describe('requireBitcodeSignedTransactionReadiness', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockValidateToken.mockResolvedValue(true);
    mockListRepositories.mockResolvedValue([]);
    mockReadBitcodeWalletConnectionStatus.mockResolvedValue(null);
  });

  it('rejects when the operator is unauthenticated', async () => {
    installSupabaseReadinessMocks({
      user: null,
      userError: { message: 'no auth' },
    });

    await expectReadinessRejection(
      { repositoryAnchor: 'bitcode/bitcode', title: 'asset draft' },
      { statusCode: 401, messageIncludes: 'review-only mode' },
    );
  });

  it('rejects while wallet verification remains staged', async () => {
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

    await expectReadinessRejection(
      { repositoryAnchor: 'bitcode/bitcode', title: 'asset draft' },
      { statusCode: 409, messageIncludes: 'signed settlement remains staged' },
    );
  });

  it('accepts provider-backed pending wallet signatures during V28 staging', async () => {
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

    const result = await requireBitcodeSignedTransactionReadiness(
      { repositoryAnchor: 'bitcode/bitcode', title: 'asset draft' },
      { requiresRepositoryAnchor: true },
    );

    expect(result.userId).toBe('user-1');
    expect(result.repositoryProvider).toBe('github');
    expect(result.repositoryAnchor).toBe('bitcode/bitcode');
  });

  it('rejects when the repository anchor is missing', async () => {
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

    await expectReadinessRejection(
      { scenarioId: 'read-1', branchMode: 'patch', principal: 'reviewer' },
      { statusCode: 409, messageIncludes: 'Select a repository anchor' },
    );
  });

  it('accepts once verified signing and repository scope are present', async () => {
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

    const result = await requireBitcodeSignedTransactionReadiness(
      {
        repositoryAnchor: 'bitcode/bitcode',
        sourceRepo: 'bitcode/bitcode',
        title: 'asset draft',
      },
      { requiresRepositoryAnchor: true },
    );

    expect(result.repositoryAnchor).toBe('bitcode/bitcode');
    expect(result.repositoryProvider).toBe('github');
  });

  it('rejects when the requested repository anchor is outside the connected provider inventory', async () => {
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

    await expectReadinessRejection(
      {
        repositoryAnchor: 'bitcode/not-admitted',
        repositoryProvider: 'github',
        title: 'asset draft',
      },
      { statusCode: 409, messageIncludes: 'not present in the connected GitHub repository inventory' },
    );
  });

  it('rejects when the saved repository provider session is no longer valid', async () => {
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

    await expectReadinessRejection(
      {
        repositoryAnchor: 'bitcode/bitcode',
        repositoryProvider: 'github',
        title: 'asset draft',
      },
      { statusCode: 409, messageIncludes: 'Reconnect GitHub' },
    );
  });

  it('rejects when saved verified wallet signer posture lacks a live wallet-provider session', async () => {
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

    await expectReadinessRejection(
      {
        repositoryAnchor: 'bitcode/bitcode',
        repositoryProvider: 'github',
        title: 'asset draft',
      },
      { statusCode: 409, messageIncludes: 'live wallet-provider signing session is no longer available' },
    );
  });
});
