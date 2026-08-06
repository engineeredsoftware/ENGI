/**
 * Bare absolute measure: `completeness` of a synthesized **DataPack**.
 * Family: semantics. Host/quality-agent signal required (no confidence invention).
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { hostSignalMeasuredOrInsufficient } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'completeness' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Completeness' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'ratio' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'semantics' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'target' as const;

export function measureAbsoluteCompleteness(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  return hostSignalMeasuredOrInsufficient('completeness', input, {
    isRatio: true,
    policyRole: 'target',
    missingRationale:
      'Requires quality measure-agent or host sensor signal; never invent from synthesis confidence alone.',
  });
}

export default measureAbsoluteCompleteness;
