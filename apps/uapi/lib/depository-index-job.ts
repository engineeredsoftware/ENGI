/**
 * Background depository search index job (V48 Gate 5).
 *
 * On AssetPack admission: upsert source-safe search document + embed text into
 * depository_search_vectors (OpenAI text-embedding-3-small, 1536 dims).
 *
 * Called from POST /api/depository/index (and optionally fire-and-forget after
 * deposit option admission). Fail-soft: missing tables / API keys leave the
 * document in pending without throwing into the admission UX path.
 *
 * Spec: BITCODE_SPEC_V48.md depository search law; migration
 * supabase/migrations/20260720120000_depository_search_index.sql.
 */

import { createHash } from 'crypto';
import { supabaseAdmin } from '@bitcode/supabase';
import {
  buildOpenAIEmbeddingCreateParams,
  normalizeAssetPackEmbeddingVector,
  resolveAssetPackEmbeddingConfig,
} from '@bitcode/asset-packs-pipelines-syntheses-domain/embedding-config';

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
  /** When true, skip OpenAI embed and only upsert document (static index). */
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
  const parts = [
    input.title,
    input.summary,
    input.kind,
    input.repositoryFullName,
    input.lifecycle,
    ...(input.topics || []),
    ...(input.absoluteKinds || []),
    ...(input.coveredSourcePaths || []).slice(0, 40),
  ]
    .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
    .map((p) => p.trim());
  return parts.join(' ').slice(0, 8000);
}

async function embedText(text: string): Promise<{ vector: number[]; model: string; dimensions: number } | null> {
  const key = process.env.OPENAI_API_KEY?.trim() || process.env.BITCODE_OPENAI_API_KEY?.trim();
  if (!key || !text.trim()) return null;
  const config = resolveAssetPackEmbeddingConfig();
  const body = buildOpenAIEmbeddingCreateParams(text, config);
  try {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: Array<{ embedding?: unknown }> };
    const vector = normalizeAssetPackEmbeddingVector(json?.data?.[0]?.embedding, config);
    if (!vector) return null;
    return { vector, model: config.model, dimensions: config.dimensions };
  } catch {
    return null;
  }
}

/**
 * Upsert static search document and optional vector for one admitted AssetPack.
 */
export async function indexDepositoryAssetPack(
  input: DepositoryIndexPackInput,
): Promise<{
  ok: boolean;
  assetId: string;
  embeddingState: 'pending' | 'ready' | 'failed' | 'skipped';
  error?: string;
}> {
  const assetId = asString(input.assetId);
  if (!assetId) {
    return { ok: false, assetId: '', embeddingState: 'failed', error: 'assetId required' };
  }

  const embedTextValue = buildDepositoryEmbedText(input);
  const embedTextRoot = `sha256:${sha256(embedTextValue)}`;
  const topics = asStringArray(input.topics);
  const absoluteKinds = asStringArray(input.absoluteKinds);
  const pathTokens = asStringArray(input.coveredSourcePaths)
    .map((p) => p.split('/').pop() || p)
    .filter(Boolean)
    .slice(0, 40);

  const documentRow = {
    asset_id: assetId,
    lifecycle: input.lifecycle || 'admitted-to-depository',
    kind: input.kind || null,
    repository_full_name: input.repositoryFullName || null,
    title: input.title || null,
    summary: input.summary || null,
    topics,
    absolute_kinds: absoluteKinds,
    absolute_volumes: input.absoluteVolumes || {},
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
      // Table may not be migrated yet — fail soft.
      return {
        ok: false,
        assetId,
        embeddingState: 'failed',
        error: docError.message,
      };
    }
  } catch (err) {
    return {
      ok: false,
      assetId,
      embeddingState: 'failed',
      error: err instanceof Error ? err.message : String(err),
    };
  }

  if (input.skipEmbed) {
    return { ok: true, assetId, embeddingState: 'skipped' };
  }

  const embedded = await embedText(embedTextValue);
  if (!embedded) {
    await supabaseAdmin
      .from('depository_search_documents')
      .update({ embedding_state: 'pending', updated_at: new Date().toISOString() })
      .eq('asset_id', assetId);
    return { ok: true, assetId, embeddingState: 'pending' };
  }

  try {
    const { error: vecError } = await supabaseAdmin.from('depository_search_vectors').upsert(
      {
        asset_id: assetId,
        embedding: embedded.vector,
        model: embedded.model,
        dimensions: embedded.dimensions,
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
      return { ok: false, assetId, embeddingState: 'failed', error: vecError.message };
    }
    await supabaseAdmin
      .from('depository_search_documents')
      .update({ embedding_state: 'ready', updated_at: new Date().toISOString() })
      .eq('asset_id', assetId);
    return { ok: true, assetId, embeddingState: 'ready' };
  } catch (err) {
    return {
      ok: false,
      assetId,
      embeddingState: 'failed',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
