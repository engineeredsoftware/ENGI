/**
 * Unit tests for TTL cache implementation
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { TTLCache } from '../../caching-utilities/lru-cache';

describe('TTLCache', () => {
  let cache: TTLCache<string, any>;
  
  beforeEach(() => {
    jest.useFakeTimers();
    cache = new TTLCache<string, any>(3, 5000); // Max 3 items, 5 second TTL
  });
  
  afterEach(() => {
    cache.destroy();
    jest.useRealTimers();
  });
  
  describe('Basic operations', () => {
    it('should store and retrieve values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });
    
    it('should return undefined for missing keys', () => {
      expect(cache.get('missing')).toBeUndefined();
    });
    
    it('should update existing values', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');
      expect(cache.get('key1')).toBe('value2');
    });
    
    it('should delete values', () => {
      cache.set('key1', 'value1');
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.delete('key1')).toBe(false);
    });
    
    it('should check if key exists', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('missing')).toBe(false);
    });
    
    it('should clear all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();
      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(false);
    });
  });
  
  describe('LRU behavior', () => {
    it('should evict least recently used item when full', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      cache.set('key4', 'value4'); // Should evict key1
      
      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(true);
      expect(cache.has('key3')).toBe(true);
      expect(cache.has('key4')).toBe(true);
    });
    
    it('should update LRU order on get', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      
      // Access key1 to make it most recently used
      cache.get('key1');
      
      cache.set('key4', 'value4'); // Should evict key2
      
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(false);
      expect(cache.has('key3')).toBe(true);
      expect(cache.has('key4')).toBe(true);
    });
    
    it('should update LRU order on set', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      
      // Update key1 to make it most recently used
      cache.set('key1', 'newvalue1');
      
      cache.set('key4', 'value4'); // Should evict key2
      
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(false);
      expect(cache.has('key3')).toBe(true);
      expect(cache.has('key4')).toBe(true);
    });
  });
  
  describe('TTL behavior', () => {
    it('should expire entries after TTL', () => {
      cache.set('key1', 'value1');
      
      expect(cache.get('key1')).toBe('value1');
      
      // Advance time past TTL
      jest.advanceTimersByTime(5001);
      
      expect(cache.get('key1')).toBeUndefined();
    });
    
    it('should not expire entries before TTL', () => {
      cache.set('key1', 'value1');
      
      // Advance time but not past TTL
      jest.advanceTimersByTime(4999);
      
      expect(cache.get('key1')).toBe('value1');
    });
    
    it('should use custom TTL per entry', () => {
      cache.set('key1', 'value1', 1000); // 1 second TTL
      cache.set('key2', 'value2', 10000); // 10 second TTL
      
      // Advance past first TTL but not second
      jest.advanceTimersByTime(2000);
      
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBe('value2');
    });
    
    it('should clean up expired entries periodically', () => {
      cache.set('key1', 'value1', 1000);
      cache.set('key2', 'value2', 70000);
      cache.set('key3', 'value3', 80000);
      
      // Advance time to expire key1
      jest.advanceTimersByTime(1500);
      
      // Trigger cleanup interval (every 60 seconds)
      jest.advanceTimersByTime(60000);
      
      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(true); // Still valid
      expect(cache.has('key3')).toBe(true); // Still valid
    });
  });
  
  describe('Edge cases', () => {
    it('should handle null and undefined values', () => {
      cache.set('null', null);
      cache.set('undefined', undefined);
      
      expect(cache.get('null')).toBeNull();
      expect(cache.get('undefined')).toBeUndefined();
      expect(cache.has('undefined')).toBe(true);
    });
    
    it('should handle complex objects', () => {
      const obj = {
        nested: { value: 'test' },
        array: [1, 2, 3]
      };
      
      cache.set('complex', obj);
      const retrieved = cache.get('complex');
      
      expect(retrieved).toEqual(obj);
      expect(retrieved).toBe(obj); // Same reference
    });
    
    it('should handle zero TTL', () => {
      const zeroTTLCache = new TTLCache<string, any>(10, 0);
      
      zeroTTLCache.set('key1', 'value1');
      
      // Should expire immediately
      jest.advanceTimersByTime(1);
      
      expect(zeroTTLCache.get('key1')).toBeUndefined();
      
      zeroTTLCache.destroy();
    });
    
    it('should handle large cache sizes', () => {
      const largeCache = new TTLCache<number, number>(1000, 5000);
      
      // Fill cache
      for (let i = 0; i < 1000; i++) {
        largeCache.set(i, i * 2);
      }
      
      // Verify entries
      for (let i = 0; i < 1000; i++) {
        expect(largeCache.get(i)).toBe(i * 2);
      }
      
      // Add one more to trigger eviction
      largeCache.set(1000, 2000);
      
      expect(largeCache.has(0)).toBe(false); // First item evicted
      expect(largeCache.has(1000)).toBe(true);
      
      largeCache.destroy();
    });
  });
  
  describe('Cleanup and destruction', () => {
    it('should stop cleanup interval on destroy', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      
      cache.destroy();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });
    
    it('should handle multiple destroy calls', () => {
      cache.destroy();
      cache.destroy(); // Should not throw
      
      // Cache should still work after destroy
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });
  });
});
