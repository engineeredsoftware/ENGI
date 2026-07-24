/**
 * Bare absolute measure: `trajectory-richness` of a synthesized **DataPack**.
 * Family: value. Policy: target. Class: value.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient, notImplemented } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'trajectory-richness' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Trajectory richness' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'ratio' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'value' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'target' as const;

export function measureAbsoluteTrajectoryRichness(_input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  return notImplemented('trajectory-richness');
}

export default measureAbsoluteTrajectoryRichness;
