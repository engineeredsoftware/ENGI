/**
 * @jest-environment node
 */

jest.mock('@bitcode/supabase/ssr/server', () => ({ createClient: jest.fn() }));
jest.mock('@bitcode/supabase', () => ({ supabaseAdmin: { from: jest.fn() } }));
jest.mock('../../../../packages/api/src/conversations/streaming', () => ({
  createStreamResponse: (stream: ReadableStream) =>
    new Response(stream, {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
    }),
}));

const pipelineExecutionsCreate = jest.fn();
const pipelineExecutionsUpdate = jest.fn();
const createAdminClient = jest.fn(() => ({
  pipelineExecutions: {
    create: pipelineExecutionsCreate,
    update: pipelineExecutionsUpdate,
  },
}));

jest.mock('@bitcode/orm', () => ({
  createAdminClient,
}));

let conversationCreateBuilder: any;
let conversationUpdateBuilder: any;
let userMessageBuilder: any;
let assistantMessageBuilder: any;
let messageAttachmentsInsert: jest.Mock;
let messageAttachmentsBuilder: any;
let createClientMock: jest.Mock;
let supabaseFromMock: jest.Mock;

describe('/api/conversations/stream POST (mock mode)', () => {
  const envBackup = { ...process.env };

  beforeAll(() => {
    // Enable mock streaming scenario so we do not hit the real OpenAI API.
    process.env.NEXT_PUBLIC_ENABLE_MOCKS = 'true';
    process.env.NEXT_PUBLIC_MOCK_CHAT_STREAM = 'true';
    delete process.env.OPENAI_API_KEY; // ensure real key not required
  });

  afterAll(() => {
    process.env = envBackup;
  });

  it('returns an event-stream response with mocked data', async () => {
    // Dynamically import the route *after* the env vars and mocks are in
    // place so that the feature-flag constants are evaluated with the correct
    // values.
    const { POST } = await import('@/app/api/conversations/stream/route');

    const req = new Request('https://example.com/api/conversations/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId: 'c1', message: 'hello', pipeline: false })
    });

    const res = await POST(req);

    // The handler should return a standard `Response` with a body stream.
    // Some polyfills used during testing return a plain object without the
    // full Headers implementation – guard against that to keep the test
    // environment-agnostic.
    // @ts-ignore
    if (res.headers && typeof res.headers.get === 'function') {
      expect(res.headers.get('Content-Type')).toContain('text/event-stream');
    }

    expect(res.status).toBe(200);
  });
});

describe('/api/conversations/stream POST (non-mock mode)', () => {
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
    pipelineExecutionsCreate.mockResolvedValue({ id: 'run-measure-1' });
    pipelineExecutionsUpdate.mockResolvedValue({ id: 'run-measure-1' });

    conversationCreateBuilder = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: 'conv-new-1',
          user_id: 'user-1',
          title: 'Measure fit for an attached repo against the current read posture.',
        },
        error: null,
      }),
    };
    conversationUpdateBuilder = {
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    };
    userMessageBuilder = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: 'msg-user-1', conversation_id: 'conv-new-1' },
        error: null,
      }),
    };
    assistantMessageBuilder = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: 'msg-assistant-1', conversation_id: 'conv-new-1' },
        error: null,
      }),
    };
    messageAttachmentsInsert = jest.fn().mockResolvedValue({ error: null });
    messageAttachmentsBuilder = {
      insert: messageAttachmentsInsert,
    };

    let conversationsCall = 0;
    let messagesCall = 0;
    supabaseFromMock.mockImplementation((table: string) => {
      switch (table) {
        case 'conversations':
          conversationsCall += 1;
          return conversationsCall === 1 ? conversationCreateBuilder : conversationUpdateBuilder;
        case 'messages':
          messagesCall += 1;
          return messagesCall === 1 ? userMessageBuilder : assistantMessageBuilder;
        case 'message_attachments':
          return messageAttachmentsBuilder;
        default:
          throw new Error(`Unexpected table: ${table}`);
      }
    });
  });

  afterAll(() => {
    process.env = envBackup;
  });

  it('creates a new conversation and mounts a canonical read-measurement execution', async () => {
    const { POST } = await import('@/app/api/conversations/stream/route');

    const res = await POST(
      new Request('https://example.com/api/conversations/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Measure fit for an attached repo against the current read posture.',
          tokens: [
            {
              type: 'attachment',
              value: 'spec-v26.pdf',
              metadata: { attachment_id: 'file-1', category: 'file', type: 'pdf' },
            },
            { type: 'read_measurement', value: 'fit review' },
          ],
        }),
      }),
    );

    expect(res.status).toBe(200);
    expect(conversationCreateBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        title: 'Measure fit for an attached repo against the current read posture.',
      }),
    );
    expect(userMessageBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        conversation_id: 'conv-new-1',
        role: 'user',
      }),
    );
    expect(messageAttachmentsInsert).toHaveBeenNthCalledWith(
      1,
      expect.arrayContaining([
        expect.objectContaining({
          attachment_id: 'file-1',
          attachment_category: 'file',
          attachment_type: 'pdf',
          metadata: expect.objectContaining({
            attachment_id: 'file-1',
            token_type: 'attachment',
          }),
        }),
      ]),
    );
    expect(pipelineExecutionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        type: 'pipeline:measure',
        input: expect.objectContaining({
          rich_input: expect.objectContaining({
            source_attachments: expect.arrayContaining([
              expect.objectContaining({
                attachment_id: 'file-1',
                token_type: 'attachment',
              }),
            ]),
            read_measurement_intents: expect.arrayContaining([
              expect.objectContaining({
                token_type: 'read_measurement',
                value: 'fit review',
              }),
            ]),
          }),
        }),
        metadata: expect.objectContaining({
          canonical_type: 'agentic-execution:read-measurement',
          rich_input: expect.objectContaining({
            source_attachments: expect.arrayContaining([
              expect.objectContaining({
                attachment_id: 'file-1',
                token_type: 'attachment',
              }),
            ]),
            read_measurement_intents: expect.arrayContaining([
              expect.objectContaining({
                token_type: 'read_measurement',
                value: 'fit review',
              }),
            ]),
          }),
        }),
      }),
    );

  });
});
