/**
 * ExecutionPipelineAgentRegistry - Agent registry for pipeline executions
 * 
 * Manages agent registration and dynamic selection for pipelines.
 * Replaces the old variations pattern with registry-based selection.
 * 
 * @doc-code
 * type: registry
 * purpose: Dynamic agent selection for pipelines
 * pattern: registry-based-polymorphism
 */

import { RegistryImpl } from '@bitcode/registry';
import { Agent } from '@bitcode/agent-generics';
import { Execution } from '@bitcode/execution-generics/Execution';

/**
 * ExecutionAgent - Agent that can be bound to execution context
 * 
 * Wraps base Agent with execution binding capability.
 */
export interface ExecutionAgent<TInput = any, TOutput = any> extends Agent<TInput, TOutput> {
  bindExecution?(execution: Execution): this;
}

/**
 * ExecutionPipelineAgentRegistry - Dynamic agent registry for pipelines
 * 
 * Stores agent instances and provides hierarchical lookup.
 * Agents are selected dynamically based on runtime conditions.
 * 
 * Example usage:
 * - Register base agent: registry.registerAgent('vcs', vcsAgent)
 * - Register specialized: registry.registerAgent('vcs:pr', vcsPRAgent, 10)
 * - Get with fallback: registry.getAgentWithFallback(['vcs:pr', 'vcs'])
 */
export class ExecutionPipelineAgentRegistry extends RegistryImpl<ExecutionAgent> {
  private readonly execution: Execution;
  
  constructor(execution: Execution) {
    super();
    this.execution = execution;
  }
  
  /**
   * Register an agent with optional priority
   * 
   * Path examples:
   * - "vcs" - base VCS agent
   * - "vcs:pr" - PR-specific VCS agent
   * - "vcs:issue" - Issue-specific VCS agent
   * - "implementation:pr" - PR implementation agent
   * - "validation:comprehensive" - Comprehensive validation
   */
  registerAgent<TInput, TOutput>(
    path: string,
    agent: ExecutionAgent<TInput, TOutput>,
    priority: number = 0
  ): void {
    this.set(path, agent as any, priority);
  }
  
  /**
   * Get agent by key with execution binding
   * Walks up hierarchy to find best match
   */
  getAgent(key: string): ExecutionAgent | undefined {
    // Try exact match first
    let agent = this.get(key);
    if (agent) {
      return agent.bindExecution ? agent.bindExecution(this.execution) : agent;
    }
    
    // Walk up parent chain looking for ExecutionPipeline
    let current = this.execution.parent;
    while (current) {
      // Check if parent has agents registry (is ExecutionPipeline)
      if ('agents' in current && current.agents instanceof ExecutionPipelineAgentRegistry) {
        agent = (current.agents as ExecutionPipelineAgentRegistry).get(key);
        if (agent) {
          return agent.bindExecution ? agent.bindExecution(this.execution) : agent;
        }
      }
      current = current.parent;
    }
    
    // Debug registry miss if enabled
    try {
      if (process.env.BITCODE_DEBUG_REGISTRIES === '1') {
        this.execution.store('registry', 'debug', {
          registry: 'agents',
          action: 'lookup_miss',
          key,
          executionPath: this.execution.getPath?.() || []
        } as any);
      }
    } catch {}
    return undefined;
  }
  
  /**
   * Get agent with fallback pattern
   * 
   * Example: Try "vcs:pr", fall back to "vcs"
   * This enables specialization with graceful degradation.
   */
  getAgentWithFallback(keys: string[]): ExecutionAgent | undefined {
    for (const key of keys) {
      const agent = this.getAgent(key);
      if (agent) return agent;
    }
    return undefined;
  }
  
  /**
   * Get all agents matching a pattern
   * 
   * Example: getPattern("vcs:*") returns all VCS variants
   */
  getAgentsByPattern(pattern: string): Record<string, ExecutionAgent> {
    const agents: Record<string, ExecutionAgent> = {};
    const regex = this.patternToRegex(pattern);
    
    // Collect from entire hierarchy
    const collectFromExecution = (exec: Execution) => {
      if (exec.parent) {
        collectFromExecution(exec.parent);
      }
      
      // Add agents from this level if it has a registry
      if ('agents' in exec && exec.agents instanceof ExecutionPipelineAgentRegistry) {
        const registry = exec.agents as ExecutionPipelineAgentRegistry;
        const paths = registry.getPaths();
        for (const path of paths) {
          if (regex.test(path)) {
            const agent = registry.get(path);
            if (agent) {
              agents[path] = agent;
            }
          }
        }
      }
    };
    
    collectFromExecution(this.execution);
    
    return agents;
  }
  
  /**
   * Convert simple glob pattern to regex
   */
  private patternToRegex(pattern: string): RegExp {
    // Escape special regex chars except * and ?
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    // Convert * to .* and ? to .
    const regexStr = escaped.replace(/\*/g, '.*').replace(/\?/g, '.');
    return new RegExp(`^${regexStr}$`);
  }
}
