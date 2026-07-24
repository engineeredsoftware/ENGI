/**
 * Bare absolute measure: `file-span` of a synthesized **DataPack**.
 * Family: structure. Policy: weighted. Class: quantity.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient, notImplemented } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'file-span' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'File span' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'files' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'structure' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'weighted' as const;

export function measureAbsoluteFileSpan(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  const changes = input.dataPack.fileChanges?.length ?? 0;
  const covered = input.dataPack.coveredSourcePaths?.length ?? 0;
  const magnitude = Math.max(changes, covered, 0);
  return { measurementKind: 'file-span', magnitude, volume: clamp01(magnitude / 10),
    rationale: `DataPack file-span magnitude=${magnitude}.`, status: magnitude > 0 ? 'measured' : 'insufficient_evidence', policyRole: 'weighted' };
}

export default measureAbsoluteFileSpan;
