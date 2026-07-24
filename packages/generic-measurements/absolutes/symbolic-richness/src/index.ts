/**
 * Bare absolute measure: `symbolic-richness` of a synthesized **DataPack**.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'symbolic-richness' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'symbolic-richness' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'count' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'structure' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'weighted' as const;

function countRe(content: string, re: RegExp): number {
  return (content.match(re) || []).length;
}

export function measureAbsoluteSymbolicRichness(
  input: DataPackAbsoluteMeasureInput,
): AbsoluteMeasureResult {
  const fromSignals = Number(input.staticSignals?.['symbolic-richness']);
  if (Number.isFinite(fromSignals) && fromSignals >= 0) {
    const magnitude = Math.round(fromSignals);
    return {
      measurementKind: 'symbolic-richness',
      magnitude,
      volume: clamp01(magnitude / 200),
      rationale: 'staticSignals',
      status: 'measured',
      policyRole: 'weighted',
    };
  }
  const sources = input.sources || [];
  if (!sources.length) return emptyInsufficient('symbolic-richness');
  let magnitude = 0;
  for (const file of sources) {
    const c = file.content || '';
    magnitude += new Set(c.match(/\b[A-Za-z_][A-Za-z0-9_]+\b/g) || []).size;
  }
  magnitude = Math.round(magnitude);
  return {
    measurementKind: 'symbolic-richness',
    magnitude,
    volume: clamp01(magnitude / 200),
    rationale: 'heuristic over sources',
    status: 'estimated',
    policyRole: 'weighted',
  };
}

export default measureAbsoluteSymbolicRichness;
