/**
 * @bitcode/generic-measurements-needinesses
 *
 * NeedinessesMeasureAgent base (hierarchy: Needinesses + MeasureAgent).
 * Gate 4: reader/Need-relative measurements. Surface reserved so product
 * settle/synthesis neediness can extend a real base package path.
 */

import type { MeasurementCategory } from '@bitcode/measurement-generics';

export const NEEDINESSES_MEASUREMENT_CATEGORY: MeasurementCategory = 'neediness';

export const NEEDINESSES_FRAMING =
  'You measure NEEDINESSES — READER-RELATIVE properties of digital material: how ' +
  'well the artifact fits a stated Need, demand, or buyer context. Needinesses are ' +
  'NOT absolute/intrinsic sizes; they depend on the reader and the Need. Do not ' +
  'confuse neediness with absolute quantity or quality of the artifact alone.';

/**
 * Placeholder for factoryNeedinessesMeasureAgent (Gate 4).
 * Product code must not invent a parallel neediness base outside this package.
 */
export type NeedinessesMeasureAgentConfig = {
  name: string;
  subject: string;
  // measurements: MeasurementSpec[] — wired when Gate 4 lands
};
