/**
 * Bare absolute measure: `security-cleanliness` of a synthesized **DataPack**.
 * Family: hygiene. Policy: penalty. Heuristic SAST-like patterns (not full Semgrep).
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'security-cleanliness' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Security cleanliness' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'ratio' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'hygiene' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'penalty' as const;

const RISKY = [
  /\beval\s*\(/i,
  /\bnew\s+Function\s*\(/i,
  /innerHTML\s*=/i,
  /dangerouslySetInnerHTML/i,
  /child_process|execSync|spawnSync/i,
  /\bmd5\b|\bsha1\b/i,
  /disable.*csrf|csrf.*=\s*false/i,
  /verify\s*:\s*false|rejectUnauthorized\s*:\s*false/i,
];

export function measureAbsoluteSecurityCleanliness(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  const fromSignals = Number(input.staticSignals?.['security-cleanliness']);
  if (Number.isFinite(fromSignals) && fromSignals >= 0) {
    const volume = clamp01(fromSignals);
    return {
      measurementKind: 'security-cleanliness',
      magnitude: volume,
      volume,
      rationale: 'staticSignals',
      status: 'measured',
      policyRole: 'penalty',
    };
  }
  const sources = input.sources || [];
  if (!sources.length) return emptyInsufficient('security-cleanliness');
  let findings = 0;
  for (const f of sources) {
    const c = f.content || '';
    for (const re of RISKY) if (re.test(c)) findings += 1;
  }
  const volume = clamp01(1 - findings / 8);
  return {
    measurementKind: 'security-cleanliness',
    magnitude: findings,
    volume,
    rationale: findings === 0 ? 'no common risky patterns' : `${findings} risky pattern classes`,
    status: 'estimated',
    policyRole: 'penalty',
  };
}

export default measureAbsoluteSecurityCleanliness;
