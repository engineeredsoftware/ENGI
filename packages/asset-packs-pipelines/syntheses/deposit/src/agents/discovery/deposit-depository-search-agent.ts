/**
 * Discovery wave-2 agent: search-depository-for-deposit-relevants.
 *
 * Runs **after** parallel codebase comprehension + inherent regurgitation so
 * queries can use wave-1 grounding (especially comprehend-codebase).
 *
 * Deposit purpose: find **relevant** settled Depository supply / demand
 * alignment for this deposit synthesis run (not Need-fits — that is read).
 *
 * Plan: synthesize search queries from wave-1 signals, sourceCheckoutCatalog,
 * obfuscations, measurements, and demand context.
 * Try: call depository-asset-pack-search (embeddings policy + lexical rank).
 * Refine/Retry: source-safe demand/relevance guidance for Implementation.
 */

import { factoryPTRRAgent } from '@bitcode/agent-generics';
import { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { z } from 'zod';
import { storeCrossPhaseArtifact } from '@bitcode/asset-packs-pipelines-syntheses-domain/synthesize-asset-packs';
import { resolveSourceCheckoutCatalog } from '@bitcode/asset-packs-pipelines-syntheses-domain/resolve-source-checkout-catalog';
import { runDepositDepositoryAssetPackSearch } from '@bitcode/asset-packs-pipelines-syntheses-domain/tools/deposit-depository-asset-pack-search';
import { depositDepositoryAssetPackSearchTool } from '@bitcode/asset-packs-pipelines-syntheses-domain/tools/DepositDepositoryAssetPackSearchTool';

const part = (content: string): PromptPart => content as PromptPart;

const DepositorySearchInputSchema = z.object({
  repository: z.any().optional(),
  inventory: z.any().optional(),
  sourceCheckoutCatalog: z.any().optional(),
  demandContext: z.array(z.any()).optional(),
});

const ReadDemandGuidanceSchema = z.object({
  summary: z.string(),
  likelyReadTopics: z.array(z.string()).optional(),
  demandAlignment: z.array(z.string()).optional(),
  underservedTopics: z.array(z.string()).optional(),
  readabilityNotes: z.array(z.string()).optional(),
  /** Queries used for Depository search (Plan output, echoed for audit). */
  searchQueries: z.array(z.string()).optional(),
});

const UseToolSelectionSchema = z.object({
  name: z.string(),
  input: z.any(),
  reason: z.string().optional(),
});

const DepositorySearchOutputSchema = z
  .object({
    guidance: ReadDemandGuidanceSchema,
    /** Optional explicit query plan when model emits it at top level. */
    searchQueries: z.array(z.string()).optional(),
    // Try/Retry: select depository-asset-pack-search (possibly multiple queries).
    useTools: z.array(UseToolSelectionSchema).optional(),
  })
  .describe(
    '{ "guidance": { "summary": string, "likelyReadTopics"?: string[], "demandAlignment"?: string[], "underservedTopics"?: string[], "readabilityNotes"?: string[], "searchQueries"?: string[] }, "searchQueries"?: string[], "useTools"?: [{ "name": string, "input": any, "reason"?: string }] }',
  );

export type DepositReadDemandGuidance = z.infer<typeof ReadDemandGuidanceSchema>;

const IDENTITY = part(
  'You are Discovery search-depository-for-deposit-relevants. You run after codebase ' +
    'comprehension and inherent regurgitation. Search the Bitcode Depository for settled ' +
    'AssetPack supply **relevant** to this deposit synthesis run. Build search queries from ' +
    'wave-1 comprehension signals, sourceCheckoutCatalog, obfuscations, checkout measurements, ' +
    'and demand context so synthesized packs align with likely demand. Be source-safe. ' +
    'This is deposit relevance search — not Need-fit search (that is the read product agent).',
);

const REQUIREMENTS = part(
  'From repository coordinates, sourceCheckoutCatalog (paths/samples), obfuscation guidance, ' +
    'source measurements, and demandContext, derive: summary (reading demand this repository ' +
    'is likely to satisfy), likelyReadTopics, demandAlignment, underservedTopics (Depository ' +
    'under-supply), readabilityNotes, and searchQueries (3-12 short query terms/phrases for ' +
    'vector/lexical Depository search). Return ONLY {"guidance": {...}, "searchQueries": [...]} ' +
    'or {"guidance": {..., "searchQueries": [...]}}.',
);

const PLAN = part(
  'Plan: use wave-1 codebase comprehension and inherent regurgitation outcomes plus ' +
    'sourceCheckoutCatalog, measurements, obfuscations, and demand context to synthesize ' +
    'Depository search queries that retrieve AssetPacks **relevant** to high-demand deposit synthesis.',
);
const TRY = part(
  'Try: emit useTools with depository-asset-pack-search (one or more calls with distinct ' +
    'queryTerms batches from searchQueries), then produce demand guidance grounded in hits. ' +
    'Plan omits useTools; Try/Retry may include useTools.',
);
const REFINE = part(
  'Refine (no tools): ensure queries and guidance are grounded in sourceCheckoutCatalog evidence, demand-aligned, and source-safe. Omit useTools.',
);
const RETRY = part(
  'Retry: if prior search was thin, select additional depository-asset-pack-search useTools with ' +
    'broader queryTerms, then return minimal demand guidance rather than failing.',
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

export const DepositDepositorySearchAgent = factoryPTRRAgent<
  z.infer<typeof DepositorySearchInputSchema>,
  z.infer<typeof DepositorySearchOutputSchema>
>({
  name: 'DepositDepositorySearchForRelevantsAgent',
  description:
    'Discovery wave-2: search Depository for deposit-relevant supply; query plan after codebase comprehension.',
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

function defaultQueriesFromRun(input: {
  catalog?: any;
  demandContext?: any[];
  obfuscations?: string | null;
  measurements?: any[];
  repository?: any;
}): string[] {
  const terms: string[] = [];
  const fullName = input.repository?.fullName || input.repository?.name;
  if (fullName) terms.push(String(fullName).split('/').pop() || String(fullName));
  const paths = Array.isArray(input.catalog?.paths) ? input.catalog.paths : [];
  for (const p of paths.slice(0, 12)) {
    const base = String(p).split('/').filter(Boolean).pop();
    if (base && !base.startsWith('.')) terms.push(base.replace(/\.[^.]+$/, ''));
  }
  for (const d of input.demandContext || []) {
    if (typeof d === 'string') terms.push(d);
    else if (d && typeof d === 'object' && (d as any).topic) terms.push(String((d as any).topic));
  }
  if (input.obfuscations) {
    // Only coarse tokens — never raw long secrets
    terms.push(...String(input.obfuscations).split(/\W+/).filter((t) => t.length > 4).slice(0, 6));
  }
  if (Array.isArray(input.measurements)) {
    terms.push('measured-capability', 'source-safe-asset-pack');
  }
  return [...new Set(terms.map((t) => t.trim()).filter((t) => t.length > 2))].slice(0, 12);
}

export default async function runDepositDepositorySearchAgent(input: any, execution: any) {
  const repository = input?.repository ?? findValue(execution, 'deposit', 'repository') ?? {};
  const catalog = resolveSourceCheckoutCatalog(execution, input?.sourceCheckoutCatalog);
  const demandContext = input?.demandContext ?? findValue(execution, 'deposit', 'demandContext') ?? [];
  const obfuscations = findValue(execution, 'deposit', 'obfuscations');
  const measurements = findValue(execution, 'discovery', 'sourceMeasurements');
  const settledAssets =
    input?.depositoryAssets ??
    findValue(execution, 'deposit', 'settledDepositoryAssets') ??
    findValue(execution, 'depository', 'settledAssets') ??
    [];

  const { projectInventoryForPrompt } = await import('@bitcode/asset-packs-pipelines-syntheses-domain/asset-packs-synthesis');
  const catalogForPrompt = projectInventoryForPrompt(catalog);

  // Register search tool on execution for PTRR try step / direct use.
  try {
    (execution as any)?.tools?.registerTool?.(
      'depository-asset-pack-search',
      depositDepositoryAssetPackSearchTool,
    );
  } catch {}

  const raw = await DepositDepositorySearchAgent(
    {
      ...input,
      repository,
      sourceCheckoutCatalog: catalogForPrompt,
      inventoryPaths: catalogForPrompt?.paths ?? catalog?.paths,
      demandContext,
      sourceMeasurements: measurements,
      obfuscations,
    },
    execution,
  );
  const result = (raw as any)?.finalOutput ?? (raw as any)?.output ?? raw;

  let guidance: DepositReadDemandGuidance = (result as any)?.guidance ?? {
    summary:
      'No read-demand guidance derived; frame synthesized packs by their codebase knowledge until demand signal exists.',
    likelyReadTopics: [],
    demandAlignment: [],
    underservedTopics: [],
    readabilityNotes: [],
  };

  const modelQueries = asTerms(
    (result as any)?.searchQueries ?? (guidance as any)?.searchQueries,
  );
  const fallbackQueries = defaultQueriesFromRun({
    catalog: catalogForPrompt || catalog,
    demandContext,
    obfuscations,
    measurements,
    repository,
  });
  const searchQueries = modelQueries.length > 0 ? modelQueries : fallbackQueries;

  // Always run Depository search tool (vector policy + lexical rank when assets present).
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
      preferMeasuredAbsoluteFilters,
    } = await import('@bitcode/asset-packs-pipelines-syntheses-domain/depository-search');
    const assets = prepareDepositoryAssetsForSearch(
      Array.isArray(settledAssets) ? settledAssets : [],
    );
    const absHints = absoluteKindQueryHints(assets);
    const mergedQueries = [
      ...new Set([...searchQueries, ...absHints.map((k) => `absolute ${k}`)]),
    ].slice(0, 16);
    const staticFilters = preferMeasuredAbsoluteFilters(assets) || undefined;
    toolResult = await runDepositDepositoryAssetPackSearch({
      queryTerms: mergedQueries,
      queries: mergedQueries,
      product: 'deposit-relevants',
      paths: catalogForPrompt?.paths ?? catalog?.paths ?? [],
      assets,
      staticFilters,
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
      product: 'deposit-relevants',
      telemetry: toolResult?.telemetry || null,
    });
    // Stream-friendly quality snapshot for operators debugging relevants search.
    try {
      const t = toolResult?.telemetry;
      if (t && typeof (execution as any)?.emit === 'function') {
        (execution as any).emit('status', {
          message: `depository-search: product=${t.product} queries=${t.queryCount} hits=${t.hitCount} corpus=${t.assetCorpusAfterFilters} vector=${t.vector.status}${
            t.vector.disabledReason ? ` (${t.vector.disabledReason})` : ''
          } ${t.durationMs}ms`,
        });
      }
    } catch {
      /* optional */
    }

    if (toolResult?.underservedTopics?.length) {
      guidance = {
        ...guidance,
        underservedTopics: [
          ...new Set([
            ...(guidance.underservedTopics || []),
            ...toolResult.underservedTopics,
          ]),
        ],
        searchQueries,
      };
    } else {
      guidance = { ...guidance, searchQueries };
    }
    if (toolResult?.hits?.length && !guidance.likelyReadTopics?.length) {
      guidance = {
        ...guidance,
        likelyReadTopics: toolResult.hits
          .map((h: any) => h.title)
          .filter(Boolean)
          .slice(0, 8),
      };
    }
  } catch {
    guidance = { ...guidance, searchQueries };
  }

  storeCrossPhaseArtifact(execution, 'discovery', 'depositorySearch', guidance);
  storeCrossPhaseArtifact(execution, 'discovery', 'depositorySearchQueries', searchQueries);

  return { ...(input || {}), success: true, guidance, searchQueries, toolResult };
}

function asTerms(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((t) => String(t || '').trim()).filter(Boolean))];
}
