#!/usr/bin/env ts-node
/**
 * Ops: re-embed depository_search_documents → depository_search_vectors (gte-small 384).
 *
 * Uses stored embed_text (includes absolute facet tokens). Edge Function must be deployed.
 *
 *   pnpm reembed-depository-search-vectors -- --dry-run
 *   pnpm reembed-depository-search-vectors -- --pending-only --concurrency=3
 *   pnpm reembed-depository-search-vectors -- --all --limit=200
 */

/* eslint-disable no-console */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { reembedDepositorySearchDocuments } from '../src/depository-reembed';

const repoRoot = path.resolve(__dirname, '../../../../..');

function loadEnv() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const dotenv = require('dotenv');
    for (const p of [
      path.join(repoRoot, 'apps/uapi/.env.local'),
      path.join(repoRoot, '.env.local'),
      path.join(process.cwd(), '.env.local'),
    ]) {
      if (existsSync(p)) dotenv.config({ path: p });
    }
  } catch {
    /* optional */
  }
}

function parseArgs(argv: string[]) {
  const opts = {
    dryRun: false,
    pendingOnly: true,
    limit: 200,
    concurrency: 3,
    assetIds: [] as string[],
  };
  for (const arg of argv) {
    if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '--all') opts.pendingOnly = false;
    else if (arg === '--pending-only') opts.pendingOnly = true;
    else if (arg.startsWith('--limit=')) {
      const n = Number(arg.slice('--limit='.length));
      if (Number.isFinite(n) && n > 0) opts.limit = Math.floor(n);
    } else if (arg.startsWith('--concurrency=')) {
      const n = Number(arg.slice('--concurrency='.length));
      if (Number.isFinite(n) && n > 0) opts.concurrency = Math.floor(n);
    } else if (arg.startsWith('--asset-id=')) {
      const id = arg.slice('--asset-id='.length).trim();
      if (id) opts.assetIds.push(id);
    }
  }
  return opts;
}

async function main() {
  loadEnv();
  const opts = parseArgs(process.argv.slice(2));

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ADMIN_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    '';

  if (!url || !key) {
    console.error('Missing SUPABASE_URL and service role key in env.');
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log(
    JSON.stringify(
      {
        action: 'reembed-depository-search-vectors',
        dryRun: opts.dryRun,
        pendingOnly: opts.pendingOnly,
        limit: opts.limit,
        concurrency: opts.concurrency,
        assetIdCount: opts.assetIds.length,
        project: url.replace(/^https?:\/\//, '').split('.')[0],
        embedUrl: `${url.replace(/\/$/, '')}/functions/v1/embed`,
      },
      null,
      2,
    ),
  );

  const summary = await reembedDepositorySearchDocuments({
    supabase: supabase as any,
    dryRun: opts.dryRun,
    pendingOnly: opts.pendingOnly,
    limit: opts.limit,
    concurrency: opts.concurrency,
    assetIds: opts.assetIds.length ? opts.assetIds : null,
    env: process.env,
  });

  // Post-verify counts when not dry-run
  let docsReady: number | null = null;
  let vectorsReady: number | null = null;
  if (!opts.dryRun) {
    const { count: dCount } = await supabase
      .from('depository_search_documents')
      .select('asset_id', { count: 'exact', head: true })
      .eq('embedding_state', 'ready');
    const { count: vCount } = await supabase
      .from('depository_search_vectors')
      .select('asset_id', { count: 'exact', head: true })
      .eq('embedding_state', 'ready');
    docsReady = dCount ?? null;
    vectorsReady = vCount ?? null;
  }

  console.log(
    JSON.stringify(
      {
        ok: summary.ok,
        processed: summary.processed,
        succeeded: summary.succeeded,
        failed: summary.failed,
        skipped: summary.skipped,
        dryRun: summary.dryRun,
        docsReady,
        vectorsReady,
        sample: summary.rows.slice(0, 16).map((r) => ({
          assetId: r.assetId,
          ok: r.ok,
          embeddingState: r.embeddingState,
          title: r.title,
          model: r.model,
          dimensions: r.dimensions,
          error: r.error,
        })),
      },
      null,
      2,
    ),
  );

  if (summary.processed === 0) {
    console.log('No documents matched re-embed filter (pending/failed or empty).');
  }
  if (summary.failed > 0) process.exitCode = 2;
}

main().catch((err) => {
  console.error(
    'reembed-depository-search-vectors failed:',
    err instanceof Error ? err.message : String(err),
  );
  process.exit(1);
});
