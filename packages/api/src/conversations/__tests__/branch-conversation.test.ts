import { branchConversation } from '../conversations';

jest.mock('@bitcode/supabase', () => {
  const tables: Record<string, any[]> = {
    conversations: [],
    messages: [],
    message_attachments: [],
  };
  const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
  const resetTables = () => {
    Object.values(tables).forEach((rows) => {
      rows.length = 0;
    });
  };
  const api = {
    from: (table: string) => ({
      select: (query?: string) => ({
        eq: (c1: string, v1: any) => ({
          eq: (c2: string, v2: any) => ({
            single: async () => {
              const row = tables[table].find(r => r.id === v1 && r.user_id === v2) || null;
              if (!row) return { data: null, error: { code: 'PGRST116' } };
              return { data: clone(row), error: null };
            },
          }),
          order: (_field: string, _opts: any) => {
            const rows = tables[table]
              .filter((row) => row[c1] === v1)
              .sort((left, right) => String(left.created_at || '').localeCompare(String(right.created_at || '')))
              .map((row) => {
                if (table !== 'messages' || !String(query || '').includes('message_attachments')) {
                  return clone(row);
                }

                return {
                  ...clone(row),
                  message_attachments: tables.message_attachments
                    .filter((attachment) => attachment.message_id === row.id)
                    .sort((left, right) => String(left.created_at || '').localeCompare(String(right.created_at || '')))
                    .map((attachment) => clone(attachment)),
                };
              });

            return { data: rows, error: null };
          },
        }),
        order: (_f: string, _o: any) => ({
          eq: (_field: string, value: any) => ({
            order: (_: string, __: any) => ({
              data: tables[table].filter((row) => row.conversation_id === value).map((row) => clone(row)),
              error: null,
            }),
          }),
        }),
      }),
      insert: (row: any) => ({
        select: (_?: string) => ({
          single: async () => {
            const rows = Array.isArray(row) ? row : [row];
            const insertedRows = rows.map((entry) => {
              const id = entry.id || `${table}-${tables[table].length + 1}`;
              const newRow = { id, ...entry };
              tables[table].push(newRow);
              return newRow;
            });
            return { data: clone(insertedRows[0]), error: null };
          }
        }),
        then: async (resolve: (value: unknown) => unknown, reject?: (reason?: unknown) => unknown) => {
          try {
            const rows = Array.isArray(row) ? row : [row];
            rows.forEach((entry) => {
              const id = entry.id || `${table}-${tables[table].length + 1}`;
              tables[table].push({ id, ...entry });
            });
            return Promise.resolve({ data: null, error: null }).then(resolve, reject);
          } catch (error) {
            return Promise.reject(error).catch(reject);
          }
        },
      }),
      update: (_row: any) => ({ eq: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }) })
    })
  };
  return { supabaseAdmin: api, __resetTables: resetTables };
});

describe('branchConversation', () => {
  const userId = 'user-1';
  const sourceConversationId = 'conv-1';

  beforeEach(async () => {
    const { __resetTables } = jest.requireMock('@bitcode/supabase') as { __resetTables: () => void };
    __resetTables();
    const { supabaseAdmin } = await import('@bitcode/supabase');
    // seed conversation and messages
    await supabaseAdmin.from('conversations').insert({ id: sourceConversationId, user_id: userId, title: 'Source', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }).select('*').single();
    for (let i = 0; i < 3; i++) {
      await supabaseAdmin.from('messages').insert({ id: `m${i+1}`, conversation_id: sourceConversationId, role: 'user', content: `msg-${i+1}`, created_at: new Date(Date.now() + i).toISOString() }).select('*').single();
    }
    await supabaseAdmin.from('message_attachments').insert([
      {
        id: 'att-source-1',
        message_id: 'm1',
        attachment_id: 'repo-1',
        attachment_category: 'external',
        attachment_type: 'github_repo',
        metadata: { token_type: 'source', title: 'bitcode/terminal' },
        created_at: new Date().toISOString(),
      },
      {
        id: 'att-destination-1',
        message_id: 'm2',
        attachment_id: 'dest-1',
        attachment_category: 'external',
        attachment_type: 'settlement_target',
        metadata: { token_type: 'destination', title: 'Settlement lane' },
        created_at: new Date().toISOString(),
      },
    ]).then(() => undefined);
  });

  it('branches a conversation and copies messages', async () => {
    const result = await branchConversation(userId, sourceConversationId, { title: 'Branched', copyMessages: true });
    const { supabaseAdmin } = await import('@bitcode/supabase');
    const { data: branchedMessages } = await supabaseAdmin
      .from('messages')
      .select(`
        *,
        message_attachments (
          id,
          message_id,
          attachment_id,
          attachment_category,
          attachment_type,
          metadata,
          created_at
        )
      `)
      .eq('conversation_id', result.id)
      .order('created_at', { ascending: true });

    expect(result.id).toBeTruthy();
    expect(result.copiedCount).toBe(3);
    expect(result.copiedAttachmentCount).toBe(2);
    expect(branchedMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          conversation_id: result.id,
          message_attachments: expect.arrayContaining([
            expect.objectContaining({
              attachment_id: 'repo-1',
              attachment_type: 'github_repo',
              metadata: expect.objectContaining({
                token_type: 'source',
                title: 'bitcode/terminal',
              }),
            }),
          ]),
        }),
        expect.objectContaining({
          conversation_id: result.id,
          message_attachments: expect.arrayContaining([
            expect.objectContaining({
              attachment_id: 'dest-1',
              attachment_type: 'settlement_target',
              metadata: expect.objectContaining({
                token_type: 'destination',
                title: 'Settlement lane',
              }),
            }),
          ]),
        }),
      ]),
    );
  });
});
