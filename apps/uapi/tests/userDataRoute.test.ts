import { GET } from '@/app/api/auxillaries/data/route';

jest.mock('@bitcode/supabase/ssr/server', () => ({ createClient: jest.fn() }));
jest.mock('@/app/api/wallet/_shared', () => ({
  readBitcodeWalletConnectionStatus: jest.fn(),
}));
jest.mock('@/app/api/vcs/_shared', () => ({
  buildDisconnectedConnectionStatus: jest.fn((provider: string) => ({
    connected: false,
    provider,
    valid: false,
    tokenPresenceClass: 'missing',
    scopesClass: 'missing',
    lastReadbackStatus: 'not_attempted',
    blocker: `connects.${provider}.connect_provider`,
  })),
  buildStoredConnectionStatus: jest.fn((provider: string, connection: Record<string, unknown>, valid: boolean) => ({
    connected: true,
    provider,
    valid,
    scopes: ['repo', 'contents:write'],
    tokenPresenceClass: 'present_source_safe',
    lastReadbackStatus: valid ? 'succeeded' : 'failed',
    blocker: valid ? null : `connects.${provider}.reauthorize_provider`,
    metadata: connection.connectionData ?? null,
  })),
  getStoredConnection: jest.fn(),
  listBitcodeRepositoriesForConnection: jest.fn(),
  validateStoredConnection: jest.fn(),
}));

import { createClient } from '@bitcode/supabase/ssr/server';
import { readBitcodeWalletConnectionStatus } from '@/app/api/wallet/_shared';
import {
  buildStoredConnectionStatus,
  getStoredConnection,
  listBitcodeRepositoriesForConnection,
  validateStoredConnection,
} from '@/app/api/vcs/_shared';

