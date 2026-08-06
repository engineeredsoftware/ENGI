/**
 * Production-Grade Optimization and Caching Layer
 * Enterprise-Level Performance Optimization for Multi-Provider Search
 */

import { log } from '@bitcode/logger';
import { SearchResult, SearchQuery } from './multi-provider';

// ============================================================================
// LRU Cache Implementation for Search Results
// ============================================================================

interface CacheNode<T> {
  key: string;
  value: T;
  prev: CacheNode<T> | null;
  next: CacheNode<T> | null;
  timestamp: number;
  ttl: number;
}

export class LRUCache<T> {
  private capacity: number;
  private cache = new Map<string, CacheNode<T>>();
  private head: CacheNode<T> | null = null;
  private tail: CacheNode<T> | null = null;
  private size = 0;

  constructor(capacity: number = 1000) {
    this.capacity = capacity;
  }

  get(key: string): T | null {
    const node = this.cache.get(key);
    if (!node) return null;

    // Check TTL
    if (Date.now() > node.timestamp + node.ttl) {
      this.delete(key);
      return null;
    }

    // Move to head (most recently used)
    this.moveToHead(node);
    return node.value;
  }

  put(key: string, value: T, ttlMs: number = 300000): void { // 5 minutes default TTL
    const existingNode = this.cache.get(key);
    
    if (existingNode) {
      existingNode.value = value;
      existingNode.timestamp = Date.now();
      existingNode.ttl = ttlMs;
      this.moveToHead(existingNode);
      return;
    }

    const newNode: CacheNode<T> = {
      key,
      value,
      prev: null,
      next: null,
      timestamp: Date.now(),
      ttl: ttlMs
    };

    this.cache.set(key, newNode);
    this.addToHead(newNode);
    this.size++;

    if (this.size > this.capacity) {
      const tail = this.removeTail();
      if (tail) {
        this.cache.delete(tail.key);
        this.size--;
      }
    }
  }

  delete(key: string): boolean {
    const node = this.cache.get(key);
    if (!node) return false;

    this.removeNode(node);
    this.cache.delete(key);
    this.size--;
    return true;
  }

