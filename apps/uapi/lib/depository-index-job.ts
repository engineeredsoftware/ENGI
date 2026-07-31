/**
 * Background depository search index job (V48).
 *
 * On AssetPack admission:
 * 1. Upsert source-safe structured row → depository_search_documents
 *    (commercial NL + absolute volumes/fixtures + material identity)
 * 2. Embed with open-source gte-small (384) via Supabase Edge Function
 * 3. Upsert vector → depository_search_vectors (Postgres + **pgvector**)
 *
 * Vector store law: product path is **pgvector** (user-facing Discovery latency).
 * Supabase Storage Vector Buckets are a later large-scale backend option only —
 * not product MVP (preview, slower ops profile per Supabase docs).
 *
 * Does **not** call OpenAI Embeddings API. Fail-soft when Edge/embed unconfigured.
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
import {
  absoluteFixturesCorpusText,
  extractAbsoluteFixturesFromMeasurements,
  type DepositoryAbsoluteFixture,
} from '@bitcode/asset-packs-pipelines-syntheses-domain/depository-absolute-fixtures';
import { bitcodeServerTelemetry } from '@/lib/bitcode-server-telemetry';

export type { DepositoryAbsoluteFixture };

/** Embed section budget (total ≤ 8000). Trim path then abs before NL. */
const EMBED_TOTAL_CAP = 8000;
const EMBED_NL_CAP = 3000;
const EMBED_ABS_CAP = 2500;
const EMBED_ID_CAP = 1500;
const EMBED_PATH_CAP = 800;
const EMBED_META_CAP = 400;

export type DepositoryIndexPackInput = {
  assetId: string;
  title?: string | null;
  summary?: string | null;
  /** Buyer-facing commercial title — primary semantic/lexical surface. */
  commercialTitle?: string | null;
  /** Buyer-facing commercial description — primary semantic/lexical body. */
  commercialDescription?: string | null;
  kind?: string | null;
  repositoryFullName?: string | null;
  lifecycle?: string | null;
  topics?: string[] | null;
  coveredSourcePaths?: string[] | null;
  absoluteKinds?: string[] | null;
  absoluteVolumes?: Record<string, number> | null;
  /**
   * Sparse absolute fixtures (label/descriptor/status). When omitted, derived
   * from absoluteVolumes only (kind:volume lines, no prose).
   */
  absoluteFixtures?: DepositoryAbsoluteFixture[] | null;
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

function clipSection(text: string, cap: number): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= cap) return t;
  return `${t.slice(0, Math.max(0, cap - 1)).trimEnd()}…`;
}

function normalizeFixtures(
  input: DepositoryIndexPackInput,
): DepositoryAbsoluteFixture[] {
  if (Array.isArray(input.absoluteFixtures) && input.absoluteFixtures.length > 0) {
    return input.absoluteFixtures
      .filter((f) => f && typeof f.measurementKind === 'string' && f.measurementKind.trim())
      .map((f) => ({
        measurementKind: String(f.measurementKind).trim().toLowerCase(),
        label: f.label ? String(f.label).trim() : undefined,
        descriptor: f.descriptor ? String(f.descriptor).trim() : undefined,
        volume: Number.isFinite(Number(f.volume)) ? Number(f.volume) : 0,
        status: f.status ? String(f.status).trim() : undefined,
        category: f.category ? String(f.category).trim() : undefined,
      }));
  }
  // Fallback: non-zero volumes only as bare kind:volume (no admit fixtures yet).
  const pairs = Object.entries(input.absoluteVolumes || {})
    .filter(([, v]) => Number.isFinite(Number(v)) && Number(v) > 0)
    .map(([k, v]) => ({
      measurementKind: k.toLowerCase(),
      volume: Number(v),
    }))
    .slice(0, 32);
  return pairs;
}

/**
 * Sectioned embed text. NL first (commercial preferred), then meta, abs fixtures,
 * material identity, paths. Total ≤ 8000. Never raw patch bodies.
 */
