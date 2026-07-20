/**
 * Depository / AssetPack embedding policy.
 *
 * Product law (V48 Gate 5):
 * - **Store / index / query** = Supabase Postgres + pgvector only
 *   (`depository_search_documents` + `depository_search_vectors`)
 * - **Embed generation** = open-source **gte-small** (384 dims) via Supabase
 *   Edge Function (`Supabase.ai.Session`) — not OpenAI Embeddings API
 * - OpenAI remains allowed only for product LLM synthesis, not depository vectors
 *
 * Legacy Exchange `deliverable_vectors` / 1536 OpenAI path is deprecated fallback.
 */

/** Product embed provider id (open-source gte-small on Supabase). */
export const ASSET_PACK_EMBEDDING_PROVIDER = 'supabase-gte-small' as const;

/** Hugging Face / Supabase built-in model id. */
export const DEFAULT_ASSET_PACK_EMBEDDING_MODEL = 'gte-small' as const;

/** gte-small output dimensions (Supabase Edge AI + Transformers.js). */
export const ASSET_PACK_VECTOR_DIMENSIONS = 384 as const;

/** Soft cap on embed input characters (source-safe metadata only). */
export const ASSET_PACK_EMBEDDING_INPUT_TOKEN_LIMIT = 512 as const;

export const ASSET_PACK_EMBEDDING_ENCODING_FORMAT = 'float' as const;

/** @deprecated Exchange-era table; prefer depository_search_vectors. */
export const ASSET_PACK_VECTOR_STORAGE_TABLE = 'deliverable_vectors' as const;
export const ASSET_PACK_VECTOR_STORAGE_COLUMN = 'embedding' as const;
/** @deprecated Prefer MATCH_DEPOSITORY_ASSET_PACK_VECTORS_RPC. */
export const ASSET_PACK_VECTOR_MATCH_RPC = 'match_deliverable_vectors' as const;

/** Product depository index (admitted AssetPacks). */
export const DEPOSITORY_SEARCH_DOCUMENTS_TABLE = 'depository_search_documents' as const;
export const DEPOSITORY_SEARCH_VECTORS_TABLE = 'depository_search_vectors' as const;
export const MATCH_DEPOSITORY_ASSET_PACK_VECTORS_RPC =
  'match_depository_asset_pack_vectors' as const;

export const ASSET_PACK_VECTOR_DISTANCE_METRIC = 'cosine' as const;
export const ASSET_PACK_VECTOR_INDEX_METHOD = 'ivfflat' as const;
export const ASSET_PACK_VECTOR_OPERATOR_CLASS = 'vector_cosine_ops' as const;

export type AssetPackEmbeddingProviderId =
  | typeof ASSET_PACK_EMBEDDING_PROVIDER
  | 'openai'; // deprecated depository path only

export interface AssetPackEmbeddingConfig {
  provider: AssetPackEmbeddingProviderId;
  model: string;
  dimensions: number;
  encodingFormat: typeof ASSET_PACK_EMBEDDING_ENCODING_FORMAT;
  inputTokenLimit: number;
  vectorStore: {
    table: string;
    column: string;
    rpc: string;
    distanceMetric: typeof ASSET_PACK_VECTOR_DISTANCE_METRIC;
    indexMethod: typeof ASSET_PACK_VECTOR_INDEX_METHOD;
    operatorClass: typeof ASSET_PACK_VECTOR_OPERATOR_CLASS;
  };
}

/** @deprecated OpenAI Embeddings API — not used for depository index/search. */
export interface OpenAIEmbeddingCreateParams {
  model: string;
  input: string;
  encoding_format: typeof ASSET_PACK_EMBEDDING_ENCODING_FORMAT;
  dimensions?: number;
}

/** @deprecated Prefer gte-small product path. */
export function supportsOpenAIEmbeddingDimensions(model: string): boolean {
  return model.startsWith('text-embedding-3-');
}

