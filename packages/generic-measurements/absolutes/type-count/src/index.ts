/**
 * Bare absolute measure: `type-count` of a synthesized **DataPack**.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'type-count' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'type-count' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'count' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'structure' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'weighted' as const;

function countRe(content: string, re: RegExp): number {
  return (content.match(re) || []).length;
}

export function measureAbsoluteTypeCount(
  input: DataPackAbsoluteMeasureInput,
): AbsoluteMeasureResult {
  const fromSignals = Number(input.staticSignals?.['type-count']);
  if (Number.isFinite(fromSignals) && fromSignals >= 0) {
    const magnitude = Math.round(fromSignals);
    return {
      measurementKind: 'type-count',
      magnitude,
      volume: clamp01(magnitude / 24),
      rationale: 'staticSignals',
      status: 'measured',
      policyRole: 'weighted',
    };
  }
  const sources = input.sources || [];
  if (!sources.length) return emptyInsufficient('type-count');
  let magnitude = 0;
  for (const file of sources) {
    const c = file.content || '';
    magnitude += countRe(c, /\b(interface|type|class|enum)\b/g);
  }
  magnitude = Math.round(magnitude);
  return {
    measurementKind: 'type-count',
    magnitude,
    volume: clamp01(magnitude / 24),
    rationale: 'heuristic over sources',
    status: 'estimated',
    policyRole: 'weighted',
  };
}

export default measureAbsoluteTypeCount;
