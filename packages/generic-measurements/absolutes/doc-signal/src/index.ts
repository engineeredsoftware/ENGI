/**
 * Bare absolute measure: `doc-signal` of a synthesized **DataPack**.
 * Family: structure. Policy: target. Class: quantity.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient, notImplemented } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'doc-signal' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Doc signal' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'ratio' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'structure' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'target' as const;

export function measureAbsoluteDocSignal(_input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  return notImplemented('doc-signal');
}

export default measureAbsoluteDocSignal;
