/**
 * Bare absolute measure: `lang-span` of a synthesized **DataPack**.
 * Family: structure. Policy: weighted. Class: quantity.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01 } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'lang-span' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Language span' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'languages' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'structure' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'weighted' as const;

function extOf(path: string): string {
  const base = path.split('/').pop() || path; const d = base.lastIndexOf('.');
  return d <= 0 ? '' : base.slice(d + 1).toLowerCase();
}
export function measureAbsoluteLangSpan(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  const paths = [...(input.dataPack.coveredSourcePaths||[]), ...((input.dataPack.fileChanges||[]).map(c=>c.path))];
  const magnitude = new Set(paths.map(extOf).filter(Boolean)).size;
  return { measurementKind: 'lang-span', magnitude, volume: clamp01(magnitude / 4),
    rationale: `Distinct languages on DataPack: ${magnitude}.`, status: magnitude > 0 ? 'measured' : 'insufficient_evidence', policyRole: 'weighted' };
}

export default measureAbsoluteLangSpan;
