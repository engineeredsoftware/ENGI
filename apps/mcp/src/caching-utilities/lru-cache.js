"use strict";
/**
 * Simple LRU Cache implementation for auth context caching
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TTLCache = exports.LRUCache = void 0;
class LRUCache {
    constructor(maxSize = 1000) {
        this.maxSize = maxSize;
        this.cache = new Map();
        this.accessOrder = [];
    }
    get(key) {
        const value = this.cache.get(key);
        if (value !== undefined) {
            // Move to end (most recently used)
            this.updateAccessOrder(key);
        }
        return value;
    }
    set(key, value) {
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
    has(key) {
        return this.cache.has(key);
    }
    delete(key) {
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
    updateAccessOrder(key) {
        const index = this.accessOrder.indexOf(key);
        if (index > -1) {
            this.accessOrder.splice(index, 1);
        }
        this.accessOrder.push(key);
    }
    clear() {
        this.cache.clear();
        this.accessOrder = [];
    }
    size() {
        return this.cache.size;
    }
}
exports.LRUCache = LRUCache;
/**
 * LRU Cache with TTL support
 */
class TTLCache {
    constructor(maxSize = 1000, ttlMs = 5 * 60 * 1000) {
        this.cleanupInterval = null;
        this.store = new LRUCache(maxSize);
        this.ttl = ttlMs;
        // Run cleanup every minute
        this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
        this.cleanupInterval.unref?.();
    }
    get(key) {
        const entry = this.store.get(key);
        if (!entry)
            return undefined;
        if (Date.now() > entry.expires) {
            this.delete(key);
            return undefined;
        }
        return entry.value;
    }
    has(key) {
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
    set(key, value, customTTL) {
        const expires = Date.now() + (customTTL || this.ttl);
        this.store.set(key, { value, expires });
    }
    delete(key) {
        return this.store.delete(key);
    }
    clear() {
        this.store.clear();
    }
    size() {
        return this.store.size();
    }
    cleanup() {
        const now = Date.now();
        const keysToDelete = [];
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
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.store.clear();
    }
}
exports.TTLCache = TTLCache;
