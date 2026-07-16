/**
 * Rich-tooltip copy for every element of a telemetry log title-line: the
 * corner row icon (LLM call / Tool use) and each pill (phase, agent, step,
 * failsafe, generation, tool).
 *
 * Every explainer has TWO sections, rendered in this order:
 *   (a) `specific` — TOP: the concrete meaning of this exact element — a
 *       human-comprehension summary of what it is PROMPTED to do and what it
 *       RETURNS (its output-schema expectations), written from the real agent
 *       / step / failsafe sources ("Prompted to comprehend the depositor's
 *       Obfuscations…; returns {comprehension} with …"), and
 *   (b) `generic` — BELOW: the type copy repeated across all tooltips of that
 *       kind ("Phases are the five stages every synthesis run works through…").
 * Unknown values fall back to a graceful specific sentence. All copy is
 * SOURCE-SAFE: it describes prompt purposes and output SHAPES — never
 * depositor content, raw source, or prompt text.
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
  /** Section (a), TOP: what this exact element is prompted to do + returns. */
  specific: string;
  /** Section (b): the generic what-is-this copy repeated across the type. */
  generic: string;
  /** Section (c): 'Use this to' bullets. REQUIRED — every rich tooltip carries all sections. */
  points: string[];
  /** Section (d): current source files + current canon references. */
  references: { source: string[]; canon: string[] };
}

/** Sections (c)+(d) per pill kind — attached to every pill tooltip. */
const PILL_SOURCE_REFS = [
  'apps/uapi/components/bitcode/pipeline/models/pipeline-run-activity.ts',
  'apps/uapi/components/bitcode/pipeline/execution-telemetry-format.ts',
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
      canon: ['BITCODE_SPEC_V48_NOTES.md § Gate 3 in progress: synthesis pipeline algorithmic + telemetric correctness'],
    },
  },
  agent: {
    points: [
      'See which worker produced this row',
      'Follow one agent across its Plan → Try → Refine → Retry moves',
    ],
    references: {
      source: PILL_SOURCE_REFS,
      canon: ['BITCODE_SPEC_V48_NOTES.md § Gate 3 in progress: synthesis pipeline algorithmic + telemetric correctness'],
    },
  },
  step: {
    points: [
      'Verify step ordering — Try must never follow Refine',
      'See which step schema this output validated against',
    ],
    references: {
      source: [...PILL_SOURCE_REFS, 'packages/agent-generics/src/steps/step-schemas.ts'],
      canon: ['BITCODE_SPEC_V48_NOTES.md § PTRR step output schemas — steps validate against STEP schemas'],
    },
  },
  failsafe: {
    points: [
      'See which guard wrapped this LLM call',
      'Read chunk ×N / stitch ×N badges as repair progress, not failures',
    ],
    references: {
      source: PILL_SOURCE_REFS,
      canon: ['BITCODE_SPEC_V48_NOTES.md § The Failsafes sequence — formal clarification + the PrepareConciseContext contract'],
    },
  },
  generation: {
    points: [
      'Track the Thinkings move (Reason → Judge → Structure) inside a step',
      'Spot which generation a repair loop is stuck on',
    ],
    references: {
      source: PILL_SOURCE_REFS,
      canon: ['BITCODE_SPEC_V48_NOTES.md § Gate 3 in progress: synthesis pipeline algorithmic + telemetric correctness'],
    },
  },
  tool: {
    points: [
      'See which concrete ability the agent invoked',
      'Expand the row for source-safe argument and result shapes',
    ],
    references: {
      source: PILL_SOURCE_REFS,
      canon: ['BITCODE_SPEC_V48_NOTES.md § Gate 3 in progress: synthesis pipeline algorithmic + telemetric correctness'],
    },
  },
  'row-icon': {
    points: [
      'Tell one LLM call from one Tool use at a glance',
      'Expand the row for execution state and provider metadata',
    ],
    references: {
      source: PILL_SOURCE_REFS,
      canon: ['BITCODE_SPEC_V48_NOTES.md § Gate 3 in progress: synthesis pipeline algorithmic + telemetric correctness'],
    },
  },
};

