import { createBranchTool, createOrUpdateFileTool } from '../src/index';

jest.mock('@bitcode/generic-tools-editing/execution-context', () => ({
  executionContext: {
    getStore: jest.fn(),
  },
}));

jest.mock('@bitcode/pipelines-generics/src/gate-system/file-gates', () => ({
  validateFileOperation: jest.fn(),
}));

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

const { executionContext } = require('@bitcode/generic-tools-editing/execution-context');
const { validateFileOperation } = require('@bitcode/pipelines-generics/src/gate-system/file-gates');
const { VCSConnections, VCSProviderFactory } = require('@bitcode/vcs-generics');

const baseInput = {
  provider: 'github' as const,
  owner: 'bitcode-labs',
  repo: 'repo',
  path: 'src/index.ts',
  content: 'hello',
  message: 'update file',
};

describe('createOrUpdateFileTool gating', () => {
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
    (executionContext.getStore as jest.Mock).mockReturnValue({
      get: (namespace: string, key: string) => {
        if (namespace === 'gate' && key === 'current') return 'Design';
        if (namespace === 'meta' && key === 'phase') return 'Design';
        return undefined;
      },
      store: jest.fn(),
    });
  });

  it('throws gate violation when file operation not allowed', async () => {
    (validateFileOperation as jest.Mock).mockReturnValue({
      allowed: false,
      reason: 'Design phase can only modify .docs/PRODUCT.md',
    });

    await expect(
      createOrUpdateFileTool.use({ ...baseInput })
    ).rejects.toThrow('Design phase can only modify .docs/PRODUCT.md');

    expect(VCSConnections).not.toHaveBeenCalled();
    expect(VCSProviderFactory.create).not.toHaveBeenCalled();
  });

  it('delegates to provider when gate allows operation', async () => {
    (validateFileOperation as jest.Mock).mockReturnValue({ allowed: true });

    await createOrUpdateFileTool.use({ ...baseInput, connectionId: 'conn-1' });

    expect(validateFileOperation).toHaveBeenCalledWith('write', baseInput.path, 'Design');
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

  it('skips gate check when no execution context', async () => {
    (executionContext.getStore as jest.Mock).mockReturnValue(undefined);
    (validateFileOperation as jest.Mock).mockReturnValue({ allowed: true });

    await createOrUpdateFileTool.use({ ...baseInput, connectionId: 'conn-1' });

    // Without context, we still proceed to provider
    expect(VCSProviderFactory.create).toHaveBeenCalled();
    expect(mockProvider.createOrUpdateFile).toHaveBeenCalled();
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
