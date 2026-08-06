"use strict";
/**
 * Unit tests for error recovery and retry logic
 */
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const error_recovery_1 = require("../../caching-utilities/error-recovery");
(0, globals_1.describe)('Error Recovery', () => {
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
    });
    (0, globals_1.describe)('classifyError', () => {
        (0, globals_1.it)('should classify rate limit errors', () => {
            (0, globals_1.expect)((0, error_recovery_1.classifyError)({ message: 'rate limit exceeded' })).toBe(error_recovery_1.ErrorType.RATE_LIMIT);
            (0, globals_1.expect)((0, error_recovery_1.classifyError)({ code: 429 })).toBe(error_recovery_1.ErrorType.RATE_LIMIT);
            (0, globals_1.expect)((0, error_recovery_1.classifyError)(new Error('API rate limit hit'))).toBe(error_recovery_1.ErrorType.RATE_LIMIT);
        });
        (0, globals_1.it)('should classify auth errors', () => {
            (0, globals_1.expect)((0, error_recovery_1.classifyError)({ message: 'unauthorized' })).toBe(error_recovery_1.ErrorType.AUTH);
            (0, globals_1.expect)((0, error_recovery_1.classifyError)({ code: 401 })).toBe(error_recovery_1.ErrorType.AUTH);
            (0, globals_1.expect)((0, error_recovery_1.classifyError)(new Error('Authentication failed'))).toBe(error_recovery_1.ErrorType.AUTH);
        });
        (0, globals_1.it)('should classify validation errors', () => {
            (0, globals_1.expect)((0, error_recovery_1.classifyError)({ message: 'invalid input' })).toBe(error_recovery_1.ErrorType.VALIDATION);
            (0, globals_1.expect)((0, error_recovery_1.classifyError)({ code: 400 })).toBe(error_recovery_1.ErrorType.VALIDATION);
            (0, globals_1.expect)((0, error_recovery_1.classifyError)(new Error('Validation failed'))).toBe(error_recovery_1.ErrorType.VALIDATION);
        });
        (0, globals_1.it)('should classify resource errors', () => {
            (0, globals_1.expect)((0, error_recovery_1.classifyError)({ message: 'out of memory' })).toBe(error_recovery_1.ErrorType.RESOURCE);
            (0, globals_1.expect)((0, error_recovery_1.classifyError)({ message: 'timeout' })).toBe(error_recovery_1.ErrorType.RESOURCE);
            (0, globals_1.expect)((0, error_recovery_1.classifyError)({ code: 503 })).toBe(error_recovery_1.ErrorType.RESOURCE);
        });
        (0, globals_1.it)('should classify transient errors', () => {
            (0, globals_1.expect)((0, error_recovery_1.classifyError)({ message: 'ECONNREFUSED' })).toBe(error_recovery_1.ErrorType.TRANSIENT);
            (0, globals_1.expect)((0, error_recovery_1.classifyError)({ message: 'ETIMEDOUT' })).toBe(error_recovery_1.ErrorType.TRANSIENT);
            (0, globals_1.expect)((0, error_recovery_1.classifyError)({ message: 'network error' })).toBe(error_recovery_1.ErrorType.TRANSIENT);
            (0, globals_1.expect)((0, error_recovery_1.classifyError)({ code: 502 })).toBe(error_recovery_1.ErrorType.TRANSIENT);
            (0, globals_1.expect)((0, error_recovery_1.classifyError)({ code: 504 })).toBe(error_recovery_1.ErrorType.TRANSIENT);
        });
        (0, globals_1.it)('should default to fatal for unknown errors', () => {
            (0, globals_1.expect)((0, error_recovery_1.classifyError)({ message: 'unknown error' })).toBe(error_recovery_1.ErrorType.FATAL);
            (0, globals_1.expect)((0, error_recovery_1.classifyError)(new Error('Something went wrong'))).toBe(error_recovery_1.ErrorType.FATAL);
        });
    });
    (0, globals_1.describe)('calculateRetryDelay', () => {
        const config = {
            maxAttempts: 5,
            initialDelayMs: 1000,
            maxDelayMs: 30000,
            backoffMultiplier: 2,
            jitterFactor: 0
        };
        (0, globals_1.it)('should calculate exponential backoff', () => {
            (0, globals_1.expect)((0, error_recovery_1.calculateRetryDelay)(1, config)).toBe(1000);
            (0, globals_1.expect)((0, error_recovery_1.calculateRetryDelay)(2, config)).toBe(2000);
            (0, globals_1.expect)((0, error_recovery_1.calculateRetryDelay)(3, config)).toBe(4000);
            (0, globals_1.expect)((0, error_recovery_1.calculateRetryDelay)(4, config)).toBe(8000);
            (0, globals_1.expect)((0, error_recovery_1.calculateRetryDelay)(5, config)).toBe(16000);
        });
        (0, globals_1.it)('should respect max delay', () => {
            (0, globals_1.expect)((0, error_recovery_1.calculateRetryDelay)(10, config)).toBe(30000);
        });
        (0, globals_1.it)('should add jitter', () => {
            const configWithJitter = { ...config, jitterFactor: 0.2 };
            // Run multiple times to test randomness
            const delays = [];
            for (let i = 0; i < 10; i++) {
                delays.push((0, error_recovery_1.calculateRetryDelay)(3, configWithJitter));
            }
            // Should have some variation
            const uniqueDelays = new Set(delays);
            (0, globals_1.expect)(uniqueDelays.size).toBeGreaterThan(1);
            // All should be within jitter range
            delays.forEach(delay => {
                (0, globals_1.expect)(delay).toBeGreaterThanOrEqual(4000 * 0.8); // -20%
                (0, globals_1.expect)(delay).toBeLessThanOrEqual(4000 * 1.2); // +20%
            });
        });
    });
    (0, globals_1.describe)('withRetry', () => {
        (0, globals_1.it)('should succeed on first attempt', async () => {
            const fn = globals_1.jest.fn().mockResolvedValue('success');
            const result = await (0, error_recovery_1.withRetry)(fn);
            (0, globals_1.expect)(result).toBe('success');
            (0, globals_1.expect)(fn).toHaveBeenCalledTimes(1);
        });
        (0, globals_1.it)('should retry transient failures', async () => {
            const fn = globals_1.jest.fn()
                .mockRejectedValueOnce(new Error('ECONNREFUSED'))
                .mockRejectedValueOnce(new Error('ETIMEDOUT'))
                .mockResolvedValue('success');
            const result = await (0, error_recovery_1.withRetry)(fn, {
                ...error_recovery_1.DEFAULT_RETRY_CONFIGS.transient,
                initialDelayMs: 10 // Speed up test
            });
            (0, globals_1.expect)(result).toBe('success');
            (0, globals_1.expect)(fn).toHaveBeenCalledTimes(3);
        });
        (0, globals_1.it)('should not retry non-retryable errors', async () => {
            const fn = globals_1.jest.fn()
                .mockRejectedValue(new Error('Invalid input'));
            await (0, globals_1.expect)((0, error_recovery_1.withRetry)(fn, error_recovery_1.DEFAULT_RETRY_CONFIGS.transient)).rejects.toThrow('Invalid input');
            (0, globals_1.expect)(fn).toHaveBeenCalledTimes(1);
        });
        (0, globals_1.it)('should respect max attempts', async () => {
            const fn = globals_1.jest.fn()
                .mockRejectedValue(new Error('ECONNREFUSED'));
            await (0, globals_1.expect)((0, error_recovery_1.withRetry)(fn, {
                maxAttempts: 3,
                initialDelayMs: 10,
                maxDelayMs: 10,
                backoffMultiplier: 1,
                jitterFactor: 0,
                retryableErrors: [error_recovery_1.ErrorType.TRANSIENT]
            })).rejects.toThrow('ECONNREFUSED');
            (0, globals_1.expect)(fn).toHaveBeenCalledTimes(3);
        });
        (0, globals_1.it)('should provide context in logs', async () => {
            const fn = globals_1.jest.fn()
                .mockRejectedValueOnce(new Error('network error'))
                .mockResolvedValue('success');
            const result = await (0, error_recovery_1.withRetry)(fn, {
                ...error_recovery_1.DEFAULT_RETRY_CONFIGS.transient,
                initialDelayMs: 10
            }, { operation: 'test-operation', metadata: { key: 'value' } });
            (0, globals_1.expect)(result).toBe('success');
        });
    });
    (0, globals_1.describe)('ErrorRecovery', () => {
        (0, globals_1.describe)('recoverFromAuthError', () => {
            (0, globals_1.it)('should clear auth cache', async () => {
                const context = {
                    authCache: {
                        clear: globals_1.jest.fn()
                    }
                };
                const recovered = await error_recovery_1.ErrorRecovery.recoverFromAuthError(new Error('Auth failed'), context);
                (0, globals_1.expect)(context.authCache.clear).toHaveBeenCalled();
                (0, globals_1.expect)(recovered).toBe(false); // Currently doesn't auto-recover
            });
        });
        (0, globals_1.describe)('recoverFromResourceError', () => {
            (0, globals_1.it)('should wait and attempt recovery', async () => {
                const start = Date.now();
                const recovered = await error_recovery_1.ErrorRecovery.recoverFromResourceError(new Error('Out of memory'), {});
                const elapsed = Date.now() - start;
                (0, globals_1.expect)(elapsed).toBeGreaterThanOrEqual(5000);
                (0, globals_1.expect)(recovered).toBe(true);
            }, 10000); // Increase timeout for this test
        });
        (0, globals_1.describe)('recoverFromRateLimitError', () => {
            (0, globals_1.it)('should wait for rate limit reset', async () => {
                const error = {
                    message: 'Rate limited',
                    retryAfter: 2 // 2 seconds
                };
                const start = Date.now();
                const recovered = await error_recovery_1.ErrorRecovery.recoverFromRateLimitError(error, {});
                const elapsed = Date.now() - start;
                (0, globals_1.expect)(elapsed).toBeGreaterThanOrEqual(2000);
                (0, globals_1.expect)(recovered).toBe(true);
            }, 5000);
        });
        (0, globals_1.describe)('attemptRecovery', () => {
            (0, globals_1.it)('should route to appropriate recovery method', async () => {
                // Auth error
                (0, globals_1.expect)(await error_recovery_1.ErrorRecovery.attemptRecovery({ message: 'unauthorized' }, {})).toBe(false);
                // Transient error
                (0, globals_1.expect)(await error_recovery_1.ErrorRecovery.attemptRecovery({ message: 'ECONNREFUSED' }, {})).toBe(true);
                // Fatal error
                (0, globals_1.expect)(await error_recovery_1.ErrorRecovery.attemptRecovery({ message: 'unknown fatal error' }, {})).toBe(false);
            });
        });
    });
    (0, globals_1.describe)('withErrorRecovery', () => {
        (0, globals_1.it)('should wrap function with retry and recovery', async () => {
            const fn = globals_1.jest.fn()
                .mockRejectedValueOnce(new Error('ECONNREFUSED'))
                .mockResolvedValue('success');
            const wrapped = (0, error_recovery_1.withErrorRecovery)(fn, {
                retryConfig: {
                    ...error_recovery_1.DEFAULT_RETRY_CONFIGS.transient,
                    initialDelayMs: 10
                },
                operation: 'test-op'
            });
            const result = await wrapped();
            (0, globals_1.expect)(result).toBe('success');
            (0, globals_1.expect)(fn).toHaveBeenCalledTimes(2);
        });
        (0, globals_1.it)('should attempt recovery after retries fail', async () => {
            const fn = globals_1.jest.fn()
                .mockRejectedValue(new Error('ECONNREFUSED'));
            const wrapped = (0, error_recovery_1.withErrorRecovery)(fn, {
                retryConfig: {
                    maxAttempts: 2,
                    initialDelayMs: 10,
                    maxDelayMs: 10,
                    backoffMultiplier: 1,
                    jitterFactor: 0,
                    retryableErrors: [error_recovery_1.ErrorType.TRANSIENT]
                },
                enableRecovery: true
            });
            await (0, globals_1.expect)(wrapped()).rejects.toThrow('ECONNREFUSED');
            // 2 attempts from retry + 1 from recovery
            (0, globals_1.expect)(fn).toHaveBeenCalledTimes(3);
        });
    });
});