/**
 * The surrounding row context a trigger may pass so the specific copy can
 * reference the concrete agent/step (e.g. "…against the Depository Search
 * Agent's output schema"). Optional — copy degrades gracefully without it.
 */
export interface TelemetryExplainerContext {
  agent?: string | null;
  step?: string | null;
}

// ---------------------------------------------------------------------------
// Section (b): generic type copy, rendered BELOW the specific section.
// ---------------------------------------------------------------------------

const GENERIC_COPY: Record<TelemetryExplainerKind, string> = {
  phase:
    'Phases are the five stages every synthesis run works through: Setup, Discovery, Implementation, Validation, and Finish.',
  agent:
    "Agents are the workers that plan, try, refine, and retry a phase's work.",
  step: 'Steps are the ordered moves an agent works through: Plan, Try, Refine, and Retry.',
  failsafe:
    'Failsafes are the guards wrapped around every LLM call: Prepare Context selects the context; Handle Prompts chunks oversized requests; Handle Completions repairs incomplete responses.',
  generation: 'Generations are the Thinkings sequence: Reason, Judge, Structured Output.',
  tool: 'Tools are the concrete abilities an agent invokes during a step; arguments and results stay source-safe.',
  'row-icon':
    "The log is exactly the run's LLM calls and Tool uses — every model inference and every tool invocation renders as one row.",
};

// ---------------------------------------------------------------------------
// Section (a): specific copy per normalized value — what the element is
// PROMPTED to do and what it RETURNS, summarized from the real sources.
// ---------------------------------------------------------------------------

type ModeVariants = { deposit?: string; read?: string; any: string };

// Phase specifics are pipeline-aware: when the mode is known the copy opens
// with "The Depositing Pipeline's …" / "The Reading Pipeline's …" and states
// that lens's concrete per-phase jobs.
const PHASE_SPECIFICS: Record<string, ModeVariants> = {
  setup: {
    deposit:
      "Setup Phase clones the repository into an isolated workspace, comprehends the depositor's Obfuscations into structured guidance ({comprehension} with obfuscatedPaths, obfuscatedConcepts, honorNotes), and initializes the run.",
    read: "Setup Phase admits the read request and comprehends the reader's Need before any synthesis work begins.",
    any: 'Setup Phase admits the request, comprehends the inputs, and provisions the workspace before any synthesis work begins.',
  },
  discovery: {
    deposit:
      "Discovery Phase runs three lenses: codebase comprehension (a source-safe knowledge map), depository search (read-demand guidance), and inherent regurgitation (what the model already knows) — the comprehension Implementation synthesizes from.",
    read: 'Discovery Phase searches the depository and comprehends the candidate sources that could fit the Need.',
    any: 'Discovery Phase searches the depository and comprehends the codebase before implementation.',
  },
  implementation: {
    deposit:
      'Implementation Phase synthesizes 2-4 distinct, measured AssetPack patch options — each source-safe metadata plus a patch descriptor of file paths and change ops, never raw source.',
    read: 'Implementation Phase synthesizes the Need-fitting AssetPack — a measured, source-safe patch.',
    any: 'Implementation Phase synthesizes the AssetPack itself — a measured, source-safe patch.',
  },
  validation: {
    deposit:
      "Validation Phase validates the candidates fail-closed (quality, distinctness, source-safety, obfuscation compliance), measures each pack's absolutes, and gates ready-to-finish.",
    read: 'Validation Phase checks the synthesized artifacts and measures the absolutes before finish.',
    any: 'Validation Phase checks the synthesized artifacts and measures the absolutes before finish.',
  },
  finish: {
    deposit:
      'Finish Phase uploads the synthesized AssetPack options to Bitcode for depositor review before any admission into the Depository.',
    read: 'Finish Phase uploads the synthesized AssetPacks for reader review before purchase.',
    any: 'Finish Phase concludes the run and uploads the synthesized AssetPacks for review.',
  },
};

