/**
 * Rate Limiting and Circuit Breaker Middleware for MCP Server
 * 
 * Industrial-grade protection against abuse and cascading failures.
 */

import { logger } from '@bitcode/logger';
import { observability } from '@bitcode/observability';
import type { MCPAuthContext } from '../types';

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  windowMs: number;           // Time window in milliseconds
  maxRequests: number;        // Max requests per window
  maxBurst: number;          // Max burst requests
  keyGenerator: (context: MCPAuthContext) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
  failureThreshold: number;   // Number of failures to open circuit
  resetTimeout: number;       // Time to wait before half-open state (ms)
  monitoringPeriod: number;   // Time window for failure counting (ms)
  halfOpenRequests: number;   // Requests allowed in half-open state
  excludeErrors?: string[];   // Error messages to exclude from failure count
}

/**
 * Circuit breaker states
 */
enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half-open'
}

/**
 * Rate limiter implementation using sliding window
 */
export class RateLimiter {
  private windows = new Map<string, Array<{ timestamp: number; count: number }>>();
  
  constructor(private config: RateLimitConfig) {}
  
  /**
   * Check if request should be allowed
   */
  async checkLimit(context: MCPAuthContext): Promise<{
    allowed: boolean;
    limit: number;
    remaining: number;
    resetAt: Date;
  }> {
    const key = this.config.keyGenerator(context);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    // Get or create window for this key
    if (!this.windows.has(key)) {
      this.windows.set(key, []);
    }
    
    const window = this.windows.get(key)!;
    
    // Remove expired entries
    const activeWindow = window.filter(entry => entry.timestamp > windowStart);
    this.windows.set(key, activeWindow);
    
    // Calculate current request count
    const currentCount = activeWindow.reduce((sum, entry) => sum + entry.count, 0);
    
    // Check burst limit
    const recentBurst = activeWindow
      .filter(entry => entry.timestamp > now - 1000) // Last second
      .reduce((sum, entry) => sum + entry.count, 0);
      
    if (recentBurst >= this.config.maxBurst) {
      return {
        allowed: false,
        limit: this.config.maxRequests,
        remaining: 0,
        resetAt: new Date(windowStart + this.config.windowMs)
      };
    }
    
    // Check window limit
    if (currentCount >= this.config.maxRequests) {
      return {
        allowed: false,
        limit: this.config.maxRequests,
        remaining: 0,
        resetAt: new Date(windowStart + this.config.windowMs)
      };
    }
    
    // Add current request
    activeWindow.push({ timestamp: now, count: 1 });
    
    return {
      allowed: true,
      limit: this.config.maxRequests,
      remaining: this.config.maxRequests - currentCount - 1,
      resetAt: new Date(now + this.config.windowMs)
    };
  }
  
  /**
   * Record request result for adaptive limiting
   */
  recordResult(context: MCPAuthContext, success: boolean): void {
    if ((success && this.config.skipSuccessfulRequests) ||
        (!success && this.config.skipFailedRequests)) {
      // Remove the last entry if we should skip this result
      const key = this.config.keyGenerator(context);
      const window = this.windows.get(key);
      if (window && window.length > 0) {
        window.pop();
      }
    }
  }
}

