/**
 * Production-Grade Multi-Provider Search Orchestrator
 * Enterprise-Level Resilience, Monitoring, and Performance
 */

import { log } from '@bitcode/logger';
import { 
  SearchProvider,
  SearchResult,
  SearchQuery,
  SearchOrchestrationResult,
  ProviderRouter,
  QueryAnalyzer,
  ResultFusionEngine,
  SearchProviderBase
} from './multi-provider';
import { search as exaSearch, searchWithUrlIntelligence } from './index';
import { GitHubSearchProvider } from './providers/github';
import { StackOverflowSearchProvider } from './providers/stackoverflow';
import { SemanticScholarSearchProvider } from './providers/semantic-scholar';
import { 
  ResilienceCoordinator, 
  ResilienceConfig,
  ProviderHealthMonitor,
  CircuitBreaker,
  RetryStrategy,
  RateLimiter,
  TimeoutManager
} from './resilience';

// ============================================================================
// Production-Grade Exa Provider with Resilience
// ============================================================================

class ProductionExaSearchProvider extends SearchProviderBase {
  readonly name = 'exa' as const;
  readonly config = {
    name: 'exa' as const,
    enabled: true,
    priority: 10,
    rateLimit: {
      requestsPerMinute: 60,
      requestsPerDay: 1000
    },
    healthCheck: {
      interval: 300000,
      timeout: 10000
    },
    specializations: {
      categories: ['general', 'documentation', 'code', 'qa', 'academic'] as const,
      technologies: [],
      strengths: [
        'Neural search',
        'Semantic understanding', 
        'Content extraction',
        'Broad coverage',
        'High relevance',
        'URL intelligence'
      ]
    }
  };

