/**
 * Bare absolute measure: `completeness` of a synthesized **DataPack**.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01 } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'completeness' as const;

export function measureAbsoluteCompleteness(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  const volume = clamp01(Number(input.dataPack.confidence ?? 0.6));
  return {
    measurementKind: 'completeness',
    magnitude: volume,
    volume,
    rationale: 'deterministic quality bare estimate',
    status: 'estimated',
    policyRole: 'target',
  };
}

export default measureAbsoluteCompleteness;
