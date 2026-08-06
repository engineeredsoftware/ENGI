/**
 * Bare absolute measure: `diversity-contribution` of a synthesized **DataPack**.
 * Family: value. Policy: target.
 * Requires corpus diversity index; empty without host signal.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'diversity-contribution' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Diversity contribution' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'ratio' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'value' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'target' as const;

export function measureAbsoluteDiversityContribution(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  const raw = input.staticSignals?.['diversity-contribution'] ?? input.context?.['diversity-contribution'];
  const n = Number(raw);
  if (Number.isFinite(n) && n >= 0) {
    const isRatio = true;
    const magnitude = isRatio ? clamp01(n) : Math.round(n);
    const volume = isRatio ? clamp01(n) : clamp01(magnitude / 1);
    return {
      measurementKind: 'diversity-contribution',
      magnitude,
      volume,
      rationale: 'host staticSignals/context',
      status: 'measured',
      policyRole: 'target',
    };
  }
  return emptyInsufficient(
    'diversity-contribution',
    'Requires corpus diversity index; empty without host signal.',
  );
}

export default measureAbsoluteDiversityContribution;
