/**
 * AssetPack evidence search for discovery-phase source-to-shares context.
 */
import { supabaseAdmin } from '@bitcode/supabase';
import { log } from '@bitcode/logger';
import 'openai/shims/node';
import OpenAI from 'openai';
import {
  ASSET_PACK_VECTOR_MATCH_RPC,
  buildOpenAIEmbeddingCreateParams,
  normalizeAssetPackEmbeddingVector,
  resolveAssetPackEmbeddingConfig,
  type OpenAIEmbeddingCreateParams,
} from '../embedding-config';

const PRE_CONTEXT_ASSET_PACK_EVIDENCE_COUNT = parseInt(
  process.env.BITCODE_PRE_CONTEXT_ASSET_PACK_EVIDENCE_COUNT ?? '5',
  10
);
const POST_CONTEXT_ASSET_PACK_EVIDENCE_COUNT = parseInt(
  process.env.BITCODE_POST_CONTEXT_ASSET_PACK_EVIDENCE_COUNT ?? '10',
  10
);
export interface AssetPackEvidenceEmbeddingClient {
  embeddings: {
    create(params: OpenAIEmbeddingCreateParams): Promise<{ data: Array<{ embedding: unknown }> }>;
  };
}

export async function searchRelevantAssetPackEvidence(params: {
  repoOwner: string;
  repoName: string;
  repoBranch: string;
  repoCommit: string;
  stage: 'pre-context' | 'post-context';
  count?: number;
  embeddingClient?: AssetPackEvidenceEmbeddingClient;
}): Promise<Array<{
  assetPackEvidenceId: string;
  user_id: string;
  output: string;
  similarity: number;
}>> {
  const { repoOwner, repoName, repoBranch, repoCommit, stage, count, embeddingClient } = params;

  log(`searchRelevantAssetPackEvidence for ${repoOwner}/${repoName}@${repoBranch} (${stage})`, 'info');

  if (!embeddingClient && !process.env.OPENAI_API_KEY) {
    log('OPENAI_API_KEY not set, cannot perform AssetPack evidence search', 'warn');
    return [];
  }

  const contextLines: string[] = [
    `Repository: ${repoOwner}/${repoName}`,
    `Branch: ${repoBranch}`,
    `Commit: ${repoCommit}`,
    `Stage: ${stage}`,
  ];
  const contextText = contextLines.join('\n');

  const embeddingConfig = resolveAssetPackEmbeddingConfig();
  const embeddings: AssetPackEvidenceEmbeddingClient =
    embeddingClient ?? (new OpenAI({ apiKey: process.env.OPENAI_API_KEY! }) as unknown as AssetPackEvidenceEmbeddingClient);
  let queryEmbedding: number[] | null;
  try {
    const embedRes = await embeddings.embeddings.create(
      buildOpenAIEmbeddingCreateParams(contextText, embeddingConfig)
    );
    queryEmbedding = normalizeAssetPackEmbeddingVector(embedRes.data?.[0]?.embedding, embeddingConfig);
  } catch (error) {
    log('searchRelevantAssetPackEvidence embedding error', 'error', { error });
    return [];
  }

  if (!queryEmbedding) {
    log('searchRelevantAssetPackEvidence missing or invalid embedding vector', 'warn', {
      expectedDimensions: embeddingConfig.dimensions,
      model: embeddingConfig.model,
    });
    return [];
  }

  const matchCount =
    count ??
    (stage === 'pre-context'
      ? PRE_CONTEXT_ASSET_PACK_EVIDENCE_COUNT
      : POST_CONTEXT_ASSET_PACK_EVIDENCE_COUNT);
  // Physical RPC name is retained Exchange storage detail; public code returns AssetPack evidence.
  const { data, error } = await supabaseAdmin.rpc(ASSET_PACK_VECTOR_MATCH_RPC, { query_embedding: queryEmbedding, match_count: matchCount });
  if (error) { log('searchRelevantAssetPackEvidence RPC error', 'error', { error }); return [];
  }

  return (data || []).map((row: any) => ({
    assetPackEvidenceId: row.asset_pack_evidence_id || row.deliverable_id,
    user_id: row.user_id,
    output: row.output,
    similarity: row.similarity,
  }));
}