  async search(query: SearchQuery, options?: {
    urlAttachments?: string[];
    maxResults?: number;
  }): Promise<SearchResult[]> {
    const { urlAttachments = [], maxResults = 15 } = options || {};
    
    try {
      const searchResponse = urlAttachments.length > 0
        ? await searchWithUrlIntelligence(query.text, urlAttachments, {
            numResults: maxResults,
            type: 'neural',
            contents: {
              text: { maxCharacters: 3000 },
              highlights: { numSentences: 2 },
              summary: { query: query.text }
            }
          })
        : await exaSearch(query.text, {
            numResults: maxResults,
            type: 'neural',
            contents: {
              text: { maxCharacters: 3000 },
              highlights: { numSentences: 2 },
              summary: { query: query.text }
            }
          });

      return searchResponse.results.map(result => ({
        id: `exa-${result.id}`,
        title: result.title,
        url: result.url,
        snippet: result.summary || result.text?.slice(0, 300) || '',
        score: result.score,
        provider: 'exa' as const,
        metadata: {
          type: 'general' as const,
          authority: result.score > 0.8 ? 'high' as const : result.score > 0.6 ? 'medium' as const : 'low' as const,
          publishedDate: result.publishedDate,
          author: result.author
        }
      }));
    } catch (error) {
      log('Exa search failed', 'error', {
        provider: this.name,
        query: query.text,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const testResponse = await exaSearch('production health check', { numResults: 1 });
      return testResponse.results.length >= 0;
    } catch (error) {
      log('Exa health check failed', 'error', {
        provider: this.name,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }
}

// ============================================================================
// Production-Grade Metrics and Monitoring
// ============================================================================

export interface SearchMetrics {
  totalSearches: number;
  successfulSearches: number;
  failedSearches: number;
  averageResponseTime: number;
  averageResultCount: number;
  providerUsageDistribution: Record<SearchProvider, number>;
  qualityScores: number[];
  diversityScores: number[];
  errorDistribution: Record<string, number>;
  performancePercentiles: {
    p50: number;
    p95: number;
    p99: number;
  };
}

class ProductionMetricsCollector {
  private metrics: SearchMetrics = {
    totalSearches: 0,
    successfulSearches: 0,
    failedSearches: 0,
    averageResponseTime: 0,
    averageResultCount: 0,
    providerUsageDistribution: {} as Record<SearchProvider, number>,
    qualityScores: [],
    diversityScores: [],
    errorDistribution: {},
    performancePercentiles: { p50: 0, p95: 0, p99: 0 }
  };

  private responseTimes: number[] = [];
  private resultCounts: number[] = [];

  recordSearch(
    success: boolean,
    responseTime: number,
    resultCount: number,
    providers: SearchProvider[],
    qualityScore?: number,
    diversityScore?: number,
    error?: string
  ): void {
    this.metrics.totalSearches++;
    
    if (success) {
      this.metrics.successfulSearches++;
      this.responseTimes.push(responseTime);
      this.resultCounts.push(resultCount);
      
      if (qualityScore !== undefined) {
        this.metrics.qualityScores.push(qualityScore);
      }
      
      if (diversityScore !== undefined) {
        this.metrics.diversityScores.push(diversityScore);
      }
      
      providers.forEach(provider => {
        this.metrics.providerUsageDistribution[provider] = 
          (this.metrics.providerUsageDistribution[provider] || 0) + 1;
      });
    } else {
      this.metrics.failedSearches++;
      
      if (error) {
        this.metrics.errorDistribution[error] = 
          (this.metrics.errorDistribution[error] || 0) + 1;
      }
    }
    
    this.updateAggregates();
  }

  private updateAggregates(): void {
    if (this.responseTimes.length > 0) {
      this.metrics.averageResponseTime = 
        this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length;
      
      const sorted = [...this.responseTimes].sort((a, b) => a - b);
      this.metrics.performancePercentiles = {
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)]
      };
    }
    
    if (this.resultCounts.length > 0) {
      this.metrics.averageResultCount = 
        this.resultCounts.reduce((sum, count) => sum + count, 0) / this.resultCounts.length;
    }
  }

  getMetrics(): SearchMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      totalSearches: 0,
      successfulSearches: 0,
      failedSearches: 0,
      averageResponseTime: 0,
      averageResultCount: 0,
      providerUsageDistribution: {} as Record<SearchProvider, number>,
      qualityScores: [],
      diversityScores: [],
      errorDistribution: {},
      performancePercentiles: { p50: 0, p95: 0, p99: 0 }
    };
    this.responseTimes = [];
    this.resultCounts = [];
  }
}

// ============================================================================
// Production-Grade Multi-Provider Orchestrator
// ============================================================================

export class ProductionMultiProviderOrchestrator {
  private router: ProviderRouter;
  private queryAnalyzer: QueryAnalyzer;
  private fusionEngine: ResultFusionEngine;
  private healthMonitor: NodeJS.Timeout | null = null;
  private providers: Map<SearchProvider, SearchProviderBase> = new Map();
  private resilienceCoordinator: ResilienceCoordinator;
  private providerHealthMonitor: ProviderHealthMonitor;
  private rateLimiters: Map<SearchProvider, RateLimiter> = new Map();
  private circuitBreakers: Map<SearchProvider, CircuitBreaker> = new Map();
  private metricsCollector: ProductionMetricsCollector;

  constructor(resilienceConfig?: Partial<ResilienceConfig>) {
    this.router = new ProviderRouter();
    this.queryAnalyzer = new QueryAnalyzer();
    this.fusionEngine = new ResultFusionEngine();
    this.providerHealthMonitor = new ProviderHealthMonitor();
    this.metricsCollector = new ProductionMetricsCollector();
    
    // Production-grade resilience configuration
    const defaultResilienceConfig: ResilienceConfig = {
      circuitBreaker: {
        failureThreshold: 5,
        timeoutMs: 30000,
        resetTimeoutMs: 60000,
        monitoringPeriodMs: 300000
      },
      retry: {
        maxAttempts: 3,
        baseDelayMs: 1000,
        maxDelayMs: 10000,
        backoffMultiplier: 2,
        jitterMs: 500
      },
      rateLimiter: {
        requestsPerMinute: 60
      },
      fallback: {
        primaryProviders: ['exa', 'github'],
        fallbackProviders: ['stackoverflow', 'semantic_scholar'],
        emergencyFallback: async () => {
          log('Emergency fallback activated - returning minimal response', 'warn');
          return {
            results: [],
            providerUsage: [],
            fusionMetrics: {
              totalResults: 0,
              duplicatesRemoved: 0,
              qualityFiltered: 0,
              diversityScore: 0,
              relevanceScore: 0
            },
            recommendedFollowUp: ['Try a different search query', 'Check provider health status']
          };
        }
      },
      timeoutMs: 15000
    };
    
    this.resilienceCoordinator = new ResilienceCoordinator({
      ...defaultResilienceConfig,
      ...resilienceConfig
    });
    
    this.initializeProviders();
    this.initializeRateLimiters();
    this.initializeCircuitBreakers();
    this.startHealthMonitoring();
    this.startMetricsReporting();
  }