// Per-agent prompt/return summaries, matched by substring against the
// normalized (pipeline-prefix-trimmed, lowercased, alphanumeric-only) agent
// name. Copy is summarized from each agent's real prompt constants + zod
// outputSchema; lens-specific variants apply when the mode is known.
const AGENT_SPECIFICS: Array<[match: string, copy: ModeVariants]> = [
  [
    'inputcomprehension',
    {
      deposit:
        "Prompted to comprehend the depositor's Obfuscations — the free-text declaration of what to withhold — against the cloned repository inventory. Returns {comprehension} with a summary, obfuscatedPaths, obfuscatedConcepts, and honorNotes that downstream synthesis honors absolutely.",
      any: "Prompted to comprehend the request's inputs into structured guidance for the rest of the run; returns {comprehension} with a structured, source-safe summary of what it understood.",
    },
  ],
  [
    'clonevcsrepository',
    {
      any: 'Prompted to clone the named repository (provider, owner, name, ref) into an isolated workspace through the formal clone tool. Returns {success, repository, workspacePath, status, metadata} so later phases can read the checkout.',
    },
  ],
  [
    'codebasecomprehension',
    {
      any: 'Prompted to comprehend the cloned repository inventory into a source-safe codebase knowledge map — describing knowledge and capability, never quoting source. Returns {comprehension} with a summary, capabilities, knowledgeAreas, and notableModules.',
    },
  ],
  [
    'depositorysearch',
    {
      any: "Prompted to reason about what reading demand the repository's knowledge would satisfy in the Depository. Returns {guidance} with a summary, likelyReadTopics, demandAlignment, underservedTopics, and readabilityNotes that frame the packs for future readers.",
    },
  ],
  [
    'inherentregurgitation',
    {
      any: "Prompted to surface, from the model's own training data, the generally-known patterns and knowledge relevant to this repository — so the deposit covers only genuinely novel knowledge. Returns {regurgitation} with a summary, relevantKnowledge, patterns, and references.",
    },
  ],
  [
    'assetpacksynthesis',
    {
      deposit:
        'Prompted to synthesize 2-4 distinct, measured AssetPack patch options from the Discovery comprehension, honoring obfuscations and protected-IP exclusions absolutely. Returns {options} where each option carries kind, title, summary, coveredSourcePaths, honest 0..1 measurements, confidence, a source-safe patch descriptor ({fileChanges: path+op, patchSummary}), and a needinessSignal.',
      read: 'Prompted to synthesize the Need-fitting AssetPack artifacts from the explored sources. Returns the synthesis record ({assetPack, assetPackSynthesisArtifacts}) for validation and upload.',
      any: 'Prompted to synthesize the AssetPack itself — a measured, source-safe patch; returns the synthesized candidate options for review.',
    },
  ],
  [
    'measureabsolutes',
    {
      any: 'Prompted to MEASURE an already-synthesized AssetPack patch, never to alter it: the size absolutes come from the static-analysis tool, and the agent judges correctness-estimate and semantic-volume grounded in those counts. Returns {measurements, summary} — one 0..1 volume (plus a raw magnitude for count units) per absolute, each with a source-safe rationale.',
    },
  ],
  [
    'validation',
    {
      deposit:
        "Prompted to validate the synthesized AssetPacks' quality: measurement honesty, distinctness, source-safety, obfuscation/exclusion compliance, patch coherence, and coverage. Returns {issues, qualityScore, coverageGaps, recommendation} — any concrete issue forces an 'iterate' verdict, the fail-closed gate before Finish.",
      any: 'Prompted to validate the synthesized artifacts against the request and the source-safety laws; returns a source-safe issues list and an iterate-vs-complete recommendation.',
    },
  ],
  [
    'uploadassetpacksforreview',
    {
      any: 'A simple finalization agent (no LLM prompt): it reads the synthesized options and artifacts from the Implementation stores and records them as a reviewable Bitcode upload. Returns the upload record ({review, options, artifacts, summary}) pending review.',
    },
  ],
  [
    'uploadforreview',
    {
      any: 'A simple finalization agent (no LLM prompt): it reads the synthesized options and artifacts from the Implementation stores and records them as a reviewable Bitcode upload. Returns the upload record ({review, options, artifacts, summary}) pending review.',
    },
  ],
];

