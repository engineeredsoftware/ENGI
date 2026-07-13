/**
 * Agent Generics Types - Core interfaces and enums
 * 
 * This file contains all the type definitions for the agent-generics package.
 * Agents organize Actions, Actions sequence Steps, Steps sequence GenerationSteps.
 */

export type { PreparedContext } from '@bitcode/generic-generations-failsafes';
import {
  FailsafeMetaSubStep,
  GenerationSubMetaSubStep,
} from '@bitcode/generation-generics';
export {
  FailsafeMetaSubStep,
  GenerationSubMetaSubStep,
  type Generation,
} from '@bitcode/generation-generics';
import type { Executor } from '@bitcode/execution-generics';
import type { Execution } from '@bitcode/execution-generics/Execution';
import { Tool } from '@bitcode/tools-generics';

// ==================== PTRR ENUMS ====================

/**
 * Agent Variation Steps - The four fundamental steps
 * Plan-Try-Refine-Retry: The methodology for intelligent execution
 */
export enum AgentVariationStep {
  PLAN = 'plan',      // Focus: (NO TOOLS) Plan the optimal 'Try'
  TRY = 'try',        // Focus: Attempt primary agent's objective
  RETRY = 'retry',    // Focus: Re-attempt given obvious 'Try' failures
  REFINE = 'refine'   // Focus: (NO TOOLS) Synthesize steps' ultimate objective results
}

/**
 * The complete PTRR substep architecture - EXACTLY 7 substeps per step
 * 3 FailsafeMetaSubSteps + 3 GenerationSubMetaSubSteps + 1 Tool execution
 */
export interface PTRRSubStepArchitecture {
  failsafeMetaSubSteps: [
    FailsafeMetaSubStep.PREPARE_CONCISE_CONTEXT,
    FailsafeMetaSubStep.CHUNK_THEN_SUM,
    FailsafeMetaSubStep.STITCH_UNTIL_COMPLETE
  ];
  generationSubMetaSubSteps: [
    // CRITICAL ORDER: Reason → Judge → StructuredOutput
    GenerationSubMetaSubStep.REASON,
    GenerationSubMetaSubStep.JUDGE,
    GenerationSubMetaSubStep.STRUCTURED_OUTPUT
  ];
  toolExecution: 'tools_execution';
  total: 7; // Type-level assertion
}

/**
 * Failsafe execution context - what each failsafe handles
 */
export interface FailsafeContext {
  [FailsafeMetaSubStep.PREPARE_CONCISE_CONTEXT]: {
    purpose: 'CONTEXT SIGNAL/NOISE';
    input: 'Keys-only tree of the FULL root execution state (values never included)';
    output: 'Selected keys + the read-in selected context values';
  };
  [FailsafeMetaSubStep.CHUNK_THEN_SUM]: {
    purpose: 'BIG INPUT';
    input: 'Task input + PCC-selected context values';
    output: 'Task result (one pass, or per-chunk passes + one summing pass)';
  };
  [FailsafeMetaSubStep.STITCH_UNTIL_COMPLETE]: {
    purpose: 'CONVERSATIONSUTPUT';
    input: 'Potentially truncated output';
    output: 'Complete validated output matching schema';
  };
}

// ==================== AGENT INTERFACES ====================

/**
 * Agent - Executor that sequences PTRR steps
 * 
 * Agents are Executors that implement intelligence through
 * the PTRR (Plan-Try-Refine-Retry) pattern with 7 substeps.
 * No more variations - agents are selected from registries dynamically.
 * 
 * Execution hierarchy: Agent → Step → SubStep
 */
export interface Agent<TInput = any, TOutput = any> extends Executor<TInput, TOutput> {
  readonly name: string;
  readonly description?: string;
  // "steps" remain the concrete runtime sequence; generational naming is canonical.
  readonly steps: AgentStep<any, any>[];
  readonly generations?: AgentGeneration<any, any>[];
}

/**
 * AgentStep - A StepExecutor that sequences GenerationSteps
 * 
 * Steps orchestrate GenerationSteps (the 7 sequences + tools)
 */
export interface AgentStep<TInput = any, TOutput = any> extends Executor<TInput, TOutput> {
  readonly type: AgentVariationStep;
  readonly description?: string;
}

/**
 * StepExecutor - Typed alias for step executors (input → output)
 * Used by AgentStep and default step implementations.
 */
export type StepExecutor<TInput = any, TOutput = any> = Executor<TInput, TOutput>;

/**
 * AgentGeneration - Preferred alias for AgentStep. A Generation is a typed
 * executor (input → output) that may be composed by PTRR failsafes and tools
 * postprocess. AgentStep remains the concrete execution shape.
 */
export type AgentGeneration<TInput = any, TOutput = any> = AgentStep<TInput, TOutput>;

/**
 * QuickAgent - Minimal agent for simple, single-step behaviors.
 *
 * Unlike canonical PTRR Agents, QuickAgents don’t own PTRR step orchestration
 * and typically wrap a single typed executor. Use for simple setup/utility
 * behaviors where full PTRR is unnecessary.
 */
export interface QuickAgent<TInput = any, TOutput = any> extends Executor<TInput, TOutput> {
  readonly name: string;
  readonly description?: string;
  readonly kind: 'quick-agent';
}

// ==================== SCHEMA TYPES ====================

export interface Chunk {
  id: string;
  content: string;
  dependencies: string[];
}

export interface Reasoning {
  analysis: string;
  steps: string[];
  conclusion: string;
  confidence: number;
  useTools?: UseTool[];
  toolsCombinator?: string; // 'sequential' | 'parallel' | custom combinator
}

export interface Judgment {
  quality: number;
  issues: string[];
  suggestions: string[];
  approved: boolean;
}

// TODO: should this be in tools-generics?
export interface UseTool {
  tool: Tool;  // Reference to actual tool
  name: string; // Tool name for lookup
  input: any;
  reason: string;
}
export type UseTools = UseTool[]

// TODO: should this be in tools-generics?
export interface UsedTool {
  tool: string;
  input?: any;
  output?: any;
  error?: string;
}
export type UsedTools = UsedTool[]
