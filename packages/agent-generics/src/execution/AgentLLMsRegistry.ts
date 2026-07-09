/**
 * AgentLLMsRegistry - LLM registry for agent executions
 * 
 * Manages LLM configuration and hierarchical lookup for agents.
 * LLMs can be configured at any level and resolved upward.
 * 
 * @doc-code
 * type: registry
 * purpose: Hierarchical LLM management for agents
 * pattern: registry-with-execution-tracking
 */

import { RegistryImpl } from '@bitcode/registry';
import { LLM, LLMConfig, LLMInput, LLMOutput, LLMRegistry } from '@bitcode/llm-generics';
import { Execution } from '@bitcode/execution-generics/Execution';

/**
 * Pipeline LLM calls must be time-bounded. The provider SDK sets no short
 * timeout, so a hung or very-slow generation would stall the entire inline
 * synthesis indefinitely (QA: a deposit run stuck for minutes on one
 * structured-output call). On timeout the call rejects and the failsafe/PTRR
 * retry handles it (a clean failure, never an indefinite hang). Tunable via
 * BITCODE_LLM_CALL_TIMEOUT_MS (default 180000 for monorepo deposit chunks);
 * set 0 to disable the bound.
 */
function resolveLlmCallTimeoutMs(): number {
  const raw = Number(process?.env?.BITCODE_LLM_CALL_TIMEOUT_MS);
  if (Number.isFinite(raw)) return raw > 0 ? raw : 0;
  return 180_000;
}

