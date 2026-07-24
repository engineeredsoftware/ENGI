/**
 * Bare absolute measure: `authorship-consistency` of a synthesized **DataPack**.
 * Family: provenance. Policy: target. Class: provenance.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient, notImplemented } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'authorship-consistency' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Authorship consistency' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'ratio' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'provenance' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'target' as const;

export function measureAbsoluteAuthorshipConsistency(_input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  return notImplemented('authorship-consistency');
}

export default measureAbsoluteAuthorshipConsistency;
