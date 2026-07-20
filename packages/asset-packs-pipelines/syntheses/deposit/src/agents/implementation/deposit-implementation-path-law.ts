/**
 * Shared path law for deposit Implementation (agents 1/2 and 2/2).
 *
 * Aligns with Validation exclusion semantics (`pathViolates` / normalizeBlockedPathEntries):
 * a path is blocked when it equals an entry or sits under it as a directory prefix.
 * Bare free-text labels without `/` or `.` are too broad and are dropped.
 *
 * Source-safe: operates on path strings only — never file contents.
 */

/** Repo-relative path syntax (not execution key paths like "#host:…"). */
export function isCatalogPathSyntax(p: unknown): p is string {
  return (
    typeof p === 'string' &&
    p.length > 0 &&
    !p.startsWith('#') &&
    !p.includes(':') &&
    !p.includes('//')
  );
}

export function normalizeRepoPath(p: string): string {
  return p.replace(/^\.\//, '').replace(/^\/+/, '').trim();
}

export function buildCatalogPathSet(paths: unknown): Set<string> {
  const set = new Set<string>();
  if (!Array.isArray(paths)) return set;
  for (const p of paths) {
    if (typeof p === 'string' && p.length > 0) set.add(normalizeRepoPath(p));
  }
  return set;
}

/**
 * Drop empty / over-broad block tokens (e.g. bare "tests" from free-text "Tests.")
 * that would prefix-match entire subtrees unintentionally.
 * Same law as Validation `normalizeBlockedPathEntries`.
 */
export function normalizeBlockedPathEntries(entries: string[]): string[] {
  return entries
    .filter((e): e is string => typeof e === 'string' && e.trim().length > 0)
    .map((e) => normalizeRepoPath(e))
    .filter((e) => {
      if (e.length < 2) return false;
      if (!e.includes('/') && !e.includes('.')) return false;
      return true;
    });
}

/** Path equals entry or sits under it as a directory prefix (Validation-aligned). */
export function pathViolates(path: string, entry: string): boolean {
  if (!path || !entry) return false;
  const p = normalizeRepoPath(path).toLowerCase();
  const e = normalizeRepoPath(entry).toLowerCase();
  if (!p || !e) return false;
  if (p === e) return true;
  const dir = e.endsWith('/') ? e : `${e}/`;
  return p.startsWith(dir);
}

export function collectExclusionPrefixes(
  impermissible: unknown,
  obfuscationGuidance: unknown,
): string[] {
  const raw: string[] = [];
  if (Array.isArray(impermissible)) {
    for (const p of impermissible) {
      if (typeof p === 'string' && p.trim()) raw.push(p.trim());
    }
  }
  const obfuscatedPaths = (obfuscationGuidance as { obfuscatedPaths?: unknown } | null)
    ?.obfuscatedPaths;
  if (Array.isArray(obfuscatedPaths)) {
    for (const p of obfuscatedPaths) {
      if (typeof p === 'string' && p.trim()) raw.push(p.trim());
    }
  }
  return normalizeBlockedPathEntries(raw);
}

export function isExcludedPath(path: string, exclusionPrefixes: string[]): boolean {
  const n = normalizeRepoPath(path);
  if (!n) return true;
  const blocked = normalizeBlockedPathEntries(exclusionPrefixes);
  return blocked.some((entry) => pathViolates(n, entry));
}

export function pathAllowedInCatalog(
  path: unknown,
  catalogSet: Set<string>,
  exclusionPrefixes: string[],
): path is string {
  if (!isCatalogPathSyntax(path)) return false;
  const n = normalizeRepoPath(path);
  if (isExcludedPath(n, exclusionPrefixes)) return false;
  // Empty catalog (pre-hydrate): syntax + exclusion only.
  if (catalogSet.size === 0) return true;
  return catalogSet.has(n);
}
