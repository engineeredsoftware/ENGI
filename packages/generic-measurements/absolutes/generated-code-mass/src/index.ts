/**
 * Bare absolute measure: `generated-code-mass` of a synthesized **DataPack**.
 * Family: hygiene. Policy: penalty. Material-identity companion.
 * Prefer host material-identity volumes when available (pipeline merge).
 */
import type {
  AbsoluteMeasureResult,
  DataPackAbsoluteMeasureInput,
} from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01 } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'generated-code-mass' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Generated-code mass' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'ratio' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'hygiene' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'penalty' as const;

/** Path/text heuristic fallback when host material identity is not attached. */
export function measureAbsoluteGeneratedCodeMass(
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
    signals && typeof signals['generated-code-mass'] === 'number'
      ? Number(signals['generated-code-mass'])
      : null;
  const volume =
    fromHost != null && Number.isFinite(fromHost) ? clamp01(fromHost) : 0;
  const magnitude = Math.round(volume * 1);
  return {
    measurementKind: 'generated-code-mass',
    magnitude,
    volume,
    rationale:
      volume > 0
        ? `Generated-code mass from material identity / static signals: ${volume}.`
        : `Generated-code mass: insufficient evidence (host material identity preferred).`,
    status: volume > 0 ? 'measured' : 'insufficient_evidence',
    policyRole: 'penalty',
  };
}

export default measureAbsoluteGeneratedCodeMass;
