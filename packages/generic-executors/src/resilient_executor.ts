/**
 * Resilient Executor
 *
 * Production-grade executor with automatic retry, exponential backoff,
 * circuit breaker pattern, and comprehensive error recovery for Bitcode V26 execution.
 *
 * @doc-code
 * type: executor
 * category: resilience
 * pattern: error-recovery
 */

import type { Executor } from '@bitcode/executor-generics';
import type { Execution } from '@bitcode/execution-generics/Execution';
import { log } from '@bitcode/logger';

/**
 * Retry configuration options
 */
export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxAttempts?: number;
  /** Initial backoff delay in milliseconds (default: 1000) */
  initialDelay?: number;
  /** Maximum backoff delay in milliseconds (default: 30000) */
  maxDelay?: number;
  /** Backoff multiplier (default: 2 for exponential) */
  backoffMultiplier?: number;
  /** Function to determine if error is retryable */
  shouldRetry?: (error: Error, attempt: number) => boolean;
  /** Jitter to add randomness to delays (0-1, default: 0.1) */
  jitter?: number;
}

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerOptions {
  /** Failure threshold to open circuit (default: 5) */
  failureThreshold?: number;
  /** Time window for counting failures in ms (default: 60000) */
  failureWindow?: number;
  /** Recovery timeout before attempting half-open state in ms (default: 30000) */
  recoveryTimeout?: number;
  /** Success threshold to close circuit from half-open (default: 2) */
  successThreshold?: number;
}

/**
 * Resilient executor configuration
 */
export interface ResilientExecutorConfig {
  /** Retry configuration */
  retry?: RetryOptions;
  /** Circuit breaker configuration */
  circuitBreaker?: CircuitBreakerOptions;
  /** Timeout for each execution attempt in milliseconds */
  timeout?: number;
  /** Dead letter queue handler for failed executions */
  onDeadLetter?: (input: any, error: Error, execution: Execution) => Promise<void>;
}

/**
 * Circuit breaker states
 */
enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open'
}

/**
 * Circuit breaker implementation
 */
class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number[] = [];
  private successes: number = 0;
  private lastFailureTime?: number;
  private config: Required<CircuitBreakerOptions>;

  constructor(options: CircuitBreakerOptions = {}) {
    this.config = {
      failureThreshold: options.failureThreshold ?? 5,
      failureWindow: options.failureWindow ?? 60000,
      recoveryTimeout: options.recoveryTimeout ?? 30000,
      successThreshold: options.successThreshold ?? 2
    };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check circuit state
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        this.successes = 0;
        log('[CircuitBreaker] Transitioning to HALF_OPEN state', 'debug');
      } else {
        throw new Error('Circuit breaker is OPEN - service unavailable');
      }
    }

    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.failures = [];
        log('[CircuitBreaker] Circuit CLOSED after successful recovery', 'info');
      }
    }
  }

  private recordFailure(): void {
    const now = Date.now();
    this.failures.push(now);

    // Clean old failures outside window
    this.failures = this.failures.filter(
      time => now - time < this.config.failureWindow
    );

    if (this.failures.length >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.lastFailureTime = now;
      log('[CircuitBreaker] Circuit OPEN after failure threshold', 'warn', {
        failures: this.failures.length,
        threshold: this.config.failureThreshold
      });
    }

    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
      this.lastFailureTime = now;
      log('[CircuitBreaker] Circuit reopened from HALF_OPEN', 'warn');
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return true;
    return Date.now() - this.lastFailureTime > this.config.recoveryTimeout;
  }

  getState(): CircuitState {
    return this.state;
  }
}

/**
 * Default retry predicate - retry on transient errors
 */
const defaultShouldRetry = (error: Error): boolean => {
  const message = error.message.toLowerCase();

  // Retry on network errors
  if (message.includes('network') || message.includes('connection')) return true;

  // Retry on timeout errors
  if (message.includes('timeout')) return true;

  // Retry on rate limit errors
  if (message.includes('rate') && message.includes('limit')) return true;

  // Retry on 5xx errors
  if (message.includes('500') || message.includes('502') ||
      message.includes('503') || message.includes('504')) return true;

  // Don't retry on explicit client errors
  if (message.includes('400') || message.includes('401') ||
      message.includes('403') || message.includes('404')) return false;

  // Default to retry for unknown errors
  return true;
};

/**
 * Creates a resilient executor with retry logic and circuit breaker
 */
export class ResilientExecutor<TInput = any, TOutput = any> {
  private readonly innerExecutor: Executor<TInput, TOutput>;
  private readonly config: ResilientExecutorConfig;
  private readonly circuitBreaker?: CircuitBreaker;
  private readonly retryConfig: Required<RetryOptions>;

