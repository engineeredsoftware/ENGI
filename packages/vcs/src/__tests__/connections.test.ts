/**
 * V48-Gate3-F33: getAuthFromConnection's GitHub App installation-token
 * regeneration reads `installation_token_expires_at` to decide whether the
 * stored token is stale, but its own updateTokens() call used to persist the
 * fresh expiry ONLY to `token_expires_at` — a different field, never read by
 * that same expiry check. So every regeneration "succeeded" yet the field
 * gate on kept reporting stale, forcing a full re-regeneration on literally
 * every subsequent call (Refresh, repo/branch/commit fetches, etc.) forever.
 * Pin that both fields move together.
 */

const mockGetById = jest.fn();
const mockUpdate = jest.fn();

jest.mock('@bitcode/orm', () => ({
  UserConnectionsModel: jest.fn().mockImplementation(() => ({
    getById: mockGetById,
    update: mockUpdate,
    getByUserAndProvider: jest.fn(),
    listByUserId: jest.fn(),
    getByProviderUserId: jest.fn(),
    getAuthFromConnectionByInstallationId: jest.fn(),
  })),
}));

const mockGenerateInstallationToken = jest.fn();

jest.mock('@bitcode/github', () => ({
  GitHubAppAuth: jest.fn().mockImplementation(() => ({
    generateInstallationToken: mockGenerateInstallationToken,
  })),
}));

import { VCSConnections } from '../connections';

const CONNECTION_ID = '11111111-1111-1111-1111-111111111111';
const FAR_FUTURE_ISO = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 5).toISOString();
const FAR_PAST_ISO = new Date(Date.now() - 1000 * 60 * 60 * 24 * 365 * 5).toISOString();

describe('VCSConnections.getAuthFromConnection — GitHub installation token regeneration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GITHUB_APP_ID = '12345';
    process.env.GITHUB_PRIVATE_KEY = 'test-private-key';
  });

  afterEach(() => {
    delete process.env.GITHUB_APP_ID;
    delete process.env.GITHUB_PRIVATE_KEY;
  });

  it('regenerates an expired installation token and persists both expiry fields in lockstep', async () => {
    mockGetById.mockResolvedValue({
      id: CONNECTION_ID,
      provider: 'github',
      connection_data: {
        connectionId: '99999',
        access_token: 'stale-token',
        installation_token_expires_at: FAR_PAST_ISO,
      },
    });
    mockGenerateInstallationToken.mockResolvedValue({
      token: 'fresh-token',
      expiresAt: new Date(FAR_FUTURE_ISO),
    });

    const connections = new VCSConnections({} as never);
    const auth = await connections.getAuthFromConnection(CONNECTION_ID);

    expect(auth?.accessToken).toBe('fresh-token');
    expect(mockUpdate).toHaveBeenCalledWith(
      CONNECTION_ID,
      expect.objectContaining({
        connection_data: expect.objectContaining({
          access_token: 'fresh-token',
          token_expires_at: FAR_FUTURE_ISO,
          installation_token_expires_at: FAR_FUTURE_ISO,
        }),
      }),
    );
  });

  it('does not re-attempt regeneration once installation_token_expires_at reflects the fresh token', async () => {
    mockGetById.mockResolvedValue({
      id: CONNECTION_ID,
      provider: 'github',
      connection_data: {
        connectionId: '99999',
        access_token: 'already-fresh-token',
        installation_token_expires_at: FAR_FUTURE_ISO,
      },
    });

    const connections = new VCSConnections({} as never);
    const auth = await connections.getAuthFromConnection(CONNECTION_ID);

    expect(auth?.accessToken).toBe('already-fresh-token');
    expect(mockGenerateInstallationToken).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
