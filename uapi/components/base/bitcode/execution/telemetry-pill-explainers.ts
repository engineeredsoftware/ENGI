/**
 * Rich-tooltip copy for every element of a telemetry log title-line: the
 * corner row icon (LLM call / Tool use) and each pill (phase, agent, step,
 * failsafe, generation, tool).
 *
 * Every explainer has TWO sections:
 *   (a) `generic`  — repeated across all tooltips of that type ("Phases are
 *       the five SDIVF stages…"), and
 *   (b) `specific` — one to two sentences about the concrete value ("The
 *       Depositing Pipeline's Discovery Phase searches the depository…").
 * Unknown values fall back to a graceful generic-specific sentence. All copy
 * is source-safe: it describes the machinery, never the content.
 */

import {
  humanizeAgentName,
  humanizeNounPhrase,
  normalizePhaseName,
  normalizeStepName,
  trimPipelineAgentName,
  type SynthesisPipelineMode,
} from './execution-telemetry-format';

export type TelemetryExplainerKind =
  | 'phase'
  | 'agent'
  | 'step'
  | 'failsafe'
  | 'generation'
  | 'tool'
  | 'row-icon';

export interface TelemetryPillExplainer {
  /** Small uppercase kicker naming the tooltip's type (e.g. 'Phase'). */
  kicker: string;
  /** The concrete value, humanized (e.g. 'Discovery', 'Depository Search Agent'). */
  title: string;
  /** Section (a): the generic what-is-this copy repeated across the type. */
  generic: string;
  /** Section (b): the specific copy for this concrete value. */
  specific: string;
}

// ---------------------------------------------------------------------------
// Section (a): generic copy per type.
// ---------------------------------------------------------------------------

const GENERIC_COPY: Record<TelemetryExplainerKind, string> = {
  phase:
    'Phases are the five SDIVF stages every synthesis runs: Setup, Discovery, Implementation, Validation, Finish.',
  agent: "Agents are the PTRR workers that plan, try, refine, and retry a phase's work.",
  step: 'Steps are the PTRR moves an agent works through in order: Plan, Try, Refine, and Retry.',
  failsafe:
    'Failsafes are the guards wrapped around every LLM call: Prepare Concise Context selects the context; handle large inputs chunks oversized requests; handle large outputs repairs incomplete responses.',
  generation: 'Generations are the Thinkings sequence: Reason, Judge, Structured Output.',
  tool: 'Tools are the concrete abilities an agent invokes during a step; arguments and results stay source-safe.',
  'row-icon': 'This row is one LLM call.',
};

// ---------------------------------------------------------------------------
// Section (b): specific copy per normalized value.
// ---------------------------------------------------------------------------

// Phase specifics are written pipeline-aware: when the mode is known the copy
// opens with "The Depositing Pipeline's …" / "The Reading Pipeline's …".
const PHASE_SPECIFICS: Record<string, string> = {
  setup: 'Setup Phase admits the request, comprehends the inputs, and provisions the workspace before any synthesis work begins.',
  discovery: 'Discovery Phase searches the depository and comprehends the codebase before implementation.',
  implementation: 'Implementation Phase synthesizes the AssetPack itself — a measured, source-safe patch.',
  validation: 'Validation Phase checks the synthesized artifacts and measures the absolutes before finish.',
  finish: 'Finish Phase concludes the run and uploads the synthesized AssetPacks for review.',
};

// Per-agent one-liners, matched by substring against the normalized
// (pipeline-prefix-trimmed, lowercased, alphanumeric-only) agent name so the
// deposit and read variants of a role share copy.
const AGENT_SPECIFICS: Array<[match: string, copy: string]> = [
  ['inputcomprehension', 'Comprehends the deposit request: what to synthesize, what to obfuscate, and which paths stay protected.'],
  ['clonevcsrepository', 'Clones the source repository into an isolated workspace so later phases can read it.'],
  ['codebasecomprehension', 'Builds a source-safe understanding of the codebase — structure, capabilities, and conventions.'],
  ['depositorysearch', 'Searches the depository for existing AssetPacks and demand signals relevant to this source.'],
  ['inherentregurgitation', 'Checks what the base model already knows inherently, so the deposit covers only genuinely novel knowledge.'],
  ['assetpacksynthesis', 'Synthesizes the AssetPack option itself — a measured, source-safe patch candidate.'],
  ['measureabsolutes', 'Measures the absolutes: tool-measured sizes and counts stamped onto each option.'],
  ['validation', 'Validates the synthesized artifacts against the request and the source-safety laws.'],
  ['uploadassetpacksforreview', 'Uploads the synthesized AssetPack options for depositor review.'],
  ['uploadforreview', 'Uploads the synthesized AssetPack options for depositor review.'],
];

const STEP_SPECIFICS: Record<string, string> = {
  plan: "Plan drafts the approach for this agent's work before anything is generated.",
  try: 'Try executes the planned work — the main generation attempt.',
  refine: 'Refine improves the Try output using judgment feedback.',
  retry: 'Retry re-runs the work with intensified guidance after a failed judgment.',
};

