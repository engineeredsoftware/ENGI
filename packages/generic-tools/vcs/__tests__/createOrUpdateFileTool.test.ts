/**
 * VCS create/update file and branch tool tests (no Engi file-gate enforcement).
 */

import { createBranchTool, createOrUpdateFileTool } from '../src/index';

jest.mock('@bitcode/supabase/ssr/server', () => ({
  createClient: jest.fn().mockResolvedValue({}),
}));

let mockConnectionManager: any;
let mockProvider: any;

jest.mock('@bitcode/vcs-generics', () => ({
  VCSConnections: jest.fn().mockImplementation(() => mockConnectionManager),
  VCSProviderFactory: {
    create: jest.fn().mockImplementation(async () => mockProvider),
  },
}));

mockConnectionManager = {
  getConnectionById: jest.fn(),
  getConnection: jest.fn(),
  getAuthFromConnection: jest.fn(),
};

mockProvider = {
  createBranch: jest.fn(),
  createOrUpdateFile: jest.fn(),
};

const { VCSConnections, VCSProviderFactory } = require('@bitcode/vcs-generics');

const baseInput = {
  provider: 'github' as const,
  owner: 'bitcode-labs',
  repo: 'repo',
  path: 'src/index.ts',
  content: 'hello',
  message: 'update file',
};

describe('createOrUpdateFileTool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.BITCODE_VCS_ALLOW_ENV_TOKEN_FALLBACK;
    delete process.env.GITHUB_TOKEN;
    (VCSConnections as jest.Mock).mockImplementation(() => mockConnectionManager);
    (VCSProviderFactory.create as jest.Mock).mockResolvedValue(mockProvider);
    mockConnectionManager.getConnectionById.mockResolvedValue({ id: 'conn-1' });
    mockConnectionManager.getConnection.mockResolvedValue({ id: 'conn-1' });
    mockConnectionManager.getAuthFromConnection.mockResolvedValue({ token: 'abc' });
    mockProvider.createBranch.mockResolvedValue({ name: 'feature/asset-pack' });
    mockProvider.createOrUpdateFile.mockResolvedValue({ ok: true });
  });

  it('delegates to provider for create-or-update', async () => {
    await createOrUpdateFileTool.use({ ...baseInput, connectionId: 'conn-1' });

    expect(VCSProviderFactory.create).toHaveBeenCalled();
    expect(mockProvider.createOrUpdateFile).toHaveBeenCalledWith(
      expect.any(Object),
      baseInput.owner,
      baseInput.repo,
      baseInput.path,
      expect.objectContaining({
        content: baseInput.content,
        message: baseInput.message,
      })
    );
  });

  it('creates branches through the VCS provider boundary', async () => {
    await createBranchTool.use({
      provider: 'github',
      owner: 'bitcode-labs',
      repo: 'repo',
      connectionId: 'conn-1',
      branch: 'feature/asset-pack',
      from: 'abc123',
    });

    expect(mockProvider.createBranch).toHaveBeenCalledWith(
      expect.any(Object),
      'bitcode-labs',
      'repo',
      'feature/asset-pack',
      'abc123'
    );
  });

  it('uses explicit environment delivery authority without loading a stored connection', async () => {
    process.env.BITCODE_VCS_ALLOW_ENV_TOKEN_FALLBACK = '1';
    process.env.GITHUB_TOKEN = 'gh-test-token';

    await createBranchTool.use({
      provider: 'github',
      owner: 'bitcode-labs',
      repo: 'repo',
      branch: 'feature/asset-pack',
      from: 'abc123',
    });

    expect(VCSConnections).not.toHaveBeenCalled();
    expect(mockProvider.createBranch).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'github',
        accessToken: 'gh-test-token',
      }),
      'bitcode-labs',
      'repo',
      'feature/asset-pack',
      'abc123'
    );
  });
});
