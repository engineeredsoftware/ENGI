/**
 * Absolute measurement filter clauses for Exchange pack activity search.
 *
 * Multi-clause AND filters: each clause is (kind, compare-op, volume 0..1).
 * URL SSOT param: absoluteFilters=kind:op:volume,kind:op:volume
 * Legacy: absoluteKind + minAbsoluteVolume → single gte clause.
 *
 * Pure module — no React. Used by filter bar, active chips, API, pack-activity-model.
 */

import { labelForDataPackAbsoluteKind } from '@bitcode/generic-measurements-domain-data-pack-absolutes-catalog';

/** Volume comparison operators for absolute measurement facets. */
export type AbsoluteVolumeCompareOp = 'gt' | 'gte' | 'lt' | 'lte' | 'eq';

export type AbsoluteMeasurementFilterClause = {
  /** Catalogue kind id (e.g. function-count). */
  kind: string;
  op: AbsoluteVolumeCompareOp;
  /** Target volume in [0, 1]. */
  volume: number;
};

/** Stable order for op selects. */
export const ABSOLUTE_VOLUME_COMPARE_OPS: readonly AbsoluteVolumeCompareOp[] = [
  'gte',
  'gt',
  'lte',
  'lt',
  'eq',
] as const;

export const ABSOLUTE_VOLUME_COMPARE_OP_LABELS: Record<
  AbsoluteVolumeCompareOp,
  string
> = {
  gte: '≥ greater or equal',
  gt: '> greater than',
  lte: '≤ less or equal',
  lt: '< less than',
  eq: '= equal',
};

/** Compact symbols for chips / dense UI. */
export const ABSOLUTE_VOLUME_COMPARE_OP_SYMBOLS: Record<
  AbsoluteVolumeCompareOp,
  string
> = {
  gte: '≥',
  gt: '>',
  lte: '≤',
  lt: '<',
  eq: '=',
};

const OP_SET = new Set<string>(ABSOLUTE_VOLUME_COMPARE_OPS);

/** Max concurrent absolute clauses (keeps URL + UI bounded). */
export const ABSOLUTE_FILTER_CLAUSE_LIMIT = 8;

/** Equality tolerance for 0..1 volumes (catalog stores ~4 decimal places). */
const VOLUME_EQ_EPSILON = 1e-4;

export function isAbsoluteVolumeCompareOp(
  value: string | null | undefined,
): value is AbsoluteVolumeCompareOp {
  return Boolean(value && OP_SET.has(value));
}

export function clampAbsoluteVolume(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return Number(value.toFixed(4));
}

export function compareAbsoluteVolume(
  actual: number,
  op: AbsoluteVolumeCompareOp,
  target: number,
): boolean {
  const a = clampAbsoluteVolume(actual);
  const t = clampAbsoluteVolume(target);
  switch (op) {
    case 'gt':
      return a > t;
    case 'gte':
      return a >= t;
    case 'lt':
      return a < t;
    case 'lte':
      return a <= t;
    case 'eq':
      return Math.abs(a - t) <= VOLUME_EQ_EPSILON;
    default:
      return false;
  }
}

/**
 * Parse absoluteFilters URL value: "kind:op:volume,kind:op:volume".
 * Invalid segments are dropped; kinds are lowercased; volumes clamped 0..1.
 */
export function parseAbsoluteMeasurementFilters(
  raw: string | null | undefined,
): AbsoluteMeasurementFilterClause[] {
  const text = String(raw || '').trim();
  if (!text) return [];
  const clauses: AbsoluteMeasurementFilterClause[] = [];
  const seen = new Set<string>();
  for (const segment of text.split(',')) {
    const part = segment.trim();
    if (!part) continue;
    const pieces = part.split(':');
    if (pieces.length < 3) continue;
    // kind may contain colons in theory — take last two as op + volume.
    const volumeRaw = pieces[pieces.length - 1];
    const opRaw = pieces[pieces.length - 2];
    const kind = pieces.slice(0, -2).join(':').toLowerCase().trim();
    if (!kind || !isAbsoluteVolumeCompareOp(opRaw)) continue;
    const volumeNum = Number(volumeRaw);
    if (!Number.isFinite(volumeNum)) continue;
    const clause: AbsoluteMeasurementFilterClause = {
      kind,
      op: opRaw,
      volume: clampAbsoluteVolume(volumeNum),
    };
    const key = `${clause.kind}|${clause.op}|${clause.volume}`;
    if (seen.has(key)) continue;
    seen.add(key);
    clauses.push(clause);
    if (clauses.length >= ABSOLUTE_FILTER_CLAUSE_LIMIT) break;
  }
  return clauses;
}

