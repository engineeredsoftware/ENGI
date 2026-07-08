/**
 * @jest-environment node
 */

function buildActivityQueryResult(result: { data: any[]; error: any }) {
  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue(result),
  };
}

describe('/api/activity GET', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('returns combined execution and notification activity in mock mode', async () => {
    jest.doMock('@/config/featureFlags', () => ({
      ENABLE_MOCKS: true,
      MOCK_USER_AUXILLARIES: true,
      MOCK_USER_AUXILLARIES_SCENARIO: 'demo',
    }));

    const { GET } = await import('@/app/api/activity/route');
    const response = await GET(new Request('https://example.com/api/activity?limit=6'));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(Array.isArray(payload.records)).toBe(true);
    expect(payload.records.length).toBeGreaterThan(0);
    expect(payload.summary.transactions).toBe(0);
    expect(payload.summary.executions).toBeGreaterThan(0);
    expect(payload.summary.notifications).toBeGreaterThan(0);
    expect(payload.summary.kinds).toContain('execution');
    expect(payload.summary.kinds).toContain('notification');
  });

  it('returns an empty live activity payload when unauthenticated', async () => {
    jest.doMock('@/config/featureFlags', () => ({
      ENABLE_MOCKS: false,
      MOCK_USER_AUXILLARIES: false,
      MOCK_USER_AUXILLARIES_SCENARIO: 'default',
    }));
    jest.doMock('@bitcode/supabase/ssr/server', () => ({
      createClient: jest.fn().mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: new Error('unauthenticated'),
          }),
        },
      }),
    }));
    jest.doMock('@bitcode/supabase', () => ({
      supabaseAdmin: {
        from: jest.fn(),
      },
    }));

    const { GET } = await import('@/app/api/activity/route');
    const response = await GET(new Request('https://example.com/api/activity'));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      ok: true,
      records: [],
      summary: {
        total: 0,
        kinds: [],
        transactions: 0,
        executions: 0,
        notifications: 0,
        network: 0,
        personal: 0,
      },
    });
  });

  it('returns live activity with persisted execution reread and notification aggregation', async () => {
    const executionRows = [
      {
        id: 'run-proof',
        user_id: 'user-1',
        created_at: '2026-04-22T12:03:00.000Z',
        started_at: '2026-04-22T12:02:00.000Z',
        completed_at: '2026-04-22T12:04:00.000Z',
        status: 'completed',
        type: 'agentic-execution:proof-refresh',
        input: { guide: 'refresh proof families' },
        output: {
          summary: 'Refreshed proof family.',
          asset_pack_completion: {
            summary: 'Refreshed proof family.',
            processingStats: {
              time: '4m 12s',
              tokens: {
                input: 120,
                output: 40,
                total: 160,
              },
              measuredBtd: 24.5,
              btcFeeUsdEquivalent: 1.62,
              averageLatencyMs: 930,
            },
          },
        },
        context: {
          repoSnapshot: {
            org: 'bitcode',
            repo: 'terminal',
            branch: 'main',
            commit: 'abc123',
          },
        },
        items: [],
        error: null,
        total_tokens: null,
        total_cost: null,
        duration_ms: null,
      },
    ];

    const notificationRows = [
      {
        id: 'note-1',
        user_id: 'user-1',
        type: 'settlement.update',
        title: 'Settlement credited',
        message: 'Credited assets were posted to the ledger.',
        data: { creditedAssets: 2 },
        is_read: false,
        created_at: '2026-04-22T12:05:00.000Z',
      },
    ];

    const executionsQuery = buildActivityQueryResult({ data: executionRows, error: null });
    const notificationsQuery = buildActivityQueryResult({ data: notificationRows, error: null });

    jest.doMock('@/config/featureFlags', () => ({
      ENABLE_MOCKS: false,
      MOCK_USER_AUXILLARIES: false,
      MOCK_USER_AUXILLARIES_SCENARIO: 'default',
    }));
    jest.doMock('@bitcode/supabase/ssr/server', () => ({
      createClient: jest.fn().mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-1' } },
            error: null,
          }),
        },
      }),
    }));
    jest.doMock('@bitcode/supabase', () => ({
      supabaseAdmin: {
        from: jest.fn((table: string) => {
          if (table === 'executions') return executionsQuery;
          if (table === 'notifications') return notificationsQuery;
          throw new Error(`Unexpected activity table: ${table}`);
        }),
      },
    }));

    const { GET } = await import('@/app/api/activity/route');
    const response = await GET(new Request('https://example.com/api/activity?limit=2'));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.records.map((record: any) => record.id)).toEqual(['note-1', 'run-proof']);
    expect(payload.records[0]).toEqual(
      expect.objectContaining({
        kind: 'notification',
        scope: 'personal',
        title: 'Settlement credited',
        summary: 'Credited assets were posted to the ledger.',
      }),
    );
    expect(payload.records[1]).toEqual(
      expect.objectContaining({
        kind: 'execution',
        // V48-Gate2-F15 scope taxonomy: only AssetPacks admitted to the
        // Depository and settled/read APs are network-scope; the account's own
        // executions (e.g. proof refreshes) are personal.
        scope: 'personal',
        title: 'Proof execution',
        summary: 'Refreshed proof family.',
        state: 'completed',
        payload: expect.objectContaining({
          summary: 'Refreshed proof family.',
          asset_pack_completion: expect.objectContaining({
            summary: 'Refreshed proof family.',
          }),
          repo_snapshot: expect.objectContaining({
            org: 'bitcode',
            repo: 'terminal',
            branch: 'main',
            commit: 'abc123',
          }),
          processing_stats: expect.objectContaining({
            time: '4m 12s',
            tokens: {
              input: 120,
              output: 40,
              total: 160,
            },
            measuredBtd: 24.5,
            btcFeeUsdEquivalent: 1.62,
            averageLatencyMs: 930,
          }),
        }),
      }),
    );
    expect(payload.summary).toEqual({
      total: 2,
      kinds: ['notification', 'execution'],
      transactions: 0,
      executions: 1,
      notifications: 1,
      network: 0,
      personal: 2,
    });
  });
});
