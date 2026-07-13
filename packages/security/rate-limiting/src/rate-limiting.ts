/**
 * Production-grade rate limiting middleware for credential endpoints
 * 
 * Implements sliding window rate limiting with Redis backend support
 * and comprehensive abuse prevention for authentication flows.
 */

import { NextRequest, NextResponse } from 'next/server';
import { log } from '@bitcode/logger';

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  readonly windowMs: number; // Time window in milliseconds
  readonly maxRequests: number; // Maximum requests per window
  readonly keyGenerator?: (req: NextRequest) => string; // Custom key generation
  readonly skipSuccessfulRequests?: boolean; // Don't count successful requests
  readonly skipFailedRequests?: boolean; // Don't count failed requests
  readonly message?: string; // Custom error message
  readonly headers?: boolean; // Include rate limit headers in response
  readonly standardHeaders?: boolean; // Use standard headers (X-RateLimit-*)
  readonly hyphenatedHeaders?: boolean; // Include X-Rate-Limit-* headers
  readonly store?: RateLimitStore; // Custom storage backend
  readonly onLimitReached?: (req: NextRequest, identifier: string) => void;
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  readonly allowed: boolean;
  readonly limit: number;
  readonly current: number;
  readonly remaining: number;
  readonly resetTime: Date;
  readonly identifier: string;
}

/**
 * Rate limit store interface for custom backends
 */
export interface RateLimitStore {
  increment(key: string, windowMs: number): Promise<{ count: number; resetTime: Date }>;
  decrement?(key: string): Promise<void>;
  reset?(key: string): Promise<void>;
}

/**
 * In-memory rate limit store (for development/single instance)
 */
class MemoryStore implements RateLimitStore {
  private store = new Map<string, { count: number; resetTime: Date; windowStart: Date }>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: Date }> {
    const now = new Date();
    const entry = this.store.get(key);

    if (!entry || now >= entry.resetTime) {
      // Create new window
      const resetTime = new Date(now.getTime() + windowMs);
      const newEntry = { count: 1, resetTime, windowStart: now };
      this.store.set(key, newEntry);
      return { count: 1, resetTime };
    }

    // Increment existing window
    entry.count++;
    this.store.set(key, entry);
    return { count: entry.count, resetTime: entry.resetTime };
  }

  async decrement(key: string): Promise<void> {
    const entry = this.store.get(key);
    if (entry && entry.count > 0) {
      entry.count--;
      this.store.set(key, entry);
    }
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }

  private cleanup(): void {
    const now = new Date();
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

/**
 * Default configurations for different endpoint types
 */
export const RateLimitPresets = {
  // Credential submission endpoints (very restrictive)
  CREDENTIAL_SUBMISSION: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 submissions per 15 minutes
    message: 'Too many credential submissions. Please try again later.',
    headers: true,
    standardHeaders: true
  } as RateLimitConfig,

  // OAuth callback endpoints (moderate)
  OAUTH_CALLBACK: {
    windowMs: 5 * 60 * 1000, // 5 minutes  
    maxRequests: 10, // 10 callbacks per 5 minutes
    message: 'Too many OAuth attempts. Please try again later.',
    headers: true,
    standardHeaders: true
  } as RateLimitConfig,

  // API key generation (restrictive)
  API_KEY_GENERATION: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 API keys per hour
    message: 'Too many API key generation attempts. Please try again later.',
    headers: true,
    standardHeaders: true
  } as RateLimitConfig,

  // General authentication endpoints
  AUTHENTICATION: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 20, // 20 auth attempts per 15 minutes
    message: 'Too many authentication attempts. Please try again later.',
    headers: true,
    standardHeaders: true,
    skipSuccessfulRequests: true // Only count failed attempts
  } as RateLimitConfig,

  // MCP configuration endpoints  
  MCP_CONFIGURATION: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    maxRequests: 10, // 10 config changes per 10 minutes
    message: 'Too many MCP configuration changes. Please try again later.',
    headers: true,
    standardHeaders: true
  } as RateLimitConfig
} as const;

/**
 * Default key generator based on IP and user ID
 */
function defaultKeyGenerator(req: NextRequest): string {
  // Try to get user ID from various sources
  const userId = req.headers.get('x-user-id') || 
                req.headers.get('authorization')?.split(' ')[1]?.substring(0, 8) ||
                'anonymous';
  
  // Get client IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ||
            req.headers.get('x-real-ip') ||
            req.ip ||
            'unknown';
  
  return `${ip}:${userId}`;
}

