/**
 * Bare absolute measure: `rl-object-completeness` of a synthesized **DataPack**.
 * Family: value. Policy: target. Class: value.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient, notImplemented } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'rl-object-completeness' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'RL-object completeness' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'components' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'value' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'target' as const;

export function measureAbsoluteRlObjectCompleteness(_input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  return notImplemented('rl-object-completeness');
}

export default measureAbsoluteRlObjectCompleteness;
