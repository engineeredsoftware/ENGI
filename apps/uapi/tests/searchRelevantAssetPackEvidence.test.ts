import { searchRelevantAssetPackEvidence } from '@bitcode/asset-packs-pipelines-syntheses-domain/tools/search';
import { supabaseAdmin } from '@bitcode/supabase';

jest.mock('exa-js', () => {
  return {
    __esModule: true,
    default: class {
      constructor() {}
      async search() { return { results: [] }; }
      async contents() { return { results: [] }; }
    },
  };
});

const mockEmbeddingsCreate = jest.fn();
const mockEmbeddingClient = {
  embeddings: {
    create: mockEmbeddingsCreate,
  },
};
/** Product depository embed dims (gte-small). */
const vector = (value: number) => Array(384).fill(value);

jest.mock('@bitcode/supabase', () => ({
  supabaseAdmin: {
    rpc: jest.fn(),
  }
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockEmbeddingsCreate.mockReset();
  (supabaseAdmin.rpc as jest.Mock).mockReset();
  delete process.env.BITCODE_ASSET_PACK_EVIDENCE_EMBEDDING_MODEL;
  delete process.env.BITCODE_DEFAULT_EMBEDDING_MODEL;
  delete process.env.BITCODE_DEPOSITORY_EMBEDDING_MODEL;
  delete process.env.BITCODE_DEPOSITORY_EMBEDDING_DIMENSIONS;
  delete process.env.BITCODE_ASSET_PACK_EVIDENCE_EMBEDDING_DIMENSIONS;
  delete process.env.BITCODE_DEFAULT_EMBEDDING_DIMENSIONS;
  process.env.OPENAI_API_KEY = 'fake';
});

describe('searchRelevantAssetPackEvidence', () => {
  it('embeds context and calls RPC with default pre-context count', async () => {
    const embedding = vector(0.1);
    mockEmbeddingsCreate.mockResolvedValue({ data: [{ embedding }] });
    (supabaseAdmin.rpc as jest.Mock).mockResolvedValue({
      data: [{ asset_pack_evidence_id: 'ape1', user_id: 'u1', output: 'out1', similarity: 0.2 }],
      error: null,
    });

    const results = await searchRelevantAssetPackEvidence({
      repoOwner: 'o', repoName: 'r', repoBranch: 'b', repoCommit: 'c', stage: 'pre-context', embeddingClient: mockEmbeddingClient
    });

    expect(mockEmbeddingsCreate).toHaveBeenCalledWith({
      model: 'gte-small',
      input: expect.stringContaining('Repository: o/r'),
      encoding_format: 'float',
    });
    // Physical RPC retained for Exchange-era storage; product vector policy is gte-small/384.
    expect(supabaseAdmin.rpc).toHaveBeenCalledWith('match_deliverable_vectors', { query_embedding: embedding, match_count: 5 });
    expect(results).toEqual([{
      assetPackEvidenceId: 'ape1',
      user_id: 'u1',
      output: 'out1',
      similarity: 0.2,
    }]);
  });

  it('uses count override for post-context', async () => {
    const embedding = vector(0.3);
    mockEmbeddingsCreate.mockResolvedValue({ data: [{ embedding }] });
    (supabaseAdmin.rpc as jest.Mock).mockResolvedValue({ data: [], error: null });

    await searchRelevantAssetPackEvidence({ repoOwner: 'o', repoName: 'r', repoBranch: 'b', repoCommit: 'c', stage: 'post-context', count: 2, embeddingClient: mockEmbeddingClient });
    expect(supabaseAdmin.rpc).toHaveBeenCalledWith('match_deliverable_vectors', { query_embedding: embedding, match_count: 2 });
  });

  it('allows an injected embedding client without a live provider key', async () => {
    delete process.env.OPENAI_API_KEY;
    process.env.BITCODE_ASSET_PACK_EVIDENCE_EMBEDDING_MODEL = 'bitcode-test-embedding-model';
    const embedding = vector(0.9);
    mockEmbeddingsCreate.mockResolvedValue({ data: [{ embedding }] });
    (supabaseAdmin.rpc as jest.Mock).mockResolvedValue({ data: [], error: null });

    await searchRelevantAssetPackEvidence({
      repoOwner: 'o',
      repoName: 'r',
      repoBranch: 'b',
      repoCommit: 'c',
      stage: 'pre-context',
      embeddingClient: mockEmbeddingClient,
    });

    expect(mockEmbeddingsCreate).toHaveBeenCalledWith({
      model: 'bitcode-test-embedding-model',
      input: expect.stringContaining('Repository: o/r'),
      encoding_format: 'float',
    });
    expect(supabaseAdmin.rpc).toHaveBeenCalledWith('match_deliverable_vectors', { query_embedding: embedding, match_count: 5 });
  });

  it('returns empty on RPC error', async () => {
    mockEmbeddingsCreate.mockResolvedValue({ data: [{ embedding: vector(0.4) }] });
    (supabaseAdmin.rpc as jest.Mock).mockResolvedValue({ data: null, error: new Error('rpc error') });

    const res = await searchRelevantAssetPackEvidence({ repoOwner: 'x', repoName: 'y', repoBranch: 'z', repoCommit: 'w', stage: 'pre-context', embeddingClient: mockEmbeddingClient });
    expect(res).toEqual([]);
  });

  it('fails closed when the embedding provider returns the wrong vector dimensions', async () => {
    mockEmbeddingsCreate.mockResolvedValue({ data: [{ embedding: [1, 2] }] });

    const res = await searchRelevantAssetPackEvidence({
      repoOwner: 'x',
      repoName: 'y',
      repoBranch: 'z',
      repoCommit: 'w',
      stage: 'pre-context',
      embeddingClient: mockEmbeddingClient,
    });

    expect(res).toEqual([]);
    expect(supabaseAdmin.rpc).not.toHaveBeenCalled();
  });
});
