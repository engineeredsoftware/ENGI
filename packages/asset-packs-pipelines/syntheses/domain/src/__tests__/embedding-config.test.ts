import {
  ASSET_PACK_VECTOR_DIMENSIONS,
  DEPOSITORY_SEARCH_DOCUMENTS_TABLE,
  DEPOSITORY_SEARCH_VECTORS_TABLE,
  DEFAULT_ASSET_PACK_EMBEDDING_MODEL,
  MATCH_DEPOSITORY_ASSET_PACK_VECTORS_RPC,
  ASSET_PACK_EMBEDDING_PROVIDER,
  buildAssetPackEmbeddingPolicy,
  normalizeAssetPackEmbeddingVector,
  resolveAssetPackEmbeddingConfig,
} from '../embedding-config';

describe('AssetPack embedding configuration (Supabase pgvector + gte-small)', () => {
  it('defaults to supabase-gte-small / 384 / product store + RPC', () => {
    const config = resolveAssetPackEmbeddingConfig({});

    expect(config.provider).toBe(ASSET_PACK_EMBEDDING_PROVIDER);
    expect(config.provider).toBe('supabase-gte-small');
    expect(config.model).toBe(DEFAULT_ASSET_PACK_EMBEDDING_MODEL);
    expect(config.model).toBe('gte-small');
    expect(config.dimensions).toBe(ASSET_PACK_VECTOR_DIMENSIONS);
    expect(config.dimensions).toBe(384);
    expect(config.vectorStore).toEqual({
      table: DEPOSITORY_SEARCH_VECTORS_TABLE,
      column: 'embedding',
      rpc: MATCH_DEPOSITORY_ASSET_PACK_VECTORS_RPC,
      distanceMetric: 'cosine',
      indexMethod: 'ivfflat',
      operatorClass: 'vector_cosine_ops',
    });
  });

  it('declares product depository index table + match RPC constants', () => {
    expect(DEPOSITORY_SEARCH_DOCUMENTS_TABLE).toBe('depository_search_documents');
    expect(DEPOSITORY_SEARCH_VECTORS_TABLE).toBe('depository_search_vectors');
    expect(MATCH_DEPOSITORY_ASSET_PACK_VECTORS_RPC).toBe(
      'match_depository_asset_pack_vectors',
    );
  });

  it('validates vectors against 384-d gte-small dimensions', () => {
    const config = resolveAssetPackEmbeddingConfig({});
    expect(normalizeAssetPackEmbeddingVector(Array(384).fill(0.1), config)).toHaveLength(384);
    expect(normalizeAssetPackEmbeddingVector(Array(1536).fill(0.1), config)).toBeNull();
    expect(normalizeAssetPackEmbeddingVector([0.1], config)).toBeNull();
  });

  it('emits serializable policy with supabase-pgvector store marker', () => {
    expect(buildAssetPackEmbeddingPolicy(resolveAssetPackEmbeddingConfig({}))).toMatchObject({
      provider: 'supabase-gte-small',
      model: 'gte-small',
      dimensions: 384,
      store: 'supabase-pgvector',
      vectorStore: {
        rpc: 'match_depository_asset_pack_vectors',
        table: 'depository_search_vectors',
      },
    });
  });
});
