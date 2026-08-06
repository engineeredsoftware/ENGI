/**
 * Bare absolute measure: `external-service-coupling` of a synthesized **DataPack**.
 * Family: structure. Policy: weighted. Material-identity companion.
 * Prefer host material-identity volumes when available (pipeline merge).
 */
import type {
  AbsoluteMeasureResult,
  DataPackAbsoluteMeasureInput,
} from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01 } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'external-service-coupling' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'External service coupling' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'services' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'structure' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'weighted' as const;

/** Path/text heuristic fallback when host material identity is not attached. */
export function measureAbsoluteExternalServiceCoupling(
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
    signals && typeof signals['external-service-coupling'] === 'number'
      ? Number(signals['external-service-coupling'])
      : null;
  const volume =
    fromHost != null && Number.isFinite(fromHost) ? clamp01(fromHost) : 0;
  const magnitude = Math.round(volume * 6);
  return {
    measurementKind: 'external-service-coupling',
    magnitude,
    volume,
    rationale:
      volume > 0
        ? `External service coupling from material identity / static signals: ${volume}.`
        : `External service coupling: insufficient evidence (host material identity preferred).`,
    status: volume > 0 ? 'measured' : 'insufficient_evidence',
    policyRole: 'weighted',
  };
}

export default measureAbsoluteExternalServiceCoupling;
