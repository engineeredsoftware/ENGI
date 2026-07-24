/**
 * Expand any partial absolute measurement bag to commercial law: all 46 kinds.
 *
 * Used by deposit review cards, Exchange detail, admission projection, and
 * activity normalization so UX never shows the legacy 8/11 subset alone.
 */

import {
  DATA_PACK_ABSOLUTES_CATALOG,
  DATA_PACK_ABSOLUTE_KINDS,
} from '@bitcode/generic-measurements-domain-data-pack-absolutes-catalog';
import { descriptorForAbsoluteKind } from './exchange-measurement-descriptors';

export type AbsoluteMeasurementLike = {
  measurementKind?: string;
  kind?: string;
  id?: string;
  label?: string;
  weight?: number;
  volume?: number;
  magnitude?: number | null;
  unit?: string | null;
  category?: string;
  descriptor?: string | null;
  evidenceRoot?: string | null;
  [key: string]: unknown;
};

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return Number(value.toFixed(4));
}

/** Legacy / display aliases → catalogue measurementKind. */
const KIND_ALIASES: Record<string, string> = {
  functions: 'function-count',
  function: 'function-count',
  types: 'type-count',
  type: 'type-count',
  files: 'file-span',
  'file-span': 'file-span',
  symbols: 'symbolic-richness',
  modules: 'modularity',
  languages: 'lang-span',
  language: 'lang-span',
  tests: 'test-surface',
  exports: 'api-surface',
  correctness: 'correctness-estimate',
  objectives: 'objectives-fidelity',
  computational: 'computational-usage',
};

function kindOf(row: AbsoluteMeasurementLike): string {
  const raw = String(row.measurementKind || row.kind || row.id || '')
    .trim()
    .toLowerCase()
    .replace(/^absolute:/, '');
  return KIND_ALIASES[raw] || raw;
}

/**
 * Expand readings to one row per catalogue kind (SSOT order).
 * Missing kinds → volume 0, magnitude 0, catalogue weight/label/unit.
 * Prior non-zero volumes preserved; catalogue weight always wins over legacy weights.
 */
export function expandAbsoluteMeasurementsToFullCatalog<T extends AbsoluteMeasurementLike>(
  partial: T[] | null | undefined,
): Array<
  T & {
    measurementKind: string;
    kind: string;
    label: string;
    weight: number;
    volume: number;
    magnitude: number;
    unit: string;
    category: 'absolute';
    descriptor: string | null;
  }
> {
  const byKind = new Map<string, AbsoluteMeasurementLike>();
  for (const row of partial || []) {
    const kind = kindOf(row);
    if (!kind) continue;
    // Skip non-absolute policy rows (source-coverage, demand-alignment, …).
    if (
      kind === 'source-coverage' ||
      kind === 'demand-alignment' ||
      kind === 'reuse-likelihood' ||
      kind === 'need-fit'
    ) {
      continue;
    }
    const prev = byKind.get(kind);
    if (!prev) {
      byKind.set(kind, row);
      continue;
    }
    const prevVol = Number(prev.volume);
    const nextVol = Number(row.volume);
    if (Number.isFinite(nextVol) && (!Number.isFinite(prevVol) || nextVol >= prevVol)) {
      byKind.set(kind, row);
    }
  }

  return DATA_PACK_ABSOLUTES_CATALOG.map((spec) => {
    const prior = byKind.get(spec.measurementKind);
    const catalog = descriptorForAbsoluteKind(spec.measurementKind);
    const volume = clamp01(Number(prior?.volume));
    let magnitude: number;
    if (typeof prior?.magnitude === 'number' && Number.isFinite(prior.magnitude)) {
      magnitude = prior.magnitude;
    } else {
      magnitude = volume;
    }
    const explicitDescriptor =
      typeof prior?.descriptor === 'string' && prior.descriptor.trim()
        ? prior.descriptor.trim()
        : null;

    return {
      ...(prior || {}),
      measurementKind: spec.measurementKind,
      kind: spec.measurementKind,
      id: (prior?.id as string) || `absolute:${spec.measurementKind}`,
      label: (typeof prior?.label === 'string' && prior.label.trim()) || catalog?.label || spec.label,
      weight: spec.weight,
      volume,
      magnitude,
      unit: (typeof prior?.unit === 'string' && prior.unit) || catalog?.unit || spec.unit || 'normalized',
      category: 'absolute' as const,
      descriptor: explicitDescriptor || catalog?.descriptor || null,
      evidenceRoot:
        typeof prior?.evidenceRoot === 'string' ? prior.evidenceRoot : null,
    } as T & {
      measurementKind: string;
      kind: string;
      label: string;
      weight: number;
      volume: number;
      magnitude: number;
      unit: string;
      category: 'absolute';
      descriptor: string | null;
    };
  });
}

/** True when readings already cover the full commercial catalogue. */
export function hasFullAbsoluteCatalog(
  partial: AbsoluteMeasurementLike[] | null | undefined,
): boolean {
  if (!Array.isArray(partial) || partial.length < DATA_PACK_ABSOLUTE_KINDS.length) {
    return false;
  }
  const kinds = new Set(partial.map(kindOf).filter(Boolean));
  return DATA_PACK_ABSOLUTE_KINDS.every((k) => kinds.has(k));
}

export { DATA_PACK_ABSOLUTE_KINDS, DATA_PACK_ABSOLUTES_CATALOG };
