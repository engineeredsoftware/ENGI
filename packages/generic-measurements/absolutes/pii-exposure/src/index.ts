/**
 * Bare absolute measure: `pii-exposure` of a synthesized **DataPack**.
 * Family: hygiene. Policy: gate. Class: hygiene.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { emptyInsufficient } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'pii-exposure' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'PII exposure' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'gate' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'hygiene' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'gate' as const;

const PII = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, // email
  /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/, // phone
  /\b\d{3}-\d{2}-\d{4}\b/, // SSN-like
  /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\b/, // card-like
  /\b(?:ssn|social.?security|date.?of.?birth|passport.?number)\b/i,
];

export function measureAbsolutePiiExposure(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  const sources = input.sources || [];
  if (!sources.length) {
    // Honesty: do not claim gate-clean (volume 1) without bodies to scan.
    return {
      measurementKind: 'pii-exposure',
      magnitude: 0,
      volume: 0,
      rationale: 'no sources; pii-exposure not run (insufficient evidence)',
      status: 'insufficient_evidence',
      policyRole: 'gate',
    };
  }
  let hits = 0;
  for (const f of sources) {
    const c = f.content || '';
    for (const re of PII) if (re.test(c)) hits += 1;
  }
  const clean = hits === 0;
  return {
    measurementKind: 'pii-exposure',
    magnitude: hits,
    volume: clean ? 1 : 0,
    rationale: clean ? 'no PII-like patterns' : 'PII-like patterns present',
    status: 'estimated',
    policyRole: 'gate',
  };
}

export default measureAbsolutePiiExposure;
