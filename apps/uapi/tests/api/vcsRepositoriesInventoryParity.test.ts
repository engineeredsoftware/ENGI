/**
 * @jest-environment node
 */

jest.mock('@bitcode/supabase/ssr/server', () => ({ createClient: jest.fn() }));

const mockGetConnection = jest.fn();
const mockGetAuthFromConnection = jest.fn();
const mockCreateProviderFromEnvironment = jest.fn();

jest.mock('@bitcode/vcs-generics', () => ({
  VCSConnections: jest.fn().mockImplementation(() => ({
    getConnection: mockGetConnection,
    getAuthFromConnection: mockGetAuthFromConnection,
  })),
  VCSProviderFactory: {
    createFromEnvironment: mockCreateProviderFromEnvironment,
  },
}));

import { createClient } from '@bitcode/supabase/ssr/server';

type MockSupabaseBuilder = {
  select: jest.Mock;
  eq: jest.Mock;
  order: jest.Mock;
  upsert: jest.Mock;
};

function createVcsRepositoriesBuilder(rows: unknown[]) {
  const builder = {
    select: jest.fn(),
    eq: jest.fn(),
    order: jest.fn(),
    upsert: jest.fn(),
  } as MockSupabaseBuilder;

  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.order.mockResolvedValue({ data: rows, error: null });
  builder.upsert.mockResolvedValue({ data: [], error: null });
  return builder;
}

function installSupabaseRouteMocks(rows: unknown[]) {
  const repositoriesBuilder = createVcsRepositoriesBuilder(rows);
  const from = jest.fn((table: string) => {
    if (table === 'vcs_repositories') {
      return repositoriesBuilder;
    }
    throw new Error(`Unexpected table ${table}`);
  });

  (createClient as jest.Mock).mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      }),
    },
    from,
  });

  return { from, repositoriesBuilder };
}

describe('/api/vcs/[provider]/repositories route inventory parity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('prefers stored repository inventory and skips live provider reads', async () => {
    installSupabaseRouteMocks([
      {
        provider_repo_id: 'repo-1',
        repo_name: 'bitcode',
        repo_full_name: 'bitcode/bitcode',
        repo_owner: 'bitcode',
        repo_description: 'Stored Bitcode repository',
        repo_url: 'https://github.com/bitcode/bitcode',
        repo_language: 'TypeScript',
        repo_default_branch: 'main',
        repo_private: true,
        repo_created_at: '2026-04-16T12:00:00.000Z',
        repo_updated_at: '2026-04-16T12:00:00.000Z',
        repo_data: {
          id: 'repo-1',
          fullName: 'bitcode/bitcode',
          name: 'bitcode',
          cloneUrl: 'https://github.com/bitcode/bitcode.git',
          owner: {
            id: 'bitcode',
            username: 'bitcode',
            type: 'organization',
          },
          topics: ['bitcode', 'terminal'],
        },
      },
    ]);
    mockGetConnection.mockResolvedValue({
      id: 'connection-1',
      connectionData: { instance_url: 'https://github.example' },
    });

    const { GET } = await import('@/app/api/vcs/[provider]/repositories/route');
    const response = await GET(
      new Request('https://example.com/api/vcs/github/repositories'),
      { params: { provider: 'github' } } as any,
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.inventorySource).toBe('stored_repository_inventory');
    expect(payload.repositories).toHaveLength(1);
    expect(payload.repositories[0]).toMatchObject({
      fullName: 'bitcode/bitcode',
      defaultBranch: 'main',
      private: true,
    });
    expect(mockGetAuthFromConnection).not.toHaveBeenCalled();
    expect(mockCreateProviderFromEnvironment).not.toHaveBeenCalled();
  });

  it('falls back to the live provider inventory and persists it when stored rows are absent', async () => {
    const { repositoriesBuilder } = installSupabaseRouteMocks([]);
    mockGetConnection.mockResolvedValue({
      id: 'connection-1',
      connectionData: { instance_url: 'https://github.example' },
    });
    mockGetAuthFromConnection.mockResolvedValue({ accessToken: 'token-1' });
    const mockListRepositories = jest.fn().mockResolvedValue([
      {
        id: 'repo-2',
        name: 'bitcode-core',
        fullName: 'bitcode/bitcode-core',
        description: 'Live repository inventory',
        private: true,
        defaultBranch: 'main',
        url: 'https://github.com/bitcode/bitcode-core',
        cloneUrl: 'https://github.com/bitcode/bitcode-core.git',
        owner: {
          id: 'bitcode',
          username: 'bitcode',
          type: 'organization',
        },
      },
    ]);
    mockCreateProviderFromEnvironment.mockResolvedValue({
      listRepositories: mockListRepositories,
    });

    const { GET } = await import('@/app/api/vcs/[provider]/repositories/route');
    const response = await GET(
      new Request('https://example.com/api/vcs/github/repositories'),
      { params: { provider: 'github' } } as any,
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.inventorySource).toBe('live_provider_inventory');
    expect(payload.repositories).toHaveLength(1);
    expect(payload.repositories[0]).toMatchObject({
      fullName: 'bitcode/bitcode-core',
    });
    expect(mockGetAuthFromConnection).toHaveBeenCalledWith('connection-1');
    expect(mockCreateProviderFromEnvironment).toHaveBeenCalledWith(
      'github',
      'https://github.example',
    );
    expect(mockListRepositories).toHaveBeenCalledWith(
      { accessToken: 'token-1' },
      expect.objectContaining({ perPage: 100, type: 'all' }),
    );
    expect(repositoriesBuilder.upsert).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          user_id: 'user-1',
          provider: 'github',
          provider_repo_id: 'repo-2',
          repo_name: 'bitcode-core',
          repo_full_name: 'bitcode/bitcode-core',
          repo_owner: 'bitcode',
          repo_default_branch: 'main',
          repo_private: true,
          repo_url: 'https://github.com/bitcode/bitcode-core',
        }),
      ],
      { onConflict: 'user_id,provider,provider_repo_id' },
    );
  });
});
