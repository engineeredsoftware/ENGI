/**
 * Discovery wave-2 agent: search-depository-for-read-need-fits.
 *
 * Runs **after** parallel codebase comprehension + inherent regurgitation so
 * queries can use wave-1 grounding (especially comprehend-codebase).
 *
 * Read purpose: find Depository AssetPacks that **fit the accepted Need**
 * (fits-finding). Deposit relevance search is a different product agent.
 *
 * Plan: synthesize Need-fit search queries from wave-1 comprehension, Need
 * (Setup), sourceCheckoutCatalog, and related signals.
 * Try: call depository-asset-pack-search (embeddings policy + lexical rank).
 * Refine/Retry: source-safe Need-fit guidance for Implementation.
 */

import { factoryPTRRAgent } from '@bitcode/agent-generics';
import { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { z } from 'zod';
import { storeCrossPhaseArtifact } from '@bitcode/asset-packs-pipelines-syntheses-domain/synthesize-asset-packs';
import { resolveSourceCheckoutCatalog } from '@bitcode/asset-packs-pipelines-syntheses-domain/resolve-source-checkout-catalog';
import { runDepositDepositoryAssetPackSearch } from '@bitcode/asset-packs-pipelines-syntheses-domain/tools/deposit-depository-asset-pack-search';
import { buildDepositorySearchQueryPlan } from '@bitcode/asset-packs-pipelines-syntheses-domain/tools/depository-search-query-plan';
import { depositDepositoryAssetPackSearchTool } from '@bitcode/asset-packs-pipelines-syntheses-domain/tools/DepositDepositoryAssetPackSearchTool';

const part = (content: string): PromptPart => content as PromptPart;

const DepositorySearchInputSchema = z.object({
  repository: z.any().optional(),
  inventory: z.any().optional(),
  sourceCheckoutCatalog: z.any().optional(),
  need: z.any().optional(),
  expressedRead: z.string().optional(),
});

const NeedFitGuidanceSchema = z.object({
  summary: z.string(),
  needFitTopics: z.array(z.string()).optional(),
  candidateFitNotes: z.array(z.string()).optional(),
  gapTopics: z.array(z.string()).optional(),
  readabilityNotes: z.array(z.string()).optional(),
  /** Queries used for Depository search (Plan output, echoed for audit). */
  searchQueries: z.array(z.string()).optional(),
});

const DepositorySearchOutputSchema = z.object({
  guidance: NeedFitGuidanceSchema,
  searchQueries: z.array(z.string()).optional(),
});

export type ReadNeedFitGuidance = z.infer<typeof NeedFitGuidanceSchema>;

const IDENTITY = part(
  'You are Discovery search-depository-for-read-need-fits. You run after codebase ' +
    'comprehension and inherent regurgitation. Search the Bitcode Depository for settled ' +
    'AssetPacks that **fit the accepted Need** for this read synthesis run. Build search ' +
    'queries from wave-1 comprehension signals, the Need / expressed Read, and ' +
    'sourceCheckoutCatalog. Be source-safe. This is Need-fit (fits-finding) search — not ' +
    'deposit relevance search.',
);

const REQUIREMENTS = part(
  'From the Need (or expressedRead), repository coordinates, sourceCheckoutCatalog, and ' +
    'wave-1 discovery signals, derive: summary (how Depository supply may fit this Need), ' +
    'needFitTopics, candidateFitNotes, gapTopics (Need facets under-served by supply), ' +
    'readabilityNotes, and searchQueries (3-12 short query terms/phrases for vector/lexical ' +
    'Depository search targeting Need-fits). Return ONLY {"guidance": {...}, "searchQueries": [...]} ' +
    'or {"guidance": {..., "searchQueries": [...]}}.',
);

const PLAN = part(
  'Plan: use wave-1 codebase comprehension and inherent regurgitation plus the accepted Need ' +
    'and sourceCheckoutCatalog to synthesize Depository search queries that retrieve AssetPacks ' +
    'that **fit the Need** (fits-finding).',
);
const TRY = part(
  'Try: produce Need-fit guidance and the searchQueries list the Depository search tool will run.',
);
const REFINE = part(
  'Refine: ensure queries and guidance are Need-grounded, comprehension-grounded, and source-safe.',
);
const RETRY = part(
  'Retry: return minimal Need-fit guidance and broad Need-derived searchQueries rather than failing.',
);

function createPrompt(): Prompt {
  const prompt = new Prompt();
  prompt.set('agent:identity', IDENTITY);
  prompt.set('agent:requirements', REQUIREMENTS);
  prompt.set('ptrr:plan', PLAN);
  prompt.set('ptrr:try', TRY);
  prompt.set('ptrr:refine', REFINE);
  prompt.set('ptrr:retry', RETRY);
  prompt.require('agent:identity');
  prompt.require('agent:requirements');
  prompt.requirePattern('ptrr:*');
  return prompt;
}

const prompt = createPrompt();

export const ReadDepositorySearchForNeedFitsAgent = factoryPTRRAgent<
  z.infer<typeof DepositorySearchInputSchema>,
  z.infer<typeof DepositorySearchOutputSchema>
>({
  name: 'ReadDepositorySearchForNeedFitsAgent',
  description:
    'Discovery wave-2: search Depository for Need-fitting AssetPacks; query plan after codebase comprehension.',
  outputSchema: DepositorySearchOutputSchema,
  tools: ['depository-asset-pack-search'],
  prompt,
  stepPrompts: {
    plan: () => prompt,
    try: () => prompt,
    refine: () => prompt,
    retry: () => prompt,
  },
  plan: { chunkThreshold: 2000 },
  try: { chunkThreshold: 4000 },
  refine: { maxAttempts: 2 },
  retry: { maxAttempts: 1 },
});

function findValue(execution: any, namespace: string, key: string): any {
  const local = execution?.get?.(namespace, key);
  if (local !== undefined) return local;
  return execution?.findUp?.(namespace, key);
}

function resolveNeed(execution: any, input: any): unknown {
  return (
    input?.need ??
    input?.readNeed ??
    findValue(execution, 'setup', 'need') ??
    findValue(execution, 'setup', 'readNeed') ??
    findValue(execution, 'pipeline', 'need') ??
    findValue(execution, 'pipeline', 'expressedRead') ??
    input?.expressedRead ??
    null
  );
}

function needToText(need: unknown): string {
  if (typeof need === 'string') return need;
  if (need && typeof need === 'object') {
    return [
      (need as any).summary,
      (need as any).title,
      (need as any).text,
      (need as any).expressedRead,
      (need as any).need,
    ]
      .filter(Boolean)
      .join(' ');
  }
  return '';
}

/** Need-first query plan — full phrase + tokens; paths secondary. */
function defaultQueriesFromNeed(input: {
  catalog?: any;
  need?: unknown;
  expressedRead?: string | null;
  repository?: any;
}): string[] {
  return buildDepositorySearchQueryPlan({
    needText: needToText(input.need),
    expressedRead: input.expressedRead,
    repositoryFullName:
      input.repository?.fullName ||
      input.repository?.repositoryFullName ||
      input.repository?.name ||
      null,
    paths: Array.isArray(input.catalog?.paths) ? input.catalog.paths : [],
    product: 'read-need-fits',
    maxTerms: 12,
  });
}

export default async function runReadDepositorySearchForNeedFitsAgent(input: any, execution: any) {
  const repository =
    input?.repository ??
    findValue(execution, 'pipeline', 'repository') ??
    findValue(execution, 'deposit', 'repository') ??
    {};
  const catalog = resolveSourceCheckoutCatalog(execution, input?.sourceCheckoutCatalog);
  const need = resolveNeed(execution, input);
  const expressedRead =
    (typeof input?.expressedRead === 'string' && input.expressedRead) ||
    findValue(execution, 'pipeline', 'expressedRead') ||
    (typeof need === 'string' ? need : null);
  const settledAssets =
    input?.depositoryAssets ??
    findValue(execution, 'depository', 'settledAssets') ??
    findValue(execution, 'deposit', 'settledDepositoryAssets') ??
    [];

  const { projectInventoryForPrompt } = await import('@bitcode/asset-packs-pipelines-syntheses-domain/asset-packs-synthesis');
  const catalogForPrompt = projectInventoryForPrompt(catalog);

  try {
    (execution as any)?.tools?.registerTool?.(
      'depository-asset-pack-search',
      depositDepositoryAssetPackSearchTool,
    );
  } catch {}

  const raw = await ReadDepositorySearchForNeedFitsAgent(
    {
      ...input,
      repository,
      sourceCheckoutCatalog: catalogForPrompt,
      inventoryPaths: catalogForPrompt?.paths ?? catalog?.paths,
      need,
      expressedRead,
    },
    execution,
  );
  const result = (raw as any)?.finalOutput ?? (raw as any)?.output ?? raw;

  let guidance: ReadNeedFitGuidance = (result as any)?.guidance ?? {
    summary:
      'No Need-fit guidance derived; frame synthesized packs from the accepted Need and checkout until Depository hits exist.',
    needFitTopics: [],
    candidateFitNotes: [],
    gapTopics: [],
    readabilityNotes: [],
  };

  const modelQueries = asTerms(
    (result as any)?.searchQueries ?? (guidance as any)?.searchQueries,
  );
  const fallbackQueries = defaultQueriesFromNeed({
    catalog: catalogForPrompt || catalog,
    need,
    expressedRead,
    repository,
  });
  const searchQueries = modelQueries.length > 0 ? modelQueries : fallbackQueries;

  let toolResult: any = null;
  try {
    const supabase =
      findValue(execution, 'pipeline', 'supabase') ||
      findValue(execution, 'deposit', 'supabase') ||
      undefined;
    const embedQuery =
      findValue(execution, 'pipeline', 'embedQuery') ||
      findValue(execution, 'deposit', 'embedQuery') ||
      undefined;
    const {
      prepareDepositoryAssetsForSearch,
      absoluteKindQueryHints,
    } = await import('@bitcode/asset-packs-pipelines-syntheses-domain/depository-search');
    const assets = prepareDepositoryAssetsForSearch(
      Array.isArray(settledAssets) ? settledAssets : [],
    );
    // Need-fit: do not hard-filter the corpus by absolute kinds (Need may not
    // name them). Still normalize facets onto assets and enrich query terms so
    // hybrid re-rank + lexical can exploit measured material.
    const absHints = absoluteKindQueryHints(assets, 4);
    const mergedQueries = [
      ...new Set([...searchQueries, ...absHints.map((k) => `absolute ${k}`)]),
    ].slice(0, 16);
    toolResult = await runDepositDepositoryAssetPackSearch({
      queryTerms: mergedQueries,
      // Multi-query fan-out: each planned query retrieves independently, then union.
      queries: mergedQueries,
      needText: needToText(need),
      expressedRead: typeof expressedRead === 'string' ? expressedRead : null,
      product: 'read-need-fits',
      paths: catalogForPrompt?.paths ?? catalog?.paths ?? [],
      assets,
      maxResults: 16,
      maxPerQuery: 8,
      repositoryFullName: repository.fullName || repository.repositoryFullName,
      supabase,
      embedQuery,
    });
    storeCrossPhaseArtifact(execution, 'discovery', 'depositorySearchToolResult', toolResult);
    storeCrossPhaseArtifact(
      execution,
      'discovery',
      'depositorySearchTelemetry',
      toolResult?.telemetry || null,
    );
    storeCrossPhaseArtifact(execution, 'tools', 'depository-asset-pack-search', {
      hitCount: toolResult?.hitCount,
      queryTerms: toolResult?.queryTerms,
      queries: toolResult?.queries,
      vectorStore: toolResult?.vectorStore,
      embeddingPolicy: toolResult?.embeddingPolicy,
      product: 'read-need-fits',
      telemetry: toolResult?.telemetry || null,
    });
    try {
      const t = toolResult?.telemetry;
      if (t && typeof (execution as any)?.emit === 'function') {
        (execution as any).emit('status', {
          message: `depository-search: product=${t.product} queries=${t.queryCount} hits=${t.hitCount} corpus=${t.assetCorpusAfterFilters} vector=${t.vector.status} top=${
            t.topHits[0]?.title || t.topHits[0]?.assetId || 'none'
          } ${t.durationMs}ms`,
        });
      }
    } catch {
      /* optional */
    }

    if (toolResult?.underservedTopics?.length) {
      guidance = {
        ...guidance,
        gapTopics: [
          ...new Set([...(guidance.gapTopics || []), ...toolResult.underservedTopics]),
        ],
        searchQueries,
      };
    } else {
      guidance = { ...guidance, searchQueries };
    }
    if (toolResult?.hits?.length && !guidance.needFitTopics?.length) {
      guidance = {
        ...guidance,
        needFitTopics: toolResult.hits
          .map((h: any) => h.title)
          .filter(Boolean)
          .slice(0, 8),
      };
    }
  } catch {
    guidance = { ...guidance, searchQueries };
  }

  // Shared discovery keys so Validation / Implementation dual-read the same store.
  storeCrossPhaseArtifact(execution, 'discovery', 'depositorySearch', guidance);
  storeCrossPhaseArtifact(execution, 'discovery', 'depositorySearchQueries', searchQueries);
  storeCrossPhaseArtifact(execution, 'discovery', 'depositorySearchProduct', 'read-need-fits');

  return { ...(input || {}), success: true, guidance, searchQueries, toolResult };
}

function asTerms(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((t) => String(t || '').trim()).filter(Boolean))];
}
