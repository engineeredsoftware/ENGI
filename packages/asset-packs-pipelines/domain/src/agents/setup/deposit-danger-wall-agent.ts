/**
 * Deposit Setup danger wall — admit obfuscations before Discovery.
 *
 * Runs alone after parallel Setup bootstrap (LSP, MCP, obfuscations comprehension).
 * Fail-closed when comprehension is missing or ill-formed after Obfuscations text
 * was provided. Empty Obfuscations with explicit empty guidance is admitted
 * (Impermissible sources remain authoritative).
 */

import { ShortCircuitError, type ShortCircuitSignal } from '@bitcode/execution-generics';
import { storeCrossPhaseArtifact } from '../../synthesize-asset-packs';

function findValue(execution: any, namespace: string, key: string): any {
  const local = execution?.get?.(namespace, key);
  if (local !== undefined) return local;
  return execution?.findUp?.(namespace, key);
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function objectValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/**
 * Deterministic deposit admission: valid obfuscation guidance required to proceed.
 */
export default async function runDepositDangerWallAgent(input: any, execution: any) {
  const obfuscationsText = asString(
    input?.obfuscations ?? findValue(execution, 'deposit', 'obfuscations'),
  );
  const guidance =
    objectValue(input?.obfuscationGuidance) ??
    objectValue(findValue(execution, 'setup', 'inputComprehension')) ??
    objectValue(findValue(execution, 'setup', 'obfuscationGuidance'));

  const hasText = obfuscationsText.length > 0;
  const hasGuidance = Boolean(guidance);
  const summary = asString(guidance?.summary);
  const paths = Array.isArray(guidance?.obfuscatedPaths) ? guidance!.obfuscatedPaths : [];
  const concepts = Array.isArray(guidance?.obfuscatedConcepts)
    ? guidance!.obfuscatedConcepts
    : [];

  let safe = true;
  let reason = 'Deposit Setup admitted: obfuscations posture is valid to synthesize.';
  const flags: string[] = [];

  if (hasText && !hasGuidance) {
    safe = false;
    reason = 'Obfuscations text was provided but Setup did not store structured guidance.';
    flags.push('obfuscations-guidance-missing');
  } else if (hasText && hasGuidance && !summary && paths.length === 0 && concepts.length === 0) {
    safe = false;
    reason =
      'Obfuscations text was provided but guidance is empty (no summary, paths, or concepts).';
    flags.push('obfuscations-guidance-empty');
  } else if (!hasText) {
    reason =
      'No Obfuscations declared; Impermissible sources remain authoritative. Safe to synthesize.';
    flags.push('obfuscations-none-declared');
  }

  const admission = {
    safe,
    reason,
    flags,
    hasObfuscationsText: hasText,
    guidancePresent: hasGuidance,
    obfuscatedPathCount: paths.length,
    obfuscatedConceptCount: concepts.length,
  };

  storeCrossPhaseArtifact(execution, 'setup', 'admission', admission);
  storeCrossPhaseArtifact(execution, 'setup', 'dangerWall', admission);

  if (!safe) {
    const signal: ShortCircuitSignal = {
      type: 'SHORT_CIRCUIT',
      reason: `Deposit Setup danger wall blocked synthesis: ${reason}`,
      refundType: 'full',
      confidence: 1,
      metadata: {
        phase: 'setup',
        agent: 'setup:danger-wall',
        flags,
        admission,
      },
    };
    throw new ShortCircuitError(signal);
  }

  return { ...(input || {}), success: true, admission };
}
