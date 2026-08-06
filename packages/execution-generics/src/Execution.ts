/**
 * EXECUTION - The Accumulating Process
 * 
 * A pure state container that accumulates data with namespaced storage.
 * Knows nothing about domains - just stores and retrieves data.
 * 
 * This is where all intelligence discovered and generated during pipeline executions
 * is accumulated. Every agent, tool, phase, and step stores its findings here,
 * building a complete tree of execution history.
 * 
 * @category Core
 * @priority Critical
 */

import { 
  ExecutionStorageDestination, 
  ExecutionStorageOptions, 
  ExecutionStorageResult,
  DEFAULT_EXECUTION_STORAGE_OPTIONS
} from './storage/StorageDestination';
import { StorableValue } from './types';

// No external dependencies needed for pure Execution
// All domain-specific registries moved to higher layers

async function loadExecutionStorageAdapter() {
  const module = await import('./storage/ExecutionStorageAdapter');
  return module.ExecutionStorageAdapter;
}

async function loadExecutionStreamAdapter() {
  const module = await import('./storage/ExecutionStreamAdapter');
  return module.ExecutionStreamAdapter;
}

/**
 * EXECUTION - Pure state accumulation
 * 
 * Stores data in namespaced maps with optional persistence control.
 * No domain knowledge. No special handling. Just state.
 * No registries - those belong at higher layers (PromptExecution, ExecutionPipeline).
 *
 * See also: store registry for canonical namespaces and typed helpers
 * `@bitcode/execution-generics/src/store/registry.ts`.
 * 
 * Used by:
 * - Agents: Store plans, results, refinements
 * - Tools: Store outputs, metrics, errors
 * - Phases: Store progress, validation results
 * - Pipelines: Store overall state, iteration counts
 */
export class Execution {
  readonly id: string;
  readonly parent?: Execution;
  readonly children = new Map<string, Execution>();
  
  // Type-safe namespaced storage - the ONLY concern of pure Execution
  private stores = new Map<string, Map<string, StorableValue>>();
  
  // Storage metadata tracking
  private storageMetadata = new Map<string, Map<string, ExecutionStorageResult>>();
  
  constructor(id: string, parent?: Execution) {
    this.id = id;
    this.parent = parent;
    
    if (parent) {
      parent.children.set(id, this);
    }
  }
  
  /**
   * Store a value in a namespace
   * 
   * Default: Ephemeral (memory only) - just pass namespace, key, value
   * With options: Control destination (memory, persistent, or both)
   * 
   * Examples:
   * - execution.store('agent', 'plan', planData)  // Memory only
   * - await execution.store('patches', 'file.ts', patch, {  // S3 only
   *     destinations: [ExecutionStorageDestination.PERSISTENT]
   *   })
   */
  store<T extends StorableValue = StorableValue>(namespace: string, key: string, value: T): void;
  store<T extends StorableValue = StorableValue>(namespace: string, key: string, value: T, options: ExecutionStorageOptions): Promise<ExecutionStorageResult>;
  store<T extends StorableValue = StorableValue>(namespace: string, key: string, value: T, options?: ExecutionStorageOptions): void | Promise<ExecutionStorageResult> {
    // If no options, use default synchronous ephemeral storage
    if (!options) {
      if (!this.stores.has(namespace)) {
        this.stores.set(namespace, new Map());
      }
      this.stores.get(namespace)!.set(key, value);

      // Emit stream event for ephemeral stores as well, so that all meaningful
      // execution updates (phase/agent/llm/tools) are visible to stream adapters.
      // Fire-and-forget: streaming failures must not affect execution.
      try {
        const rootId = this.getRoot().id;
        void loadExecutionStreamAdapter()
          .then((ExecutionStreamAdapter) =>
            ExecutionStreamAdapter.onStore(
              rootId,
              namespace,
              key,
              value,
              [ExecutionStorageDestination.EPHEMERAL],
              { nodeId: this.id, rootId, path: this.getPath() }
            )
          )
          .catch(() => {});
      } catch {}
      return;
    }
    
    // With options, return async storage result
    return this.storeWithDestinations(namespace, key, value, options);
  }
  
