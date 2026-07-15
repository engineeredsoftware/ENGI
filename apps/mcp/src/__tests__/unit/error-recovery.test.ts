/**
 * Unit tests for error recovery and retry logic
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  classifyError,
  calculateRetryDelay,
  withRetry,
  ErrorType,
  ErrorRecovery,
  withErrorRecovery,
  DEFAULT_RETRY_CONFIGS
} from '../../caching-utilities/error-recovery';

describe('Error Recovery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('classifyError', () => {
    it('should classify rate limit errors', () => {
      expect(classifyError({ message: 'rate limit exceeded' })).toBe(ErrorType.RATE_LIMIT);
      expect(classifyError({ code: 429 })).toBe(ErrorType.RATE_LIMIT);
      expect(classifyError(new Error('API rate limit hit'))).toBe(ErrorType.RATE_LIMIT);
    });
    
    it('should classify auth errors', () => {
      expect(classifyError({ message: 'unauthorized' })).toBe(ErrorType.AUTH);
      expect(classifyError({ code: 401 })).toBe(ErrorType.AUTH);
      expect(classifyError(new Error('Authentication failed'))).toBe(ErrorType.AUTH);
    });
    
    it('should classify validation errors', () => {
      expect(classifyError({ message: 'invalid input' })).toBe(ErrorType.VALIDATION);
      expect(classifyError({ code: 400 })).toBe(ErrorType.VALIDATION);
      expect(classifyError(new Error('Validation failed'))).toBe(ErrorType.VALIDATION);
    });
    
    it('should classify resource errors', () => {
      expect(classifyError({ message: 'out of memory' })).toBe(ErrorType.RESOURCE);
      expect(classifyError({ message: 'timeout' })).toBe(ErrorType.RESOURCE);
      expect(classifyError({ code: 503 })).toBe(ErrorType.RESOURCE);
    });
    
    it('should classify transient errors', () => {
      expect(classifyError({ message: 'ECONNREFUSED' })).toBe(ErrorType.TRANSIENT);
      expect(classifyError({ message: 'ETIMEDOUT' })).toBe(ErrorType.TRANSIENT);
      expect(classifyError({ message: 'network error' })).toBe(ErrorType.TRANSIENT);
      expect(classifyError({ code: 502 })).toBe(ErrorType.TRANSIENT);
      expect(classifyError({ code: 504 })).toBe(ErrorType.TRANSIENT);
    });
    
    it('should default to fatal for unknown errors', () => {
      expect(classifyError({ message: 'unknown error' })).toBe(ErrorType.FATAL);
      expect(classifyError(new Error('Something went wrong'))).toBe(ErrorType.FATAL);
    });
  });
  
  describe('calculateRetryDelay', () => {
    const config = {
      maxAttempts: 5,
      initialDelayMs: 1000,
      maxDelayMs: 30000,
      backoffMultiplier: 2,
      jitterFactor: 0
    };
    
    it('should calculate exponential backoff', () => {
      expect(calculateRetryDelay(1, config)).toBe(1000);
      expect(calculateRetryDelay(2, config)).toBe(2000);
      expect(calculateRetryDelay(3, config)).toBe(4000);
      expect(calculateRetryDelay(4, config)).toBe(8000);
      expect(calculateRetryDelay(5, config)).toBe(16000);
    });
    
    it('should respect max delay', () => {
      expect(calculateRetryDelay(10, config)).toBe(30000);
    });
    
    it('should add jitter', () => {
      const configWithJitter = { ...config, jitterFactor: 0.2 };
      
      // Run multiple times to test randomness
      const delays = [];
      for (let i = 0; i < 10; i++) {
        delays.push(calculateRetryDelay(3, configWithJitter));
      }
      
      // Should have some variation
      const uniqueDelays = new Set(delays);
      expect(uniqueDelays.size).toBeGreaterThan(1);
      
      // All should be within jitter range
      delays.forEach(delay => {
        expect(delay).toBeGreaterThanOrEqual(4000 * 0.8); // -20%
        expect(delay).toBeLessThanOrEqual(4000 * 1.2); // +20%
      });
    });
  });
  
  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      
      const result = await withRetry(fn);
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });
    
    it('should retry transient failures', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('ECONNREFUSED'))
        .mockRejectedValueOnce(new Error('ETIMEDOUT'))
        .mockResolvedValue('success');
      
      const result = await withRetry(fn, {
        ...DEFAULT_RETRY_CONFIGS.transient,
        initialDelayMs: 10 // Speed up test
      });
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });
    
    it('should not retry non-retryable errors', async () => {
      const fn = jest.fn()
        .mockRejectedValue(new Error('Invalid input'));
      
      await expect(
        withRetry(fn, DEFAULT_RETRY_CONFIGS.transient)
      ).rejects.toThrow('Invalid input');
      
      expect(fn).toHaveBeenCalledTimes(1);
    });
    
    it('should respect max attempts', async () => {
      const fn = jest.fn()
        .mockRejectedValue(new Error('ECONNREFUSED'));
      
      await expect(
        withRetry(fn, {
          maxAttempts: 3,
          initialDelayMs: 10,
          maxDelayMs: 10,
          backoffMultiplier: 1,
          jitterFactor: 0,
          retryableErrors: [ErrorType.TRANSIENT]
        })
      ).rejects.toThrow('ECONNREFUSED');
      
      expect(fn).toHaveBeenCalledTimes(3);
    });
    
    it('should provide context in logs', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('network error'))
        .mockResolvedValue('success');
      
      const result = await withRetry(
        fn,
        {
          ...DEFAULT_RETRY_CONFIGS.transient,
          initialDelayMs: 10
        },
        { operation: 'test-operation', metadata: { key: 'value' } }
      );
      
      expect(result).toBe('success');
    });
  });
  
  describe('ErrorRecovery', () => {
    describe('recoverFromAuthError', () => {
      it('should clear auth cache', async () => {
        const context = {
          authCache: {
            clear: jest.fn()
          }
        };
        
        const recovered = await ErrorRecovery.recoverFromAuthError(
          new Error('Auth failed'),
          context
        );
        
        expect(context.authCache.clear).toHaveBeenCalled();
        expect(recovered).toBe(false); // Currently doesn't auto-recover
      });
    });
    
    describe('recoverFromResourceError', () => {
      it('should wait and attempt recovery', async () => {
        const start = Date.now();
        
        const recovered = await ErrorRecovery.recoverFromResourceError(
          new Error('Out of memory'),
          {}
        );
        
        const elapsed = Date.now() - start;
        expect(elapsed).toBeGreaterThanOrEqual(5000);
        expect(recovered).toBe(true);
      }, 10000); // Increase timeout for this test
    });
    
    describe('recoverFromRateLimitError', () => {
      it('should wait for rate limit reset', async () => {
        const error = {
          message: 'Rate limited',
          retryAfter: 2 // 2 seconds
        };
        
        const start = Date.now();
        
        const recovered = await ErrorRecovery.recoverFromRateLimitError(
          error,
          {}
        );
        
        const elapsed = Date.now() - start;
        expect(elapsed).toBeGreaterThanOrEqual(2000);
        expect(recovered).toBe(true);
      }, 5000);
    });
    
    describe('attemptRecovery', () => {
      it('should route to appropriate recovery method', async () => {
        // Auth error
        expect(
          await ErrorRecovery.attemptRecovery(
            { message: 'unauthorized' },
            {}
          )
        ).toBe(false);
        
        // Transient error
        expect(
          await ErrorRecovery.attemptRecovery(
            { message: 'ECONNREFUSED' },
            {}
          )
        ).toBe(true);
        
        // Fatal error
        expect(
          await ErrorRecovery.attemptRecovery(
            { message: 'unknown fatal error' },
            {}
          )
        ).toBe(false);
      });
    });
  });
  
  describe('withErrorRecovery', () => {
    it('should wrap function with retry and recovery', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('ECONNREFUSED'))
        .mockResolvedValue('success');
      
      const wrapped = withErrorRecovery(fn, {
        retryConfig: {
          ...DEFAULT_RETRY_CONFIGS.transient,
          initialDelayMs: 10
        },
        operation: 'test-op'
      });
      
      const result = await wrapped();
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });
    
    it('should attempt recovery after retries fail', async () => {
      const fn = jest.fn()
        .mockRejectedValue(new Error('ECONNREFUSED'));
      
      const wrapped = withErrorRecovery(fn, {
        retryConfig: {
          maxAttempts: 2,
          initialDelayMs: 10,
          maxDelayMs: 10,
          backoffMultiplier: 1,
          jitterFactor: 0,
          retryableErrors: [ErrorType.TRANSIENT]
        },
        enableRecovery: true
      });
      
      await expect(wrapped()).rejects.toThrow('ECONNREFUSED');
      
      // 2 attempts from retry + 1 from recovery
      expect(fn).toHaveBeenCalledTimes(3);
    });
  });
});
