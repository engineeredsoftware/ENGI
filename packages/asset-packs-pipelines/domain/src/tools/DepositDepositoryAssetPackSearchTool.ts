/**
 * Depository AssetPack search tool (deposit Discovery).
 *
 * Searches settled Bitcode Depository supply with lexical ranking + embedding
 * policy (vector store declared). Plan-step queries from the deposit run
 * (source paths, obfuscations, measurements, demand) drive the search so
 * Implementation can synthesize high-likelihood-of-demand packs.
 */

import { Tool } from '@bitcode/tools-generics';
import { buildAssetPackEmbeddingPolicy } from '../embedding-config';
import {
  searchDepositoryAssetSpace,
  type DepositoryAsset,
  type DepositorySearchResult,
} from '../depository-search';

export type DepositDepositorySearchToolInput = {
  /** Search queries synthesized in Plan from this run's source + obfuscations + demand. */
  queryTerms: string[];
  /** Optional settled supply corpus (Host/execution-provided). */
  assets?: DepositoryAsset[];
  /** Soft cap on returned hits. */
  maxResults?: number;
  repositoryFullName?: string;
};

export type DepositDepositorySearchToolResult = {
  success: boolean;
  embeddingPolicy: ReturnType<typeof buildAssetPackEmbeddingPolicy>;
  queryTerms: string[];
  queryPlan: string[];
  hitCount: number;
  hits: Array<{
    assetId: string;
    title: string | null;
    finalScore: number | null;
    semanticScore: number | null;
    matchedTerms: string[];
  }>;
  underservedTopics: string[];
  saturatedTopics: string[];
  vectorStore: {
    table: string;
    rpc: string;
    distanceMetric: string;
    status: 'policy-declared' | 'searched';
  };
  searchResult: DepositorySearchResult | null;
};

function asTerms(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((t) => String(t || '').trim()).filter(Boolean))];
}

/**
 * @doc-tool
 * name: "depository-asset-pack-search"
 * category: "depository-search"
 */
export class DepositDepositoryAssetPackSearchTool extends Tool<
  (input: DepositDepositorySearchToolInput) => Promise<DepositDepositorySearchToolResult>
> {
  name = 'depository-asset-pack-search';

  use = async (input: DepositDepositorySearchToolInput): Promise<DepositDepositorySearchToolResult> => {
    const queryTerms = asTerms(input?.queryTerms);
    const embeddingPolicy = buildAssetPackEmbeddingPolicy();
    const maxResults = Math.max(1, Math.min(40, Number(input?.maxResults) || 12));
    const assets = Array.isArray(input?.assets) ? input.assets : [];

    // Synthetic read-shaped query object so shared depository ranker can score supply.
    const read = {
      expressed_read: queryTerms.join(' ; '),
      primary_intent: queryTerms[0] || 'deposit supply demand framing',
      satisfaction_criteria: queryTerms.slice(0, 8),
      repositoryFullName: input?.repositoryFullName || null,
    };

    let searchResult: DepositorySearchResult | null = null;
    let hits: DepositDepositorySearchToolResult['hits'] = [];

    if (assets.length > 0) {
      searchResult = await searchDepositoryAssetSpace({
        read: read as any,
        assets,
        thresholds: {
          semanticScore: 0.15,
          reviewScore: 0.2,
          worthyScore: 0.35,
          maxSelectedCandidates: maxResults,
        },
        createdAt: new Date().toISOString(),
      });
      const selected = searchResult.selectedCandidates || [];
      hits = selected.slice(0, maxResults).map((candidate: any) => ({
        assetId: String(candidate?.assetId || ''),
        title: candidate?.title ?? null,
        finalScore: candidate?.ranking?.finalScore ?? null,
        semanticScore: candidate?.ranking?.semanticScore ?? null,
        matchedTerms: Array.isArray(candidate?.recall?.matchedTerms)
          ? candidate.recall.matchedTerms
          : queryTerms.filter((term) =>
              JSON.stringify(candidate || {})
                .toLowerCase()
                .includes(term.toLowerCase()),
            ),
      }));
    }

    // Topics appearing in queries but not well covered by hits → underserved signal.
    const hitBlob = hits.map((h) => `${h.title || ''} ${h.matchedTerms.join(' ')}`).join(' ').toLowerCase();
    const underservedTopics = queryTerms.filter((term) => !hitBlob.includes(term.toLowerCase()));
    const saturatedTopics = queryTerms.filter((term) => hitBlob.includes(term.toLowerCase()));

    return {
      success: true,
      embeddingPolicy,
      queryTerms,
      queryPlan: queryTerms,
      hitCount: hits.length,
      hits,
      underservedTopics,
      saturatedTopics,
      vectorStore: {
        table: embeddingPolicy.vectorStore.table,
        rpc: embeddingPolicy.vectorStore.rpc,
        distanceMetric: embeddingPolicy.vectorStore.distanceMetric,
        status: assets.length > 0 ? 'searched' : 'policy-declared',
      },
      searchResult,
    };
  };
}

export const depositDepositoryAssetPackSearchTool = new DepositDepositoryAssetPackSearchTool();
(depositDepositoryAssetPackSearchTool as any).name = 'depository-asset-pack-search';
