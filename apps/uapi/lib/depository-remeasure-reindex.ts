/**
 * Remeasure + reindex depository search documents for 46-kind absolute law.
 *
 * Sources:
 * 1. depository_search_documents (existing facets)
 * 2. executions admitted packs (measurements on activity output)
 *
 * Writes via indexDepositoryAssetPack (document + optional embed).
 */

import { supabaseAdmin } from '@bitcode/supabase';
import {
  collectAbsoluteVolumesFromUnknown,
  remeasureDataPackAbsoluteFacets,
} from '@bitcode/asset-packs-pipelines-syntheses-domain/depository-absolute-remeasure';
import {
  indexDepositoryAssetPack,
  type DepositoryIndexPackInput,
} from '@/lib/depository-index-job';
import { bitcodeServerTelemetry } from '@/lib/bitcode-server-telemetry';

export type RemeasureReindexOptions = {
  /** Max documents to process (default 200). */
  limit?: number;
  /** Only reindex documents (skip embed). */
  skipEmbed?: boolean;
  /** Dry-run: compute facets, do not write. */
  dryRun?: boolean;
  /** Filter by asset_id (optional). */
  assetIds?: string[] | null;
};

export type RemeasureReindexRowResult = {
  assetId: string;
  ok: boolean;
  mode: 'remeasured' | 'expanded-only';
  measuredKindCount: number;
  priorKindCount: number;
  embeddingState?: string;
  error?: string;
  dryRun?: boolean;
};

export type RemeasureReindexSummary = {
  ok: boolean;
  processed: number;
  succeeded: number;
  failed: number;
  dryRun: boolean;
  rows: RemeasureReindexRowResult[];
};

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
    .map((v) => v.trim());
}

function countPositiveVolumes(volumes: Record<string, number>): number {
  return Object.values(volumes).filter((v) => Number(v) > 0).length;
}

/**
 * Load optional execution measurements for an asset id (admission activity).
 */
async function loadExecutionPriorForAsset(
  assetId: string,
): Promise<{
  volumes: Record<string, number>;
  title?: string | null;
  summary?: string | null;
  kind?: string | null;
  repositoryFullName?: string | null;
  coveredSourcePaths?: string[];
  confidence?: number | null;
}> {
  try {
    const { data, error } = await supabaseAdmin
      .from('executions')
      .select('id, output, context, summary')
      .or(
        [
          `id.eq.${assetId}`,
          `output->>depositoryAssetPackId.eq.${assetId}`,
          `context->>depositoryAssetPackId.eq.${assetId}`,
        ].join(','),
      )
      .order('created_at', { ascending: false })
      .limit(3);

    if (error || !Array.isArray(data) || data.length === 0) {
      return { volumes: {} };
    }

    let volumes: Record<string, number> = {};
    let title: string | null = null;
    let summary: string | null = null;
    let kind: string | null = null;
    let repositoryFullName: string | null = null;
    let coveredSourcePaths: string[] = [];
    let confidence: number | null = null;

    for (const row of data) {
      const output = (row?.output && typeof row.output === 'object' ? row.output : {}) as Record<
        string,
        unknown
      >;
      const context = (row?.context && typeof row.context === 'object' ? row.context : {}) as Record<
        string,
        unknown
      >;
      volumes = {
        ...volumes,
        ...collectAbsoluteVolumesFromUnknown(output),
        ...collectAbsoluteVolumesFromUnknown(context),
      };
      title = title || asString(output.title) || asString(output.assetPackTitle) || asString(row.summary);
      summary = summary || asString(output.summary);
      kind = kind || asString(output.kind) || asString(output.optionKind) || asString(output.assetPackKind);
      repositoryFullName =
        repositoryFullName ||
        asString((output.sourceBinding as { repositoryFullName?: string } | undefined)?.repositoryFullName) ||
        asString(context.repositoryFullName);
      const paths = asStringArray(output.coveredSourcePaths);
      if (paths.length) coveredSourcePaths = paths;
      if (typeof output.confidence === 'number') confidence = output.confidence;
    }

    return {
      volumes,
      title,
      summary,
      kind,
      repositoryFullName,
      coveredSourcePaths,
      confidence,
    };
  } catch {
    return { volumes: {} };
  }
}

/**
 * Remeasure absolute facets for all (or filtered) depository search documents
 * and reindex them under 46-kind commercial law.
 */
