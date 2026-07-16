/**
 * ExecutionPipeline - Full-featured execution for pipelines
 * 
 * Extends PromptExecution to add tool, LLM, and agent registries.
 * This is the complete execution context for pipeline operations.
 * 
 * @doc-code
 * type: execution
 * purpose: Provide complete registry set for pipeline execution
 * pattern: registry-aggregation
 */

import { Execution } from '@bitcode/execution-generics/Execution';
import { registerExecution } from '@bitcode/execution-generics/execution-registry';
import { ExecutionPrompt } from '@bitcode/execution-generics/prompts/ExecutionPrompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { ExecutionPipelinePromptRegistry } from './ExecutionPipelinePromptRegistry';
import { ExecutionPipelineToolRegistry } from './ExecutionPipelineToolRegistry';
import { ExecutionPipelineLLMRegistry } from './ExecutionPipelineLLMRegistry';
import { ExecutionPipelineAgentRegistry } from './ExecutionPipelineAgentRegistry';

export type ExecutionPipelinePosture = 'live' | 'reference' | 'support';
export type ExecutionPipelineFamily =
  | 'ad_hoc'
  | 'asset_pack'
  | 'quick'
  | 'custom';

export interface ExecutionPipelineLineage {
  pipelineName: string;
  family: ExecutionPipelineFamily;
  posture: ExecutionPipelinePosture;
  admittedSurface: string;
}

function normalizePipelineName(name: string): string {
  return name.trim().toLowerCase().replace(/[\s-]+/g, '_');
}

export function inferExecutionPipelineLineage(name: string): ExecutionPipelineLineage {
  const normalized = normalizePipelineName(name);

  if (normalized === 'ad_hoc' || normalized === 'adhoc') {
    return {
      pipelineName: name,
      family: 'ad_hoc',
      posture: 'live',
      admittedSurface: 'conversations'
    };
  }

  if (normalized === 'asset_pack' || normalized === 'assetpack') {
    return {
      pipelineName: name,
      family: 'asset_pack',
      posture: 'live',
      admittedSurface: 'bitcode_asset_pack'
    };
  }

  return {
    pipelineName: name,
    family: normalized === 'quick' ? 'quick' : 'custom',
    posture: 'reference',
    admittedSurface: 'custom_pipeline'
  };
}

/**
 * ExecutionPipeline - Complete execution context for pipelines
 * 
 * Provides all four registries needed for pipeline operations:
 * - prompts (for prompt management)
 * - tools (for tool registration and lookup)
 * - llms (for LLM configuration and selection)
 * - agents (for agent registration and dynamic selection)
 */
export class ExecutionPipeline extends Execution {
  /** Hierarchical LLM system prompt parts for this pipeline node. */
  readonly prompt: ExecutionPrompt;
  readonly prompts: ExecutionPipelinePromptRegistry;
  readonly tools: ExecutionPipelineToolRegistry;
  readonly llms: ExecutionPipelineLLMRegistry;
  readonly agents: ExecutionPipelineAgentRegistry;
  readonly lineage: ExecutionPipelineLineage;

  constructor(id: string, parent?: Execution, lineage?: ExecutionPipelineLineage) {
    super(id, parent);

    this.prompt = new ExecutionPrompt();
    this.prompt.set('generic_system', ' ' as PromptPart);
    this.prompt.set('specific_execution', ' ' as PromptPart);

    // Initialize all 4 registries with parent chain awareness
    this.prompts = new ExecutionPipelinePromptRegistry(this);
    this.tools = new ExecutionPipelineToolRegistry(this);
    this.llms = new ExecutionPipelineLLMRegistry(this);
    this.agents = new ExecutionPipelineAgentRegistry(this);
    this.lineage = lineage
      ?? (parent instanceof ExecutionPipeline
        ? parent.lineage
        : inferExecutionPipelineLineage(id.replace(/^pipeline:/, '')));

    // Register root executions for instruction API access
    // Child executions are not registered (only root runId is used)
    if (!parent) {
      registerExecution(id, this);
    }

    // If parent is also ExecutionPipeline, inherit registry state
    if (parent && parent instanceof ExecutionPipeline) {
      // Tools, LLMs, and Agents can inherit from parent
      // but start with empty registries (lookup walks up chain)
    }

    this.store('execution', 'lineage', this.lineage as any);
    this.store('pipeline', 'lineage', this.lineage as any);
    this.store('pipeline', 'family', this.lineage.family);
    this.store('pipeline', 'posture', this.lineage.posture);
    this.store('pipeline', 'admittedSurface', this.lineage.admittedSurface);
  }
  
  /**
   * Override child to maintain ExecutionPipeline type
   */
  child(id: string): ExecutionPipeline {
    return new ExecutionPipeline(`${this.id}/${id}`, this, this.lineage);
  }
}

/**
 * Factory function for creating pipeline executions
 */
export function createExecutionPipeline(
  id: string,
  parent?: Execution,
  lineage?: ExecutionPipelineLineage
): ExecutionPipeline {
  return new ExecutionPipeline(id, parent, lineage);
}
