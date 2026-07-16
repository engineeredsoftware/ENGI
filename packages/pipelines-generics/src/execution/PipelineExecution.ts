/**
 * PipelineExecution - Full-featured execution for pipelines
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
import { PipelinePromptRegistry } from './PipelinePromptRegistry';
import { PipelineToolRegistry } from './PipelineToolRegistry';
import { PipelineLLMRegistry } from './PipelineLLMRegistry';
import { PipelineAgentRegistry } from './PipelineAgentRegistry';

export type PipelineExecutionPosture = 'live' | 'reference' | 'support';
export type PipelineExecutionFamily =
  | 'ad_hoc'
  | 'asset_pack'
  | 'quick'
  | 'custom';

export interface PipelineExecutionLineage {
  pipelineName: string;
  family: PipelineExecutionFamily;
  posture: PipelineExecutionPosture;
  admittedSurface: string;
}

function normalizePipelineName(name: string): string {
  return name.trim().toLowerCase().replace(/[\s-]+/g, '_');
}

export function inferPipelineExecutionLineage(name: string): PipelineExecutionLineage {
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
 * PipelineExecution - Complete execution context for pipelines
 * 
 * Provides all four registries needed for pipeline operations:
 * - prompts (for prompt management)
 * - tools (for tool registration and lookup)
 * - llms (for LLM configuration and selection)
 * - agents (for agent registration and dynamic selection)
 */
export class PipelineExecution extends Execution {
  /** Hierarchical LLM system prompt parts for this pipeline node. */
  readonly prompt: ExecutionPrompt;
  readonly prompts: PipelinePromptRegistry;
  readonly tools: PipelineToolRegistry;
  readonly llms: PipelineLLMRegistry;
  readonly agents: PipelineAgentRegistry;
  readonly lineage: PipelineExecutionLineage;

  constructor(id: string, parent?: Execution, lineage?: PipelineExecutionLineage) {
    super(id, parent);

    this.prompt = new ExecutionPrompt();
    this.prompt.set('generic_system', ' ' as PromptPart);
    this.prompt.set('specific_execution', ' ' as PromptPart);

    // Initialize all 4 registries with parent chain awareness
    this.prompts = new PipelinePromptRegistry(this);
    this.tools = new PipelineToolRegistry(this);
    this.llms = new PipelineLLMRegistry(this);
    this.agents = new PipelineAgentRegistry(this);
    this.lineage = lineage
      ?? (parent instanceof PipelineExecution
        ? parent.lineage
        : inferPipelineExecutionLineage(id.replace(/^pipeline:/, '')));

    // Register root executions for instruction API access
    // Child executions are not registered (only root runId is used)
    if (!parent) {
      registerExecution(id, this);
    }

    // If parent is also PipelineExecution, inherit registry state
    if (parent && parent instanceof PipelineExecution) {
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
   * Override child to maintain PipelineExecution type
   */
  child(id: string): PipelineExecution {
    return new PipelineExecution(`${this.id}/${id}`, this, this.lineage);
  }
}

/**
 * Factory function for creating pipeline executions
 */
export function createPipelineExecution(
  id: string,
  parent?: Execution,
  lineage?: PipelineExecutionLineage
): PipelineExecution {
  return new PipelineExecution(id, parent, lineage);
}
