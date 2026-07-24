/**
 * Bare absolute measure: `dependency-span` of a synthesized **DataPack**.
 * Family: structure. Policy: target. Class: quantity.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient, notImplemented } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'dependency-span' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Dependency span' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'dependencies' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'structure' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'target' as const;

export function measureAbsoluteDependencySpan(_input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  return notImplemented('dependency-span');
}

export default measureAbsoluteDependencySpan;
