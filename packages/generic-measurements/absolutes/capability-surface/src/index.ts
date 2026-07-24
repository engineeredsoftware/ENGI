/**
 * Bare absolute measure: `capability-surface` of a synthesized **DataPack**.
 * Family: semantics. Policy: weighted. Material-identity companion.
 * Prefer host material-identity volumes when available (pipeline merge).
 */
import type {
  AbsoluteMeasureResult,
  DataPackAbsoluteMeasureInput,
} from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01 } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'capability-surface' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Capability surface' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'capabilities' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'semantics' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'weighted' as const;

/** Path/text heuristic fallback when host material identity is not attached. */
export function measureAbsoluteCapabilitySurface(
  input: DataPackAbsoluteMeasureInput,
): AbsoluteMeasureResult {
  const fileChanges = input.dataPack.fileChanges || [];
  const paths = [
    ...(input.dataPack.coveredSourcePaths || []),
    ...fileChanges.map((change) => change.path),
  ];
  const text = [
    input.dataPack.title || '',
    input.dataPack.summary || '',
    input.dataPack.patchSummary || '',
    paths.join(' '),
  ]
    .join(' ')
    .toLowerCase();
  // Neutral conservative fallback (0) — host identity extraction is authoritative.
  const signals = input.staticSignals as Record<string, unknown> | undefined;
  const fromHost =
    signals && typeof signals['capability-surface'] === 'number'
      ? Number(signals['capability-surface'])
      : null;
  const volume =
    fromHost != null && Number.isFinite(fromHost) ? clamp01(fromHost) : 0;
  const magnitude = Math.round(volume * 8);
  return {
    measurementKind: 'capability-surface',
    magnitude,
    volume,
    rationale:
      volume > 0
        ? `Capability surface from material identity / static signals: ${volume}.`
        : `Capability surface: insufficient evidence (host material identity preferred).`,
    status: volume > 0 ? 'measured' : 'insufficient_evidence',
    policyRole: 'weighted',
  };
}

export default measureAbsoluteCapabilitySurface;
