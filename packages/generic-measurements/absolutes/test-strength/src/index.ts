/**
 * Bare absolute measure: `test-strength` of a synthesized **DataPack**.
 * Family: verification. Policy: target. Class: verification.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient, notImplemented } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'test-strength' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Test strength' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'ratio' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'verification' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'target' as const;

export function measureAbsoluteTestStrength(_input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  return notImplemented('test-strength');
}

export default measureAbsoluteTestStrength;
