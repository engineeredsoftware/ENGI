/**
 * Bare absolute measure: `control-complexity` of a synthesized **DataPack**.
 * Family: structure. Policy: target. Class: quantity.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient, notImplemented } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'control-complexity' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Control complexity' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'complexity' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'structure' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'target' as const;

export function measureAbsoluteControlComplexity(_input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  return notImplemented('control-complexity');
}

export default measureAbsoluteControlComplexity;
