/**
 * Bare absolute measure: `ai-generated-likelihood` of a synthesized **DataPack**.
 * Family: provenance. Policy: flag.
 * Requires AI-origin classifier; empty without host signal.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'ai-generated-likelihood' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'AI-generated likelihood' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'ratio' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'provenance' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'flag' as const;

export function measureAbsoluteAiGeneratedLikelihood(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  const raw = input.staticSignals?.['ai-generated-likelihood'] ?? input.context?.['ai-generated-likelihood'];
  const n = Number(raw);
  if (Number.isFinite(n) && n >= 0) {
    const isRatio = true;
    const magnitude = isRatio ? clamp01(n) : Math.round(n);
    const volume = isRatio ? clamp01(n) : clamp01(magnitude / 1);
    return {
      measurementKind: 'ai-generated-likelihood',
      magnitude,
      volume,
      rationale: 'host staticSignals/context',
      status: 'measured',
      policyRole: 'flag',
    };
  }
  return emptyInsufficient(
    'ai-generated-likelihood',
    'Requires AI-origin classifier; empty without host signal.',
  );
}

export default measureAbsoluteAiGeneratedLikelihood;
