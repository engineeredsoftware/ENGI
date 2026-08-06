/**
 * Rich-tooltip copy for every element of a telemetry log title-line: the
 * corner row icon (LLM call / Tool use) and each pill (phase, agent, step,
 * failsafe, generation, tool).
 *
 * Gold standard (Setup phase, approved product UX):
 *   (a) `specific` — TOP (white): product implementation on THIS pipeline
 *       (Depositing vs Reading) and stack role when context is known.
 *   (b) `generic` — GREY: enum kind + this value as a concept only — never
 *       product-only deposit/read jobs, never sibling laundry lists as the
 *       only grey body for a named chip.
 *
 * All copy is SOURCE-SAFE: product purpose and shapes — never depositor
 * content, raw source, or prompt text.
 */

import {
  humanizeAgentName,
  humanizeNounPhrase,
  normalizePhaseName,
  normalizeStepName,
  trimPipelineAgentName,
  type SynthesisPipelineMode,
} from '@/components/bitcode/pipeline/ExecutionTelemetryFormat/execution-telemetry-format';

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
  /** Section (a), TOP: product job of this chip on this pipeline (+ stack). */
  specific: string;
  /** Section (b), GREY: kind + this value as a concept. */
  generic: string;
  /** Section (c): 'Use this to' bullets. */
  points: string[];
  /** Section (d): current source files + current canon references. */
  references: { source: string[]; canon: string[] };
}

/** Sections (c)+(d) per pill kind — attached to every pill tooltip. */
const PILL_SOURCE_REFS = [
  'apps/uapi/components/bitcode/pipeline/models/pipeline-run-activity.ts',
  'apps/uapi/components/bitcode/pipeline/ExecutionTelemetryFormat/execution-telemetry-format.ts',
  'packages/execution-generics/src/storage/ExecutionStreamAdapter.ts',
];
const PILL_SECTIONS: Record<
  TelemetryExplainerKind,
  { points: string[]; references: { source: string[]; canon: string[] } }
> = {
  phase: {
    points: [
      'Track which synthesis stage the run is working through',
      'Spot a stage that is looping or stalled before the clock does',
    ],
    references: {
      source: PILL_SOURCE_REFS,
      canon: [
        'BITCODE_SPEC_V48_NOTES.md § Gate 3 in progress: synthesis pipeline algorithmic + telemetric correctness',
      ],
    },
  },
  agent: {
    points: [
      'See which worker produced this row',
      'Follow one agent across its Plan → Try → Refine → Retry moves',
    ],
    references: {
      source: PILL_SOURCE_REFS,
      canon: [
        'BITCODE_SPEC_V48_NOTES.md § Gate 3 in progress: synthesis pipeline algorithmic + telemetric correctness',
      ],
    },
  },
  step: {
    points: [
      'Verify step ordering — Try must never follow Refine',
      'See which step schema this output validated against',
    ],
    references: {
      source: [...PILL_SOURCE_REFS, 'packages/agent-generics/src/steps/step-schemas.ts'],
      canon: [
        'BITCODE_SPEC_V48_NOTES.md § PTRR step output schemas — steps validate against STEP schemas',
      ],
    },
  },
  failsafe: {
    points: [
      'See which guard wrapped this LLM call',
      'Read chunk ×N / stitch ×N badges as repair progress, not failures',
    ],
    references: {
      source: PILL_SOURCE_REFS,
      canon: [
        'BITCODE_SPEC_V48_NOTES.md § The Failsafes sequence — formal clarification + the PrepareConciseContext contract',
      ],
    },
  },
  generation: {
    points: [
      'Track the Thinkings move (Reason → Judge → Structure) inside a step',
      'Spot which generation a repair loop is stuck on',
    ],
    references: {
      source: PILL_SOURCE_REFS,
      canon: [
        'BITCODE_SPEC_V48_NOTES.md § Gate 3 in progress: synthesis pipeline algorithmic + telemetric correctness',
      ],
    },
  },
  tool: {
    points: [
      'See which concrete ability the agent invoked',
      'Expand the row for source-safe argument and result shapes',
    ],
    references: {
      source: PILL_SOURCE_REFS,
      canon: [
        'BITCODE_SPEC_V48_NOTES.md § Gate 3 in progress: synthesis pipeline algorithmic + telemetric correctness',
      ],
    },
  },
  'row-icon': {
    points: [
      'Tell one LLM call from one Tool use at a glance',
      'Expand the row for execution state and provider metadata',
    ],
    references: {
      source: PILL_SOURCE_REFS,
      canon: [
        'BITCODE_SPEC_V48_NOTES.md § Gate 3 in progress: synthesis pipeline algorithmic + telemetric correctness',
      ],
    },
  },
};

