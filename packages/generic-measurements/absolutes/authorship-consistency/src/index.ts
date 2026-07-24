/**
 * Bare absolute measure: `authorship-consistency` of a synthesized **DataPack**.
 * Family: provenance. Policy: target.
 * Requires authorship fingerprint tool; empty without host signal.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'authorship-consistency' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Authorship consistency' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'ratio' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'provenance' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'target' as const;

export function measureAbsoluteAuthorshipConsistency(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  const raw = input.staticSignals?.['authorship-consistency'] ?? input.context?.['authorship-consistency'];
  const n = Number(raw);
  if (Number.isFinite(n) && n >= 0) {
    const isRatio = true;
    const magnitude = isRatio ? clamp01(n) : Math.round(n);
    const volume = isRatio ? clamp01(n) : clamp01(magnitude / 1);
    return {
      measurementKind: 'authorship-consistency',
      magnitude,
      volume,
      rationale: 'host staticSignals/context',
      status: 'measured',
      policyRole: 'target',
    };
  }
  return emptyInsufficient(
    'authorship-consistency',
    'Requires authorship fingerprint tool; empty without host signal.',
  );
}

export default measureAbsoluteAuthorshipConsistency;
