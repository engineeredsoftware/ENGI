import { searchRelevantEvidenceDocuments } from '../lib/search';
import OpenAI from 'openai';
import { supabaseAdmin } from '@bitcode/supabase';

// Mock OpenAI embeddings
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    embeddings: {
      create: jest.fn().mockResolvedValue({
      data: [{ embedding: Array(1536).fill(0.1) }]
      })
    }
  }));
});

// Mock Supabase RPC
jest.mock('@bitcode/supabase', () => ({
  supabaseAdmin: {
    rpc: jest.fn().mockResolvedValue({
      data: [
        {
          template_id: 'template-1',
          title: 'Evidence Document One',
          description: 'First Evidence Document template',
          content: 'Evidence Document content here',
          similarity: 0.123
        }
      ],
      error: null
    })
  }
}));

describe('searchRelevantEvidenceDocuments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.BITCODE_EVIDENCE_DOCUMENT_EMBEDDING_MODEL;
    delete process.env.BITCODE_DEFAULT_EMBEDDING_MODEL;
  });

  it('embeds the query and calls the Supabase RPC to return Evidence Document suggestions', async () => {
    process.env.OPENAI_API_KEY = 'fake';
    const results = await searchRelevantEvidenceDocuments({
      repoOwner: 'owner',
      repoName: 'repo',
      repoBranch: 'branch',
      repoCommit: 'commit',
      stage: 'pre-context'
    });
    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      id: 'template-1',
      title: 'Evidence Document One',
      description: 'First Evidence Document template',
      content: 'Evidence Document content here',
      similarity: 0.123
    });
    expect(OpenAI).toHaveBeenCalledWith({ apiKey: 'fake' });
    expect((OpenAI as unknown as jest.Mock).mock.results[0].value.embeddings.create).toHaveBeenCalledWith({
      model: 'text-embedding-3-small',
      input: expect.stringContaining('Repository: owner/repo'),
      encoding_format: 'float',
      dimensions: 1536,
    });
    expect(supabaseAdmin.rpc).toHaveBeenCalledWith(
      'match_ai_document_templates',
      expect.objectContaining({ match_count: expect.any(Number) })
    );
  });

  it('fails closed when no embedding provider is configured', async () => {
    delete process.env.OPENAI_API_KEY;

    const results = await searchRelevantEvidenceDocuments({
      repoOwner: 'owner',
      repoName: 'repo',
      repoBranch: 'branch',
      repoCommit: 'commit',
      stage: 'pre-context'
    });

    expect(results).toEqual([]);
    expect(OpenAI).not.toHaveBeenCalled();
    expect(supabaseAdmin.rpc).not.toHaveBeenCalled();
  });
});