  clear(): void {
    this.cache.clear();
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  getStats() {
    return {
      size: this.size,
      capacity: this.capacity,
      hitRate: this.calculateHitRate(),
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  private moveToHead(node: CacheNode<T>): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  private addToHead(node: CacheNode<T>): void {
    node.prev = null;
    node.next = this.head;

    if (this.head) {
      this.head.prev = node;
    }

    this.head = node;

    if (!this.tail) {
      this.tail = node;
    }
  }

  private removeNode(node: CacheNode<T>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  private removeTail(): CacheNode<T> | null {
    if (!this.tail) return null;

    const tail = this.tail;
    this.removeNode(tail);
    return tail;
  }

  private hitCount = 0;
  private requestCount = 0;

  private calculateHitRate(): number {
    return this.requestCount > 0 ? this.hitCount / this.requestCount : 0;
  }

  private estimateMemoryUsage(): number {
    // Rough estimation of memory usage in bytes
    return this.size * 1024; // Assume 1KB per cache entry on average
  }
}

// ============================================================================
// Search Result Cache with Smart Invalidation
// ============================================================================

interface CachedSearchResult {
  results: SearchResult[];
  query: SearchQuery;
  timestamp: number;
  ttl: number;
  metadata: {
    providers: string[];
    resultCount: number;
    quality: number;
  };
}

export class SearchResultCache {
  private cache: LRUCache<CachedSearchResult>;
  private invalidationPatterns = new Map<string, RegExp[]>();

  constructor(capacity: number = 500) {
    this.cache = new LRUCache<CachedSearchResult>(capacity);
    this.setupInvalidationPatterns();
  }

  private setupInvalidationPatterns(): void {
    // Technology-specific invalidation patterns
    this.invalidationPatterns.set('react', [
      /react/i,
      /jsx/i,
      /hooks/i,
      /component/i
    ]);

    this.invalidationPatterns.set('javascript', [
      /javascript/i,
      /js/i,
      /node/i,
      /npm/i
    ]);

    this.invalidationPatterns.set('python', [
      /python/i,
      /pip/i,
      /django/i,
      /flask/i
    ]);
  }

  generateCacheKey(query: SearchQuery, options?: any): string {
    const keyComponents = [
      query.text.toLowerCase().replace(/\s+/g, '_'),
      query.category,
      query.urgency,
      query.technologies.sort().join(','),
      JSON.stringify(options || {})
    ];
    
    return keyComponents.join('|');
  }

  get(key: string): CachedSearchResult | null {
    return this.cache.get(key);
  }

  put(
    key: string, 
    results: SearchResult[], 
    query: SearchQuery, 
    providers: string[],
    ttlMs: number = 300000
  ): void {
    const qualityScore = this.calculateQualityScore(results);
    
    const cachedResult: CachedSearchResult = {
      results,
      query,
      timestamp: Date.now(),
      ttl: ttlMs,
      metadata: {
        providers,
        resultCount: results.length,
        quality: qualityScore
      }
    };

    this.cache.put(key, cachedResult, ttlMs);

    log('Search result cached', 'debug', {
      key,
      resultCount: results.length,
      quality: qualityScore,
      providers,
      ttlMs
    });
  }

  invalidateByPattern(pattern: string | RegExp): number {
    let invalidatedCount = 0;
    const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;

    // Note: This is a simplified implementation
    // In production, you might want to maintain a reverse index for efficient invalidation
    this.cache.clear(); // For now, clear all cache when invalidation is needed
    invalidatedCount = this.cache.getStats().size;

    log('Cache invalidated by pattern', 'info', {
      pattern: pattern.toString(),
      invalidatedCount
    });

    return invalidatedCount;
  }

  getStats() {
    return {
      cache: this.cache.getStats(),
      invalidationPatterns: this.invalidationPatterns.size
    };
  }

  private calculateQualityScore(results: SearchResult[]): number {
    if (results.length === 0) return 0;

    const avgScore = results.reduce((sum, result) => sum + result.score, 0) / results.length;
    const diversityBonus = new Set(results.map(r => r.provider)).size * 0.1;
    const authorityBonus = results.filter(r => 
      r.metadata?.authority === 'high'
    ).length / results.length * 0.2;

    return Math.min(avgScore + diversityBonus + authorityBonus, 1.0);
  }
}

// ============================================================================
// Query Optimization and Normalization
// ============================================================================

export class QueryOptimizer {
  private synonyms = new Map<string, string[]>();
  private stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'
  ]);

  constructor() {
    this.initializeSynonyms();
  }

  private initializeSynonyms(): void {
    this.synonyms.set('javascript', ['js', 'ecmascript', 'node.js', 'nodejs']);
    this.synonyms.set('typescript', ['ts']);
    this.synonyms.set('react', ['reactjs', 'react.js']);
    this.synonyms.set('vue', ['vuejs', 'vue.js']);
    this.synonyms.set('angular', ['angularjs']);
    this.synonyms.set('authentication', ['auth', 'login', 'signin', 'authorization']);
    this.synonyms.set('database', ['db', 'storage', 'persistence']);
    this.synonyms.set('api', ['rest', 'endpoint', 'service']);
  }

  normalizeQuery(queryText: string): string {
    // Convert to lowercase and remove extra whitespace
    let normalized = queryText.toLowerCase().trim().replace(/\s+/g, ' ');

    // Remove stop words (but be careful not to remove important technical terms)
    const words = normalized.split(' ');
    const filteredWords = words.filter(word => 
      !this.stopWords.has(word) || this.isImportantTechnicalTerm(word)
    );

    // Expand synonyms
    const expandedWords = filteredWords.map(word => {
      const synonyms = this.synonyms.get(word);
      return synonyms ? [word, ...synonyms].join('|') : word;
    });

    return expandedWords.join(' ');
  }

  generateQueryVariations(queryText: string): string[] {
    const variations = [queryText];
    const normalized = this.normalizeQuery(queryText);
    
    if (normalized !== queryText.toLowerCase()) {
      variations.push(normalized);
    }

    // Add technology-specific variations
    const technologies = this.extractTechnologies(queryText);
    technologies.forEach(tech => {
      const synonyms = this.synonyms.get(tech);
      if (synonyms) {
        synonyms.forEach(synonym => {
          const variation = queryText.replace(new RegExp(tech, 'gi'), synonym);
          if (!variations.includes(variation)) {
            variations.push(variation);
          }
        });
      }
    });

    return variations.slice(0, 5); // Limit variations to prevent explosion
  }

  private isImportantTechnicalTerm(word: string): boolean {
    const technicalTerms = ['api', 'db', 'ui', 'ux', 'ai', 'ml', 'ci', 'cd'];
    return technicalTerms.includes(word);
  }

  private extractTechnologies(queryText: string): string[] {
    const technologies: string[] = [];
    const lowerQuery = queryText.toLowerCase();

    for (const [tech, synonyms] of this.synonyms.entries()) {
      if (lowerQuery.includes(tech) || synonyms.some(syn => lowerQuery.includes(syn))) {
        technologies.push(tech);
      }
    }

    return technologies;
  }
}

// ============================================================================
// Performance Optimizer
// ============================================================================

export interface PerformanceMetrics {
  queryExecutionTime: number;
  cacheHitRate: number;
  providerResponseTimes: Record<string, number>;
  resultQuality: number;
  memoryUsage: number;
}

export class PerformanceOptimizer {
  private queryOptimizer: QueryOptimizer;
  private searchCache: SearchResultCache;
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetricsHistory = 1000;

  constructor() {
    this.queryOptimizer = new QueryOptimizer();
    this.searchCache = new SearchResultCache();
  }

  async optimizeSearch<T>(
    query: SearchQuery,
    searchFunction: (optimizedQuery: SearchQuery) => Promise<T>,
    options?: {
      enableCaching?: boolean;
      cacheThresholds?: {
        minQuality?: number;
        minResults?: number;
      };
    }
  ): Promise<T> {
    const startTime = Date.now();
    const { enableCaching = true, cacheThresholds = {} } = options || {};
    const { minQuality = 0.7, minResults = 3 } = cacheThresholds;

    // Generate cache key
    const cacheKey = this.searchCache.generateCacheKey(query, options);

    // Try cache first
    if (enableCaching) {
      const cached = this.searchCache.get(cacheKey);
      if (cached && this.isCacheValid(cached)) {
        log('Cache hit for optimized search', 'debug', { 
          query: query.text, 
          quality: cached.metadata.quality 
        });
        
        this.recordMetrics({
          queryExecutionTime: Date.now() - startTime,
          cacheHitRate: 1,
          providerResponseTimes: {},
          resultQuality: cached.metadata.quality,
          memoryUsage: this.estimateMemoryUsage()
        });

        return cached as unknown as T;
      }
    }

    // Optimize query
    const optimizedQuery = this.optimizeQuery(query);

    // Execute search
    const result = await searchFunction(optimizedQuery);

    // Cache result if it meets quality thresholds
    if (enableCaching && this.shouldCache(result, minQuality, minResults)) {
      const searchResult = result as any;
      if (searchResult.results && searchResult.metadata?.providers) {
        this.searchCache.put(
          cacheKey,
          searchResult.results,
          optimizedQuery,
          searchResult.metadata.providers,
          this.calculateTTL(searchResult)
        );
      }
    }

    // Record performance metrics
    this.recordMetrics({
      queryExecutionTime: Date.now() - startTime,
      cacheHitRate: 0,
      providerResponseTimes: this.extractProviderTimes(result),
      resultQuality: this.calculateResultQuality(result),
      memoryUsage: this.estimateMemoryUsage()
    });

    return result;
  }

  optimizeQuery(query: SearchQuery): SearchQuery {
    const optimizedText = this.queryOptimizer.normalizeQuery(query.text);
    
    return {
      ...query,
      text: optimizedText,
      // Add optimization metadata
      _metadata: {
        ...query._metadata,
        optimized: true,
        originalText: query.text,
        optimizations: ['normalized', 'stop_words_filtered']
      }
    };
  }

  getPerformanceReport(): {
    averageExecutionTime: number;
    cacheHitRate: number;
    memoryEfficiency: number;
    qualityTrend: number[];
    recommendations: string[];
  } {
    if (this.metrics.length === 0) {
      return {
        averageExecutionTime: 0,
        cacheHitRate: 0,
        memoryEfficiency: 0,
        qualityTrend: [],
        recommendations: ['No performance data available yet']
      };
    }

    const avgExecutionTime = this.metrics.reduce((sum, m) => sum + m.queryExecutionTime, 0) / this.metrics.length;
    const avgCacheHitRate = this.metrics.reduce((sum, m) => sum + m.cacheHitRate, 0) / this.metrics.length;
    const avgMemoryUsage = this.metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / this.metrics.length;
    const qualityTrend = this.metrics.slice(-10).map(m => m.resultQuality);

    const recommendations = this.generateRecommendations(avgExecutionTime, avgCacheHitRate, avgMemoryUsage);

    return {
      averageExecutionTime: avgExecutionTime,
      cacheHitRate: avgCacheHitRate,
      memoryEfficiency: 1 - (avgMemoryUsage / (1024 * 1024)), // Normalize to 0-1 scale
      qualityTrend,
      recommendations
    };
  }

  clearCache(): void {
    this.searchCache = new SearchResultCache();
    log('Search cache cleared', 'info');
  }

  getCacheStats() {
    return this.searchCache.getStats();
  }

  private isCacheValid(cached: CachedSearchResult): boolean {
    const age = Date.now() - cached.timestamp;
    return age < cached.ttl && cached.metadata.quality > 0.6;
  }

  private shouldCache(result: any, minQuality: number, minResults: number): boolean {
    if (!result.results || !Array.isArray(result.results)) return false;
    
    const quality = this.calculateResultQuality(result);
    return quality >= minQuality && result.results.length >= minResults;
  }

  private calculateTTL(result: any): number {
    const quality = this.calculateResultQuality(result);
    const baseTime = 300000; // 5 minutes
    
    // Higher quality results cache longer
    return Math.floor(baseTime * (1 + quality));
  }

  private calculateResultQuality(result: any): number {
    if (!result.results || !Array.isArray(result.results)) return 0;
    
    const avgScore = result.results.reduce((sum: number, r: any) => sum + (r.score || 0), 0) / result.results.length;
    return Math.min(avgScore, 1.0);
  }

  private extractProviderTimes(result: any): Record<string, number> {
    const times: Record<string, number> = {};
    
    if (result.providerUsage && Array.isArray(result.providerUsage)) {
      result.providerUsage.forEach((usage: any) => {
        if (usage.avgResponseTime) {
          times[usage.provider] = usage.avgResponseTime;
        }
      });
    }
    
    return times;
  }

  private recordMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);
    
    // Keep only recent metrics to prevent memory growth
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics.shift();
    }
  }

  private estimateMemoryUsage(): number {
    // Rough estimation of current memory usage
    return this.metrics.length * 200 + this.searchCache.getStats().cache.size * 1024;
  }

  private generateRecommendations(
    avgExecutionTime: number, 
    cacheHitRate: number, 
    memoryUsage: number
  ): string[] {
    const recommendations: string[] = [];

    if (avgExecutionTime > 5000) {
      recommendations.push('Consider optimizing provider timeouts or implementing request parallelization');
    }

    if (cacheHitRate < 0.3) {
      recommendations.push('Cache hit rate is low - consider adjusting cache TTL or query normalization');
    }

    if (memoryUsage > 50 * 1024 * 1024) { // 50MB
      recommendations.push('Memory usage is high - consider reducing cache size or implementing cache eviction');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance is within optimal ranges');
    }

    return recommendations;
  }
}

// ============================================================================
// Export Optimized Search Functions
// ============================================================================

const globalOptimizer = new PerformanceOptimizer();

export function getGlobalOptimizer(): PerformanceOptimizer {
  return globalOptimizer;
}

export async function optimizedMultiProviderSearch<T>(
  searchFunction: (query: SearchQuery) => Promise<T>,
  query: SearchQuery,
  options?: {
    enableCaching?: boolean;
    cacheThresholds?: {
      minQuality?: number;
      minResults?: number;
    };
  }
): Promise<T> {
  return globalOptimizer.optimizeSearch(query, searchFunction, options);
}

export function getPerformanceReport() {
  return globalOptimizer.getPerformanceReport();
}

export function clearSearchCache(): void {
  globalOptimizer.clearCache();
}