/**
 * RATE LIMITING MIDDLEWARE
 *
 * Token bucket algorithm implementation for API rate limiting.
 * Prevents abuse and ensures fair resource usage.
 */

import { NextResponse } from 'next/server';
import { log } from '@bitcode/logger';
import type { MiddlewareContext, MiddlewareHandler } from './index';

// In-memory store (replace with Redis in production)
const rateLimitStore = new Map<string, TokenBucket>();

interface TokenBucket {
  tokens: number;
  lastRefill: number;
  capacity: number;
  refillRate: number; // tokens per second
}

interface RateLimitConfig {
  capacity: number; // max tokens
  refillRate: number; // tokens per second
  costPerRequest?: number; // tokens consumed per request
  keyGenerator?: (context: MiddlewareContext) => string;
}

// Default configurations per route pattern
const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  '/api/generations': {
    capacity: 100,
    refillRate: 1, // 1 request per second sustained
    costPerRequest: 1
  },
  '/api/pipelines': {
    capacity: 50,
    refillRate: 0.5, // 1 request per 2 seconds sustained
    costPerRequest: 5 // Pipeline executions are expensive
  },
  '/api/otf-instructions': {
    capacity: 200,
    refillRate: 2,
    costPerRequest: 1
  },
  default: {
    capacity: 300,
    refillRate: 5,
    costPerRequest: 1
  }
};

/**
 * Rate limiting middleware handler
 */
export const rateLimitMiddleware: MiddlewareHandler = async (context) => {
  const { request, userId, requestId } = context;
  const pathname = request.nextUrl.pathname;

  // Skip rate limiting for internal/health checks
  if (pathname.startsWith('/api/health')) {
    return context;
  }

  // Get config for this route
  const config = getConfigForRoute(pathname);

  // Generate rate limit key
  const key = config.keyGenerator?.(context) ??
    userId ??
    request.headers.get('x-forwarded-for') ??
    'anonymous';

  // Apply rate limiting
  const allowed = consumeTokens(key, config);

  if (!allowed) {
    log('[rate-limit] Request blocked', 'warn', {
      requestId,
      key: key.substring(0, 8) + '...',
      pathname
    });

    // Get bucket info for retry-after header
    const bucket = rateLimitStore.get(key);
    const retryAfter = bucket ?
      Math.ceil((1 - bucket.tokens) / bucket.refillRate) :
      60;

    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(config.capacity),
          'X-RateLimit-Remaining': '0',
          'Retry-After': String(retryAfter)
        }
      }
    );
  }

  // Add rate limit info to response headers
  const bucket = rateLimitStore.get(key)!;
  context.metadata.set('rateLimit', {
    limit: config.capacity,
    remaining: Math.floor(bucket.tokens),
    reset: new Date(bucket.lastRefill + (1000 / bucket.refillRate))
  });

  return context;
};

/**
 * Consume tokens from bucket using token bucket algorithm
 */
function consumeTokens(key: string, config: RateLimitConfig): boolean {
  const now = Date.now();
  let bucket = rateLimitStore.get(key);

  if (!bucket) {
    // Create new bucket
    bucket = {
      tokens: config.capacity,
      lastRefill: now,
      capacity: config.capacity,
      refillRate: config.refillRate
    };
    rateLimitStore.set(key, bucket);
  } else {
    // Refill tokens based on time elapsed
    const elapsed = (now - bucket.lastRefill) / 1000; // seconds
    const tokensToAdd = elapsed * bucket.refillRate;
    bucket.tokens = Math.min(bucket.capacity, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  // Check if we have enough tokens
  const cost = config.costPerRequest ?? 1;
  if (bucket.tokens >= cost) {
    bucket.tokens -= cost;
    return true;
  }

  return false;
}

/**
 * Get rate limit config for route
 */
function getConfigForRoute(pathname: string): RateLimitConfig {
  // Find matching config
  for (const [pattern, config] of Object.entries(RATE_LIMIT_CONFIGS)) {
    if (pattern === 'default') continue;
    if (pathname.startsWith(pattern)) {
      return config;
    }
  }
  return RATE_LIMIT_CONFIGS.default;
}

/**
 * Clean up old buckets periodically
 */
setInterval(() => {
  const now = Date.now();
  const MAX_AGE = 60 * 60 * 1000; // 1 hour

  for (const [key, bucket] of rateLimitStore.entries()) {
    if (now - bucket.lastRefill > MAX_AGE) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Run every 5 minutes