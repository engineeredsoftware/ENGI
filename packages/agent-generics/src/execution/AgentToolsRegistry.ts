/**
 * AgentToolsRegistry - Tool registry for agent executions
 * 
 * Manages tool registration and hierarchical lookup for agents.
 * Tools can be registered at any level and resolved upward.
 * 
 * @doc-code
 * type: registry
 * purpose: Hierarchical tool management for agents
 * pattern: registry-with-execution-binding
 */

import { RegistryImpl } from '@bitcode/registry';
import { Tool } from '@bitcode/tools-generics';
import { Execution } from '@bitcode/execution-generics/Execution';

function bindToolToExecution<T extends object>(tool: T, execution: Execution): T {
  const maybeBindable = tool as T & { bindExecution?: (execution: Execution) => T };
  return typeof maybeBindable.bindExecution === 'function'
    ? maybeBindable.bindExecution(execution)
    : tool;
}

/**
 * ExecutionTool - Tool that integrates with execution context
 * 
 * Extends base Tool with execution binding and automatic tracking.
 */
export abstract class ExecutionTool<T extends (...args: any[]) => any = (...args: any[]) => any> extends Tool<T> {
  protected execution?: Execution;
  
  /**
   * Bind this tool to an execution context
   */
  bindExecution(execution: Execution): this {
    this.execution = execution;
    return this;
  }
  
  /**
   * Execute with automatic execution tracking
   */
  async execute(...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> {
    if (!this.execution) {
      return super.execute(...args);
    }
    
    // Create child execution for tracking
    const toolName = this.constructor.name;
    const toolExec = this.execution.child(`tool:${toolName}`);
    
    // Track execution
    toolExec.store('tool', 'name', toolName);
    toolExec.store('tool', 'startTime', Date.now());
    toolExec.store('tool', 'input', args);
    
    try {
      const result = await this.use(...args);
      
      // Track success
      toolExec.store('tool', 'result', result);
      toolExec.store('tool', 'status', 'success');
      toolExec.store('tool', 'endTime', Date.now());
      
      return result;
    } catch (error) {
      // Track failure
      toolExec.store('tool', 'error', error instanceof Error ? error.message : String(error));
      toolExec.store('tool', 'status', 'failed');
      toolExec.store('tool', 'endTime', Date.now());
      
      throw error;
    }
  }
}

/**
 * AgentToolsRegistry - Hierarchical tool registry for agents
 * 
 * Stores tool instances and provides hierarchical lookup.
 * When getting a tool, walks up execution hierarchy to find it.
 */
export class AgentToolsRegistry extends RegistryImpl<ExecutionTool> {
  private readonly execution: Execution;
  private allowedKeys?: Set<string>;
  
  constructor(execution: Execution) {
    super();
    this.execution = execution;
  }

  /**
   * Restrict accessible tools to the provided keys at this level.
   * When restricted, getTool will not fall back to parents for other keys.
   */
  restrictTo(keys: string[]): void {
    this.allowedKeys = new Set(keys);
  }

  /**
   * Check if a tool is available at this level
   */
  hasToolHere(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Ensure that required tools exist somewhere in the hierarchy
   * Returns list of missing tools; optionally throws
   */
  ensureTools(keys: string[], options?: { throw?: boolean }): string[] {
    const missing: string[] = [];
    for (const key of keys) {
      const tool = this.getTool(key);
      if (!tool) missing.push(key);
    }
    if (missing.length && options?.throw) {
      throw new Error(`Missing required tools: ${missing.join(', ')}`);
    }
    return missing;
  }
  
  /**
   * Register a tool instance
   */
  registerTool(key: string, tool: ExecutionTool, priority: number = 0): void {
    this.set(key, tool, priority);
  }
  
  /**
   * Register a tool class by instantiating it
   */
  registerToolClass<T extends ExecutionTool>(
    key: string,
    ToolClass: new () => T,
    priority: number = 0
  ): void {
    const instance = new ToolClass();
    this.set(key, instance as any, priority);
  }
  
  /**
   * Get a tool by walking up the execution hierarchy
   */
  getTool(key: string): ExecutionTool | undefined {
    // If restricted, deny access to tools not explicitly allowed
    if (this.allowedKeys && !this.allowedKeys.has(key)) {
      return undefined;
    }
    // Try this registry first
    let tool = this.get(key);
    if (tool) {
      return bindToolToExecution(tool, this.execution) as ExecutionTool;
    }
    
    // Walk up parent chain looking for tools
    let current = this.execution.parent;
    while (current) {
      // Check if parent has tools registry
      if ('tools' in current && current.tools instanceof AgentToolsRegistry) {
        tool = (current.tools as AgentToolsRegistry).get(key);
        if (tool) {
          return bindToolToExecution(tool, this.execution) as ExecutionTool;
        }
      } else if ('tools' in current) {
        const parentTools = (current as any).tools;
        if (parentTools && parentTools !== this) {
          const parentTool =
            typeof parentTools.getTool === 'function'
              ? parentTools.getTool(key)
              : typeof parentTools.get === 'function'
                ? parentTools.get(key)
                : undefined;
          if (parentTool) {
            return bindToolToExecution(parentTool, this.execution) as ExecutionTool;
          }
        }
      }
      current = current.parent;
    }
    
    return undefined;
  }
  
  /**
   * Get tool with fallback pattern
   * 
   * Try multiple keys in order, returning first match.
   * Useful for tool specialization with graceful degradation.
   */
  getToolWithFallback(keys: string[]): ExecutionTool | undefined {
    for (const key of keys) {
      const tool = this.getTool(key);
      if (tool) return tool;
    }
    return undefined;
  }
  
  /**
   * Get all tools available in hierarchy, then apply this level's allowlist
   * (`restrictTo`) so step-scoped surfaces do not leak agent/pipeline tools.
   *
   * - `restrictTo` unset → full hierarchy registrations
   * - `restrictTo([])` → empty surface
   * - `restrictTo(['a','b'])` → only those keys (resolved via getTool)
   */
  getUsableTools(): Record<string, ExecutionTool> {
    // Allowlist mode: resolve only permitted keys (empty set → nothing usable).
    if (this.allowedKeys) {
      const filtered: Record<string, ExecutionTool> = {};
      for (const key of this.allowedKeys) {
        const tool = this.getTool(key);
        if (tool) filtered[key] = tool;
      }
      return filtered;
    }

    const tools: Record<string, ExecutionTool> = {};

    // Collect from entire hierarchy (bottom-up so children override parents)
    const collectFromExecution = (exec: Execution) => {
      if (exec.parent) {
        collectFromExecution(exec.parent);
      }

      if ('tools' in exec && exec.tools instanceof AgentToolsRegistry) {
        const registry = exec.tools as AgentToolsRegistry;
        if (registry === this) {
          // This level: local registrations only
          for (const path of registry.getPaths()) {
            const tool = registry.get(path);
            if (tool) tools[path] = tool;
          }
        } else {
          // Ancestor: honor its allowlist via its getUsableTools
          Object.assign(tools, registry.getUsableTools());
        }
      } else if ('tools' in exec) {
        const parentTools = (exec as any).tools;
        if (parentTools && parentTools !== this) {
          if (typeof parentTools.getUsableTools === 'function') {
            Object.assign(tools, parentTools.getUsableTools());
          } else if (
            typeof parentTools.getPaths === 'function' &&
            typeof parentTools.get === 'function'
          ) {
            for (const path of parentTools.getPaths()) {
              const tool = parentTools.get(path);
              if (tool) tools[path] = tool;
            }
          }
        }
      }
    };

    collectFromExecution(this.execution);
    return tools;
  }
}
