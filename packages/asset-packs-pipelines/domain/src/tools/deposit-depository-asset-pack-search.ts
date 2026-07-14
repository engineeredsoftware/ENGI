/**
 * Pure deposit Depository AssetPack search (no Tool base class).
 * Used by DepositDepositoryAssetPackSearchTool and unit tests.
 */

import {
  buildAssetPackEmbeddingPolicy,
  buildOpenAIEmbeddingCreateParams,
  normalizeAssetPackEmbeddingVector,
  resolveAssetPackEmbeddingConfig,
} from '../embedding-config';
import {
  searchDepositoryAssetSpace,
  type DepositoryAsset,
  type DepositorySearchResult,
} from '../depository-search';

export type DepositDepositorySearchToolInput = {
  queryTerms: string[];
  assets?: DepositoryAsset[];
  maxResults?: number;
  repositoryFullName?: string;
  supabase?: {
    rpc: (
      fn: string,
      args: Record<string, unknown>,
    ) => Promise<{ data: unknown; error: unknown }>;
  };
  embedQuery?: (text: string) => Promise<number[] | null>;
  env?: NodeJS.ProcessEnv;
};

export type DepositDepositorySearchHit = {
  assetId: string;
  title: string | null;
  finalScore: number | null;
  semanticScore: number | null;
  matchedTerms: string[];
  channel: 'lexical' | 'vector' | 'hybrid';
};

export type DepositDepositorySearchToolResult = {
  success: boolean;
  embeddingPolicy: ReturnType<typeof buildAssetPackEmbeddingPolicy>;
  queryTerms: string[];
  queryPlan: string[];
  hitCount: number;
  hits: DepositDepositorySearchHit[];
  underservedTopics: string[];
  saturatedTopics: string[];
  vectorStore: {
    table: string;
    rpc: string;
    distanceMetric: string;
    status: 'policy-declared' | 'lexical-only' | 'vector-matched' | 'hybrid';
  };
  searchResult: DepositorySearchResult | null;
};

function asTerms(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((t) => String(t || '').trim()).filter(Boolean))];
}

function lexicalScore(
  asset: DepositoryAsset,
  terms: string[],
): { score: number; matched: string[] } {
  const blob = JSON.stringify(asset || {}).toLowerCase();
  const matched = terms.filter((t) => blob.includes(t.toLowerCase()));
  return { score: terms.length ? matched.length / terms.length : 0, matched };
}

async function defaultEmbedQuery(
  text: string,
  env: NodeJS.ProcessEnv,
): Promise<number[] | null> {
  const key = env.OPENAI_API_KEY?.trim() || env.BITCODE_OPENAI_API_KEY?.trim();
  if (!key) return null;
  const config = resolveAssetPackEmbeddingConfig(env);
  const body = buildOpenAIEmbeddingCreateParams(text.slice(0, 8000), config);
  try {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: Array<{ embedding?: unknown }> };
    return normalizeAssetPackEmbeddingVector(json?.data?.[0]?.embedding, config);
  } catch {
    return null;
  }
}

