/**
 * @jest-environment node
 */

jest.mock('@bitcode/supabase/ssr/server', () => ({ createClient: jest.fn() }));
jest.mock('@bitcode/supabase', () => ({ supabaseAdmin: { from: jest.fn() } }));

let createClientMock: jest.Mock;
let supabaseFromMock: jest.Mock;

describe('/api/conversations/branch POST (mock mode)', () => {
  const envBackup = { ...process.env };

  beforeAll(() => {
    process.env.NEXT_PUBLIC_ENABLE_MOCKS = 'true';
    process.env.NEXT_PUBLIC_MOCK_USER_AUXILLARIES = 'true';
    process.env.NEXT_PUBLIC_MOCK_USER_AUXILLARIES_SCENARIO = 'demo';
  });

  afterAll(() => {
    process.env = envBackup;
  });

  it('branches a mock conversation through the FS route binding', async () => {
    const { POST } = await import('@/app/api/conversations/branch/route');

    const request = new Request('https://example.com/api/conversations/branch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceConversationId: 'conv-bitcode-proof-closure',
        title: 'Bitcode proof closure branch',
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.id).toMatch(/^conv-/);
    expect(payload.title).toBe('Bitcode proof closure branch');
    expect(payload.user_id).toBeTruthy();
  });
});

describe('/api/conversations/branch POST (non-mock mode)', () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_ENABLE_MOCKS = 'false';
    process.env.NEXT_PUBLIC_MOCK_USER_AUXILLARIES = 'false';
    process.env.NEXT_PUBLIC_MOCK_USER_AUXILLARIES_SCENARIO = 'false';

    createClientMock = require('@bitcode/supabase/ssr/server').createClient;
    supabaseFromMock = require('@bitcode/supabase').supabaseAdmin.from;

    createClientMock.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user-1', email: 'user@example.com' } },
          error: null,
        }),
      },
    });

    const tables = {
      conversations: [
        {
          id: 'conv-source-1',
          user_id: 'user-1',
          title: 'Read measurement review',
          created_at: '2026-04-24T10:00:00.000Z',
          updated_at: '2026-04-24T10:05:00.000Z',
        },
      ],
      messages: [
        {
          id: 'msg-source-1',
          conversation_id: 'conv-source-1',
          role: 'user',
          content: 'Measure fit for bitcode/terminal.',
          created_at: '2026-04-24T10:01:00.000Z',
        },
        {
          id: 'msg-source-2',
          conversation_id: 'conv-source-1',
          role: 'assistant',
          content: 'AssetPack execution is aligned to settlement.',
          created_at: '2026-04-24T10:02:00.000Z',
        },
      ],
      message_attachments: [
        {
          id: 'att-source-1',
          message_id: 'msg-source-1',
          attachment_id: 'repo-1',
          attachment_category: 'external',
          attachment_type: 'github_repo',
          metadata: {
            token_type: 'source',
            title: 'bitcode/terminal',
          },
          created_at: '2026-04-24T10:01:00.000Z',
        },
        {
          id: 'att-source-2',
          message_id: 'msg-source-2',
          attachment_id: 'run-1',
          attachment_category: 'pipeline_run',
          attachment_type: 'pipeline_run',
          metadata: {
            pipeline_run_id: 'run-1',
          },
          created_at: '2026-04-24T10:02:00.000Z',
        },
      ],
    };

    const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

    supabaseFromMock.mockImplementation((table: keyof typeof tables) => ({
      select: (query?: string) => ({
        eq: (column: string, value: string) => ({
          eq: (column2: string, value2: string) => ({
            single: async () => {
              const row = tables[table].find((candidate: any) => candidate[column] === value && candidate[column2] === value2) || null;
              if (!row) {
                return { data: null, error: { code: 'PGRST116' } };
              }
              return { data: clone(row), error: null };
            },
          }),
          order: (_sortColumn: string, _sortOptions: { ascending: boolean }) => ({
            data: (tables[table] as Array<Record<string, unknown>>)
              .filter((candidate) => candidate[column] === value)
              .sort((left, right) => String(left.created_at || '').localeCompare(String(right.created_at || '')))
              .map((candidate) => {
                if (table !== 'messages' || !String(query || '').includes('message_attachments')) {
                  return clone(candidate);
                }

                return {
                  ...clone(candidate),
                  message_attachments: tables.message_attachments
                    .filter((attachment) => attachment.message_id === candidate.id)
                    .sort((left, right) => String(left.created_at || '').localeCompare(String(right.created_at || '')))
                    .map((attachment) => clone(attachment)),
                };
              }),
            error: null,
          }),
        }),
      }),
      insert: (row: Record<string, unknown> | Array<Record<string, unknown>>) => ({
        select: (_projection?: string) => ({
          single: async () => {
            const rows = Array.isArray(row) ? row : [row];
            const insertedRows = rows.map((entry, index) => {
              const inserted = {
                id: entry.id || `${String(table)}-${tables[table].length + index + 1}`,
                ...entry,
              };
              (tables[table] as Array<Record<string, unknown>>).push(inserted);
              return inserted;
            });

            return { data: clone(insertedRows[0]), error: null };
          },
        }),
        then: async (resolve: (value: unknown) => unknown, reject?: (reason?: unknown) => unknown) => {
          try {
            const rows = Array.isArray(row) ? row : [row];
            rows.forEach((entry, index) => {
              (tables[table] as Array<Record<string, unknown>>).push({
                id: entry.id || `${String(table)}-${tables[table].length + index + 1}`,
                ...entry,
              });
            });

            return Promise.resolve({ data: null, error: null }).then(resolve, reject);
          } catch (error) {
            return Promise.reject(error).catch(reject);
          }
        },
      }),
      update: (_row: Record<string, unknown>) => ({
        eq: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
      }),
    }));
  });

  afterAll(() => {
    process.env = envBackup;
  });

  it('branches persisted conversations with copied attachment continuity evidence', async () => {
    const { POST } = await import('@/app/api/conversations/branch/route');

    const response = await POST(
      new Request('https://example.com/api/conversations/branch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceConversationId: 'conv-source-1',
          title: 'Read measurement review branch',
        }),
      }),
    );

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual(
      expect.objectContaining({
        user_id: 'user-1',
        parent_conversation_id: 'conv-source-1',
        copiedCount: 2,
        copiedAttachmentCount: 2,
      }),
    );
  });
});
