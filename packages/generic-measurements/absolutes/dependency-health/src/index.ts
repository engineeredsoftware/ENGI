/**
 * Bare absolute measure: `dependency-health` of a synthesized **DataPack**.
 * Family: hygiene. Policy: penalty. Manifest/signal aware; no full OSV without host tool.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'dependency-health' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Dependency health' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'ratio' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'hygiene' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'penalty' as const;

export function measureAbsoluteDependencyHealth(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  const fromSignals = Number(input.staticSignals?.['dependency-health']);
  if (Number.isFinite(fromSignals) && fromSignals >= 0) {
    const volume = clamp01(fromSignals);
    return {
      measurementKind: 'dependency-health',
      magnitude: volume,
      volume,
      rationale: 'staticSignals (e.g. OSV host tool)',
      status: 'measured',
      policyRole: 'penalty',
    };
  }
  const cveHits = Number(input.staticSignals?.dependencyCveCount ?? input.context?.dependencyCveCount);
  if (Number.isFinite(cveHits) && cveHits >= 0) {
    const volume = clamp01(1 - cveHits / 10);
    return {
      measurementKind: 'dependency-health',
      magnitude: cveHits,
      volume,
      rationale: 'context dependencyCveCount',
      status: 'measured',
      policyRole: 'penalty',
    };
  }
  const sources = input.sources || [];
  const manifests = sources.filter((f) => /package\.json|requirements\.txt|go\.mod|Cargo\.toml|pom\.xml/i.test(f.path));
  if (!manifests.length && !sources.length) return emptyInsufficient('dependency-health');
  // Without CVE scanner: healthy default when no evidence of issues.
  return {
    measurementKind: 'dependency-health',
    magnitude: 0,
    volume: 1,
    rationale: manifests.length
      ? 'no CVE signal; assume healthy until host OSV scan'
      : 'no dependency evidence on DataPack; neutral healthy',
    status: 'estimated',
    policyRole: 'penalty',
  };
}

export default measureAbsoluteDependencyHealth;
