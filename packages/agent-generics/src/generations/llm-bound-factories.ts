/**
 * LLM-bound Generation factories (Failsafe + Thinkings + tools postprocess).
 *
 * Hierarchy:
 *   Agent → PTRR Step (Plan|Try|Retry|Refine)
 *     → FailsafeGeneration ×3 (each is a Generation that sequences Thinkings)
 *       → ThinkingsGeneration (Reason → Judge → StructuredOutput; each is a Generation)
 *     → tools postprocess (after failsafes, when useTools selected)
 *
 * Failsafes (three, each a DISTINCT trigger and job):
 * 1. PrepareConciseContext — keys-only selection over full root state, then value read-in
 * 2. ChunkThenSum — task Thinkings when input fits; else chunk + sum
 * 3. StitchUntilComplete — schema-incomplete / truncated output repair
 *
 * Prefer imports from `@bitcode/agent-generics/generations` (or package root).
 */

import { PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_failsafe_prepare_context';
import { PROMPTPART_GENERIC_AGENT_FAILSAFE_CHUNK } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_failsafe_chunk';
import { PROMPTPART_GENERIC_AGENT_FAILSAFE_STITCH } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_failsafe_stitch';
import { PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_judge';
import { PROMPTPART_GENERIC_AGENT_GENERATION_REASON } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_reason';
import {
  PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT,
  PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT_TOOLS_IF_SCHEMA,
} from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_structured_output';
import { PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_json_only_header';
import { PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_SINGLE_OBJECT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_json_only_single_object';
import { PROMPTPART_GENERIC_AGENT_GENERATION_IF_UNKNOWN_EMPTY } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_if_unknown_empty';
import { PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_use_this_structured_schema';
import { PROMPTPART_GENERIC_AGENT_GENERATION_TOP_LEVEL_KEYS_HINT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_top_level_keys_hint';
import { estimateSerializedSize } from '@bitcode/generic-generations-failsafes';
import {
  sequential,
  parallel,
  conditional,
  walkExecutionStateKeys,
  resolveExecutionStateKeyPath,
  buildExecutionHierarchySystemPrompt,
  EXECUTION_HIERARCHY_PROMPT_NODE_SEPARATOR,
  type ExecutionStateKeysTree
} from '@bitcode/execution-generics';
import type { Executor } from '@bitcode/execution-generics';
import type { Execution } from '@bitcode/execution-generics/Execution';
import {
  GenerationExecution,
  AgentExecution,
  FailsafeGenerationExecution,
  ThinkingsGenerationExecution,
} from '../execution';
import { LLMInput } from '@bitcode/llm-generics';
import { parseResponse } from '@bitcode/parsing';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { z } from 'zod';
import {
  FailsafeGeneration,
  ThinkingsGeneration,
  PreparedContext,
  Chunk,
  Reasoning,
  UseTool,
  Judgment,
  UsedTool
} from '../types';
import {
  logLLMGenerationStart,
  logLLMGenerationSuccess,
  logLLMGenerationError,
  logFailsafeEvent,
  logToolStart,
  logToolSuccess,
  logToolError,
  shouldDebugStopAfterFirstReason,
  shouldDebugStopAfterFirstStructuredOutput,
} from '../diagnostics/instrumentation';

// ---- Prompt-safe serialization (deposit inventory must never enter prompts) ----
// Full-repo inventory.sources can be hundreds of MB. JSON.stringify of that
// throws RangeError: Invalid string length (live deposit runs 5439863e / 6e0c5f45
// crashed in buildUserPrompt after PrepareConciseContext selected deposit#inventory).
const PROMPT_REDACT_KEYS = new Set([
  'sources', // inventory.sources — full verbatim checkout
  'fullContent',
  'rawData',
  'embeddings',
  'tokens',
]);
const MAX_PROMPT_STRING_CHARS = 4_000;
const MAX_PROMPT_JSON_CHARS = 200_000;
const MAX_PROMPT_ARRAY_ITEMS = 200;
const MAX_PROMPT_OBJECT_KEYS = 80;
const MAX_PROMPT_PATH_LIST = 500;

/**
 * Project a value into a bounded, source-safe shape suitable for LLM prompts.
 * Strips inventory.sources and other content-bearing blobs; truncates long
 * strings and large arrays. Safe to call on the full execution state.
 */
export function projectPromptSafeValue(value: unknown, depth = 0): unknown {
  if (value == null) return value;
  if (depth > 12) return '[truncated-depth]';
  if (typeof value === 'string') {
    if (value.length <= MAX_PROMPT_STRING_CHARS) return value;
    return `${value.slice(0, MAX_PROMPT_STRING_CHARS)}… [+${value.length - MAX_PROMPT_STRING_CHARS} chars]`;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (typeof value === 'bigint') return String(value);
  if (Array.isArray(value)) {
    const slice = value.slice(0, MAX_PROMPT_ARRAY_ITEMS);
    const projected = slice.map((item) => projectPromptSafeValue(item, depth + 1));
    if (value.length > MAX_PROMPT_ARRAY_ITEMS) {
      projected.push(`… [+${value.length - MAX_PROMPT_ARRAY_ITEMS} items]`);
    }
    return projected;
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    // Inventory shape: keep paths + bounded samples; never sources content.
    if (Array.isArray(obj.sources) && (Array.isArray(obj.paths) || Array.isArray(obj.samples))) {
      const paths = Array.isArray(obj.paths) ? obj.paths : [];
      return {
        pathCount: paths.length,
        paths: projectPromptSafeValue(paths.slice(0, MAX_PROMPT_PATH_LIST), depth + 1),
        ...(paths.length > MAX_PROMPT_PATH_LIST
          ? { pathsOmitted: paths.length - MAX_PROMPT_PATH_LIST }
          : {}),
        samples: projectPromptSafeValue(obj.samples, depth + 1),
        totalPathCount: obj.totalPathCount ?? paths.length,
        excludedPathCount: obj.excludedPathCount ?? 0,
        sourceFileCount: obj.sources.length,
        sources: `[${obj.sources.length} source files withheld from prompt — use paths/samples]`,
      };
    }
    const out: Record<string, unknown> = {};
    let keys = 0;
    for (const [k, v] of Object.entries(obj)) {
      if (keys >= MAX_PROMPT_OBJECT_KEYS) {
        out['…'] = '[+more keys]';
        break;
      }
      if (PROMPT_REDACT_KEYS.has(k)) {
        if (Array.isArray(v)) {
          out[k] = `[${v.length} items withheld from prompt]`;
        } else if (typeof v === 'string') {
          out[k] = `[${v.length} chars withheld from prompt]`;
        } else if (v && typeof v === 'object') {
          out[k] = '[withheld from prompt]';
        } else {
          out[k] = '[withheld from prompt]';
        }
        keys += 1;
        continue;
      }
      out[k] = projectPromptSafeValue(v, depth + 1);
      keys += 1;
    }
    return out;
  }
  try {
    return String(value);
  } catch {
    return '[unserializable]';
  }
}

/**
 * JSON for user prompts — never throws Invalid string length on huge inventories.
 */
export function safePromptJson(value: unknown, space: number | null = 2): string {
  try {
    const projected = projectPromptSafeValue(value);
    let text =
      space === null || space === 0
        ? JSON.stringify(projected)
        : JSON.stringify(projected, null, space);
    if (typeof text !== 'string') return 'null';
    if (text.length > MAX_PROMPT_JSON_CHARS) {
      const compact = JSON.stringify(projected);
      if (compact.length <= MAX_PROMPT_JSON_CHARS) return compact;
      return `${compact.slice(0, MAX_PROMPT_JSON_CHARS)}\n… [prompt JSON truncated, +${compact.length - MAX_PROMPT_JSON_CHARS} chars]`;
    }
    return text;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return `{"error":"prompt serialization failed","message":${JSON.stringify(message)}}`;
  }
}

// ==================== GENERATION EXECUTION NODE FACTORIES ====================

/**
 * Factory for FailsafeGeneration parent execution nodes
 */
export function factoryAgentFailsafeGenerationExecution(
  name: string,
  execution: Execution
): FailsafeGenerationExecution {
  return new FailsafeGenerationExecution(`failsafe:${name}`, execution);
}

/**
 * Factory for ThinkingsGeneration child execution nodes
 */
export function factoryAgentThinkingsGenerationExecution(
  name: string,
  execution: Execution
): ThinkingsGenerationExecution {
  return new ThinkingsGenerationExecution(`thinkings:${name}`, execution);
}

/**
 * Factory for tools generation-layer execution (postprocess after failsafes)
 */
export function factoryAgentToolGenerationExecution(
  execution: Execution
): GenerationExecution {
  return new GenerationExecution('tools:execution', execution);
}

// ==================== CORE LLM GENERATION FACTORY ====================

/**
 * Creates a Generation Executor that calls an LLM (Thinkings unit, or
 * failsafe-scoped generation when used that way).
 *
 * Each call creates its own GenerationExecution with its own prompt registry.
 */
function factoryLLMGeneration<TInput, TOutput>(
  sequence: FailsafeGeneration | ThinkingsGeneration,
  config: {
    buildUserPrompt: (input: TInput) => string;
    parseOutput?: (output: string, input: TInput) => Promise<TOutput>;
    enrichPrompt?: (execution: GenerationExecution) => void;
    /** StructuredOutput schema shape string (single user-envelope source). */
    structuredSchemaShape?: string;
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
    // If registries are not directly on this node, parent chain proxies resolve them.
    // Proceed without hard throw (Pipeline/Step/Generation executions with proxies).

    // 1. Create Generation execution with its own prompt registry
    const isFailsafe = Object.values(FailsafeGeneration).includes(sequence as FailsafeGeneration);
    const generationExec = isFailsafe
      ? factoryAgentFailsafeGenerationExecution(sequence, execution)
      : factoryAgentThinkingsGenerationExecution(sequence, execution);

    // Persist PTRR generation id for streaming/traces (Thinkings only)
    try {
      if (!isFailsafe) {
        generationExec.store('ptrr', 'generation', sequence as any);
      }
    } catch {}

    // 2. Path for prompt registry + role detection (sequence name is final segment).
    const path = generationExec.getPath();
    const promptPath = [...path, 'generation', sequence].join(':');

    // 3. Add sequence-specific prompt
    if ('prompt' in generationExec) {
      generationExec.prompt.setSpecificExecution(
        promptPath,
        getSequencePrompt(sequence)
      );
    }

    // 3.5 Apply overlays from execution (Evidence Documents, OTF, etc.)
    try {
      const { applyPromptOverlays } = require('../execution/prompt-overlays');
      applyPromptOverlays(execution as any, (generationExec as any).prompt);
    } catch {}

    // 3.6 Tool interpolations (Agent + PTRR):
    //  - Doc-code docs for usable tools → auto:tools_doc_code_tools
    //  - Prior usedTools results → auto:tools_results
    // Thinkings generations (especially Reason / StructuredOutput) need docs
    // to emit useTools[{ name, input, reason }]; Retry needs results.
    try {
      const isThinkings =
        Object.values(ThinkingsGeneration).includes(sequence as ThinkingsGeneration);
      if (isThinkings) {
        const { injectToolInterpolationsForGeneration } = require(
          '../execution/tool-prompt-interpolation'
        );
        injectToolInterpolationsForGeneration(generationExec, input);
      }
    } catch {}

    // 4. Allow custom prompt enrichment
    if (config.enrichPrompt) {
      config.enrichPrompt(generationExec);
    }

    // 5. Get LLM from execution's registry
    const llm = (execution as any).llms?.getDefaultLLM?.();
    if (!llm) {
      throw new Error(`No default LLM configured for generation '${sequence}'`);
    }

    // 6. Build LLM input by accumulating prompts from hierarchy
    const systemPrompt = buildHierarchicalPrompt(generationExec);
    let userPrompt = config.buildUserPrompt(input);

    // Enforce strict JSON output for Thinkings generations (once — builders must not re-prefix).
    if (sequence === ThinkingsGeneration.REASON) {
      const shape = (ReasoningSchema as any)?.description || '{ "analysis": string, "reasoningItems": string[], "conclusion": string, "confidence": number (0..1), "useTools"?: [{ "name": string, "input": any, "reason": string }] }';
      userPrompt = [
        String(PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER),
        shape,
        String(PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_SINGLE_OBJECT),
        '',
        userPrompt,
      ].join('\n');
    } else if (sequence === ThinkingsGeneration.JUDGE) {
      const shape = (JudgmentSchema as any)?.description || '{ "quality": number (0..1), "issues": string[], "suggestions": string[], "approved": boolean }';
      userPrompt = [
        String(PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER),
        shape,
        String(PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_SINGLE_OBJECT),
        '',
        userPrompt,
      ].join('\n');
    } else if (sequence === ThinkingsGeneration.STRUCTURED_OUTPUT) {
      // Schema shape is owned here once; factoryStructuredOutput.buildUserPrompt
      // only supplies the payload body (no second JSON-only / schema envelope).
      const shape =
        config.structuredSchemaShape ||
        '{ /* see active schema */ }';
      userPrompt = [
        String(PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER),
        shape,
        String(PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_SINGLE_OBJECT),
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
      try { logLLMGenerationStart(execution, String(sequence), systemPrompt, userPrompt, finalPrompt, (llmInput as any)?.config); } catch { }
      const output = await llm(llmInput);
      try { logLLMGenerationSuccess(execution, String(sequence), output as any, finalPrompt); } catch { }

      // 8. Store execution data
      generationExec.store('timing', 'duration', Date.now() - startTime);
      // Include meta hints on LLM stores for richer streaming executionState
      let currentFailsafe: any; let phase: any; let agent: any; let step: any;
      try { currentFailsafe = (generationExec as any).findUp?.('ptrr', 'failsafe'); } catch { currentFailsafe = undefined; }
      try { phase = (generationExec as any).findUp?.('phase', 'current'); } catch { phase = undefined; }
      try { agent = (generationExec as any).findUp?.('agent', 'name'); } catch { agent = undefined; }
      try { step = (generationExec as any).findUp?.('step', 'name'); } catch { step = undefined; }
      let provider: any; let model: any;
      try { provider = (output as any)?.metadata?.provider; } catch { provider = undefined; }
      try { model = (output as any)?.metadata?.model; } catch { model = undefined; }
      const currentGeneration = sequence;
      generationExec.store('llm', 'input', Object.assign({}, llmInput as any, { phase, agent, step, failsafe: currentFailsafe, generation: currentGeneration }));
      generationExec.store('llm', 'prompt', finalPrompt);
      generationExec.store('llm', 'output', { content: output.content, phase, agent, step, failsafe: currentFailsafe, generation: currentGeneration, provider, model } as any);
      try { generationExec.store('llm', 'stopReason', (output as any)?.metadata?.stopReason); } catch { }
      generationExec.store('llm', 'usage', output.usage);
      try { generationExec.store('llm', 'provider', (output as any)?.metadata?.provider); } catch { }
      try { generationExec.store('llm', 'model', (output as any)?.metadata?.model); } catch { }

      // Optional debug stop (centralized). Only the predicate is guarded —
      // the stop throw itself must escape this generation.
      let debugStopAfterFirstReason = false;
      try { debugStopAfterFirstReason = shouldDebugStopAfterFirstReason(generationExec, String(sequence)); } catch { }
      if (debugStopAfterFirstReason) {
        try { generationExec.store('debug', 'stop_after_first_reason', true); } catch { }
        throw new Error('__BITCODE_DEBUG_STOP_AFTER_FIRST_REASON__');
      }

      let debugStopAfterFirstStructuredOutput = false;
      try { debugStopAfterFirstStructuredOutput = shouldDebugStopAfterFirstStructuredOutput(generationExec, String(sequence)); } catch { }
      if (debugStopAfterFirstStructuredOutput) {
        try { generationExec.store('debug', 'stop_after_first_structured_output', true); } catch { }
        throw new Error('__BITCODE_DEBUG_STOP_AFTER_FIRST_STRUCTURED_OUTPUT__');
      }

      // 9. Parse output if parser provided
      if (config.parseOutput) {
        const parsedOutput = await config.parseOutput(output.content, input);
        try {
          generationExec.store('llm', 'parsedOutput', {
            parsed: parsedOutput,
            phase,
            agent,
            step,
            failsafe: currentFailsafe,
            generation: currentGeneration,
            provider,
            model,
          } as any);
        } catch {}
        return parsedOutput;
      }

      // Default: return content as output
      return output.content as unknown as TOutput;
    } catch (err) {
      try { logLLMGenerationError(execution, String(sequence), err, Date.now() - startTime); } catch { }
      throw err;
    }
  };
}

// ==================== FAILSAFE GENERATIONS (PARENT EXECUTIONS) ====================

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
    // Create failsafe parent execution as GenerationExecution for proper registry proxying
    const failsafeExec = factoryAgentFailsafeGenerationExecution(
      FailsafeGeneration.PREPARE_CONCISE_CONTEXT,
      execution
    );
    // Surface PTRR meta step for downstream streaming and traces
    try { failsafeExec.store('ptrr', 'failsafe', FailsafeGeneration.PREPARE_CONCISE_CONTEXT as any); } catch {}
    try { execution.store('ptrr', 'failsafe', FailsafeGeneration.PREPARE_CONCISE_CONTEXT as any); } catch {}
    try { logFailsafeEvent(execution, 'prepare-context', { start: true }); } catch {}

    // Attach PCC law on the failsafe parent so hierarchical system prompts for
    // selection Thinkings (reason/judge/SO) include ranking/path form — not only
    // the nested `system` field inside the selection user JSON.
    try {
      const path = typeof (failsafeExec as any).getPath === 'function'
        ? (failsafeExec as any).getPath()
        : [];
      const promptPath = [
        ...(Array.isArray(path) ? path : []),
        'failsafe:prepare_concise_context',
        'law',
      ].join(':');
      (failsafeExec as any).prompt?.setSpecificExecution?.(
        promptPath,
        PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT,
      );
    } catch { /* ignore */ }

    // 1. The FULL root execution state, keys only.
    const root = findGreatestParent(execution);
    const pipelineExecutionKeys = walkExecutionStateKeys(root);
    try { failsafeExec.store('context', 'keys', pipelineExecutionKeys as any); } catch {}

    // 2. Selection inference input: lean task identity (not full hierarchy soup),
    // PCC law (also on hierarchical system for Thinkings), and keys-only tree.
    const selectionInput: PrepareConciseContextSelectionInput = {
      preparation: buildPccLeanTaskPreparation(failsafeExec),
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
        // Project at read-in: deposit#inventory / pipeline#input can carry
        // multi-hundred-MB inventory.sources. Task generations (reason/judge/
        // structured_output) JSON-serialize selectedContext into the user
        // prompt — never pass verbatim sources into that path.
        selectedContext[keyPath] = projectPromptSafeValue(resolved.value) as any;
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
  thinkingsGenerations: Executor<any, any>[],
  options?: { parallel?: boolean }
): Executor<T, T & { processedResult: any }> {
  return async (input: T, execution: Execution) => {
    // Create failsafe parent execution as GenerationExecution
    const failsafeExec = factoryAgentFailsafeGenerationExecution(
      FailsafeGeneration.CHUNK_THEN_SUM,
      execution
    );
    // Surface PTRR meta step for downstream streaming and traces
    try { failsafeExec.store('ptrr', 'failsafe', FailsafeGeneration.CHUNK_THEN_SUM as any); } catch {}
    try { execution.store('ptrr', 'failsafe', FailsafeGeneration.CHUNK_THEN_SUM as any); } catch {}

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
          ...thinkingsGenerations
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
      for (let i = 0; i < thinkingsGenerations.length; i++) {
        sumResult = await thinkingsGenerations[i](
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

      for (let i = 0; i < thinkingsGenerations.length; i++) {
        result = await thinkingsGenerations[i](
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
 * 2. If truncated: recursively calls Thinkings generations to continue/stitch
 * 3. Continues until complete structured output is achieved
 * 4. Validates final output matches expected schema
 */
export function factoryStitchUntilComplete<T>(
  thinkingsGenerations: Executor<any, any>[],
  outputSchema?: z.ZodType<any>
): Executor<T, T & { finalOutput: any }> {
  return async (input: T, execution: Execution) => {
    // Ensure we have access to registries (AgentExecution or compatible)
    const hasRegistries = (() => {
      try { return !!(execution as any).llms && !!(execution as any).tools && !!(execution as any).agents; } catch { return false; }
    })();
    // Allow proxy-based registries resolution without hard fail.

    // Create failsafe parent execution as GenerationExecution  
    const failsafeExec = factoryAgentFailsafeGenerationExecution(
      FailsafeGeneration.STITCH_UNTIL_COMPLETE,
      execution
    );
    // Surface PTRR meta step for downstream streaming and traces
    try { failsafeExec.store('ptrr', 'failsafe', FailsafeGeneration.STITCH_UNTIL_COMPLETE as any); } catch {}
    try { execution.store('ptrr', 'failsafe', FailsafeGeneration.STITCH_UNTIL_COMPLETE as any); } catch {}
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
      try {
        // Use prompt-safe projection so inventory.sources never blows stringify.
        const serialized = safePromptJson(toMeasure, null);
        return serialized.length >= maxOutputTokens * 3;
      } catch {
        return false;
      }
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

      // Run Thinkings generations to continue/stitch
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

      for (let i = 0; i < thinkingsGenerations.length; i++) {
        currentResult = await thinkingsGenerations[i](
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

// ==================== THINKINGS GENERATIONS (CHILD EXECUTIONS) ====================

/**
 * Judge - Thinkings generation that evaluates quality
 * CRITICAL: This is a CHILD execution that runs within failsafe parents
 */
export function factoryJudge<T>(): Executor<T, T & { judgment: Judgment }> {
  const exec = factoryLLMGeneration(
    ThinkingsGeneration.JUDGE,
    {
      buildUserPrompt: (input) => {
        const typedInput = input as any;
        const isSum = typedInput.chunkResults !== undefined;
        if (isSum) {
          return `Judge the quality of these chunked results:\n\n${safePromptJson(typedInput.chunkResults)}`;
        }
        // PCC selection: do not re-dump full hierarchy preparation / PCC essay.
        const isPccSelection =
          typedInput.pipeline_execution_keys !== undefined &&
          (typedInput.preparation !== undefined || typedInput.reasoning !== undefined);
        if (isPccSelection) {
          return [
            'Judge ONLY the prior PrepareConciseContext key-selection reasoning for minimality and coverage.',
            'Score against pipeline_execution_keys and PCC ranking law (in system). Do not re-select keys; do not emit selectedKeys; do not attempt the agent task.',
            '',
            'Judgment input:',
            safePromptJson({
              task: typeof typedInput.preparation === 'string'
                ? typedInput.preparation
                : undefined,
              reasoning: typedInput.reasoning ?? null,
              pipeline_execution_keys: typedInput.pipeline_execution_keys,
            }),
          ].join('\n');
        }
        return `Evaluate the quality and correctness of:\n\n${safePromptJson(input)}`;
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
 * Reason - Thinkings generation that applies logical reasoning  
 * CRITICAL: This is a CHILD execution that runs within failsafe parents
 */
export function factoryReason<T>(): Executor<T, T & { reasoning: Reasoning }> {
  const exec = factoryLLMGeneration(
    ThinkingsGeneration.REASON,
    {
      buildUserPrompt: (input) => {
        const typedInput = input && typeof input === 'object' ? input as any : {};
        // Check context to provide appropriate reasoning prompt
        const isStitch = typedInput.partialOutput !== undefined;
        const isSum = typedInput.chunkResults !== undefined;
        // PCC selection Thinkings: input is { preparation, system, pipeline_execution_keys }
        const isPccSelection =
          typedInput.pipeline_execution_keys !== undefined &&
          typedInput.preparation !== undefined;

        if (isStitch) {
          const context = typedInput.context && Object.keys(typedInput.context).length
            ? `\n\nOriginal task context:\n\n${safePromptJson(typedInput.context)}`
            : '';
          return `Continue reasoning from this partial output:\n\n${safePromptJson(typedInput.partialOutput)}${context}`;
        }
        if (isSum) {
          return `Reason about how to combine these chunk results:\n\n${safePromptJson(typedInput.chunkResults)}`;
        }
        if (isPccSelection) {
          // PCC law is already on the hierarchical system prompt; do not re-embed
          // it (or the full EE hierarchy) in the user JSON.
          return [
            'Reason ONLY about PrepareConciseContext key selection for the task below.',
            'Goals: minimal sufficient keys; prefer host workspace / repository coordinates / step inputs; omit lineage, telemetry, debug, and unrelated phase state.',
            'Do NOT emit selectedKeys (structured_output will). Do NOT select tools (useTools must be omitted). Do NOT attempt the agent task itself.',
            'In analysis/reasoningItems/conclusion: name candidate keys using paths present in pipeline_execution_keys, prefer form \'<execution-path>#<namespace>:<key>\' (root shorthand \'#namespace:key\' is ok); explain why each is needed for subsequent Plan/Try failsafes. Use reasoningItems (never "steps" — steps means PTRR Plan/Try/Refine/Retry).',
            '',
            'Selection input:',
            safePromptJson({
              task: typedInput.preparation,
              pipeline_execution_keys: typedInput.pipeline_execution_keys,
            }),
          ].join('\n');
        }
        return `Apply logical reasoning to solve:\n\n${safePromptJson(input ?? null)}`;
      },

      parseOutput: async (output, input) => {
        const reasoning = await parseResponse(
          output,
          ReasoningSchema,
          () => ({
            analysis: 'Failed to reason',
            reasoningItems: [],
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
 * StructuredOutput - Thinkings generation that produces formatted output
 * CRITICAL: This is a CHILD execution that runs within failsafe parents
 */
export function factoryStructuredOutput<T, TSchema>(
  schema: z.ZodType<TSchema>
): Executor<T, T & { output: TSchema }> {
  const shape = schema.description || inferSchemaShape(schema);
  const topKeys = inferTopLevelKeys(schema);
  const allowsUseTools = topKeys.includes('useTools');

  const exec = factoryLLMGeneration(
    ThinkingsGeneration.STRUCTURED_OUTPUT,
    {
      structuredSchemaShape: shape,
      buildUserPrompt: (input) => {
        const typedInput = input as any;
        const isPccSelection =
          typedInput.pipeline_execution_keys !== undefined &&
          (typedInput.reasoning !== undefined || typedInput.preparation !== undefined);

        if (isPccSelection) {
          // Lean SO payload: reason + judgment + keys. No hierarchy re-copy, no useTools.
          return [
            'Emit ONLY { "selectedKeys": string[] } for PrepareConciseContext.',
            'Slot from prior reasoning and judgment; do not re-reason.',
            'Despite approved:false, emit the best legal minimal selectedKeys now.',
            'Use path form from pipeline_execution_keys (e.g. #deposit:repository). Never invent keys. Never include useTools.',
            '',
            'Structured output input:',
            safePromptJson({
              task: typeof typedInput.preparation === 'string'
                ? typedInput.preparation
                : undefined,
              reasoning: typedInput.reasoning ?? null,
              judgment: typedInput.judgment ?? null,
              pipeline_execution_keys: typedInput.pipeline_execution_keys,
            }),
          ].join('\n');
        }

        // Non-PCC task SO: payload only (schema envelope is outer wrap once).
        const keysHint = topKeys.length
          ? `${String(PROMPTPART_GENERIC_AGENT_GENERATION_TOP_LEVEL_KEYS_HINT)} ${topKeys.join(', ')}`
          : '';
        return [
          keysHint,
          'Generate structured output for:',
          safePromptJson(input),
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
        const path = execution.getPath();
        const schemaPath = [...path, 'output', 'schema'].join(':');
        execution.prompt.setSpecificExecution(
          schemaPath,
          `Output must match schema: ${shape}` as PromptPart
        );
        // Task SO may need tools clause when schema includes useTools (not PCC).
        if (allowsUseTools) {
          const role = detectHierarchicalPromptRole(execution);
          if (role.failsafe !== 'prepare_concise_context') {
            const toolsPath = [...path, 'output', 'tools_if_schema'].join(':');
            execution.prompt.setSpecificExecution(
              toolsPath,
              PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT_TOOLS_IF_SCHEMA,
            );
          }
        }
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

// ==================== TOOLS GENERATION (POSTPROCESS) ====================

// ==================== TOOL & VALIDATION GENERATIONS ====================

/**
 * ToolsExecution — PTRR step **postprocess** after Failsafe×Thinkings.
 *
 * Contract (see packages/agent-generics/TOOLS-IN-PTRR.md):
 * - Input: `output.useTools: Array<{ name: string, input: any, reason?: string }>`
 *   (LLM structured selection; name keys AgentToolsRegistry).
 * - Lookup: `execution.tools.getTool(name)` (hierarchy + parent pipeline).
 * - Call: `tool.execute(input)` with optional editing executionContext.
 * - Output: `usedTools: Array<{ tool, input?, output?, error? }>` for telemetry
 *   and results interpolation on later generations.
 *
 * Not a numbered Failsafe/Thinkings generation — runs once per step via
 * `sequential(core, conditional(hasUseTools, factoryToolsExecution()))`.
 */
export function factoryToolsExecution<T extends { output?: { useTools?: UseTool[] } }>():
  Executor<T, T & { usedTools: UsedTool[] }> {

  return async (input: T, execution: Execution): Promise<T & { usedTools: UsedTool[] }> => {
    // Ensure we have access to registries (AgentExecution or compatible)
    const hasRegistries = (() => {
      try { return !!(execution as any).llms && !!(execution as any).tools && !!(execution as any).agents; } catch { return false; }
    })();
    // Allow proxy-based registries resolution without hard fail.
    void hasRegistries;

    const toolsExec = factoryAgentToolGenerationExecution(execution);

    // Normalize selection shapes: { name, input, reason } (canonical) or { tool: string|Tool, input }
    const rawUseTools = (input.output as any)?.useTools;
    const useTools: Array<{ name: string; input: any; reason?: string }> = Array.isArray(rawUseTools)
      ? rawUseTools.map((t: any) => ({
          name: String(t?.name ?? (typeof t?.tool === 'string' ? t.tool : t?.tool?.name ?? t?.tool?.constructor?.name ?? '')),
          input: t?.input ?? t?.parameters ?? {},
          reason: t?.reason,
        })).filter((t: any) => t.name)
      : [];

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
      try { currentFailsafe = (toolsExec as any).findUp?.('ptrr', 'failsafe'); } catch { currentFailsafe = undefined; }
      try { phase = (toolsExec as any).findUp?.('phase', 'current'); } catch { phase = undefined; }
      try { agent = (toolsExec as any).findUp?.('agent', 'name'); } catch { agent = undefined; }
      try { step = (toolsExec as any).findUp?.('step', 'name'); } catch { step = undefined; }
      const currentSub = 'tools_execution';

      // Emit a structured store for invocation (drives streaming executionState)
      try {
        toolsExec.store('tools', 'invocation', {
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
          toolsExec.store('tools', 'result', {
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
          toolsExec.store('tools', 'result', {
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
          toolsExec.store('tools', 'result', {
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
    const validationExec = execution.child('validation');
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

    validationExec.store('validation', 'result', validation);

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
  // Not "steps": reserved for ExecutionAgentPTRRStep (Plan/Try/Refine/Retry).
  reasoningItems: z.array(z.string()),
  conclusion: z.string(),
  confidence: z.number().min(0).max(1),
  useTools: z.array(z.object({
    tool: z.any(), // Tool reference - validated at runtime
    name: z.string(),
    input: z.any(),
    reason: z.string()
  })).optional()
}).describe('{ "analysis": string, "reasoningItems": string[], "conclusion": string, "confidence": number (0..1), "useTools"?: [{ "name": string, "input": any, "reason": string }] }');

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
 * Role of the leaf execution when formatting hierarchical prompts.
 * Prevents sibling Thinkings (judge/SO) and non-active failsafes from
 * leaking into the over-the-wire system prompt of the active generation.
 */
type HierarchicalPromptRole = {
  /** Active Thinkings unit, if any: reason | judge | structured_output */
  thinking: 'reason' | 'judge' | 'structured_output' | null;
  /** Active failsafe id fragment, if any: prepare_concise_context | chunk_then_sum | stitch */
  failsafe: string | null;
  /**
   * When true, format the *task preparation* carrier for PCC (agent + step +
   * active failsafe identity only). Excludes all generation:* parts so
   * `preparation` describes the task, not Reason/Judge/SO mechanics.
   */
  forPreparation: boolean;
};

function detectHierarchicalPromptRole(execution: Execution): HierarchicalPromptRole {
  const segments: string[] = [];
  try {
    const path = typeof (execution as any).getPath === 'function'
      ? (execution as any).getPath()
      : [];
    if (Array.isArray(path)) segments.push(...path.map((s: any) => String(s)));
  } catch { /* ignore */ }
  try {
    segments.push(String((execution as any).id || ''));
  } catch { /* ignore */ }
  const joined = segments.join('/').toLowerCase();

  let thinking: HierarchicalPromptRole['thinking'] = null;
  if (joined.includes('thinkings:reason') || /(?:^|\/|:)reason(?:$|\/|:)/.test(joined)) {
    thinking = 'reason';
  } else if (joined.includes('thinkings:judge') || /(?:^|\/|:)judge(?:$|\/|:)/.test(joined)) {
    thinking = 'judge';
  } else if (
    joined.includes('structured_output') ||
    joined.includes('thinkings:structured')
  ) {
    thinking = 'structured_output';
  }

  let failsafe: string | null = null;
  if (joined.includes('prepare_concise_context') || joined.includes('prepare-context')) {
    failsafe = 'prepare_concise_context';
  } else if (joined.includes('chunk_then_sum') || joined.includes('chunk-then-sum')) {
    failsafe = 'chunk_then_sum';
  } else if (joined.includes('stitch_until_complete') || joined.includes('stitch')) {
    failsafe = 'stitch_until_complete';
  }

  // PCC selection input builds preparation from the failsafe parent (no thinkings leaf).
  const forPreparation = Boolean(failsafe) && thinking === null;

  return { thinking, failsafe, forPreparation };
}

/**
 * Which registry paths belong in the wire prompt for this role.
 * Agent/step identity always included; generation/failsafe siblings filtered out.
 *
 * Leaf injections use paths containing `thinkings:` / `failsafe:prepare_concise_context`
 * (etc.). Agent/step carriers that embedded generation:* / failsafe:*
 * copies are dropped so Reason does not also receive Judge/SO text.
 */
function shouldIncludePromptPath(path: string, role: HierarchicalPromptRole): boolean {
  const p = String(path || '').toLowerCase();
  if (!p || p === 'generic_system' || p === 'specific_execution') {
    return false;
  }

  const isLeafThinkingInjection =
    p.includes('thinkings:') ||
    p.includes(':generation:') ||
    p.includes('/generation/');
  const isLeafFailsafeInjection =
    p.includes('failsafe:prepare_concise_context') ||
    p.includes('failsafe:chunk_then_sum') ||
    p.includes('failsafe:stitch_until_complete') ||
    (p.includes('failsafe:') && isLeafThinkingInjection);

  // JSON/schema mechanics: user-prompt prefixes for the active generation only.
  if (
    p.includes('json_only') ||
    p.includes('use_this_structure') ||
    p.includes('if_unknown_empty') ||
    p.includes('top_level_keys')
  ) {
    return false;
  }

  // Embedded generation:* on agent/step — never for preparation; only leaf thinkings.
  if (
    p.includes('generation:') ||
    p.includes('generation_reason') ||
    p.includes('generation_judge') ||
    p.includes('generation_structured')
  ) {
    if (role.forPreparation) return false;
    if (!isLeafThinkingInjection) return false;
    if (role.thinking === 'reason') return p.includes('reason');
    if (role.thinking === 'judge') return p.includes('judge');
    if (role.thinking === 'structured_output') {
      return p.includes('structured') || p.includes('output');
    }
    return false;
  }

  // Thinkings leaf path ending in the sequence name (setSpecificExecution).
  if (isLeafThinkingInjection) {
    if (role.forPreparation) return false;
    if (role.thinking === 'reason') return p.includes('reason');
    if (role.thinking === 'judge') return p.includes('judge');
    if (role.thinking === 'structured_output') {
      return p.includes('structured') || p.includes('output');
    }
    return false;
  }

  // Failsafe registry parts: only active failsafe leaf (or prepare for PCC prep).
  if (
    p.includes('failsafe:') ||
    p.includes('prepare_context') ||
    p.includes('prepare_concise') ||
    p.includes('chunk_then') ||
    p.includes('stitch_until')
  ) {
    if (p.includes('prepare')) {
      if (!(role.failsafe == null || role.failsafe.includes('prepare'))) return false;
      // Prefer leaf failsafe injection; allow bare prepare_context only when
      // building preparation and no leaf path is present on this registry entry.
      return isLeafFailsafeInjection || (role.forPreparation && p.includes('prepare_context'));
    }
    if (p.includes('chunk')) return role.failsafe === 'chunk_then_sum' && isLeafFailsafeInjection;
    if (p.includes('stitch')) {
      return role.failsafe === 'stitch_until_complete' && isLeafFailsafeInjection;
    }
    return false;
  }

  // Agent / step / phase / pipeline / capabilities / constraints / tool docs — keep.
  return true;
}

/**
 * Lean task carrier for PCC selection user JSON (and preparation field).
 * Identity only — not full hierarchy, not VCS capability walls.
 */
function buildPccLeanTaskPreparation(execution: Execution): string {
  let phase = '';
  let agent = '';
  let step = '';
  let product = '';
  try {
    phase = String((execution as any).findUp?.('phase', 'current') ?? '') || '';
  } catch { /* ignore */ }
  try {
    agent = String((execution as any).findUp?.('agent', 'name') ?? '') || '';
  } catch { /* ignore */ }
  try {
    step = String((execution as any).findUp?.('step', 'name') ?? '') || '';
  } catch { /* ignore */ }
  try {
    product =
      String((execution as any).findUp?.('pipeline', 'productPipeline') ?? '') ||
      String((execution as any).findUp?.('pipeline', 'name') ?? '') ||
      '';
  } catch { /* ignore */ }

  // Fall back to path segments when stores are sparse.
  try {
    const path: string[] = typeof (execution as any).getPath === 'function'
      ? (execution as any).getPath() || []
      : [];
    for (const seg of path) {
      const s = String(seg);
      if (!phase && s.startsWith('phase:')) phase = s.slice('phase:'.length);
      if (!agent && s.startsWith('agent:')) agent = s.slice('agent:'.length);
      if (!step && ['plan', 'try', 'retry', 'refine'].includes(s.toLowerCase())) {
        step = s.toLowerCase();
      }
      if (!product && s.startsWith('pipeline:')) product = s;
    }
  } catch { /* ignore */ }

  const lines = [
    'Task identity for PrepareConciseContext key selection (not the full agent capability dump).',
    product ? `Product/pipeline: ${product}.` : '',
    phase ? `Phase: ${phase}.` : '',
    agent ? `Agent: ${agent}.` : '',
    step ? `PTRR step: ${step}.` : '',
    step === 'plan' || !step
      ? 'Plan step: decide strategy only — do not execute tools during this failsafe.'
      : `Active step: ${step}.`,
    'Select minimal execution-state keys so this step can run after context read-in. Never attempt the agent task here.',
  ].filter(Boolean);
  return lines.join(' ');
}

/**
 * Lean system prompt for PCC selection Thinkings (reason | judge | structured_output).
 * Keeps Execution+pipeline identity (short), phase, lean task, full PCC law, active thinking.
 * Drops fat agent/step capability call_site blocks.
 */
function buildPccSelectionSystemPrompt(
  execution: Execution,
  role: HierarchicalPromptRole,
): string {
  const blocks: string[] = [];

  // Pipeline + phase only (Execution-once on pipeline call_site). Skip agent/step
  // (fat), failsafe/thinkings (we inject PCC + active thinking once below).
  const hierarchy = buildExecutionHierarchySystemPrompt(execution, {
    pathFilter: (path) => shouldIncludePromptPath(path, role),
    nodeFilter: (exec) => {
      const id = String((exec as any).id || '').toLowerCase();
      if (id.includes('agent:')) return false;
      if (['plan', 'try', 'retry', 'refine'].includes(id)) return false;
      if (id.includes('failsafe:')) return false;
      if (id.includes('thinkings:') || id.includes('selection') || id.startsWith('seq-')) {
        // keep nothing under selection/seq shells
        if (id.includes('selection') || id.includes('thinkings:')) return false;
        if (/^seq-\d+$/.test(id)) return false;
      }
      return true;
    },
  });

  if (hierarchy) {
    blocks.push(trimHeavySystemProse(hierarchy));
  }

  blocks.push(buildPccLeanTaskPreparation(execution));
  // PCC law once (not also via failsafe node walk).
  blocks.push(String(PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT));

  if (role.thinking === 'reason') {
    blocks.push(String(PROMPTPART_GENERIC_AGENT_GENERATION_REASON));
  } else if (role.thinking === 'judge') {
    blocks.push(String(PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE));
  } else if (role.thinking === 'structured_output') {
    blocks.push(String(PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT));
    blocks.push('PCC selection: emit only { "selectedKeys": string[] }. Never include useTools.');
  }

  return blocks.filter((b) => b && b.trim()).join(EXECUTION_HIERARCHY_PROMPT_NODE_SEPARATOR);
}

/** Drop known heavy capability / measurement dumps from composed hierarchy text. */
function trimHeavySystemProse(text: string): string {
  const dropLineIf = [
    /three-way merge/i,
    /ci\/cd pipeline/i,
    /cherry-pick/i,
    /pull request validation/i,
    /branch strategy implementation/i,
    /repository maintenance via provider api/i,
    /workflow automation through provider webhooks/i,
    /measurement law:\s*absolutes/i,
    /models do not invent absolute btd/i,
    /^PLAN:\s*/i,
  ];
  const lines = text.split('\n');
  const kept: string[] = [];
  let prevBlank = false;
  for (const line of lines) {
    if (dropLineIf.some((re) => re.test(line))) continue;
    // Collapse runs of capability bullet walls: drop bullets that look like VCS API catalogs
    if (/^-\s+VCS operations via provider/i.test(line)) continue;
    if (/^-\s+Three-way merge/i.test(line)) continue;
    if (/^-\s+Repository analysis via provider/i.test(line)) continue;
    if (/^-\s+Workflow automation through provider/i.test(line)) continue;
    if (/^-\s+Code review via API/i.test(line)) continue;
    if (/^-\s+Branch strategy implementation/i.test(line)) continue;
    if (/^-\s+Commit message standardization/i.test(line)) continue;
    if (/^-\s+Repository maintenance via provider/i.test(line)) continue;
    const blank = !line.trim();
    if (blank && prevBlank) continue;
    kept.push(line);
    prevBlank = blank;
  }
  // Collapse duplicate "Plan the Try only" lines
  const out: string[] = [];
  const seenPlanTry = new Set<string>();
  for (const line of kept) {
    const t = line.trim();
    if (/Plan the Try only/i.test(t)) {
      if (seenPlanTry.has('plan-try')) continue;
      seenPlanTry.add('plan-try');
    }
    out.push(line);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Agent call-site system prompt: generic EE tree walk
 * (`buildExecutionHierarchySystemPrompt` in execution-generics) +
 * agent-specific failsafe/thinking role path filter.
 *
 * PCC selection Thinkings use a lean system path (no fat agent/Plan dumps).
 */
function buildHierarchicalPrompt(execution: Execution): string {
  const role = detectHierarchicalPromptRole(execution);
  if (role.forPreparation) {
    return buildPccLeanTaskPreparation(execution);
  }
  if (
    role.failsafe === 'prepare_concise_context' &&
    (role.thinking === 'reason' ||
      role.thinking === 'judge' ||
      role.thinking === 'structured_output')
  ) {
    return buildPccSelectionSystemPrompt(execution, role);
  }
  return buildExecutionHierarchySystemPrompt(execution, {
    pathFilter: (path) => shouldIncludePromptPath(path, role),
  });
}

function getSequencePrompt(sequence: FailsafeGeneration | ThinkingsGeneration): PromptPart {
  const prompts: Record<string, PromptPart> = {
    // FailsafeGenerations - handling context/input/output concerns
    [FailsafeGeneration.PREPARE_CONCISE_CONTEXT]: PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT,
    [FailsafeGeneration.CHUNK_THEN_SUM]: PROMPTPART_GENERIC_AGENT_FAILSAFE_CHUNK, // TODO: Create combined prompt
    [FailsafeGeneration.STITCH_UNTIL_COMPLETE]: PROMPTPART_GENERIC_AGENT_FAILSAFE_STITCH,
    // ThinkingsGenerations - the intelligence sequence
    // Order here mirrors execution: REASON → JUDGE → STRUCTURED_OUTPUT
    [ThinkingsGeneration.REASON]: PROMPTPART_GENERIC_AGENT_GENERATION_REASON,
    [ThinkingsGeneration.JUDGE]: PROMPTPART_GENERIC_AGENT_GENERATION_JUDGE,
    [ThinkingsGeneration.STRUCTURED_OUTPUT]: PROMPTPART_GENERIC_AGENT_GENERATION_STRUCTURED_OUTPUT
  };

  return prompts[sequence] || `Execute ${sequence} operation` as PromptPart;
}
