/**
 * Bare absolute measure: `correctness-estimate` of a synthesized **DataPack**.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01 } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'correctness-estimate' as const;

export function measureAbsoluteCorrectnessEstimate(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  const volume = clamp01(Number(input.dataPack.confidence ?? 0.6));
  return {
    measurementKind: 'correctness-estimate',
    magnitude: volume,
    volume,
    rationale: 'deterministic quality bare estimate',
    status: 'estimated',
    policyRole: 'weighted',
  };
}

export default measureAbsoluteCorrectnessEstimate;