describe('GET /api/auxillaries/data', () => {
  const mockUser = { id: 'user-1' };
  const mockGetUser = jest.fn();

  let mockFrom: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFrom = jest.fn();
    (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser }, from: mockFrom });
    (readBitcodeWalletConnectionStatus as jest.Mock).mockResolvedValue(null);
  });

  it('returns anonymous auxillary data if unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'no auth' } });
    const req = new Request('http://localhost/api/auxillaries/data');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(expect.objectContaining({
      profile: null,
      githubConnection: null,
      walletConnectionStatus: null,
      repositoryConnectionStatus: null,
      repositories: [],
      organizations: [],
      repositoryInventorySource: null,
      btdBalance: 0,
      btcFeeBalance: null,
      recentBtdAssetPacks: [],
      modelPreferences: null,
      templatePreferences: null,
      notificationPosture: expect.objectContaining({
        state: 'contact_missing',
        unreadCount: 0,
      }),
      dataSharingPosture: expect.objectContaining({
        state: 'not_configured',
        repositoryCount: 0,
      }),
      onboardedPanes: [],
      onboarded_steps: [],
      isOnboardingComplete: false,
      auxillariesContract: expect.objectContaining({
        kind: 'auxillaries_contract_snapshot',
        profileState: expect.objectContaining({ accountReadiness: 'blocked' }),
      }),
      connectionReadiness: [
        expect.objectContaining({
          provider: 'github',
          tokenPresenceClass: 'missing',
          scopesClass: 'missing',
          lastReadbackStatus: 'not_attempted',
        }),
      ],
      readinessDiagnostics: expect.any(Array),
      telemetryProofHooks: expect.arrayContaining([
        expect.objectContaining({
          kind: 'AuxillariesTelemetryProofHook',
          subject: 'profile',
          sourceSafetyClass: 'source_safe',
        }),
      ]),
    }));
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('returns user data with only GitHub connection', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    // Mock profile
    const profileData = {
      id: 'user-1',
      username: 'test',
      onboarded_steps: '["profile","interfaces","wallet"]',
      settings: {
        bitcodeProfile: {
          companyName: 'Bitcode Labs',
          teamMembers: [{ id: 'tm-1', displayName: 'Lin Ortega', role: 'admin' }],
          email: 'test@example.com',
          isVerified: true,
          walletBinding: {
            address: 'bc1qbitcodeoperator',
            provider: 'manual',
            status: 'manual',
            boundAt: '2026-04-22T00:00:00.000Z',
          },
        },
      },
    };
    const profileBuilder: any = {
      select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), maybeSingle: jest.fn().mockResolvedValue({ data: profileData, error: null })
    };
    // Mock GitHub connection row
    const connectionData = { installationId: 123 };
    const connectionBuilder: any = {
      select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), maybeSingle: jest.fn().mockResolvedValue({ data: { connection_data: connectionData }, error: null })
    };
    // Mock BTD balance
    const btdData = { balance: 50 };
    const btdBuilder: any = {
      select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), maybeSingle: jest.fn().mockResolvedValue({ data: btdData, error: null })
    };
    // Mock model preferences
    const prefData = { preferences: { model: 'gpt' } };
    const prefBuilder: any = {
      select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: prefData, error: null })
    };
    const templatePrefData = {
      deliverable_templates: { asset_pack_pr: { label: 'AssetPack PR' } },
      ai_document_templates: { witness_summary: { label: 'Witness summary' } },
      auto_save_templates: true,
    };
    const templatePrefBuilder: any = {
      select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), maybeSingle: jest.fn().mockResolvedValue({ data: templatePrefData, error: null })
    };
    const notificationsBuilder: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({
        data: [
          {
            id: 'notification-1',
            type: 'profile',
            is_read: false,
            created_at: '2026-05-21T00:00:00.000Z',
          },
        ],
        error: null,
      }),
    };
    (getStoredConnection as jest.Mock).mockResolvedValue({
      manager: { id: 'manager' },
      connection: { id: 'connection-1', connectionData: connectionData },
    });
    (readBitcodeWalletConnectionStatus as jest.Mock).mockResolvedValue({
      connected: false,
      provider: 'manual',
      valid: false,
      address: 'bc1qbitcodeoperator',
      verificationState: 'manual',
    });
    (validateStoredConnection as jest.Mock).mockResolvedValue(true);
    (listBitcodeRepositoriesForConnection as jest.Mock).mockResolvedValue({
      repositories: [
        {
          id: 'repo-1',
          name: 'bitcode',
          fullName: 'bitcode/bitcode',
          defaultBranch: 'main',
          owner: {
            username: 'bitcode',
            type: 'organization',
          },
        },
      ],
      inventorySource: 'stored_repository_inventory',
    });
    // Route multiplexing by table
    mockFrom.mockImplementation((table: string) => {
      if (table === 'user_profiles') return profileBuilder;
      if (table === 'user_connections') return connectionBuilder;
      if (table === 'user_credits') return btdBuilder;
      if (table === 'user_model_preferences') return prefBuilder;
      if (table === 'user_template_preferences') return templatePrefBuilder;
      if (table === 'notifications') return notificationsBuilder;
      throw new Error('Unexpected table ' + table);
    });
    const req = new Request('http://localhost/api/auxillaries/data');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(expect.objectContaining({
      profile: expect.objectContaining({
        id: 'user-1',
        username: 'test',
        company_name: 'Bitcode Labs',
        team_members: [{ id: 'tm-1', displayName: 'Lin Ortega', role: 'admin' }],
        email: 'test@example.com',
        is_verified: true,
        wallet_address: 'bc1qbitcodeoperator',
        wallet_provider: 'manual',
        wallet_binding_status: 'manual',
      }),
      githubConnection: connectionData,
      walletConnectionStatus: expect.objectContaining({
        connected: false,
        provider: 'manual',
        valid: false,
      }),
      repositoryConnectionStatus: expect.objectContaining({
        connected: true,
        provider: 'github',
        valid: true,
      }),
      repositories: [
        expect.objectContaining({
          id: 'repo-1',
          fullName: 'bitcode/bitcode',
          defaultBranch: 'main',
        }),
      ],
      organizations: ['bitcode'],
      repositoryInventorySource: 'stored_repository_inventory',
      btdBalance: 50,
      btcFeeBalance: null,
      recentBtdAssetPacks: [],
      modelPreferences: prefData.preferences,
      templatePreferences: {
        shippable_templates: templatePrefData.deliverable_templates,
        evidence_document_templates: templatePrefData.ai_document_templates,
        auto_save_templates: true,
      },
      notificationPosture: expect.objectContaining({
        state: 'attention_needed',
        unreadCount: 1,
      }),
      dataSharingPosture: expect.objectContaining({
        state: 'configured',
        repositoryCount: 1,
        enabledRepositoryCount: 1,
      }),
      onboardedPanes: ['profile', 'interfaces', 'wallet'],
      onboarded_steps: ['profile', 'interfaces', 'wallet'],
      isOnboardingComplete: false,
      auxillariesContract: expect.objectContaining({
        kind: 'auxillaries_contract_snapshot',
        profileState: expect.objectContaining({
          username: 'test',
          accountReadiness: 'degraded',
          preferences: expect.objectContaining({
            templates: expect.objectContaining({
              shippableTemplateCount: 1,
              evidenceDocumentTemplateCount: 1,
            }),
          }),
        }),
        connectionReadiness: [
          expect.objectContaining({
            providerId: 'github',
            providerName: 'GitHub',
            provider: 'github',
            connected: true,
            valid: true,
            tokenPresenceClass: 'present_source_safe',
            scopesClass: 'repo_read_write',
            lastReadbackStatus: 'succeeded',
            blocker: null,
          }),
        ],
        telemetryProofHooks: expect.arrayContaining([
          expect.objectContaining({
            kind: 'AuxillariesTelemetryProofHook',
            subject: 'provider_connection',
            sourceSafetyClass: 'source_safe',
          }),
        ]),
      }),
      telemetryProofHooks: expect.arrayContaining([
        expect.objectContaining({
          subject: 'provider_connection',
          theoremId: 'auxillaries.provider_connection.source_safe_readback',
          replayStepId: 'provider-connection-github',
        }),
      ]),
      walletBtdPaneState: expect.objectContaining({
        walletCapability: expect.objectContaining({
          address: 'bc1qbitcodeoperator',
        }),
      }),
    }));
    // Ensure queries were scoped correctly
    expect(profileBuilder.eq).toHaveBeenCalledWith('id', 'user-1');
    expect(connectionBuilder.eq).toHaveBeenCalledWith('provider', 'github');
    expect(readBitcodeWalletConnectionStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
      }),
    );
    expect(getStoredConnection).toHaveBeenCalledWith(
      expect.anything(),
      'user-1',
      'github',
    );
    expect(validateStoredConnection).toHaveBeenCalledWith(
      { id: 'manager' },
      'github',
      { id: 'connection-1', connectionData: connectionData },
    );
    expect(buildStoredConnectionStatus).toHaveBeenCalledWith(
      'github',
      { id: 'connection-1', connectionData: connectionData },
      true,
    );
    expect(listBitcodeRepositoriesForConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        provider: 'github',
      }),
    );
  });
});
