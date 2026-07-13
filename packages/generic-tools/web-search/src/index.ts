// @ts-nocheck — monorepo typecheck quarantine (restore when types harden)
/**
 * BITCODE READ-SYNTHESIS WEB SEARCH TOOLS - admitted support package
 * 
 * Tool implementations with doc-prompt integration for runtime documentation.
 * V26 admits these tools only as discovery-phase external evidence support for
 * Bitcode read synthesis. They can search, retrieve, and classify sources; they
 * do not own proof closure, mutation, delivery, Exchange, or Terminal behavior.
 * 
 * @category Bitcode Discovery Evidence Tools
 * @priority High - Read-synthesis source evidence support
 * 
 * @doc-ptrr
 * version: V26
 * sentience: runtime
 * intelligence: ["read-synthesis-web-search", "source-attributed-evidence", "url-intelligence"]
 * philosophy: "External web evidence supports Bitcode read synthesis; it is not proof by itself."
 * 
 * CAPABILITIES:
 * - Source-attributed multi-provider search
 * - Bounded content retrieval for cited sources
 * - URL intelligence analysis
 * - Domain and source-class analysis
 * - Provider health support for evidence collection
 */

import { Tool } from '@bitcode/tools-generics';
import { factoryTool } from '@bitcode/tools-generics';

import {
  search as _search,
  getContents as _getContents,
  findSimilar as _findSimilar,
  extractDomain as _extractDomain,
  extractUrlsFromText as _extractUrlsFromText,
  classifyUrl as _classifyUrl,
  discoverRelatedDomains as _discoverRelatedDomains,
  extractTechnologyContext as _extractTechnologyContext,
  analyzeUrlAttachments as _analyzeUrlAttachments,
  searchWithUrlIntelligence as _searchWithUrlIntelligence,
  multiProviderSearch as _multiProviderSearch,
  getProviderHealth as _getProviderHealth,
  getProviderStatistics as _getProviderStatistics,
  productionMultiProviderSearch as _productionMultiProviderSearch,
  getProductionMetrics as _getProductionMetrics,
  getProductionHealth as _getProductionHealth,
} from '@bitcode/web-search';

import { WEB_SEARCH_DOC_CODE_TOOL_PROMPT } from './prompts/WebSearchDocCodeToolPrompt';
import { GET_CONTENTS_DOC_CODE_TOOL_PROMPT } from './prompts/GetContentsDocCodeToolPrompt';
import { MULTI_PROVIDER_SEARCH_DOC_CODE_TOOL_PROMPT } from './prompts/MultiProviderSearchDocCodeToolPrompt';

/**
 * @doc-code-tool
 * @prompt WEB_SEARCH_DOC_CODE_TOOL_PROMPT
 */
class SearchTool extends Tool<typeof _search> {
  use = _search;
}

export const search = new SearchTool();

/**
 * @doc-code-tool
 * @prompt GET_CONTENTS_DOC_CODE_TOOL_PROMPT
 */
class GetContentsTool extends Tool<typeof _getContents> {
  use = _getContents;
}

export const getContents = new GetContentsTool();

export const findSimilar = factoryTool(
  'findSimilar',
  async (params: { url: string; options?: any }) => {
    return await _findSimilar(params.url, params.options);
  },
  {
    description: `Find documents and content similar to a given source URL for Bitcode read-synthesis evidence.
    This tool may help identify related sources or corroborating references, but
    it remains auxiliary evidence and must not assert proof closure.`
  }
);

// ---------------------------------------------------------------------------
// Enhanced search with URL intelligence
// ---------------------------------------------------------------------------

export const searchWithUrlIntelligence = factoryTool(
  'searchWithUrlIntelligence',
  async (params: { query: string; urlAttachments?: string[]; options?: any }) => {
    return await _searchWithUrlIntelligence(params.query, params.urlAttachments, params.options);
  },
  {
    description: `Perform Bitcode read-synthesis web search that uses URL attachments only to improve source targeting.
    This tool gathers source-attributed external evidence for a declared read or
    proof gap; it does not mutate state or decide canonical Bitcode meaning.`
  }
);

// ---------------------------------------------------------------------------
// Multi-provider search orchestration
// ---------------------------------------------------------------------------

/**
 * @doc-code-tool
 * @prompt MULTI_PROVIDER_SEARCH_DOC_CODE_TOOL_PROMPT
 */
class MultiProviderSearchTool extends Tool<typeof _multiProviderSearch> {
  use = _multiProviderSearch;
}

export const multiProviderSearch = new MultiProviderSearchTool();

export const productionMultiProviderSearch = factoryTool(
  'productionMultiProviderSearch',
  async (params: { query: string; urlAttachments?: string[]; options?: any }) => {
    return await _productionMultiProviderSearch(params.query, params.urlAttachments, params.options);
  },
  {
    description: `Multi-provider search for Bitcode discovery-phase evidence collection.
    Provider failover and resilience exist only to improve source coverage for
    read synthesis; this is not an independent production search product.`
  }
);

// ---------------------------------------------------------------------------
// URL intelligence and analysis utilities
// ---------------------------------------------------------------------------

export const extractDomain = factoryTool(
  'extractDomain',
  async (params: { url: string }) => {
    return await _extractDomain(params.url);
  },
  {
    description: `Extract a domain name from a source URL.
    This utility supports source attribution, domain filtering, and source-class
    review for Bitcode read-synthesis evidence.`
  }
);

