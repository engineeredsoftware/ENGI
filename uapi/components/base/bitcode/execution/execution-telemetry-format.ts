/**
 * Pure client-side formatting helpers for the synthesis telemetry surfaces
 * (PipelineExecutionLog title-lines, the processing-indicator sentence, and
 * the live header tracker). Extracted from pipeline-execution-log.tsx so the
 * page-level surfaces (e.g. /deposit's header tracker) can share the exact
 * same display normalization without importing the heavy log component.
 */

export type SynthesisPipelineMode = 'deposit' | 'read';

/** Pipeline mode -> present-continuous verb for the sentence prefix. */
export const PIPELINE_GERUNDS: Record<SynthesisPipelineMode, string> = {
  deposit: 'Depositing',
  read: 'Reading',
};

// PTRR step -> present-continuous verb ("Plan" -> "Planning").
export const STEP_GERUNDS: Record<string, string> = {
  plan: 'Planning',
  try: 'Trying',
  refine: 'Refining',
  retry: 'Retrying',
};

// Thinkings generation sub-step -> present-continuous verb (GenerationSubMetaSubStep).
// Each Thinkings generation carries its own connective into the failsafe
// noun: 'Reasoning over Large Inputs', 'Judging the Large Outputs',
// 'Structuring the Context'.
export const THINKINGS_GERUNDS: Record<string, string> = {
  reason: 'Reasoning over',
  judge: 'Judging the',
  structured_output: 'Structuring the',
};

