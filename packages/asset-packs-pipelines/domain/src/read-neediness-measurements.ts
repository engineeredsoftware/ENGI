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
 *
 * When BITCODE_ASSET_PACK_REAL_INFERENCE is on, volumes may come from
 * NeedinessesMeasureAgent; otherwise deterministic proxies (still real numbers).
 */

import {
  ASSET_PACK_NEEDINESSES_CATALOG,
  computeNeedFitVolume,
  NEED_FIT_COMPOSITE_KIND,
  factoryNeedinessesMeasureAgent,
  type AssetPackNeedinessSpec,
} from '@bitcode/generic-measurements-needinesses';
import type { MeasurementSpec } from '@bitcode/measurement-generics';
import { isAssetPackRealInferenceEnabled } from './runtime-inference-policy';

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
  if (base.endsWith('fit')) {
    return base.endsWith(FIT_SUFFIX)
      ? base
      : `${base.replace(/fit$/, '')}fit`.replace(/-+/g, '-');
  }
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

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function buildSpecs(
  catalog: AssetPackNeedinessSpec[],
  dynamicKinds: string[],
): { specs: MeasurementSpec[]; weightByKind: Map<string, number>; labelByKind: Map<string, string> } {
  const weightByKind = new Map<string, number>();
  const labelByKind = new Map<string, string>();
  const specs: MeasurementSpec[] = [];

  for (const spec of catalog) {
    const kind = assertNeedinessKindSuffix(spec.measurementKind)
      ? spec.measurementKind
      : slugifyNeedinessKind(spec.measurementKind);
    weightByKind.set(kind, spec.weight);
    labelByKind.set(kind, spec.label);
    specs.push({
      measurementKind: kind,
      label: spec.label,
      unit: spec.unit,
      guidance: spec.guidance,
      hasMagnitude: true,
    });
  }

  const uniqueDynamic = [...new Set(dynamicKinds.map(slugifyNeedinessKind).filter(assertNeedinessKindSuffix))].filter(
    (k) => !weightByKind.has(k),
  );
  const dynWeight = uniqueDynamic.length > 0 ? 1 / uniqueDynamic.length : 0;
  for (const kind of uniqueDynamic) {
    weightByKind.set(kind, dynWeight);
    const label = kind.replace(/-fit$/, '').replace(/-/g, ' ');
    labelByKind.set(kind, label);
    specs.push({
      measurementKind: kind,
      label,
      unit: 'estimate',
      guidance: `Dynamic Need-relative fit dimension: ${kind}`,
      hasMagnitude: true,
    });
  }

  return { specs, weightByKind, labelByKind };
}

/** Deterministic neediness volumes (proxy when agent unavailable). */
export function measureReadNeedinessesDeterministic(input: {
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
  const { specs, weightByKind, labelByKind } = buildSpecs(catalog, input.dynamicKinds || []);

  return specs.map((spec, index) => {
    const wobble = ((hash(seed + spec.measurementKind) % 20) - 10) / 100;
    const volume = clamp01(confidence * 0.85 + 0.1 + wobble + index * 0.01);
    return {
      measurementKind: spec.measurementKind,
      label: labelByKind.get(spec.measurementKind) || spec.label,
      weight: weightByKind.get(spec.measurementKind) ?? 0,
      volume,
      magnitude: volume,
      unit: String(spec.unit),
      category: 'neediness' as const,
      rationale: `Need-relative ${spec.measurementKind} (deterministic measure path).`,
    };
  });
}

/**
 * Prefer NeedinessesMeasureAgent when real inference is enabled; always fall back
 * to deterministic proxies so synthesis never invents volumes without a path.
 */
export async function measureReadNeedinesses(input: {
  title: string;
  summary: string;
  confidence?: number;
  needSummary?: string;
  dynamicKinds?: string[];
  catalog?: AssetPackNeedinessSpec[];
  execution?: any;
}): Promise<NeedinessReading[]> {
  const deterministic = measureReadNeedinessesDeterministic(input);
  if (!isAssetPackRealInferenceEnabled()) return deterministic;

  try {
    const catalog = input.catalog ?? ASSET_PACK_NEEDINESSES_CATALOG;
    const { specs, weightByKind, labelByKind } = buildSpecs(catalog, input.dynamicKinds || []);
    if (specs.length === 0) return deterministic;

    const agent = factoryNeedinessesMeasureAgent({
      name: 'SynthesizeReadAssetPacksNeedinessesMeasureAgent',
      subject: 'a synthesized source-safe AssetPack under a reader Need',
      measurements: specs,
    });

    const raw = await agent(
      {
        artifact: {
          title: input.title,
          summary: input.summary,
          confidence: input.confidence,
        },
        need: {
          summary: input.needSummary || '',
        },
        measurementsRequested: specs.map((s) => s.measurementKind),
      },
      input.execution,
    );
    const result = (raw as any)?.finalOutput ?? (raw as any)?.output ?? raw;
    const readings = Array.isArray(result?.measurements) ? result.measurements : [];
    if (readings.length === 0) return deterministic;

    const byKind = new Map<string, { volume?: number; magnitude?: number; rationale?: string }>();
    for (const r of readings) {
      if (r && typeof r.measurementKind === 'string') {
        byKind.set(r.measurementKind, r);
      }
    }

    return deterministic.map((row) => {
      const hit = byKind.get(row.measurementKind);
      if (!hit || typeof hit.volume !== 'number' || !Number.isFinite(hit.volume)) return row;
      const volume = clamp01(hit.volume);
      const magnitude =
        typeof hit.magnitude === 'number' && Number.isFinite(hit.magnitude)
          ? hit.magnitude
          : volume;
      return {
        ...row,
        volume,
        magnitude,
        weight: weightByKind.get(row.measurementKind) ?? row.weight,
        label: labelByKind.get(row.measurementKind) || row.label,
        rationale:
          typeof hit.rationale === 'string' && hit.rationale.length > 0
            ? hit.rationale
            : row.rationale,
      };
    });
  } catch {
    return deterministic;
  }
}
