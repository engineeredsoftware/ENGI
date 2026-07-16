/**
 * Agent Generics Types - Core interfaces and enums
 * 
 * This file contains all the type definitions for the agent-generics package.
 * Agents organize Actions, Actions sequence Steps, Steps sequence GenerationSteps.
 */

export type { PreparedContext } from '@bitcode/generic-generations-failsafes';
import {
  FailsafeGeneration,
  ThinkingsGeneration,
} from '@bitcode/generation-generics';
export {
  FailsafeGeneration,
  ThinkingsGeneration,
  type Generation,
} from '@bitcode/generation-generics';
import type { Executor } from '@bitcode/execution-generics';
import type { Execution } from '@bitcode/execution-generics/Execution';
import { Tool } from '@bitcode/tools-generics';

// ==================== PTRR ENUMS ====================

/**
 * Agent Variation Steps — the four fundamental steps in execution order:
 * Plan → Try → Retry → Refine.
 */
export enum AgentVariationStep {
  PLAN = 'plan',      // Focus: (NO TOOLS) Plan the optimal 'Try' (incl. tool use)
  TRY = 'try',        // Focus: Attempt primary agent's objective (tools postprocess)
  RETRY = 'retry',    // Focus: Re-attempt Try given prior Try errors / usedTools
  REFINE = 'refine'   // Focus: (NO TOOLS) Final agent return — same type as agent
}

/**
 * PTRR step generation architecture — EXACTLY 7 generation units per step:
 * 3 FailsafeGenerations × Thinkings (3) composition + 1 tools postprocess.
 *
 * Hierarchy within a step:
 *   FailsafeGeneration (PCC → ChunkThenSum → Stitch)
 *     → each runs ThinkingsGeneration (Reason → Judge → StructuredOutput)
 *   + tools_execution after failsafes
 */
export interface PTRRStepGenerationArchitecture {
  failsafeGenerations: [
    FailsafeGeneration.PREPARE_CONCISE_CONTEXT,
    FailsafeGeneration.CHUNK_THEN_SUM,
    FailsafeGeneration.STITCH_UNTIL_COMPLETE
  ];
  thinkingsGenerations: [
    // CRITICAL ORDER: Reason → Judge → StructuredOutput
    ThinkingsGeneration.REASON,
    ThinkingsGeneration.JUDGE,
    ThinkingsGeneration.STRUCTURED_OUTPUT
  ];
  toolExecution: 'tools_execution';
  total: 7; // Type-level assertion
}


/**
 * Failsafe execution context - what each failsafe handles
 */
export interface FailsafeContext {
  [FailsafeGeneration.PREPARE_CONCISE_CONTEXT]: {
    purpose: 'CONTEXT SIGNAL/NOISE';
    input: 'Keys-only tree of the FULL root execution state (values never included)';
    output: 'Selected keys + the read-in selected context values';
  };
  [FailsafeGeneration.CHUNK_THEN_SUM]: {
    purpose: 'BIG INPUT';
    input: 'Task input + PCC-selected context values';
    output: 'Task result (one pass, or per-chunk passes + one summing pass)';
  };
  [FailsafeGeneration.STITCH_UNTIL_COMPLETE]: {
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
 * the PTRR (Plan-Try-Retry-Refine) pattern with Failsafe×Thinkings generations.
 * No more variations - agents are selected from registries dynamically.
 * 
 * Execution hierarchy: Agent → Step → FailsafeGeneration → ThinkingsGeneration
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

/**
 * Planned tool invocation selected by Thinkings structured output.
 * Canonical LLM JSON shape (also accepted by factoryToolsExecution):
 *   { "name": string, "input": object, "reason"?: string }
 *
 * `name` keys `AgentToolsRegistry.getTool(name)`. Optional `tool` field may
 * carry a Tool instance in typed in-process callers; execution still looks up by name.
 */
export interface UseTool {
  name: string;
  input: any;
  reason?: string;
  /** Optional in-process Tool handle; registry lookup uses `name`. */
  tool?: Tool;
}
export type UseTools = UseTool[];

/**
 * Result of one tools_execution postprocess call (telemetry + results interpolation).
 * Written to step store as `tools.used` / `tools.result` and carried as `usedTools`
 * on the step output for Refine/Retry prompt interpolation (`auto:tools_results`).
 */
export interface UsedTool {
  tool: string;
  input?: any;
  output?: any;
  error?: string;
}
export type UsedTools = UsedTool[];