  private initializeProviders(): void {
    const providers = [
      new ProductionExaSearchProvider(),
      new GitHubSearchProvider(),
      new StackOverflowSearchProvider(),
      new SemanticScholarSearchProvider()
    ];
    
    providers.forEach(provider => {
      this.providers.set(provider.name, provider);
      this.router.registerProvider(provider);
    });
    
    log('Production orchestrator initialized', 'info', {
      providers: providers.map(p => p.name),
      enabledProviders: providers.filter(p => p.config.enabled).map(p => p.name),
      resilienceFeatures: [
        'Circuit Breakers',
        'Rate Limiting', 
        'Health Monitoring',
        'Fallback Strategies',
        'Metrics Collection',
        'Performance Monitoring'
      ]
    });
  }
  
  private initializeRateLimiters(): void {
    const providerLimits: Record<SearchProvider, number> = {
      'exa': 60,
      'github': 30,
      'stackoverflow': 30,
      'semantic_scholar': 100
    };
    
    Object.entries(providerLimits).forEach(([provider, limit]) => {
      this.rateLimiters.set(provider as SearchProvider, new RateLimiter({
        requestsPerMinute: limit
      }));
    });
    
    log('Production rate limiters initialized', 'info', { limits: providerLimits });
  }
  
  private initializeCircuitBreakers(): void {
    const providers: SearchProvider[] = ['exa', 'github', 'stackoverflow', 'semantic_scholar'];
    
    providers.forEach(provider => {
      this.circuitBreakers.set(provider, new CircuitBreaker({
        failureThreshold: provider === 'exa' ? 3 : 5,
        timeoutMs: 15000,
        resetTimeoutMs: 60000,
        monitoringPeriodMs: 300000
      }));
    });
    
    log('Production circuit breakers initialized', 'info', {
      providers,
      configuration: 'Provider-specific thresholds'
    });
  }

