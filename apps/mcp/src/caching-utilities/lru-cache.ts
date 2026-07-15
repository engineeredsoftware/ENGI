/**
 * Simple LRU Cache implementation for auth context caching
 */

export class LRUCache<K, V> {
  private maxSize: number;
  protected cache: Map<K, V>;
  protected accessOrder: K[];

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
    this.cache = new Map();
    this.accessOrder = [];
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.updateAccessOrder(key);
    }
    return value;
  }

  set(key: K, value: V): void {
    // If key exists, update it
    if (this.cache.has(key)) {
      this.cache.set(key, value);
      this.updateAccessOrder(key);
      return;
    }

    // If at capacity, remove least recently used
    if (this.cache.size >= this.maxSize) {
      const lru = this.accessOrder.shift();
      if (lru !== undefined) {
        this.cache.delete(lru);
      }
    }

    // Add new entry
    this.cache.set(key, value);
    this.accessOrder.push(key);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    const deleted = this.cache.delete(key);
    if (!deleted) {
      return false;
    }

    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }

    return true;
  }

  private updateAccessOrder(key: K): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Time-based expiring cache entry
 */
export interface ExpiringCacheEntry<T> {
  value: T;
  expires: number;
}

/**
 * LRU Cache with TTL support
 */
export class TTLCache<K, V> {
  private ttl: number;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly store: LRUCache<K, ExpiringCacheEntry<V>>;

  constructor(maxSize: number = 1000, ttlMs: number = 5 * 60 * 1000) {
    this.store = new LRUCache<K, ExpiringCacheEntry<V>>(maxSize);
    this.ttl = ttlMs;
    
    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
    this.cleanupInterval.unref?.();
  }

  get(key: K): V | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    
    if (Date.now() > entry.expires) {
      this.delete(key);
      return undefined;
    }
    
    return entry.value;
  }

  has(key: K): boolean {
    const entry = this.store.get(key);
    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expires) {
      this.delete(key);
      return false;
    }

    return true;
  }

  set(key: K, value: V, customTTL?: number): void {
    const expires = Date.now() + (customTTL || this.ttl);
    this.store.set(key, { value, expires });
  }

  delete(key: K): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size();
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: K[] = [];
    
    // Note: This is not the most efficient but works for our use case
    // In production, consider using a priority queue for expiration times
    for (const [key, entry] of this.store['cache'].entries()) {
      if (now > entry.expires) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.delete(key);
    });
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
}
