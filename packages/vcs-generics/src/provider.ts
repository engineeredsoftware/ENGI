/**
 * VCS Provider - Standard implementation for provider implementations
 * 
 * Provides standard functionality including:
 * - Resilience patterns (retry, timeout)
 * - Error normalization and handling
 * - Pagination utilities
 * - Standard logging and metrics
 * 
 * @doc-code
 * type: provider-class
 * category: vcs
 * pattern: resilient-provider
 */

import { VCSProviderType, VCSError, VCSConfig } from './types';
import { log } from '@bitcode/logger';

// Simple retry and timeout utilities
// TODO: Move to proper resilience package when available
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  throw lastError;
}

async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    )
  ]);
}

/**
 * Standard VCS provider implementation
 */
export abstract class VCSProvider {
  abstract readonly type: VCSProviderType;
  
  protected readonly clientId: string;
  protected readonly clientSecret: string;
  protected readonly redirectUri: string;
  protected readonly instanceUrl?: string;
  
  // Default timeouts for different operation types
  protected readonly timeouts = {
    auth: 10000,      // 10s for auth operations
    read: 30000,      // 30s for read operations
    write: 60000,     // 60s for write operations
    heavy: 120000     // 120s for heavy operations (clone, etc)
  };

  constructor(config: VCSConfig) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri;
    this.instanceUrl = config.instanceUrl;
  }

  /**
   * Execute an API operation with standard error handling and retries
   */
  protected async executeWithResilience<T>(
    operation: () => Promise<T>,
    options: {
      operationName: string;
      timeout?: number;
      retryable?: boolean;
      maxAttempts?: number;
    }
  ): Promise<T> {
    const { operationName, timeout = this.timeouts.read, retryable = true, maxAttempts = 3 } = options;

    log(`Executing ${operationName}`, 'debug', {
      provider: this.type,
      timeout,
      retryable
    });

    try {
      const executor = retryable
        ? () => withRetry(operation, maxAttempts, 1000)
        : operation;

      const result = await withTimeout(executor, timeout);
      
      log(`${operationName} completed successfully`, 'debug', {
        provider: this.type
      });
      
      return result;
    } catch (error) {
      log(`${operationName} failed`, 'error', {
        provider: this.type,
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Transform provider-specific errors to standard VCS errors
      throw this.normalizeError(error, operationName);
    }
  }

  /**
   * Determine if an error is retryable
   */
  protected isRetryableError(error: unknown): boolean {
    const err = error as { message?: string; status?: number; response?: { status?: number } };
    const message = err.message?.toLowerCase() || '';
    const status = err.status || err.response?.status;

    // Network errors
    if (message.includes('network') || 
        message.includes('timeout') || 
        message.includes('econnrefused') ||
        message.includes('enotfound')) {
      return true;
    }

    // Rate limiting (retry with backoff)
    if (status === 429 || message.includes('rate limit')) {
      return true;
    }

    // Server errors (may be transient)
    if (status && status >= 500 && status < 600) {
      return true;
    }

    return false;
  }

  /**
   * Normalize provider-specific errors to standard VCS errors
   */
  protected normalizeError(error: unknown, operation: string): Error {
    // Handle undefined or null errors
    if (!error) {
      return new VCSError(`${operation} failed: No error details available`, 'OPERATION_FAILED');
    }
    
    const err = error as { message?: string; status?: number; response?: { status?: number } };
    const status = err?.status || err?.response?.status;
    const message = err?.message || String(error) || 'Unknown error';

    // Standardized error types
    if (status === 401) {
      return new VCSAuthError(`Authentication failed for ${operation}: ${message}`);
    }
    if (status === 403) {
      return new VCSPermissionError(`Permission denied for ${operation}: ${message}`);
    }
    if (status === 404) {
      return new VCSNotFoundError(`Resource not found for ${operation}: ${message}`);
    }
    if (status === 409) {
      return new VCSConflictError(`Conflict in ${operation}: ${message}`);
    }
    if (status === 422) {
      return new VCSValidationError(`Validation failed for ${operation}: ${message}`);
    }
    if (status === 429) {
      return new VCSRateLimitError(`Rate limit exceeded for ${operation}: ${message}`);
    }

    // Default to generic VCS error
    return new VCSError(`${operation} failed: ${message}`, 'OPERATION_FAILED', status, this.type);
  }

  /**
   * Build pagination parameters in a provider-agnostic way
   */
  protected buildPaginationParams(options?: {
    page?: number;
    perPage?: number;
  }): Record<string, unknown> {
    return {
      page: options?.page || 1,
      per_page: options?.perPage || 50
    };
  }

  /**
   * Extract pagination info from response headers
   */
  protected extractPaginationInfo(headers: Headers): {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } {
    // Most providers use Link header for pagination
    const linkHeader = headers.get('Link') || '';
    const totalCount = parseInt(headers.get('X-Total-Count') || '0', 10);
    
    const hasNextPage = linkHeader.includes('rel="next"');
    const hasPrevPage = linkHeader.includes('rel="prev"');
    
    // Extract page numbers from Link header
    const currentPageMatch = linkHeader.match(/[?&]page=(\d+).*?>; rel="self"/);
    const lastPageMatch = linkHeader.match(/[?&]page=(\d+).*?>; rel="last"/);
    
    const currentPage = currentPageMatch ? parseInt(currentPageMatch[1], 10) : 1;
    const totalPages = lastPageMatch ? parseInt(lastPageMatch[1], 10) : 1;

    return {
      currentPage,
      totalPages,
      totalCount,
      hasNextPage,
      hasPrevPage
    };
  }
}

/**
 * Custom VCS Error Classes
 */
export class VCSAuthError extends VCSError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR', 401);
  }
}

export class VCSPermissionError extends VCSError {
  constructor(message: string) {
    super(message, 'PERMISSION_ERROR', 403);
  }
}

export class VCSNotFoundError extends VCSError {
  constructor(message: string) {
    super(message, 'NOT_FOUND', 404);
  }
}

export class VCSConflictError extends VCSError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
  }
}

export class VCSValidationError extends VCSError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 422);
  }
}

export class VCSRateLimitError extends VCSError {
  constructor(message: string) {
    super(message, 'RATE_LIMIT', 429);
  }
}
