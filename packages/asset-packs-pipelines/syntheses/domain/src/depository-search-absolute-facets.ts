/**
 * Absolute measurement facets for depository hybrid search.
 *
 * Deposit indexes absolute_kinds + absolute_volumes; read Need-fit and deposit
 * relevants search must filter and rank by those facets — not binary "has
 * measurement evidence" alone.
 *
 * Source-safe only: kinds + 0..1 volumes + weighted composite. Never raw source.
 */
import {
  DATA_PACK_ABSOLUTES_CATALOG,
  DATA_PACK_ABSOLUTE_KINDS,
} from '@bitcode/generic-measurements-domain-data-pack-absolutes-catalog';
import type { DepositoryAsset } from './depository-search-types';

/** Local helpers — do not import scoring (avoids cycle with rankAsset). */
function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return Number(value.toFixed(4));
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
}

/** Filters that gate the searchable corpus by absolute material properties. */
export type DepositoryAbsoluteFilters = {
  /** Require at least one of these kinds present (OR) unless requireAllAbsoluteKinds. */
  absoluteKinds?: string[] | null;
  /** Require every listed kind present (AND). */
  requireAllAbsoluteKinds?: boolean;
  /**
   * Per-kind minimum volume floors (0..1). Asset fails if a listed kind is
   * missing or below the floor.
   */
  minAbsoluteVolumes?: Record<string, number> | null;
  /** Minimum weighted composite over DATA_PACK_ABSOLUTES_CATALOG (0..1). */
  minAbsoluteComposite?: number | null;
};

export type ExtractedAbsoluteFacets = {
  kinds: string[];
  volumes: Record<string, number>;
  /** Weighted Σ(weight×volume) over full 65 commercial catalog; 0 when no volumes. */
  composite: number;
  /** Count of catalogue kinds with a finite volume. */
  weightedMeasuredCount: number;
};

/** Commercial weights for all 65 kinds (Σ = 1). */
const CATALOG_WEIGHTS: Record<string, number> = Object.fromEntries(
  DATA_PACK_ABSOLUTES_CATALOG.map((row) => [row.measurementKind, row.weight]),
);

const KNOWN_ABSOLUTE_KINDS = new Set(DATA_PACK_ABSOLUTE_KINDS);

function asNumber01(value: unknown): number | null {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return clamp01(n);
}

function pushKind(set: Set<string>, raw: unknown): void {
  const kind = stringValue(raw).toLowerCase();
  if (!kind) return;
  set.add(kind);
}

function pushVolume(map: Record<string, number>, kindRaw: unknown, volumeRaw: unknown): void {
  const kind = stringValue(kindRaw).toLowerCase();
  const vol = asNumber01(volumeRaw);
  if (!kind || vol === null) return;
  // Prefer higher volume when duplicates appear (more honest coverage signal).
  map[kind] = map[kind] === undefined ? vol : Math.max(map[kind], vol);
}

/**
 * Extract absolute kinds/volumes from common source-safe shapes:
 * metadata.absoluteKinds/absoluteVolumes, measurements.absolutes[], assetMeasurement.
 */
