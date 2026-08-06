/**
 * Bare absolute measure: `rl-object-completeness` of a synthesized **DataPack**.
 * Family: value. Policy: target.
 * Counts RL components when host provides signal.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'rl-object-completeness' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'RL-object completeness' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'components' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'value' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'target' as const;

export function measureAbsoluteRlObjectCompleteness(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  const raw = input.staticSignals?.['rl-object-completeness'] ?? input.context?.['rl-object-completeness'];
  const n = Number(raw);
  if (Number.isFinite(n) && n >= 0) {
    const isRatio = false;
    const magnitude = isRatio ? clamp01(n) : Math.round(n);
    const volume = isRatio ? clamp01(n) : clamp01(magnitude / 6);
    return {
      measurementKind: 'rl-object-completeness',
      magnitude,
      volume,
      rationale: 'host staticSignals/context',
      status: 'measured',
      policyRole: 'target',
    };
  }
  return emptyInsufficient(
    'rl-object-completeness',
    'Counts RL components when host provides signal.',
  );
}

export default measureAbsoluteRlObjectCompleteness;
