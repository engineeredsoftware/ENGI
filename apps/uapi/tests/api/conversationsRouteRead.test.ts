/**
 * @jest-environment node
 */

jest.mock('@bitcode/supabase/ssr/server', () => ({ createClient: jest.fn() }));
jest.mock('@bitcode/supabase', () => ({ supabaseAdmin: { from: jest.fn() } }));

let createClientMock: jest.Mock;
let supabaseFromMock: jest.Mock;

describe('/api/conversations GET (non-mock mode)', () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_ENABLE_MOCKS = 'false';
    process.env.NEXT_PUBLIC_MOCK_CHAT_STREAM = 'false';

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
  });

  afterAll(() => {
    process.env = envBackup;
  });

  it('returns enriched activity-history rows with message counts, last message, and attachment counts', async () => {
    const listBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      then: (resolve: (value: unknown) => unknown, reject?: (reason?: unknown) => unknown) =>
        Promise.resolve({
          data: [
            {
              id: 'conv-ledger-1',
              user_id: 'user-1',
              title: 'Read measurement review',
              created_at: '2026-04-20T12:00:00.000Z',
              updated_at: '2026-04-20T13:00:00.000Z',
              messages: [
                {
                  id: 'msg-1',
                  content: 'Initial read posture',
                  created_at: '2026-04-20T12:30:00.000Z',
                  message_attachments: [{ id: 'att-1' }],
                },
                {
                  id: 'msg-2',
                  content: 'Branch artifact aligned for settlement',
                  created_at: '2026-04-20T13:00:00.000Z',
                  message_attachments: [],
                },
              ],
            },
          ],
          error: null,
        }).then(resolve, reject),
    };

    supabaseFromMock.mockImplementation((table: string) => {
      if (table === 'conversations') {
        return listBuilder;
      }
      throw new Error(`Unexpected table: ${table}`);
    });

    const { GET } = await import('@/app/api/conversations/route');
    const response = await GET(
      new Request('https://example.com/api/conversations?limit=25&search=Read', {
        method: 'GET',
      }),
    );

    expect(response.status).toBe(200);
    expect(listBuilder.ilike).toHaveBeenCalledWith('title', '%Read%');

    const body = await response.json();
    expect(body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'conv-ledger-1',
          message_count: 2,
          last_message: 'Branch artifact aligned for settlement',
          attachment_count: 1,
        }),
      ]),
    );
  });
});

describe('/api/conversations/[conversationId] GET (non-mock mode)', () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_ENABLE_MOCKS = 'false';
    process.env.NEXT_PUBLIC_MOCK_CHAT_STREAM = 'false';

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
  });

  afterAll(() => {
    process.env = envBackup;
  });

  it('returns the persisted conversation with messages for Exchange read hydration', async () => {
    const conversationBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: 'conv-ledger-1',
          user_id: 'user-1',
          title: 'Read measurement review',
          created_at: '2026-04-20T12:00:00.000Z',
          updated_at: '2026-04-20T13:00:00.000Z',
        },
        error: null,
      }),
    };
    const messagesBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      then: (resolve: (value: unknown) => unknown, reject?: (reason?: unknown) => unknown) =>
        Promise.resolve({
          data: [
            {
              id: 'msg-1',
              conversation_id: 'conv-ledger-1',
              role: 'user',
              content: 'Measure the current read posture.',
              created_at: '2026-04-20T12:15:00.000Z',
              message_attachments: [],
            },
            {
              id: 'msg-2',
              conversation_id: 'conv-ledger-1',
              role: 'assistant',
              content: 'Read measurement is now aligned with the current Bitcode activity ledger.',
              created_at: '2026-04-20T13:00:00.000Z',
              message_attachments: [
                {
                  id: 'att-run-1',
                  attachment_id: 'run-1',
                  attachment_category: 'pipeline_run',
                  attachment_type: 'pipeline_run',
                  metadata: { pipeline_run_id: 'run-1' },
                },
              ],
            },
          ],
        }).then(resolve, reject),
    };

    supabaseFromMock.mockImplementation((table: string) => {
      switch (table) {
        case 'conversations':
          return conversationBuilder;
        case 'messages':
          return messagesBuilder;
        default:
          throw new Error(`Unexpected table: ${table}`);
      }
    });

    const { GET } = await import('@/app/api/conversations/[conversationId]/route');
    const response = await GET(
      new Request('https://example.com/api/conversations/conv-ledger-1', {
        method: 'GET',
      }),
      {
        params: Promise.resolve({ conversationId: 'conv-ledger-1' }),
      },
    );

    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body).toEqual(
      expect.objectContaining({
        id: 'conv-ledger-1',
        title: 'Read measurement review',
      }),
    );
    expect(body.messages).toHaveLength(2);
    expect(body.messages[1]).toEqual(
      expect.objectContaining({
        role: 'assistant',
        content: 'Read measurement is now aligned with the current Bitcode activity ledger.',
      }),
    );
  });
});