/**
 * Surrounding row context so specific copy can name product stack role
 * (agent/step) without dumping algorithms.
 */
export interface TelemetryExplainerContext {
  agent?: string | null;
  step?: string | null;
  phase?: string | null;
}

type ModeVariants = { deposit?: string; read?: string; any: string };

// ---------------------------------------------------------------------------
// GREY — concept (kind + this value). Pipeline-agnostic.
// ---------------------------------------------------------------------------

const GENERIC_PHASE: Record<string, string> = {
  setup:
    'A phase is one stage of a synthesis run. Setup is the opening stage: admit the request, comprehend inputs, and provision work before discovery or implementation.',
  discovery:
    'A phase is one stage of a synthesis run. Discovery is the search and comprehension stage that builds source-safe understanding before implementation.',
  implementation:
    'A phase is one stage of a synthesis run. Implementation is where measured, source-safe pack artifacts are produced — never raw source.',
  validation:
    'A phase is one stage of a synthesis run. Validation is the fail-closed quality gate before finish and upload.',
  finish:
    'A phase is one stage of a synthesis run. Finish is the finalization stage that uploads reviewable pack options to Bitcode.',
};

const GENERIC_STEP: Record<string, string> = {
  plan: 'A step is one ordered PTRR move inside an agent. Plan drafts the approach before the main attempt and returns a plan shape, not the agent’s full result schema.',
  try: 'A step is one ordered PTRR move inside an agent. Try is the main generation attempt against the agent’s output schema.',
  refine:
    'A step is one ordered PTRR move inside an agent. Refine improves Try using Judge feedback against the same output schema.',
  retry:
    'A step is one ordered PTRR move inside an agent. Retry is the last bounded re-run with intensified instructions after failed judgment.',
};

const GENERIC_FAILSAFE: Record<string, string> = {
  prepare_concise_context:
    'A failsafe guards an LLM call. Prepare Context is the choice that selects which execution-state keys the call may read so the request stays focused and source-safe.',
  chunk_then_sum:
    'A failsafe guards an LLM call. Handle Prompts / Chunk Then Sum is the size/budget choice: fit → one pass; oversized → chunked task generations plus a sum into one typed answer.',
  stitch_until_complete:
    'A failsafe guards an LLM call. Handle Completions / Stitch Until Complete is the completion/schema-repair choice: validate structured output and bound repair generations until the step schema parses whole.',
};

const GENERIC_GENERATION: Record<string, string> = {
  reason:
    'A generation is one Thinkings pass inside a step. Reason is free-form analysis only — no final typed product yet.',
  judge:
    'A generation is one Thinkings pass inside a step. Judge is advisory quality over Reason; it steers Refine and Retry and does not halt the run.',
  structured_output:
    'A generation is one Thinkings pass inside a step. Structured Output turns accepted reasoning into the typed step result consumers read.',
};

const GENERIC_AGENT =
  'An agent is a worker that runs Plan → Try → Refine → Retry inside a phase of a synthesis pipeline.';

const GENERIC_TOOL =
  'A tool is a concrete ability an agent invokes during a step; arguments and results stay source-safe.';

const GENERIC_ROW_ICON =
  "The log is exactly the run's LLM calls and Tool uses — every model inference and every tool invocation renders as one row.";

// ---------------------------------------------------------------------------
// WHITE — product job on THIS pipeline (+ stack role when context known).
// ---------------------------------------------------------------------------

