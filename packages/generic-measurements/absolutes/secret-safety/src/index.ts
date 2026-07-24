/**
 * Bare absolute measure: `secret-safety` of a synthesized **DataPack**.
 * Family: hygiene. Policy: gate. Class: hygiene.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'secret-safety' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Secret safety' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'gate' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'hygiene' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'gate' as const;

const SECRETS = [
  /api[_-]?key\s*[:=]\s*['"][^'"]{8,}/i,
  /secret\s*[:=]\s*['"][^'"]{8,}/i,
  /password\s*[:=]\s*['"][^'"]+/i,
  /BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY/,
  /AKIA[0-9A-Z]{16}/,
  /ghp_[A-Za-z0-9]{20,}/,
  /xox[baprs]-[A-Za-z0-9-]{10,}/,
  /sk-[A-Za-z0-9]{20,}/,
];

export function measureAbsoluteSecretSafety(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  const sources = input.sources || [];
  if (!sources.length) {
    return {
      measurementKind: 'secret-safety',
      magnitude: 0,
      volume: 1,
      rationale: 'no sources; no secret evidence',
      status: 'insufficient_evidence',
      policyRole: 'gate',
    };
  }
  let hits = 0;
  for (const f of sources) {
    const c = f.content || '';
    for (const re of SECRETS) if (re.test(c)) hits += 1;
  }
  const clean = hits === 0;
  return {
    measurementKind: 'secret-safety',
    magnitude: hits,
    volume: clean ? 1 : 0,
    rationale: clean ? 'no secret-like patterns' : 'secret-like patterns present',
    status: 'estimated',
    policyRole: 'gate',
  };
}

export default measureAbsoluteSecretSafety;