/**
 * Circuit breaker implementation
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures = 0;
  private successes = 0;
  private lastFailureTime = 0;
  private halfOpenRequests = 0;
  private stateChangeCallbacks: Array<(state: CircuitState) => void> = [];
  
  constructor(
    private name: string,
    private config: CircuitBreakerConfig
  ) {}
  
  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(
    fn: () => Promise<T>
  ): Promise<T> {
    // Check circuit state
    if (this.state === CircuitState.OPEN) {
      const now = Date.now();
      if (now - this.lastFailureTime >= this.config.resetTimeout) {
        this.transitionTo(CircuitState.HALF_OPEN);
      } else {
        throw new Error(`Circuit breaker ${this.name} is OPEN`);
      }
    }
    
    if (this.state === CircuitState.HALF_OPEN) {
      if (this.halfOpenRequests >= this.config.halfOpenRequests) {
        throw new Error(`Circuit breaker ${this.name} is testing`);
      }
      this.halfOpenRequests++;
    }
    
    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure(error);
      throw error;
    }
  }
  
  /**
   * Record successful execution
   */
  private recordSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.transitionTo(CircuitState.CLOSED);
    }
    this.failures = 0;
    this.halfOpenRequests = 0;
    this.successes++;
  }
  
  /**
   * Record failed execution
   */
  private recordFailure(error: any): void {
    const errorMessage = error?.message || String(error);
    
    // Check if error should be excluded
    if (this.config.excludeErrors?.some(msg => errorMessage.includes(msg))) {
      return;
    }
    
    const now = Date.now();
    
    // Reset failure count if outside monitoring period
    if (now - this.lastFailureTime > this.config.monitoringPeriod) {
      this.failures = 0;
    }
    
    this.failures++;
    this.lastFailureTime = now;
    
    if (this.failures >= this.config.failureThreshold) {
      this.transitionTo(CircuitState.OPEN);
    }
    
    logger.warn('Circuit breaker failure recorded', {
      name: this.name,
      failures: this.failures,
      threshold: this.config.failureThreshold,
      state: this.state
    });
  }
  
  /**
   * Transition to new state
   */
  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;
    this.halfOpenRequests = 0;
    
    logger.info('Circuit breaker state transition', {
      name: this.name,
      from: oldState,
      to: newState
    });
    
    observability.recordMetric('circuit_breaker_state', {
      name: this.name,
      state: newState,
      failures: this.failures
    });
    
    // Notify callbacks
    this.stateChangeCallbacks.forEach(cb => cb(newState));
  }
  
  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  getStats(): { failures: number; successes: number; successRate: number } {
    const total = this.failures + this.successes;
    return {
      failures: this.failures,
      successes: this.successes,
      successRate: total > 0 ? this.successes / total : 1,
    };
  }
  
  /**
   * Subscribe to state changes
   */
  onStateChange(callback: (state: CircuitState) => void): void {
    this.stateChangeCallbacks.push(callback);
  }
}

/**
 * Default rate limit configurations
 */
export const DEFAULT_RATE_LIMITS = {
  // Per-user limits
  user: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 100,         // 100 requests per minute
    maxBurst: 10,             // 10 requests per second burst
    keyGenerator: (ctx: MCPAuthContext) => `user:${ctx.userId}`
  },
  
  // Per-organization limits
  organization: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 500,         // 500 requests per minute
    maxBurst: 50,             // 50 requests per second burst
    keyGenerator: (ctx: MCPAuthContext) => `org:${ctx.organizationId || 'none'}`
  },
  
  // Pipeline creation limits
  pipelineCreation: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50,          // 50 pipelines per hour
    maxBurst: 5,              // 5 pipelines per minute
    keyGenerator: (ctx: MCPAuthContext) => `pipeline:${ctx.userId}`,
    skipFailedRequests: true  // Don't count failed attempts
  }
};

/**
 * Default circuit breaker configurations
 */
export const DEFAULT_CIRCUIT_BREAKERS = {
  // External API calls
  externalApi: {
    failureThreshold: 5,
    resetTimeout: 30 * 1000,    // 30 seconds
    monitoringPeriod: 60 * 1000, // 1 minute
    halfOpenRequests: 3,
    excludeErrors: ['User cancelled', 'Insufficient $BTD balance']
  },
  
  // Database operations
  database: {
    failureThreshold: 10,
    resetTimeout: 10 * 1000,    // 10 seconds
    monitoringPeriod: 30 * 1000, // 30 seconds
    halfOpenRequests: 5
  },
  
  // Pipeline execution
  pipeline: {
    failureThreshold: 3,
    resetTimeout: 60 * 1000,    // 1 minute
    monitoringPeriod: 5 * 60 * 1000, // 5 minutes
    halfOpenRequests: 1
  }
};

/**
 * Create rate limit middleware
 */
export function createRateLimitMiddleware(
  limiter: RateLimiter
) {
  return async (context: MCPAuthContext, next: () => Promise<any>) => {
    const result = await limiter.checkLimit(context);
    
    if (!result.allowed) {
      observability.recordMetric('rate_limit_exceeded', {
        userId: context.userId,
        remaining: result.remaining
      });
      
      throw new Error(`Rate limit exceeded. Try again at ${result.resetAt.toISOString()}`);
    }
    
    try {
      const response = await next();
      limiter.recordResult(context, true);
      return response;
    } catch (error) {
      limiter.recordResult(context, false);
      throw error;
    }
  };
}
