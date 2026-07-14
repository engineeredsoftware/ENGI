/**
 * @bitcode/generic-measurements-needinesses
 *
 * Needinesses measurement KIND base (hierarchy: Needinesses + MeasureAgent).
 * Used only on **reading** paths. Deposit AssetPacks carry needinesses: [].
 *
 * Hybrid: static catalogue + dynamic inferred dimensions; need-fit = weighted mean.
 */

import type { MeasurementCategory } from '@bitcode/measurement-generics';

export const NEEDINESSES_MEASUREMENT_CATEGORY: MeasurementCategory = 'neediness';

export const NEEDINESSES_FRAMING =
  'You measure NEEDINESSES — READER-RELATIVE properties of digital material: how ' +
  'well the artifact fits a stated Need, demand, or buyer context. Needinesses are ' +
  'NOT absolute/intrinsic sizes; they depend on the reader and the Need. Do not ' +
  'confuse neediness with absolute quantity or quality of the artifact alone. ' +
  'need-fit is a composite (weighted mean of needinesses), not a raw measurement target.';

export {
  factoryNeedinessesMeasureAgent,
  type NeedinessesMeasureAgent,
  type NeedinessesMeasureAgentConfig,
} from './needinesses-measure-agent';

export {
  ASSET_PACK_NEEDINESSES_CATALOG,
  NEED_FIT_COMPOSITE_KIND,
  computeNeedFitVolume,
  type AssetPackNeedinessSpec,
  type NeedinessPropertyClass,
  type NeedinessReadingLike,
} from './needinesses-catalog';
