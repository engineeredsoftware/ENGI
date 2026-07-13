/**
 * Multi-Provider Search Orchestrator
 * 
 * This is the main orchestrator that coordinates multiple search providers,
 * intelligently routes queries, manages health monitoring, and fuses results
 * to provide the best possible research experience.
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
import { search as exaSearch, searchWithUrlIntelligence, UrlAttachmentAnalysis } from './index';
import { GitHubSearchProvider } from './providers/github';
import { StackOverflowSearchProvider } from './providers/stackoverflow';
import { SemanticScholarSearchProvider } from './providers/semantic-scholar';
import { FirecrawlSearchProvider } from './providers/firecrawl';

// ---------------------------------------------------------------------------
// Exa Provider Implementation
// ---------------------------------------------------------------------------

class ExaSearchProvider extends SearchProviderBase {
  readonly name = 'exa' as const;
  readonly config = {
    name: 'exa' as const,
    enabled: true,
    priority: 10, // Highest priority as it's our primary provider
    rateLimit: {
      requestsPerMinute: 60,
      requestsPerDay: 1000
    },
    healthCheck: {
      interval: 300000, // 5 minutes
      timeout: 10000
    },
    specializations: {
      categories: ['general', 'documentation', 'code', 'qa', 'academic'] as const,
      technologies: [], // Universal
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
      // Use URL intelligence if attachments are provided
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
      const testResponse = await exaSearch('test query', { numResults: 1 });
      return testResponse.results.length >= 0; // Even 0 results is a successful response
    } catch (error) {
      log('Exa health check failed', 'error', {
        provider: this.name,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }
}

// ---------------------------------------------------------------------------
// Main Orchestrator
// ---------------------------------------------------------------------------

export class MultiProviderSearchOrchestrator {
  private router: ProviderRouter;
  private queryAnalyzer: QueryAnalyzer;
  private fusionEngine: ResultFusionEngine;
  private healthMonitor: NodeJS.Timeout | null = null;
  private providers: Map<SearchProvider, SearchProviderBase> = new Map();
  
  constructor() {
    this.router = new ProviderRouter();
    this.queryAnalyzer = new QueryAnalyzer();
    this.fusionEngine = new ResultFusionEngine();
    
    this.initializeProviders();
    this.startHealthMonitoring();
  }
  
  private initializeProviders(): void {
    // Initialize all providers
    const providers = [
      new ExaSearchProvider(),
      new GitHubSearchProvider(),
      new StackOverflowSearchProvider(),
      new SemanticScholarSearchProvider(),
      new FirecrawlSearchProvider()
    ];
    
    providers.forEach(provider => {
      this.providers.set(provider.name, provider);
      this.router.registerProvider(provider);
    });
    
    log('Multi-provider orchestrator initialized', 'info', {
      providers: providers.map(p => p.name),
      enabledProviders: providers.filter(p => p.config.enabled).map(p => p.name)
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
    const {
      maxResults = 20,
      forceProviders,
      urgency = 'medium',
      category
    } = options || {};
    
    try {
      // Analyze the query
      const query = this.queryAnalyzer.analyzeQuery(queryText, urlAttachments);
      
      // Override category if provided
      if (category) {
        query.category = category;
      }
      
      // Override urgency if provided
      if (urgency) {
        query.urgency = urgency;
      }
      
      log('Starting orchestrated search', 'info', {
        query: query.text,
        category: query.category,
        technologies: query.technologies,
        urgency: query.urgency,
        urlAttachments: urlAttachments.length
      });
      
      // Route query to appropriate providers
      const selectedProviders = forceProviders || await this.router.routeQuery(query);
      
      if (selectedProviders.length === 0) {
        throw new Error('No healthy providers available for this query');
      }
      
      // Execute searches in parallel
      const searchPromises = selectedProviders.map(async providerName => {
        const provider = this.router.getProvider(providerName);
        if (!provider) {
          log('Provider not found', 'warn', { provider: providerName });
          return { provider: providerName, results: [] };
        }
        
        try {
          const providerOptions = this.buildProviderOptions(provider, query, urlAttachments, maxResults);
          const results = await provider.executeSearch(query, providerOptions);
          
          return {
            provider: providerName,
            results
          };
        } catch (error) {
          log('Provider search failed', 'error', {
            provider: providerName,
            error: error instanceof Error ? error.message : String(error)
          });
          return { provider: providerName, results: [] };
        }
      });
      
      const providerResults = await Promise.all(searchPromises);
      
      // Fuse results from all providers
      const fusedResult = this.fusionEngine.fuseResults(providerResults, query);
      
      const totalTime = Date.now() - startTime;
      
      log('Orchestrated search completed', 'info', {
        query: query.text,
        providers: selectedProviders,
        totalResults: fusedResult.results.length,
        totalTime,
        diversityScore: fusedResult.fusionMetrics.diversityScore,
        relevanceScore: fusedResult.fusionMetrics.relevanceScore
      });
      
      return fusedResult;
      
    } catch (error) {
      const totalTime = Date.now() - startTime;
      
      log('Orchestrated search failed', 'error', {
        query: queryText,
        totalTime,
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw error;
    }
  }
  
  private buildProviderOptions(
    provider: SearchProviderBase,
    query: SearchQuery,
    urlAttachments: string[],
    maxResults: number
  ): any {
    const baseOptions = {
      maxResults: Math.ceil(maxResults / 2) // Distribute results across providers
    };
    
    switch (provider.name) {
      case 'exa':
        return {
          ...baseOptions,
          urlAttachments
        };
        
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
        
      case 'firecrawl':
        return {
          ...baseOptions,
          searchType: urlAttachments.length > 0 ? 'crawl' : 'search',
          urlAttachments,
          limit: baseOptions.maxResults,
          country: 'US',
          lang: 'en'
        };
        
      default:
        return baseOptions;
    }
  }
  
  private detectPrimaryLanguage(technologies: string[]): string | undefined {
    const languageMap: Record<string, string> = {
      'react': 'javascript',
      'vue': 'javascript',
      'angular': 'typescript',
      'nodejs': 'javascript',
      'express': 'javascript',
      'javascript': 'javascript',
      'typescript': 'typescript',
      'python': 'python',
      'django': 'python',
      'flask': 'python',
      'fastapi': 'python',
      'java': 'java',
      'spring': 'java',
      'kotlin': 'kotlin',
      'swift': 'swift',
      'go': 'go',
      'rust': 'rust',
      'cpp': 'cpp',
      'csharp': 'csharp',
      'php': 'php',
      'ruby': 'ruby'
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
    // Perform initial health checks
    this.performHealthChecks();
    
    // Set up periodic health monitoring
    this.healthMonitor = setInterval(() => {
      this.performHealthChecks();
    }, 60000); // Check every minute
    
    log('Health monitoring started', 'info', {
      interval: '60 seconds',
      providers: Array.from(this.providers.keys())
    });
  }
  
  private async performHealthChecks(): Promise<void> {
    const healthPromises = Array.from(this.providers.values()).map(async provider => {
      try {
        const isHealthy = await provider.performHealthCheck();
        return { provider: provider.name, isHealthy };
      } catch (error) {
        log('Health check failed', 'error', {
          provider: provider.name,
          error: error instanceof Error ? error.message : String(error)
        });
        return { provider: provider.name, isHealthy: false };
      }
    });
    
    const healthResults = await Promise.all(healthPromises);
    
    const healthyProviders = healthResults.filter(r => r.isHealthy).map(r => r.provider);
    const unhealthyProviders = healthResults.filter(r => !r.isHealthy).map(r => r.provider);
    
    if (unhealthyProviders.length > 0) {
      log('Unhealthy providers detected', 'warn', {
        unhealthy: unhealthyProviders,
        healthy: healthyProviders
      });
    }
    
    // Update provider configurations based on health
    healthResults.forEach(({ provider, isHealthy }) => {
      const providerInstance = this.providers.get(provider);
      if (providerInstance) {
        providerInstance.getStats().isHealthy = isHealthy;
      }
    });
  }
  
  getProviderStats(): Record<SearchProvider, any> {
    const stats: Record<string, any> = {};
    
    this.providers.forEach((provider, name) => {
      stats[name] = provider.getStats();
    });
    
    return stats;
  }
  
  async getProviderHealthStatus(): Promise<Record<SearchProvider, boolean>> {
    const healthPromises = Array.from(this.providers.entries()).map(async ([name, provider]) => {
      try {
        const isHealthy = await provider.performHealthCheck();
        return [name, isHealthy] as const;
      } catch {
        return [name, false] as const;
      }
    });
    
    const results = await Promise.all(healthPromises);
    return Object.fromEntries(results);
  }
  
  stopHealthMonitoring(): void {
    if (this.healthMonitor) {
      clearInterval(this.healthMonitor);
      this.healthMonitor = null;
      log('Health monitoring stopped', 'info');
    }
  }
  
  async destroy(): Promise<void> {
    this.stopHealthMonitoring();
    this.providers.clear();
    log('Multi-provider orchestrator destroyed', 'info');
  }
}

// ---------------------------------------------------------------------------
// Convenience Functions
// ---------------------------------------------------------------------------

// Global orchestrator instance
let globalOrchestrator: MultiProviderSearchOrchestrator | null = null;

export function getOrchestrator(): MultiProviderSearchOrchestrator {
  if (!globalOrchestrator) {
    globalOrchestrator = new MultiProviderSearchOrchestrator();
  }
  return globalOrchestrator;
}

export async function multiProviderSearch(
  query: string,
  urlAttachments: string[] = [],
  options?: {
    maxResults?: number;
    providers?: SearchProvider[];
    urgency?: 'high' | 'medium' | 'low';
    category?: 'code' | 'documentation' | 'qa' | 'academic' | 'general';
  }
): Promise<SearchOrchestrationResult> {
  const orchestrator = getOrchestrator();
  return orchestrator.orchestrateSearch(query, urlAttachments, {
    maxResults: options?.maxResults,
    forceProviders: options?.providers,
    urgency: options?.urgency,
    category: options?.category
  });
}

export async function getProviderHealth(): Promise<Record<SearchProvider, boolean>> {
  const orchestrator = getOrchestrator();
  return orchestrator.getProviderHealthStatus();
}

export function getProviderStatistics(): Record<SearchProvider, any> {
  const orchestrator = getOrchestrator();
  return orchestrator.getProviderStats();
}

// Cleanup function for graceful shutdown
export async function shutdownOrchestrator(): Promise<void> {
  if (globalOrchestrator) {
    await globalOrchestrator.destroy();
    globalOrchestrator = null;
  }
}