export async function remeasureAndReindexDepositoryAbsolutes(
  options: RemeasureReindexOptions = {},
): Promise<RemeasureReindexSummary> {
  const limit = Math.min(Math.max(options.limit ?? 200, 1), 1000);
  const dryRun = options.dryRun === true;
  const skipEmbed = options.skipEmbed === true;
  const filterIds = Array.isArray(options.assetIds)
    ? options.assetIds.filter((id) => typeof id === 'string' && id.trim()).map((id) => id.trim())
    : null;

  let query = supabaseAdmin
    .from('depository_search_documents')
    .select(
      'asset_id, title, summary, kind, repository_full_name, lifecycle, topics, absolute_kinds, absolute_volumes, source_path_tokens, embed_text',
    )
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (filterIds && filterIds.length > 0) {
    query = query.in('asset_id', filterIds);
  }

  const { data, error } = await query;
  if (error) {
    bitcodeServerTelemetry('error', 'depository-remeasure', 'list-failed', {
      message: error.message,
    });
    return {
      ok: false,
      processed: 0,
      succeeded: 0,
      failed: 1,
      dryRun,
      rows: [
        {
          assetId: '',
          ok: false,
          mode: 'expanded-only',
          measuredKindCount: 0,
          priorKindCount: 0,
          error: error.message,
        },
      ],
    };
  }

  const docs = Array.isArray(data) ? data : [];
  const rows: RemeasureReindexRowResult[] = [];
  let succeeded = 0;
  let failed = 0;

  for (const doc of docs) {
    const assetId = asString(doc.asset_id);
    if (!assetId) {
      failed += 1;
      rows.push({
        assetId: '',
        ok: false,
        mode: 'expanded-only',
        measuredKindCount: 0,
        priorKindCount: 0,
        error: 'missing asset_id',
      });
      continue;
    }

    try {
      const docVolumes = collectAbsoluteVolumesFromUnknown(doc);
      const priorKindCount = countPositiveVolumes(docVolumes);
      const execution = await loadExecutionPriorForAsset(assetId);

      const coveredSourcePaths =
        asStringArray((doc as { source_path_tokens?: unknown }).source_path_tokens).length > 0
          ? // path tokens are basenames; prefer execution full paths when present
            execution.coveredSourcePaths && execution.coveredSourcePaths.length > 0
            ? execution.coveredSourcePaths
            : asStringArray((doc as { source_path_tokens?: unknown }).source_path_tokens)
          : execution.coveredSourcePaths || [];

      const facets = remeasureDataPackAbsoluteFacets({
        title: asString(doc.title) || execution.title,
        summary: asString(doc.summary) || execution.summary,
        coveredSourcePaths,
        confidence: execution.confidence,
        priorVolumes: {
          ...docVolumes,
          ...execution.volumes,
        },
      });

      const input: DepositoryIndexPackInput = {
        assetId,
        title: asString(doc.title) || execution.title || null,
        summary: asString(doc.summary) || execution.summary || null,
        kind: asString(doc.kind) || execution.kind || null,
        repositoryFullName:
          asString(doc.repository_full_name) || execution.repositoryFullName || null,
        lifecycle: asString(doc.lifecycle) || 'admitted-to-depository',
        topics: asStringArray(doc.topics),
        coveredSourcePaths,
        absoluteKinds: facets.absoluteKinds,
        absoluteVolumes: facets.absoluteVolumes,
        skipEmbed,
      };

      if (dryRun) {
        succeeded += 1;
        rows.push({
          assetId,
          ok: true,
          mode: facets.mode,
          measuredKindCount: facets.measuredKindCount,
          priorKindCount,
          dryRun: true,
        });
        continue;
      }

      const result = await indexDepositoryAssetPack(input);
      if (result.ok) {
        succeeded += 1;
        rows.push({
          assetId,
          ok: true,
          mode: facets.mode,
          measuredKindCount: facets.measuredKindCount,
          priorKindCount,
          embeddingState: result.embeddingState,
        });
      } else {
        failed += 1;
        rows.push({
          assetId,
          ok: false,
          mode: facets.mode,
          measuredKindCount: facets.measuredKindCount,
          priorKindCount,
          embeddingState: result.embeddingState,
          error: result.error,
        });
      }
    } catch (err) {
      failed += 1;
      const message = err instanceof Error ? err.message : String(err);
      rows.push({
        assetId,
        ok: false,
        mode: 'expanded-only',
        measuredKindCount: 0,
        priorKindCount: 0,
        error: message,
      });
    }
  }

  bitcodeServerTelemetry('info', 'depository-remeasure', 'batch-complete', {
    processed: docs.length,
    succeeded,
    failed,
    dryRun,
    skipEmbed,
  });

  return {
    ok: failed === 0,
    processed: docs.length,
    succeeded,
    failed,
    dryRun,
    rows,
  };
}