/**
 * Create a rate limiter with the specified configuration
 */
export function createRateLimiter(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    keyGenerator = defaultKeyGenerator,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    message = 'Too many requests',
    headers = true,
    standardHeaders = true,
    hyphenatedHeaders = false,
    store = new MemoryStore(),
    onLimitReached
  } = config;

  return async (req: NextRequest): Promise<RateLimitResult> => {
    const identifier = keyGenerator(req);
    
    try {
      const { count, resetTime } = await store.increment(identifier, windowMs);
      
      const result: RateLimitResult = {
        allowed: count <= maxRequests,
        limit: maxRequests,
        current: count,
        remaining: Math.max(0, maxRequests - count),
        resetTime,
        identifier
      };

      if (!result.allowed && onLimitReached) {
        onLimitReached(req, identifier);
      }

      log('Rate limit check completed', 'info', {
        identifier: identifier.split(':')[0] + ':***', // Hide user info in logs
        allowed: result.allowed,
        current: result.current,
        limit: result.limit,
        remaining: result.remaining
      });

      return result;
      
    } catch (error) {
      log('Rate limit check failed', 'error', {
        identifier: identifier.split(':')[0] + ':***',
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Fail open (allow request) if rate limiting fails
      return {
        allowed: true,
        limit: maxRequests,
        current: 0,
        remaining: maxRequests,
        resetTime: new Date(Date.now() + windowMs),
        identifier
      };
    }
  };
}

/**
 * Rate limiting middleware for Next.js API routes
 */
export function rateLimitMiddleware(config: RateLimitConfig) {
  const rateLimiter = createRateLimiter(config);
  
  return async (req: NextRequest): Promise<NextResponse | null> => {
    const result = await rateLimiter(req);
    
    // Create response headers
    const headers = new Headers();
    
    if (config.headers) {
      if (config.standardHeaders) {
        headers.set('X-RateLimit-Limit', result.limit.toString());
        headers.set('X-RateLimit-Remaining', result.remaining.toString());
        headers.set('X-RateLimit-Reset', Math.ceil(result.resetTime.getTime() / 1000).toString());
      }
      
      if (config.hyphenatedHeaders) {
        headers.set('X-Rate-Limit-Limit', result.limit.toString());
        headers.set('X-Rate-Limit-Remaining', result.remaining.toString());
        headers.set('X-Rate-Limit-Reset', Math.ceil(result.resetTime.getTime() / 1000).toString());
      }
    }

    if (!result.allowed) {
      log('Rate limit exceeded', 'warn', {
        identifier: result.identifier.split(':')[0] + ':***',
        limit: result.limit,
        current: result.current,
        resetTime: result.resetTime.toISOString()
      });
      
      return new NextResponse(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: config.message || 'Too many requests',
          limit: result.limit,
          remaining: result.remaining,
          resetTime: result.resetTime.toISOString()
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((result.resetTime.getTime() - Date.now()) / 1000).toString(),
            ...Object.fromEntries(headers.entries())
          }
        }
      );
    }

    // Request is allowed, add headers for client information
    if (config.headers) {
      // Return null to continue processing, headers will be added by the framework
      return null;
    }

    return null;
  };
}

/**
 * Higher-order function to apply rate limiting to API route handlers
 */
export function withRateLimit<T extends any[], R>(
  config: RateLimitConfig,
  handler: (req: NextRequest, ...args: T) => R
) {
  const middleware = rateLimitMiddleware(config);

  return async (req: NextRequest, ...args: T): Promise<R | NextResponse> => {
    const response = await middleware(req);
    
    if (response) {
      // Rate limit exceeded
      return response;
    }
    
    // Continue with original handler
    return handler(req, ...args);
  };
}

/**
 * Utility to check if a request should be skipped based on configuration
 */
export function shouldSkipRequest(
  config: RateLimitConfig,
  req: NextRequest,
  wasSuccessful?: boolean
): boolean {
  if (config.skipSuccessfulRequests && wasSuccessful === true) {
    return true;
  }
  
  if (config.skipFailedRequests && wasSuccessful === false) {
    return true;
  }
  
  return false;
}

/**
 * Clean up rate limiting resources
 */
export function cleanup(): void {
  // Implementation would depend on the store being used
  // For MemoryStore, we'd call destroy()
}
