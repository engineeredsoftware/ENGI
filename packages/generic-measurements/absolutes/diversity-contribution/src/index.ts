/**
 * Bare absolute measure: `diversity-contribution` of a synthesized **DataPack**.
 * Family: value. Policy: target. Class: value.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient, notImplemented } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'diversity-contribution' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Diversity contribution' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'ratio' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'value' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'target' as const;

export function measureAbsoluteDiversityContribution(_input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  return notImplemented('diversity-contribution');
}

export default measureAbsoluteDiversityContribution;