  async orchestrateSearch(
    queryText: string,
    urlAttachments: string[] = [],
    options?: {
      maxResults?: number;
      forceProviders?: SearchProvider[];
      urgency?: 'high' | 'medium' | 'low';
      category?: 'code' | 'documentation' | 'qa' | 'academic' | 'general';
    }
  ): Promise<SearchOrchestrationResult> {
    const startTime = Date.now();
    const searchId = `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const {
      maxResults = 20,
      forceProviders,
      urgency = 'medium',
      category
    } = options || {};
    
    try {
      log('Starting production orchestrated search', 'info', {
        searchId,
        query: queryText,
        urgency,
        category,
        urlAttachments: urlAttachments.length,
        maxResults
      });
      
      // Analyze the query
      const query = this.queryAnalyzer.analyzeQuery(queryText, urlAttachments);
      
      if (category) query.category = category;
      if (urgency) query.urgency = urgency;
      
      // Route query to appropriate providers
      const selectedProviders = forceProviders || await this.router.routeQuery(query);
      
      if (selectedProviders.length === 0) {
        throw new Error('No healthy providers available for this query');
      }
      
      // Execute searches with production resilience
      const searchPromises = selectedProviders.map(async providerName => {
        const provider = this.router.getProvider(providerName);
        if (!provider) {
          log('Provider not found', 'warn', { provider: providerName, searchId });
          return { provider: providerName, results: [] };
        }
        
        try {
          const providerOptions = this.buildProviderOptions(provider, query, urlAttachments, maxResults);
          const results = await this.executeResilientProviderSearch(
            providerName,
            () => provider.executeSearch(query, providerOptions),
            searchId
          );
          
          return { provider: providerName, results };
        } catch (error) {
          log('Provider search failed after all resilience mechanisms', 'error', {
            provider: providerName,
            searchId,
            error: error instanceof Error ? error.message : String(error),
            circuitBreakerState: this.circuitBreakers.get(providerName)?.getState(),
            rateLimiterStatus: this.rateLimiters.get(providerName)?.getStatus()
          });
          return { provider: providerName, results: [] };
        }
      });
      
      const providerResults = await Promise.all(searchPromises);
      
      // Fuse results from all providers
      const fusedResult = this.fusionEngine.fuseResults(providerResults, query);
      
      const totalTime = Date.now() - startTime;
      
      // Record metrics
      this.metricsCollector.recordSearch(
        true,
        totalTime,
        fusedResult.results.length,
        selectedProviders,
        fusedResult.fusionMetrics.relevanceScore,
        fusedResult.fusionMetrics.diversityScore
      );
      
      log('Production orchestrated search completed', 'info', {
        searchId,
        query: query.text,
        providers: selectedProviders,
        totalResults: fusedResult.results.length,
        totalTime,
        diversityScore: fusedResult.fusionMetrics.diversityScore,
        relevanceScore: fusedResult.fusionMetrics.relevanceScore,
        performanceMetrics: this.getPerformanceSnapshot()
      });
      
      return fusedResult;
      
    } catch (error) {
      const totalTime = Date.now() - startTime;
      
      // Record failure metrics
      this.metricsCollector.recordSearch(
        false,
        totalTime,
        0,
        [],
        undefined,
        undefined,
        error instanceof Error ? error.message : String(error)
      );
      
      log('Production orchestrated search failed', 'error', {
        searchId,
        query: queryText,
        totalTime,
        error: error instanceof Error ? error.message : String(error),
        systemHealth: this.getSystemHealthSnapshot()
      });
      
      throw error;
    }
  }

  private async executeResilientProviderSearch(
    provider: SearchProvider,
    searchOperation: () => Promise<SearchResult[]>,
    searchId: string
  ): Promise<SearchResult[]> {
    const rateLimiter = this.rateLimiters.get(provider);
    const circuitBreaker = this.circuitBreakers.get(provider);
    
    // Rate limiting
    if (rateLimiter) {
      await rateLimiter.waitForAvailability();
    }
    
    // Circuit breaker with retry and timeout
    const retryStrategy = new RetryStrategy({
      maxAttempts: 3,
      baseDelayMs: 1000,
      maxDelayMs: 5000,
      backoffMultiplier: 2,
      jitterMs: 200
    });
    
    const startTime = Date.now();
    
    try {
      const results = await (circuitBreaker?.execute(
        () => retryStrategy.execute(
          () => TimeoutManager.withTimeout(
            searchOperation(),
            15000,
            `${provider} search timeout`
          ),
          (error) => this.isRetryableError(error)
        ),
        async () => {
          log('Circuit breaker fallback activated', 'warn', { provider, searchId });
          return [];
        }
      ) ?? searchOperation());
      
      const responseTime = Date.now() - startTime;
      this.providerHealthMonitor.recordRequest(provider, true, responseTime);
      
      log('Provider search completed successfully', 'debug', {
        provider,
        searchId,
        resultCount: results.length,
        responseTime
      });
      
      return results;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.providerHealthMonitor.recordRequest(provider, false, responseTime);
      
      log('Provider search failed with error', 'error', {
        provider,
        searchId,
        responseTime,
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw error;
    }
  }

  private isRetryableError(error: any): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes('timeout') ||
        message.includes('network') ||
        message.includes('connection') ||
        message.includes('rate limit') ||
        message.includes('temporary') ||
        message.includes('502') ||
        message.includes('503') ||
        message.includes('504')
      );
    }
    return false;
  }

  private buildProviderOptions(
    provider: SearchProviderBase,
    query: SearchQuery,
    urlAttachments: string[],
    maxResults: number
  ): any {
    const baseOptions = {
      maxResults: Math.ceil(maxResults / 2)
    };
    
    switch (provider.name) {
      case 'exa':
        return { ...baseOptions, urlAttachments };
      case 'github':
        return {
          ...baseOptions,
          searchType: query.category === 'code' ? 'code' : query.category === 'qa' ? 'issues' : 'all',
          language: this.detectPrimaryLanguage(query.technologies),
          sort: query.urgency === 'high' ? 'updated' : 'relevance'
        };
      case 'stackoverflow':
        return {
          ...baseOptions,
          searchType: 'questions',
          tagged: query.technologies.filter(tech => 
            provider.config.specializations.technologies.includes(tech)
          ),
          minScore: query.urgency === 'high' ? 5 : 1,
          sort: query.urgency === 'high' ? 'votes' : 'relevance'
        };
      case 'semantic_scholar':
        return {
          ...baseOptions,
          fieldsOfStudy: this.mapTechnologiesToAcademicFields(query.technologies),
          minCitationCount: query.urgency === 'high' ? 10 : 1,
          openAccessOnly: false,
          sort: 'relevance'
        };
      default:
        return baseOptions;
    }
  }

  private detectPrimaryLanguage(technologies: string[]): string | undefined {
    const languageMap: Record<string, string> = {
      'react': 'javascript', 'vue': 'javascript', 'angular': 'typescript',
      'nodejs': 'javascript', 'express': 'javascript', 'javascript': 'javascript',
      'typescript': 'typescript', 'python': 'python', 'django': 'python',
      'flask': 'python', 'fastapi': 'python', 'java': 'java', 'spring': 'java',
      'kotlin': 'kotlin', 'swift': 'swift', 'go': 'go', 'rust': 'rust',
      'cpp': 'cpp', 'csharp': 'csharp', 'php': 'php', 'ruby': 'ruby'
    };
    
    for (const tech of technologies) {
      const language = languageMap[tech.toLowerCase()];
      if (language) return language;
    }
    return undefined;
  }
  
  private mapTechnologiesToAcademicFields(technologies: string[]): string[] {
    const fieldMap: Record<string, string[]> = {
      'machine learning': ['Computer Science'],
      'artificial intelligence': ['Computer Science'],
      'deep learning': ['Computer Science'],
      'neural networks': ['Computer Science'],
      'computer vision': ['Computer Science'],
      'natural language processing': ['Computer Science', 'Linguistics'],
      'data science': ['Computer Science', 'Mathematics'],
      'algorithms': ['Computer Science', 'Mathematics'],
      'software engineering': ['Computer Science'],
      'distributed systems': ['Computer Science'],
      'database systems': ['Computer Science'],
      'security': ['Computer Science'],
      'cryptography': ['Computer Science', 'Mathematics']
    };
    
    const fields = new Set<string>();
    technologies.forEach(tech => {
      const techFields = fieldMap[tech.toLowerCase()];
      if (techFields) {
        techFields.forEach(field => fields.add(field));
      }
    });
    
    return Array.from(fields);
  }

  private startHealthMonitoring(): void {
    this.performHealthChecks();
    
    this.healthMonitor = setInterval(() => {
      this.performHealthChecks();
    }, 60000);
    
    log('Production health monitoring started', 'info', {
      interval: '60 seconds',
      providers: Array.from(this.providers.keys()),
      features: ['Circuit breakers', 'Rate limiting', 'Performance tracking']
    });
  }

  private async performHealthChecks(): Promise<void> {
    const healthPromises = Array.from(this.providers.values()).map(async provider => {
      try {
        const startTime = Date.now();
        const isHealthy = await TimeoutManager.withTimeout(
          provider.performHealthCheck(),
          10000,
          `Health check timeout for ${provider.name}`
        );
        const responseTime = Date.now() - startTime;
        
        this.providerHealthMonitor.recordRequest(provider.name, isHealthy, responseTime);
        
        return { provider: provider.name, isHealthy, responseTime };
      } catch (error) {
        this.providerHealthMonitor.recordRequest(provider.name, false, 0);
        return { provider: provider.name, isHealthy: false, responseTime: 0 };
      }
    });
    
    const healthResults = await Promise.all(healthPromises);
    
    const healthyProviders = healthResults.filter(r => r.isHealthy);
    const unhealthyProviders = healthResults.filter(r => !r.isHealthy);
    
    if (unhealthyProviders.length > 0) {
      log('Production health check: unhealthy providers detected', 'warn', {
        unhealthy: unhealthyProviders.map(p => p.provider),
        healthy: healthyProviders.map(p => p.provider),
        circuitBreakerStates: Object.fromEntries(
          unhealthyProviders.map(p => [p.provider, this.circuitBreakers.get(p.provider as SearchProvider)?.getState()])
        )
      });
    }
    
    log('Production health check completed', 'debug', {
      totalProviders: this.providers.size,
      healthyProviders: healthyProviders.length,
      systemHealth: this.getSystemHealthSnapshot()
    });
  }

  private startMetricsReporting(): void {
    setInterval(() => {
      const metrics = this.metricsCollector.getMetrics();
      
      log('Production metrics report', 'info', {
        totalSearches: metrics.totalSearches,
        successRate: (metrics.successfulSearches / metrics.totalSearches) || 0,
        averageResponseTime: metrics.averageResponseTime,
        averageResultCount: metrics.averageResultCount,
        performancePercentiles: metrics.performancePercentiles,
        topErrors: Object.entries(metrics.errorDistribution)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
      });
    }, 300000); // Report every 5 minutes
  }

  getProductionMetrics(): SearchMetrics {
    return this.metricsCollector.getMetrics();
  }

  getSystemHealthSnapshot() {
    return {
      providers: this.providerHealthMonitor.getHealthyProviders(),
      circuitBreakers: Object.fromEntries(
        Array.from(this.circuitBreakers.entries()).map(([provider, cb]) => [
          provider,
          cb.getState()
        ])
      ),
      rateLimiters: Object.fromEntries(
        Array.from(this.rateLimiters.entries()).map(([provider, rl]) => [
          provider,
          rl.getStatus()
        ])
      ),
      overallHealth: this.providerHealthMonitor.getHealthyProviders().length / this.providers.size
    };
  }

  getPerformanceSnapshot() {
    const metrics = this.metricsCollector.getMetrics();
    return {
      averageResponseTime: metrics.averageResponseTime,
      successRate: metrics.successfulSearches / metrics.totalSearches || 0,
      performancePercentiles: metrics.performancePercentiles
    };
  }

  async gracefulShutdown(): Promise<void> {
    log('Starting graceful shutdown of production orchestrator', 'info');
    
    this.stopHealthMonitoring();
    
    // Wait for any ongoing operations to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    this.circuitBreakers.clear();
    this.rateLimiters.clear();
    this.providers.clear();
    
    log('Production orchestrator shutdown completed', 'info');
  }

  private stopHealthMonitoring(): void {
    if (this.healthMonitor) {
      clearInterval(this.healthMonitor);
      this.healthMonitor = null;
    }
  }
}

// ============================================================================
// Production Export Functions
// ============================================================================

let globalProductionOrchestrator: ProductionMultiProviderOrchestrator | null = null;

export function getProductionOrchestrator(): ProductionMultiProviderOrchestrator {
  if (!globalProductionOrchestrator) {
    globalProductionOrchestrator = new ProductionMultiProviderOrchestrator();
  }
  return globalProductionOrchestrator;
}

export async function productionMultiProviderSearch(
  query: string,
  urlAttachments: string[] = [],
  options?: {
    maxResults?: number;
    providers?: SearchProvider[];
    urgency?: 'high' | 'medium' | 'low';
    category?: 'code' | 'documentation' | 'qa' | 'academic' | 'general';
  }
): Promise<SearchOrchestrationResult> {
  const orchestrator = getProductionOrchestrator();
  return orchestrator.orchestrateSearch(query, urlAttachments, {
    maxResults: options?.maxResults,
    forceProviders: options?.providers,
    urgency: options?.urgency,
    category: options?.category
  });
}

export function getProductionMetrics(): SearchMetrics {
  const orchestrator = getProductionOrchestrator();
  return orchestrator.getProductionMetrics();
}

export function getProductionHealth() {
  const orchestrator = getProductionOrchestrator();
  return orchestrator.getSystemHealthSnapshot();
}

export async function shutdownProductionOrchestrator(): Promise<void> {
  if (globalProductionOrchestrator) {
    await globalProductionOrchestrator.gracefulShutdown();
    globalProductionOrchestrator = null;
  }
}