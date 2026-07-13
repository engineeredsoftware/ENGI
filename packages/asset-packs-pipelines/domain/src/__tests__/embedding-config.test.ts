import {
  ASSET_PACK_VECTOR_DIMENSIONS,
  buildAssetPackEmbeddingPolicy,
  buildOpenAIEmbeddingCreateParams,
  normalizeAssetPackEmbeddingVector,
  resolveAssetPackEmbeddingConfig,
} from '../embedding-config';

describe('AssetPack embedding configuration', () => {
  it('uses the canonical OpenAI embedding model and 1536-dimension vector store contract', () => {
    const config = resolveAssetPackEmbeddingConfig({});

    expect(config.model).toBe('text-embedding-3-small');
    expect(config.dimensions).toBe(ASSET_PACK_VECTOR_DIMENSIONS);
    expect(config.encodingFormat).toBe('float');
    expect(config.inputTokenLimit).toBe(8192);
    expect(config.vectorStore).toEqual({
      table: 'deliverable_vectors',
      column: 'embedding',
      rpc: 'match_deliverable_vectors',
      distanceMetric: 'cosine',
      indexMethod: 'ivfflat',
      operatorClass: 'vector_cosine_ops',
    });
  });

  it('builds dimension-bound OpenAI embedding requests for third-generation models', () => {
    expect(buildOpenAIEmbeddingCreateParams('query', resolveAssetPackEmbeddingConfig({}))).toEqual({
      model: 'text-embedding-3-small',
      input: 'query',
      encoding_format: 'float',
      dimensions: 1536,
    });
  });

  it('validates vectors against the configured storage dimensions', () => {
    const config = resolveAssetPackEmbeddingConfig({});
    expect(normalizeAssetPackEmbeddingVector(Array(1536).fill(0.1), config)).toHaveLength(1536);
    expect(normalizeAssetPackEmbeddingVector([0.1], config)).toBeNull();
    expect(normalizeAssetPackEmbeddingVector(Array(1536).fill(Number.NaN), config)).toBeNull();
  });

  it('emits a serializable policy for search evidence', () => {
    expect(buildAssetPackEmbeddingPolicy(resolveAssetPackEmbeddingConfig({}))).toMatchObject({
      provider: 'openai',
      model: 'text-embedding-3-small',
      dimensions: 1536,
      vectorStore: {
        rpc: 'match_deliverable_vectors',
      },
    });
  });
});
