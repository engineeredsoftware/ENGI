/**
 * Checkout source-catalog path scoping and projections for AssetPacksSynthesis
 * (depositor working-tree paths — not GitHub repo inventory).
 *
 * Permissible sources + Impermissible sources bound the checkout before measurement
 * or prompting.
 *
 * IMPORTANT — two projections:
 *   - projectInventoryForPrompt: path list + samples only (lightweight / legacy).
 *   - projectInventoryForSynthesisProvider: includes REAL file bodies for LLM
 *     synthesis agents (plan, discovery, create, commercial, validation quality).
 *
 * Source-safety is a product/API disclosure law (what users see unpaid). It is
 * NOT a restriction on LLM provider inputs during deposit synthesis. Pre-launch
 * third-party providers and launch self-hosted models both receive real content.
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

export function isPathImpermissible(path: string, impermissibleSources: string[]): boolean {
  const normalizedPath = path.trim().toLowerCase();
  return impermissibleSources.some((entry) => {
    const normalized = entry.trim().toLowerCase().replace(/^\.\//, '');
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

/**
 * Lightweight projection: paths + samples only (no full bodies).
 * Prefer projectInventoryForSynthesisProvider for deposit synthesis LLMs.
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

export type SynthesisProviderInventoryProjection = {
  /** Explicit: full bodies for synthesis providers — not a product API response. */
  disclosureNote: string;
  paths: string[];
  pathCount: number;
  samples: AssetPacksSynthesisSourceSample[];
  /** Real file bodies for LLM grounding (may be char-budgeted on huge monorepos). */
  sources: Array<{ path: string; content: string; truncated?: boolean }>;
  sourceFileCount: number;
  sourcesIncluded: number;
  sourcesOmitted: number;
  totalCharsIncluded: number;
  totalPathCount: number;
  excludedPathCount: number;
};

export type SynthesisProviderInventoryOptions = {
  /** Max source files to include (default 400). */
  maxSourceFiles?: number;
  /** Max chars per file before truncation (default 200_000 ≈ full normal sources). */
  maxCharsPerFile?: number;
  /** Max total chars across all bodies (default 2_500_000). */
  maxTotalChars?: number;
  /** Prefer these paths first (e.g. discovery anchors / covered paths). */
  preferPaths?: string[];
};

/**
 * Synthesis-provider projection: REAL checkout file bodies for deposit LLMs.
 *
 * Use for patch-plan, discovery grounding, create-body siblings, commercial-NL
 * context, and validation quality judgment. Budget caps prevent Invalid string
 * length on pathological monorepos — they do not strip content for "source-safety".
 */
export function projectInventoryForSynthesisProvider(
  inventory: AssetPacksSynthesisSourceInventory | null | undefined,
  options: SynthesisProviderInventoryOptions = {},
): SynthesisProviderInventoryProjection | null {
  if (!inventory || typeof inventory !== 'object') return null;
  const paths = Array.isArray(inventory.paths) ? inventory.paths : [];
  const samples = Array.isArray(inventory.samples) ? inventory.samples : [];
  const rawSources = Array.isArray(inventory.sources) ? inventory.sources : [];

  const maxSourceFiles = clampPositiveInt(options.maxSourceFiles, 400, 1, 20_000);
  const maxCharsPerFile = clampPositiveInt(options.maxCharsPerFile, 200_000, 1_000, 5_000_000);
  const maxTotalChars = clampPositiveInt(options.maxTotalChars, 2_500_000, 50_000, 50_000_000);

  const prefer = new Set(
    (options.preferPaths || [])
      .map((p) => String(p || '').replace(/\\/g, '/').replace(/^\.?\//, '').trim())
      .filter(Boolean),
  );

  const byPath = new Map<string, string>();
  for (const s of rawSources) {
    if (!s || typeof s.path !== 'string' || typeof s.content !== 'string') continue;
    const path = s.path.replace(/\\/g, '/').replace(/^\.?\//, '').trim();
    if (path && !byPath.has(path)) byPath.set(path, s.content);
  }
  // Samples fill gaps when full sources missing for a path.
  for (const s of samples) {
    if (!s || typeof s.path !== 'string') continue;
    const path = s.path.replace(/\\/g, '/').replace(/^\.?\//, '').trim();
    const excerpt = typeof (s as { excerpt?: string }).excerpt === 'string'
      ? (s as { excerpt: string }).excerpt
      : '';
    if (path && excerpt && !byPath.has(path)) byPath.set(path, excerpt);
  }

  const orderedPaths: string[] = [];
  for (const p of prefer) {
    if (byPath.has(p)) orderedPaths.push(p);
  }
  // Prefer shallow source-like files, then remaining.
  const remaining = [...byPath.keys()].filter((p) => !prefer.has(p));
  remaining.sort((a, b) => {
    const score = (p: string) => {
      let s = 0;
      if (/\.(ts|tsx|js|jsx|py|rs|go|md|json)$/i.test(p)) s += 3;
      if (p.split('/').length <= 3) s += 2;
      if (/readme|package\.json|index\./i.test(p)) s += 2;
      return s;
    };
    return score(b) - score(a) || a.localeCompare(b);
  });
  for (const p of remaining) orderedPaths.push(p);

  const sources: Array<{ path: string; content: string; truncated?: boolean }> = [];
  let totalChars = 0;
  let omitted = 0;
  for (const path of orderedPaths) {
    if (sources.length >= maxSourceFiles) {
      omitted += orderedPaths.length - sources.length;
      break;
    }
    const raw = byPath.get(path) || '';
    if (!raw) continue;
    let content = raw;
    let truncated = false;
    if (content.length > maxCharsPerFile) {
      content = content.slice(0, maxCharsPerFile);
      truncated = true;
    }
    if (totalChars + content.length > maxTotalChars) {
      const room = maxTotalChars - totalChars;
      if (room < 500) {
        omitted += 1;
        continue;
      }
      content = content.slice(0, room);
      truncated = true;
    }
    sources.push({ path, content, ...(truncated ? { truncated: true } : {}) });
    totalChars += content.length;
  }
  if (orderedPaths.length > sources.length && omitted === 0) {
    omitted = Math.max(0, byPath.size - sources.length);
  }

  return {
    disclosureNote:
      'SYNTHESIS_PROVIDER_INPUT: full checkout file bodies included for deposit synthesis LLMs. Product/API source-safety applies only to user-visible unpaid surfaces — not this packet.',
    paths,
    pathCount: paths.length,
    samples,
    sources,
    sourceFileCount: rawSources.length || byPath.size,
    sourcesIncluded: sources.length,
    sourcesOmitted: omitted,
    totalCharsIncluded: totalChars,
    totalPathCount: inventory.totalPathCount ?? paths.length,
    excludedPathCount: inventory.excludedPathCount ?? 0,
  };
}

function clampPositiveInt(
  value: number | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(value)));
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
    permissibleSources?: string[] | null;
    impermissibleSources?: string[] | null;
  } = {},
): AssetPacksSynthesisSourceInventory {
  const permissibleSources = normalizeSourcePathList(scope.permissibleSources ?? []);
  const impermissibleSources = normalizeSourcePathList(scope.impermissibleSources ?? []);
  const inScope = (path: string) =>
    isPathPermissible(path, permissibleSources) &&
    !isPathImpermissible(path, impermissibleSources);
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
