/**
 * Bare absolute measure: `pii-exposure` of a synthesized **DataPack**.
 * Family: hygiene. Policy: gate. Class: hygiene.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient, notImplemented } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'pii-exposure' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'PII exposure' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'gate' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'hygiene' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'gate' as const;

export function measureAbsolutePiiExposure(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  const sources = input.sources || [];
  const re = /(api[_-]?key|secret|password|BEGIN (RSA |OPENSSH )?PRIVATE KEY)/i;
  let hits = 0; for (const f of sources) if (re.test(f.content||'')) hits++;
  const clean = hits === 0;
  return { measurementKind: 'pii-exposure', magnitude: hits, volume: clean?1:0,
    rationale: clean?'no secret-like patterns':'secret-like patterns present', status: sources.length?'estimated':'insufficient_evidence', policyRole: 'gate' };
}

export default measureAbsolutePiiExposure;