export function buildDepositoryEmbedText(input: DepositoryIndexPackInput): string {
  const nlTitle =
    asString(input.commercialTitle) || asString(input.title) || '';
  const nlBody =
    asString(input.commercialDescription) || asString(input.summary) || '';
  const nl = clipSection([nlTitle, nlBody].filter(Boolean).join(' '), EMBED_NL_CAP);

  const meta = clipSection(
    [
      input.kind,
      input.repositoryFullName,
      input.lifecycle,
      ...(input.topics || []),
    ]
      .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
      .join(' '),
    EMBED_META_CAP,
  );

  const fixtures = normalizeFixtures(input);
  // Non-zero volume pairs only (skip catalogue zeros in embed).
  const volumePairs = Object.entries(input.absoluteVolumes || {})
    .filter(([, v]) => Number.isFinite(Number(v)) && Number(v) > 0)
    .map(([k, v]) => `${k}:${Number(v).toFixed(3)}`)
    .slice(0, 40)
    .join(' ');
  const fixtureText = absoluteFixturesCorpusText(fixtures, EMBED_ABS_CAP);
  const abs = clipSection(
    [fixtureText, volumePairs].filter(Boolean).join(' '),
    EMBED_ABS_CAP,
  );

  const identityTokens = extractMaterialIdentityCorpusTokens(input.materialIdentity);
  const id = clipSection(identityTokens.join(' '), EMBED_ID_CAP);

  const pathTokens = asStringArray(input.coveredSourcePaths)
    .map((p) => p.split('/').pop() || p)
    .filter(Boolean)
    .slice(0, 40)
    .join(' ');
  const path = clipSection(pathTokens, EMBED_PATH_CAP);

  // Section markers for ops/debug (P1-A lite).
  const sections = [
    nl ? `§nl ${nl}` : '',
    meta ? `§meta ${meta}` : '',
    abs ? `§abs ${abs}` : '',
    id ? `§id ${id}` : '',
    path ? `§path ${path}` : '',
  ].filter(Boolean);

  let text = sections.join('\n');
  if (text.length > EMBED_TOTAL_CAP) {
    // Drop path first, then abs tail, keep NL.
    const withoutPath = sections.filter((s) => !s.startsWith('§path')).join('\n');
    text = withoutPath.length <= EMBED_TOTAL_CAP
      ? withoutPath
      : withoutPath.slice(0, EMBED_TOTAL_CAP);
  }
  return text.trim();
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
  const absoluteFixtures = normalizeFixtures({
    ...input,
    absoluteVolumes,
  });
  const commercialTitle = asString(input.commercialTitle);
  const commercialDescription = asString(input.commercialDescription);

  const embedInput: DepositoryIndexPackInput = {
    ...input,
    commercialTitle,
    commercialDescription,
    absoluteKinds,
    absoluteVolumes,
    absoluteFixtures,
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
    commercial_title: commercialTitle,
    commercial_description: commercialDescription,
    material_identity: materialIdentity,
    topics,
    absolute_kinds: absoluteKinds,
    absolute_volumes: absoluteVolumes,
    absolute_fixtures: absoluteFixtures,
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
    hasCommercialNl: Boolean(commercialTitle || commercialDescription),
    fixtureCount: absoluteFixtures.length,
    embedTextChars: embedTextValue.length,
  });

  if (input.skipEmbed) {
    return {
      ok: true,
      assetId,
      embeddingState: 'skipped',
      telemetry: {
        embedTextRoot,
        skipped: true,
        hasCommercialNl: Boolean(commercialTitle || commercialDescription),
        fixtureCount: absoluteFixtures.length,
      },
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
        hasCommercialNl: Boolean(commercialTitle || commercialDescription),
        fixtureCount: absoluteFixtures.length,
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
      store: 'supabase-pgvector',
      hasCommercialNl: Boolean(commercialTitle || commercialDescription),
      fixtureCount: absoluteFixtures.length,
    });
    return {
      ok: true,
      assetId,
      embeddingState: 'ready',
      telemetry: {
        embedTextRoot,
        embedSource: embedded.source,
        model: embedded.model,
        dimensions: embedded.dimensions,
        store: 'supabase-pgvector',
        hasCommercialNl: Boolean(commercialTitle || commercialDescription),
        fixtureCount: absoluteFixtures.length,
        embedTextChars: embedTextValue.length,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    bitcodeServerTelemetry('warn', 'depository-index', 'vector-upsert-error', {
      assetId,
      message,
    });
    return { ok: false, assetId, embeddingState: 'failed', error: message };
  }
}

// Re-export for admit/tests that extract fixtures without indexing.
export { extractAbsoluteFixturesFromMeasurements, absoluteFixturesCorpusText };