export const extractUrlsFromText = factoryTool(
  'extractUrlsFromText',
  async (params: { text: string }) => {
    return await _extractUrlsFromText(params.text);
  },
  {
    description: `Extract source URLs found in text.
    This tool supports traceability for Bitcode external evidence and must not
    turn arbitrary text into an unbounded crawling plan.`
  }
);

export const classifyUrl = factoryTool(
  'classifyUrl',
  async (params: { url: string }) => {
    return await _classifyUrl(params.url);
  },
  {
    description: `Classify a source URL and extract metadata useful for Bitcode evidence review.
    The classification supports source-quality assessment and discovery-phase
    read synthesis only.`
  }
);

export const discoverRelatedDomains = factoryTool(
  'discoverRelatedDomains',
  async (params: { domain: string }) => {
    return await _discoverRelatedDomains(params.domain);
  },
  {
    description: `Discover domains related to a source domain when source coverage is insufficient.
    Use only to corroborate or locate authoritative sources for the active
    Bitcode read-synthesis question.`
  }
);

export const extractTechnologyContext = factoryTool(
  'extractTechnologyContext',
  async (params: { urls: string[] }) => {
    return await _extractTechnologyContext(params.urls);
  },
  {
    description: `Extract technology and source context from URLs for better Bitcode search targeting.
    Output is auxiliary evidence for read synthesis and does not define product
    or proof semantics.`
  }
);

export const analyzeUrlAttachments = factoryTool(
  'analyzeUrlAttachments',
  async (params: { urlAttachments: string[] }) => {
    return await _analyzeUrlAttachments(params.urlAttachments);
  },
  {
    description: `Analyze URL attachments for bounded Bitcode search enhancement.
    The analysis may improve query targeting, source-class selection, and
    evidence traceability for discovery-phase read synthesis.`
  }
);

// ---------------------------------------------------------------------------
// Health and monitoring tools
// ---------------------------------------------------------------------------

export const getProviderHealth = factoryTool(
  'getProviderHealth',
  async () => {
    return await _getProviderHealth();
  },
  {
    description: `Get health status of search providers used for Bitcode evidence collection.
    Health data supports reliable source gathering and does not become product
    telemetry ownership.`
  }
);

export const getProviderStatistics = factoryTool(
  'getProviderStatistics',
  async () => {
    return await _getProviderStatistics();
  },
  {
    description: `Get provider statistics for Bitcode discovery evidence search.
    Statistics may guide source-collection retries and provider selection only.`
  }
);

export const getProductionHealth = factoryTool(
  'getProductionHealth',
  async () => {
    return await _getProductionHealth();
  },
  {
    description: `Get provider health details for retained web-search evidence infrastructure.
    This support tool is admitted for evidence-collection reliability, not
    as a standalone monitoring surface.`
  }
);

export const getProductionMetrics = factoryTool(
  'getProductionMetrics',
  async () => {
    return await _getProductionMetrics();
  },
  {
    description: `Get retained search-operation metrics for discovery evidence collection.
    Metrics help bound retries and source coverage; they do not own Bitcode live
    product observability.`
  }
);

// ---------------------------------------------------------------------------
// Re-export Tool function types for strong typing at call-sites
// ---------------------------------------------------------------------------

export type SearchToolFn = Tool<typeof search>;
export type GetContentsToolFn = Tool<typeof getContents>;
export type FindSimilarToolFn = Tool<typeof findSimilar>;
export type ExtractDomainToolFn = Tool<typeof extractDomain>;
export type ExtractUrlsFromTextToolFn = Tool<typeof extractUrlsFromText>;
export type ClassifyUrlToolFn = Tool<typeof classifyUrl>;
export type DiscoverRelatedDomainsToolFn = Tool<typeof discoverRelatedDomains>;
export type ExtractTechnologyContextToolFn = Tool<typeof extractTechnologyContext>;
export type AnalyzeUrlAttachmentsToolFn = Tool<typeof analyzeUrlAttachments>;
export type SearchWithUrlIntelligenceToolFn = Tool<typeof searchWithUrlIntelligence>;
export type MultiProviderSearchToolFn = Tool<typeof multiProviderSearch>;
export type GetProviderHealthToolFn = Tool<typeof getProviderHealth>;
export type GetProviderStatisticsToolFn = Tool<typeof getProviderStatistics>;
export type ProductionMultiProviderSearchToolFn = Tool<typeof productionMultiProviderSearch>;
export type GetProductionMetricsToolFn = Tool<typeof getProductionMetrics>;
export type GetProductionHealthToolFn = Tool<typeof getProductionHealth>;

// Re-export types for convenience
export type {
  UrlType,
  UrlClassification,
  UrlAttachmentAnalysis,
  ExaResult,
  ExaSearchResponse,
  SearchOptions,
  SearchCategory,
  SearchType,
  SearchProvider,
  MultiProviderSearchResult,
  MultiProviderSearchQuery,
  SearchOrchestrationResult,
  ProviderConfig,
  SearchMetrics,
  ResilienceConfig,
  CircuitBreakerConfig,
  RetryConfig,
  RateLimiterConfig,
  FallbackConfig,
  ProviderHealthMetrics
} from '@bitcode/web-search';
