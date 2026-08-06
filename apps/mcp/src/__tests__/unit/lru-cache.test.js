"use strict";
/**
 * Unit tests for TTL cache implementation
 */
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const lru_cache_1 = require("../../caching-utilities/lru-cache");
(0, globals_1.describe)('TTLCache', () => {
    let cache;
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.useFakeTimers();
        cache = new lru_cache_1.TTLCache(3, 5000); // Max 3 items, 5 second TTL
    });
    (0, globals_1.afterEach)(() => {
        cache.destroy();
        globals_1.jest.useRealTimers();
    });
    (0, globals_1.describe)('Basic operations', () => {
        (0, globals_1.it)('should store and retrieve values', () => {
            cache.set('key1', 'value1');
            (0, globals_1.expect)(cache.get('key1')).toBe('value1');
        });
        (0, globals_1.it)('should return undefined for missing keys', () => {
            (0, globals_1.expect)(cache.get('missing')).toBeUndefined();
        });
        (0, globals_1.it)('should update existing values', () => {
            cache.set('key1', 'value1');
            cache.set('key1', 'value2');
            (0, globals_1.expect)(cache.get('key1')).toBe('value2');
        });
        (0, globals_1.it)('should delete values', () => {
            cache.set('key1', 'value1');
            (0, globals_1.expect)(cache.delete('key1')).toBe(true);
            (0, globals_1.expect)(cache.get('key1')).toBeUndefined();
            (0, globals_1.expect)(cache.delete('key1')).toBe(false);
        });
        (0, globals_1.it)('should check if key exists', () => {
            cache.set('key1', 'value1');
            (0, globals_1.expect)(cache.has('key1')).toBe(true);
            (0, globals_1.expect)(cache.has('missing')).toBe(false);
        });
        (0, globals_1.it)('should clear all entries', () => {
            cache.set('key1', 'value1');
            cache.set('key2', 'value2');
            cache.clear();
            (0, globals_1.expect)(cache.has('key1')).toBe(false);
            (0, globals_1.expect)(cache.has('key2')).toBe(false);
        });
    });
    (0, globals_1.describe)('LRU behavior', () => {
        (0, globals_1.it)('should evict least recently used item when full', () => {
            cache.set('key1', 'value1');
            cache.set('key2', 'value2');
            cache.set('key3', 'value3');
            cache.set('key4', 'value4'); // Should evict key1
            (0, globals_1.expect)(cache.has('key1')).toBe(false);
            (0, globals_1.expect)(cache.has('key2')).toBe(true);
            (0, globals_1.expect)(cache.has('key3')).toBe(true);
            (0, globals_1.expect)(cache.has('key4')).toBe(true);
        });
        (0, globals_1.it)('should update LRU order on get', () => {
            cache.set('key1', 'value1');
            cache.set('key2', 'value2');
            cache.set('key3', 'value3');
            // Access key1 to make it most recently used
            cache.get('key1');
            cache.set('key4', 'value4'); // Should evict key2
            (0, globals_1.expect)(cache.has('key1')).toBe(true);
            (0, globals_1.expect)(cache.has('key2')).toBe(false);
            (0, globals_1.expect)(cache.has('key3')).toBe(true);
            (0, globals_1.expect)(cache.has('key4')).toBe(true);
        });
        (0, globals_1.it)('should update LRU order on set', () => {
            cache.set('key1', 'value1');
            cache.set('key2', 'value2');
            cache.set('key3', 'value3');
            // Update key1 to make it most recently used
            cache.set('key1', 'newvalue1');
            cache.set('key4', 'value4'); // Should evict key2
            (0, globals_1.expect)(cache.has('key1')).toBe(true);
            (0, globals_1.expect)(cache.has('key2')).toBe(false);
            (0, globals_1.expect)(cache.has('key3')).toBe(true);
            (0, globals_1.expect)(cache.has('key4')).toBe(true);
        });
    });
    (0, globals_1.describe)('TTL behavior', () => {
        (0, globals_1.it)('should expire entries after TTL', () => {
            cache.set('key1', 'value1');
            (0, globals_1.expect)(cache.get('key1')).toBe('value1');
            // Advance time past TTL
            globals_1.jest.advanceTimersByTime(5001);
            (0, globals_1.expect)(cache.get('key1')).toBeUndefined();
        });
        (0, globals_1.it)('should not expire entries before TTL', () => {
            cache.set('key1', 'value1');
            // Advance time but not past TTL
            globals_1.jest.advanceTimersByTime(4999);
            (0, globals_1.expect)(cache.get('key1')).toBe('value1');
        });
        (0, globals_1.it)('should use custom TTL per entry', () => {
            cache.set('key1', 'value1', 1000); // 1 second TTL
            cache.set('key2', 'value2', 10000); // 10 second TTL
            // Advance past first TTL but not second
            globals_1.jest.advanceTimersByTime(2000);
            (0, globals_1.expect)(cache.get('key1')).toBeUndefined();
            (0, globals_1.expect)(cache.get('key2')).toBe('value2');
        });
        (0, globals_1.it)('should clean up expired entries periodically', () => {
            cache.set('key1', 'value1', 1000);
            cache.set('key2', 'value2', 70000);
            cache.set('key3', 'value3', 80000);
            // Advance time to expire key1
            globals_1.jest.advanceTimersByTime(1500);
            // Trigger cleanup interval (every 60 seconds)
            globals_1.jest.advanceTimersByTime(60000);
            (0, globals_1.expect)(cache.has('key1')).toBe(false);
            (0, globals_1.expect)(cache.has('key2')).toBe(true); // Still valid
            (0, globals_1.expect)(cache.has('key3')).toBe(true); // Still valid
        });
    });
    (0, globals_1.describe)('Edge cases', () => {
        (0, globals_1.it)('should handle null and undefined values', () => {
            cache.set('null', null);
            cache.set('undefined', undefined);
            (0, globals_1.expect)(cache.get('null')).toBeNull();
            (0, globals_1.expect)(cache.get('undefined')).toBeUndefined();
            (0, globals_1.expect)(cache.has('undefined')).toBe(true);
        });
        (0, globals_1.it)('should handle complex objects', () => {
            const obj = {
                nested: { value: 'test' },
                array: [1, 2, 3]
            };
            cache.set('complex', obj);
            const retrieved = cache.get('complex');
            (0, globals_1.expect)(retrieved).toEqual(obj);
            (0, globals_1.expect)(retrieved).toBe(obj); // Same reference
        });
        (0, globals_1.it)('should handle zero TTL', () => {
            const zeroTTLCache = new lru_cache_1.TTLCache(10, 0);
            zeroTTLCache.set('key1', 'value1');
            // Should expire immediately
            globals_1.jest.advanceTimersByTime(1);
            (0, globals_1.expect)(zeroTTLCache.get('key1')).toBeUndefined();
            zeroTTLCache.destroy();
        });
        (0, globals_1.it)('should handle large cache sizes', () => {
            const largeCache = new lru_cache_1.TTLCache(1000, 5000);
            // Fill cache
            for (let i = 0; i < 1000; i++) {
                largeCache.set(i, i * 2);
            }
            // Verify entries
            for (let i = 0; i < 1000; i++) {
                (0, globals_1.expect)(largeCache.get(i)).toBe(i * 2);
            }
            // Add one more to trigger eviction
            largeCache.set(1000, 2000);
            (0, globals_1.expect)(largeCache.has(0)).toBe(false); // First item evicted
            (0, globals_1.expect)(largeCache.has(1000)).toBe(true);
            largeCache.destroy();
        });
    });
    (0, globals_1.describe)('Cleanup and destruction', () => {
        (0, globals_1.it)('should stop cleanup interval on destroy', () => {
            const clearIntervalSpy = globals_1.jest.spyOn(global, 'clearInterval');
            cache.destroy();
            (0, globals_1.expect)(clearIntervalSpy).toHaveBeenCalled();
            clearIntervalSpy.mockRestore();
        });
        (0, globals_1.it)('should handle multiple destroy calls', () => {
            cache.destroy();
            cache.destroy(); // Should not throw
            // Cache should still work after destroy
            cache.set('key1', 'value1');
            (0, globals_1.expect)(cache.get('key1')).toBe('value1');
        });
    });
});
