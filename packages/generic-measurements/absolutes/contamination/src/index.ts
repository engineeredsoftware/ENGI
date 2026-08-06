/**
 * Bare absolute measure: `contamination` of a synthesized **DataPack**.
 * Family: provenance. Policy: target.
 * Requires training-corpus membership signal; empty without host signal.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'contamination' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Contamination' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'ratio' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'provenance' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'target' as const;

export function measureAbsoluteContamination(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  const raw = input.staticSignals?.['contamination'] ?? input.context?.['contamination'];
  const n = Number(raw);
  if (Number.isFinite(n) && n >= 0) {
    const isRatio = true;
    const magnitude = isRatio ? clamp01(n) : Math.round(n);
    const volume = isRatio ? clamp01(n) : clamp01(magnitude / 1);
    return {
      measurementKind: 'contamination',
      magnitude,
      volume,
      rationale: 'host staticSignals/context',
      status: 'measured',
      policyRole: 'target',
    };
  }
  return emptyInsufficient(
    'contamination',
    'Requires training-corpus membership signal; empty without host signal.',
  );
}

export default measureAbsoluteContamination;
