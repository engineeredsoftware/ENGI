/**
 * Bare absolute measure: `coherence` of a synthesized **DataPack**.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01 } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'coherence' as const;

export function measureAbsoluteCoherence(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  const volume = clamp01(Number(input.dataPack.confidence ?? 0.6));
  return {
    measurementKind: 'coherence',
    magnitude: volume,
    volume,
    rationale: 'deterministic quality bare estimate',
    status: 'estimated',
    policyRole: 'target',
  };
}

export default measureAbsoluteCoherence;
