/**
 * POST /api/executions/[runId]/cancel — cooperative cancel for user-owned runs.
 */
import { POST } from '@/app/api/executions/[runId]/cancel/route';

const mockGetUser = jest.fn();
const mockFrom = jest.fn();

jest.mock('@bitcode/supabase/ssr/server', () => ({
  createClient: async () => ({
    auth: { getUser: mockGetUser },
  }),
}));

jest.mock('@bitcode/supabase', () => ({
  supabaseAdmin: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

jest.mock('@bitcode/pipeline-hosts', () => ({
  loadVercelSandboxFactory: jest.fn(async () => ({
    create: jest.fn(),
    get: jest.fn(),
  })),
}));

function chain(result: { data?: unknown; error?: unknown }) {
  const builder: any = {
    select: () => builder,
    eq: () => builder,
    maybeSingle: async () => result,
    update: () => builder,
    insert: async () => ({ error: null }),
  };
  // update().eq().eq() resolves via maybeSingle not needed — make thenable
  builder.then = (resolve: (v: unknown) => void) =>
    Promise.resolve(result).then(resolve);
  return builder;
}

describe('POST /api/executions/[runId]/cancel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const response = await POST(
      new Request('http://localhost/api/executions/run-1/cancel', {
        method: 'POST',
      }),
      { params: { runId: 'run-1' } },
    );
    expect(response.status).toBe(401);
  });

  it('cancels a running owned execution', async () => {
    let selectCall = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'executions') {
        selectCall += 1;
        if (selectCall === 1) {
          return chain({
            data: {
              id: 'run-1',
              user_id: 'user-1',
              status: 'running',
              context: { source: 'deposit-option-synthesis' },
            },
            error: null,
          });
        }
        // update chain
        const builder: any = {
          update: () => builder,
          eq: () => builder,
        };
        builder.then = (resolve: (v: unknown) => void) =>
          Promise.resolve({ error: null }).then(resolve);
        return builder;
      }
      if (table === 'execution_events') {
        return {
          insert: async () => ({ error: null }),
        };
      }
      return chain({ data: null, error: null });
    });

    const response = await POST(
      new Request('http://localhost/api/executions/run-1/cancel', {
        method: 'POST',
        body: JSON.stringify({ reason: 'Stop this run.' }),
      }),
      { params: { runId: 'run-1' } },
    );
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toMatchObject({
      ok: true,
      runId: 'run-1',
      status: 'cancelled',
    });
  });

  it('returns 404 when the run is not owned', async () => {
    mockFrom.mockImplementation(() =>
      chain({
        data: {
          id: 'run-1',
          user_id: 'other-user',
          status: 'running',
          context: {},
        },
        error: null,
      }),
    );
    const response = await POST(
      new Request('http://localhost/api/executions/run-1/cancel', {
        method: 'POST',
      }),
      { params: { runId: 'run-1' } },
    );
    expect(response.status).toBe(404);
  });

  it('returns 409 when the run is already completed', async () => {
    mockFrom.mockImplementation(() =>
      chain({
        data: {
          id: 'run-1',
          user_id: 'user-1',
          status: 'completed',
          context: {},
        },
        error: null,
      }),
    );
    const response = await POST(
      new Request('http://localhost/api/executions/run-1/cancel', {
        method: 'POST',
      }),
      { params: { runId: 'run-1' } },
    );
    expect(response.status).toBe(409);
    const payload = await response.json();
    expect(payload.code).toBe('not_running');
  });
});
