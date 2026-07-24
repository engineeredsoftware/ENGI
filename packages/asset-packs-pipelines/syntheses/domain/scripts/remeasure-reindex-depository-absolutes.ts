#!/usr/bin/env ts-node
/**
 * Ops: remeasure + reindex depository absolute facets under 46-kind law.
 *
 * Sources (merged):
 * 1. depository_search_documents (existing index rows)
 * 2. executions admitted packs (deposit-option-review-admission)
 *
 * From package dir (skip-project if monorepo tsconfig path is broken):
 *   TS_NODE_TRANSPILE_ONLY=1 TS_NODE_COMPILER_OPTIONS='{"module":"commonjs","moduleResolution":"node","esModuleInterop":true,"target":"ES2020"}' \
 *     pnpm exec ts-node --transpile-only --skip-project scripts/remeasure-reindex-depository-absolutes.ts --dry-run
 *
 * Live write:
 *   ... scripts/remeasure-reindex-depository-absolutes.ts --limit=200
 */

/* eslint-disable no-console */
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  collectAbsoluteVolumesFromUnknown,
  remeasureDataPackAbsoluteFacets,
} from '../src/depository-absolute-remeasure';

const repoRoot = path.resolve(__dirname, '../../../../..');

type WorkItem = {
  assetId: string;
  title?: string | null;
  summary?: string | null;
  kind?: string | null;
  repositoryFullName?: string | null;
  lifecycle?: string | null;
  topics?: string[];
  coveredSourcePaths?: string[];
  confidence?: number | null;
  priorVolumes: Record<string, number>;
  source: 'document' | 'execution' | 'merged';
};

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
    limit: 200,
    assetIds: [] as string[],
  };
  for (const arg of argv) {
    if (arg === '--dry-run') opts.dryRun = true;
    else if (arg.startsWith('--limit=')) {
      const n = Number(arg.slice('--limit='.length));
      if (Number.isFinite(n) && n > 0) opts.limit = Math.floor(n);
    } else if (arg.startsWith('--asset-id=')) {
      const id = arg.slice('--asset-id='.length).trim();
      if (id) opts.assetIds.push(id);
    }
  }
  return opts;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
    .map((v) => v.trim());
}

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

function buildEmbedText(input: {
  title?: string | null;
  summary?: string | null;
  kind?: string | null;
  repositoryFullName?: string | null;
  lifecycle?: string | null;
  topics?: string[];
  absoluteKinds?: string[];
  absoluteVolumes?: Record<string, number>;
  coveredSourcePaths?: string[];
}): string {
  const volumePairs = Object.entries(input.absoluteVolumes || {})
    .filter(([, v]) => Number.isFinite(Number(v)))
    .map(([k, v]) => `${k}:${Number(v).toFixed(3)}`)
    .slice(0, 46);
  return [
    input.title,
    input.summary,
    input.kind,
    input.repositoryFullName,
    input.lifecycle,
    ...(input.topics || []),
    ...(input.absoluteKinds || []),
    ...volumePairs,
    ...(input.coveredSourcePaths || []).slice(0, 40),
  ]
    .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
    .map((p) => p.trim())
    .join(' ')
    .slice(0, 8000);
}

async function loadDocuments(
  supabase: SupabaseClient,
  limit: number,
  assetIds: string[],
): Promise<WorkItem[]> {
  let query = supabase
    .from('depository_search_documents')
    .select(
      'asset_id, title, summary, kind, repository_full_name, lifecycle, topics, absolute_kinds, absolute_volumes, source_path_tokens',
    )
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (assetIds.length) query = query.in('asset_id', assetIds);

  const { data, error } = await query;
  if (error) throw new Error(`list documents: ${error.message}`);
  return (data || []).map((doc: Record<string, unknown>) => ({
    assetId: asString(doc.asset_id) || '',
    title: asString(doc.title),
    summary: asString(doc.summary),
    kind: asString(doc.kind),
    repositoryFullName: asString(doc.repository_full_name),
    lifecycle: asString(doc.lifecycle) || 'admitted-to-depository',
    topics: asStringArray(doc.topics),
    coveredSourcePaths: asStringArray(doc.source_path_tokens),
    priorVolumes: collectAbsoluteVolumesFromUnknown(doc),
    source: 'document' as const,
  })).filter((w) => w.assetId);
}

