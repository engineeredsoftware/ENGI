/**
 * ExecutionPipelineToolRegistry - Tool registry for pipeline executions
 * 
 * Manages tool registration and hierarchical lookup for pipelines.
 * Tools can be registered at any level and resolved upward.
 * 
 * @doc-code
 * type: registry
 * purpose: Hierarchical tool management for pipelines
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
 * ExecutionPipelineToolRegistry - Hierarchical tool registry for pipelines
 * 
 * Stores tool instances and provides hierarchical lookup.
 * When getting a tool, walks up execution hierarchy to find it.
 */
export class ExecutionPipelineToolRegistry extends RegistryImpl<ExecutionTool> {
  private readonly execution: Execution;
  
  constructor(execution: Execution) {
    super();
    this.execution = execution;
  }
  
  /**
   * Register a tool instance at this level
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
    // Try this registry first
    let tool = this.get(key);
    if (tool) {
      return bindToolToExecution(tool, this.execution) as ExecutionTool;
    }
    
    // Walk up parent chain looking for ExecutionPipeline
    let current = this.execution.parent;
    while (current) {
      // Check if parent has tools registry (is ExecutionPipeline)
      if ('tools' in current && current.tools instanceof ExecutionPipelineToolRegistry) {
        tool = (current.tools as ExecutionPipelineToolRegistry).get(key);
        if (tool) {
          return bindToolToExecution(tool, this.execution) as ExecutionTool;
        }
      }
      current = current.parent;
    }
    
    // Debug registry miss if enabled
    try {
      if (process.env.BITCODE_DEBUG_REGISTRIES === '1') {
        this.execution.store('registry', 'debug', {
          registry: 'tools',
          action: 'lookup_miss',
          key,
          executionPath: this.execution.getPath?.() || []
        } as any);
      }
    } catch {}
    return undefined;
  }
  
  /**
   * Get all tools available in hierarchy
   */
  getUsableTools(): Record<string, ExecutionTool> {
    const tools: Record<string, ExecutionTool> = {};
    
    // Collect from entire hierarchy (bottom-up so children override parents)
    const collectFromExecution = (exec: Execution) => {
      if (exec.parent) {
        collectFromExecution(exec.parent);
      }
      
      // Add tools from this level if it has a registry
      if ('tools' in exec && exec.tools instanceof ExecutionPipelineToolRegistry) {
        const registry = exec.tools as ExecutionPipelineToolRegistry;
        const paths = registry.getPaths();
        for (const path of paths) {
          const tool = registry.get(path);
          if (tool) {
            tools[path] = tool;
          }
        }
      }
    };
    
    collectFromExecution(this.execution);
    
    return tools;
  }
}
