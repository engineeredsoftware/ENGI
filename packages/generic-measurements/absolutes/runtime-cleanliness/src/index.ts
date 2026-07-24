/**
 * Bare absolute measure: `runtime-cleanliness` of a synthesized **DataPack**.
 * Family: verification. Policy: target.
 * Requires sanitizer/runtime harness; empty without host signal.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'runtime-cleanliness' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Runtime cleanliness' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'ratio' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'verification' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'target' as const;

export function measureAbsoluteRuntimeCleanliness(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  const raw = input.staticSignals?.['runtime-cleanliness'] ?? input.context?.['runtime-cleanliness'];
  const n = Number(raw);
  if (Number.isFinite(n) && n >= 0) {
    const isRatio = true;
    const magnitude = isRatio ? clamp01(n) : Math.round(n);
    const volume = isRatio ? clamp01(n) : clamp01(magnitude / 1);
    return {
      measurementKind: 'runtime-cleanliness',
      magnitude,
      volume,
      rationale: 'host staticSignals/context',
      status: 'measured',
      policyRole: 'target',
    };
  }
  return emptyInsufficient(
    'runtime-cleanliness',
    'Requires sanitizer/runtime harness; empty without host signal.',
  );
}

export default measureAbsoluteRuntimeCleanliness;