async function loadAdmittedExecutions(
  supabase: SupabaseClient,
  limit: number,
  assetIds: string[],
): Promise<WorkItem[]> {
  const { data, error } = await supabase
    .from('executions')
    .select('id, type, status, context, output, created_at')
    .or(
      [
        'context->>admissionState.eq.admitted-to-depository',
        'context->>source.eq.deposit-option-review-admission',
        'type.eq.settled-assetpack',
        'context->>settlementState.eq.settled',
      ].join(','),
    )
    .order('created_at', { ascending: false })
    .limit(Math.min(limit * 2, 400));

  if (error) throw new Error(`list executions: ${error.message}`);

  const items: WorkItem[] = [];
  for (const row of data || []) {
    const output =
      row?.output && typeof row.output === 'object'
        ? (row.output as Record<string, unknown>)
        : {};
    const context =
      row?.context && typeof row.context === 'object'
        ? (row.context as Record<string, unknown>)
        : {};

    // depository_search_documents.asset_id is UUID PK — use execution id, not
    // soft product labels like "depository-assetpack-…".
    const executionId = asString(row.id);
    if (!executionId) continue;
    const softDepositoryId =
      asString(output.depositoryAssetPackId) ||
      asString(context.depositoryAssetPackId);
    if (
      assetIds.length &&
      !assetIds.includes(executionId) &&
      !(softDepositoryId && assetIds.includes(softDepositoryId))
    ) {
      continue;
    }

    const admission =
      asString(context.admissionState) || asString(output.admissionState);
    const source = asString(context.source);
    const admitted =
      admission === 'admitted-to-depository' ||
      source === 'deposit-option-review-admission' ||
      asString(row.type) === 'settled-assetpack' ||
      asString(context.settlementState) === 'settled';
    if (!admitted) continue;

    const sourceBinding =
      output.sourceBinding && typeof output.sourceBinding === 'object'
        ? (output.sourceBinding as Record<string, unknown>)
        : {};

    items.push({
      assetId: executionId,
      title:
        asString(output.assetPackTitle) ||
        asString(output.title) ||
        asString(context.assetPackTitle),
      summary: asString(output.summary) || asString(context.summary),
      kind:
        asString(output.kind) ||
        asString(output.optionKind) ||
        asString(output.assetPackKind) ||
        asString(context.optionKind),
      repositoryFullName:
        asString(sourceBinding.repositoryFullName) ||
        asString(context.repositoryFullName),
      lifecycle: admission || 'admitted-to-depository',
      topics: [],
      coveredSourcePaths: asStringArray(output.coveredSourcePaths),
      confidence:
        typeof output.confidence === 'number' ? output.confidence : null,
      priorVolumes: collectAbsoluteVolumesFromUnknown(output),
      source: 'execution',
    });
  }

  // Dedupe by assetId (prefer richer measurement maps).
  const byId = new Map<string, WorkItem>();
  for (const item of items) {
    const prev = byId.get(item.assetId);
    if (!prev) {
      byId.set(item.assetId, item);
      continue;
    }
    const prevCount = Object.values(prev.priorVolumes).filter((v) => v > 0).length;
    const nextCount = Object.values(item.priorVolumes).filter((v) => v > 0).length;
    if (nextCount >= prevCount) byId.set(item.assetId, item);
  }
  return [...byId.values()].slice(0, limit);
}