async function callLlmWithTimeout(call: Promise<LLMOutput>, model: string): Promise<LLMOutput> {
  const timeoutMs = resolveLlmCallTimeoutMs();
  if (timeoutMs <= 0) return call;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`LLM call (${model}) timed out after ${timeoutMs}ms`)),
      timeoutMs,
    );
    (timer as any)?.unref?.();
  });
  try {
    return await Promise.race([call, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * AgentLLMsRegistry - Hierarchical LLM configuration registry for agents
 * 
 * Stores LLM configurations in the execution tree.
 * When getting an LLM, walks up the hierarchy to find configuration.
 * Wraps LLM calls with automatic execution tracking.
 */
export class AgentLLMsRegistry extends RegistryImpl<LLMConfig> {
  private readonly execution: Execution;
  private llmRegistry: LLMRegistry;
  
  constructor(execution: Execution, llmRegistry?: LLMRegistry) {
    super();
    this.execution = execution;
    // Use provided registry or create new one
    this.llmRegistry = llmRegistry || new LLMRegistry();
  }

  /**
   * Check if a config key is configured in this level
   */
  hasConfigHere(key: string = 'default'): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Find a config by walking up the execution hierarchy
   */
  findConfigInHierarchy(key: string = 'default'): LLMConfig | undefined {
    let current: Execution | undefined = this.execution;
    while (current) {
      if ('llms' in current && current.llms instanceof AgentLLMsRegistry) {
        const cfg = (current.llms as AgentLLMsRegistry).get(key);
        if (cfg) return cfg;
      }
      current = current.parent;
    }
    return undefined;
  }

  /**
   * Ensure a default config exists; optionally throw or just return boolean
   */
  ensureDefaultConfigured(options?: { throw?: boolean }): boolean {
    const present = !!this.findConfigInHierarchy('default');
    if (!present && options?.throw) {
      throw new Error(
        'No default LLM configured in execution hierarchy. Configure via agentExec.llms.registerLLMConfig("default", { provider, model, ... }).'
      );
    }
    return present;
  }
  
  /**
   * Register an LLM configuration at this level
   * 
   * Keys can be:
   * - "default" - Default LLM for this agent
   * - "fast" - Fast model for quick operations
   * - "powerful" - More capable model for complex tasks
   * - Custom keys for specific use cases
   */
  registerLLMConfig(key: string, config: LLMConfig, priority: number = 0): void {
    this.set(key, config, priority);
  }
  
  /**
   * Get the default LLM by walking up hierarchy for 'default' config
   */
  getDefaultLLM(): LLM {
    // Collect hierarchy path
    const hierarchy = this.getExecutionPath();
    // Include global defaults path if configured
    hierarchy.unshift('*');
    
    // Get LLM from wrapped registry
    const baseLLM = this.llmRegistry.getLLM(hierarchy);
    
    // Wrap with execution tracking
    return this.wrapWithExecutionTracking(baseLLM, 'default');
  }
  
  /**
   * Get LLM by specific key
   */
  getLLM(key: string): LLM | undefined {
    // Walk up hierarchy looking for config
    let config: LLMConfig | undefined;
    let current: Execution | undefined = this.execution;
    
    while (current && !config) {
      if ('llms' in current && current.llms instanceof AgentLLMsRegistry) {
        config = (current.llms as AgentLLMsRegistry).get(key);
      }
      current = current.parent;
    }
    
    if (!config) {
      return undefined;
    }
    
    // Configure the registry with this config
    const path = this.getExecutionPath().join(':');
    this.llmRegistry.configure(path, config);
    
    // Get LLM from registry
    const baseLLM = this.llmRegistry.getLLM(this.getExecutionPath());
    
    // Wrap with execution tracking
    return this.wrapWithExecutionTracking(baseLLM, key);
  }
  
  /**
   * Get LLM with fallback pattern
   * 
   * Try multiple keys in order, returning first match.
   * Example: Try "fast" then fall back to "default"
   */
  getLLMWithFallback(keys: string[]): LLM | undefined {
    for (const key of keys) {
      const llm = this.getLLM(key);
      if (llm) return llm;
    }
    return undefined;
  }
  
  /**
   * Wrap an LLM with execution tracking
   */
  private wrapWithExecutionTracking(llm: LLM, configKey: string): LLM {
    return async (input: LLMInput): Promise<LLMOutput> => {
      // Prefer call-site model, then registered hierarchy config (avoids "unknown"
      // timeout banners when the provider config is only on the registry path).
      const registered = this.findConfigInHierarchy(configKey) || this.findConfigInHierarchy('default');
      const model =
        (typeof input.config?.model === 'string' && input.config.model.trim()
          ? input.config.model.trim()
          : null) ||
        (typeof registered?.model === 'string' && registered.model.trim()
          ? registered.model.trim()
          : null) ||
        'unknown';
      const llmExec = this.execution.child(`llm:${configKey}:${model}`);
      
      // Track execution
      const startTime = Date.now();
      llmExec.store('llm', 'startTime', startTime);
      llmExec.store('llm', 'messages', input.messages);
      llmExec.store('llm', 'config', input.config);
      llmExec.store('llm', 'configKey', configKey);
      
      try {
        // Call the base LLM, time-bounded so a hung provider call can't stall
        // the inline pipeline indefinitely.
        const output = await callLlmWithTimeout(llm(input), model);

        // Provider-agnostic normalization: ensure metadata.stopReason exists
        try {
          const meta: any = (output as any).metadata || {};
          if (!meta.stopReason) {
            const mapped = meta.finishReason || meta.stop_reason || meta?.providerResponse?.finishReason || meta?.providerResponse?.finish_reason;
            (output as any).metadata = { ...meta, stopReason: mapped || 'unknown' };
          }
        } catch {}
        
        // Track success
        llmExec.store('llm', 'response', output.content);
        llmExec.store('llm', 'usage', output.usage);
        llmExec.store('llm', 'status', 'success');
        llmExec.store('llm', 'duration', Date.now() - startTime);
        
        return output;
      } catch (error) {
        // Track failure
        llmExec.store('llm', 'error', error instanceof Error ? error.message : String(error));
        llmExec.store('llm', 'status', 'failed');
        llmExec.store('llm', 'duration', Date.now() - startTime);
        
        throw error;
      }
    };
  }
  
  /**
   * Get execution path for hierarchy
   */
  private getExecutionPath(): string[] {
    const path: string[] = [];
    let current: Execution | undefined = this.execution;
    
    while (current) {
      path.unshift(current.id);
      current = current.parent;
    }
    
    return path;
  }
  
  /**
   * Get all LLM configs available in hierarchy
   */
  getUsableLLMConfigs(): Record<string, LLMConfig> {
    const configs: Record<string, LLMConfig> = {};
    
    // Collect from entire hierarchy (bottom-up so children override parents)
    const collectFromExecution = (exec: Execution) => {
      if (exec.parent) {
        collectFromExecution(exec.parent);
      }
      
      // Add configs from this level if it has a registry
      if ('llms' in exec && exec.llms instanceof AgentLLMsRegistry) {
        const registry = exec.llms as AgentLLMsRegistry;
        const paths = registry.getPaths();
        for (const path of paths) {
          const config = registry.get(path);
          if (config) {
            configs[path] = config;
          }
        }
      }
    };
    
    collectFromExecution(this.execution);
    
    return configs;
  }
  
  /**
   * Set the wrapped LLM registry
   */
  setLLMRegistry(registry: LLMRegistry): void {
    this.llmRegistry = registry;
  }
}