export function titleCaseWords(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// "chunk_then_sum" -> "Chunk Then Sum"; "Discovery" -> "Discovery".
export function humanizeNounPhrase(value: string): string {
  return titleCaseWords(value.replace(/[_-]/g, ' '));
}

// Client-side normalized failsafe names: ChunkThenSum handles LARGE INPUTS,
// StitchComplete handles LARGE OUTPUTS; PrepareConciseContext displays as
// 'Prepare Context' (the 'Concise' qualifier is an internal naming detail,
// dropped from the label). The log title-line (pill) reads 'handle large
// inputs'; the processing sentence reads title-cased without 'handle'
// ('Reasoning over Large Inputs'). PrepareConciseContext reads simply
// 'Context' in the sentence ('Reasoning over Context').
export const FAILSAFE_PILL_NAMES: Record<string, string> = {
  prepare_concise_context: 'Prepare Context',
  chunk_then_sum: 'handle large inputs',
  stitch_until_complete: 'handle large outputs',
};

export const FAILSAFE_SENTENCE_NAMES: Record<string, string> = {
  prepare_concise_context: 'Context',
  chunk_then_sum: 'Large Inputs',
  stitch_until_complete: 'Large Outputs',
};

function normalizeFailsafeKey(value: string): string {
  return value.trim().toLowerCase().replace(/-/g, '_');
}

export function formatFailsafeName(value: string): string {
  return FAILSAFE_PILL_NAMES[normalizeFailsafeKey(value)] || humanizeNounPhrase(value);
}

export function formatFailsafeSentenceName(value: string): string {
  return FAILSAFE_SENTENCE_NAMES[normalizeFailsafeKey(value)] || humanizeNounPhrase(value);
}

// "structured_output" -> "Structured Output" for the generation pill.
export function formatGenerationName(value: string): string {
  return humanizeNounPhrase(value);
}

/**
 * Trim the pipeline-name prefix from an AGENT name — display only, the raw
 * name still travels in the details JSON. Handles:
 *   - 'setup:'/'finish:'-style lowercase namespace prefixes ('setup:asset-pack-…')
 *   - the CamelCase pipeline prefix ('DepositDepositorySearchAgent' ->
 *     'DepositorySearchAgent'; 'ReadFitsFindingSynthesisSetupPlanAgent' ->
 *     'FitsFindingSynthesisSetupPlanAgent')
 *   - kebab names ('deposit-depository-search' -> 'depository-search')
 * Suffix-style qualifiers ('AssetPackMeasureAbsolutesAgent:deposit') are left
 * alone — only a leading lowercase word + ':' is a namespace prefix.
 */
export function trimPipelineAgentName(value: string): string {
  let trimmed = String(value || '').trim();
  // Lowercase namespace prefix, e.g. 'setup:asset-pack-initialize-mcps-tools-agent'.
  trimmed = trimmed.replace(/^[a-z][a-z0-9_-]*:/, '');
  // CamelCase pipeline prefix: a leading 'Deposit'/'Read' followed by another capital.
  trimmed = trimmed.replace(/^(Deposit|Read)(?=[A-Z])/, '');
  // Kebab pipeline prefix: 'deposit-depository-search' -> 'depository-search'.
  trimmed = trimmed.replace(/^(deposit|read)-(?=[a-z0-9])/, '');
  return trimmed || String(value || '');
}

// Pill label: pipeline prefix trimmed AND CamelCase split into words, keeping
// the trailing 'Agent' — 'DepositInputComprehensionAgent' -> 'Input
// Comprehension Agent' (the pill's CSS uppercases it to word-spaced caps).
export function formatAgentPillName(value: string): string {
  const trimmed = trimPipelineAgentName(value);
  const spaced = trimmed
    .replace(/[_-]/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return spaced || trimmed;
}

// "DepositInputComprehensionAgent" -> "Input Comprehension" (pipeline prefix
// trimmed, trailing "Agent" stripped — the sentence template appends the
// literal word "Agent").
export function humanizeAgentName(value: string): string {
  const withoutPipeline = trimPipelineAgentName(value);
  const withoutTrailingAgent = withoutPipeline.replace(/Agent$/, '').replace(/-agent$/, '');
  const spaced = withoutTrailingAgent
    .replace(/[_-]/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .trim();
  return titleCaseWords(spaced || withoutTrailingAgent);
}

export function gerundFor(map: Record<string, string>, raw: string): string {
  return map[raw.trim().toLowerCase()] || humanizeNounPhrase(raw);
}

// Thinkings gerunds carry their connective; unknown generations fall back to
// '<Gerund> the' so the sentence stays grammatical.
export function thinkingsGerundPhrase(raw: string): string {
  return THINKINGS_GERUNDS[raw.trim().toLowerCase()] || `${humanizeNounPhrase(raw)} the`;
}

export function normalizeStepName(step: string | undefined): string {
  if (!step) return '';

  const stepLower = step.toLowerCase();

  if (stepLower.includes('plan')) return 'Plan';
  // 'retry' must be tested before 'try': 'retry'.includes('try') is true, so
  // the broader match would relabel every Retry step as Try.
  if (stepLower.includes('retry')) return 'Retry';
  if (stepLower.includes('try')) return 'Try';
  if (stepLower.includes('refine')) return 'Refine';
  if (stepLower.includes('generate')) return 'Try';
  if (stepLower.includes('intensify')) return 'Retry';
  if (stepLower.includes('initialize')) return 'Initialize';
  if (stepLower.includes('setup')) return 'Setup';
  if (stepLower.includes('discovery')) return 'Discovery';
  if (stepLower.includes('implementation')) return 'Implementation';
  if (stepLower.includes('validation')) return 'Validation';
  if (stepLower.includes('finish')) return 'Finish';

  return step.charAt(0).toUpperCase() + step.slice(1);
}

// The canonical SDIVF phases.
export const SDIVF_PHASES = ['Setup', 'Discovery', 'Implementation', 'Validation', 'Finish'];

export function normalizePhaseName(phase: string | undefined): string {
  if (!phase) return '';

  const phaseLower = phase.toLowerCase();

  if (phaseLower.includes('setup') || phaseLower.includes('admission') || phaseLower.includes('preflight')) {
    return 'Setup';
  }
  if (
    phaseLower.includes('discovery') ||
    phaseLower.includes('search') ||
    phaseLower.includes('recall') ||
    phaseLower.includes('candidate')
  ) {
    return 'Discovery';
  }
  if (
    phaseLower.includes('implementation') ||
    phaseLower.includes('synthesis') ||
    phaseLower.includes('asset-pack') ||
    phaseLower.includes('write')
  ) {
    return 'Implementation';
  }
  if (
    phaseLower.includes('validation') ||
    phaseLower.includes('evaluate') ||
    phaseLower.includes('quality') ||
    phaseLower.includes('readiness')
  ) {
    return 'Validation';
  }
  if (
    phaseLower.includes('finish') ||
    phaseLower.includes('delivery') ||
    phaseLower.includes('settlement') ||
    phaseLower.includes('finality') ||
    phaseLower.includes('readback')
  ) {
    return 'Finish';
  }

  return SDIVF_PHASES.includes(phase) ? phase : '';
}

/**
 * Render the live execution context as a natural-language sentence:
 * "While {Depositing|Reading}, during {Phase}, {Agent} Agent is {Step-ing},
 * by {Thinkings-ing} the {Failsafe}." The 'While {Pipeline}, ' prefix is only
 * added when the pipeline mode is known (latched from the stream or passed by
 * the page); without it the sentence starts at 'During {Phase}, '. Degrades
 * gracefully as fields are unknown (e.g. a Tool-use context only ever carries
 * Phase/Agent/Step, never Failsafe/Thinkings — F19). Returns null when there
 * isn't enough context yet to say anything meaningful.
 */
export function describeExecutionContext(ctx: {
  phase?: string | null;
  agent?: string | null;
  step?: string | null;
  failsafe?: string | null;
  generation?: string | null;
  mode?: SynthesisPipelineMode | string | null;
}): string | null {
  if (!ctx.phase || !ctx.agent || !ctx.step) return null;
  const modeKey = String(ctx.mode || '').trim().toLowerCase() as SynthesisPipelineMode;
  const pipelineGerund = PIPELINE_GERUNDS[modeKey];
  const during = `uring ${humanizeNounPhrase(ctx.phase)}, ${humanizeAgentName(ctx.agent)} Agent is ${gerundFor(STEP_GERUNDS, ctx.step)}`;
  let sentence = pipelineGerund ? `While ${pipelineGerund}, d${during}` : `D${during}`;
  if (ctx.generation && ctx.failsafe) {
    sentence += `, by ${thinkingsGerundPhrase(ctx.generation)} ${formatFailsafeSentenceName(ctx.failsafe)}`;
  }
  return sentence;
}
