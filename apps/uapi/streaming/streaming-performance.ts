/**
 * Performance monitoring and optimization utilities for Conversations streaming
 */

/**
 * Metrics collection for streaming performance
 */
interface StreamMetrics {
  startTime: number;
  tokenCount: number;
  totalBytes: number;
  errorCount: number;
  reconnectCount: number;
  avgTokenLatency: number;
  peakMemoryUsage: number;
}

/**
 * Performance monitoring for streaming conversations
 */
export class StreamPerformanceMonitor {
  private metrics: StreamMetrics;
  private tokenTimestamps: number[] = [];
  private memoryCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.metrics = {
      startTime: 0,
      tokenCount: 0,
      totalBytes: 0,
      errorCount: 0,
      reconnectCount: 0,
      avgTokenLatency: 0,
      peakMemoryUsage: 0
    };
  }

  startStream() {
    this.metrics.startTime = performance.now();
    this.tokenTimestamps = [];
    
    // Monitor memory usage every 5 seconds
    this.memoryCheckInterval = setInterval(() => {
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        this.metrics.peakMemoryUsage = Math.max(
          this.metrics.peakMemoryUsage,
          memInfo.usedJSHeapSize || 0
        );
      }
    }, 5000);
  }

  recordToken(tokenLength: number) {
    this.metrics.tokenCount++;
    this.metrics.totalBytes += tokenLength;
    this.tokenTimestamps.push(performance.now());
    
    // Calculate average latency (between last 10 tokens)
    if (this.tokenTimestamps.length >= 2) {
      const recent = this.tokenTimestamps.slice(-10);
      const intervals = recent.slice(1).map((time, i) => time - recent[i]);
      this.metrics.avgTokenLatency = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    }
  }

  recordError() {
    this.metrics.errorCount++;
  }

  recordReconnect() {
    this.metrics.reconnectCount++;
  }

  endStream(): StreamMetrics {
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
      this.memoryCheckInterval = null;
    }
    
    const finalMetrics = { ...this.metrics };
    
    // Reset for next stream
    this.metrics = {
      startTime: 0,
      tokenCount: 0,
      totalBytes: 0,
      errorCount: 0,
      reconnectCount: 0,
      avgTokenLatency: 0,
      peakMemoryUsage: 0
    };
    
    return finalMetrics;
  }

  getMetrics(): Readonly<StreamMetrics> {
    return { ...this.metrics };
  }
}

/**
 * Memory-efficient token buffer with automatic pruning
 */
export class TokenBuffer {
  private buffer: string[] = [];
  private readonly maxSize: number;
  private readonly pruneThreshold: number;

  constructor(maxSize = 1000, pruneThreshold = 0.8) {
    this.maxSize = maxSize;
    this.pruneThreshold = pruneThreshold;
  }

  append(token: string): string {
    this.buffer.push(token);
    
    // Auto-prune when buffer gets too large
    if (this.buffer.length > this.maxSize * this.pruneThreshold) {
      this.prune();
    }
    
    return this.getContent();
  }

  getContent(): string {
    return this.buffer.join('');
  }

  prune(): void {
    // Keep the most recent half of tokens
    const keepCount = Math.floor(this.maxSize / 2);
    this.buffer = this.buffer.slice(-keepCount);
  }

  clear(): void {
    this.buffer = [];
  }

  size(): number {
    return this.buffer.length;
  }

  memoryUsage(): number {
    return this.buffer.reduce((total, token) => total + token.length * 2, 0); // ~2 bytes per char
  }
}

/**
 * Adaptive throttling based on performance metrics
 */
export class AdaptiveThrottle {
  private lastCall = 0;
  private currentDelay: number;
  private readonly minDelay: number;
  private readonly maxDelay: number;
  private performanceHistory: number[] = [];

  constructor(minDelay = 16, maxDelay = 100) {
    this.minDelay = minDelay;
    this.maxDelay = maxDelay;
    this.currentDelay = minDelay;
  }

  shouldExecute(): boolean {
    const now = performance.now();
    
    if (now - this.lastCall >= this.currentDelay) {
      this.lastCall = now;
      return true;
    }
    
    return false;
  }

  adaptDelay(renderTime: number): void {
    this.performanceHistory.push(renderTime);
    
    // Keep only recent samples
    if (this.performanceHistory.length > 10) {
      this.performanceHistory.shift();
    }
    
    // Calculate average render time
    const avgRenderTime = this.performanceHistory.reduce((a, b) => a + b, 0) / this.performanceHistory.length;
    
    // Adjust delay based on performance
    if (avgRenderTime > 16) { // Over 60 FPS target
      this.currentDelay = Math.min(this.maxDelay, this.currentDelay * 1.1);
    } else if (avgRenderTime < 8) { // Well under target
      this.currentDelay = Math.max(this.minDelay, this.currentDelay * 0.9);
    }
  }

