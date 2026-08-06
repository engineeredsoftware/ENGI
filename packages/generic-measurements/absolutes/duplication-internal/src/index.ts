/**
 * Bare absolute measure: `duplication-internal` of a synthesized **DataPack**.
 * Family: hygiene. Policy: penalty. Line-shingle proxy (not full jscpd).
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'duplication-internal' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Internal duplication' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'ratio' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'hygiene' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'penalty' as const;

export function measureAbsoluteDuplicationInternal(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  const fromSignals = Number(input.staticSignals?.['duplication-internal']);
  if (Number.isFinite(fromSignals) && fromSignals >= 0) {
    const volume = clamp01(fromSignals);
    return {
      measurementKind: 'duplication-internal',
      magnitude: volume,
      volume,
      rationale: 'staticSignals',
      status: 'measured',
      policyRole: 'penalty',
    };
  }
  const sources = input.sources || [];
  if (!sources.length) return emptyInsufficient('duplication-internal');
  const lines: string[] = [];
  for (const f of sources) {
    for (const line of (f.content || '').split(/\n/)) {
      const t = line.trim();
      if (t.length >= 20) lines.push(t);
    }
  }
  if (lines.length === 0) {
    return {
      measurementKind: 'duplication-internal',
      magnitude: 0,
      volume: 0,
      rationale: 'no substantial lines',
      status: 'estimated',
      policyRole: 'penalty',
    };
  }
  const seen = new Map<string, number>();
  let dups = 0;
  for (const line of lines) {
    const n = (seen.get(line) || 0) + 1;
    seen.set(line, n);
    if (n === 2) dups += 1;
  }
  // volume = duplication ratio (higher worse for penalty kinds as magnitude of issue)
  const volume = clamp01(dups / Math.max(1, lines.length));
  return {
    measurementKind: 'duplication-internal',
    magnitude: dups,
    volume,
    rationale: `${dups} repeated substantial lines of ${lines.length}`,
    status: 'estimated',
    policyRole: 'penalty',
  };
}

export default measureAbsoluteDuplicationInternal;
