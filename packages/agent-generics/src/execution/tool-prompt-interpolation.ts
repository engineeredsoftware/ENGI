/**
 * Tool prompt interpolation for Agent + PTRR generations.
 *
 * Wires two interpolations into ExecutionPrompt before hierarchical format:
 * 1. **Doc interpolation** — usable tools' DocCodeToolPrompt docs
 *    (`auto:tools_doc_code_tools`) so Reason/StructuredOutput can name tools
 *    and fill `useTools[].input` correctly.
 * 2. **Results interpolation** — prior `usedTools` payloads
 *    (`auto:tools_results`) so Refine/Retry (and stitch context) can consume
 *    tool outputs without re-invoking tools blindly.
 *
 * Called from factoryLLMSubStep for ThinkingsGeneration sequences.
 */

import type { Execution } from '@bitcode/execution-generics/Execution';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import {
  formatUsableTools,
  type Tool,
} from '@bitcode/tools-generics';

const TOOL_DOCS_PATH = 'auto:tools_doc_code_tools';
const TOOL_RESULTS_PATH = 'auto:tools_results';

function setPromptPart(execution: Execution, path: string, part: PromptPart): void {
  const prompt = (execution as any).prompt;
  if (!prompt) return;
  if (typeof prompt.setSpecificExecution === 'function') {
    prompt.setSpecificExecution(path, part);
    return;
  }
  if (typeof prompt.set === 'function') {
    prompt.set(path, part);
  }
}

/**
 * Collect ExecutionTool instances visible on this execution hierarchy.
 */
export function collectUsableTools(execution: Execution): Tool[] {
  try {
    const reg = (execution as any).tools;
    if (!reg) return [];
    if (typeof reg.getUsableTools === 'function') {
      return Object.values(reg.getUsableTools() || {}) as Tool[];
    }
    if (typeof reg.getPaths === 'function' && typeof reg.get === 'function') {
      return reg.getPaths().map((p: string) => reg.get(p)).filter(Boolean) as Tool[];
    }
  } catch {
    // registries optional on non-agent executions
  }
  return [];
}

/**
 * Doc interpolation: format DocCodeToolPrompt docs for every usable tool
 * into `auto:tools_doc_code_tools` on the generation ExecutionPrompt.
 */
export function injectUsableToolDocsIntoPrompt(execution: Execution): void {
  const tools = collectUsableTools(execution);
  if (!tools.length) return;

  const formatted = formatUsableTools(tools);
  if (!formatted || formatted === 'No tools available.') return;

  setPromptPart(execution, TOOL_DOCS_PATH, formatted as PromptPart);
}

/**
 * Results interpolation: format prior usedTools into `auto:tools_results`.
 * Accepts both agent UsedTool shape `{ tool, input?, output?, error? }`
 * and plan shapes `{ name, input, reason }` that already ran elsewhere.
 */
export function injectUsedToolResultsIntoPrompt(execution: Execution, input: unknown): void {
  const bag = input && typeof input === 'object' ? (input as Record<string, any>) : {};
  const used: any[] =
    (Array.isArray(bag.usedTools) && bag.usedTools) ||
    (Array.isArray(bag.output?.usedTools) && bag.output.usedTools) ||
    [];

  if (!used.length) return;

  const blocks: string[] = [
    'Previously executed tools (results for this step chain):',
  ];

  for (const entry of used) {
    const name = String(entry?.tool ?? entry?.name ?? 'unknown');
    if (entry?.error) {
      blocks.push(`### ${name}\nStatus: failed\nError: ${String(entry.error)}`);
      continue;
    }
    let body: string;
    try {
      body = JSON.stringify(entry?.output ?? null, null, 2);
    } catch {
      body = String(entry?.output ?? '');
    }
    // Bound size so tool blobs cannot blow the prompt
    if (body.length > 12_000) {
      body = body.slice(0, 12_000) + '\n…[truncated]';
    }
    let inputSummary = '';
    try {
      if (entry?.input != null) {
        inputSummary = `\nInput: ${JSON.stringify(entry.input)}`;
      }
    } catch {
      // ignore
    }
    blocks.push(`### ${name}\nStatus: ok${inputSummary}\nOutput:\n${body}`);
  }

  setPromptPart(execution, TOOL_RESULTS_PATH, blocks.join('\n\n') as PromptPart);
}

/**
 * Apply both interpolations for a Thinkings generation substep.
 * Safe no-ops when registries or prior tools are absent.
 */
export function injectToolInterpolationsForGeneration(
  execution: Execution,
  input: unknown,
): void {
  injectUsableToolDocsIntoPrompt(execution);
  injectUsedToolResultsIntoPrompt(execution, input);
}
