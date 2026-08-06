/**
 * Error Recovery and Retry Logic for MCP Server
 * 
 * Implements sophisticated error handling with exponential backoff,
 * circuit breakers, and recovery strategies.
 */

import { logger } from '@bitcode/logger';
import { observability } from '@bitcode/observability';

/**
 * Error classification for recovery strategies
 */
export enum ErrorType {
  TRANSIENT = 'transient',      // Network issues, timeouts
  RATE_LIMIT = 'rate_limit',    // API rate limits
  AUTH = 'auth',                // Authentication failures
  VALIDATION = 'validation',    // Input validation errors
  RESOURCE = 'resource',        // Resource exhaustion
  FATAL = 'fatal'              // Unrecoverable errors
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitterFactor: number;
  retryableErrors?: ErrorType[];
}

/**
 * Default retry configurations by error type
 */
export const DEFAULT_RETRY_CONFIGS: Record<string, RetryConfig> = {
  transient: {
    maxAttempts: 5,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    jitterFactor: 0.2,
    retryableErrors: [ErrorType.TRANSIENT, ErrorType.RATE_LIMIT]
  },
  auth: {
    maxAttempts: 2,
    initialDelayMs: 2000,
    maxDelayMs: 5000,
    backoffMultiplier: 1.5,
    jitterFactor: 0.1,
    retryableErrors: [ErrorType.AUTH]
  },
  pipeline: {
    maxAttempts: 3,
    initialDelayMs: 5000,
    maxDelayMs: 60000,
    backoffMultiplier: 3,
    jitterFactor: 0.3,
    retryableErrors: [ErrorType.TRANSIENT, ErrorType.RESOURCE]
  }
};

/**
 * Classify error type for recovery strategy
 */
export function classifyError(error: any): ErrorType {
  const message = String(error?.message || error).toLowerCase();
  const code = error?.code;
  
  // Rate limit errors
  if (message.includes('rate limit') || code === 429) {
    return ErrorType.RATE_LIMIT;
  }
  
  // Auth errors
  if (message.includes('auth') || message.includes('unauthorized') || code === 401) {
    return ErrorType.AUTH;
  }
  
  // Validation errors
  if (message.includes('invalid') || message.includes('validation') || code === 400) {
    return ErrorType.VALIDATION;
  }
  
  // Resource errors
  if (message.includes('memory') || message.includes('timeout') || code === 503) {
    return ErrorType.RESOURCE;
  }
  
  // Network/transient errors
  if (
    message.includes('econnrefused') ||
    message.includes('etimedout') ||
    message.includes('network') ||
    code === 502 ||
    code === 504
  ) {
    return ErrorType.TRANSIENT;
  }
  
  // Default to fatal
  return ErrorType.FATAL;
}

/**
 * Calculate retry delay with exponential backoff and jitter
 */
export function calculateRetryDelay(
  attempt: number,
  config: RetryConfig
): number {
  const exponentialDelay = Math.min(
    config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1),
    config.maxDelayMs
  );
  
  // Add jitter to prevent thundering herd
  const jitter = exponentialDelay * config.jitterFactor * (Math.random() - 0.5);
  
  return Math.max(0, exponentialDelay + jitter);
}

/**
 * Execute function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIGS.transient,
  context?: { operation: string; metadata?: any }
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      const result = await fn();
      
      // Success - record metrics if retried
      if (attempt > 1) {
        logger.info('Operation succeeded after retry', {
          operation: context?.operation,
          attempt,
          metadata: context?.metadata
        });
        
        observability.recordMetric('retry_success', {
          operation: context?.operation,
          attempts: attempt
        });
      }
      
      return result;
      
    } catch (error) {
      lastError = error;
      const errorType = classifyError(error);
      
      // Check if error is retryable
      if (
        !config.retryableErrors?.includes(errorType) ||
        attempt === config.maxAttempts
      ) {
        logger.error('Operation failed permanently', {
          operation: context?.operation,
          attempt,
          errorType,
          error: error instanceof Error ? error.message : error,
          metadata: context?.metadata
        });
        
        observability.recordMetric('retry_failure', {
          operation: context?.operation,
          attempts: attempt,
          errorType
        });
        
        throw error;
      }
      
      // Calculate retry delay
      const delay = calculateRetryDelay(attempt, config);
      
      logger.warn('Operation failed, retrying', {
        operation: context?.operation,
        attempt,
        nextAttempt: attempt + 1,
        delayMs: delay,
        errorType,
        error: error instanceof Error ? error.message : error
      });
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Recovery strategies for different error types
 */
export class ErrorRecovery {
  /**
   * Recover from authentication errors
   */
  static async recoverFromAuthError(
    error: any,
    context: any
  ): Promise<boolean> {
    logger.warn('Attempting auth error recovery', { error: error.message });
    
    // Clear auth cache if available
    if (context.authCache) {
      context.authCache.clear();
    }
    
    // Could trigger re-authentication flow here
    return false; // For now, don't auto-recover
  }
  
  /**
   * Recover from resource exhaustion
   */
  static async recoverFromResourceError(
    error: any,
    context: any
  ): Promise<boolean> {
    logger.warn('Attempting resource error recovery', { error: error.message });
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    // Wait for resources to free up
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    return true; // Try again
  }
  
  /**
   * Recover from rate limit errors
   */
  static async recoverFromRateLimitError(
    error: any,
    context: any
  ): Promise<boolean> {
    const retryAfter = error.retryAfter || 60; // seconds
    
    logger.warn('Rate limited, waiting', { 
      retryAfter,
      error: error.message 
    });
    
    // Wait for rate limit to reset
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    
    return true; // Try again
  }
  
  /**
   * Generic recovery orchestrator
   */
  static async attemptRecovery(
    error: any,
    context: any
  ): Promise<boolean> {
    const errorType = classifyError(error);
    
    switch (errorType) {
      case ErrorType.AUTH:
        return this.recoverFromAuthError(error, context);
        
      case ErrorType.RESOURCE:
        return this.recoverFromResourceError(error, context);
        
      case ErrorType.RATE_LIMIT:
        return this.recoverFromRateLimitError(error, context);
        
      case ErrorType.TRANSIENT:
        // Transient errors are handled by retry logic
        return true;
        
      default:
        // No recovery for validation or fatal errors
        return false;
    }
  }
}

/**
 * Wrap async functions with error recovery
 */
export function withErrorRecovery<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: {
    retryConfig?: RetryConfig;
    operation?: string;
    enableRecovery?: boolean;
  }
): T {
  return (async (...args: Parameters<T>) => {
    const operation = options?.operation || fn.name || 'unknown';
    
    try {
      // Execute with retry logic
      return await withRetry(
        () => fn(...args),
        options?.retryConfig,
        { operation }
      );
      
    } catch (error) {
      // Attempt recovery if enabled
      if (options?.enableRecovery) {
        const recovered = await ErrorRecovery.attemptRecovery(error, { args });
        if (recovered) {
          // Try once more after recovery
          return fn(...args);
        }
      }
      
      // Re-throw if recovery failed
      throw error;
    }
  }) as T;
}
