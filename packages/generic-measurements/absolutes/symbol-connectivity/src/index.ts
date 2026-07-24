/**
 * Bare absolute measure: `symbol-connectivity` of a synthesized **DataPack**.
 * Family: structure. Policy: target. Class: quantity.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient, notImplemented } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'symbol-connectivity' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Symbol connectivity' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'edges' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'structure' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'target' as const;

export function measureAbsoluteSymbolConnectivity(_input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  return notImplemented('symbol-connectivity');
}

export default measureAbsoluteSymbolConnectivity;
