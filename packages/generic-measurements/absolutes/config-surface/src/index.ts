/**
 * Bare absolute measure: `config-surface` of a synthesized **DataPack**.
 * Family: structure. Policy: target. Class: quantity.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient, notImplemented } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'config-surface' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Config surface' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'keys' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'structure' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'target' as const;

export function measureAbsoluteConfigSurface(_input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  return notImplemented('config-surface');
}

export default measureAbsoluteConfigSurface;
