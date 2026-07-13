export interface CacheOptions {
  ttl?: number;
  maxSize?: number;
}

export class Cache<K, V> {
  private store = new Map<K, V>();

  constructor(_options: CacheOptions = {}) {}

  get(key: K): V | undefined {
    return this.store.get(key);
  }

  set(key: K, value: V): void {
    this.store.set(key, value);
  }

  has(key: K): boolean {
    return this.store.has(key);
  }

  delete(key: K): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}
