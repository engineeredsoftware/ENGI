/**
 * Read Setup danger wall — admit Need comprehension before Discovery.
 * Twin of deposit danger-wall (obfuscations → need guidance).
 */

import { ShortCircuitError, type ShortCircuitSignal } from '@bitcode/execution-generics';
import { storeCrossPhaseArtifact } from '@bitcode/asset-packs-pipelines-syntheses-domain/synthesize-asset-packs';

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

export default async function runReadDangerWallAgent(input: any, execution: any) {
  const needText = asString(
    input?.need ??
      input?.needs ??
      findValue(execution, 'read', 'need') ??
      findValue(execution, 'deposit', 'obfuscations'),
  );
  const guidance =
    objectValue(input?.needComprehension) ??
    objectValue(findValue(execution, 'setup', 'needComprehension')) ??
    objectValue(findValue(execution, 'setup', 'inputComprehension'));

  const hasText = needText.length > 0;
  const hasGuidance = Boolean(guidance);
  const summary = asString(guidance?.summary);
  const dynamicKinds = Array.isArray(guidance?.dynamicNeedinessKinds)
    ? (guidance!.dynamicNeedinessKinds as string[])
    : [];

  let safe = true;
  let reason = 'Read Setup admitted: Need posture is valid to synthesize.';
  const flags: string[] = [];

  if (!hasText) {
    safe = false;
    reason = 'A Need text is required to synthesize read AssetPack options.';
    flags.push('need-missing');
  } else if (!hasGuidance) {
    safe = false;
    reason = 'Need text was provided but Setup did not store structured Need guidance.';
    flags.push('need-guidance-missing');
  } else if (!summary) {
    safe = false;
    reason = 'Need guidance is empty (no summary).';
    flags.push('need-guidance-empty');
  } else if (dynamicKinds.length === 0) {
    safe = false;
    reason = 'Need guidance must plan at least one dynamic *-fit neediness measurement.';
    flags.push('need-dynamic-kinds-missing');
  } else if (dynamicKinds.some((k) => !String(k).endsWith('-fit'))) {
    safe = false;
    reason = 'Every dynamic neediness kind must end with the suffix -fit.';
    flags.push('need-dynamic-kinds-suffix');
  }

  const admission = {
    safe,
    reason,
    flags,
    hasNeedText: hasText,
    guidancePresent: hasGuidance,
    dynamicNeedinessKindCount: dynamicKinds.length,
  };

  storeCrossPhaseArtifact(execution, 'setup', 'admission', admission);
  storeCrossPhaseArtifact(execution, 'setup', 'dangerWall', admission);

  if (!safe) {
    const signal: ShortCircuitSignal = {
      type: 'SHORT_CIRCUIT',
      reason: `Read Setup danger wall blocked synthesis: ${reason}`,
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
