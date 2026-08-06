/**
 * Bare absolute measure: `coherence` of a synthesized **DataPack**.
 * Family: semantics. Host/quality-agent signal required (no confidence invention).
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { hostSignalMeasuredOrInsufficient } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'coherence' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Coherence' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'ratio' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'semantics' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'target' as const;

export function measureAbsoluteCoherence(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  return hostSignalMeasuredOrInsufficient('coherence', input, {
    isRatio: true,
    policyRole: 'target',
    missingRationale:
      'Requires quality measure-agent or host sensor signal; never invent from synthesis confidence alone.',
  });
}

export default measureAbsoluteCoherence;