/** Serialize clauses for the absoluteFilters URL param (null when empty). */
export function serializeAbsoluteMeasurementFilters(
  clauses: AbsoluteMeasurementFilterClause[] | null | undefined,
): string | null {
  if (!clauses || clauses.length === 0) return null;
  const parts: string[] = [];
  const seen = new Set<string>();
  for (const clause of clauses) {
    const kind = String(clause.kind || '')
      .toLowerCase()
      .trim();
    if (!kind || !isAbsoluteVolumeCompareOp(clause.op)) continue;
    const volume = clampAbsoluteVolume(Number(clause.volume));
    const key = `${kind}|${clause.op}|${volume}`;
    if (seen.has(key)) continue;
    seen.add(key);
    parts.push(`${kind}:${clause.op}:${volume}`);
    if (parts.length >= ABSOLUTE_FILTER_CLAUSE_LIMIT) break;
  }
  return parts.length ? parts.join(',') : null;
}

/**
 * Resolve filter clauses from URL params.
 * Prefers absoluteFilters; falls back to legacy absoluteKind + minAbsoluteVolume.
 */
export function resolveAbsoluteMeasurementFiltersFromParams(params: {
  absoluteFilters?: string | null;
  absoluteKind?: string | null;
  minAbsoluteVolume?: string | null | number;
}): AbsoluteMeasurementFilterClause[] {
  const multi = parseAbsoluteMeasurementFilters(params.absoluteFilters);
  if (multi.length > 0) return multi;

  const kind = String(params.absoluteKind || '')
    .toLowerCase()
    .trim();
  if (!kind || kind === 'all') return [];

  const minRaw = params.minAbsoluteVolume;
  const minNum =
    minRaw === null || minRaw === undefined || minRaw === ''
      ? 0
      : Number(minRaw);
  const volume =
    Number.isFinite(minNum) ? clampAbsoluteVolume(minNum) : 0;

  return [{ kind, op: 'gte', volume }];
}

/** Human chip / active-filter label for one clause. */
export function formatAbsoluteMeasurementFilterClause(
  clause: AbsoluteMeasurementFilterClause,
): string {
  const label = labelForDataPackAbsoluteKind(clause.kind) || clause.kind;
  const symbol = ABSOLUTE_VOLUME_COMPARE_OP_SYMBOLS[clause.op] || clause.op;
  return `${label} ${symbol} ${clampAbsoluteVolume(clause.volume)}`;
}

/** Measurement-like row for matching (pack activity or lightweight fixtures). */
export type AbsoluteFilterMeasurementLike = {
  id?: string | null;
  kind?: string | null;
  volume?: number | null;
  value?: number | string | null;
};

function measurementKindMatches(
  measurement: AbsoluteFilterMeasurementLike,
  wantKind: string,
): boolean {
  const want = wantKind.toLowerCase().trim();
  if (!want) return false;
  const id = String(measurement.id || '').toLowerCase();
  const mk = String(measurement.kind || '').toLowerCase();
  return (
    mk === want ||
    id === want ||
    id === `absolute:${want}` ||
    id.endsWith(`:${want}`)
  );
}

/**
 * Extract 0..1 volume from a measurement row.
 * Prefer explicit volume; accept value when it is already a unit interval.
 */
export function volumeFromAbsoluteMeasurement(
  measurement: AbsoluteFilterMeasurementLike,
): number | null {
  if (typeof measurement.volume === 'number' && Number.isFinite(measurement.volume)) {
    return clampAbsoluteVolume(measurement.volume);
  }
  if (typeof measurement.value === 'number' && Number.isFinite(measurement.value)) {
    const n = measurement.value;
    if (n >= 0 && n <= 1) return clampAbsoluteVolume(n);
  }
  return null;
}

/**
 * Does this measurement bag satisfy every absolute clause (AND)?
 * Empty clauses → pass. Missing kind or volume that cannot satisfy op → fail.
 */
export function measurementsMatchAbsoluteFilters(
  measurements: AbsoluteFilterMeasurementLike[] | null | undefined,
  clauses: AbsoluteMeasurementFilterClause[] | null | undefined,
): boolean {
  if (!clauses || clauses.length === 0) return true;
  const rows = measurements || [];
  return clauses.every((clause) => {
    const matches = rows.filter((m) => measurementKindMatches(m, clause.kind));
    if (matches.length === 0) return false;
    // Presence-only: gte 0 with no volume still passes if kind is present.
    if (clause.op === 'gte' && clause.volume <= 0) {
      return true;
    }
    return matches.some((m) => {
      const vol = volumeFromAbsoluteMeasurement(m);
      if (vol === null) return false;
      return compareAbsoluteVolume(vol, clause.op, clause.volume);
    });
  });
}