  /**
   * Store with destinations control (internal)
   * 
   * Routes storage based on destinations array:
   * - EPHEMERAL: Store in memory map
   * - PERSISTENT: Store via artifacts package to S3/blob
   * - Both: Store in both locations
   */
  private async storeWithDestinations(
    namespace: string, 
    key: string, 
    value: StorableValue, 
    options: ExecutionStorageOptions
  ): Promise<ExecutionStorageResult> {
    const opts = { 
      ...DEFAULT_EXECUTION_STORAGE_OPTIONS, 
      ...options,
      destinations: options.destinations || DEFAULT_EXECUTION_STORAGE_OPTIONS.destinations
    };
    
    const result: ExecutionStorageResult = {
      stored: false,
      destinations: opts.destinations!,
      locations: {},
      metadata: {}
    };
    
    // Store in memory if ephemeral is in destinations
    if (opts.destinations!.includes(ExecutionStorageDestination.EPHEMERAL)) {
      if (!this.stores.has(namespace)) {
        this.stores.set(namespace, new Map());
      }
      this.stores.get(namespace)!.set(key, value);
      result.locations.ephemeral = true;
    }
    
    // Store persistently if persistent is in destinations
    if (opts.destinations!.includes(ExecutionStorageDestination.PERSISTENT)) {
      try {
        const storageKey = this.buildStorageKey(namespace, key);
        const ExecutionStorageAdapter = await loadExecutionStorageAdapter();
        const artifactResult = await ExecutionStorageAdapter.store(
          storageKey,
          value,
          opts.config
        );
        result.locations.persistent = true;
        result.metadata!.url = artifactResult.url;
        result.metadata!.size = artifactResult.size;
        result.metadata!.config = opts.config;
      } catch (error) {
        // If persistent storage fails, we still have ephemeral
        console.error('Persistent storage failed:', error);
      }
    }
    
    result.stored = !!(result.locations.ephemeral || result.locations.persistent);
    
    // Emit stream event if adapter is registered
    if (result.stored) {
      const ExecutionStreamAdapter = await loadExecutionStreamAdapter();
      await ExecutionStreamAdapter.onStore(
        this.getRoot().id,
        namespace,
        key,
        value,
        opts.destinations!,
        { nodeId: this.id, rootId: this.getRoot().id, path: this.getPath() }
      ).catch(err => {
        // Stream errors shouldn't break storage
        console.error('Stream emission failed:', err);
      });
    }
    
    // Track storage metadata
    if (!this.storageMetadata.has(namespace)) {
      this.storageMetadata.set(namespace, new Map());
    }
    this.storageMetadata.get(namespace)!.set(key, result);
    
    return result;
  }
  
  /**
   * Build storage key for persistent backend
   * 
   * Creates clean S3-compatible keys from execution context.
   * Removes special characters to ensure valid object keys.
   */
  private buildStorageKey(namespace: string, key: string): string {
    // Create a clean key for artifact storage
    const cleanId = this.id.replace(/[^a-zA-Z0-9-_]/g, '-');
    const cleanNamespace = namespace.replace(/[^a-zA-Z0-9-_]/g, '-');
    const cleanKey = key.replace(/[^a-zA-Z0-9-_]/g, '-');
    
    return `${cleanId}/${cleanNamespace}/${cleanKey}.json`;
  }
  
  /**
   * Get a value from a namespace
   * 
   * Note: Only retrieves from ephemeral storage.
   * Persistent storage is write-only for execution tracking.
   * This is intentional - artifacts are for archival, not retrieval.
   */
  get<T extends StorableValue = StorableValue>(namespace: string, key: string): T | undefined {
    return this.stores.get(namespace)?.get(key) as T | undefined;
  }
  
  /**
   * Get storage metadata
   */
  getStorageMetadata(namespace: string, key: string): ExecutionStorageResult | undefined {
    return this.storageMetadata.get(namespace)?.get(key);
  }
  
  /**
   * Get all values in a namespace
   */
  getAll<T extends StorableValue = StorableValue>(namespace: string): Map<string, T> | undefined {
    return this.stores.get(namespace) as Map<string, T> | undefined;
  }
  
  /**
   * Check if a namespace exists
   */
  hasNamespace(namespace: string): boolean {
    return this.stores.has(namespace);
  }
  
  /**
   * Get all namespace names
   */
  getNamespaces(): string[] {
    return Array.from(this.stores.keys());
  }
  
  /**
   * Create a child execution
   * 
   * Used by combinators to create execution subtrees:
   * - sequential: child('seq-0'), child('seq-1'), ...
   * - parallel: child('par-0'), child('par-1'), ...
   * - repeat: child('iter-0'), child('iter-1'), ...
   */
  child(id: string): Execution {
    if (this.children.has(id)) {
      return this.children.get(id)!;
    }
    return new Execution(`${this.id}/${id}`, this);
  }
  
  /**
   * Get root execution
   */
  getRoot(): Execution {
    return this.parent ? this.parent.getRoot() : this;
  }
  
  /**
   * Find data up the execution tree
   */
  findUp<T extends StorableValue>(namespace: string, key: string): T | undefined {
    const value = this.get<T>(namespace, key);
    if (value !== undefined) return value;
    
    return this.parent?.findUp<T>(namespace, key);
  }
  
  /**
   * Get execution path from root
   */
  getPath(): string[] {
    const path = this.parent ? this.parent.getPath() : [];
    const seg = this.id.includes('/') ? this.id.split('/').pop()! : this.id;
    path.push(seg);
    return path;
  }
  
  /**
   * Get a summary of stored data
   */
  summary(): { namespaces: string[]; childCount: number; depth: number } {
    return {
      namespaces: this.getNamespaces(),
      childCount: this.children.size,
      depth: this.getPath().length
    };
  }
}

/**
 * Create a root execution
 * 
 * Starting point for any pipeline, agent, or tool execution.
 * The id becomes the root of the execution tree.
 */
export function createExecution(id: string): Execution {
  return new Execution(id, undefined);
}
