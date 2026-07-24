/**
 * Bare absolute measure: `ai-generated-likelihood` of a synthesized **DataPack**.
 * Family: provenance. Policy: flag. Class: provenance.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient, notImplemented } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'ai-generated-likelihood' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'AI-generated likelihood' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'ratio' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'provenance' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'flag' as const;

export function measureAbsoluteAiGeneratedLikelihood(_input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  return notImplemented('ai-generated-likelihood');
}

export default measureAbsoluteAiGeneratedLikelihood;
