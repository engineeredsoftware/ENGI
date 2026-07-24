/**
 * Bare absolute measure: `test-surface` of a synthesized **DataPack**.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'test-surface' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'test-surface' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'count' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'structure' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'weighted' as const;

function countRe(content: string, re: RegExp): number {
  return (content.match(re) || []).length;
}

export function measureAbsoluteTestSurface(
  input: DataPackAbsoluteMeasureInput,
): AbsoluteMeasureResult {
  const fromSignals = Number(input.staticSignals?.['test-surface']);
  if (Number.isFinite(fromSignals) && fromSignals >= 0) {
    const magnitude = Math.round(fromSignals);
    return {
      measurementKind: 'test-surface',
      magnitude,
      volume: clamp01(magnitude / 30),
      rationale: 'staticSignals',
      status: 'measured',
      policyRole: 'weighted',
    };
  }
  const sources = input.sources || [];
  if (!sources.length) return emptyInsufficient('test-surface');
  let magnitude = 0;
  for (const file of sources) {
    const c = file.content || '';
    if (/(__tests__|\.test\.|\.spec\.)/i.test(file.path)) {
      magnitude += 1 + countRe(c, /\b(it|test|describe)\b/g);
    }
  }
  magnitude = Math.round(magnitude);
  return {
    measurementKind: 'test-surface',
    magnitude,
    volume: clamp01(magnitude / 30),
    rationale: 'heuristic over sources',
    status: 'estimated',
    policyRole: 'weighted',
  };
}

export default measureAbsoluteTestSurface;
