/**
 * Background depository search index job (V48 Gate 5).
 *
 * On AssetPack admission:
 * 1. Upsert source-safe structured row → depository_search_documents
 * 2. Embed with open-source gte-small (384) via Supabase Edge Function
 * 3. Upsert vector → depository_search_vectors (Postgres + pgvector)
 *
 * Does **not** call OpenAI Embeddings API. Fail-soft when Edge/embed unconfigured.
 *
 * Spec: BITCODE_SPEC_V48.md depository search law;
 * migrations 20260720120000 + 20260720140000 (gte-small 384).
 */

import { createHash } from 'crypto';
import { supabaseAdmin } from '@bitcode/supabase';
import {
  ASSET_PACK_VECTOR_DIMENSIONS,
  DEFAULT_ASSET_PACK_EMBEDDING_MODEL,
  resolveAssetPackEmbeddingConfig,
} from '@bitcode/asset-packs-pipelines-syntheses-domain/embedding-config';
import { embedDepositoryText } from '@bitcode/asset-packs-pipelines-syntheses-domain/depository-embed';
import { expandAbsoluteVolumesToFullCatalog } from '@bitcode/asset-packs-pipelines-syntheses-domain/depository-absolute-facets-expand';
import { bitcodeServerTelemetry } from '@/lib/bitcode-server-telemetry';

export type DepositoryIndexPackInput = {
  assetId: string;
  title?: string | null;
  summary?: string | null;
  kind?: string | null;
  repositoryFullName?: string | null;
  lifecycle?: string | null;
  topics?: string[] | null;
  coveredSourcePaths?: string[] | null;
  absoluteKinds?: string[] | null;
  absoluteVolumes?: Record<string, number> | null;
  /**
   * Buyer-visible material identity bag (compositions, inventories, tags).
   * Source-safe only; stored as jsonb + folded into embed/corpus.
   */
  materialIdentity?: Record<string, unknown> | null;
  /** When true, only upsert document (static index). */
  skipEmbed?: boolean;
};

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value
        .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
        .map((v) => v.trim()),
    ),
  ];
}

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

export function buildDepositoryEmbedText(input: DepositoryIndexPackInput): string {
  // Full commercial catalogue — include finite volumes + material identity tokens.
  const volumePairs = Object.entries(input.absoluteVolumes || {})
    .filter(([, v]) => Number.isFinite(Number(v)))
    .map(([k, v]) => `${k}:${Number(v).toFixed(3)}`)
    .slice(0, 80);
  const identityTokens = extractMaterialIdentityCorpusTokens(input.materialIdentity);
  const parts = [
    input.title,
    input.summary,
    input.kind,
    input.repositoryFullName,
    input.lifecycle,
    ...(input.topics || []),
    ...(input.absoluteKinds || []),
    ...volumePairs,
    ...identityTokens,
    ...(input.coveredSourcePaths || []).slice(0, 40),
  ]
    .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
    .map((p) => p.trim());
  return parts.join(' ').slice(0, 8000);
}

/** Pull source-safe corpus tokens from a material identity bag. */
function extractMaterialIdentityCorpusTokens(
  materialIdentity: Record<string, unknown> | null | undefined,
): string[] {
  if (!materialIdentity || typeof materialIdentity !== 'object') return [];
  const tokens = materialIdentity.corpusTokens;
  if (Array.isArray(tokens)) {
    return tokens
      .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
      .slice(0, 120);
  }
  return [];
}

/**
 * Upsert static search document + optional gte-small vector for one admitted AP.
 */
