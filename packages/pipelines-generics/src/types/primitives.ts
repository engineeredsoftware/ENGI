// Canonical primitive types and mappers for pipelines (DB + Streams SSOT)
// Bitcode product law: SDIVF phases only (no Design→Develop→Digest gates).

// Lowercase phase for DB.
export type PhaseLower = 'setup' | 'discovery' | 'implementation' | 'validation' | 'finish';
// Title case phase for Streams.
export type PhaseTitle = 'Setup' | 'Discovery' | 'Implementation' | 'Validation' | 'Finish';

export type StepLower = 'plan' | 'try' | 'refine' | 'retry';
export type StepTitle = 'Plan' | 'Try' | 'Refine' | 'Retry';
export type MetaStep = 'prepare_concise_context' | 'chunk_then_sum' | 'stitch_until_complete';
export type SubStep = 'reason' | 'judge' | 'structured_output';

/**
 * Execution State - Canonical representation for streaming and UI
 *
 * Represents the current position in the execution hierarchy:
 * Phase → Agent → Step → Failsafe → Generation
 */
export interface ExecutionState {
  phase: PhaseTitle;
  agent?: string;
  step?: StepTitle;
  failsafe?: MetaStep;
  generation?: SubStep;
}

export function toPhaseLower(p?: string): PhaseLower | undefined {
  if (!p) return undefined;
  const s = p.toLowerCase();
  if (['setup', 'discovery', 'implementation', 'validation', 'finish'].includes(s)) return s as PhaseLower;
  return undefined;
}

export function toPhaseTitle(p?: string): PhaseTitle | undefined {
  const lower = toPhaseLower(p);
  switch (lower) {
    case 'setup': return 'Setup';
    case 'discovery': return 'Discovery';
    case 'implementation': return 'Implementation';
    case 'validation': return 'Validation';
    case 'finish': return 'Finish';
    default: return undefined;
  }
}

export function toStepLower(step?: string): StepLower | undefined {
  if (!step) return undefined;
  const s = step.toLowerCase();
  if (s === 'plan' || s === 'try' || s === 'refine' || s === 'retry') return s as StepLower;
  if (step === 'Plan') return 'plan';
  if (step === 'Try') return 'try';
  if (step === 'Refine') return 'refine';
  if (step === 'Retry') return 'retry';
  return undefined;
}

export function isMetaStep(v: any): v is MetaStep {
  return v === 'prepare_concise_context' || v === 'chunk_then_sum' || v === 'stitch_until_complete';
}

export function isSubStep(v: any): v is SubStep {
  return v === 'reason' || v === 'judge' || v === 'structured_output';
}
