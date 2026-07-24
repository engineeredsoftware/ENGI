/**
 * Bare absolute measure: `test-coverage` of a synthesized **DataPack**.
 * Family: verification. Policy: target. Class: verification.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient, notImplemented } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'test-coverage' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Test coverage' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'ratio' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'verification' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'target' as const;

export function measureAbsoluteTestCoverage(_input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  return notImplemented('test-coverage');
}

export default measureAbsoluteTestCoverage;