/** Setup gold standard + siblings for all five phases. */
const PHASE_SPECIFICS: Record<string, ModeVariants> = {
  setup: {
    deposit:
      'Setup clones the selected repository into an isolated workspace and turns the depositor’s Obfuscations into structured withhold guidance that later packing must honor.',
    read: 'Setup admits the reader’s Need and prepares the run so later stages can search and synthesize Need-fitting packs — not depositor obfuscation packing.',
    any: 'Setup admits the request, comprehends inputs, and provisions the workspace before discovery or implementation.',
  },
  discovery: {
    deposit:
      'Discovery runs three deposit lenses — codebase comprehension, depository demand guidance, and inherent regurgitation — so Implementation packs only novel, source-safe knowledge.',
    read: 'Discovery searches the depository and comprehends candidate sources that could fit the reader’s Need before synthesis.',
    any: 'Discovery builds source-safe understanding of the workspace and depository before implementation.',
  },
  implementation: {
    deposit:
      'Implementation synthesizes 2–4 distinct, measured DataPack options with source-safe patch descriptors — never raw source — for depositor selection.',
    read: 'Implementation synthesizes the Need-fitting AssetPack as a measured, source-safe patch for the reader to review and settle.',
    any: 'Implementation produces measured, source-safe pack artifacts for review.',
  },
  validation: {
    deposit:
      'Validation fail-closes on quality, distinctness, source-safety, and obfuscation compliance before any Finish upload of deposit options.',
    read: 'Validation fail-closes on Need-fit quality and source-safety before Finish upload of reading packs (absolutes were measured in Implementation).',
    any: 'Validation fail-closes quality and source-safety before finish and upload.',
  },
  finish: {
    deposit:
      'Finish uploads the synthesized DataPack options to Bitcode for depositor review before any Depository admission.',
    read: 'Finish uploads the synthesized AssetPacks to Bitcode for reader review before purchase.',
    any: 'Finish uploads reviewable pack options to Bitcode.',
  },
};

const AGENT_SPECIFICS: Array<[match: string, copy: ModeVariants]> = [
  [
    'inputcomprehension',
    {
      deposit:
        'Input Comprehension turns the depositor’s free-text Obfuscations into structured withhold guidance (paths, concepts, honor notes) that later packing must honor.',
      read: 'Input Comprehension turns the reader’s Need into structured guidance that discovery and synthesis use to find and pack Need-fitting knowledge.',
      any: 'Input Comprehension turns free-text request inputs into structured guidance for the rest of the run.',
    },
  ],
  [
    'clonevcsrepository',
    {
      deposit:
        'Clone VCS Repository checks out the depositor’s selected repository and ref into an isolated workspace so later deposit stages can measure and pack against that tree.',
      read: 'Clone VCS Repository checks out the selected repository and ref into an isolated workspace so reading stages can search and synthesize against that tree.',
      any: 'Clone VCS Repository checks out the named repository into an isolated workspace for later stages.',
    },
  ],
  [
    'codebasecomprehension',
    {
      deposit:
        'Codebase Comprehension builds a source-safe knowledge map of the cloned tree so deposit packing describes capability without quoting protected source.',
      read: 'Codebase Comprehension builds a source-safe knowledge map of candidate material so Need-fit synthesis stays descriptive, not source-leaking.',
      any: 'Codebase Comprehension builds a source-safe knowledge map of the workspace without quoting source.',
    },
  ],
  [
    'depositorysearch',
    {
      deposit:
        'Depository Search frames what reading demand this repository’s knowledge would satisfy so deposit packs are aimed at real reader needs.',
      read: 'Depository Search finds and ranks depository candidates that could fit the reader’s Need before synthesis.',
      any: 'Depository Search reasons about depository demand and candidate alignment in a source-safe way.',
    },
  ],
  [
    'inherentregurgitation',
    {
      deposit:
        'Inherent Regurgitation surfaces generally-known patterns so deposit packing focuses on genuinely novel knowledge rather than restating the model’s prior.',
      read: 'Inherent Regurgitation surfaces generally-known patterns so reading synthesis can separate novel fit from prior model knowledge.',
      any: 'Inherent Regurgitation surfaces generally-known patterns relevant to the repository so later work stays novel.',
    },
  ],
  [
    'assetpacksynthesis',
    {
      deposit:
        'Asset Pack Synthesis authors 2–4 distinct, measured DataPack options with source-safe patch descriptors for the depositor to choose among.',
      read: 'Asset Pack Synthesis authors the Need-fitting AssetPack as a measured, source-safe patch for the reader to review and settle.',
      any: 'Asset Pack Synthesis authors measured, source-safe pack options for review.',
    },
  ],
  [
    'measureabsolutes',
    {
      deposit:
        'Measure Absolutes scores already-synthesized deposit options with honest volume measurements so selection and pricing rest on measured, source-safe absolutes.',
      read: 'Measure Absolutes scores the synthesized reading pack with honest volume measurements so Need-fit review rests on measured, source-safe absolutes.',
      any: 'Measure Absolutes scores already-synthesized packs with honest volume measurements without altering the patch.',
    },
  ],
  [
    'validation',
    {
      deposit:
        'Validation judges deposit options fail-closed on honesty, distinctness, source-safety, and obfuscation compliance before Finish upload.',
      read: 'Validation judges the Need-fitting pack fail-closed on quality and source-safety before Finish upload.',
      any: 'Validation judges synthesized artifacts fail-closed on quality and source-safety before finish.',
    },
  ],
  [
    'uploadassetpacksforreview',
    {
      deposit:
        'Upload for Review records the deposit options as a reviewable Bitcode upload so the depositor can inspect them before Depository admission.',
      read: 'Upload for Review records the reading pack as a reviewable Bitcode upload so the reader can inspect before purchase.',
      any: 'Upload for Review records synthesized options as a reviewable Bitcode upload.',
    },
  ],
  [
    'uploadforreview',
    {
      deposit:
        'Upload for Review records the deposit options as a reviewable Bitcode upload so the depositor can inspect them before Depository admission.',
      read: 'Upload for Review records the reading pack as a reviewable Bitcode upload so the reader can inspect before purchase.',
      any: 'Upload for Review records synthesized options as a reviewable Bitcode upload.',
    },
  ],
];

