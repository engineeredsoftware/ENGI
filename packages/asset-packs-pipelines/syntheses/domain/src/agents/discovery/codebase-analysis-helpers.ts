/**
 * Pure helpers for deposit codebase comprehension analysis.
 * File-tree structure + key-file selection from sourceCheckoutCatalog.
 */

export type FileTreeStructure = {
  pathCount: number;
  topLevelDirs: string[];
  topLevelFiles: string[];
  /** dir path → child names (files + subdirs), capped for prompt size */
  dirs: Record<string, string[]>;
  extensionHistogram: Record<string, number>;
};

export type KeySourceFileRead = {
  path: string;
  content: string;
  byteLength: number;
  truncated: boolean;
};

// Tighter defaults for sandbox deposit on large monorepos (was 16×12k).
const KEY_FILE_MAX = 12;
const KEY_FILE_MAX_CHARS = 8000;

const KEY_NAME_PATTERNS = [
  /^readme/i,
  /^package\.json$/i,
  /^pyproject\.toml$/i,
  /^cargo\.toml$/i,
  /^go\.mod$/i,
  /^tsconfig/i,
  /^setup\.(py|cfg)$/i,
];

/** Build a compact directory/file structure from catalog paths. */
export function buildFileTreeStructure(paths: string[]): FileTreeStructure {
  const topLevelDirs = new Set<string>();
  const topLevelFiles = new Set<string>();
  const dirs: Record<string, Set<string>> = {};
  const extensionHistogram: Record<string, number> = {};

  for (const raw of paths) {
    const path = String(raw || '').replace(/^\.\//, '');
    if (!path) continue;
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 1) {
      topLevelFiles.add(parts[0]);
    } else {
      topLevelDirs.add(parts[0]);
    }
    // Parent dir children
    for (let i = 0; i < parts.length; i += 1) {
      const parent = parts.slice(0, i).join('/') || '.';
      const child = parts[i];
      if (!dirs[parent]) dirs[parent] = new Set();
      dirs[parent].add(child + (i < parts.length - 1 ? '/' : ''));
    }
    const base = parts[parts.length - 1] || '';
    const dot = base.lastIndexOf('.');
    if (dot > 0) {
      const ext = base.slice(dot).toLowerCase();
      extensionHistogram[ext] = (extensionHistogram[ext] || 0) + 1;
    }
  }

  const dirsOut: Record<string, string[]> = {};
  const sortedParents = Object.keys(dirs).sort().slice(0, 80);
  for (const parent of sortedParents) {
    dirsOut[parent] = [...dirs[parent]].sort().slice(0, 40);
  }

  return {
    pathCount: paths.length,
    topLevelDirs: [...topLevelDirs].sort(),
    topLevelFiles: [...topLevelFiles].sort(),
    dirs: dirsOut,
    extensionHistogram,
  };
}

/**
 * Select key files for full/bounded reads: priority names, then shallow source,
 * preferring entries that already have bodies in the catalog.
 */
export function pickKeySourceFiles(
  sources: Array<{ path: string; content: string }>,
  samples: Array<{ path: string; excerpt?: string }>,
  allPaths: string[],
  maxFiles = KEY_FILE_MAX,
  maxChars = KEY_FILE_MAX_CHARS,
): KeySourceFileRead[] {
  const byPath = new Map<string, string>();
  for (const s of sources) {
    if (s?.path && typeof s.content === 'string') byPath.set(s.path, s.content);
  }
  for (const s of samples) {
    if (s?.path && typeof s.excerpt === 'string' && !byPath.has(s.path)) {
      byPath.set(s.path, s.excerpt);
    }
  }

  const prioritized = allPaths.filter((path) =>
    KEY_NAME_PATTERNS.some((re) => re.test(path.split('/').pop() || '')),
  );
  const sourceLike = allPaths.filter(
    (path) =>
      !prioritized.includes(path) &&
      /\.(ts|tsx|js|jsx|py|rs|go|rb|java|cs|swift|sol|md)$/i.test(path) &&
      path.split('/').length <= 3,
  );
  const ordered = [...prioritized, ...sourceLike, ...allPaths.filter((p) => byPath.has(p))];
  const unique: string[] = [];
  for (const p of ordered) {
    if (!unique.includes(p)) unique.push(p);
    if (unique.length >= maxFiles) break;
  }

  const reads: KeySourceFileRead[] = [];
  for (const path of unique) {
    const content = byPath.get(path);
    if (content == null) continue;
    const truncated = content.length > maxChars;
    reads.push({
      path,
      content: truncated ? content.slice(0, maxChars) : content,
      byteLength: content.length,
      truncated,
    });
  }
  return reads;
}
