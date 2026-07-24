/**
 * Prepare depository assets for deposit/read hybrid search.
 * Normalizes absolute facets onto metadata so filters + ranking always see them.
 */
import { normalizeDepositoryAsset } from './depository-search-normalize';
import type { DepositoryAsset } from './depository-search-types';
import { extractAbsoluteFacets } from './depository-search-absolute-facets';
import {
  DATA_PACK_ABSOLUTE_KINDS,
  DATA_PACK_WEIGHTED_ABSOLUTE_KINDS,
} from '@bitcode/generic-measurements-domain-data-pack-absolutes-catalog';

/**
 * Normalize raw depository payloads into DepositoryAsset[] with absolute
 * kinds/volumes promoted onto metadata (search facets).
 */
export function prepareDepositoryAssetsForSearch(raw: unknown): DepositoryAsset[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => normalizeDepositoryAsset(entry))
    .filter(Boolean) as DepositoryAsset[];
}

/**
 * Append absolute kind tokens to the query plan when packs in the corpus carry them,
 * so lexical/vector channels can match measurement language (not only Need prose).
 */
export function absoluteKindQueryHints(assets: DepositoryAsset[], max = 8): string[] {
  const known = new Set(DATA_PACK_ABSOLUTE_KINDS);
  const counts = new Map<string, number>();
  for (const asset of assets) {
    const facets = extractAbsoluteFacets(asset);
    for (const kind of facets.kinds) {
      // Accept any SSOT kind, or any kind that carries a volume (future-safe).
      if (!known.has(kind) && facets.volumes[kind] === undefined) continue;
      counts.set(kind, (counts.get(kind) || 0) + 1);
    }
  }
  // Prefer commercial weighted kinds first when present, then remaining SSOT kinds.
  const weighted = new Set(DATA_PACK_WEIGHTED_ABSOLUTE_KINDS);
  return [...counts.entries()]
    .sort((a, b) => {
      const aw = weighted.has(a[0]) ? 1 : 0;
      const bw = weighted.has(b[0]) ? 1 : 0;
      return bw - aw || b[1] - a[1] || a[0].localeCompare(b[0]);
    })
    .map(([kind]) => kind)
    .slice(0, max);
}

/**
 * Prefer packs that already carry measured absolutes when ranking corpus is large —
 * soft static filter for deposit relevants (any SSOT absolute kind present).
 */
export function preferMeasuredAbsoluteFilters(
  assets: DepositoryAsset[],
  minCorpus = 24,
): { absoluteKinds?: string[] } | null {
  if (assets.length < minCorpus) return null;
  const withAbs = assets.filter((a) => extractAbsoluteFacets(a).kinds.length > 0);
  // Only bias when most of the corpus is measured (avoid empty recall).
  if (withAbs.length < assets.length * 0.4) return null;
  // Any SSOT kind presence — not only the weighted commercial subset.
  return { absoluteKinds: [...DATA_PACK_ABSOLUTE_KINDS] };
}
