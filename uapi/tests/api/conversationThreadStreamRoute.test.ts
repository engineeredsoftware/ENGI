/**
 * @jest-environment node
 */

jest.mock('@bitcode/supabase/ssr/server', () => ({ createClient: jest.fn() }));
jest.mock('@bitcode/supabase', () => ({ supabaseAdmin: { from: jest.fn() } }));
jest.mock('../../../packages/api/src/conversations/streaming', () => ({
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

let conversationLookupBuilder: any;
let conversationUpdateBuilder: any;
let userMessageBuilder: any;
let assistantMessageBuilder: any;
let messageAttachmentsBuilder: any;
let messageAttachmentsInsert: jest.Mock;
let createClientMock: jest.Mock;
let supabaseFromMock: jest.Mock;

describe('/api/conversations/[conversationId]/stream POST (mock mode)', () => {
  const envBackup = { ...process.env };

  beforeAll(() => {
    process.env.NEXT_PUBLIC_ENABLE_MOCKS = 'true';
    process.env.NEXT_PUBLIC_MOCK_CHAT_STREAM = 'true';
  });

  afterAll(() => {
    process.env = envBackup;
  });

  it('returns an event-stream response with mocked data for a specific conversation', async () => {
    const { POST } = await import('@/app/api/conversations/[conversationId]/stream/route');

    const request = new Request('https://example.com/api/conversations/conv-bitcode-proof-closure/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'hello thread', pipeline: false }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ conversationId: 'conv-bitcode-proof-closure' }),
    });

    // @ts-ignore test polyfill compatibility
    if (response.headers && typeof response.headers.get === 'function') {
      expect(response.headers.get('Content-Type')).toContain('text/event-stream');
    }

    expect(response.status).toBe(200);
  });
});

describe('/api/conversations/[conversationId]/stream POST (non-mock mode)', () => {
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
    pipelineExecutionsCreate.mockResolvedValue({ id: 'run-bitcode-1' });
    pipelineExecutionsUpdate.mockResolvedValue({ id: 'run-bitcode-1' });

    conversationLookupBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: 'conv-bitcode-proof-closure',
          user_id: 'user-1',
          title: 'Bitcode Terminal conversation',
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
        data: { id: 'msg-user-1', conversation_id: 'conv-bitcode-proof-closure' },
        error: null,
      }),
    };
    assistantMessageBuilder = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: 'msg-assistant-1', conversation_id: 'conv-bitcode-proof-closure' },
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
          return conversationsCall === 1 ? conversationLookupBuilder : conversationUpdateBuilder;
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

  it('streams a persisted thread write with attachments and a canonical execution run', async () => {
    const { POST } = await import('@/app/api/conversations/[conversationId]/stream/route');

    const response = await POST(
      new Request('https://example.com/api/conversations/conv-bitcode-proof-closure/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Synthesize a branch artifact for this repo and route it to settlement.',
          tokens: [
            {
              type: 'source',
              value: 'bitcode-labs/terminal',
              metadata: { attachment_id: 'repo-1', category: 'external', type: 'github_repo' },
            },
            {
              type: 'destination',
              value: 'settlement-ledger',
              metadata: { attachment_id: 'dest-1', category: 'external', type: 'settlement_target' },
            },
            { type: 'asset_pack', value: 'branch artifact' },
          ],
        }),
      }),
      {
        params: Promise.resolve({ conversationId: 'conv-bitcode-proof-closure' }),
      },
    );

    expect(response.status).toBe(200);
    expect(conversationLookupBuilder.single).toHaveBeenCalled();
    expect(userMessageBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        conversation_id: 'conv-bitcode-proof-closure',
        role: 'user',
        content: 'Synthesize a branch artifact for this repo and route it to settlement.',
      }),
    );
    expect(messageAttachmentsInsert).toHaveBeenNthCalledWith(
      1,
      expect.arrayContaining([
        expect.objectContaining({
          attachment_id: 'repo-1',
          attachment_category: 'external',
          attachment_type: 'github_repo',
          metadata: expect.objectContaining({
            attachment_id: 'repo-1',
            token_type: 'source',
          }),
        }),
        expect.objectContaining({
          attachment_id: 'dest-1',
          attachment_category: 'external',
          attachment_type: 'settlement_target',
          metadata: expect.objectContaining({
            attachment_id: 'dest-1',
            token_type: 'destination',
          }),
        }),
      ]),
    );
    expect(pipelineExecutionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        type: 'agentic-execution:asset-pack',
        input: expect.objectContaining({
          rich_input: expect.objectContaining({
            source_attachments: expect.arrayContaining([
              expect.objectContaining({
                attachment_id: 'repo-1',
                token_type: 'source',
              }),
            ]),
            output_destinations: expect.arrayContaining([
              expect.objectContaining({
                attachment_id: 'dest-1',
                token_type: 'destination',
              }),
            ]),
            asset_pack_references: expect.arrayContaining([
              expect.objectContaining({
                token_type: 'asset_pack',
                value: 'branch artifact',
              }),
            ]),
          }),
        }),
        metadata: expect.objectContaining({
          canonical_type: 'agentic-execution:asset-pack',
          entrypoint: 'conversations',
          rich_input: expect.objectContaining({
            source_attachments: expect.arrayContaining([
              expect.objectContaining({
                attachment_id: 'repo-1',
                token_type: 'source',
              }),
            ]),
            output_destinations: expect.arrayContaining([
              expect.objectContaining({
                attachment_id: 'dest-1',
                token_type: 'destination',
              }),
            ]),
            asset_pack_references: expect.arrayContaining([
              expect.objectContaining({
                token_type: 'asset_pack',
                value: 'branch artifact',
              }),
            ]),
          }),
        }),
      }),
    );

  });
});