/** Product-role step copy: what this PTRR move is for on this stack (not schemas). */
const STEP_SPECIFICS: Record<string, (stack: string) => string> = {
  plan: (stack) =>
    `${stack} is Planning: drafting how this agent will approach its product job before the main attempt.`,
  try: (stack) =>
    `${stack} is Trying: running the main attempt to produce this agent’s product result for the pipeline.`,
  refine: (stack) =>
    `${stack} is Refining: improving the Try result using Judge feedback so this agent’s product output is stronger.`,
  retry: (stack) =>
    `${stack} is Retrying: last bounded re-run after a failed judgment so this agent can still finish its product job.`,
};

const FAILSAFE_TITLES: Record<string, string> = {
  prepare_concise_context: 'Prepare Context',
};

/**
 * Product-role failsafe copy. Mechanism stays in GENERIC_FAILSAFE (grey).
 * White names pipeline + stack product purpose.
 */
const FAILSAFE_SPECIFICS: Record<string, (stack: string) => string> = {
  prepare_concise_context: (stack) =>
    `${stack}, Prepare Context keeps this LLM call focused on the execution keys this product step actually needs so the request stays source-safe and on-task.`,
  chunk_then_sum: (stack) =>
    `${stack}, Chunk Then Sum (Handle Prompts) keeps oversized product payloads — such as large synthesized pack content — within this call’s budget so the step can still return one typed product answer.`,
  stitch_until_complete: (stack) =>
    `${stack}, Stitch Until Complete (Handle Completions) finishes incomplete structured product output for this step so the typed result this pipeline needs can still parse whole.`,
};

const GENERATION_SPECIFICS: Record<string, (stack: string) => string> = {
  reason: (stack) =>
    `${stack}, Reason is the open Thinkings pass that works the product problem before any typed pack or plan result is emitted.`,
  judge: (stack) =>
    `${stack}, Judge advises whether the Reason pass is good enough for this product step and steers Refine or Retry without stopping the run.`,
  structured_output: (stack) =>
    `${stack}, Structured Output turns accepted Thinkings into the typed product result this step must return for the pipeline.`,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/[\s-]+/g, '_');
}