  getCurrentDelay(): number {
    return this.currentDelay;
  }
}

/**
 * Circuit breaker for stream resilience
 */
export class StreamCircuitBreaker {
  private failureCount = 0;
  private readonly failureThreshold: number;
  private readonly recoveryTimeout: number;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(failureThreshold = 5, recoveryTimeout = 30000) {
    this.failureThreshold = failureThreshold;
    this.recoveryTimeout = recoveryTimeout;
  }

  canExecute(): boolean {
    const now = Date.now();
    
    switch (this.state) {
      case 'closed':
        return true;
        
      case 'open':
        if (now - this.lastFailureTime >= this.recoveryTimeout) {
          this.state = 'half-open';
          return true;
        }
        return false;
        
      case 'half-open':
        return true;
        
      default:
        return false;
    }
  }

  recordSuccess(): void {
    this.failureCount = 0;
    this.state = 'closed';
  }

  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.state === 'half-open') {
      this.state = 'open';
    } else if (this.failureCount >= this.failureThreshold) {
      this.state = 'open';
    }
  }

  getState(): string {
    return this.state;
  }

  reset(): void {
    this.failureCount = 0;
    this.state = 'closed';
    this.lastFailureTime = 0;
  }
}

/**
 * Enhanced error handling with retry logic
 */
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryCondition?: (error: Error) => boolean;
}

export class StreamRetryHandler {
  private retryCount = 0;
  private readonly config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
      retryCondition: (error) => !error.message.includes('401') && !error.message.includes('403'),
      ...config
    };
  }

  async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const result = await operation();
        this.retryCount = 0; // Reset on success
        return result;
      } catch (error) {
        const err = error as Error;
        
        // Don't retry if condition fails or max retries reached
        if (!this.config.retryCondition?.(err) || attempt === this.config.maxRetries) {
          throw err;
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          this.config.baseDelay * Math.pow(this.config.backoffMultiplier, attempt),
          this.config.maxDelay
        );
        
        // Add jitter to prevent thundering herd
        const jitteredDelay = delay + Math.random() * 1000;
        
        await new Promise(resolve => setTimeout(resolve, jitteredDelay));
        this.retryCount++;
      }
    }
    
    throw new Error('Max retries exceeded');
  }

  getRetryCount(): number {
    return this.retryCount;
  }

  reset(): void {
    this.retryCount = 0;
  }
}

/**
 * Comprehensive streaming health monitor
 */
export class StreamHealthMonitor {
  private performanceMonitor = new StreamPerformanceMonitor();
  private circuitBreaker = new StreamCircuitBreaker();
  private retryHandler = new StreamRetryHandler();
  private isHealthy = true;
  private healthChecks: Array<() => boolean> = [];

  addHealthCheck(check: () => boolean): void {
    this.healthChecks.push(check);
  }

  startMonitoring(): void {
    this.performanceMonitor.startStream();
    this.circuitBreaker.reset();
    this.retryHandler.reset();
    this.isHealthy = true;
  }

  recordActivity(tokenLength: number): void {
    this.performanceMonitor.recordToken(tokenLength);
  }

  recordError(error: Error): void {
    this.performanceMonitor.recordError();
    this.circuitBreaker.recordFailure();
    this.checkHealth();
  }

  recordSuccess(): void {
    this.circuitBreaker.recordSuccess();
    this.checkHealth();
  }

  checkHealth(): boolean {
    const metrics = this.performanceMonitor.getMetrics();
    
    // Check various health indicators
    const checks = [
      () => this.circuitBreaker.canExecute(),
      () => metrics.errorCount < 10,
      () => metrics.avgTokenLatency < 1000,
      () => metrics.peakMemoryUsage < 100 * 1024 * 1024, // 100MB
      ...this.healthChecks
    ];
    
    this.isHealthy = checks.every(check => check());
    return this.isHealthy;
  }

  getHealthStatus(): {
    isHealthy: boolean;
    metrics: StreamMetrics;
    circuitBreakerState: string;
    retryCount: number;
  } {
    return {
      isHealthy: this.isHealthy,
      metrics: this.performanceMonitor.getMetrics(),
      circuitBreakerState: this.circuitBreaker.getState(),
      retryCount: this.retryHandler.getRetryCount()
    };
  }

  async executeHealthyOperation<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.circuitBreaker.canExecute()) {
      throw new Error('Circuit breaker is open - stream unavailable');
    }
    
    try {
      const result = await this.retryHandler.executeWithRetry(operation);
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordError(error as Error);
      throw error;
    }
  }

  stopMonitoring(): StreamMetrics {
    return this.performanceMonitor.endStream();
  }
}
