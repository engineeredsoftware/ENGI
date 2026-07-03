import { PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_failsafe_prepare_context';
import { PROMPTPART_GENERIC_AGENT_FAILSAFE_CHUNK } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_failsafe_chunk';
import { PROMPTPART_GENERIC_AGENT_FAILSAFE_STITCH } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_failsafe_stitch';
import { PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_judge';
import { PROMPTPART_GENERIC_AGENT_GENERATION_REASON } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_reason';
import { PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_structured_output';
import { PROMPTPART_GENERIC_PTRR_PLAN_SUBSTEP_PREPARE_CONCISE_CONTEXT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_plan_substep_prepare_concise_context';
import { PROMPTPART_GENERIC_PTRR_PLAN_SUBSTEP_CHUNK_THEN_SUM } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_plan_substep_chunk_then_sum';
import { PROMPTPART_GENERIC_PTRR_PLAN_SUBSTEP_STITCH_UNTIL_COMPLETE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_plan_substep_stitch_until_complete';
import { PROMPTPART_GENERIC_PTRR_PLAN_SUBSTEP_REASON } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_plan_substep_reason';
import { PROMPTPART_GENERIC_PTRR_PLAN_SUBSTEP_JUDGE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_plan_substep_judge';
import { PROMPTPART_GENERIC_PTRR_PLAN_SUBSTEP_STRUCTURED_OUTPUT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_plan_substep_structured_output';
import { PROMPTPART_GENERIC_PTRR_PLAN_SUBSTEP_TOOLS_EXECUTION } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_plan_substep_tools_execution';
import { PROMPTPART_GENERIC_PTRR_TRY_SUBSTEP_PREPARE_CONCISE_CONTEXT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_try_substep_prepare_concise_context';
import { PROMPTPART_GENERIC_PTRR_TRY_SUBSTEP_CHUNK_THEN_SUM } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_try_substep_chunk_then_sum';
import { PROMPTPART_GENERIC_PTRR_TRY_SUBSTEP_STITCH_UNTIL_COMPLETE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_try_substep_stitch_until_complete';
import { PROMPTPART_GENERIC_PTRR_TRY_SUBSTEP_REASON } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_try_substep_reason';
import { PROMPTPART_GENERIC_PTRR_TRY_SUBSTEP_JUDGE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_try_substep_judge';
import { PROMPTPART_GENERIC_PTRR_TRY_SUBSTEP_STRUCTURED_OUTPUT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_try_substep_structured_output';
import { PROMPTPART_GENERIC_PTRR_TRY_SUBSTEP_TOOLS_EXECUTION } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_try_substep_tools_execution';
import { PROMPTPART_GENERIC_PTRR_REFINE_SUBSTEP_PREPARE_CONCISE_CONTEXT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_refine_substep_prepare_concise_context';
import { PROMPTPART_GENERIC_PTRR_REFINE_SUBSTEP_CHUNK_THEN_SUM } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_refine_substep_chunk_then_sum';
import { PROMPTPART_GENERIC_PTRR_REFINE_SUBSTEP_STITCH_UNTIL_COMPLETE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_refine_substep_stitch_until_complete';
import { PROMPTPART_GENERIC_PTRR_REFINE_SUBSTEP_REASON } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_refine_substep_reason';
import { PROMPTPART_GENERIC_PTRR_REFINE_SUBSTEP_JUDGE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_refine_substep_judge';
import { PROMPTPART_GENERIC_PTRR_REFINE_SUBSTEP_STRUCTURED_OUTPUT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_refine_substep_structured_output';
import { PROMPTPART_GENERIC_PTRR_REFINE_SUBSTEP_TOOLS_EXECUTION } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_refine_substep_tools_execution';
import { PROMPTPART_GENERIC_PTRR_RETRY_SUBSTEP_PREPARE_CONCISE_CONTEXT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_retry_substep_prepare_concise_context';
import { PROMPTPART_GENERIC_PTRR_RETRY_SUBSTEP_CHUNK_THEN_SUM } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_retry_substep_chunk_then_sum';
import { PROMPTPART_GENERIC_PTRR_RETRY_SUBSTEP_STITCH_UNTIL_COMPLETE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_retry_substep_stitch_until_complete';
import { PROMPTPART_GENERIC_PTRR_RETRY_SUBSTEP_REASON } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_retry_substep_reason';
import { PROMPTPART_GENERIC_PTRR_RETRY_SUBSTEP_JUDGE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_retry_substep_judge';
import { PROMPTPART_GENERIC_PTRR_RETRY_SUBSTEP_STRUCTURED_OUTPUT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_retry_substep_structured_output';
import { PROMPTPART_GENERIC_PTRR_RETRY_SUBSTEP_TOOLS_EXECUTION } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_ptrr_retry_substep_tools_execution';
import { PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_json_only_header';
import { PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_SINGLE_OBJECT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_json_only_single_object';
import { PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_if_unknown_empty';
import { PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_use_this_structured_schema';
import { PROMPTPART_GENERIC_AGENT_GENERATION_TOP_LEVEL_KEYS_HINT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_top_level_keys_hint';
/**
 * SubStep Executor Factories - PTRR Architecture Implementation
 *
 * CRITICAL ARCHITECTURE:
 * - Failsafe SubSteps are PARENT executions that orchestrate child executions
 * - Generation SubSteps are CHILD executions that run WITHIN failsafe parents
 * - This creates the hierarchy: Step -> Failsafe SubStep -> Generation SubStep
 *
 * The Failsafes sequence (three failsafes, each with a DISTINCT trigger and job):
 * 1. PrepareConciseContext (context failsafe; ALWAYS runs; selection-only):
 *    a keys-only SELECTION inference over the FULL root execution state, then
 *    the value read-in of exactly the selected keys.
 * 2. ChunkThenSum (input failsafe; trigger = the COMPOSED REQUEST exceeds the
 *    request limit): one task Thinkings when it fits; otherwise the selected
 *    context values are chunked (task generation per chunk) + one summing pass.
 * 3. StitchUntilComplete (output failsafe; trigger = schema-INCOMPLETE or
 *    truncated output): error-carrying repair generations, bounded.
 */

import { estimateSerializedSize } from '@bitcode/context';
import {
  sequential,
  parallel,
  conditional,
  walkExecutionStateKeys,
  resolveExecutionStateKeyPath,
  type ExecutionStateKeysTree
} from '@bitcode/execution-generics';
import type { Executor } from '@bitcode/execution-generics';
import type { Execution } from '@bitcode/execution-generics/Execution';
import { SubStepExecution, AgentExecution, FailsafeExecution, GenerationExecution } from '../execution';
import { LLMInput } from '@bitcode/llm-generics';
import { parseResponse } from '@bitcode/parsing';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';

// Import generic agent PromptParts directly from their files
// TODO: why are these imports used but below unused?







// Import PTRR-specific substep PromptParts
// Import individual PromptParts directly from their files
// TODO: why are these all unused (i just commented)?
//
//
//
//
//
//
//
//// Import Try substep PromptParts directly
//
//
//
//
//
//
//
//// Import Refine substep PromptParts directly
//
//
//
//
//
//
//
//// Import Retry substep PromptParts directly
//
//
//
//
//
//
//
import { z } from 'zod';
import {
  FailsafeMetaSubStep,
  GenerationSubMetaSubStep,
  PreparedContext,
  Chunk,
  Reasoning,
  UseTool,
  Judgment,
  UsedTool
} from '../types';
import { logLLMSubstepStart, logLLMSubstepSuccess, logLLMSubstepError, logFailsafeEvent, logToolStart, logToolSuccess, logToolError, shouldDebugStopAfterFirstReason, shouldDebugStopAfterFirstStructuredOutput } from '../diagnostics/instrumentation';
// JSON-only prompt parts for structured outputs


// ==================== SUBSTEP EXECUTION FACTORIES ====================

/**
 * Factory for Failsafe SubStep Executions
 */
export function factoryAgentFailsafeSubStepExecution(
  name: string,
  execution: Execution
): SubStepExecution {
  return new FailsafeExecution(`failsafe:${name}`, execution);
}

/**
 * Factory for Generation SubStep Executions
 */
export function factoryAgentGenerationSubStepExecution(
  name: string,
  execution: Execution
): SubStepExecution {
  return new GenerationExecution(`generation:${name}`, execution);
}

/**
 * Factory for Tools SubStep Execution
 */
export function factoryAgentToolSubStepExecution(
  execution: Execution
): SubStepExecution {
  return new SubStepExecution('tools:execution', execution);
}

// ==================== CORE LLM SUBSTEP FACTORY ====================

/**
 * Creates a SubStep Executor that uses LLM
 * 
 * This is the foundation - pure, elegant, reusable.
 * Each SubStep creates its own execution with its own prompt.
 */
function factoryLLMSubStep<TInput, TOutput>(
  sequence: FailsafeMetaSubStep | GenerationSubMetaSubStep,
  config: {
    buildUserPrompt: (input: TInput) => string;
    parseOutput?: (output: string, input: TInput) => Promise<TOutput>;
    enrichPrompt?: (execution: SubStepExecution) => void;
  }
): Executor<TInput, TOutput> {

  return async (input: TInput, execution: Execution): Promise<TOutput> => {
    // Ensure we have access to registries from this node or its ancestors
    const hasRegistries = (() => {
      try {
        const llms = (execution as any).llms;
        const tools = (execution as any).tools;
        const agents = (execution as any).agents;
        return !!llms && !!tools && !!agents;
      } catch { return false; }
    })();
    // If registries are not directly on this node, parent chain proxies will resolve them.
    // Proceed without hard throw to allow Pipeline/Step/SubStep executions with proxy getters.

    // 1. Create SubStep execution with its own prompt registry
    const isFailsafe = Object.values(FailsafeMetaSubStep).includes(sequence as FailsafeMetaSubStep);
    const substep = isFailsafe
      ? factoryAgentFailsafeSubStepExecution(sequence, execution)
      : factoryAgentGenerationSubStepExecution(sequence, execution);

    // Persist PTRR substep for downstream streaming/traces (generation only)
    try {
      if (!isFailsafe) {
        substep.store('ptrr', 'generation', sequence as any);
      }
    } catch {}

    // 2. Get path from execution for prompt path
    const path = substep.getPath();
    const promptPath = [...path, 'substep', sequence].join(':');

    // 3. Add sequence-specific prompt
    if ('prompt' in substep) {
      substep.prompt.setSpecificExecution(
        promptPath,
        getSequencePrompt(sequence)
      );
    }

    // 3.5 Apply overlays from execution (Evidence Documents, OTF, etc.)
    try {
      const { applyPromptOverlays } = require('../execution/prompt-overlays');
      applyPromptOverlays(execution as any, (substep as any).prompt);
    } catch {}

    // 4. Allow custom prompt enrichment
    if (config.enrichPrompt) {
      config.enrichPrompt(substep);
    }

    // 5. Get LLM from execution's registry
    const llm = (execution as any).llms?.getDefaultLLM?.();
    if (!llm) {
      throw new Error(`No default LLM configured for substep '${sequence}'`);
    }

    // 6. Build LLM input by accumulating prompts from hierarchy
    const systemPrompt = buildHierarchicalPrompt(substep);
    let userPrompt = config.buildUserPrompt(input);

    // Enforce strict JSON output for generation substeps to support parsing
    // Provide minimal key shape hints per sequence to improve reliability
    if (sequence === GenerationSubMetaSubStep.REASON) {
      const shape = (ReasoningSchema as any)?.description || '{ "analysis": string, "steps": string[], "conclusion": string, "confidence": number (0..1), "useTools"?: [{ "name": string, "input": any, "reason": string }] }';
      userPrompt = [
        String(PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER),
        shape,
        String(PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_SINGLE_OBJECT),
        '',
        userPrompt,
      ].join('\n');
    } else if (sequence === GenerationSubMetaSubStep.JUDGE) {
      const shape = (JudgmentSchema as any)?.description || '{ "quality": number (0..1), "issues": string[], "suggestions": string[], "approved": boolean }';
      userPrompt = [
        String(PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER),
        shape,
        String(PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_SINGLE_OBJECT),
        '',
        userPrompt,
      ].join('\n');
    } else if (sequence === GenerationSubMetaSubStep.STRUCTURED_OUTPUT) {
      userPrompt = [
        String(PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_SINGLE_OBJECT),
        String(PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA),
        '',
        userPrompt,
        String(PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY),
      ].join('\n');
    }

    // Support optional one-shot prompt composition (no system/user separation)
    const oneShot = process?.env?.BITCODE_LLM_ONE_SHOT === '1';
    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
    const finalPrompt = oneShot ? combinedPrompt : combinedPrompt; // unified single-string view
    const llmInput: LLMInput = oneShot
      ? { messages: [{ role: 'user', content: combinedPrompt }] }
      : { messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }] };

    // 7. Execute LLM with centralized diagnostics
    const startTime = Date.now();
    try {
      try { logLLMSubstepStart(execution, String(sequence), systemPrompt, userPrompt, finalPrompt, (llmInput as any)?.config); } catch { }
      const output = await llm(llmInput);
      try { logLLMSubstepSuccess(execution, String(sequence), output as any, finalPrompt); } catch { }

      // 8. Store execution data
      substep.store('timing', 'duration', Date.now() - startTime);
      // Include meta hints on LLM stores for richer streaming executionState
      let currentFailsafe: any; let phase: any; let agent: any; let step: any;
      try { currentFailsafe = (substep as any).findUp?.('ptrr', 'failsafe'); } catch { currentFailsafe = undefined; }
      try { phase = (substep as any).findUp?.('phase', 'current'); } catch { phase = undefined; }
      try { agent = (substep as any).findUp?.('agent', 'name'); } catch { agent = undefined; }
      try { step = (substep as any).findUp?.('step', 'name'); } catch { step = undefined; }
      let provider: any; let model: any;
      try { provider = (output as any)?.metadata?.provider; } catch { provider = undefined; }
      try { model = (output as any)?.metadata?.model; } catch { model = undefined; }
      const currentSub = sequence;
      substep.store('llm', 'input', Object.assign({}, llmInput as any, { phase, agent, step, failsafe: currentFailsafe, generation: currentSub }));
      substep.store('llm', 'prompt', finalPrompt);
      substep.store('llm', 'output', { content: output.content, phase, agent, step, failsafe: currentFailsafe, generation: currentSub, provider, model } as any);
      try { substep.store('llm', 'stopReason', (output as any)?.metadata?.stopReason); } catch { }
      substep.store('llm', 'usage', output.usage);
      try { substep.store('llm', 'provider', (output as any)?.metadata?.provider); } catch { }
      try { substep.store('llm', 'model', (output as any)?.metadata?.model); } catch { }

      // Optional debug stop (centralized). Only the predicate is guarded —
      // the stop throw itself must escape this substep.
      let debugStopAfterFirstReason = false;
      try { debugStopAfterFirstReason = shouldDebugStopAfterFirstReason(substep, String(sequence)); } catch { }
      if (debugStopAfterFirstReason) {
        try { substep.store('debug', 'stop_after_first_reason', true); } catch { }
        throw new Error('__BITCODE_DEBUG_STOP_AFTER_FIRST_REASON__');
      }

      let debugStopAfterFirstStructuredOutput = false;
      try { debugStopAfterFirstStructuredOutput = shouldDebugStopAfterFirstStructuredOutput(substep, String(sequence)); } catch { }
      if (debugStopAfterFirstStructuredOutput) {
        try { substep.store('debug', 'stop_after_first_structured_output', true); } catch { }
        throw new Error('__BITCODE_DEBUG_STOP_AFTER_FIRST_STRUCTURED_OUTPUT__');
      }

      // 9. Parse output if parser provided
      if (config.parseOutput) {
        const parsedOutput = await config.parseOutput(output.content, input);
        try {
          substep.store('llm', 'parsedOutput', {
            parsed: parsedOutput,
            phase,
            agent,
            step,
            failsafe: currentFailsafe,
            generation: currentSub,
            provider,
            model,
          } as any);
        } catch {}
        return parsedOutput;
      }

      // Default: return content as output
      return output.content as unknown as TOutput;
    } catch (err) {
      try { logLLMSubstepError(execution, String(sequence), err, Date.now() - startTime); } catch { }
      throw err;
    }
  };
}

// ==================== FAILSAFE SUBSTEPS (PARENT EXECUTIONS) ====================

/**
 * Key-selection schema — PCC's selection inference runs against THIS schema,
 * never the step's output schema (PCC never attempts the task).
 */
export const PCC_KEY_SELECTION_SCHEMA = z.object({
  selectedKeys: z.array(z.string())
}).describe('{ "selectedKeys": string[] }');

/** The keys-only selection input shape (values NEVER included). */
export interface PrepareConciseContextSelectionInput {
  preparation: string;
  system: string;
  pipeline_execution_keys: ExecutionStateKeysTree;
}

/**
 * PrepareConciseContext - the CONTEXT failsafe (ALWAYS runs; selection-only)
 *
 * CRITICAL: This is a PARENT execution that:
 * 1. Renders the FULL root execution state as a keys-only tree
 *    (walkExecutionStateKeys — values never enter the selection prompt)
 * 2. Runs ONE selection Thinkings generation against the key-selection schema
 *    with input { preparation, system, pipeline_execution_keys }
 * 3. READS IN the values of exactly the selected keys from the execution
 *    state (misses are omitted, fail-soft, logged)
 * 4. Returns the original task input + the selected context for the task
 *    generation (ChunkThenSum) to consume
 */
export function factoryPrepareConciseContext<T>(
  selectionGeneration?: Executor<any, any>
): Executor<T, T & { selectedKeys: string[]; selectedContext: Record<string, unknown> }> {
  return async (input: T, execution: Execution) => {
    // Create failsafe parent execution as SubStepExecution for proper registry proxying
    const failsafeExec = factoryAgentFailsafeSubStepExecution(
      FailsafeMetaSubStep.PREPARE_CONCISE_CONTEXT,
      execution
    );
    // Surface PTRR meta step for downstream streaming and traces
    try { failsafeExec.store('ptrr', 'failsafe', FailsafeMetaSubStep.PREPARE_CONCISE_CONTEXT as any); } catch {}
    try { execution.store('ptrr', 'failsafe', FailsafeMetaSubStep.PREPARE_CONCISE_CONTEXT as any); } catch {}
    try { logFailsafeEvent(execution, 'prepare-context', { start: true }); } catch {}

    // 1. The FULL root execution state, keys only.
    const root = findGreatestParent(execution);
    const pipelineExecutionKeys = walkExecutionStateKeys(root);
    try { failsafeExec.store('context', 'keys', pipelineExecutionKeys as any); } catch {}

    // 2. Selection inference input: the composed task prompt this failsafe is
    // preparing context for, PCC's own instructions, and the keys-only tree.
    const selectionInput: PrepareConciseContextSelectionInput = {
      preparation: buildHierarchicalPrompt(failsafeExec),
      system: String(PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT),
      pipeline_execution_keys: pipelineExecutionKeys
    };

    const selection = selectionGeneration
      ?? (require('../steps/thinkings-generation').createThinkingsGeneration(
        PCC_KEY_SELECTION_SCHEMA
      ) as Executor<any, any>);
    const selectionResult: any = await selection(selectionInput, failsafeExec.child('selection'));
    const requestedKeys: string[] = Array.isArray(selectionResult?.output?.selectedKeys)
      ? selectionResult.output.selectedKeys.filter((k: any) => typeof k === 'string')
      : [];

    // 3. READ-IN: the values of exactly the selected keys. Selected-key misses
    // resolve to omitted (fail-soft) and are logged.
    const selectedKeys: string[] = [];
    const missingKeys: string[] = [];
    const selectedContext: Record<string, unknown> = {};
    for (const keyPath of requestedKeys) {
      const resolved = resolveExecutionStateKeyPath(root, keyPath);
      if (resolved.found) {
        selectedKeys.push(keyPath);
        selectedContext[keyPath] = resolved.value as any;
      } else {
        missingKeys.push(keyPath);
      }
    }

    try { failsafeExec.store('context', 'selectedKeys', selectedKeys as any); } catch {}
    try { failsafeExec.store('context', 'selectedContext', selectedContext as any); } catch {}
    if (missingKeys.length) {
      try { failsafeExec.store('context', 'missingKeys', missingKeys as any); } catch {}
    }
    try {
      logFailsafeEvent(execution, 'prepare-context', {
        complete: true,
        requestedKeys: requestedKeys.length,
        selectedKeys: selectedKeys.length,
        missingKeys
      });
    } catch {}

    // 4. The prepared task context: the original task input + the selected values.
    return {
      ...(input as any),
      selectedKeys,
      selectedContext
    };
  };
}

/** Conservative default request budget (~4 chars/token). */
const DEFAULT_MAX_REQUEST_TOKENS = 150_000;
const APPROX_CHARS_PER_TOKEN = 4;

/**
 * Resolve the request-token budget: registry config when available
 * (llms.getDefaultConfig().maxRequestTokens), then the
 * BITCODE_LLM_MAX_REQUEST_TOKENS env, then the conservative default.
 */
function resolveMaxRequestTokens(execution: Execution): number {
  try {
    const fromConfig = Number((execution as any).llms?.getDefaultConfig?.()?.maxRequestTokens);
    if (Number.isFinite(fromConfig) && fromConfig > 0) return fromConfig;
  } catch { }
  const fromEnv = Number(process?.env?.BITCODE_LLM_MAX_REQUEST_TOKENS);
  if (Number.isFinite(fromEnv) && fromEnv > 0) return fromEnv;
  return DEFAULT_MAX_REQUEST_TOKENS;
}

/**
 * Greedily pack the selected-context entries into chunks that each fit the
 * per-chunk character budget. An entry that alone exceeds the budget gets its
 * own chunk (recursive intra-value splitting is a later-gate precision).
 */
function chunkSelectedContextEntries(
  entries: Array<[string, unknown]>,
  budgetChars: number
): Array<Record<string, unknown>> {
  const chunks: Array<Record<string, unknown>> = [];
  let current: Record<string, unknown> = {};
  let currentSize = 0;

  for (const [key, value] of entries) {
    const entrySize = estimateSerializedSize({ [key]: value });
    if (currentSize > 0 && currentSize + entrySize > budgetChars) {
      chunks.push(current);
      current = {};
      currentSize = 0;
    }
    current[key] = value;
    currentSize += entrySize;
  }
  if (Object.keys(current).length > 0) chunks.push(current);

  return chunks.length ? chunks : [Object.fromEntries(entries)];
}

/**
 * ChunkThenSum - the INPUT failsafe (trigger = the COMPOSED REQUEST exceeds
 * the request limit)
 *
 * CRITICAL: This is a PARENT execution that:
 * 1. Measures the ACTUAL composed request: the rendered hierarchical system
 *    prompt + the serialized task input INCLUDING the PCC-selected values
 * 2. Non-triggering (fits the request budget): exactly ONE task generation
 * 3. Triggering: chunks ONLY the selected context values — each chunk call
 *    gets the task input + ONLY its chunk (never the full accumulated input) —
 *    then ONE summing generation over the chunk results
 */
export function factoryChunkThenSum<T extends { selectedContext?: Record<string, unknown> }>(
  generationSubSteps: Executor<any, any>[],
  options?: { parallel?: boolean }
): Executor<T, T & { processedResult: any }> {
  return async (input: T, execution: Execution) => {
    // Create failsafe parent execution as SubStepExecution
    const failsafeExec = factoryAgentFailsafeSubStepExecution(
      FailsafeMetaSubStep.CHUNK_THEN_SUM,
      execution
    );
    // Surface PTRR meta step for downstream streaming and traces
    try { failsafeExec.store('ptrr', 'failsafe', FailsafeMetaSubStep.CHUNK_THEN_SUM as any); } catch {}
    try { execution.store('ptrr', 'failsafe', FailsafeMetaSubStep.CHUNK_THEN_SUM as any); } catch {}

    // TRIGGER MEASUREMENT: the composed request the task generation would send.
    const systemPrompt = buildHierarchicalPrompt(failsafeExec);
    const inputChars = estimateSerializedSize(input);
    const composedRequestChars = systemPrompt.length + inputChars;
    const maxRequestTokens = resolveMaxRequestTokens(failsafeExec);
    const requestBudgetChars = maxRequestTokens * APPROX_CHARS_PER_TOKEN;

    const selectedContext = (input as any)?.selectedContext;
    const selectedEntries: Array<[string, unknown]> =
      selectedContext && typeof selectedContext === 'object' && !Array.isArray(selectedContext)
        ? Object.entries(selectedContext)
        : [];

    const overBudget = composedRequestChars > requestBudgetChars;
    // Chunking can only help when there are selected context values to split;
    // an oversized but unsplittable request runs the single path (fail-soft).
    const isChunked = overBudget && selectedEntries.length > 0;

    failsafeExec.store('chunking', 'required', isChunked);
    try {
      failsafeExec.store('chunking', 'measurement', {
        composedRequestChars,
        requestBudgetChars,
        maxRequestTokens,
        systemPromptChars: systemPrompt.length,
        inputChars,
        selectedEntryCount: selectedEntries.length
      } as any);
    } catch {}
    try {
      logFailsafeEvent(execution, 'chunk-then-sum', {
        start: true,
        isChunked,
        overBudget,
        composedRequestChars,
        requestBudgetChars
      });
    } catch { }

    if (isChunked) {
      // The task input WITHOUT the selected values — each chunk call receives
      // the task input + ONLY its own chunk of the selected context.
      const { selectedContext: _allSelected, ...taskInput } = input as any;
      const baseChars = systemPrompt.length + estimateSerializedSize(taskInput);
      const perChunkBudget = Math.max(1000, requestBudgetChars - baseChars);
      const chunks = chunkSelectedContextEntries(selectedEntries, perChunkBudget);
      // The count of chunk task-generations (the sum generation excluded) —
      // rich telemetry renders it so a real chunk-handling case (>1) is
      // visible per step.
      failsafeExec.store('chunking', 'count', chunks.length);

      const chunkExecutors = chunks.map((chunk, idx) =>
        sequential(
          (async (_ignored: any) => ({
            ...taskInput,
            selectedContext: chunk,
            chunk: { index: idx + 1, count: chunks.length }
          })) as Executor<any, any>,
          ...generationSubSteps
        )
      );

      // Run chunks in parallel or sequential
      const doParallel = options?.parallel ?? true;
      let chunkResults: any[];
      if (doParallel) {
        chunkResults = await parallel(...chunkExecutors)(input, failsafeExec.child('chunks'));
      } else {
        chunkResults = [];
        const chunksExec = failsafeExec.child('chunks');
        for (let i = 0; i < chunkExecutors.length; i++) {
          chunkResults.push(await chunkExecutors[i](input, chunksExec.child(`seq-${i}`)));
        }
      }

      // Keep the summing request bounded: each chunk contributes its typed
      // output when present, not the whole accumulated generation envelope.
      const chunkOutputs = chunkResults.map((result) =>
        result && typeof result === 'object' && (result as any).output !== undefined
          ? (result as any).output
          : result
      );

      // Sum the results using ONE summing generation over the chunk results
      let sumResult: any = { ...taskInput, chunkResults: chunkOutputs };
      for (let i = 0; i < generationSubSteps.length; i++) {
        sumResult = await generationSubSteps[i](
          sumResult,
          failsafeExec.child(`sum-gen-${i}`)
        );
      }

      try { logFailsafeEvent(execution, 'chunk-then-sum', { complete: true, mode: 'chunked', chunkCount: chunks.length }); } catch { }
      return { ...sumResult, processedResult: sumResult };
    } else {
      if (overBudget) {
        // Oversized but no selected values to split — log and run single.
        try { logFailsafeEvent(execution, 'chunk-then-sum', { unsplittable: true, composedRequestChars, requestBudgetChars }); } catch { }
      }
      // Non-triggering: exactly ONE task generation pass (zero chunk runs).
      failsafeExec.store('chunking', 'count', 0);
      let result: any = input;

      for (let i = 0; i < generationSubSteps.length; i++) {
        result = await generationSubSteps[i](
          result,
          failsafeExec.child(`gen-${i}`)
        );
      }

      try { logFailsafeEvent(execution, 'chunk-then-sum', { complete: true, mode: 'single' }); } catch { }
      return { ...result, processedResult: result };
    }
  };
}

/**
 * StitchUntilComplete - Parent execution that handles token limit overflows
 * 
 * CRITICAL: This is a PARENT execution that:
 * 1. Checks if output hit the token limit (output length === max tokens)
 * 2. If truncated: recursively calls generation substeps to continue/stitch
 * 3. Continues until complete structured output is achieved
 * 4. Validates final output matches expected schema
 */
export function factoryStitchUntilComplete<T>(
  generationSubSteps: Executor<any, any>[],
  outputSchema?: z.ZodType<any>
): Executor<T, T & { finalOutput: any }> {
  return async (input: T, execution: Execution) => {
    // Ensure we have access to registries (AgentExecution or compatible)
    const hasRegistries = (() => {
      try { return !!(execution as any).llms && !!(execution as any).tools && !!(execution as any).agents; } catch { return false; }
    })();
    // Allow proxy-based registries resolution without hard fail.

    // Create failsafe parent execution as SubStepExecution  
    const failsafeExec = factoryAgentFailsafeSubStepExecution(
      FailsafeMetaSubStep.STITCH_UNTIL_COMPLETE,
      execution
    );
    // Surface PTRR meta step for downstream streaming and traces
    try { failsafeExec.store('ptrr', 'failsafe', FailsafeMetaSubStep.STITCH_UNTIL_COMPLETE as any); } catch {}
    try { execution.store('ptrr', 'failsafe', FailsafeMetaSubStep.STITCH_UNTIL_COMPLETE as any); } catch {}
    try { logFailsafeEvent(execution, 'stitch-until-complete', { start: true }); } catch { }

    // Get LLM config to check token limits
    const llmConfig = (failsafeExec as any).llms?.getDefaultConfig?.();
    const maxOutputTokens = llmConfig?.maxTokens || 4000;

    let currentResult = input;
    let stitchCount = 0;
    const maxStitches = 5; // Prevent infinite loops
    // The most recent schema-validation failure. A stitch prompted only with
    // "continue" cannot repair a schema gap (e.g. a field the model never
    // emits) — the model must be told exactly what failed validation.
    let lastValidationError: string | undefined;

    // Check if output appears truncated (measure the structured output if present)
    const checkTruncation = (candidate: any): boolean => {
      const toMeasure = (candidate && typeof candidate === 'object' && 'output' in candidate)
        ? (candidate as any).output
        : candidate;
      if (typeof toMeasure === 'string') {
        return toMeasure.length >= maxOutputTokens * 3; // Rough token→char estimate
      }
      const serialized = JSON.stringify(toMeasure);
      return serialized.length >= maxOutputTokens * 3;
    };

    while (stitchCount < maxStitches) {
      // If we already have a schema-valid structured output, stop early
      if (outputSchema) {
        try {
          const candidate = (currentResult && (currentResult as any).output !== undefined)
            ? (currentResult as any).output
            : currentResult;
          outputSchema.parse(candidate);
          break; // Valid complete output; no stitching required
        } catch (e) {
          // Fall through to truncation/stitching logic
          lastValidationError = e instanceof Error ? e.message : String(e);
        }
      }

      // Check if we read to stitch due to apparent truncation/overflow
      const needsStitching = checkTruncation(currentResult);

      if (!needsStitching) {
        // Validate if we have complete output
        if (outputSchema) {
          try {
            outputSchema.parse(currentResult);
            break; // Valid complete output
          } catch (e) {
            // Output incomplete, needs stitching
            lastValidationError = e instanceof Error ? e.message : String(e);
            failsafeExec.store('validation', 'error', lastValidationError);
          }
        } else {
          break; // No schema to validate against
        }
      }

      // Run generation substeps to continue/stitch
      stitchCount++;
      // Live per-iteration marker: rich telemetry shows a real stitch-repair
      // case (>=1) as it happens, not only in the post-loop count.
      try { failsafeExec.store('stitching', 'iteration', stitchCount); } catch { }
      const minimalPartial = (currentResult && (currentResult as any).output !== undefined)
        ? (currentResult as any).output
        : currentResult;
      const stitchInput = {
        context: buildStitchContext(input),
        partialOutput: minimalPartial,
        instruction: lastValidationError
          ? `The previous output failed schema validation: ${lastValidationError.slice(0, 600)}. ` +
            'Return the full corrected JSON object with every required field present and within its constraints.'
          : 'Continue and complete the previous output'
      } as any;

      for (let i = 0; i < generationSubSteps.length; i++) {
        currentResult = await generationSubSteps[i](
          stitchInput,
          failsafeExec.child(`stitch-${stitchCount}-gen-${i}`)
        );
      }
    }

    // The iteration that reaches maxStitches exits the loop before the
    // top-of-loop validation can inspect its result, so re-validate here —
    // a schema-valid final stitch is a success, not an exceeded failure.
    const finalStitchValid = (() => {
      if (!outputSchema || stitchCount < maxStitches) return false;
      const candidate = (currentResult && (currentResult as any).output !== undefined)
        ? (currentResult as any).output
        : currentResult;
      try { outputSchema.parse(candidate); return true; } catch { }
      try { outputSchema.parse(currentResult); return true; } catch { }
      return false;
    })();

    failsafeExec.store('stitching', 'count', stitchCount);
    try { logFailsafeEvent(execution, 'stitch-until-complete', { complete: true, stitchCount, exceeded: stitchCount >= maxStitches && !finalStitchValid }); } catch { }

    // Check if we exceeded max stitches without ending on a valid output
    if (stitchCount >= maxStitches && !finalStitchValid) {
      const error = new Error(
        `StitchUntilComplete exceeded maximum stitch attempts (${maxStitches}). ` +
        `Output may be incomplete or truncated. Consider increasing maxTokens or ` +
        `breaking the operation into smaller chunks.`
      );
      failsafeExec.store('stitching', 'error', error.message);

      // Optionally throw the error or return with a warning
      // For now, we'll throw to ensure the issue is addressed
      throw error;
    }

    const finalOutput = (currentResult as any).output ?? currentResult;
    return {
      context: buildStitchContext(input),
      output: finalOutput,
      finalOutput,
    } as any;
  };
}

// ==================== GENERATION SUBSTEPS (CHILD EXECUTIONS) ====================

/**
 * Judge - Generation substep that evaluates quality
 * CRITICAL: This is a CHILD execution that runs within failsafe parents
 */
export function factoryJudge<T>(): Executor<T, T & { judgment: Judgment }> {
  const exec = factoryLLMSubStep(
    GenerationSubMetaSubStep.JUDGE,
    {
      buildUserPrompt: (input) => {
        const typedInput = input as any;
        // Check if we're in a sum context
        const isSum = typedInput.chunkResults !== undefined;
        if (isSum) {
          return `Judge the quality of these chunked results:\n\n${JSON.stringify(typedInput.chunkResults, null, 2)}`;
        }
        return `Evaluate the quality and correctness of:\n\n${JSON.stringify(input, null, 2)}`;
      },

      parseOutput: async (output, input) => {
        const judgment = await parseResponse(
          output,
          JudgmentSchema,
          () => ({
            quality: 0,
            issues: [],
            suggestions: [],
            approved: false
          })
        );

        return { ...(input as any), judgment };
      }
    }
  );
  return Object.assign(exec, { __gen: 'judge' as const });
}

/**
 * Reason - Generation substep that applies logical reasoning  
 * CRITICAL: This is a CHILD execution that runs within failsafe parents
 */
export function factoryReason<T>(): Executor<T, T & { reasoning: Reasoning }> {
  const exec = factoryLLMSubStep(
    GenerationSubMetaSubStep.REASON,
    {
      buildUserPrompt: (input) => {
        const typedInput = input && typeof input === 'object' ? input as any : {};
        // Check context to provide appropriate reasoning prompt
        const isStitch = typedInput.partialOutput !== undefined;
        const isSum = typedInput.chunkResults !== undefined;

        if (isStitch) {
          const context = typedInput.context && Object.keys(typedInput.context).length
            ? `\n\nOriginal task context:\n\n${JSON.stringify(typedInput.context, null, 2)}`
            : '';
          return `Continue reasoning from this partial output:\n\n${JSON.stringify(typedInput.partialOutput, null, 2)}${context}`;
        }
        if (isSum) {
          return `Reason about how to combine these chunk results:\n\n${JSON.stringify(typedInput.chunkResults, null, 2)}`;
        }
        return `Apply logical reasoning to solve:\n\n${JSON.stringify(input ?? null, null, 2)}`;
      },

      parseOutput: async (output, input) => {
        const reasoning = await parseResponse(
          output,
          ReasoningSchema,
          () => ({
            analysis: 'Failed to reason',
            steps: [],
            conclusion: 'No conclusion',
            confidence: 0
          })
        );

        return { ...(input as any), reasoning };
      }
    }
  );
  return Object.assign(exec, { __gen: 'reason' as const });
}

/**
 * StructuredOutput - Generation substep that produces formatted output
 * CRITICAL: This is a CHILD execution that runs within failsafe parents
 */
export function factoryStructuredOutput<T, TSchema>(
  schema: z.ZodType<TSchema>
): Executor<T, T & { output: TSchema }> {
  const exec = factoryLLMSubStep(
    GenerationSubMetaSubStep.STRUCTURED_OUTPUT,
    {
      buildUserPrompt: (input) => {
        const shape = schema.description || inferSchemaShape(schema);
        const keys = inferTopLevelKeys(schema);
        return [
          String(PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_SINGLE_OBJECT),
          String(PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA),
          shape,
          keys.length ? `${String(PROMPTPART_GENERIC_AGENT_GENERATION_TOP_LEVEL_KEYS_HINT)} ${keys.join(', ')}` : '',
          String(PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY),
          '',
          'Generate structured output for:',
          JSON.stringify(input, null, 2),
        ].filter(Boolean).join('\n');
      },

      parseOutput: async (output, input) => {
        const structured = await parseResponse(
          output,
          schema,
          () => buildCoercedBySchema(schema)
        );
        return { ...(input as any), output: structured };
      },

      enrichPrompt: (execution) => {
        // Add schema information to prompt
        const path = execution.getPath();
        const schemaPath = [...path, 'output', 'schema'].join(':');
        execution.prompt.setSpecificExecution(
          schemaPath,
          `Output must match schema: ${schema.description || inferSchemaShape(schema)}` as PromptPart
        );
      }
    }
  );
  return Object.assign(exec, { __gen: 'structured_output' as const });
}

// Infer a minimal shape string from a Zod schema when description is missing
function inferSchemaShape(s: z.ZodTypeAny): string {
  try {
    const shape = getZodObjectShape(s);
    if (shape) {
      const entries = Object.entries(shape);
      const shapeLines = entries.map(([k, v]) => `  "${k}": ${inferField(v)}`);
      return `{
${shapeLines.join(',\n')}
}`;
    }
  } catch { }
  return '{ /* see agent docs for required fields */ }';
}

function inferField(v: z.ZodTypeAny): string {
  const t = (v as any)?._def?.typeName;
  switch (t) {
    case z.ZodFirstPartyTypeKind.ZodString: return 'string';
    case z.ZodFirstPartyTypeKind.ZodNumber: return 'number';
    case z.ZodFirstPartyTypeKind.ZodBoolean: return 'boolean';
    case z.ZodFirstPartyTypeKind.ZodAny: return 'any';
    case z.ZodFirstPartyTypeKind.ZodLiteral: return JSON.stringify((v as any)?._def?.value);
    case z.ZodFirstPartyTypeKind.ZodArray: {
      const inner = (v as any)?._def?.type;
      return `[ ${inner ? inferField(inner) : 'any'} ]`;
    }
    case z.ZodFirstPartyTypeKind.ZodObject: {
      const shape = getZodObjectShape(v);
      if (!shape) return '{ ... }';
      // Render EVERY field: a truncated shape hides required fields from the
      // model, which then systematically omits them and no amount of
      // stitching/retrying can converge on a schema-valid output.
      const keys = Object.entries(shape);
      return `{ ${keys.map(([key, value]) => `"${key}": ${inferField(value)}`).join(', ')} }`;
    }
    case z.ZodFirstPartyTypeKind.ZodRecord: return '{ [key: string]: any }';
    case z.ZodFirstPartyTypeKind.ZodEnum: {
      const values = (v as any)?._def?.values;
      return Array.isArray(values) && values.length
        ? values.map((value) => JSON.stringify(value)).join(' | ')
        : 'enum';
    }
    case z.ZodFirstPartyTypeKind.ZodUnion: {
      const options = (v as any)?._def?.options;
      return Array.isArray(options) ? options.map(inferField).join(' | ') : 'any';
    }
    case z.ZodFirstPartyTypeKind.ZodOptional: return `${inferField((v as any)?._def?.innerType)}?`;
    case z.ZodFirstPartyTypeKind.ZodDefault: return `${inferField((v as any)?._def?.innerType)} = default`;
    case z.ZodFirstPartyTypeKind.ZodNullable: return `${inferField((v as any)?._def?.innerType)} | null`;
    default: return 'any';
  }
}

function inferTopLevelKeys(s: z.ZodTypeAny): string[] {
  try {
    const shape = getZodObjectShape(s);
    if (shape) {
      return Object.keys(shape);
    }
  } catch { }
  return [];
}

function buildCoercedBySchema(s: z.ZodTypeAny): any {
  try {
    const shape = getZodObjectShape(s);
    if (shape) {
      const out: any = {};
      for (const [k, v] of Object.entries(shape)) {
        const t = (v as any)?._def?.typeName;
        const optional = t === z.ZodFirstPartyTypeKind.ZodOptional;
        const defaulted = t === z.ZodFirstPartyTypeKind.ZodDefault;
        const nullable = t === z.ZodFirstPartyTypeKind.ZodNullable;
        const inner = optional || defaulted || nullable ? (v as any)?._def?.innerType : v;
        const typeName = (inner as any)?._def?.typeName;
        if (optional) continue; // skip optional
        switch (typeName) {
          case z.ZodFirstPartyTypeKind.ZodString: out[k] = ''; break;
          case z.ZodFirstPartyTypeKind.ZodNumber: out[k] = 0; break;
          case z.ZodFirstPartyTypeKind.ZodBoolean: out[k] = false; break;
          case z.ZodFirstPartyTypeKind.ZodArray: out[k] = []; break;
          case z.ZodFirstPartyTypeKind.ZodObject: out[k] = buildCoercedBySchema(inner); break;
          case z.ZodFirstPartyTypeKind.ZodRecord: out[k] = {}; break;
          case z.ZodFirstPartyTypeKind.ZodEnum: {
            const values = (inner as any)?._def?.values;
            out[k] = Array.isArray(values) && values.length ? values[0] : null;
            break;
          }
          default: out[k] = null; break;
        }
      }
      return out;
    }
  } catch { }
  return {};
}

function getZodObjectShape(s: z.ZodTypeAny): Record<string, z.ZodTypeAny> | null {
  try {
    const def: any = (s as any)?._def;
    if (def?.typeName !== z.ZodFirstPartyTypeKind.ZodObject) return null;
    const rawShape = def.shape;
    const shape = typeof rawShape === 'function' ? rawShape() : rawShape;
    if (!shape || typeof shape !== 'object' || Array.isArray(shape)) return null;
    return shape as Record<string, z.ZodTypeAny>;
  } catch {
    return null;
  }
}

function buildStitchContext(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object') return {};
  const value = input as any;
  const context: Record<string, unknown> = {};
  const put = (key: string, candidate: unknown) => {
    if (candidate !== undefined && candidate !== null && candidate !== '') {
      context[key] = candidate;
    }
  };

  if (value.context && typeof value.context === 'object' && !Array.isArray(value.context)) {
    for (const [key, candidate] of Object.entries(value.context)) {
      put(key, candidate);
    }
  }

  put('read', value.read ?? value.expressedRead ?? value.definitionOfRead ?? value.context?.read);
  put('definitionOfRead', value.definitionOfRead ?? value.context?.definitionOfRead);
  put('repository', value.repository ?? value.sourceRevision?.repository ?? value.sourceRevision?.repositoryFullName ?? value.context?.repository);
  put('sourceRevision', value.sourceRevision ?? value.context?.sourceRevision);
  put('fitResult', value.fitResult ?? value.depositorySearchResult ?? value.context?.fitResult);
  put('assetPackIntent', value.assetPackIntent ?? value.context?.assetPackIntent);
  put('deliveryMechanism', value.deliveryMechanism ?? value.context?.deliveryMechanism);
  if (Array.isArray(value.selectedKeys) && value.selectedKeys.length) {
    put('selectedKeys', value.selectedKeys);
  }
  if (value.selectedContext && typeof value.selectedContext === 'object') {
    put('selectedContextSummary', summarize(value.selectedContext));
  }

  return context;
}

// ==================== TOOL SUBSTEP ====================

// ==================== TOOL & VALIDATION SUBSTEPS ====================

/**
 * ToolsExecution - Executes tools selected by reasoning
 * Part of the 7-substep PTRR architecture (not a numbered substep itself)
 */
export function factoryToolsExecution<T extends { output?: { useTools?: UseTool[] } }>():
  Executor<T, T & { usedTools: UsedTool[] }> {

  return async (input: T, execution: Execution): Promise<T & { usedTools: UsedTool[] }> => {
    // Ensure we have access to registries (AgentExecution or compatible)
    const hasRegistries = (() => {
      try { return !!(execution as any).llms && !!(execution as any).tools && !!(execution as any).agents; } catch { return false; }
    })();
    // Allow proxy-based registries resolution without hard fail.

    const substep = factoryAgentToolSubStepExecution(execution);

    // Get tools to use from the structured output (after reasoning + judgment)
    const useTools = input.output?.useTools;

    if (!useTools?.length) {
      return { ...input, usedTools: [] };
    }

    // Execute each selected tool
    const usedTools: UsedTool[] = [];

    for (const toolToUse of useTools) {
      // Get tool from execution's registry
      const tool = (execution as any).tools?.getTool?.(toolToUse.name);
      // Resolve current PTRR meta/sub context from step-level store
      let currentFailsafe: any; let phase: any; let agent: any; let step: any;
      try { currentFailsafe = (substep as any).findUp?.('ptrr', 'failsafe'); } catch { currentFailsafe = undefined; }
      try { phase = (substep as any).findUp?.('phase', 'current'); } catch { phase = undefined; }
      try { agent = (substep as any).findUp?.('agent', 'name'); } catch { agent = undefined; }
      try { step = (substep as any).findUp?.('step', 'name'); } catch { step = undefined; }
      const currentSub = 'tools_execution';

      // Emit a structured store for invocation (drives streaming executionState)
      try {
        substep.store('tools', 'invocation', {
          tool: toolToUse.name,
          input: summarize(toolToUse.input),
          phase,
          agent,
          step,
          failsafe: currentFailsafe,
          generation: currentSub
        } as any);
      } catch {}
      if (!tool) {
        try { logToolError(execution, toolToUse.name, new Error(`Tool not found: ${toolToUse.name}`)); } catch { }
        usedTools.push({
          tool: toolToUse.name,
          error: `Tool not found: ${toolToUse.name}`
        });
        try {
          substep.store('tools', 'result', {
            tool: toolToUse.name,
            ok: false,
            input: summarize(toolToUse.input),
            error: `Tool not found: ${toolToUse.name}`,
            phase,
            agent,
            step,
            failsafe: currentFailsafe,
            generation: currentSub
          } as any);
        } catch {}
        continue;
      }

      try {
        // Execute tool with its bound execution context
        try { logToolStart(execution, toolToUse.name, summarize(toolToUse.input)); } catch { }

        // Set execution context for gate-aware tools
        let output: any;
        try {
          const { executionContext } = await import('@bitcode/generic-tools-editing/execution-context');
          output = await executionContext.run(execution, () => tool.execute(toolToUse.input));
        } catch (importError) {
          // Fallback if executionContext not available
          output = await tool.execute(toolToUse.input);
        }

        try { logToolSuccess(execution, toolToUse.name, summarize(output)); } catch { }

        usedTools.push({
          tool: toolToUse.name,
          input: toolToUse.input,
          output
        });
        try {
          substep.store('tools', 'result', {
            tool: toolToUse.name,
            ok: true,
            input: summarize(toolToUse.input),
            output: summarize(output),
            phase,
            agent,
            step,
            failsafe: currentFailsafe,
            generation: currentSub
          } as any);
        } catch {}
      } catch (error) {
        try { logToolError(execution, toolToUse.name, error); } catch { }
        usedTools.push({
          tool: toolToUse.name,
          error: error instanceof Error ? error.message : String(error)
        });
        try {
          substep.store('tools', 'result', {
            tool: toolToUse.name,
            ok: false,
            input: summarize(toolToUse.input),
            error: error instanceof Error ? error.message : String(error),
            phase,
            agent,
            step,
            failsafe: currentFailsafe,
            generation: currentSub
          } as any);
        } catch {}
      }
    }

    return { ...input, usedTools };
  };
}

function summarize(v: any): any {
  try {
    if (v == null) return v;
    if (typeof v === 'string') return v.length > 200 ? v.slice(0, 200) + '…' : v;
    if (Array.isArray(v)) return { type: 'array', length: v.length };
    if (typeof v === 'object') return { type: 'object', keys: Object.keys(v).slice(0, 10) };
    return v;
  } catch { return '[unserializable]'; }
}

/**
 * Validation - validates output against caller-supplied expectations.
 * Core PTRR agents should prefer schema validation inside StructuredOutput.
 */
export function factoryValidation<T>(
  validators?: Array<(input: T) => boolean | Promise<boolean>>
): Executor<T, T & { validation: { passed: boolean; errors: string[] } }> {
  return async (input: T, execution: Execution) => {
    const substep = execution.child('validation');
    const errors: string[] = [];

    if (!validators || validators.length === 0) {
      return {
        ...input,
        validation: { passed: true, errors: [] }
      };
    }

    for (let i = 0; i < validators.length; i++) {
      try {
        const isValid = await validators[i](input);
        if (!isValid) {
          errors.push(`Validator ${i} failed`);
        }
      } catch (e) {
        errors.push(`Validator ${i} error: ${e}`);
      }
    }

    const validation = {
      passed: errors.length === 0,
      errors
    };

    substep.store('validation', 'result', validation);

    return { ...input, validation };
  };
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Find the greatest parent (root) execution in the tree
 * Used by PrepareConciseContext to get full pipeline context
 */
function findGreatestParent(execution: Execution): Execution {
  let current = execution;
  while (current.parent) {
    current = current.parent;
  }
  return current;
}

// ==================== SCHEMAS ====================

// PreparedContext is a partial execution-state projection for callers that
// validate context outside StructuredOutput.
const PreparedContextSchema = z.object({
  files: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
  context: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional()
}).partial();

// ChunkedContent keeps chunk validation available to context-preparation flows.
const ChunkedContentSchema = z.object({
  chunks: z.array(z.object({
    id: z.string(),
    content: z.string(),
    dependencies: z.array(z.string())
  }))
});

// TODO: ReasoningFailsafeOutputSchema or ReasoningFailsafeInputSchema better namign
const ReasoningSchema = z.object({
  analysis: z.string(),
  steps: z.array(z.string()),
  conclusion: z.string(),
  confidence: z.number().min(0).max(1),
  useTools: z.array(z.object({
    tool: z.any(), // Tool reference - validated at runtime
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional()
}).describe('{ "analysis": string, "steps": string[], "conclusion": string, "confidence": number (0..1), "useTools"?: [{ "name": string, "input": any, "reason": string }] }');

const JudgmentSchema = z.object({
  quality: z.number().min(0).max(1),
  issues: z.array(z.string()),
  suggestions: z.array(z.string()),
  approved: z.boolean()
}).describe('{ "quality": number (0..1), "issues": string[], "suggestions": string[], "approved": boolean }');

// ==================== TYPES ====================

// Types are imported from ../types.ts

// ==================== HELPERS ====================

/**
 * Build hierarchical prompt by accumulating from execution tree
 * 
 * Walks up the execution tree and accumulates prompts in order:
 * 1. Agent prompt (from variation/agent level)
 * 2. Step prompt (Plan/Try/Refine/Retry)
 * 3. Failsafe prompt (PrepareConciseContext/ChunkThenSum/StitchUntilComplete)  
 * 4. Generation prompt (Reason/Judge/StructuredOutput)
 *
   * TODO: naming build Hierachacl sub step prompt? too vague
 */
function buildHierarchicalPrompt(execution: Execution): string {
  const prompts: string[] = [];

  // Walk up tree collecting prompts
  let current: Execution | undefined = execution;
  const executions: Execution[] = [];

  while (current) {
    executions.unshift(current); // Add to front to get root->leaf order
    current = current.parent;
  }

  // Format each execution's prompt and accumulate
  for (const exec of executions) {
    // Check if this execution has a prompt registry
    if ('prompt' in exec && exec.prompt) {
        const formatted = (exec as any).prompt.format();
      if (formatted && formatted.trim()) {
        prompts.push(formatted);
      }
    } else if ('prompts' in exec && exec.prompts && exec instanceof AgentExecution) {
      // For AgentExecution, check the prompts registry
      const agentPrompt = exec.prompts.get('system');
      if (agentPrompt) {
        prompts.push(agentPrompt);
      }
    }
  }

  // Join all prompts with clear separation
  return prompts.join('\n\n---\n\n');
}

function getSequencePrompt(sequence: FailsafeMetaSubStep | GenerationSubMetaSubStep): PromptPart {
  const prompts: Record<string, PromptPart> = {
    // FailsafeMetaSubSteps - handling context/input/output concerns
    [FailsafeMetaSubStep.PREPARE_CONCISE_CONTEXT]: PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT,
    [FailsafeMetaSubStep.CHUNK_THEN_SUM]: PROMPTPART_GENERIC_AGENT_FAILSAFE_CHUNK, // TODO: Create combined prompt
    [FailsafeMetaSubStep.STITCH_UNTIL_COMPLETE]: PROMPTPART_GENERIC_AGENT_FAILSAFE_STITCH,
    // GenerationSubMetaSubSteps - the intelligence sequence
    // Order here mirrors execution: REASON → JUDGE → STRUCTURED_OUTPUT
    [GenerationSubMetaSubStep.REASON]: PROMPTPART_GENERIC_AGENT_GENERATION_REASON,
    [GenerationSubMetaSubStep.JUDGE]: PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE,
    [GenerationSubMetaSubStep.STRUCTURED_OUTPUT]: PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT
  };

  return prompts[sequence] || `Execute ${sequence} operation` as PromptPart;
}
