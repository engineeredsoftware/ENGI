/**
 * Agent Execution Types - Execution classes for agent hierarchy
 *
 * Hierarchy:
 * - AgentExecution: Agent-level execution with all 4 registries
 * - StepExecution: PTRR step (Plan / Try / Refine / Retry)
 * - GenerationExecution: nested generation layer within a step
 *   - FailsafeGenerationExecution: failsafe parent (PCC / Chunk / Stitch)
 *   - ThinkingsGenerationExecution: thinkings child (Reason / Judge / Output)
 *
 * Legacy: SubStep was the old name for Generation within a Step.
 */

import { Execution } from '@bitcode/execution-generics/Execution';
import { ExecutionPrompt } from '@bitcode/execution-generics/prompts/ExecutionPrompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';

export { AgentExecution, createAgentExecution } from './AgentExecution';
export { AgentPromptsRegistry } from './AgentPromptsRegistry';
export { AgentToolsRegistry, ExecutionTool } from './AgentToolsRegistry';
export { AgentLLMsRegistry } from './AgentLLMsRegistry';
export { AgentAgentsRegistry } from './AgentAgentsRegistry';
export type { ExecutionAgent } from './AgentAgentsRegistry';

// ==================== STEP LEVEL ====================

/**
 * StepExecution - PTRR step (Plan / Try / Refine / Retry)
 */
export class StepExecution extends Execution {
  readonly prompt: ExecutionPrompt;
  constructor(id: string, parent?: Execution) {
    super(id, parent);
    this.prompt = new ExecutionPrompt();
    this.prompt.set('generic_system', ' ' as PromptPart);
    this.prompt.set('specific_execution', ' ' as PromptPart);
  }

  child(id: string): StepExecution {
    if (this.children.has(id)) {
      return this.children.get(id) as StepExecution;
    }
    return new StepExecution(`${this.id}/${id}`, this);
  }

  get llms(): any {
    let cur: any = this.parent;
    while (cur && !('llms' in cur)) cur = cur.parent;
    return cur?.llms;
  }
  get tools(): any {
    let cur: any = this.parent;
    while (cur && !('tools' in cur)) cur = cur.parent;
    return cur?.tools;
  }
  get agents(): any {
    let cur: any = this.parent;
    while (cur && !('agents' in cur)) cur = cur.parent;
    return cur?.agents;
  }
}

// ==================== GENERATION LAYER (within a step) ====================

/**
 * GenerationExecution - nested generation under a PTRR step
 * (FailsafeGeneration or ThinkingsGeneration layer; was SubStepExecution).
 */
export class GenerationExecution extends Execution {
  readonly prompt: ExecutionPrompt;
  constructor(id: string, parent?: Execution) {
    super(id, parent);
    this.prompt = new ExecutionPrompt();
    this.prompt.set('generic_system', ' ' as PromptPart);
    this.prompt.set('specific_execution', ' ' as PromptPart);
  }

  child(id: string): GenerationExecution {
    if (this.children.has(id)) {
      return this.children.get(id) as GenerationExecution;
    }
    return new GenerationExecution(`${this.id}/${id}`, this);
  }

  get llms(): any {
    let cur: any = this.parent;
    while (cur && !('llms' in cur)) cur = cur.parent;
    return cur?.llms;
  }
  get tools(): any {
    let cur: any = this.parent;
    while (cur && !('tools' in cur)) cur = cur.parent;
    return cur?.tools;
  }
  get agents(): any {
    let cur: any = this.parent;
    while (cur && !('agents' in cur)) cur = cur.parent;
    return cur?.agents;
  }
}

/** FailsafeGeneration parent execution (PCC / ChunkThenSum / Stitch). */
export class FailsafeGenerationExecution extends GenerationExecution {}

/** ThinkingsGeneration child execution (Reason / Judge / StructuredOutput). */
export class ThinkingsGenerationExecution extends GenerationExecution {}

// ==================== BC ALIASES ====================

/** @deprecated Prefer GenerationExecution */
export { GenerationExecution as SubStepExecution };
/** @deprecated Prefer FailsafeGenerationExecution */
export { FailsafeGenerationExecution as FailsafeExecution };
/**
 * @deprecated Prefer ThinkingsGenerationExecution.
 * Old GenerationExecution meant the thinkings child, not the generation-layer base.
 */
export { ThinkingsGenerationExecution as GenerationExecutionThinkings };

// ==================== FACTORY FUNCTIONS ====================

export function factoryStepExecution(step: string, parent: Execution): StepExecution {
  return new StepExecution(`gen:${step}`, parent);
}

export function factoryGenerationExecution(
  generation: string,
  parent: Execution,
): GenerationExecution {
  return new GenerationExecution(`generation:${generation}`, parent);
}

export function factoryFailsafeGenerationExecution(
  failsafe: string,
  parent: Execution,
): FailsafeGenerationExecution {
  return new FailsafeGenerationExecution(`failsafe:${failsafe}`, parent);
}

export function factoryThinkingsGenerationExecution(
  thinking: string,
  parent: Execution,
): ThinkingsGenerationExecution {
  return new ThinkingsGenerationExecution(`thinkings:${thinking}`, parent);
}

/** @deprecated Prefer factoryGenerationExecution */
export const factoryNestedGenerationExecution = factoryGenerationExecution;
/** @deprecated Prefer factoryGenerationExecution */
export const factorySubStepExecution = factoryGenerationExecution;
/** @deprecated Prefer factoryFailsafeGenerationExecution */
export const factoryFailsafeExecution = factoryFailsafeGenerationExecution;
