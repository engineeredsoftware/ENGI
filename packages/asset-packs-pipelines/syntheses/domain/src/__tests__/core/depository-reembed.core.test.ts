// @ts-nocheck
import { reembedDepositorySearchDocuments } from '../../depository-reembed';

function makeFakeSupabase(docs: Array<Record<string, unknown>>) {
  const vectorUpserts: Array<Record<string, unknown>> = [];
  const docUpdates: Array<{ assetId: string; row: Record<string, unknown> }> = [];
  return {
    vectorUpserts,
    docUpdates,
    client: {
      from(table: string) {
        if (table === 'depository_search_documents') {
          const chain: any = {
            select: () => chain,
            order: () => chain,
            limit: () => chain,
            in: () => chain,
            eq: () => chain,
            update: (row: Record<string, unknown>) => ({
              eq: async (col: string, assetId: string) => {
                docUpdates.push({ assetId, row });
                return { error: null };
              },
            }),
            then: undefined,
          };
          // await query resolves to docs
          chain.then = (resolve: (v: unknown) => void) =>
            resolve({ data: docs, error: null });
          return chain;
        }
        if (table === 'depository_search_vectors') {
          return {
            upsert: async (row: Record<string, unknown>) => {
              vectorUpserts.push(row);
              return { error: null };
            },
          };
        }
        throw new Error(`unexpected table ${table}`);
      },
    },
  };
}

describe('CORE: depository reembed', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.BITCODE_DEPOSITORY_EMBED_MODE;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it('dry-run lists pending docs without calling Edge', async () => {
    const fake = makeFakeSupabase([
      {
        asset_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        title: 'Pack A',
        embed_text: 'Pack A function-count:0.500',
        embed_text_root: 'sha256:abc',
        embedding_state: 'pending',
      },
    ]);
    let fetchCalls = 0;
    global.fetch = (async () => {
      fetchCalls += 1;
      return new Response('{}');
    }) as typeof fetch;

    const summary = await reembedDepositorySearchDocuments({
      supabase: fake.client as any,
      dryRun: true,
      pendingOnly: true,
      env: {
        SUPABASE_URL: 'https://example.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'test-key',
        BITCODE_DEPOSITORY_EMBED_MODE: 'edge',
      } as NodeJS.ProcessEnv,
    });

    expect(summary.processed).toBe(1);
    expect(summary.succeeded).toBe(1);
    expect(summary.rows[0].embeddingState).toBe('dry-run');
    expect(fetchCalls).toBe(0);
    expect(fake.vectorUpserts).toHaveLength(0);
  });

  it('embeds via Edge and upserts ready vectors', async () => {
    const fake = makeFakeSupabase([
      {
        asset_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        title: 'Pack B',
        embed_text: 'Pack B absolute-composite',
        embed_text_root: 'sha256:def',
        embedding_state: 'pending',
      },
    ]);
    const embedding = Array.from({ length: 384 }, (_, i) => (i % 10) / 10);
    global.fetch = (async () =>
      new Response(
        JSON.stringify({
          ok: true,
          embedding,
          model: 'gte-small',
          dimensions: 384,
          provider: 'supabase-gte-small',
        }),
        { status: 200 },
      )) as typeof fetch;

    const summary = await reembedDepositorySearchDocuments({
      supabase: fake.client as any,
      dryRun: false,
      pendingOnly: true,
      concurrency: 1,
      env: {
        SUPABASE_URL: 'https://example.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'test-key',
        BITCODE_DEPOSITORY_EMBED_MODE: 'edge',
      } as NodeJS.ProcessEnv,
    });

    expect(summary.ok).toBe(true);
    expect(summary.succeeded).toBe(1);
    expect(summary.rows[0].embeddingState).toBe('ready');
    expect(fake.vectorUpserts).toHaveLength(1);
    expect(fake.vectorUpserts[0].embedding_state).toBe('ready');
    expect((fake.vectorUpserts[0].embedding as number[]).length).toBe(384);
    expect(fake.docUpdates.some((u) => u.row.embedding_state === 'ready')).toBe(true);
  });
});
