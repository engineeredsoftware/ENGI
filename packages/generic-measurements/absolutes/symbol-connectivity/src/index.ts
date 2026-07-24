/**
 * Bare absolute measure: `symbol-connectivity` of a synthesized **DataPack**.
 * Family: structure. Policy: target. Class: quantity|hygiene|verification|provenance|value as catalog.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'symbol-connectivity' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Symbol connectivity' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'edges' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'structure' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'target' as const;

export function measureAbsoluteSymbolConnectivity(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  const fromSignals = Number(input.staticSignals?.['symbol-connectivity']);
  if (Number.isFinite(fromSignals) && fromSignals >= 0) {
    const magnitude = Math.round(fromSignals);
    return {
      measurementKind: 'symbol-connectivity',
      magnitude,
      volume: clamp01(magnitude / 32),
      rationale: 'staticSignals',
      status: 'measured',
      policyRole: 'target',
    };
  }
  const sources = input.sources || [];
  if (!sources.length) return emptyInsufficient('symbol-connectivity');
  let edges = 0;
  for (const f of sources) {
    const c = f.content || '';
    edges += (c.match(/\bimport\b|from\s+['"]|require\s*\(/g) || []).length;
    edges += (c.match(/\bexport\s+(?:default\s+)?(?:function|class|const|type|interface)/g) || []).length;
    edges += (c.match(/\.[A-Za-z_][A-Za-z0-9_]*\s*\(/g) || []).length;
  }
  const magnitude = Math.round(edges);
  return {
    measurementKind: 'symbol-connectivity',
    magnitude,
    volume: clamp01(magnitude / 32),
    rationale: 'heuristic import/export/call edges over sources',
    status: 'estimated',
    policyRole: 'target',
  };
}

export default measureAbsoluteSymbolConnectivity;
