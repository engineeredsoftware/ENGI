/**
 * Expand absolute volume maps to commercial catalogue law (all 46 kinds).
 * Browser-safe pure module — no measure-agent / Node imports.
 */

import {
  DATA_PACK_ABSOLUTES_CATALOG,
  DATA_PACK_ABSOLUTE_KINDS,
} from '@bitcode/generic-measurements-domain-data-pack-absolutes-catalog';

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return Number(value.toFixed(4));
}

/** Parse absolute volumes from common stored shapes (index row, execution output). */
export function collectAbsoluteVolumesFromUnknown(
  source: unknown,
): Record<string, number> {
  const out: Record<string, number> = {};
  if (!source || typeof source !== 'object') return out;

  const rec = source as Record<string, unknown>;

  if (rec.absolute_volumes && typeof rec.absolute_volumes === 'object' && !Array.isArray(rec.absolute_volumes)) {
    for (const [k, v] of Object.entries(rec.absolute_volumes as Record<string, unknown>)) {
      const n = Number(v);
      if (typeof k === 'string' && k.trim() && Number.isFinite(n)) {
        out[k.trim().toLowerCase()] = clamp01(n);
      }
    }
  }
  if (rec.absoluteVolumes && typeof rec.absoluteVolumes === 'object' && !Array.isArray(rec.absoluteVolumes)) {
    for (const [k, v] of Object.entries(rec.absoluteVolumes as Record<string, unknown>)) {
      const n = Number(v);
      if (typeof k === 'string' && k.trim() && Number.isFinite(n)) {
        out[k.trim().toLowerCase()] = clamp01(n);
      }
    }
  }

  const pushReading = (row: unknown) => {
    if (!row || typeof row !== 'object') return;
    const r = row as Record<string, unknown>;
    const kind = String(r.measurementKind || r.kind || r.id || '')
      .trim()
      .toLowerCase();
    if (!kind) return;
    const vol = Number(r.volume);
    if (!Number.isFinite(vol)) return;
    const next = clamp01(vol);
    out[kind] = out[kind] === undefined ? next : Math.max(out[kind], next);
  };

  if (Array.isArray(rec.absolutes)) {
    for (const row of rec.absolutes) pushReading(row);
  }
  if (Array.isArray(rec.measurements)) {
    for (const row of rec.measurements) pushReading(row);
  }
  if (rec.measurements && typeof rec.measurements === 'object' && !Array.isArray(rec.measurements)) {
    const nested = rec.measurements as { absolutes?: unknown };
    if (Array.isArray(nested.absolutes)) {
      for (const row of nested.absolutes) pushReading(row);
    }
  }

  return out;
}

/** Merge volume maps — keep max per kind (most informative signal). */
export function mergeAbsoluteVolumeMaps(
  ...maps: Array<Record<string, number> | null | undefined>
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const map of maps) {
    if (!map) continue;
    for (const [k, v] of Object.entries(map)) {
      const kind = String(k || '')
        .trim()
        .toLowerCase();
      if (!kind) continue;
      const n = Number(v);
      if (!Number.isFinite(n)) continue;
      const clamped = clamp01(n);
      out[kind] = out[kind] === undefined ? clamped : Math.max(out[kind], clamped);
    }
  }
  return out;
}

/**
 * Expand any partial volume map to the full commercial catalogue (46).
 * Missing kinds → volume 0 (honest insufficient evidence, still present).
 */
export function expandAbsoluteVolumesToFullCatalog(
  volumes: Record<string, number> | null | undefined,
): {
  absoluteKinds: string[];
  absoluteVolumes: Record<string, number>;
  measuredKindCount: number;
  catalogSize: number;
} {
  const absoluteVolumes: Record<string, number> = {};
  let measuredKindCount = 0;
  for (const kind of DATA_PACK_ABSOLUTE_KINDS) {
    const n = Number(volumes?.[kind]);
    const vol = Number.isFinite(n) ? clamp01(n) : 0;
    absoluteVolumes[kind] = vol;
    if (vol > 0) measuredKindCount += 1;
  }
  return {
    absoluteKinds: [...DATA_PACK_ABSOLUTE_KINDS],
    absoluteVolumes,
    measuredKindCount,
    catalogSize: DATA_PACK_ABSOLUTES_CATALOG.length,
  };
}
