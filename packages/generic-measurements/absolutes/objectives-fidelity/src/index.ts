/**
 * Bare absolute measure: `objectives-fidelity` of a synthesized **DataPack**.
 * Family: semantics. Host/quality-agent signal required (no confidence invention).
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { hostSignalMeasuredOrInsufficient } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'objectives-fidelity' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Objectives fidelity' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'ratio' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'semantics' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'weighted' as const;

export function measureAbsoluteObjectivesFidelity(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  return hostSignalMeasuredOrInsufficient('objectives-fidelity', input, {
    isRatio: true,
    policyRole: 'weighted',
    missingRationale:
      'Requires quality measure-agent or host sensor signal; never invent from synthesis confidence alone.',
  });
}

export default measureAbsoluteObjectivesFidelity;
