/**
 * Production-Grade Resilience Layer for Multi-Provider Web Search
 * Enterprise-Level Error Handling, Circuit Breakers, and Fallback Strategies
 */

import { log } from '@bitcode/logger';

// ============================================================================
// Circuit Breaker Pattern Implementation
// ============================================================================

export interface CircuitBreakerConfig {
  failureThreshold: number;
  timeoutMs: number;
  resetTimeoutMs: number;
  monitoringPeriodMs: number;
}

export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private readonly config: CircuitBreakerConfig;
  
  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }

  async execute<T>(operation: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.config.resetTimeoutMs) {
        this.state = 'HALF_OPEN';
        log('Circuit breaker transitioning to HALF_OPEN', 'info');
      } else {
        log('Circuit breaker OPEN - executing fallback', 'warn');
        if (fallback) {
          return await fallback();
        }
        throw new Error('Circuit breaker is OPEN and no fallback provided');
      }
    }

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Operation timeout')), this.config.timeoutMs);
      });

      const result = await Promise.race([operation(), timeoutPromise]);
      
      if (this.state === 'HALF_OPEN') {
        this.reset();
      }
      
      return result;
    } catch (error) {
      this.recordFailure();
      
      log('Circuit breaker recorded failure', 'error', {
        failures: this.failures,
        state: this.state,
        error: error instanceof Error ? error.message : String(error)
      });

      if (fallback && this.state === 'OPEN') {
        return await fallback();
      }
      
      throw error;
    }
  }

  private recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.config.failureThreshold) {
      this.state = 'OPEN';
      log('Circuit breaker opened due to failures', 'error', {
        failures: this.failures,
        threshold: this.config.failureThreshold
      });
    }
  }

  private reset(): void {
    this.failures = 0;
    this.state = 'CLOSED';
    log('Circuit breaker reset to CLOSED', 'info');
  }

  getState(): string {
    return this.state;
  }

  getMetrics() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    };
  }
}

// ============================================================================
// Retry Strategy with Exponential Backoff
// ============================================================================

export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitterMs?: number;
}

export class RetryStrategy {
  private readonly config: RetryConfig;

  constructor(config: RetryConfig) {
    this.config = config;
  }

  async execute<T>(
    operation: () => Promise<T>,
    isRetryable: (error: any) => boolean = () => true
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        const result = await operation();
        
        if (attempt > 1) {
          log('Retry successful', 'info', { attempt, totalAttempts: this.config.maxAttempts });
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        log('Operation failed, considering retry', 'warn', {
          attempt,
          maxAttempts: this.config.maxAttempts,
          error: error instanceof Error ? error.message : String(error),
          retryable: isRetryable(error)
        });

        if (attempt === this.config.maxAttempts || !isRetryable(error)) {
          break;
        }

        const delay = this.calculateDelay(attempt);
        await this.sleep(delay);
      }
    }

    log('All retry attempts failed', 'error', {
      attempts: this.config.maxAttempts,
      finalError: lastError instanceof Error ? lastError.message : String(lastError)
    });

    throw lastError;
  }

  private calculateDelay(attempt: number): number {
    const baseDelay = this.config.baseDelayMs * Math.pow(this.config.backoffMultiplier, attempt - 1);
    const jitter = this.config.jitterMs ? Math.random() * this.config.jitterMs : 0;
    return Math.min(baseDelay + jitter, this.config.maxDelayMs);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// Rate Limiter Implementation
// ============================================================================

export interface RateLimiterConfig {
  requestsPerMinute: number;
  burstSize?: number;
}

export class RateLimiter {
  private requests: number[] = [];
  private readonly config: RateLimiterConfig;

  constructor(config: RateLimiterConfig) {
    this.config = config;
  }

  async acquire(): Promise<boolean> {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Remove old requests
    this.requests = this.requests.filter(timestamp => timestamp > oneMinuteAgo);
    
    if (this.requests.length < this.config.requestsPerMinute) {
      this.requests.push(now);
      return true;
    }
    
    log('Rate limit exceeded', 'warn', {
      currentRequests: this.requests.length,
      limit: this.config.requestsPerMinute
    });
    
    return false;
  }

  async waitForAvailability(): Promise<void> {
    while (!await this.acquire()) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = (oldestRequest + 60000) - Date.now();
      
      if (waitTime > 0) {
        log('Waiting for rate limit reset', 'info', { waitTimeMs: waitTime });
        await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 1000)));
      }
    }
  }

  getStatus() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const currentRequests = this.requests.filter(timestamp => timestamp > oneMinuteAgo).length;
    
    return {
      currentRequests,
      limit: this.config.requestsPerMinute,
      available: this.config.requestsPerMinute - currentRequests,
      resetTime: this.requests.length > 0 ? Math.min(...this.requests) + 60000 : now
    };
  }
}

