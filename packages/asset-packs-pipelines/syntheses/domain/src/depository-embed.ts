/**
 * Depository embed client (domain package) — gte-small via Supabase Edge.
 *
 * No OpenAI Embeddings API. Used by search tool default path and can be
 * re-exported from uapi. Store remains Supabase pgvector (separate upsert).
 */

import {
  ASSET_PACK_VECTOR_DIMENSIONS,
  DEFAULT_ASSET_PACK_EMBEDDING_MODEL,
  normalizeAssetPackEmbeddingVector,
  resolveAssetPackEmbeddingConfig,
} from './embedding-config';

export type DepositoryEmbedResult = {
  embedding: number[];
  model: string;
  dimensions: number;
  provider: string;
  source: 'edge' | 'mock';
};

function resolveEmbedUrl(env: NodeJS.ProcessEnv): string | null {
  const explicit = env.BITCODE_DEPOSITORY_EMBED_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');
  const base =
    env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    env.SUPABASE_URL?.trim() ||
    env.BITCODE_SUPABASE_URL?.trim();
  if (!base) return null;
  return `${base.replace(/\/$/, '')}/functions/v1/embed`;
}

function resolveAuthBearer(env: NodeJS.ProcessEnv): string | null {
  return (
    env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    env.BITCODE_SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    env.SUPABASE_ANON_KEY?.trim() ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    null
  );
}

/**
 * Embed source-safe text with gte-small (384d) via Supabase Edge Function.
 * Returns null when unconfigured or mock mode (search/index fail-soft).
 */
export async function embedDepositoryText(
  text: string,
  env: NodeJS.ProcessEnv = process.env,
): Promise<DepositoryEmbedResult | null> {
  const input = String(text || '').trim().slice(0, 8000);
  if (!input) return null;

  const mode = (env.BITCODE_DEPOSITORY_EMBED_MODE || 'edge').trim().toLowerCase();
  if (mode === 'mock' || mode === 'off') return null;

  const url = resolveEmbedUrl(env);
  const bearer = resolveAuthBearer(env);
  if (!url || !bearer) return null;

  const config = resolveAssetPackEmbeddingConfig(env);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${bearer}`,
        apikey: bearer,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input }),
      // Node 18+ / modern runtimes; ignore if AbortSignal.timeout missing
      ...(typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
        ? { signal: AbortSignal.timeout(20_000) }
        : {}),
    });
    if (!res.ok) return null;
    const json = (await res.json().catch(() => null)) as {
      embedding?: unknown;
      model?: string;
      dimensions?: number;
      provider?: string;
    } | null;
    const embedding = normalizeAssetPackEmbeddingVector(json?.embedding, config);
    if (!embedding) return null;
    return {
      embedding,
      model:
        typeof json?.model === 'string' && json.model
          ? json.model
          : DEFAULT_ASSET_PACK_EMBEDDING_MODEL,
      dimensions:
        typeof json?.dimensions === 'number' && json.dimensions > 0
          ? json.dimensions
          : ASSET_PACK_VECTOR_DIMENSIONS,
      provider:
        typeof json?.provider === 'string' && json.provider
          ? json.provider
          : 'supabase-gte-small',
      source: 'edge',
    };
  } catch {
    return null;
  }
}

export async function embedDepositoryTextVector(
  text: string,
  env: NodeJS.ProcessEnv = process.env,
): Promise<number[] | null> {
  const result = await embedDepositoryText(text, env);
  return result?.embedding ?? null;
}
