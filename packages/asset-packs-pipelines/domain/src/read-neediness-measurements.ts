/**
 * Read needinesses measurement law helpers.
 *
 * All neediness measurement kinds are "fits" and MUST be suffixed `-fit`
 * (e.g. language-fit, domain-fit, needs-session-refresh-fit).
 *
 * Hybrid:
 *   - Static catalogue (language-fit, domain-fit, interface-fit)
 *   - Dynamic kinds planned from Need comprehension
 *   - need-fit composite = weighted mean of all needinesses (not a raw row target)
 */

import {
  ASSET_PACK_NEEDINESSES_CATALOG,
  computeNeedFitVolume,
  NEED_FIT_COMPOSITE_KIND,
  type AssetPackNeedinessSpec,
} from '@bitcode/generic-measurements-needinesses';

export { ASSET_PACK_NEEDINESSES_CATALOG, computeNeedFitVolume, NEED_FIT_COMPOSITE_KIND };

const FIT_SUFFIX = '-fit';

/** Force a kind string into *-fit form (lowercase slug). */
export function slugifyNeedinessKind(raw: string): string {
  const base = String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  if (!base) return 'needs-unspecified-fit';
  if (base.endsWith(FIT_SUFFIX)) return base;
  if (base.endsWith('fit')) return base.endsWith(FIT_SUFFIX) ? base : `${base.replace(/fit$/, '')}fit`.replace(/-+/g, '-');
  return `${base}${FIT_SUFFIX}`;
}

export function assertNeedinessKindSuffix(kind: string): boolean {
  return typeof kind === 'string' && kind.endsWith(FIT_SUFFIX) && kind.length > FIT_SUFFIX.length;
}

export type NeedinessReading = {
  measurementKind: string;
  label: string;
  weight: number;
  volume: number;
  magnitude: number;
  unit: string;
  category: 'neediness';
  rationale?: string;
};

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

/**
 * Build static + dynamic neediness readings for a pack under a Need.
 * Volumes are deterministic proxies from confidence + kind hash until the
 * full NeedinessesMeasureAgent PTRR is wired (still real numbers, not LLM invent).
 */
export function measureReadNeedinesses(input: {
  title: string;
  summary: string;
  confidence?: number;
  needSummary?: string;
  dynamicKinds?: string[];
  catalog?: AssetPackNeedinessSpec[];
}): NeedinessReading[] {
  const catalog = input.catalog ?? ASSET_PACK_NEEDINESSES_CATALOG;
  const confidence = clamp01(input.confidence ?? 0.65);
  const seed = `${input.title}|${input.summary}|${input.needSummary || ''}`;

  const staticRows: NeedinessReading[] = catalog.map((spec, index) => {
    const wobble = ((hash(seed + spec.measurementKind) % 20) - 10) / 100;
    const volume = clamp01(confidence * 0.85 + 0.1 + wobble + index * 0.01);
    return {
      measurementKind: assertNeedinessKindSuffix(spec.measurementKind)
        ? spec.measurementKind
        : slugifyNeedinessKind(spec.measurementKind),
      label: spec.label,
      weight: spec.weight,
      volume,
      magnitude: volume,
      unit: spec.unit,
      category: 'neediness',
      rationale: `Static catalogue ${spec.measurementKind} under Need (deterministic proxy).`,
    };
  });

  const dynamicKinds = (input.dynamicKinds || [])
    .map(slugifyNeedinessKind)
    .filter(assertNeedinessKindSuffix);
  const uniqueDynamic = [...new Set(dynamicKinds)].filter(
    (k) => !staticRows.some((s) => s.measurementKind === k),
  );
  const dynWeight = uniqueDynamic.length > 0 ? 1 / uniqueDynamic.length : 0;
  const dynamicRows: NeedinessReading[] = uniqueDynamic.map((kind) => {
    const wobble = ((hash(seed + kind) % 25) - 12) / 100;
    const volume = clamp01(confidence * 0.9 + wobble);
    return {
      measurementKind: kind,
      label: kind.replace(/-fit$/, '').replace(/-/g, ' '),
      weight: dynWeight,
      volume,
      magnitude: volume,
      unit: 'estimate',
      category: 'neediness',
      rationale: `Dynamic Need-relative ${kind} (deterministic proxy until NeedinessesMeasureAgent).`,
    };
  });

  return [...staticRows, ...dynamicRows];
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
