/**
 * ExecutionPipelinePromptRegistry - Prompt registry for pipeline executions
 * 
 * Manages prompt registration and hierarchical lookup for pipelines.
 * Prompts are resolved up the execution tree for reuse.
 * 
 * @doc-code
 * type: registry
 * purpose: Hierarchical prompt management for pipelines
 * pattern: registry-with-execution-context
 */

import { RegistryImpl } from '@bitcode/registry';
import { Execution } from '@bitcode/execution-generics/Execution';

/**
 * ExecutionPipelinePromptRegistry - Hierarchical prompt registry for pipelines
 * 
 * Wraps the base PromptRegistry with execution-aware resolution.
 * Prompts can be registered at any level and resolved upward.
 */
export class ExecutionPipelinePromptRegistry extends RegistryImpl<any> {
  private readonly execution: Execution;
  private baseRegistry: RegistryImpl<any>;
  
  constructor(execution: Execution, baseRegistry?: RegistryImpl<any>) {
    super();
    this.execution = execution;
    // Use provided registry or create new one
    this.baseRegistry = baseRegistry || new RegistryImpl<any>();
  }
  
  /**
   * Register a prompt at this execution level
   * 
   * Prompts are stored with path-based keys for hierarchical lookup.
   * Example keys:
   * - "pipeline:setup" - Setup phase prompt
   * - "pipeline:discovery" - Discovery phase prompt
   * - "pipeline:implementation" - Implementation phase prompt
   * - "pipeline:validation" - Validation phase prompt
   * - "pipeline:finish" - Finish phase prompt
   */
  registerPrompt(key: string, prompt: any, priority: number = 0): void {
    this.set(key, prompt, priority);
  }
  
  /**
   * Get prompt by walking up the execution hierarchy
   * 
   * Searches from current level up through parents.
   * This enables prompt inheritance and specialization.
   */
  getPrompt(key: string): any | undefined {
    // First check local registry
    const local = this.get(key);
    if (local) return local;
    
    // Then check base registry
    const base = this.baseRegistry.get(key);
    if (base) return base;
    
    // Finally walk up execution hierarchy
    const parent = this.execution.parent as any;
    if (parent && parent.prompts) {
      return parent.prompts.getPrompt(key);
    }
    
    return undefined;
  }
  
  /**
   * Check if a prompt exists anywhere in the hierarchy
   */
  hasPrompt(key: string): boolean {
    return this.getPrompt(key) !== undefined;
  }
  
  /**
   * Get all prompts at this level (not including parents)
   */
  getAllLocalPrompts(): Map<string, any> {
    return new Map(
      this.getPaths()
        .map((path) => [path, this.get(path)] as [string, any])
        .filter((entry) => entry[1] !== undefined)
    );
  }
}