// PTRR step specifics: what each step is prompted to do, generating against
// the surrounding agent's output schema (the possessive comes from the row
// context when the trigger passes one).
// Step outputs validate against STEP schemas, not the full agent schema:
// Plan returns its own typed plan shape; Try/Refine/Retry return the agent's
// typed output (the agent's result is the last step's output).
const STEP_SPECIFICS: Record<string, (agentPossessive: string) => string> = {
  plan: (a) =>
    `Prompted with ${a} Plan guidance to analyze the request and draft the approach before the main attempt. Generates through the full failsafe sequence and returns the Plan step's own typed plan ({approach, steps, considerations}) — not ${a} full output schema.`,
  try: (a) =>
    `Prompted with ${a} Try guidance to execute the planned work — the main generation attempt. Returns the full typed output against ${a} output schema.`,
  refine: (a) =>
    `Prompted with ${a} Refine guidance plus the Judge's feedback (quality, issues, suggestions) to improve the Try output. Re-generates against the same output schema, bounded to a few attempts.`,
  retry: (a) =>
    `Prompted with ${a} Retry guidance to re-run the work with intensified, conservative instructions after a failed judgment. The last bounded chance to return a valid output against ${a} output schema.`,
};

// Display-title overrides for failsafes whose humanized internal id is not
// the label law: PrepareConciseContext displays as 'Prepare Context' (the
// 'Concise' qualifier stays internal-only).
const FAILSAFE_TITLES: Record<string, string> = {
  prepare_concise_context: 'Prepare Context',
};

const FAILSAFE_SPECIFICS: Record<string, (agentPossessive: string) => string> = {
  prepare_concise_context: () =>
    'Prompted with {preparation, system, pipeline_execution_keys} — a keys-only tree of the execution state — and returns {selectedKeys}: the context keys this call actually needs. The harness then reads in only the selected values, keeping the request focused and source-safe.',
  chunk_then_sum: () =>
    'Measures the composed request against the request budget. When it fits, exactly ONE task generation runs; when it triggers, the selected values are chunked — one task generation per chunk — and a summing pass combines the partial results into one typed answer.',
  stitch_until_complete: (a) =>
    `Validates the response against the running STEP's output schema — ${a} full output schema on Try/Refine/Retry, the plan shape on Plan. An incomplete or truncated output triggers bounded repair generations, each carrying the exact validation error, until the output parses whole.`,
};

const GENERATION_SPECIFICS: Record<string, (agentPossessive: string) => string> = {
  reason: () =>
    'Prompted to work the problem free-form; returns an analysis JSON {analysis, reasoningItems, conclusion, confidence} (optionally naming tools to use). Nothing typed is produced yet — this is the open thinking pass.',
  judge: () =>
    'Prompted with the reasoning and returns an advisory verdict {quality, issues, suggestions, approved} over it. A failed judgment steers Refine and Retry — it does not halt the run.',
  structured_output: (a) =>
    `Prompted to convert the accepted reasoning into the typed result, validated against the running step's zod output schema (${a} full output schema on Try/Refine/Retry; the plan shape on Plan) — the value downstream consumers actually read.`,
};

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
  if (resolved === 'deposit') return "The Depositing Pipeline's ";
  if (resolved === 'read') return "The Reading Pipeline's ";
  return 'The ';
}

