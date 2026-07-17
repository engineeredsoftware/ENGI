/**
 * Pure Depository AssetPack search (no Tool base class).
 * Used by Deposit/Read Discovery search agents and unit tests.
 *
 * Supports deposit-relevants and read-need-fits products. Need text should be
 * passed (or folded into queryTerms via buildDepositorySearchQueryPlan) so
 * Reading with Needs retrieves fit-aligned settled packs.
 */

import {
  buildAssetPackEmbeddingPolicy,
  buildOpenAIEmbeddingCreateParams,
  normalizeAssetPackEmbeddingVector,
  resolveAssetPackEmbeddingConfig,
} from '@bitcode/asset-packs-pipelines-syntheses-domain/embedding-config';
import {
  searchDepositoryAssetSpace,
  type DepositoryAsset,
  type DepositorySearchResult,
} from '@bitcode/asset-packs-pipelines-syntheses-domain/depository-search';
import {
  buildDepositorySearchQueryPlan,
  type DepositorySearchProduct,
} from './depository-search-query-plan';

export type DepositDepositorySearchToolInput = {
  queryTerms?: string[];
  /** Free-text Need / demand — folded into query plan when present. */
  needText?: string | null;
  expressedRead?: string | null;
  /** Product lens for query plan + read framing. */
  product?: DepositorySearchProduct;
  paths?: string[] | null;
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

/**
 * Lexical score with phrase bonus: multi-word Need phrases weigh more than
 * single path-stem tokens so Need-fit ranking prefers semantic matches.
 */
function lexicalScore(
  asset: DepositoryAsset,
  terms: string[],
): { score: number; matched: string[] } {
  if (!terms.length) return { score: 0, matched: [] };
  const blob = JSON.stringify(asset || {}).toLowerCase();
  let weightSum = 0;
  let matchedWeight = 0;
  const matched: string[] = [];
  for (const term of terms) {
    const t = term.toLowerCase();
    const isPhrase = /\s/.test(term) || term.length > 24;
    const w = isPhrase ? 2.5 : 1;
    weightSum += w;
    if (blob.includes(t)) {
      matchedWeight += w;
      matched.push(term);
    }
  }
  return {
    score: weightSum > 0 ? matchedWeight / weightSum : 0,
    matched,
  };
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
  const product: DepositorySearchProduct =
    input.product ||
    (input.needText || input.expressedRead ? 'read-need-fits' : 'deposit-relevants');
  const explicitTerms = asTerms(input?.queryTerms);
  // Prefer explicit model terms when present; else build from Need/paths.
  const queryTerms =
    explicitTerms.length > 0
      ? explicitTerms
      : buildDepositorySearchQueryPlan({
          queryTerms: explicitTerms,
          needText: input.needText,
          expressedRead: input.expressedRead,
          repositoryFullName: input.repositoryFullName,
          paths: input.paths,
          product,
        });
  // When both Need and explicit terms exist, ensure Need phrase is in the plan.
  const withNeed =
    explicitTerms.length > 0 && (input.needText || input.expressedRead)
      ? buildDepositorySearchQueryPlan({
          queryTerms: explicitTerms,
          needText: input.needText,
          expressedRead: input.expressedRead,
          repositoryFullName: input.repositoryFullName,
          paths: input.paths,
          product,
        })
      : queryTerms;
  const finalTerms = withNeed.length > 0 ? withNeed : queryTerms;

  const embeddingPolicy = buildAssetPackEmbeddingPolicy(
    resolveAssetPackEmbeddingConfig(env),
  );
  const maxResults = Math.max(1, Math.min(40, Number(input?.maxResults) || 12));
  const assets = Array.isArray(input?.assets) ? input.assets : [];

  const defaultPrompt =
    product === 'read-need-fits'
      ? 'read need-fit depository search'
      : 'deposit supply demand framing';
  // Shape expected by depository-search-run (normalize accepts partials).
  const read = {
    prompt: finalTerms.join(' ; ') || defaultPrompt,
    expressed_read: finalTerms.join(' ; '),
    primary_intent: finalTerms[0] || defaultPrompt,
    satisfaction_criteria: finalTerms.slice(0, 8),
    repositoryFullName: input?.repositoryFullName || null,
    targetArtifactKinds: ['asset-pack'],
    closureCriteria: finalTerms.slice(0, 6),
    failureModes: [],
    product,
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
      const { matched } = lexicalScore(c as DepositoryAsset, finalTerms);
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
      const { score, matched } = lexicalScore(asset, finalTerms);
      // Slightly lower threshold when a multi-word Need phrase matched.
      const threshold = matched.some((m) => /\s/.test(m) || m.length > 24)
        ? 0.15
        : 0.25;
      if (score >= threshold) {
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
  if (vectorEnabled && finalTerms.length > 0) {
    const embedFn = input.embedQuery || ((text: string) => defaultEmbedQuery(text, env));
    // Embed Need-first terms (phrase + tokens) for better Need-fit vector recall.
    const vector = await embedFn(finalTerms.slice(0, 6).join(' '));
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
              matchedTerms: existing?.matchedTerms || finalTerms.slice(0, 3),
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
  const underservedTopics = finalTerms.filter(
    (term) => !hitBlob.includes(term.toLowerCase()),
  );
  const saturatedTopics = finalTerms.filter((term) =>
    hitBlob.includes(term.toLowerCase()),
  );

  return {
    success: true,
    embeddingPolicy,
    queryTerms: finalTerms,
    queryPlan: finalTerms,
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

export {
  buildDepositorySearchQueryPlan,
  extractNeedPrimaryPhrase,
  tokenizeSearchTerms,
} from './depository-search-query-plan';
export type { DepositorySearchProduct } from './depository-search-query-plan';
