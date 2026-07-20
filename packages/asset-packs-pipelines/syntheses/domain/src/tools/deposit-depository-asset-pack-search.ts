/**
 * Pure Depository AssetPack search (no Tool base class).
 * Used by Deposit/Read Discovery search agents and unit tests.
 *
 * Multi-query hybrid (Supabase toolkit shape):
 *  - Keyword/lexical (+ optional static filters) over in-memory DepositoryAsset[]
 *  - Semantic vector via Supabase pgvector RPC (gte-small 384 embeddings)
 *  - Fan-out: each query independent; hits union by assetId (max score)
 *
 * Embed generation: open-source gte-small via Edge (not OpenAI Embeddings API).
 * Products: deposit-relevants | read-need-fits (query plan framing only).
 */

import {
  buildAssetPackEmbeddingPolicy,
  MATCH_DEPOSITORY_ASSET_PACK_VECTORS_RPC,
  resolveAssetPackEmbeddingConfig,
} from '@bitcode/asset-packs-pipelines-syntheses-domain/embedding-config';
import { embedDepositoryTextVector } from '@bitcode/asset-packs-pipelines-syntheses-domain/depository-embed';
import {
  searchDepositoryAssetSpace,
  type DepositoryAsset,
  type DepositorySearchResult,
} from '@bitcode/asset-packs-pipelines-syntheses-domain/depository-search';
import {
  buildDepositorySearchQueryPlan,
  type DepositorySearchProduct,
} from './depository-search-query-plan';

export type DepositoryStaticFilters = {
  kinds?: string[] | null;
  repositories?: string[] | null;
  lifecycle?: string[] | null;
  absoluteKinds?: string[] | null;
};

export type DepositDepositorySearchToolInput = {
  queryTerms?: string[];
  /**
   * Multi-query fan-out. When present, each query is searched independently
   * and hits are unioned (max score). Prefer this for read Need-fits.
   */
  queries?: string[] | null;
  /** Free-text Need / demand — folded into query plan when present. */
  needText?: string | null;
  expressedRead?: string | null;
  /** Product lens for query plan + read framing. */
  product?: DepositorySearchProduct;
  paths?: string[] | null;
  assets?: DepositoryAsset[];
  /** Optional static field filters (kind / repo / lifecycle / absolute kinds). */
  staticFilters?: DepositoryStaticFilters | null;
  maxResults?: number;
  /** Cap per individual query before union (default 8). */
  maxPerQuery?: number;
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
  channel: 'lexical' | 'vector' | 'hybrid' | 'static';
  /** Queries that contributed to this hit (multi-query audit). */
  matchedQueries?: string[];
};

/**
 * Source-safe search quality telemetry for pipeline/stream debug
 * (deposit relevants + read Need-fits). No raw source; scores + ids only.
 */
export type DepositorySearchQualityTelemetry = {
  schema: 'bitcode.depository.search-quality-telemetry';
  product: DepositorySearchProduct;
  repositoryFullName: string | null;
  queryCount: number;
  queries: string[];
  needTextPreview: string | null;
  assetCorpusSize: number;
  assetCorpusAfterFilters: number;
  hitCount: number;
  topHits: Array<{
    assetId: string;
    title: string | null;
    finalScore: number | null;
    semanticScore: number | null;
    channel: string;
    matchedQueries: string[];
    matchedTerms: string[];
  }>;
  channelCounts: Record<string, number>;
  underservedTopics: string[];
  saturatedTopics: string[];
  vector: {
    enabled: boolean;
    status: string;
    rpc: string;
    embedProvider: string;
    embedModel: string;
    embedDimensions: number;
    queriesEmbedded: number;
    queriesEmbedFailed: number;
    store: 'supabase-pgvector';
  };
  durationMs: number;
  resultState: string | null;
};