/** "the Depository Search Agent's" when the row context names the agent, else "the agent's". */
function agentPossessive(context?: TelemetryExplainerContext): string {
  const agent = String(context?.agent || '').trim();
  return agent ? `the ${humanizeAgentName(agent)} Agent's` : "the agent's";
}

/**
 * Look up the two-section tooltip copy for a pill. `rawValue` is the raw
 * streamed value (untrimmed agent names, snake/kebab failsafe ids, …); the
 * lookup normalizes internally and falls back gracefully for unknown values.
 * `mode` sharpens phase/agent copy to the active pipeline lens; `context`
 * (the surrounding row's agent/step) sharpens step/failsafe/generation copy.
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

  switch (type) {
    case 'phase': {
      const normalized = normalizePhaseName(value) || humanizeNounPhrase(value);
      const variants = PHASE_SPECIFICS[normalized.toLowerCase()];
      return {
        kicker: 'Phase',
        title: normalized,
        generic: GENERIC_COPY.phase,
        specific: variants
          ? `${pipelinePossessive(mode)}${pickModeVariant(variants, mode)}`
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
        specific: matched
          ? pickModeVariant(matched[1], mode)
          : `${title} is the worker that produced this row's work inside its phase.`,
      };
    }
    case 'step': {
      const normalized = normalizeStepName(value) || humanizeNounPhrase(value);
      const specific = STEP_SPECIFICS[normalized.toLowerCase()];
      return {
        kicker: 'Step',
        title: normalized,
        generic: GENERIC_COPY.step,
        specific: specific
          ? specific(agentPossessive(context))
          : `${normalized} is the agent move this row ran under.`,
      };
    }
    case 'failsafe': {
      const key = normalizeKey(value);
      const specific = FAILSAFE_SPECIFICS[key];
      return {
        kicker: 'Failsafe',
        title: FAILSAFE_TITLES[key] || humanizeNounPhrase(value),
        generic: GENERIC_COPY.failsafe,
        specific: specific
          ? specific(agentPossessive(context))
          : `${humanizeNounPhrase(value)} is the guard this LLM call ran under.`,
      };
    }
    case 'generation': {
      const key = normalizeKey(value);
      const specific = GENERATION_SPECIFICS[key];
      return {
        kicker: 'Generation',
        title: humanizeNounPhrase(value),
        generic: GENERIC_COPY.generation,
        specific: specific
          ? specific(agentPossessive(context))
          : `${humanizeNounPhrase(value)} is the Thinkings pass this LLM call performed.`,
      };
    }
    case 'tool':
      return {
        kicker: 'Tool',
        title: value || 'Tool',
        generic: GENERIC_COPY.tool,
        specific: `${value || 'This tool'} is the tool this step invoked after its generations requested it; expand the row for its source-safe arguments shape and result metadata.`,
      };
  }
}

/** Tooltip copy for the row's corner icon: one LLM call or one Tool use. */
export function getTelemetryRowIconExplainer(rowKind: 'llm' | 'tool'): TelemetryPillExplainer {
  if (rowKind === 'tool') {
    return {
      ...PILL_SECTIONS['row-icon'],
      kicker: 'Log line',
      title: 'One Tool use',
      specific:
        'This row is one Tool use — a single tool invocation inside a step, with its Phase → Agent → Step context. Expand it for the tool name, arguments shape, and result metadata — content stays source-safe.',
      generic: GENERIC_COPY['row-icon'],
    };
  }
  return {
    ...PILL_SECTIONS['row-icon'],
    kicker: 'Log line',
    title: 'One LLM call',
    specific:
      'This row is one LLM call — a single model inference carrying its full Phase → Agent → Step → Failsafe → Generation chain. Expand it for the execution state and provider metadata; prompt and response content stays withheld by law.',
    generic: GENERIC_COPY['row-icon'],
  };
}
