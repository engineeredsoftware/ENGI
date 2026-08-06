import type { Execution } from '@bitcode/execution-generics';

// Shared AsyncLocalStorage-style execution context for file tools.
// Isolated from tool exports so route bundles can bind an Execution without
// eagerly constructing prompt-backed tool instances at build time.
class ExecutionContextStore {
  private contexts = new Map<string, Execution>();
  private currentKey: string | null = null;

  run<R>(execution: Execution, fn: () => R | Promise<R>): R | Promise<R> {
    const key = `exec_${Date.now()}_${Math.random()}`;
    this.contexts.set(key, execution);
    const previousKey = this.currentKey;
    this.currentKey = key;

    try {
      const result = fn();
      if (result instanceof Promise) {
        return result.finally(() => {
          this.contexts.delete(key);
          this.currentKey = previousKey;
        }) as R;
      }
      this.contexts.delete(key);
      this.currentKey = previousKey;
      return result;
    } catch (error) {
      this.contexts.delete(key);
      this.currentKey = previousKey;
      throw error;
    }
  }

  getStore(): Execution | undefined {
    return this.currentKey ? this.contexts.get(this.currentKey) : undefined;
  }
}

export const executionContext = new ExecutionContextStore();
