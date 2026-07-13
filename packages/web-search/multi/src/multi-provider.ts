/**
 * Multi-Provider Search Infrastructure
 * 
 * This file defines the core types, interfaces, and base classes for the
 * multi-provider search orchestration system.
 */

import { log } from '@bitcode/logger';

// ---------------------------------------------------------------------------
// Core Types
// ---------------------------------------------------------------------------

export type SearchProvider = 
  | 'exa'
  | 'github'
  | 'stackoverflow'
  | 'semantic_scholar'
  | 'firecrawl';

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  score: number;
  provider: SearchProvider;
  metadata: {
    type: 'general' | 'code' | 'documentation' | 'qa' | 'academic';
    authority: 'high' | 'medium' | 'low';
    publishedDate?: string;
    author?: string;
    tags?: string[];
    language?: string;
  };
}

export interface SearchQuery {
  text: string;
  category: 'code' | 'documentation' | 'qa' | 'academic' | 'general';
  technologies: string[];
  urgency: 'high' | 'medium' | 'low';
  context?: {
    domainHints?: string[];
    urlAttachments?: string[];
  };
}

export interface SearchOrchestrationResult {
  results: SearchResult[];
  totalResults: number;
  providers: SearchProvider[];
  fusionMetrics: {
    diversityScore: number;
    relevanceScore: number;
    qualityScore: number;
  };
  timing: {
    total: number;
    providers: Record<SearchProvider, number>;
  };
  metadata: {
    query: SearchQuery;
    selectedProviders: SearchProvider[];
    deduplicationCount: number;
  };
}

export type MultiProviderSearchQuery = SearchQuery;
export type MultiProviderSearchResult = SearchOrchestrationResult;

export interface ProviderConfig {
  name: SearchProvider;
  enabled: boolean;
  priority: number;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  healthCheck: {
    interval: number;
    timeout: number;
  };
  specializations: {
    categories: readonly ('general' | 'documentation' | 'code' | 'qa' | 'academic')[];
    technologies: string[];
    strengths: string[];
  };
}

export interface ProviderStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastHealthCheck: Date | null;
  isHealthy: boolean;
  rateLimit: {
    remaining: number;
    resetTime: Date | null;
  };
}

// ---------------------------------------------------------------------------
// Provider Base Class
// ---------------------------------------------------------------------------

export abstract class SearchProviderBase {
  abstract readonly name: SearchProvider;
  abstract readonly config: ProviderConfig;
  
