/**
 * VCS Cache - Simple in-memory cache for VCS data
 * 
 * Provides efficient caching to reduce API calls and improve performance.
 * 
 * @doc-code
 * type: cache
 * category: vcs
 * pattern: memory-cache
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
}

/**
 * VCS Cache implementation
 */
export class VCSCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly ttl: number;
  private readonly maxSize: number;

  constructor(options: CacheOptions = {}) {
    this.ttl = options.ttl || 5 * 60 * 1000; // Default 5 minutes
    this.maxSize = options.maxSize || 1000; // Default 1000 entries
  }

  /**
   * Get cached data if still valid
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cache data
   */
  set<T>(key: string, data: T): void {
    // Implement LRU eviction if at max size
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear specific key, pattern, or all cache
   * @param pattern - Optional key or pattern with wildcards (e.g., "vcs:*userId*")
   */
  clear(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    // Check if pattern contains wildcards
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Exact key match
      this.cache.delete(pattern);
    }
  }

  /**
   * Get cache size
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get from cache or fetch if not present
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>
  ): Promise<T> {
    // Check cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch and cache
    const data = await fetcher();
    this.set(key, data);
    return data;
  }
}

/**
 * Build a cache key from operation and parameters
 */
export function buildCacheKey(
  operation: string,
  ...params: (string | number | boolean | undefined)[]
): string {
  const validParams = params.filter(p => p !== undefined);
  return `${operation}:${validParams.join(':')}`;
}