export async function indexDepositoryAssetPack(
  input: DepositoryIndexPackInput,
): Promise<{
  ok: boolean;
  assetId: string;
  embeddingState: 'pending' | 'ready' | 'failed' | 'skipped';
  error?: string;
  telemetry?: Record<string, unknown>;
}> {
  const assetId = asString(input.assetId);
  if (!assetId) {
    return { ok: false, assetId: '', embeddingState: 'failed', error: 'assetId required' };
  }

  // Commercial law: always store full catalogue (missing volumes → 0).
  const expanded = expandAbsoluteVolumesToFullCatalog(input.absoluteVolumes || {});
  const absoluteKinds = expanded.absoluteKinds;
  const absoluteVolumes = expanded.absoluteVolumes;
  const materialIdentity =
    input.materialIdentity && typeof input.materialIdentity === 'object'
      ? input.materialIdentity
      : null;

  const embedInput: DepositoryIndexPackInput = {
    ...input,
    absoluteKinds,
    absoluteVolumes,
    materialIdentity,
  };
  const embedTextValue = buildDepositoryEmbedText(embedInput);
  const embedTextRoot = `sha256:${sha256(embedTextValue)}`;
  const topics = asStringArray(input.topics);
  const pathTokens = asStringArray(input.coveredSourcePaths)
    .map((p) => p.split('/').pop() || p)
    .filter(Boolean)
    .slice(0, 40);
  const config = resolveAssetPackEmbeddingConfig();

  const documentRow = {
    asset_id: assetId,
    lifecycle: input.lifecycle || 'admitted-to-depository',
    kind: input.kind || null,
    repository_full_name: input.repositoryFullName || null,
    title: input.title || null,
    summary: input.summary || null,
    material_identity: materialIdentity,
    topics,
    absolute_kinds: absoluteKinds,
    absolute_volumes: absoluteVolumes,
    neediness_kinds: [] as string[],
    source_path_tokens: pathTokens,
    embed_text: embedTextValue,
    embed_text_root: embedTextRoot,
    embedding_state: 'pending',
    updated_at: new Date().toISOString(),
  };

  try {
    const { error: docError } = await supabaseAdmin
      .from('depository_search_documents')
      .upsert(documentRow, { onConflict: 'asset_id' });
    if (docError) {
      bitcodeServerTelemetry('warn', 'depository-index', 'document-upsert-failed', {
        assetId,
        message: docError.message,
      });
      return {
        ok: false,
        assetId,
        embeddingState: 'failed',
        error: docError.message,
      };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    bitcodeServerTelemetry('warn', 'depository-index', 'document-upsert-error', {
      assetId,
      message,
    });
    return {
      ok: false,
      assetId,
      embeddingState: 'failed',
      error: message,
    };
  }

  bitcodeServerTelemetry('info', 'depository-index', 'document-upserted', {
    assetId,
    embedTextRoot,
    topicCount: topics.length,
    pathTokenCount: pathTokens.length,
    kind: input.kind || null,
    repositoryFullName: input.repositoryFullName || null,
  });

  if (input.skipEmbed) {
    return {
      ok: true,
      assetId,
      embeddingState: 'skipped',
      telemetry: { embedTextRoot, skipped: true },
    };
  }

  const embedded = await embedDepositoryText(embedTextValue);
  if (!embedded) {
    await supabaseAdmin
      .from('depository_search_documents')
      .update({ embedding_state: 'pending', updated_at: new Date().toISOString() })
      .eq('asset_id', assetId);
    bitcodeServerTelemetry('info', 'depository-index', 'embed-pending', {
      assetId,
      reason: 'edge-embed-unavailable',
      model: config.model,
      dimensions: config.dimensions,
    });
    return {
      ok: true,
      assetId,
      embeddingState: 'pending',
      telemetry: {
        embedTextRoot,
        embedSource: null,
        reason: 'edge-embed-unavailable',
      },
    };
  }

  try {
    const { error: vecError } = await supabaseAdmin.from('depository_search_vectors').upsert(
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
      await supabaseAdmin
        .from('depository_search_documents')
        .update({ embedding_state: 'failed', updated_at: new Date().toISOString() })
        .eq('asset_id', assetId);
      bitcodeServerTelemetry('warn', 'depository-index', 'vector-upsert-failed', {
        assetId,
        message: vecError.message,
      });
      return { ok: false, assetId, embeddingState: 'failed', error: vecError.message };
    }
    await supabaseAdmin
      .from('depository_search_documents')
      .update({ embedding_state: 'ready', updated_at: new Date().toISOString() })
      .eq('asset_id', assetId);

    bitcodeServerTelemetry('info', 'depository-index', 'vector-ready', {
      assetId,
      model: embedded.model,
      dimensions: embedded.dimensions,
      provider: embedded.provider,
      embedSource: embedded.source,
      embedTextRoot,
      store: 'supabase-pgvector',
    });

    return {
      ok: true,
      assetId,
      embeddingState: 'ready',
      telemetry: {
        embedTextRoot,
        model: embedded.model,
        dimensions: embedded.dimensions,
        provider: embedded.provider,
        embedSource: embedded.source,
        store: 'supabase-pgvector',
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    bitcodeServerTelemetry('warn', 'depository-index', 'vector-upsert-error', {
      assetId,
      message,
    });
    return {
      ok: false,
      assetId,
      embeddingState: 'failed',
      error: message,
    };
  }
}
