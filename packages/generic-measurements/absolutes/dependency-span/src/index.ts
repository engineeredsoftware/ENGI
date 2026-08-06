/**
 * Bare absolute measure: `dependency-span` of a synthesized **DataPack**.
 * Family: structure. Policy: target. Class: quantity|hygiene|verification|provenance|value as catalog.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'dependency-span' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Dependency span' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'dependencies' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'structure' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'target' as const;

function countImports(content: string): string[] {
  const hits: string[] = [];
  const re = /(?:from\s+['"]([^'"]+)['"]|require\s*\(\s*['"]([^'"]+)['"]\s*\)|import\s+['"]([^'"]+)['"])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content))) {
    const spec = m[1] || m[2] || m[3];
    if (spec && !spec.startsWith('.') && !spec.startsWith('/')) hits.push(spec.split('/')[0]!);
  }
  return hits;
}

export function measureAbsoluteDependencySpan(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  const fromSignals = Number(input.staticSignals?.['dependency-span']);
  if (Number.isFinite(fromSignals) && fromSignals >= 0) {
    const magnitude = Math.round(fromSignals);
    return {
      measurementKind: 'dependency-span',
      magnitude,
      volume: clamp01(magnitude / 20),
      rationale: 'staticSignals',
      status: 'measured',
      policyRole: 'target',
    };
  }
  const sources = input.sources || [];
  if (!sources.length) return emptyInsufficient('dependency-span');
  const deps = new Set<string>();
  for (const f of sources) for (const d of countImports(f.content || '')) deps.add(d);
  const magnitude = deps.size;
  return {
    measurementKind: 'dependency-span',
    magnitude,
    volume: clamp01(magnitude / 20),
    rationale: `Distinct external imports on DataPack: ${magnitude}.`,
    status: 'estimated',
    policyRole: 'target',
  };
}

export default measureAbsoluteDependencySpan;
