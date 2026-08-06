/**
 * Static **reading** needinesses catalogue (hybrid law).
 *
 * Needinesses are a measurement KIND (alongside absolutes). They are
 * reader/Need-relative and used only during **reading** (not deposit).
 *
 * Hybrid model:
 * - **Static catalogue** rows (e.g. language-fit) are fixed dimensions with weights.
 * - **Dynamic** rows may be inferred per Read Request (additional dimensions).
 * - **need-fit** is NOT measured as a raw catalogue row: it is the **weighted mean**
 *   of all needinesses readings for that pack under the active Need.
 *
 * Full NeedinessesMeasureAgent product wiring is Gate 4 / synthesize-reads.
 */

export type NeedinessPropertyClass = 'static-catalog' | 'dynamic-inferred' | 'composite';

export interface AssetPackNeedinessSpec {
  measurementKind: string;
  label: string;
  weight: number;
  unit: 'estimate' | 'normalized';
  propertyClass: NeedinessPropertyClass;
  guidance: string;
}

/**
 * Static reading needinesses catalogue (weights sum to 1 among static rows).
 * Dynamic inferred rows (when present) re-normalize weights with static rows
 * when computing need-fit.
 */
/**
 * Static reading needinesses — every kind MUST end with `-fit` (product law).
 */
export const ASSET_PACK_NEEDINESSES_CATALOG: AssetPackNeedinessSpec[] = [
  {
    measurementKind: 'language-fit',
    label: 'Language fit',
    weight: 0.35,
    unit: 'estimate',
    propertyClass: 'static-catalog',
    guidance:
      'How well the AssetPack’s languages/stack match the Need’s target languages and runtime.',
  },
  {
    measurementKind: 'domain-fit',
    label: 'Domain fit',
    weight: 0.35,
    unit: 'estimate',
    propertyClass: 'static-catalog',
    guidance:
      'How well the pack’s knowledge domain matches the Need’s problem domain (not absolute size).',
  },
  {
    measurementKind: 'interface-fit',
    label: 'Interface fit',
    weight: 0.3,
    unit: 'estimate',
    propertyClass: 'static-catalog',
    guidance:
      'How well pack surfaces/APIs/integration shape match what the Need requires to consume.',
  },
];

/** Composite kind id — derived only; never a raw measure-agent target. */
export const NEED_FIT_COMPOSITE_KIND = 'need-fit' as const;

export type NeedinessReadingLike = {
  measurementKind: string;
  volume: number;
  weight?: number;
};

/**
 * need-fit = weighted mean of needinesses volumes.
 * Uses reading.weight when present; else catalogue weight; else equal weight.
 * Empty set → 0.
 */
export function computeNeedFitVolume(
  needinesses: NeedinessReadingLike[],
  catalog: AssetPackNeedinessSpec[] = ASSET_PACK_NEEDINESSES_CATALOG,
): number {
  if (!Array.isArray(needinesses) || needinesses.length === 0) return 0;
  const weightByKind = new Map(catalog.map((s) => [s.measurementKind, s.weight]));
  let sumW = 0;
  let sum = 0;
  for (const row of needinesses) {
    if (!row || typeof row.volume !== 'number' || !Number.isFinite(row.volume)) continue;
    const w =
      typeof row.weight === 'number' && Number.isFinite(row.weight) && row.weight > 0
        ? row.weight
        : weightByKind.get(row.measurementKind) ?? 1;
    const v = Math.max(0, Math.min(1, row.volume));
    sumW += w;
    sum += w * v;
  }
  if (sumW <= 0) return 0;
  return Math.max(0, Math.min(1, sum / sumW));
}
