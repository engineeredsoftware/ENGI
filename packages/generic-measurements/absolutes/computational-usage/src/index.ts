/**
 * Bare absolute measure: `computational-usage` of a synthesized **DataPack**.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01 } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'computational-usage' as const;

export function measureAbsoluteComputationalUsage(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  const n = (input.dataPack.coveredSourcePaths || []).length;
  const volume = clamp01(0.3 + Math.min(0.5, n / 20));
  return {
    measurementKind: 'computational-usage',
    magnitude: volume,
    volume,
    rationale: 'deterministic quality bare estimate',
    status: 'estimated',
    policyRole: 'weighted',
  };
}

export default measureAbsoluteComputationalUsage;
