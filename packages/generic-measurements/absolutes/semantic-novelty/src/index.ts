/**
 * Bare absolute measure: `semantic-novelty` of a synthesized **DataPack**.
 * Family: provenance. Policy: target. Class: provenance.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient, notImplemented } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'semantic-novelty' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Semantic novelty' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'ratio' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'provenance' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'target' as const;

export function measureAbsoluteSemanticNovelty(_input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  return notImplemented('semantic-novelty');
}

export default measureAbsoluteSemanticNovelty;