// ============================================================================
// Provider Health Monitor
// ============================================================================

export interface ProviderHealthMetrics {
  provider: string;
  isHealthy: boolean;
  successRate: number;
  averageResponseTime: number;
  lastHealthCheck: Date;
  consecutiveFailures: number;
  totalRequests: number;
  totalFailures: number;
}

export class ProviderHealthMonitor {
  private metrics = new Map<string, ProviderHealthMetrics>();
  private readonly healthThreshold = 0.8; // 80% success rate
  private readonly responseTimeThreshold = 5000; // 5 seconds
  private readonly maxConsecutiveFailures = 3;

  recordRequest(provider: string, success: boolean, responseTime: number): void {
    const existing = this.metrics.get(provider) || {
      provider,
      isHealthy: true,
      successRate: 1,
      averageResponseTime: 0,
      lastHealthCheck: new Date(),
      consecutiveFailures: 0,
      totalRequests: 0,
      totalFailures: 0
    };

    existing.totalRequests++;
    existing.lastHealthCheck = new Date();

    if (success) {
      existing.consecutiveFailures = 0;
      existing.averageResponseTime = (existing.averageResponseTime + responseTime) / 2;
    } else {
      existing.totalFailures++;
      existing.consecutiveFailures++;
    }

    existing.successRate = (existing.totalRequests - existing.totalFailures) / existing.totalRequests;
    
    // Update health status
    existing.isHealthy = this.evaluateHealth(existing);

    this.metrics.set(provider, existing);

    log('Provider health updated', 'debug', {
      provider,
      isHealthy: existing.isHealthy,
      successRate: existing.successRate.toFixed(2),
      consecutiveFailures: existing.consecutiveFailures
    });
  }

  private evaluateHealth(metrics: ProviderHealthMetrics): boolean {
    return (
      metrics.successRate >= this.healthThreshold &&
      metrics.averageResponseTime <= this.responseTimeThreshold &&
      metrics.consecutiveFailures < this.maxConsecutiveFailures
    );
  }

  getHealthStatus(provider: string): ProviderHealthMetrics | null {
    return this.metrics.get(provider) || null;
  }

  getAllHealthStatus(): Map<string, ProviderHealthMetrics> {
    return new Map(this.metrics);
  }

  getHealthyProviders(): string[] {
    return Array.from(this.metrics.entries())
      .filter(([_, metrics]) => metrics.isHealthy)
      .map(([provider]) => provider);
  }

  isProviderHealthy(provider: string): boolean {
    const metrics = this.metrics.get(provider);
    return metrics?.isHealthy ?? true; // Default to healthy for new providers
  }
}

// ============================================================================
// Fallback Strategy Manager
// ============================================================================

export interface FallbackConfig {
  primaryProviders: string[];
  fallbackProviders: string[];
  emergencyFallback?: () => Promise<any>;
}

export class FallbackManager {
  private healthMonitor: ProviderHealthMonitor;
  private config: FallbackConfig;

  constructor(healthMonitor: ProviderHealthMonitor, config: FallbackConfig) {
    this.healthMonitor = healthMonitor;
    this.config = config;
  }

