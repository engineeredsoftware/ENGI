/**
 * Bare absolute measure: `data-flow-depth` of a synthesized **DataPack**.
 * Family: structure. Policy: target. Class: quantity|hygiene|verification|provenance|value as catalog.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'data-flow-depth' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Data-flow depth' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'depth' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'structure' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'target' as const;

export function measureAbsoluteDataFlowDepth(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  const fromSignals = Number(input.staticSignals?.['data-flow-depth']);
  if (Number.isFinite(fromSignals) && fromSignals >= 0) {
    const magnitude = Math.round(fromSignals);
    return {
      measurementKind: 'data-flow-depth',
      magnitude,
      volume: clamp01(magnitude / 24),
      rationale: 'staticSignals',
      status: 'measured',
      policyRole: 'target',
    };
  }
  const sources = input.sources || [];
  if (!sources.length) return emptyInsufficient('data-flow-depth');
  // Heuristic proxy: nesting depth via braces + await/then chains (not full CPG).
  let maxDepth = 0;
  let pipeHints = 0;
  for (const f of sources) {
    const c = f.content || '';
    let depth = 0;
    for (const ch of c) {
      if (ch === '{') { depth += 1; if (depth > maxDepth) maxDepth = depth; }
      else if (ch === '}') depth = Math.max(0, depth - 1);
    }
    pipeHints += (c.match(/\bawait\b|\.then\s*\(|\|\>/g) || []).length;
  }
  const magnitude = Math.round(maxDepth + pipeHints * 0.25);
  return {
    measurementKind: 'data-flow-depth',
    magnitude,
    volume: clamp01(magnitude / 24),
    rationale: 'heuristic nesting/async depth over sources',
    status: 'estimated',
    policyRole: 'target',
  };
}

export default measureAbsoluteDataFlowDepth;
