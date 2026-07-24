/**
 * Bare absolute measure: `objectives-fidelity` of a synthesized **DataPack**.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01 } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'objectives-fidelity' as const;

export function measureAbsoluteObjectivesFidelity(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  const confidence = clamp01(Number(input.dataPack.confidence ?? 0.6));
  const volume = clamp01(0.55 * confidence + 0.25);
  return {
    measurementKind: 'objectives-fidelity',
    magnitude: volume,
    volume,
    rationale: 'deterministic quality bare estimate',
    status: 'estimated',
    policyRole: 'weighted',
  };
}

export default measureAbsoluteObjectivesFidelity;
