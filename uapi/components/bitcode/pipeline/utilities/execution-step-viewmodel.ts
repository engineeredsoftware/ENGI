/**
 * Execution Step ViewModel
 *
 * Builds a modern, UI‑friendly shape for a single agent step using
 * the failsafe→generations structure and a cohesive tool summary.
 *
 * This is a pure read model. It does NOT change underlying stores or types.
 */

export type FailsafeName = 'prepare_concise_context' | 'chunk_then_sum' | 'stitch_until_complete';
export type GenerationName = 'reason' | 'judge' | 'structured_output';

export interface StepKey { phase: string; agent: string; step: 'plan'|'try'|'refine'|'retry'; }

export interface ToolUsePlan { name: string; input?: unknown; reason?: string }
export interface ToolUsed { tool: string; input?: unknown; output?: unknown; error?: string }

export interface GenerationVM { generation: GenerationName; llm?: { output?: unknown } }
export interface FailsafeVM { failsafe: FailsafeName; generations: GenerationVM[] }
export interface ToolEventVM { invocation?: unknown; result?: unknown }

export interface StepViewModel {
  step: { name: StepKey['step'] }
  failsafes: FailsafeVM[]
  tools: {
    usable: string[]
    use: ToolUsePlan[]
    used: ToolUsed[]
    events: ToolEventVM[]
  }
}

/**
 * Build a StepViewModel from raw execution event slices.
 * events: any[] — array of raw event records that include executionState and payloads.
 * stores: object — step‑scoped stores with { tools: { usable|use|used }, llm outputs by generation, tool invocations/results }.
 */
export function buildStepViewModel(
  key: StepKey,
  stores: {
    tools?: { usable?: string[]; use?: ToolUsePlan[]; used?: ToolUsed[] }
    generations?: Record<FailsafeName, Partial<Record<GenerationName, { llm?: { output?: unknown } }>>>
    toolEvents?: { invocation?: unknown[]; result?: unknown[] }
  }
): StepViewModel {
  const orderFailsafes: FailsafeName[] = ['prepare_concise_context','chunk_then_sum','stitch_until_complete'];
  const orderGens: GenerationName[] = ['reason','judge','structured_output'];

  const failsafes: FailsafeVM[] = orderFailsafes.map(fs => ({
    failsafe: fs,
    generations: orderGens.map(g => ({
      generation: g,
      llm: stores.generations?.[fs]?.[g]?.llm
    }))
  }));

  const tools = {
    usable: stores.tools?.usable || [],
    use: stores.tools?.use || [],
    used: stores.tools?.used || [],
    events: [
      ...((stores.toolEvents?.invocation || []).map(inv => ({ invocation: inv }))),
      ...((stores.toolEvents?.result || []).map(res => ({ result: res })))
    ]
  };

  return { step: { name: key.step }, failsafes, tools };
}

