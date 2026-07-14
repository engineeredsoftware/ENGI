/**
 * NeedinessesMeasureAgent — reader/Need-relative Measurement base.
 *
 * Hierarchy: Needinesses + MeasureAgent (+ Measurement primitives).
 * Product: read synthesis attaches measurements.needinesses (*-fit kinds).
 *
 * Needinesses depend on a stated Need / buyer context — never absolute sizes.
 * Every product neediness kind MUST end with the suffix `-fit`.
 * need-fit composite is NOT measured here (weighted mean of needinesses rows).
 */

import {
  factoryMeasureAgent,
  type MeasureAgent,
  type MeasurementSpec,
} from '@bitcode/generic-measurements-measure-agent';
import type { MeasurementCategory } from '@bitcode/measurement-generics';

const NEEDINESSES_MEASUREMENT_CATEGORY: MeasurementCategory = 'neediness';

const NEEDINESSES_FRAMING =
  'You measure NEEDINESSES — READER-RELATIVE properties of digital material: how ' +
  'well the artifact fits a stated Need, demand, or buyer context. Needinesses are ' +
  'NOT absolute/intrinsic sizes; they depend on the reader and the Need. Do not ' +
  'confuse neediness with absolute quantity or quality of the artifact alone. ' +
  'Every measurementKind ends with -fit. need-fit is a composite (weighted mean), ' +
  'not a raw measurement target.';

export interface NeedinessesMeasureAgentConfig {
  name: string;
  description?: string;
  /** What is being measured, e.g. "a synthesized AssetPack under a reader Need". */
  subject: string;
  /** Static + dynamic *-fit specs to measure. */
  measurements: MeasurementSpec[];
  plan?: { chunkThreshold?: number };
  try?: { chunkThreshold?: number };
  refine?: { maxAttempts?: number };
  retry?: { maxAttempts?: number };
}

export type NeedinessesMeasureAgent = MeasureAgent;

/**
 * factoryNeedinessesMeasureAgent — bases factoryMeasureAgent with needinesses framing.
 */
export function factoryNeedinessesMeasureAgent(
  config: NeedinessesMeasureAgentConfig,
): NeedinessesMeasureAgent {
  for (const spec of config.measurements || []) {
    if (!String(spec.measurementKind || '').endsWith('-fit')) {
      throw new Error(
        `NeedinessesMeasureAgent requires measurementKind to end with "-fit" (got ${spec.measurementKind}).`,
      );
    }
  }
  return factoryMeasureAgent({
    name: config.name,
    description: config.description,
    subject: config.subject,
    category: NEEDINESSES_MEASUREMENT_CATEGORY,
    categoryFraming: NEEDINESSES_FRAMING,
    measurements: config.measurements,
    plan: config.plan,
    try: config.try,
    refine: config.refine,
    retry: config.retry,
  });
}