  async executeWithFallback<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperations: (() => Promise<T>)[] = [],
    provider: string
  ): Promise<T> {
    // Try primary operation first
    try {
      const startTime = Date.now();
      const result = await primaryOperation();
      const responseTime = Date.now() - startTime;
      
      this.healthMonitor.recordRequest(provider, true, responseTime);
      return result;
    } catch (error) {
      this.healthMonitor.recordRequest(provider, false, 0);
      
      log('Primary operation failed, trying fallbacks', 'warn', {
        provider,
        error: error instanceof Error ? error.message : String(error),
        fallbacksAvailable: fallbackOperations.length
      });
    }

    // Try fallback operations
    for (let i = 0; i < fallbackOperations.length; i++) {
      try {
        const result = await fallbackOperations[i]();
        
        log('Fallback operation succeeded', 'info', {
          fallbackIndex: i,
          provider: `${provider}_fallback_${i}`
        });
        
        return result;
      } catch (error) {
        log('Fallback operation failed', 'warn', {
          fallbackIndex: i,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // Emergency fallback as last resort
    if (this.config.emergencyFallback) {
      try {
        log('Executing emergency fallback', 'warn', { provider });
        return await this.config.emergencyFallback();
      } catch (error) {
        log('Emergency fallback failed', 'error', {
          provider,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    throw new Error(`All operations failed for provider: ${provider}`);
  }

  updateConfig(config: Partial<FallbackConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getRecommendedProviders(): string[] {
    const healthyPrimary = this.config.primaryProviders.filter(provider =>
      this.healthMonitor.isProviderHealthy(provider)
    );

    if (healthyPrimary.length > 0) {
      return healthyPrimary;
    }

    const healthyFallback = this.config.fallbackProviders.filter(provider =>
      this.healthMonitor.isProviderHealthy(provider)
    );

    return healthyFallback.length > 0 ? healthyFallback : this.config.primaryProviders;
  }
}

// ============================================================================
// Timeout Manager
// ============================================================================

export class TimeoutManager {
  static async withTimeout<T>(
    operation: Promise<T>,
    timeoutMs: number,
    timeoutMessage = 'Operation timed out'
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
    });

    try {
      return await Promise.race([operation, timeoutPromise]);
    } catch (error) {
      log('Operation timed out or failed', 'error', {
        timeoutMs,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  static async withProgressiveTimeout<T>(
    operations: (() => Promise<T>)[],
    baseTimeoutMs: number,
    timeoutMultiplier = 1.5
  ): Promise<T> {
    let currentTimeout = baseTimeoutMs;

    for (let i = 0; i < operations.length; i++) {
      try {
        return await this.withTimeout(
          operations[i](),
          currentTimeout,
          `Operation ${i + 1} timed out after ${currentTimeout}ms`
        );
      } catch (error) {
        if (i === operations.length - 1) {
          throw error;
        }
        
        currentTimeout *= timeoutMultiplier;
        log('Operation timed out, trying next with increased timeout', 'warn', {
          operationIndex: i,
          nextTimeoutMs: currentTimeout
        });
      }
    }

    throw new Error('All operations failed');
  }
}

// ============================================================================
// Resilience Coordinator
// ============================================================================

export interface ResilienceConfig {
  circuitBreaker: CircuitBreakerConfig;
  retry: RetryConfig;
  rateLimiter: RateLimiterConfig;
  fallback: FallbackConfig;
  timeoutMs: number;
}

export class ResilienceCoordinator {
  private circuitBreaker: CircuitBreaker;
  private retryStrategy: RetryStrategy;
  private rateLimiter: RateLimiter;
  private healthMonitor: ProviderHealthMonitor;
  private fallbackManager: FallbackManager;
  private config: ResilienceConfig;

  constructor(config: ResilienceConfig) {
    this.config = config;
    this.circuitBreaker = new CircuitBreaker(config.circuitBreaker);
    this.retryStrategy = new RetryStrategy(config.retry);
    this.rateLimiter = new RateLimiter(config.rateLimiter);
    this.healthMonitor = new ProviderHealthMonitor();
    this.fallbackManager = new FallbackManager(this.healthMonitor, config.fallback);
  }

  async executeResilientOperation<T>(
    provider: string,
    operation: () => Promise<T>,
    fallbackOperations: (() => Promise<T>)[] = []
  ): Promise<T> {
    // Rate limiting
    await this.rateLimiter.waitForAvailability();

    // Circuit breaker with retry and fallback
    return await this.circuitBreaker.execute(
      () => this.retryStrategy.execute(
        () => TimeoutManager.withTimeout(operation(), this.config.timeoutMs),
        (error) => this.isRetryableError(error)
      ),
      () => this.fallbackManager.executeWithFallback(
        operation,
        fallbackOperations,
        provider
      )
    );
  }

  private isRetryableError(error: any): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes('timeout') ||
        message.includes('network') ||
        message.includes('connection') ||
        message.includes('rate limit') ||
        message.includes('temporary')
      );
    }
    return false;
  }

  getSystemHealth() {
    return {
      circuitBreaker: this.circuitBreaker.getMetrics(),
      rateLimiter: this.rateLimiter.getStatus(),
      providers: Array.from(this.healthMonitor.getAllHealthStatus().entries()).map(([provider, metrics]) => ({
        provider,
        ...metrics
      })),
      recommendedProviders: this.fallbackManager.getRecommendedProviders()
    };
  }

  updateConfiguration(config: Partial<ResilienceConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (config.fallback) {
      this.fallbackManager.updateConfig(config.fallback);
    }
  }
}