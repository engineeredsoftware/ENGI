/**
 * Bare absolute measure: `dead-code-ratio` of a synthesized **DataPack**.
 * Family: hygiene. Policy: penalty. Export-vs-reference proxy.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'dead-code-ratio' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Dead-code ratio' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'ratio' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'hygiene' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'penalty' as const;

export function measureAbsoluteDeadCodeRatio(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  const fromSignals = Number(input.staticSignals?.['dead-code-ratio']);
  if (Number.isFinite(fromSignals) && fromSignals >= 0) {
    const volume = clamp01(fromSignals);
    return {
      measurementKind: 'dead-code-ratio',
      magnitude: volume,
      volume,
      rationale: 'staticSignals',
      status: 'measured',
      policyRole: 'penalty',
    };
  }
  const sources = input.sources || [];
  if (!sources.length) return emptyInsufficient('dead-code-ratio');
  const exportNames = new Set<string>();
  const allText = sources.map((f) => f.content || '').join('\n');
  for (const f of sources) {
    const c = f.content || '';
    for (const m of c.matchAll(/export\s+(?:async\s+)?(?:function|class|const|let|var|type|interface)\s+([A-Za-z_][A-Za-z0-9_]*)/g)) {
      exportNames.add(m[1]!);
    }
  }
  if (exportNames.size === 0) {
    return {
      measurementKind: 'dead-code-ratio',
      magnitude: 0,
      volume: 0,
      rationale: 'no export symbols to assess',
      status: 'estimated',
      policyRole: 'penalty',
    };
  }
  let unreferenced = 0;
  for (const name of exportNames) {
    const re = new RegExp('\\b' + name + '\\b', 'g');
    const hits = (allText.match(re) || []).length;
    // 1 hit is the definition itself
    if (hits <= 1) unreferenced += 1;
  }
  const volume = clamp01(unreferenced / exportNames.size);
  return {
    measurementKind: 'dead-code-ratio',
    magnitude: unreferenced,
    volume,
    rationale: `${unreferenced}/${exportNames.size} exports unreferenced in pack sources`,
    status: 'estimated',
    policyRole: 'penalty',
  };
}

export default measureAbsoluteDeadCodeRatio;