export function extractAbsoluteFacets(asset: DepositoryAsset | null | undefined): ExtractedAbsoluteFacets {
  const kinds = new Set<string>();
  const volumes: Record<string, number> = {};
  if (!asset) {
    return { kinds: [], volumes: {}, composite: 0, weightedMeasuredCount: 0 };
  }

  const meta = (asset.metadata || {}) as Record<string, unknown>;
  for (const k of stringArray(meta.absoluteKinds)) pushKind(kinds, k);
  const metaVolumes = meta.absoluteVolumes;
  if (metaVolumes && typeof metaVolumes === 'object' && !Array.isArray(metaVolumes)) {
    for (const [k, v] of Object.entries(metaVolumes as Record<string, unknown>)) {
      pushVolume(volumes, k, v);
      pushKind(kinds, k);
    }
  }

  // Nested measurements.absolutes (product shape on packs / index payloads).
  const measurements = meta.measurements;
  const nestedAbsolutes =
    measurements && typeof measurements === 'object' && !Array.isArray(measurements)
      ? (measurements as { absolutes?: unknown }).absolutes
      : undefined;
  const absoluteRows = [
    ...(Array.isArray(meta.absolutes) ? meta.absolutes : []),
    ...(Array.isArray(nestedAbsolutes) ? nestedAbsolutes : []),
    ...(Array.isArray(asset.assetMeasurement)
      ? (asset.assetMeasurement as unknown[])
      : asset.assetMeasurement &&
          typeof asset.assetMeasurement === 'object' &&
          Array.isArray((asset.assetMeasurement as { absolutes?: unknown }).absolutes)
        ? ((asset.assetMeasurement as { absolutes: unknown[] }).absolutes as unknown[])
        : []),
  ];
  for (const row of absoluteRows) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    const kind = r.measurementKind ?? r.kind ?? r.id;
    pushKind(kinds, kind);
    if (r.volume !== undefined) pushVolume(volumes, kind, r.volume);
  }

  // Direct assetMeasurement map of kind → volume.
  if (asset.assetMeasurement && typeof asset.assetMeasurement === 'object' && !Array.isArray(asset.assetMeasurement)) {
    const am = asset.assetMeasurement as Record<string, unknown>;
    for (const [k, v] of Object.entries(am)) {
      if (k === 'absolutes' || k === 'source' || k === 'measurementRoot' || k === 'measurementProvenanceCount') {
        continue;
      }
      if (KNOWN_ABSOLUTE_KINDS.has(k) || CATALOG_WEIGHTS[k] !== undefined) {
        pushKind(kinds, k);
        if (typeof v === 'number' || typeof v === 'string') pushVolume(volumes, k, v);
      }
    }
  }

  let weightedSum = 0;
  let weightMass = 0;
  let weightedMeasuredCount = 0;
  for (const [kind, weight] of Object.entries(CATALOG_WEIGHTS)) {
    if (weight <= 0) continue;
    const vol = volumes[kind];
    if (vol === undefined) continue;
    weightedSum += weight * vol;
    weightMass += weight;
    weightedMeasuredCount += 1;
  }
  // When only a subset of the 46 is present, renormalize so partial packs are
  // comparable (honest coverage, not zero-penalty for missing kinds).
  const composite = weightMass > 0 ? clamp01(weightedSum / weightMass) : 0;

  return {
    kinds: [...kinds].sort(),
    volumes,
    composite,
    weightedMeasuredCount,
  };
}

/** Source-safe text tokens so lexical/vector channels see absolute identity. */
export function absoluteFacetsCorpusText(facets: ExtractedAbsoluteFacets): string {
  const parts: string[] = [...facets.kinds];
  for (const [kind, vol] of Object.entries(facets.volumes).sort(([a], [b]) => a.localeCompare(b))) {
    parts.push(kind, `${kind}:${vol.toFixed(3)}`);
  }
  if (facets.composite > 0) {
    parts.push(`absolute-composite:${facets.composite.toFixed(3)}`);
  }
  return parts.join(' ');
}

/**
 * Source-safe material identity tokens for hybrid lexical/vector corpus.
 * Accepts the domain bag or a partial { corpusTokens } shape from index/metadata.
 */
export function materialIdentityCorpusText(
  materialIdentity: unknown,
): string {
  if (!materialIdentity || typeof materialIdentity !== 'object' || Array.isArray(materialIdentity)) {
    return '';
  }
  const bag = materialIdentity as Record<string, unknown>;
  const tokens = Array.isArray(bag.corpusTokens)
    ? bag.corpusTokens.filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
    : [];
  if (tokens.length) return tokens.slice(0, 120).join(' ');
  // Fallback: tag primaries + framework ids when corpusTokens missing.
  const parts: string[] = [];
  if (Array.isArray(bag.tagSets)) {
    for (const ts of bag.tagSets as Array<{ kind?: string; primary?: string; tags?: string[] }>) {
      if (ts.primary) parts.push(String(ts.primary));
      for (const t of ts.tags || []) parts.push(String(t));
    }
  }
  if (Array.isArray(bag.inventories)) {
    for (const inv of bag.inventories as Array<{ items?: Array<{ id?: string }> }>) {
      for (const item of (inv.items || []).slice(0, 20)) {
        if (item.id) parts.push(String(item.id));
      }
    }
  }
  return parts.slice(0, 80).join(' ');
}

