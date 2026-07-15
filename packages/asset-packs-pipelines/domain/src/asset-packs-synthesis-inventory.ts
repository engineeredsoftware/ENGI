/**
 * Checkout source-catalog path scoping and prompt-safe projection for
 * AssetPacksSynthesis (depositor working-tree paths — not GitHub repo inventory).
 *
 * Permissible sources + Impermissible sources bound the checkout before measurement
 * or prompting. `sources` (verbatim file bodies) never enter prompt projections.
 */

import type {
  AssetPacksSynthesisSourceFile,
  AssetPacksSynthesisSourceInventory,
  AssetPacksSynthesisSourceSample,
} from './asset-packs-synthesis-types';

export function normalizeSourcePathList(value: string[] | string | null | undefined): string[] {
  const entries = Array.isArray(value) ? value : typeof value === 'string' ? value.split(/\r?\n/) : [];
  return [...new Set(entries.map((entry) => entry.trim()).filter(Boolean))].sort();
}

/** @deprecated Prefer normalizeSourcePathList */
export const normalizeForcedPathList = normalizeSourcePathList;

export function isPathExcluded(path: string, exclusions: string[]): boolean {
  const normalizedPath = path.trim().toLowerCase();
  return exclusions.some((exclusion) => {
    const normalized = exclusion.trim().toLowerCase().replace(/^\.\//, '');
    if (!normalized) return false;
    const withoutGlob = normalized.replace(/\*+/g, '');
    if (!withoutGlob) return false;
    return normalizedPath.includes(withoutGlob);
  });
}

/**
 * Permissible sources: when non-empty, a path is in-scope only if it equals or sits
 * under one of the permissible roots (prefix match). Empty list leaves the full
 * inventory in-scope (minus impermissible sources).
 */
export function isPathPermissible(path: string, permissibleSources: string[]): boolean {
  if (!Array.isArray(permissibleSources) || permissibleSources.length === 0) return true;
  const normalizedPath = path.trim().replace(/^\.\//, '').toLowerCase();
  if (!normalizedPath) return false;
  return permissibleSources.some((entry) => {
    const normalized = entry
      .trim()
      .replace(/^\.\//, '')
      .toLowerCase()
      .replace(/\*+/g, '');
    if (!normalized) return false;
    const root = normalized.replace(/\/+$/, '');
    if (!root) return false;
    return normalizedPath === root || normalizedPath.startsWith(`${root}/`);
  });
}

/** @deprecated Prefer isPathPermissible */
export const isPathForcedIncluded = isPathPermissible;

export function applyExclusionsToInventory(
  inventory: {
    paths: string[];
    samples: AssetPacksSynthesisSourceSample[];
    sources?: AssetPacksSynthesisSourceFile[];
  },
  exclusions: string[],
): AssetPacksSynthesisSourceInventory {
  return applyInventoryScope(inventory, { exclusions });
}

/**
 * Prompt-safe projection of the depositor checkout source catalog:
 * paths + samples only. Never includes `sources` (full file bodies) —
 * those are for measurement tools only.
 */
export function projectInventoryForPrompt(
  inventory: AssetPacksSynthesisSourceInventory | null | undefined,
): {
  paths: string[];
  pathCount: number;
  samples: AssetPacksSynthesisSourceSample[];
  totalPathCount: number;
  excludedPathCount: number;
  sourceFileCount: number;
} | null {
  if (!inventory || typeof inventory !== 'object') return null;
  const paths = Array.isArray(inventory.paths) ? inventory.paths : [];
  const samples = Array.isArray(inventory.samples) ? inventory.samples : [];
  const sources = Array.isArray(inventory.sources) ? inventory.sources : [];
  return {
    paths,
    pathCount: paths.length,
    samples,
    totalPathCount: inventory.totalPathCount ?? paths.length,
    excludedPathCount: inventory.excludedPathCount ?? 0,
    sourceFileCount: sources.length,
  };
}

/** Re-derive bounded prompt excerpts from in-scope sources after scoping. */
export function pickInventorySamples(
  sources: AssetPacksSynthesisSourceFile[],
  maxFiles = 24,
  maxChars = 4000,
): AssetPacksSynthesisSourceSample[] {
  if (!Array.isArray(sources) || sources.length === 0) return [];
  const byPath = new Map(sources.map((file) => [file.path, file.content]));
  const allPaths = sources.map((file) => file.path);
  const priority = [
    /^readme/i,
    /^package\.json$/i,
    /^pyproject\.toml$/i,
    /^cargo\.toml$/i,
    /^go\.mod$/i,
    /^setup\.(py|cfg)$/i,
    /^requirements.*\.txt$/i,
  ];
  const prioritized = allPaths.filter((path) =>
    priority.some((pattern) => pattern.test(path.split('/').pop() || '')),
  );
  const sourceLike = allPaths.filter(
    (path) =>
      !prioritized.includes(path) &&
      /\.(ts|tsx|js|jsx|py|rs|go|rb|java|cs|swift|sol|md)$/i.test(path) &&
      path.split('/').length <= 4,
  );
  return [...prioritized, ...sourceLike]
    .slice(0, maxFiles)
    .map((path) => ({ path, excerpt: (byPath.get(path) || '').slice(0, maxChars) }));
}

export function applyInventoryScope(
  inventory: {
    paths: string[];
    samples: AssetPacksSynthesisSourceSample[];
    sources?: AssetPacksSynthesisSourceFile[];
  },
  scope: {
    /** @deprecated Prefer permissibleSources */
    inclusions?: string[] | null;
    /** @deprecated Prefer impermissibleSources */
    exclusions?: string[] | null;
    permissibleSources?: string[] | null;
    impermissibleSources?: string[] | null;
  } = {},
): AssetPacksSynthesisSourceInventory {
  const permissibleSources = normalizeSourcePathList(
    scope.permissibleSources ?? scope.inclusions ?? [],
  );
  const impermissibleSources = normalizeSourcePathList(
    scope.impermissibleSources ?? scope.exclusions ?? [],
  );
  const inScope = (path: string) =>
    isPathPermissible(path, permissibleSources) &&
    !isPathExcluded(path, impermissibleSources);
  const keptPaths = inventory.paths.filter(inScope);
  let keptSamples = inventory.samples.filter((sample) => inScope(sample.path));
  // Out-of-scope files are never measured, sampled, or carried forward.
  const keptSources = Array.isArray(inventory.sources)
    ? inventory.sources.filter((file) => inScope(file.path))
    : undefined;
  // After Permissible sources, pre-scope samples often drop to zero — re-sample
  // from kept sources so deposit agents always get prompt excerpts.
  if (keptSources && keptSources.length > 0 && keptSamples.length === 0) {
    keptSamples = pickInventorySamples(keptSources);
  }
  return {
    ...(keptSources ? { sources: keptSources } : {}),
    paths: keptPaths,
    samples: keptSamples,
    totalPathCount: inventory.paths.length,
    excludedPathCount: inventory.paths.length - keptPaths.length,
  };
}
