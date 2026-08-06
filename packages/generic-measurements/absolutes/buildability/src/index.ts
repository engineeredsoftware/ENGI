/**
 * Bare absolute measure: `buildability` of a synthesized **DataPack**.
 * Family: verification. Policy: target.
 * Requires ExecutionVerificationTool / sandbox; empty without host signal.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'buildability' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Buildability' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'ratio' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'verification' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'target' as const;

export function measureAbsoluteBuildability(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  const raw = input.staticSignals?.['buildability'] ?? input.context?.['buildability'];
  const n = Number(raw);
  if (Number.isFinite(n) && n >= 0) {
    const isRatio = true;
    const magnitude = isRatio ? clamp01(n) : Math.round(n);
    const volume = isRatio ? clamp01(n) : clamp01(magnitude / 1);
    return {
      measurementKind: 'buildability',
      magnitude,
      volume,
      rationale: 'host staticSignals/context',
      status: 'measured',
      policyRole: 'target',
    };
  }
  return emptyInsufficient(
    'buildability',
    'Requires ExecutionVerificationTool / sandbox; empty without host signal.',
  );
}

export default measureAbsoluteBuildability;
