/**
 * @bitcode/generic-executors
 *
 * Base **Executor** implementations over the Executor primitive.
 *
 * Hierarchy:
 *   Executor (@bitcode/executor-generics)
 *     → sequential / parallel / pipe / retry / resilient / … (this package)
 */

export { sequential } from './sequential_executor';
export { parallel } from './parallel_executor';
export { pipe } from './pipe_executor';

export { conditional } from './conditional_executor';
export { repeat } from './repeat_executor';
export { dynamic } from './dynamic_executor';
export { switchExecutor } from './switch_executor';
export { branch } from './branch_executor';

export { identity } from './identity_executor';
export { transform } from './transform_executor';

export { tryExecutor } from './try_executor';
export { timeout } from './timeout_executor';
export { retry } from './retry_executor';

export {
  ResilientExecutor,
  withResilience,
  withRetry,
  withTimeout,
  type RetryOptions,
  type CircuitBreakerOptions,
  type ResilientExecutorConfig,
} from './resilient_executor';

export { cache } from './cache_executor';
export { gate } from './gate_executor';

// Primitive re-export for convenience
export type { Executor } from '@bitcode/executor-generics';
