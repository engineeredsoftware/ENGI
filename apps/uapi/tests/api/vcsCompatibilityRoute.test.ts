/**
 * @jest-environment node
 */

describe('/api/vcs support route', () => {
  const envBackup = { ...process.env };

  beforeAll(() => {
    process.env.NEXT_PUBLIC_ENABLE_MOCKS = 'true';
    process.env.NEXT_PUBLIC_MOCK_USER_AUXILLARIES = 'true';
    process.env.NEXT_PUBLIC_MOCK_USER_AUXILLARIES_SCENARIO = 'demo';
  });

  afterAll(() => {
    process.env = envBackup;
  });

  beforeEach(() => {
    jest.resetModules();
  });

  it('returns deterministic mock connections and accounts for retained executions support', async () => {
    const { GET } = await import('@/app/api/vcs/route');

    const connectionsResponse = await GET(
      new Request('https://example.com/api/vcs?resource=connections') as any,
    );
    const connectionsPayload = await connectionsResponse.json();

    expect(connectionsResponse.status).toBe(200);
    expect(connectionsPayload.connections[0]).toMatchObject({
      provider: 'github',
      username: 'bitcode',
    });

    const accountsResponse = await GET(
      new Request('https://example.com/api/vcs?resource=accounts&provider=github') as any,
    );
    const accountsPayload = await accountsResponse.json();

    expect(accountsResponse.status).toBe(200);
    expect(accountsPayload.accounts[0]).toMatchObject({
      id: 424242,
      login: 'bitcode',
      type: 'User',
    });
  });

  it('returns deterministic mock repositories, branches, commits, and issues', async () => {
    const { GET } = await import('@/app/api/vcs/route');

    const repositoriesResponse = await GET(
      new Request(
        'https://example.com/api/vcs?resource=repositories&provider=github&owner=bitcode',
      ) as any,
    );
    const repositoriesPayload = await repositoriesResponse.json();
    expect(repositoriesResponse.status).toBe(200);
    expect(repositoriesPayload.repositories[0].fullName).toBe('bitcode/bitcode');

    const branchesResponse = await GET(
      new Request(
        'https://example.com/api/vcs?resource=branches&provider=github&owner=bitcode&repo=bitcode',
      ) as any,
    );
    const branchesPayload = await branchesResponse.json();
    expect(branchesResponse.status).toBe(200);
    expect(branchesPayload.defaultBranch).toBe('main');
    expect(branchesPayload.branches[0].name).toBe('main');

    const commitsResponse = await GET(
      new Request(
        'https://example.com/api/vcs?resource=commits&provider=github&owner=bitcode&repo=bitcode&branch=main',
      ) as any,
    );
    const commitsPayload = await commitsResponse.json();
    expect(commitsResponse.status).toBe(200);
    expect(commitsPayload.commits[0].sha).toBe('mock-run-branch-remediation');

    const issuesResponse = await GET(
      new Request(
        'https://example.com/api/vcs?resource=issues&provider=github&owner=bitcode&repo=bitcode',
      ) as any,
    );
    const issuesPayload = await issuesResponse.json();
    expect(issuesResponse.status).toBe(200);
    expect(issuesPayload.issues).toHaveLength(2);
    expect(issuesPayload.issues[1].pull_request).toEqual({});
  });
});
