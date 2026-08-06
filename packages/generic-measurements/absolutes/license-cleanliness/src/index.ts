/**
 * Bare absolute measure: `license-cleanliness` of a synthesized **DataPack**.
 * Family: hygiene. Policy: gate.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'license-cleanliness' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'License cleanliness' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'gate' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'hygiene' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'gate' as const;

const RESTRICTIVE = /\b(GPL-3|AGPL|SSPL|Commons Clause|BUSL|Prosperity)\b/i;
const PERMISSIVE = /\b(MIT|Apache-2\.0|BSD-2-Clause|BSD-3-Clause|ISC|0BSD|Unlicense)\b/i;

export function measureAbsoluteLicenseCleanliness(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  const fromSignals = Number(input.staticSignals?.['license-cleanliness']);
  if (Number.isFinite(fromSignals) && fromSignals >= 0) {
    const volume = clamp01(fromSignals);
    return {
      measurementKind: 'license-cleanliness',
      magnitude: volume,
      volume,
      rationale: 'staticSignals',
      status: 'measured',
      policyRole: 'gate',
    };
  }
  const sources = input.sources || [];
  const paths = [
    ...(input.dataPack.coveredSourcePaths || []),
    ...((input.dataPack.fileChanges || []).map((c) => c.path)),
  ];
  let restrictive = 0;
  let permissive = 0;
  for (const f of sources) {
    const c = f.content || '';
    if (RESTRICTIVE.test(c)) restrictive += 1;
    if (PERMISSIVE.test(c)) permissive += 1;
  }
  for (const p of paths) {
    if (/LICENSE|COPYING|package\.json/i.test(String(p))) {
      /* path presence only; body preferred */
    }
  }
  if (!sources.length) return emptyInsufficient('license-cleanliness');
  const clean = restrictive === 0;
  return {
    measurementKind: 'license-cleanliness',
    magnitude: restrictive,
    volume: clean ? 1 : 0,
    rationale: clean
      ? permissive
        ? 'permissive license markers only'
        : 'no restrictive license markers found'
      : 'restrictive license markers present',
    status: 'estimated',
    policyRole: 'gate',
  };
}

export default measureAbsoluteLicenseCleanliness;
