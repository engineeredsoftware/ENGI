export const ASSET_PACK_EMBEDDING_PROVIDER = 'openai' as const;
export const DEFAULT_ASSET_PACK_EMBEDDING_MODEL = 'text-embedding-3-small' as const;
export const ASSET_PACK_VECTOR_DIMENSIONS = 1536 as const;
export const ASSET_PACK_EMBEDDING_INPUT_TOKEN_LIMIT = 8192 as const;
export const ASSET_PACK_EMBEDDING_ENCODING_FORMAT = 'float' as const;
export const ASSET_PACK_VECTOR_STORAGE_TABLE = 'deliverable_vectors' as const;
export const ASSET_PACK_VECTOR_STORAGE_COLUMN = 'embedding' as const;
export const ASSET_PACK_VECTOR_MATCH_RPC = 'match_deliverable_vectors' as const;
export const ASSET_PACK_VECTOR_DISTANCE_METRIC = 'cosine' as const;
export const ASSET_PACK_VECTOR_INDEX_METHOD = 'ivfflat' as const;
export const ASSET_PACK_VECTOR_OPERATOR_CLASS = 'vector_cosine_ops' as const;

export interface AssetPackEmbeddingConfig {
  provider: typeof ASSET_PACK_EMBEDDING_PROVIDER;
  model: string;
  dimensions: number;
  encodingFormat: typeof ASSET_PACK_EMBEDDING_ENCODING_FORMAT;
  inputTokenLimit: number;
  vectorStore: {
    table: typeof ASSET_PACK_VECTOR_STORAGE_TABLE;
    column: typeof ASSET_PACK_VECTOR_STORAGE_COLUMN;
    rpc: typeof ASSET_PACK_VECTOR_MATCH_RPC;
    distanceMetric: typeof ASSET_PACK_VECTOR_DISTANCE_METRIC;
    indexMethod: typeof ASSET_PACK_VECTOR_INDEX_METHOD;
    operatorClass: typeof ASSET_PACK_VECTOR_OPERATOR_CLASS;
  };
}

export interface OpenAIEmbeddingCreateParams {
  model: string;
  input: string;
  encoding_format: typeof ASSET_PACK_EMBEDDING_ENCODING_FORMAT;
  dimensions?: number;
}

export function supportsOpenAIEmbeddingDimensions(model: string): boolean {
  return model.startsWith('text-embedding-3-');
}

function firstEnvString(
  env: NodeJS.ProcessEnv,
  keys: readonly string[],
  fallback: string
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
  fallback: number
): number {
  for (const key of keys) {
    const parsed = Number.parseInt(env[key] ?? '', 10);
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
  }
  return fallback;
}

export function resolveAssetPackEmbeddingConfig(
  env: NodeJS.ProcessEnv = process.env,
  options?: {
    modelEnvKeys?: readonly string[];
    dimensionsEnvKeys?: readonly string[];
  }
): AssetPackEmbeddingConfig {
  const model = firstEnvString(
    env,
    options?.modelEnvKeys ?? [
      'BITCODE_ASSET_PACK_EVIDENCE_EMBEDDING_MODEL',
      'BITCODE_DEFAULT_EMBEDDING_MODEL',
    ],
    DEFAULT_ASSET_PACK_EMBEDDING_MODEL
  );
  const dimensions = firstEnvInteger(
    env,
    options?.dimensionsEnvKeys ?? [
      'BITCODE_ASSET_PACK_EVIDENCE_EMBEDDING_DIMENSIONS',
      'BITCODE_DEFAULT_EMBEDDING_DIMENSIONS',
    ],
    ASSET_PACK_VECTOR_DIMENSIONS
  );

  return {
    provider: ASSET_PACK_EMBEDDING_PROVIDER,
    model,
    dimensions,
    encodingFormat: ASSET_PACK_EMBEDDING_ENCODING_FORMAT,
    inputTokenLimit: ASSET_PACK_EMBEDDING_INPUT_TOKEN_LIMIT,
    vectorStore: {
      table: ASSET_PACK_VECTOR_STORAGE_TABLE,
      column: ASSET_PACK_VECTOR_STORAGE_COLUMN,
      rpc: ASSET_PACK_VECTOR_MATCH_RPC,
      distanceMetric: ASSET_PACK_VECTOR_DISTANCE_METRIC,
      indexMethod: ASSET_PACK_VECTOR_INDEX_METHOD,
      operatorClass: ASSET_PACK_VECTOR_OPERATOR_CLASS,
    },
  };
}

export function buildOpenAIEmbeddingCreateParams(
  input: string,
  config: AssetPackEmbeddingConfig = resolveAssetPackEmbeddingConfig()
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
  config: AssetPackEmbeddingConfig = resolveAssetPackEmbeddingConfig()
): number[] | null {
  if (!Array.isArray(value) || value.length !== config.dimensions) {
    return null;
  }

  const vector = value.map((entry) => Number(entry));
  return vector.every(Number.isFinite) ? vector : null;
}

export function buildAssetPackEmbeddingPolicy(
  config: AssetPackEmbeddingConfig = resolveAssetPackEmbeddingConfig()
) {
  return {
    provider: config.provider,
    model: config.model,
    dimensions: config.dimensions,
    encodingFormat: config.encodingFormat,
    inputTokenLimit: config.inputTokenLimit,
    vectorStore: config.vectorStore,
  };
}
