/**
 * Bare absolute measure: `type-safety-pressure` of a synthesized **DataPack**.
 * Family: verification. Policy: weighted. Material-identity companion.
 * Prefer host material-identity volumes when available (pipeline merge).
 */
import type {
  AbsoluteMeasureResult,
  DataPackAbsoluteMeasureInput,
} from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01 } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'type-safety-pressure' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Type-safety pressure' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'ratio' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'verification' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'weighted' as const;

/** Path/text heuristic fallback when host material identity is not attached. */
export function measureAbsoluteTypeSafetyPressure(
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
    signals && typeof signals['type-safety-pressure'] === 'number'
      ? Number(signals['type-safety-pressure'])
      : null;
  const volume =
    fromHost != null && Number.isFinite(fromHost) ? clamp01(fromHost) : 0;
  const magnitude = Math.round(volume * 1);
  return {
    measurementKind: 'type-safety-pressure',
    magnitude,
    volume,
    rationale:
      volume > 0
        ? `Type-safety pressure from material identity / static signals: ${volume}.`
        : `Type-safety pressure: insufficient evidence (host material identity preferred).`,
    status: volume > 0 ? 'measured' : 'insufficient_evidence',
    policyRole: 'weighted',
  };
}

export default measureAbsoluteTypeSafetyPressure;