export async function runDepositDepositoryAssetPackSearch(
  input: DepositDepositorySearchToolInput,
): Promise<DepositDepositorySearchToolResult> {
  const env = input.env || process.env;
  const queryTerms = asTerms(input?.queryTerms);
  const embeddingPolicy = buildAssetPackEmbeddingPolicy(
    resolveAssetPackEmbeddingConfig(env),
  );
  const maxResults = Math.max(1, Math.min(40, Number(input?.maxResults) || 12));
  const assets = Array.isArray(input?.assets) ? input.assets : [];

  // Shape expected by depository-search-run (normalize accepts partials).
  const read = {
    prompt: queryTerms.join(' ; ') || 'deposit supply demand framing',
    expressed_read: queryTerms.join(' ; '),
    primary_intent: queryTerms[0] || 'deposit supply demand framing',
    satisfaction_criteria: queryTerms.slice(0, 8),
    repositoryFullName: input?.repositoryFullName || null,
    targetArtifactKinds: ['asset-pack'],
    closureCriteria: queryTerms.slice(0, 6),
    failureModes: [],
  };

  let searchResult: DepositorySearchResult | null = null;
  const hitMap = new Map<string, DepositDepositorySearchHit>();

  if (assets.length > 0) {
    searchResult = await searchDepositoryAssetSpace({
      read: read as any,
      assets,
      thresholds: {
        semanticScore: 0.1,
        reviewScore: 0.15,
        worthyScore: 0.25,
        maxSelectedCandidates: maxResults,
      },
      createdAt: new Date().toISOString(),
    });
    for (const candidate of searchResult.selectedCandidates || []) {
      const c = candidate as any;
      const id = String(c?.assetId || '');
      if (!id) continue;
      const { matched } = lexicalScore(c as DepositoryAsset, queryTerms);
      hitMap.set(id, {
        assetId: id,
        title: c?.title ?? null,
        finalScore: c?.ranking?.finalScore ?? null,
        semanticScore: c?.ranking?.semanticScore ?? null,
        matchedTerms: matched,
        channel: 'lexical',
      });
    }
    for (const asset of assets) {
      const id = String((asset as any)?.assetId || '');
      if (!id || hitMap.has(id)) continue;
      const { score, matched } = lexicalScore(asset, queryTerms);
      if (score >= 0.25) {
        hitMap.set(id, {
          assetId: id,
          title: (asset as any)?.title ?? null,
          finalScore: score,
          semanticScore: score,
          matchedTerms: matched,
          channel: 'lexical',
        });
      }
    }
  }

  let vectorStatus: DepositDepositorySearchToolResult['vectorStore']['status'] =
    assets.length > 0 ? 'lexical-only' : 'policy-declared';
  const vectorEnabled = env.BITCODE_DEPOSITORY_VECTOR_SEARCH === '1';
  if (vectorEnabled && queryTerms.length > 0) {
    const embedFn = input.embedQuery || ((text: string) => defaultEmbedQuery(text, env));
    const vector = await embedFn(queryTerms.join(' '));
    if (vector && input.supabase?.rpc) {
      try {
        const { data, error } = await input.supabase.rpc(embeddingPolicy.vectorStore.rpc, {
          query_embedding: vector,
          match_count: maxResults,
        });
        if (!error && Array.isArray(data)) {
          for (const row of data as any[]) {
            const id = String(row?.asset_id || row?.id || row?.assetId || '');
            if (!id) continue;
            const existing = hitMap.get(id);
            const semanticScore =
              typeof row?.similarity === 'number'
                ? row.similarity
                : typeof row?.score === 'number'
                  ? row.score
                  : null;
            hitMap.set(id, {
              assetId: id,
              title: row?.title ?? existing?.title ?? null,
              finalScore: semanticScore ?? existing?.finalScore,
              semanticScore: semanticScore ?? existing?.semanticScore,
              matchedTerms: existing?.matchedTerms || queryTerms.slice(0, 3),
              channel: existing ? 'hybrid' : 'vector',
            });
          }
          vectorStatus = hitMap.size > 0 && assets.length > 0 ? 'hybrid' : 'vector-matched';
        }
      } catch {
        /* keep lexical / policy */
      }
    }
  }

  const hits = [...hitMap.values()]
    .sort(
      (a, b) =>
        (b.finalScore ?? 0) - (a.finalScore ?? 0) || a.assetId.localeCompare(b.assetId),
    )
    .slice(0, maxResults);

  const hitBlob = hits
    .map((h) => `${h.title || ''} ${h.matchedTerms.join(' ')}`)
    .join(' ')
    .toLowerCase();
  const underservedTopics = queryTerms.filter(
    (term) => !hitBlob.includes(term.toLowerCase()),
  );
  const saturatedTopics = queryTerms.filter((term) =>
    hitBlob.includes(term.toLowerCase()),
  );

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
      status: vectorStatus,
    },
    searchResult,
  };
}