function mergeWorkItems(docs: WorkItem[], execs: WorkItem[]): WorkItem[] {
  const byId = new Map<string, WorkItem>();
  for (const d of docs) byId.set(d.assetId, d);
  for (const e of execs) {
    const prev = byId.get(e.assetId);
    if (!prev) {
      byId.set(e.assetId, e);
      continue;
    }
    byId.set(e.assetId, {
      ...prev,
      title: prev.title || e.title,
      summary: prev.summary || e.summary,
      kind: prev.kind || e.kind,
      repositoryFullName: prev.repositoryFullName || e.repositoryFullName,
      lifecycle: prev.lifecycle || e.lifecycle,
      topics: prev.topics?.length ? prev.topics : e.topics,
      coveredSourcePaths:
        prev.coveredSourcePaths && prev.coveredSourcePaths.length
          ? prev.coveredSourcePaths
          : e.coveredSourcePaths,
      confidence: prev.confidence ?? e.confidence,
      priorVolumes: { ...e.priorVolumes, ...prev.priorVolumes },
      source: 'merged',
    });
  }
  return [...byId.values()];
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
        action: 'remeasure-reindex-depository-absolutes',
        dryRun: opts.dryRun,
        limit: opts.limit,
        assetIdCount: opts.assetIds.length,
        project: url.replace(/^https?:\/\//, '').split('.')[0],
      },
      null,
      2,
    ),
  );

  const docs = await loadDocuments(supabase, opts.limit, opts.assetIds);
  const execs = await loadAdmittedExecutions(supabase, opts.limit, opts.assetIds);
  const work = mergeWorkItems(docs, execs);

  console.log(
    JSON.stringify(
      {
        documentRows: docs.length,
        executionRows: execs.length,
        workItems: work.length,
      },
      null,
      2,
    ),
  );

  let succeeded = 0;
  let failed = 0;
  const sample: Array<Record<string, unknown>> = [];

  for (const item of work) {
    try {
      const priorKindCount = Object.values(item.priorVolumes).filter((v) => v > 0).length;
      const facets = remeasureDataPackAbsoluteFacets({
        title: item.title,
        summary: item.summary,
        coveredSourcePaths: item.coveredSourcePaths,
        confidence: item.confidence,
        priorVolumes: item.priorVolumes,
      });

      const embedText = buildEmbedText({
        title: item.title,
        summary: item.summary,
        kind: item.kind,
        repositoryFullName: item.repositoryFullName,
        lifecycle: item.lifecycle || 'admitted-to-depository',
        topics: item.topics || [],
        absoluteKinds: facets.absoluteKinds,
        absoluteVolumes: facets.absoluteVolumes,
        coveredSourcePaths: item.coveredSourcePaths || [],
      });
      const embedTextRoot = `sha256:${sha256(embedText)}`;

      const row = {
        assetId: item.assetId,
        title: item.title,
        source: item.source,
        mode: facets.mode,
        priorKindCount,
        measuredKindCount: facets.measuredKindCount,
        catalogSize: facets.catalogSize,
        remeasuredKindCount: facets.remeasuredKindCount,
        preservedPriorKindCount: facets.preservedPriorKindCount,
      };
      if (sample.length < 15) sample.push(row);

      if (opts.dryRun) {
        succeeded += 1;
        continue;
      }

      const documentRow = {
        asset_id: item.assetId,
        lifecycle: item.lifecycle || 'admitted-to-depository',
        kind: item.kind || null,
        repository_full_name: item.repositoryFullName || null,
        title: item.title || null,
        summary: item.summary || null,
        topics: item.topics || [],
        absolute_kinds: facets.absoluteKinds,
        absolute_volumes: facets.absoluteVolumes,
        neediness_kinds: [] as string[],
        source_path_tokens: (item.coveredSourcePaths || [])
          .map((p) => p.split('/').pop() || p)
          .filter(Boolean)
          .slice(0, 40),
        embed_text: embedText,
        embed_text_root: embedTextRoot,
        embedding_state: 'pending',
        updated_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase
        .from('depository_search_documents')
        .upsert(documentRow, { onConflict: 'asset_id' });

      if (upsertError) {
        failed += 1;
        sample.push({ ...row, error: upsertError.message });
        continue;
      }
      succeeded += 1;
    } catch (err) {
      failed += 1;
      sample.push({
        assetId: item.assetId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // Verify post-write counts when not dry-run.
  let verifyCount: number | null = null;
  if (!opts.dryRun) {
    const { count } = await supabase
      .from('depository_search_documents')
      .select('asset_id', { count: 'exact', head: true });
    verifyCount = count ?? null;
  }

  console.log(
    JSON.stringify(
      {
        ok: failed === 0,
        processed: work.length,
        succeeded,
        failed,
        dryRun: opts.dryRun,
        depositorySearchDocumentsCount: verifyCount,
        note:
          'absolute_kinds/volumes expanded to full 46 commercial catalogue; embeddings left pending (re-embed via index job when Edge embed is up).',
        sample,
      },
      null,
      2,
    ),
  );

  if (work.length === 0) {
    console.log('No admitted packs or search documents found — nothing to remeasure.');
  }
  if (failed > 0) process.exitCode = 2;
}

main().catch((err) => {
  console.error(
    'remeasure-reindex failed:',
    err instanceof Error ? err.message : String(err),
  );
  process.exit(1);
});