  constructor(
    executor: Executor<TInput, TOutput>,
    config: ResilientExecutorConfig = {}
  ) {
    this.innerExecutor = executor;
    this.config = config;

    // Initialize retry configuration
    this.retryConfig = {
      maxAttempts: config.retry?.maxAttempts ?? 3,
      initialDelay: config.retry?.initialDelay ?? 1000,
      maxDelay: config.retry?.maxDelay ?? 30000,
      backoffMultiplier: config.retry?.backoffMultiplier ?? 2,
      shouldRetry: config.retry?.shouldRetry ?? defaultShouldRetry,
      jitter: config.retry?.jitter ?? 0.1
    };

    // Initialize circuit breaker if configured
    if (config.circuitBreaker) {
      this.circuitBreaker = new CircuitBreaker(config.circuitBreaker);
    }
  }

  async execute(input: TInput, execution: Execution): Promise<TOutput> {
    return this.executeWithResilience(input, execution);
  }

  private async executeWithResilience(input: TInput, execution: Execution): Promise<TOutput> {
    const executeWithTimeout = async (): Promise<TOutput> => {
      if (this.config.timeout) {
        return Promise.race([
          this.innerExecutor(input, execution),
          new Promise<TOutput>((_, reject) =>
            setTimeout(() => reject(new Error('Execution timeout')), this.config.timeout)
          )
        ]);
      }
      return this.innerExecutor(input, execution);
    };

    const executeWithRetry = async (): Promise<TOutput> => {
      let lastError: Error | undefined;

      for (let attempt = 1; attempt <= this.retryConfig.maxAttempts; attempt++) {
        try {
          log(`[ResilientExecutor] Attempt ${attempt}/${this.retryConfig.maxAttempts}`, 'debug', {
            executionId: execution.id
          });

          const result = await executeWithTimeout();

          if (attempt > 1) {
            log('[ResilientExecutor] Retry successful', 'info', {
              attempt,
              executionId: execution.id
            });
          }

          return result;
        } catch (error) {
          lastError = error as Error;

          // Check if we should retry
          if (attempt >= this.retryConfig.maxAttempts ||
              !this.retryConfig.shouldRetry(lastError, attempt)) {
            throw lastError;
          }

          // Calculate backoff delay with jitter
          const baseDelay = Math.min(
            this.retryConfig.initialDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1),
            this.retryConfig.maxDelay
          );
          const jitterAmount = baseDelay * this.retryConfig.jitter * (Math.random() * 2 - 1);
          const delay = Math.max(0, baseDelay + jitterAmount);

          log('[ResilientExecutor] Retrying after delay', 'warn', {
            attempt,
            delay,
            error: lastError.message,
            executionId: execution.id
          });

          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      throw lastError || new Error('Unexpected retry loop exit');
    };

    try {
      // Execute with circuit breaker if configured
      if (this.circuitBreaker) {
        return await this.circuitBreaker.execute(() => executeWithRetry());
      }
      return await executeWithRetry();
    } catch (error) {
      const finalError = error as Error;

      // Send to dead letter queue if configured
      if (this.config.onDeadLetter) {
        try {
          await this.config.onDeadLetter(input, finalError, execution);
          log('[ResilientExecutor] Sent to dead letter queue', 'info', {
            executionId: execution.id,
            error: finalError.message
          });
        } catch (dlqError) {
          log('[ResilientExecutor] Dead letter queue error', 'error', {
            executionId: execution.id,
            originalError: finalError.message,
            dlqError: (dlqError as Error).message
          });
        }
      }

      throw finalError;
    }
  }

  /**
   * Get circuit breaker state if configured
   */
  getCircuitState(): CircuitState | undefined {
    return this.circuitBreaker?.getState();
  }
}

/**
 * Factory function for creating resilient executors
 */
export function withResilience<TInput = any, TOutput = any>(
  executor: Executor<TInput, TOutput>,
  config?: ResilientExecutorConfig
): Executor<TInput, TOutput> {
  const resilientExecutor = new ResilientExecutor(executor, config);
  return (input: TInput, execution: Execution) => resilientExecutor.execute(input, execution);
}

/**
 * Retry-only wrapper (simpler than full resilience)
 */
export function withRetry<TInput = any, TOutput = any>(
  executor: Executor<TInput, TOutput>,
  options?: RetryOptions
): Executor<TInput, TOutput> {
  return withResilience(executor, { retry: options });
}

/**
 * Timeout-only wrapper
 */
export function withTimeout<TInput = any, TOutput = any>(
  executor: Executor<TInput, TOutput>,
  timeoutMs: number
): Executor<TInput, TOutput> {
  return withResilience(executor, { timeout: timeoutMs });
}
