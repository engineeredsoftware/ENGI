/**
 * Re-embed depository_search_documents → depository_search_vectors (gte-small 384).
 *
 * Optimal path: use stored embed_text (already source-safe + absolute facets).
 * Does not remeasure absolutes — pair with remeasure-reindex when facets change.
 *
 * Server/ops only (Edge fetch + Supabase service role).
 */

import {
  ASSET_PACK_VECTOR_DIMENSIONS,
  DEFAULT_ASSET_PACK_EMBEDDING_MODEL,
  DEPOSITORY_SEARCH_DOCUMENTS_TABLE,
  DEPOSITORY_SEARCH_VECTORS_TABLE,
} from './embedding-config';
import { embedDepositoryText } from './depository-embed';

export type DepositoryReembedRow = {
  asset_id: string;
  embed_text?: string | null;
  embed_text_root?: string | null;
  embedding_state?: string | null;
  title?: string | null;
};

export type DepositoryReembedOptions = {
  /** Only rows with embedding_state pending|failed (default true). */
  pendingOnly?: boolean;
  limit?: number;
  dryRun?: boolean;
  /** Parallel Edge embed calls (default 3). */
  concurrency?: number;
  assetIds?: string[] | null;
  env?: NodeJS.ProcessEnv;
  /** Injected Supabase client (service role). */
  supabase: {
    from: (table: string) => {
      select: (cols: string) => any;
      update: (row: Record<string, unknown>) => any;
      upsert: (row: Record<string, unknown>, opts?: { onConflict?: string }) => any;
    };
  };
};

export type DepositoryReembedItemResult = {
  assetId: string;
  ok: boolean;
  embeddingState: 'ready' | 'pending' | 'failed' | 'skipped' | 'dry-run';
  model?: string;
  dimensions?: number;
  embedTextRoot?: string | null;
  error?: string;
  title?: string | null;
};

export type DepositoryReembedSummary = {
  ok: boolean;
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  dryRun: boolean;
  rows: DepositoryReembedItemResult[];
};

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (next < items.length) {
      const i = next;
      next += 1;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

/**
 * Load documents that need vectors, embed via Edge gte-small, upsert pgvector rows.
 */
export async function reembedDepositorySearchDocuments(
  options: DepositoryReembedOptions,
): Promise<DepositoryReembedSummary> {
  const limit = Math.min(Math.max(options.limit ?? 200, 1), 1000);
  const dryRun = options.dryRun === true;
  const pendingOnly = options.pendingOnly !== false;
  const concurrency = Math.min(Math.max(options.concurrency ?? 3, 1), 8);
  const env = options.env || process.env;
  const filterIds = Array.isArray(options.assetIds)
    ? options.assetIds.filter((id) => typeof id === 'string' && id.trim()).map((id) => id.trim())
    : null;

  let query = options.supabase
    .from(DEPOSITORY_SEARCH_DOCUMENTS_TABLE)
    .select('asset_id, title, embed_text, embed_text_root, embedding_state')
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (pendingOnly) {
    query = query.in('embedding_state', ['pending', 'failed']);
  }
  if (filterIds && filterIds.length) {
    query = query.in('asset_id', filterIds);
  }

  const { data, error } = await query;
  if (error) {
    return {
      ok: false,
      processed: 0,
      succeeded: 0,
      failed: 1,
      skipped: 0,
      dryRun,
      rows: [
        {
          assetId: '',
          ok: false,
          embeddingState: 'failed',
          error: error.message,
        },
      ],
    };
  }

  const docs = (Array.isArray(data) ? data : []) as DepositoryReembedRow[];
  const rows = await mapPool(docs, concurrency, async (doc) => {
    const assetId = String(doc.asset_id || '').trim();
    if (!assetId) {
      return {
        assetId: '',
        ok: false,
        embeddingState: 'failed' as const,
        error: 'missing asset_id',
      };
    }

    const embedText = String(doc.embed_text || '').trim();
    if (!embedText) {
      return {
        assetId,
        ok: false,
        embeddingState: 'failed' as const,
        title: doc.title,
        embedTextRoot: doc.embed_text_root,
        error: 'empty embed_text',
      };
    }

    if (dryRun) {
      return {
        assetId,
        ok: true,
        embeddingState: 'dry-run' as const,
        title: doc.title,
        embedTextRoot: doc.embed_text_root,
        dimensions: ASSET_PACK_VECTOR_DIMENSIONS,
        model: DEFAULT_ASSET_PACK_EMBEDDING_MODEL,
      };
    }

    try {
      const embedded = await embedDepositoryText(embedText, env);
      if (!embedded) {
        await options.supabase
          .from(DEPOSITORY_SEARCH_DOCUMENTS_TABLE)
          .update({
            embedding_state: 'pending',
            updated_at: new Date().toISOString(),
          })
          .eq('asset_id', assetId);
        return {
          assetId,
          ok: false,
          embeddingState: 'pending' as const,
          title: doc.title,
          embedTextRoot: doc.embed_text_root,
          error: 'edge-embed-unavailable',
        };
      }

      const { error: vecError } = await options.supabase
        .from(DEPOSITORY_SEARCH_VECTORS_TABLE)
        .upsert(
          {
            asset_id: assetId,
            embedding: embedded.embedding,
            model: embedded.model || DEFAULT_ASSET_PACK_EMBEDDING_MODEL,
            dimensions: embedded.dimensions || ASSET_PACK_VECTOR_DIMENSIONS,
            embedding_state: 'ready',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'asset_id' },
        );

      if (vecError) {
        await options.supabase
          .from(DEPOSITORY_SEARCH_DOCUMENTS_TABLE)
          .update({
            embedding_state: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('asset_id', assetId);
        return {
          assetId,
          ok: false,
          embeddingState: 'failed' as const,
          title: doc.title,
          embedTextRoot: doc.embed_text_root,
          error: vecError.message,
        };
      }

      await options.supabase
        .from(DEPOSITORY_SEARCH_DOCUMENTS_TABLE)
        .update({
          embedding_state: 'ready',
          updated_at: new Date().toISOString(),
        })
        .eq('asset_id', assetId);

      return {
        assetId,
        ok: true,
        embeddingState: 'ready' as const,
        title: doc.title,
        embedTextRoot: doc.embed_text_root,
        model: embedded.model,
        dimensions: embedded.dimensions,
      };
    } catch (err) {
      return {
        assetId,
        ok: false,
        embeddingState: 'failed' as const,
        title: doc.title,
        embedTextRoot: doc.embed_text_root,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  });

  const succeeded = rows.filter((r) => r.ok && r.embeddingState === 'ready').length;
  const dryRunCount = rows.filter((r) => r.embeddingState === 'dry-run').length;
  const failed = rows.filter((r) => !r.ok).length;
  const skipped = rows.filter((r) => r.embeddingState === 'skipped').length;

  return {
    ok: failed === 0,
    processed: docs.length,
    succeeded: dryRun ? dryRunCount : succeeded,
    failed,
    skipped,
    dryRun,
    rows,
  };
}