function firstEnvString(
  env: NodeJS.ProcessEnv,
  keys: readonly string[],
  fallback: string,
): string {
  for (const key of keys) {
    const value = env[key]?.trim();
    if (value) return value;
  }
  return fallback;
}

function firstEnvInteger(
  env: NodeJS.ProcessEnv,
  keys: readonly string[],
  fallback: number,
): number {
  for (const key of keys) {
    const parsed = Number.parseInt(env[key] ?? '', 10);
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
  }
  return fallback;
}

/**
 * Resolve product embedding config for depository index + search.
 * Defaults: supabase-gte-small / gte-small / 384 / product tables + RPC.
 */
export function resolveAssetPackEmbeddingConfig(
  env: NodeJS.ProcessEnv = process.env,
  options?: {
    modelEnvKeys?: readonly string[];
    dimensionsEnvKeys?: readonly string[];
  },
): AssetPackEmbeddingConfig {
  const model = firstEnvString(
    env,
    options?.modelEnvKeys ?? [
      'BITCODE_DEPOSITORY_EMBEDDING_MODEL',
      'BITCODE_ASSET_PACK_EVIDENCE_EMBEDDING_MODEL',
      'BITCODE_DEFAULT_EMBEDDING_MODEL',
    ],
    DEFAULT_ASSET_PACK_EMBEDDING_MODEL,
  );
  const dimensions = firstEnvInteger(
    env,
    options?.dimensionsEnvKeys ?? [
      'BITCODE_DEPOSITORY_EMBEDDING_DIMENSIONS',
      'BITCODE_ASSET_PACK_EVIDENCE_EMBEDDING_DIMENSIONS',
      'BITCODE_DEFAULT_EMBEDDING_DIMENSIONS',
    ],
    ASSET_PACK_VECTOR_DIMENSIONS,
  );

  return {
    provider: ASSET_PACK_EMBEDDING_PROVIDER,
    model,
    dimensions,
    encodingFormat: ASSET_PACK_EMBEDDING_ENCODING_FORMAT,
    inputTokenLimit: ASSET_PACK_EMBEDDING_INPUT_TOKEN_LIMIT,
    vectorStore: {
      table: DEPOSITORY_SEARCH_VECTORS_TABLE,
      column: ASSET_PACK_VECTOR_STORAGE_COLUMN,
      rpc: MATCH_DEPOSITORY_ASSET_PACK_VECTORS_RPC,
      distanceMetric: ASSET_PACK_VECTOR_DISTANCE_METRIC,
      indexMethod: ASSET_PACK_VECTOR_INDEX_METHOD,
      operatorClass: ASSET_PACK_VECTOR_OPERATOR_CLASS,
    },
  };
}

/**
 * @deprecated OpenAI Embeddings request shape — not used for depository path.
 * Retained for legacy evidence scripts only.
 */
export function buildOpenAIEmbeddingCreateParams(
  input: string,
  config: AssetPackEmbeddingConfig = resolveAssetPackEmbeddingConfig(),
): OpenAIEmbeddingCreateParams {
  return {
    model: config.model,
    input,
    encoding_format: config.encodingFormat,
    ...(supportsOpenAIEmbeddingDimensions(config.model)
      ? { dimensions: config.dimensions }
      : {}),
  };
}

export function normalizeAssetPackEmbeddingVector(
  value: unknown,
  config: AssetPackEmbeddingConfig = resolveAssetPackEmbeddingConfig(),
): number[] | null {
  if (!Array.isArray(value) || value.length !== config.dimensions) {
    return null;
  }

  const vector = value.map((entry) => Number(entry));
  return vector.every(Number.isFinite) ? vector : null;
}

export function buildAssetPackEmbeddingPolicy(
  config: AssetPackEmbeddingConfig = resolveAssetPackEmbeddingConfig(),
) {
  return {
    provider: config.provider,
    model: config.model,
    dimensions: config.dimensions,
    encodingFormat: config.encodingFormat,
    inputTokenLimit: config.inputTokenLimit,
    vectorStore: config.vectorStore,
    store: 'supabase-pgvector' as const,
  };
}