/**
 * Does this asset pass absolute filters?
 * Empty filters → pass. Missing volumes for min floors → fail.
 */
export function assetPassesAbsoluteFilters(
  asset: DepositoryAsset,
  filters: DepositoryAbsoluteFilters | null | undefined,
): boolean {
  if (!filters) return true;
  const wantKinds = (filters.absoluteKinds || [])
    .map((k) => stringValue(k).toLowerCase())
    .filter(Boolean);
  const minVolumes = filters.minAbsoluteVolumes || {};
  const minVolEntries = Object.entries(minVolumes)
    .map(([k, v]) => [stringValue(k).toLowerCase(), Number(v)] as const)
    .filter(([k, v]) => k && Number.isFinite(v));
  const minComposite =
    typeof filters.minAbsoluteComposite === 'number' && Number.isFinite(filters.minAbsoluteComposite)
      ? clamp01(filters.minAbsoluteComposite)
      : null;

  if (!wantKinds.length && !minVolEntries.length && minComposite === null) return true;

  const facets = extractAbsoluteFacets(asset);
  const have = new Set(facets.kinds);

  if (wantKinds.length) {
    if (filters.requireAllAbsoluteKinds) {
      if (!wantKinds.every((k) => have.has(k))) return false;
    } else if (!wantKinds.some((k) => have.has(k))) {
      return false;
    }
  }

  for (const [kind, floor] of minVolEntries) {
    const vol = facets.volumes[kind];
    if (vol === undefined || vol < clamp01(floor)) return false;
  }

  if (minComposite !== null && facets.composite < minComposite) return false;
  return true;
}

/**
 * Measurement-channel score driven by absolute facets (0..1).
 * Blends commercial composite, coverage of the 46 catalogue kinds, and optional
 * need-term overlap against absolute kind labels.
 */
export function absoluteFacetScore(
  asset: DepositoryAsset,
  options?: { queryTerms?: string[] | null },
): number {
  const facets = extractAbsoluteFacets(asset);
  if (!facets.kinds.length && facets.weightedMeasuredCount === 0) return 0;

  const coverage =
    DATA_PACK_ABSOLUTE_KINDS.length > 0
      ? facets.weightedMeasuredCount / DATA_PACK_ABSOLUTE_KINDS.length
      : 0;

  const terms = (options?.queryTerms || [])
    .map((t) => stringValue(t).toLowerCase())
    .filter(Boolean);
  let kindHit = 0;
  if (terms.length && facets.kinds.length) {
    const kindBlob = facets.kinds.join(' ');
    const hits = terms.filter((t) => kindBlob.includes(t) || t.includes('absolute') || t.includes('measure'));
    kindHit = hits.length / terms.length;
  }

  // Presence of any absolute signal is already valuable for depository legibility.
  const presence = facets.kinds.length > 0 || facets.weightedMeasuredCount > 0 ? 0.35 : 0;

  return clamp01(presence + 0.4 * facets.composite + 0.15 * coverage + 0.1 * kindHit);
}

/**
 * Re-rank hybrid hits by blending lexical/vector score with absolute facet score.
 * Caps absolute boost so measurement cannot alone promote empty lexical matches.
 */
export function blendHybridScoreWithAbsolutes(
  baseScore: number | null | undefined,
  asset: DepositoryAsset | null | undefined,
  options?: { queryTerms?: string[] | null; absoluteWeight?: number },
): number {
  const base = clamp01(Number(baseScore) || 0);
  if (!asset) return base;
  const abs = absoluteFacetScore(asset, { queryTerms: options?.queryTerms });
  const w = clamp01(options?.absoluteWeight ?? 0.22);
  // Soft boost: absolute cannot dominate a near-zero lexical/vector hit.
  const gatedAbs = base < 0.08 ? abs * 0.35 : abs;
  return clamp01((1 - w) * base + w * Math.max(base, gatedAbs));
}

export { DATA_PACK_ABSOLUTE_KINDS };
