/**
 * Bare absolute measure: `capability-clarity` of a synthesized **DataPack**.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01 } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'capability-clarity' as const;

export function measureAbsoluteCapabilityClarity(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  const summary = (input.dataPack.summary || "").trim();
  const volume = clamp01(summary.length >= 40 ? 0.7 : 0.35);
  return {
    measurementKind: 'capability-clarity',
    magnitude: volume,
    volume,
    rationale: 'deterministic quality bare estimate',
    status: 'estimated',
    policyRole: 'target',
  };
}

export default measureAbsoluteCapabilityClarity;
