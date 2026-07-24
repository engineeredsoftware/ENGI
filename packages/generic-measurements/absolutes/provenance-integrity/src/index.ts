/**
 * Bare absolute measure: `provenance-integrity` of a synthesized **DataPack**.
 * Family: provenance. Policy: target. Class: provenance.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient, notImplemented } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'provenance-integrity' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Provenance integrity' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'ratio' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'provenance' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'target' as const;

export function measureAbsoluteProvenanceIntegrity(_input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  return notImplemented('provenance-integrity');
}

export default measureAbsoluteProvenanceIntegrity;
