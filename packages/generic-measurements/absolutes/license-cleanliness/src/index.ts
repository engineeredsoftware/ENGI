/**
 * Bare absolute measure: `license-cleanliness` of a synthesized **DataPack**.
 * Family: hygiene. Policy: gate. Class: hygiene.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient, notImplemented } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'license-cleanliness' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'License cleanliness' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'gate' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'hygiene' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'gate' as const;

export function measureAbsoluteLicenseCleanliness(_input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  return notImplemented('license-cleanliness');
}

export default measureAbsoluteLicenseCleanliness;