export type DepositDepositorySearchToolResult = {
  success: boolean;
  embeddingPolicy: ReturnType<typeof buildAssetPackEmbeddingPolicy>;
  queryTerms: string[];
  queryPlan: string[];
  /** Distinct queries that were fanned out. */
  queries: string[];
  queryCount: number;
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
  /** Extensive search quality telemetry for real deposit/read debugging. */
  telemetry: DepositorySearchQualityTelemetry;
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

function applyStaticFilters(
  assets: DepositoryAsset[],
  filters: DepositoryStaticFilters | null | undefined,
): DepositoryAsset[] {
  if (!filters) return assets;
  const kinds = asTerms(filters.kinds).map((k) => k.toLowerCase());
  const repos = asTerms(filters.repositories).map((r) => r.toLowerCase());
  const lifecycles = asTerms(filters.lifecycle).map((l) => l.toLowerCase());
  const absoluteKinds = asTerms(filters.absoluteKinds).map((k) => k.toLowerCase());
  if (!kinds.length && !repos.length && !lifecycles.length && !absoluteKinds.length) {
    return assets;
  }
  return assets.filter((asset) => {
    const meta = (asset.metadata || {}) as Record<string, unknown>;
    if (kinds.length) {
      const kind = String(asset.artifactKind || asset.artifactType || '').toLowerCase();
      if (!kinds.some((k) => kind.includes(k))) return false;
    }
    if (repos.length) {
      const repo = String(asset.repositoryFullName || '').toLowerCase();
      if (!repos.some((r) => repo.includes(r))) return false;
    }
    if (lifecycles.length) {
      const life = String(meta.lifecycleState || '').toLowerCase();
      if (!lifecycles.some((l) => life.includes(l))) return false;
    }
    if (absoluteKinds.length) {
      const listed = Array.isArray(meta.absoluteKinds)
        ? (meta.absoluteKinds as unknown[]).map((k) => String(k).toLowerCase())
        : [];
      if (!absoluteKinds.some((k) => listed.includes(k))) return false;
    }
    return true;
  });
}

function mergeHit(
  hitMap: Map<string, DepositDepositorySearchHit>,
  next: DepositDepositorySearchHit,
  query: string,
): void {
  const existing = hitMap.get(next.assetId);
  if (!existing) {
    hitMap.set(next.assetId, {
      ...next,
      matchedQueries: [query],
    });
    return;
  }
  const existingScore = existing.finalScore ?? 0;
  const nextScore = next.finalScore ?? 0;
  const matchedQueries = [
    ...new Set([...(existing.matchedQueries || []), query]),
  ];
  if (nextScore > existingScore) {
    hitMap.set(next.assetId, {
      ...next,
      matchedTerms: [...new Set([...existing.matchedTerms, ...next.matchedTerms])],
      matchedQueries,
      channel:
        existing.channel === 'vector' || next.channel === 'vector'
          ? existing.channel === 'lexical' || next.channel === 'lexical'
            ? 'hybrid'
            : next.channel
          : next.channel === 'hybrid' || existing.channel === 'hybrid'
            ? 'hybrid'
            : next.channel,
    });
  } else {
    hitMap.set(next.assetId, {
      ...existing,
      matchedTerms: [...new Set([...existing.matchedTerms, ...next.matchedTerms])],
      matchedQueries,
      // Multi-query agreement boost (capped).
      finalScore: Math.min(
        1,
        existingScore + 0.03 * Math.max(0, matchedQueries.length - 1),
      ),
      channel:
        existing.channel === 'lexical' && next.channel === 'vector'
          ? 'hybrid'
          : existing.channel,
    });
  }
}

/** Default embed: Supabase Edge gte-small (384) — never OpenAI Embeddings API. */
async function defaultEmbedQuery(
  text: string,
  env: NodeJS.ProcessEnv,
): Promise<number[] | null> {
  return embedDepositoryTextVector(text, env);
}

/**
 * Build the list of distinct queries to fan out.
 * Prefer explicit `queries`; else treat each queryTerm as a query when many;
 * else a single merged plan.
 */
function resolveQueries(input: DepositDepositorySearchToolInput, finalTerms: string[]): string[] {
  const explicit = asTerms(input.queries);
  if (explicit.length > 0) return explicit.slice(0, 12);
  // Fan-out: each substantial term/phrase is its own query (read multi-query law).
  if (finalTerms.length >= 2) {
    return finalTerms.slice(0, 12);
  }
  return finalTerms.length ? finalTerms : [];
}

export async function runDepositDepositoryAssetPackSearch(
  input: DepositDepositorySearchToolInput,
): Promise<DepositDepositorySearchToolResult> {
  const startedAt = Date.now();
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
  const queries = resolveQueries(input, finalTerms);

  const embeddingPolicy = buildAssetPackEmbeddingPolicy(
    resolveAssetPackEmbeddingConfig(env),
  );
  const maxResults = Math.max(1, Math.min(40, Number(input?.maxResults) || 12));
  const maxPerQuery = Math.max(1, Math.min(20, Number(input?.maxPerQuery) || 8));
  const rawAssets = Array.isArray(input?.assets) ? input.assets : [];
  const assets = applyStaticFilters(rawAssets, input.staticFilters);

  const defaultPrompt =
    product === 'read-need-fits'
      ? 'read need-fit depository search'
      : 'deposit supply demand framing';

  let searchResult: DepositorySearchResult | null = null;
  const hitMap = new Map<string, DepositDepositorySearchHit>();
  const fanout = queries.length > 0 ? queries : [finalTerms.join(' ') || defaultPrompt];

  // ---- Lexical multi-query over in-memory assets ----
  if (assets.length > 0) {
    // Full-plan rank once for ranking evidence root (and single-query path).
    const fullRead = {
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
    searchResult = await searchDepositoryAssetSpace({
      read: fullRead as any,
      assets,
      thresholds: {
        semanticScore: 0.1,
        reviewScore: 0.15,
        worthyScore: 0.25,
        maxSelectedCandidates: maxResults,
      },
      createdAt: new Date().toISOString(),
    });
    // When explicit multi-query is provided, rely on per-query fan-out only so
    // soft full-plan ranks do not dilute the hit set with weak matches.
    const explicitMultiQuery = asTerms(input.queries).length > 0;
    if (!explicitMultiQuery) {
      for (const candidate of searchResult.selectedCandidates || []) {
        const c = candidate as any;
        const id = String(c?.assetId || '');
        if (!id) continue;
        const { matched } = lexicalScore(c as DepositoryAsset, finalTerms);
        mergeHit(
          hitMap,
          {
            assetId: id,
            title: c?.title ?? null,
            finalScore: c?.ranking?.finalScore ?? null,
            semanticScore: c?.ranking?.semanticScore ?? null,
            matchedTerms: matched,
            channel: 'lexical',
          },
          finalTerms[0] || defaultPrompt,
        );
      }
    }

    for (const query of fanout) {
      const terms = query
        .split(/[;\n]+/)
        .map((t) => t.trim())
        .filter(Boolean);
      const scoreTerms = terms.length > 1 ? terms : [query];
      const perQuery: DepositDepositorySearchHit[] = [];
      for (const asset of assets) {
        const id = String((asset as any)?.assetId || '');
        if (!id) continue;
        const { score, matched } = lexicalScore(asset, scoreTerms);
        const threshold = matched.some((m) => /\s/.test(m) || m.length > 24)
          ? 0.12
          : 0.2;
        if (score >= threshold) {
          perQuery.push({
            assetId: id,
            title: (asset as any)?.title ?? null,
            finalScore: score,
            semanticScore: score,
            matchedTerms: matched,
            channel: 'lexical',
          });
        }
      }
      perQuery
        .sort(
          (a, b) =>
            (b.finalScore ?? 0) - (a.finalScore ?? 0) ||
            a.assetId.localeCompare(b.assetId),
        )
        .slice(0, maxPerQuery)
        .forEach((hit) => mergeHit(hitMap, hit, query));
    }
  }

  // ---- Vector multi-query (optional, Supabase pgvector) ----
  let vectorStatus: DepositDepositorySearchToolResult['vectorStore']['status'] =
    assets.length > 0 ? 'lexical-only' : 'policy-declared';
  const vectorEnabled = env.BITCODE_DEPOSITORY_VECTOR_SEARCH === '1';
  let queriesEmbedded = 0;
  let queriesEmbedFailed = 0;
  if (vectorEnabled && fanout.length > 0) {
    const embedFn = input.embedQuery || ((text: string) => defaultEmbedQuery(text, env));
    // Product RPC only (gte-small 384); no legacy OpenAI deliverable path.
    const rpcName =
      embeddingPolicy.vectorStore.rpc || MATCH_DEPOSITORY_ASSET_PACK_VECTORS_RPC;
    const vectorQueries = fanout.slice(0, 6);
    for (const query of vectorQueries) {
      const vector = await embedFn(query);
      if (!vector) {
        queriesEmbedFailed += 1;
        continue;
      }
      queriesEmbedded += 1;
      if (!input.supabase?.rpc) continue;
      try {
        const { data, error } = await input.supabase.rpc(rpcName, {
          query_embedding: vector,
          match_count: maxPerQuery,
        });
        if (error || !Array.isArray(data)) continue;
        for (const row of data as any[]) {
          const id = String(
            row?.asset_id || row?.deliverable_id || row?.id || row?.assetId || '',
          );
          if (!id) continue;
          const semanticScore =
            typeof row?.similarity === 'number'
              ? row.similarity
              : typeof row?.score === 'number'
                ? row.score
                : null;
          mergeHit(
            hitMap,
            {
              assetId: id,
              title: row?.title ?? null,
              finalScore: semanticScore,
              semanticScore,
              matchedTerms: [query],
              channel: 'vector',
            },
            query,
          );
        }
        vectorStatus =
          hitMap.size > 0 && assets.length > 0 ? 'hybrid' : 'vector-matched';
      } catch {
        /* keep lexical */
      }
    }
  }

  const hits = [...hitMap.values()]
    .sort(
      (a, b) =>
        (b.finalScore ?? 0) - (a.finalScore ?? 0) ||
        (b.matchedQueries?.length ?? 0) - (a.matchedQueries?.length ?? 0) ||
        a.assetId.localeCompare(b.assetId),
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

  const channelCounts: Record<string, number> = {};
  for (const h of hits) {
    channelCounts[h.channel] = (channelCounts[h.channel] || 0) + 1;
  }

  const needPreview =
    typeof input.needText === 'string' && input.needText.trim()
      ? input.needText.trim().slice(0, 160)
      : typeof input.expressedRead === 'string' && input.expressedRead.trim()
        ? input.expressedRead.trim().slice(0, 160)
        : null;

  const telemetry: DepositorySearchQualityTelemetry = {
    schema: 'bitcode.depository.search-quality-telemetry',
    product,
    repositoryFullName: input.repositoryFullName || null,
    queryCount: fanout.length,
    queries: fanout,
    needTextPreview: needPreview,
    assetCorpusSize: rawAssets.length,
    assetCorpusAfterFilters: assets.length,
    hitCount: hits.length,
    topHits: hits.slice(0, 12).map((h) => ({
      assetId: h.assetId,
      title: h.title,
      finalScore: h.finalScore,
      semanticScore: h.semanticScore,
      channel: h.channel,
      matchedQueries: h.matchedQueries || [],
      matchedTerms: h.matchedTerms.slice(0, 8),
    })),
    channelCounts,
    underservedTopics,
    saturatedTopics,
    vector: {
      enabled: vectorEnabled,
      status: vectorStatus,
      rpc: embeddingPolicy.vectorStore.rpc,
      embedProvider: String(embeddingPolicy.provider),
      embedModel: embeddingPolicy.model,
      embedDimensions: embeddingPolicy.dimensions,
      queriesEmbedded,
      queriesEmbedFailed,
      store: 'supabase-pgvector',
    },
    durationMs: Date.now() - startedAt,
    resultState:
      typeof (searchResult as { resultState?: string } | null)?.resultState === 'string'
        ? (searchResult as { resultState: string }).resultState
        : hits.length > 0
          ? 'hits'
          : 'no_hits',
  };

  return {
    success: true,
    embeddingPolicy,
    queryTerms: finalTerms,
    queryPlan: finalTerms,
    queries: fanout,
    queryCount: fanout.length,
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
    telemetry,
  };
}

export {
  buildDepositorySearchQueryPlan,
  extractNeedPrimaryPhrase,
  tokenizeSearchTerms,
} from './depository-search-query-plan';
export type { DepositorySearchProduct } from './depository-search-query-plan';
