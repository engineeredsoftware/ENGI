/**
 * Bare absolute measure: `function-count` of a synthesized **DataPack**.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'function-count' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'function-count' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'count' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'structure' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'weighted' as const;

function countRe(content: string, re: RegExp): number {
  return (content.match(re) || []).length;
}

export function measureAbsoluteFunctionCount(
  input: DataPackAbsoluteMeasureInput,
): AbsoluteMeasureResult {
  const fromSignals = Number(input.staticSignals?.['function-count']);
  if (Number.isFinite(fromSignals) && fromSignals >= 0) {
    const magnitude = Math.round(fromSignals);
    return {
      measurementKind: 'function-count',
      magnitude,
      volume: clamp01(magnitude / 40),
      rationale: 'staticSignals',
      status: 'measured',
      policyRole: 'weighted',
    };
  }
  const sources = input.sources || [];
  if (!sources.length) return emptyInsufficient('function-count');
  let magnitude = 0;
  for (const file of sources) {
    const c = file.content || '';
    magnitude += countRe(c, /\bfunction\b|=>/g);
  }
  magnitude = Math.round(magnitude);
  return {
    measurementKind: 'function-count',
    magnitude,
    volume: clamp01(magnitude / 40),
    rationale: 'heuristic over sources',
    status: 'estimated',
    policyRole: 'weighted',
  };
}

export default measureAbsoluteFunctionCount;
