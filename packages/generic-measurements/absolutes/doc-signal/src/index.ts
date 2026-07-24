/**
 * Bare absolute measure: `doc-signal` of a synthesized **DataPack**.
 * Family: structure. Policy: target. Class: quantity|hygiene|verification|provenance|value as catalog.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'doc-signal' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Doc signal' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'ratio' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'structure' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'target' as const;

export function measureAbsoluteDocSignal(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  const fromSignals = Number(input.staticSignals?.['doc-signal']);
  if (Number.isFinite(fromSignals) && fromSignals >= 0) {
    const volume = clamp01(fromSignals);
    return {
      measurementKind: 'doc-signal',
      magnitude: volume,
      volume,
      rationale: 'staticSignals',
      status: 'measured',
      policyRole: 'target',
    };
  }
  const sources = input.sources || [];
  if (!sources.length) return emptyInsufficient('doc-signal');
  let docLines = 0;
  let codeLines = 0;
  for (const f of sources) {
    const lines = (f.content || '').split(/\n/);
    for (const line of lines) {
      const t = line.trim();
      if (!t) continue;
      codeLines += 1;
      if (t.startsWith('//') || t.startsWith('#') || t.startsWith('*') || t.startsWith('/**') || t.startsWith('/*')) {
        docLines += 1;
      }
    }
  }
  const volume = codeLines === 0 ? 0 : clamp01(docLines / codeLines);
  return {
    measurementKind: 'doc-signal',
    magnitude: volume,
    volume,
    rationale: `Comment density ${docLines}/${codeLines} on DataPack sources.`,
    status: 'estimated',
    policyRole: 'target',
  };
}

export default measureAbsoluteDocSignal;