  private stats: ProviderStats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    lastHealthCheck: null,
    isHealthy: false,
    rateLimit: {
      remaining: 1000,
      resetTime: null
    }
  };
  
  abstract search(query: SearchQuery, options?: any): Promise<SearchResult[]>;
  abstract healthCheck(): Promise<boolean>;
  
  async executeSearch(query: SearchQuery, options?: any): Promise<SearchResult[]> {
    const startTime = Date.now();
    this.stats.totalRequests++;
    
    try {
      const results = await this.search(query, options);
      this.stats.successfulRequests++;
      
      // Update average response time
      const responseTime = Date.now() - startTime;
      this.stats.averageResponseTime = (
        (this.stats.averageResponseTime * (this.stats.successfulRequests - 1) + responseTime) / 
        this.stats.successfulRequests
      );
      
      return results;
    } catch (error) {
      this.stats.failedRequests++;
      log('Provider search failed', 'error', {
        provider: this.name,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
  
  async performHealthCheck(): Promise<boolean> {
    try {
      const isHealthy = await this.healthCheck();
      this.stats.isHealthy = isHealthy;
      this.stats.lastHealthCheck = new Date();
      return isHealthy;
    } catch (error) {
      this.stats.isHealthy = false;
      this.stats.lastHealthCheck = new Date();
      return false;
    }
  }
  
  getStats(): ProviderStats {
    return { ...this.stats };
  }
  
  resetStats(): void {
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      lastHealthCheck: this.stats.lastHealthCheck,
      isHealthy: this.stats.isHealthy,
      rateLimit: this.stats.rateLimit
    };
  }
}

// ---------------------------------------------------------------------------
// Query Analyzer
// ---------------------------------------------------------------------------

export class QueryAnalyzer {
  analyzeQuery(queryText: string, urlAttachments: string[] = []): SearchQuery {
    const technologies = this.extractTechnologies(queryText, urlAttachments);
    const category = this.categorizeQuery(queryText, urlAttachments);
    const urgency = this.assessUrgency(queryText);
    
    return {
      text: queryText,
      category,
      technologies,
      urgency,
      context: {
        urlAttachments
      }
    };
  }
  
  private extractTechnologies(queryText: string, urlAttachments: string[]): string[] {
    const technologies = new Set<string>();
    const text = (queryText + ' ' + urlAttachments.join(' ')).toLowerCase();
    
    const techPatterns = {
      'react': /\breact\b/,
      'vue': /\bvue\b/,
      'angular': /\bangular\b/,
      'svelte': /\bsvelte\b/,
      'nodejs': /\bnode\.?js\b|\bnode\b/,
      'javascript': /\bjavascript\b|\bjs\b/,
      'typescript': /\btypescript\b|\bts\b/,
      'python': /\bpython\b|\bpy\b/,
      'java': /\bjava\b/,
      'golang': /\bgo\b|\bgolang\b/,
      'rust': /\brust\b/,
      'cpp': /\bc\+\+\b|\bcpp\b/,
      'csharp': /\bc#\b|\bcsharp\b/,
      'php': /\bphp\b/,
      'ruby': /\bruby\b/,
      'docker': /\bdocker\b/,
      'kubernetes': /\bkubernetes\b|\bk8s\b/,
      'aws': /\baws\b|\bamazon\b/,
      'gcp': /\bgcp\b|\bgoogle.*cloud\b/,
      'azure': /\bazure\b/
    };
    
    Object.entries(techPatterns).forEach(([tech, pattern]) => {
      if (pattern.test(text)) {
        technologies.add(tech);
      }
    });
    
    return Array.from(technologies);
  }
  
  private categorizeQuery(queryText: string, urlAttachments: string[]): SearchQuery['category'] {
    const text = queryText.toLowerCase();
    
    // Code-related patterns
    if (/\b(function|method|class|variable|syntax|implementation|code|programming)\b/.test(text) ||
        urlAttachments.some(url => url.includes('github.com'))) {
      return 'code';
    }
    
    // Documentation patterns
    if (/\b(documentation|docs|guide|manual|reference|api)\b/.test(text) ||
        urlAttachments.some(url => url.includes('docs.') || url.includes('/docs/'))) {
      return 'documentation';
    }
    
    // Q&A patterns
    if (/\b(how to|why|what is|problem|issue|error|troubleshoot|solve)\b/.test(text) ||
        urlAttachments.some(url => url.includes('stackoverflow.com'))) {
      return 'qa';
    }
    
    // Academic patterns
    if (/\b(research|paper|study|analysis|algorithm|theory|academic)\b/.test(text) ||
        urlAttachments.some(url => url.includes('arxiv.org') || url.includes('scholar.google'))) {
      return 'academic';
    }
    
    return 'general';
  }
  
  private assessUrgency(queryText: string): SearchQuery['urgency'] {
    const text = queryText.toLowerCase();
    
    // High urgency patterns
    if (/\b(urgent|critical|broken|failed|error|bug|crash|down|emergency)\b/.test(text)) {
      return 'high';
    }
    
    // Low urgency patterns
    if (/\b(learn|tutorial|explore|understand|general|overview)\b/.test(text)) {
      return 'low';
    }
    
    return 'medium';
  }
}

// ---------------------------------------------------------------------------
// Provider Router
// ---------------------------------------------------------------------------

export class ProviderRouter {
  private providers: Map<SearchProvider, SearchProviderBase> = new Map();
  
  registerProvider(provider: SearchProviderBase): void {
    this.providers.set(provider.name, provider);
  }
  
  getProvider(name: SearchProvider): SearchProviderBase | undefined {
    return this.providers.get(name);
  }
  
  async routeQuery(query: SearchQuery): Promise<SearchProvider[]> {
    const availableProviders = Array.from(this.providers.values())
      .filter(provider => provider.config.enabled && provider.getStats().isHealthy)
      .sort((a, b) => b.config.priority - a.config.priority);
    
    if (availableProviders.length === 0) {
      return [];
    }
    
    // Category-based routing
    const categoryProviders = availableProviders.filter(provider =>
      provider.config.specializations.categories.includes(query.category)
    );
    
    // Technology-based routing
    const techProviders = availableProviders.filter(provider => {
      if (provider.config.specializations.technologies.length === 0) {
        return true; // Universal providers
      }
      return query.technologies.some(tech =>
        provider.config.specializations.technologies.includes(tech)
      );
    });
    
    // Combine and deduplicate
    const selectedProviders = new Set<SearchProvider>();
    
    // **CRITICAL: When URLs are provided, prioritize Firecrawl for crawling**
    const hasUrls = query.context?.urlAttachments && query.context.urlAttachments.length > 0;
    if (hasUrls) {
      const firecrawlProvider = availableProviders.find(p => p.name === 'firecrawl');
      if (firecrawlProvider) {
        selectedProviders.add('firecrawl');
      }
    }
    
    // Always include top-priority universal providers
    const universalProviders = availableProviders.filter(p => 
      p.config.specializations.technologies.length === 0
    ).slice(0, 1); // Take top universal provider
    universalProviders.forEach(p => selectedProviders.add(p.name));
    
    // Add category specialists
    categoryProviders.slice(0, 2).forEach(p => selectedProviders.add(p.name));
    
    // Add technology specialists
    techProviders.slice(0, 2).forEach(p => selectedProviders.add(p.name));
    
    // Ensure at least one provider
    if (selectedProviders.size === 0) {
      selectedProviders.add(availableProviders[0].name);
    }
    
    return Array.from(selectedProviders);
  }
}

// ---------------------------------------------------------------------------
// Result Fusion Engine
// ---------------------------------------------------------------------------

export class ResultFusionEngine {
  fuseResults(
    providerResults: Array<{ provider: SearchProvider; results: SearchResult[] }>,
    query: SearchQuery
  ): SearchOrchestrationResult {
    const allResults = providerResults.flatMap(pr => pr.results);
    
    // Deduplicate by URL
    const deduplicationCount = allResults.length;
    const uniqueResults = this.deduplicateResults(allResults);
    const finalDeduplicationCount = deduplicationCount - uniqueResults.length;
    
    // Score and rank results
    const scoredResults = this.scoreResults(uniqueResults, query);
    
    // Calculate fusion metrics
    const fusionMetrics = this.calculateFusionMetrics(scoredResults, providerResults);
    
    return {
      results: scoredResults,
      totalResults: scoredResults.length,
      providers: providerResults.map(pr => pr.provider),
      fusionMetrics,
      timing: {
        total: 0, // Will be set by orchestrator
        providers: Object.fromEntries(
          providerResults.map(pr => [pr.provider, 0])
        ) as Record<SearchProvider, number>
      },
      metadata: {
        query,
        selectedProviders: providerResults.map(pr => pr.provider),
        deduplicationCount: finalDeduplicationCount
      }
    };
  }
  
  private deduplicateResults(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>();
    return results.filter(result => {
      const normalizedUrl = this.normalizeUrl(result.url);
      if (seen.has(normalizedUrl)) {
        return false;
      }
      seen.add(normalizedUrl);
      return true;
    });
  }
  
  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // Remove common variations
      return urlObj.hostname + urlObj.pathname.replace(/\/$/, '');
    } catch {
      return url;
    }
  }
  
  private scoreResults(results: SearchResult[], query: SearchQuery): SearchResult[] {
    return results
      .map(result => ({
        ...result,
        score: this.calculateResultScore(result, query)
      }))
      .sort((a, b) => b.score - a.score);
  }
  
  private calculateResultScore(result: SearchResult, query: SearchQuery): number {
    let score = result.score;
    
    // Authority boost
    if (result.metadata.authority === 'high') score *= 1.2;
    else if (result.metadata.authority === 'low') score *= 0.8;
    
    // Category relevance boost
    if (result.metadata.type === query.category) score *= 1.15;
    
    // Technology relevance boost
    const titleText = (result.title + ' ' + result.snippet).toLowerCase();
    const matchingTechs = query.technologies.filter(tech =>
      titleText.includes(tech.toLowerCase())
    );
    if (matchingTechs.length > 0) {
      score *= (1 + matchingTechs.length * 0.1);
    }
    
    // Recency boost for high urgency
    if (query.urgency === 'high' && result.metadata.publishedDate) {
      const publishedDate = new Date(result.metadata.publishedDate);
      const daysSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSincePublished < 30) score *= 1.1;
    }
    
    return Math.max(0, Math.min(1, score));
  }
  
  private calculateFusionMetrics(
    results: SearchResult[],
    providerResults: Array<{ provider: SearchProvider; results: SearchResult[] }>
  ): SearchOrchestrationResult['fusionMetrics'] {
    // Diversity: how many different providers contributed
    const contributingProviders = new Set(results.map(r => r.provider));
    const diversityScore = contributingProviders.size / providerResults.length;
    
    // Relevance: average score of top 10 results
    const topResults = results.slice(0, 10);
    const relevanceScore = topResults.length > 0 
      ? topResults.reduce((sum, r) => sum + r.score, 0) / topResults.length
      : 0;
    
    // Quality: proportion of high-authority results in top 10
    const highAuthorityCount = topResults.filter(r => r.metadata.authority === 'high').length;
    const qualityScore = topResults.length > 0 ? highAuthorityCount / topResults.length : 0;
    
    return {
      diversityScore: Math.round(diversityScore * 100) / 100,
      relevanceScore: Math.round(relevanceScore * 100) / 100,
      qualityScore: Math.round(qualityScore * 100) / 100
    };
  }
}