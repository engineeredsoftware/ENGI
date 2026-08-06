/**
 * Bare absolute measure: `difficulty` of a synthesized **DataPack**.
 * Family: value. Policy: target.
 * Requires REFERENCE_FRONTIER signal; empty without host signal.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'difficulty' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Difficulty' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'ratio' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'value' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'target' as const;

export function measureAbsoluteDifficulty(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  const raw = input.staticSignals?.['difficulty'] ?? input.context?.['difficulty'];
  const n = Number(raw);
  if (Number.isFinite(n) && n >= 0) {
    const isRatio = true;
    const magnitude = isRatio ? clamp01(n) : Math.round(n);
    const volume = isRatio ? clamp01(n) : clamp01(magnitude / 1);
    return {
      measurementKind: 'difficulty',
      magnitude,
      volume,
      rationale: 'host staticSignals/context',
      status: 'measured',
      policyRole: 'target',
    };
  }
  return emptyInsufficient(
    'difficulty',
    'Requires REFERENCE_FRONTIER signal; empty without host signal.',
  );
}

export default measureAbsoluteDifficulty;
