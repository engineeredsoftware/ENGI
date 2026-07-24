/**
 * Bare absolute measure: `data-flow-depth` of a synthesized **DataPack**.
 * Family: structure. Policy: target. Class: quantity.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient, notImplemented } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'data-flow-depth' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Data-flow depth' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'depth' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'structure' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'target' as const;

export function measureAbsoluteDataFlowDepth(_input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  return notImplemented('data-flow-depth');
}

export default measureAbsoluteDataFlowDepth;
