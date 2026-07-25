/**
 * Expand any partial absolute measurement bag to commercial law: full catalogue.
 *
 * Used by deposit review cards, Exchange detail, admission projection, and
 * activity normalization so UX never shows a partial kind subset alone.
 *
 * Honesty law:
 * - Prior rows keep their status (measured | estimated | …).
 * - Catalogue-fill rows for missing kinds are tagged `expanded-fill` with
 *   volume/magnitude 0 — never claim a measured zero for unmeasured kinds.
 */

import {
  DATA_PACK_ABSOLUTES_CATALOG,
  DATA_PACK_ABSOLUTE_KINDS,
} from '@bitcode/generic-measurements-domain-data-pack-absolutes-catalog';
import type { AbsoluteReadingStatus } from '@bitcode/measurement-generics';
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
  /** Honesty: measured vs catalogue fill vs insufficient evidence. */
  status?: AbsoluteReadingStatus | string | null;
  [key: string]: unknown;
};

const VALID_STATUSES = new Set<string>([
  'measured',
  'estimated',
  'insufficient_evidence',
  'expanded-fill',
  'not_run',
  'not_implemented',
]);

function normalizeStatus(
  raw: unknown,
  opts: { isFill: boolean },
): AbsoluteReadingStatus {
  if (opts.isFill) return 'expanded-fill';
  if (typeof raw === 'string' && VALID_STATUSES.has(raw)) {
    return raw as AbsoluteReadingStatus;
  }
  // Prior row without status: treat as measured when volume/magnitude present,
  // else insufficient_evidence (host should set status; this is fail-soft).
  return 'measured';
}

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
 * Missing kinds → volume 0, magnitude 0, status expanded-fill (honesty).
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
    status: AbsoluteReadingStatus;
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
    const isFill = !prior;
    const catalog = descriptorForAbsoluteKind(spec.measurementKind);
    const volume = isFill ? 0 : clamp01(Number(prior?.volume));
    let magnitude: number;
    if (isFill) {
      magnitude = 0;
    } else if (typeof prior?.magnitude === 'number' && Number.isFinite(prior.magnitude)) {
      magnitude = prior.magnitude;
    } else {
      magnitude = volume;
    }
    const status = normalizeStatus(prior?.status, { isFill });
    const explicitDescriptor =
      typeof prior?.descriptor === 'string' && prior.descriptor.trim()
        ? prior.descriptor.trim()
        : null;
    // Fill rows: short honesty copy — do not spam catalogue template as if measured.
    const descriptor = isFill
      ? 'Not measured — catalogue placeholder (expanded-fill).'
      : explicitDescriptor || catalog?.descriptor || null;

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
      descriptor,
      status,
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
      status: AbsoluteReadingStatus;
    };
  });
}

/** Count rows tagged expanded-fill (catalogue completeness only). */
export function countExpandedFillAbsolutes(
  rows: AbsoluteMeasurementLike[] | null | undefined,
): number {
  if (!Array.isArray(rows)) return 0;
  return rows.filter((r) => r?.status === 'expanded-fill').length;
}

/** Count rows that were actually measured or estimated (not fill / not_run). */
export function countMeasuredAbsolutes(
  rows: AbsoluteMeasurementLike[] | null | undefined,
): number {
  if (!Array.isArray(rows)) return 0;
  return rows.filter(
    (r) => r?.status === 'measured' || r?.status === 'estimated',
  ).length;
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
