/**
 * Bare absolute measure: `security-cleanliness` of a synthesized **DataPack**.
 * Family: hygiene. Policy: penalty. Class: hygiene.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient, notImplemented } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'security-cleanliness' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Security cleanliness' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'ratio' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'hygiene' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'penalty' as const;

export function measureAbsoluteSecurityCleanliness(_input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  return notImplemented('security-cleanliness');
}

export default measureAbsoluteSecurityCleanliness;
