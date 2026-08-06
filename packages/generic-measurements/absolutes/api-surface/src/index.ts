/**
 * Bare absolute measure: `api-surface` of a synthesized **DataPack**.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'api-surface' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'api-surface' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'count' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'structure' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'weighted' as const;

function countRe(content: string, re: RegExp): number {
  return (content.match(re) || []).length;
}

export function measureAbsoluteApiSurface(
  input: DataPackAbsoluteMeasureInput,
): AbsoluteMeasureResult {
  const fromSignals = Number(input.staticSignals?.['api-surface']);
  if (Number.isFinite(fromSignals) && fromSignals >= 0) {
    const magnitude = Math.round(fromSignals);
    return {
      measurementKind: 'api-surface',
      magnitude,
      volume: clamp01(magnitude / 16),
      rationale: 'staticSignals',
      status: 'measured',
      policyRole: 'weighted',
    };
  }
  const sources = input.sources || [];
  if (!sources.length) return emptyInsufficient('api-surface');
  let magnitude = 0;
  for (const file of sources) {
    const c = file.content || '';
    magnitude += countRe(c, /\bexport\b/g);
  }
  magnitude = Math.round(magnitude);
  return {
    measurementKind: 'api-surface',
    magnitude,
    volume: clamp01(magnitude / 16),
    rationale: 'heuristic over sources',
    status: 'estimated',
    policyRole: 'weighted',
  };
}

export default measureAbsoluteApiSurface;