const FAILSAFE_SPECIFICS: Record<string, string> = {
  prepare_concise_context:
    'Prepare Concise Context selects only the context this call actually needs, keeping the request focused and source-safe.',
  chunk_then_sum:
    'Handle large inputs splits an oversized request into chunks and sums the partial results into one answer.',
  stitch_until_complete:
    'Handle large outputs detects an incomplete response and stitches continuation calls until the output is whole.',
};

const GENERATION_SPECIFICS: Record<string, string> = {
  reason: 'Reason is the open thinking pass where the model works the problem.',
  judge: 'Judge evaluates the reasoning and decides whether it stands or needs another pass.',
  structured_output: 'Structured Output converts the accepted reasoning into the typed result schema.',
};

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/[\s-]+/g, '_');
}

function normalizeAgentKey(value: string): string {
  return trimPipelineAgentName(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function pipelinePossessive(mode?: SynthesisPipelineMode | string | null): string {
  const normalized = String(mode || '').trim().toLowerCase();
  if (normalized === 'deposit') return "The Depositing Pipeline's ";
  if (normalized === 'read') return "The Reading Pipeline's ";
  return 'The ';
}

/**
 * Look up the two-section tooltip copy for a pill. `rawValue` is the raw
 * streamed value (untrimmed agent names, snake/kebab failsafe ids, …); the
 * lookup normalizes internally and falls back gracefully for unknown values.
 */
export function getTelemetryPillExplainer(
  type: Exclude<TelemetryExplainerKind, 'row-icon'>,
  rawValue: string,
  mode?: SynthesisPipelineMode | string | null,
): TelemetryPillExplainer {
  const value = String(rawValue || '');

  switch (type) {
    case 'phase': {
      const normalized = normalizePhaseName(value) || humanizeNounPhrase(value);
      const specific = PHASE_SPECIFICS[normalized.toLowerCase()];
      return {
        kicker: 'Phase',
        title: normalized,
        generic: GENERIC_COPY.phase,
        specific: specific
          ? `${pipelinePossessive(mode)}${specific}`
          : `${normalized} is the stage of the pipeline this row ran under.`,
      };
    }
    case 'agent': {
      const title = `${humanizeAgentName(value)} Agent`;
      const key = normalizeAgentKey(value);
      const matched = AGENT_SPECIFICS.find(([match]) => key.includes(match));
      return {
        kicker: 'Agent',
        title,
        generic: GENERIC_COPY.agent,
        specific: matched ? matched[1] : `${title} is the worker that produced this row's work inside its phase.`,
      };
    }
    case 'step': {
      const normalized = normalizeStepName(value) || humanizeNounPhrase(value);
      const specific = STEP_SPECIFICS[normalized.toLowerCase()];
      return {
        kicker: 'Step',
        title: normalized,
        generic: GENERIC_COPY.step,
        specific: specific || `${normalized} is the agent move this row ran under.`,
      };
    }
    case 'failsafe': {
      const key = normalizeKey(value);
      const specific = FAILSAFE_SPECIFICS[key];
      return {
        kicker: 'Failsafe',
        title: humanizeNounPhrase(value),
        generic: GENERIC_COPY.failsafe,
        specific: specific || `${humanizeNounPhrase(value)} is the guard this LLM call ran under.`,
      };
    }
    case 'generation': {
      const key = normalizeKey(value);
      const specific = GENERATION_SPECIFICS[key];
      return {
        kicker: 'Generation',
        title: humanizeNounPhrase(value),
        generic: GENERIC_COPY.generation,
        specific: specific || `${humanizeNounPhrase(value)} is the Thinkings pass this LLM call performed.`,
      };
    }
    case 'tool':
      return {
        kicker: 'Tool',
        title: value || 'Tool',
        generic: GENERIC_COPY.tool,
        specific: `${value || 'This tool'} is the tool this row invoked; expand the row for its source-safe metadata.`,
      };
  }
}

/** Tooltip copy for the row's corner icon: one LLM call or one Tool use. */
export function getTelemetryRowIconExplainer(rowKind: 'llm' | 'tool'): TelemetryPillExplainer {
  if (rowKind === 'tool') {
    return {
      kicker: 'Log line',
      title: 'One Tool use',
      generic: 'This row is one Tool use — a single tool invocation inside a step, with its Phase → Agent → Step context.',
      specific: 'Expand the row to inspect the tool name, arguments shape, and result metadata — content stays source-safe.',
    };
  }
  return {
    kicker: 'Log line',
    title: 'One LLM call',
    generic:
      'This row is one LLM call — a single model inference carrying its full Phase → Agent → Step → Failsafe → Generation chain.',
    specific: 'Expand the row to inspect the execution state and provider metadata; prompt and response content stays withheld by law.',
  };
}
