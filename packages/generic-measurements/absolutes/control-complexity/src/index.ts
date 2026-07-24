/**
 * Bare absolute measure: `control-complexity` of a synthesized **DataPack**.
 * Family: structure. Policy: target. Class: quantity|hygiene|verification|provenance|value as catalog.
 */
import type { AbsoluteMeasureResult, DataPackAbsoluteMeasureInput } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import { clamp01, emptyInsufficient } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const ABSOLUTE_MEASUREMENT_KIND = 'control-complexity' as const;
export const ABSOLUTE_MEASUREMENT_LABEL = 'Control complexity' as const;
export const ABSOLUTE_MEASUREMENT_UNIT = 'complexity' as const;
export const ABSOLUTE_MEASUREMENT_FAMILY = 'structure' as const;
export const ABSOLUTE_MEASUREMENT_POLICY_ROLE = 'target' as const;

export function measureAbsoluteControlComplexity(input: DataPackAbsoluteMeasureInput): AbsoluteMeasureResult {
  const fromSignals = Number(input.staticSignals?.['control-complexity']);
  if (Number.isFinite(fromSignals) && fromSignals >= 0) {
    const magnitude = Math.round(fromSignals);
    return {
      measurementKind: 'control-complexity',
      magnitude,
      volume: clamp01(magnitude / 60),
      rationale: 'staticSignals',
      status: 'measured',
      policyRole: 'target',
    };
  }
  const sources = input.sources || [];
  if (!sources.length) return emptyInsufficient('control-complexity');
  // Cognitive-ish: branch keywords weighted lightly.
  const re = /\b(if|else|for|while|switch|case|catch|\?\.|\?\?|&&|\|\|)\b/g;
  let magnitude = 0;
  for (const f of sources) magnitude += ((f.content || '').match(re) || []).length;
  magnitude = Math.round(magnitude);
  return {
    measurementKind: 'control-complexity',
    magnitude,
    volume: clamp01(magnitude / 60),
    rationale: 'heuristic control-flow keyword density',
    status: 'estimated',
    policyRole: 'target',
  };
}

export default measureAbsoluteControlComplexity;