function normalizeAgentKey(value: string): string {
  return trimPipelineAgentName(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function resolveMode(mode?: SynthesisPipelineMode | string | null): 'deposit' | 'read' | null {
  const normalized = String(mode || '').trim().toLowerCase();
  if (normalized === 'deposit' || normalized === 'read') return normalized;
  return null;
}

function pickModeVariant(variants: ModeVariants, mode?: SynthesisPipelineMode | string | null): string {
  const resolved = resolveMode(mode);
  return (resolved ? variants[resolved] : undefined) ?? variants.any;
}

function pipelinePossessive(mode?: SynthesisPipelineMode | string | null): string {
  const resolved = resolveMode(mode);
  if (resolved === 'deposit') return "On the Depositing Pipeline, ";
  if (resolved === 'read') return 'On the Reading Pipeline, ';
  return 'On this synthesis pipeline, ';
}

/** "while the Depository Search Agent is Trying" when context is present. */
function stackClause(context?: TelemetryExplainerContext): string {
  const agent = String(context?.agent || '').trim();
  const step = String(context?.step || '').trim();
  if (!agent && !step) return '';
  const agentPart = agent ? `the ${humanizeAgentName(agent)} Agent` : 'this agent';
  if (!step) return ` while ${agentPart} works`;
  const stepNorm = (normalizeStepName(step) || humanizeNounPhrase(step)).toLowerCase();
  const gerund =
    stepNorm === 'plan'
      ? 'Planning'
      : stepNorm === 'try'
        ? 'Trying'
        : stepNorm === 'refine'
          ? 'Refining'
          : stepNorm === 'retry'
            ? 'Retrying'
            : humanizeNounPhrase(step);
  return ` while ${agentPart} is ${gerund}`;
}

/**
 * Lead for failsafes / generations / tools — pipeline + "while Agent is Trying"
 * when row context is known. Does not name the chip value itself.
 */
function stackLead(
  mode?: SynthesisPipelineMode | string | null,
  context?: TelemetryExplainerContext,
): string {
  return `${pipelinePossessive(mode).replace(/,\s*$/, '')}${stackClause(context)}`;
}

/**
 * Lead for PTRR step chips — pipeline + agent only. The step gerund is
 * supplied by STEP_SPECIFICS ("… Agent is Trying: …") so we must not also
 * append "while … is Trying" from stackClause (double gerund).
 */
function agentLead(
  mode?: SynthesisPipelineMode | string | null,
  context?: TelemetryExplainerContext,
): string {
  const agent = String(context?.agent || '').trim();
  const prefix = pipelinePossessive(mode).replace(/,\s*$/, '');
  if (!agent) return `${prefix}, this agent`;
  return `${prefix}, the ${humanizeAgentName(agent)} Agent`;
}

/**
 * Look up the two-section tooltip copy for a pill.
 * `mode` sharpens product-specific copy; `context` names stack role in white.
 */
export function getTelemetryPillExplainer(
  type: Exclude<TelemetryExplainerKind, 'row-icon'>,
  rawValue: string,
  mode?: SynthesisPipelineMode | string | null,
  context?: TelemetryExplainerContext,
): TelemetryPillExplainer {
  return { ...buildTelemetryPillCopy(type, rawValue, mode, context), ...PILL_SECTIONS[type] };
}

function buildTelemetryPillCopy(
  type: Exclude<TelemetryExplainerKind, 'row-icon'>,
  rawValue: string,
  mode?: SynthesisPipelineMode | string | null,
  context?: TelemetryExplainerContext,
): Omit<TelemetryPillExplainer, 'points' | 'references'> {
  const value = String(rawValue || '');
  const lead = stackLead(mode, context);

  switch (type) {
    case 'phase': {
      const normalized = normalizePhaseName(value) || humanizeNounPhrase(value);
      const key = normalized.toLowerCase();
      const variants = PHASE_SPECIFICS[key];
      return {
        kicker: 'Phase',
        title: normalized,
        generic:
          GENERIC_PHASE[key] ||
          'A phase is one stage of a synthesis run. This name is one of those stages.',
        specific: variants
          ? `${pipelinePossessive(mode)}${pickModeVariant(variants, mode)}`
          : `${pipelinePossessive(mode)}${normalized} is the stage this row ran under for this product run.`,
      };
    }
    case 'agent': {
      const title = `${humanizeAgentName(value)} Agent`;
      const key = normalizeAgentKey(value);
      const matched = AGENT_SPECIFICS.find(([match]) => key.includes(match));
      return {
        kicker: 'Agent',
        title,
        generic: GENERIC_AGENT,
        specific: matched
          ? `${pipelinePossessive(mode)}${pickModeVariant(matched[1], mode)}`
          : `${pipelinePossessive(mode)}${title} is the worker producing this phase’s product work on this run.`,
      };
    }
    case 'step': {
      const normalized = normalizeStepName(value) || humanizeNounPhrase(value);
      const key = normalized.toLowerCase();
      const specific = STEP_SPECIFICS[key];
      const stepLead = agentLead(mode, context);
      return {
        kicker: 'Step',
        title: normalized,
        generic:
          GENERIC_STEP[key] ||
          'A step is one ordered PTRR move (Plan, Try, Refine, or Retry) inside an agent.',
        specific: specific
          ? specific(stepLead)
          : `${stepLead} is on ${normalized}: the agent move this row ran under for this product job.`,
      };
    }
    case 'failsafe': {
      const key = normalizeKey(value);
      const specific = FAILSAFE_SPECIFICS[key];
      return {
        kicker: 'Failsafe',
        title: FAILSAFE_TITLES[key] || humanizeNounPhrase(value),
        generic:
          GENERIC_FAILSAFE[key] ||
          'A failsafe guards an LLM call. This name is one guard in that set.',
        specific: specific
          ? specific(lead)
          : `${lead}, ${humanizeNounPhrase(value)} guards this LLM call for the product step in progress.`,
      };
    }
    case 'generation': {
      const key = normalizeKey(value);
      const specific = GENERATION_SPECIFICS[key];
      return {
        kicker: 'Generation',
        title: humanizeNounPhrase(value),
        generic:
          GENERIC_GENERATION[key] ||
          'A generation is one Thinkings pass (Reason, Judge, or Structured Output) inside a step.',
        specific: specific
          ? specific(lead)
          : `${lead}, ${humanizeNounPhrase(value)} is the Thinkings pass this LLM call performed for this product step.`,
      };
    }
    case 'tool':
      return {
        kicker: 'Tool',
        title: value || 'Tool',
        generic: GENERIC_TOOL,
        specific: `${lead}, ${value || 'this tool'} is the ability invoked for this product step; expand the row for source-safe arguments and result metadata.`,
      };
  }
}

/** Tooltip copy for the row's corner icon: one LLM call or one Tool use. */
export function getTelemetryRowIconExplainer(
  rowKind: 'llm' | 'tool',
  mode?: SynthesisPipelineMode | string | null,
): TelemetryPillExplainer {
  const pipeline =
    resolveMode(mode) === 'deposit'
      ? 'Depositing'
      : resolveMode(mode) === 'read'
        ? 'Reading'
        : 'synthesis';
  if (rowKind === 'tool') {
    return {
      ...PILL_SECTIONS['row-icon'],
      kicker: 'Log line',
      title: 'One Tool use',
      specific: `On the ${pipeline} Pipeline, this row is one tool invocation inside a product step — expand for source-safe arguments and result metadata.`,
      generic: GENERIC_ROW_ICON,
    };
  }
  return {
    ...PILL_SECTIONS['row-icon'],
    kicker: 'Log line',
    title: 'One LLM call',
    specific: `On the ${pipeline} Pipeline, this row is one model inference carrying its Phase → Agent → Step → Failsafe → Generation chain for the product job in progress.`,
    generic: GENERIC_ROW_ICON,
  };
}

/** Catalog of legal chip values for completeness tests (deposit + read synthesize). */
export const TELEMETRY_PILL_CATALOG = {
  phases: ['setup', 'discovery', 'implementation', 'validation', 'finish'] as const,
  steps: ['plan', 'try', 'refine', 'retry'] as const,
  failsafes: [
    'prepare_concise_context',
    'chunk_then_sum',
    'stitch_until_complete',
  ] as const,
  generations: ['reason', 'judge', 'structured_output'] as const,
  agentMatchKeys: AGENT_SPECIFICS.map(([m]) => m),
  modes: ['deposit', 'read'] as const,
};
