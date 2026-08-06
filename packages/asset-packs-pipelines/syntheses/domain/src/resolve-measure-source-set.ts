/**
 * Resolve the deep measure source set for a synthesized DataPack.
 *
 * Measure unit remains the DataPack (covered paths + patch paths), not the whole
 * monorepo. This module deepens that set with measure-critical manifests and
 * optional sibling tests when present in the checkout catalog — still within
 * the allowed body bag (obfuscation/checkout-scoped loaders only).
 *
 * Hierarchy: pure domain helper → deposit/read measure host → bare absolutes.
 */

export type MeasureSourceBody = {
  path: string;
  content: string;
};

export type ResolveMeasureSourceSetInput = {
  /** Covered source paths on the synthesized pack. */
  coveredSourcePaths?: string[] | null;
  /** Path+op patch surface. */
  fileChanges?: Array<{ path?: string | null; op?: string | null }> | null;
  /** Checkout bodies available to the measure host (already allowlisted). */
  availableBodies?: MeasureSourceBody[] | null;
  /**
   * Soft cap on bodies returned (env BITCODE_DEPOSIT_MAX_MEASURE_BODIES or default).
   * Truncation is reported in telemetry — never silent.
   */
  maxBodies?: number;
  /** When true (default), include sibling test files for covered production paths. */
  includeSiblingTests?: boolean;
};

export type ResolveMeasureSourceSetResult = {
  /** Bodies to pass as measure sources (content-bearing). */
  sources: MeasureSourceBody[];
  /** Union of paths in scope (covered + patch + manifests + tests), content optional. */
  pathScope: string[];
  coveredPathCount: number;
  manifestCount: number;
  siblingTestCount: number;
  truncated: boolean;
  measuredFromBodies: number;
  mode: 'deep' | 'thin' | 'path-only';
};

/** Manifest basenames / patterns that ground dependency + config identity. */
const MEASURE_MANIFEST_BASENAMES = new Set([
  'package.json',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  'bun.lock',
  'bun.lockb',
  'go.mod',
  'go.sum',
  'cargo.toml',
  'cargo.lock',
  'pyproject.toml',
  'requirements.txt',
  'poetry.lock',
  'pipfile',
  'pipfile.lock',
  'pom.xml',
  'build.gradle',
  'build.gradle.kts',
  'settings.gradle',
  'settings.gradle.kts',
  'gemfile',
  'gemfile.lock',
  'composer.json',
  'composer.lock',
  'tsconfig.json',
  'jsconfig.json',
  'dockerfile',
  'makefile',
]);

const MEASURE_MANIFEST_SUFFIXES = [
  '.gradle',
  '.gradle.kts',
  'cargo.toml',
  'go.mod',
  'package.json',
  'requirements.txt',
  'pyproject.toml',
  'pom.xml',
  'composer.json',
  'gemfile',
];

function normalizePath(p: string): string {
  return String(p || '')
    .replace(/\\/g, '/')
    .replace(/^\.?\//, '')
    .trim();
}

function basename(p: string): string {
  const n = normalizePath(p);
  const i = n.lastIndexOf('/');
  return (i >= 0 ? n.slice(i + 1) : n).toLowerCase();
}

export function isMeasureManifestPath(path: string): boolean {
  const base = basename(path);
  if (MEASURE_MANIFEST_BASENAMES.has(base)) return true;
  const n = normalizePath(path).toLowerCase();
  return MEASURE_MANIFEST_SUFFIXES.some((s) => n.endsWith(s));
}

function isTestPath(path: string): boolean {
  const n = normalizePath(path).toLowerCase();
  if (n.includes('/__tests__/') || n.includes('/test/') || n.includes('/tests/')) {
    return true;
  }
  if (/\.(test|spec)\.[a-z0-9]+$/i.test(n)) return true;
  if (/_test\.[a-z0-9]+$/i.test(n)) return true;
  return false;
}

function stemWithoutTestSuffix(path: string): string {
  return normalizePath(path)
    .replace(/\.(test|spec)\./i, '.')
    .replace(/_test\./i, '.')
    .replace(/\.[a-z0-9]+$/i, '');
}

/**
 * Resolve bodies + path scope for deposit/read measure of one DataPack.
 */
export function resolveMeasureSourceSet(
  input: ResolveMeasureSourceSetInput,
): ResolveMeasureSourceSetResult {
  const covered = (input.coveredSourcePaths || [])
    .map((p) => normalizePath(String(p)))
    .filter(Boolean);
  const changePaths = (input.fileChanges || [])
    .map((c) => normalizePath(String(c?.path || '')))
    .filter(Boolean);
  const pathScopeSet = new Set<string>([...covered, ...changePaths]);

  const bodies = Array.isArray(input.availableBodies)
    ? input.availableBodies
        .filter((b) => b && typeof b.path === 'string' && typeof b.content === 'string')
        .map((b) => ({ path: normalizePath(b.path), content: b.content }))
        .filter((b) => b.path.length > 0)
    : [];
  const byPath = new Map<string, MeasureSourceBody>();
  for (const b of bodies) {
    if (!byPath.has(b.path)) byPath.set(b.path, b);
  }

  // Priority buckets: covered/patch with body → manifests → sibling tests.
  const selected = new Map<string, MeasureSourceBody>();
  let manifestCount = 0;
  let siblingTestCount = 0;

  const addBody = (body: MeasureSourceBody, kind: 'core' | 'manifest' | 'test') => {
    const already = selected.has(body.path);
    if (!already) {
      selected.set(body.path, body);
      pathScopeSet.add(body.path);
    }
    if (kind === 'test' && !already) siblingTestCount += 1;
  };

  // 1) Covered + file-change paths with bodies (core).
  for (const p of pathScopeSet) {
    const body = byPath.get(p);
    if (body) addBody(body, 'core');
  }

  // 2) Measure-critical manifests anywhere in available bodies.
  for (const body of bodies) {
    if (isMeasureManifestPath(body.path)) {
      addBody(body, 'manifest');
    }
  }
  // Honest count includes manifests also selected as covered/core paths.
  manifestCount = [...selected.keys()].filter((p) => isMeasureManifestPath(p)).length;

  // 3) Sibling tests for covered production paths (optional).
  const includeTests = input.includeSiblingTests !== false;
  if (includeTests) {
    const coreStems = new Set(
      [...pathScopeSet].filter((p) => !isTestPath(p)).map(stemWithoutTestSuffix),
    );
    for (const body of bodies) {
      if (!isTestPath(body.path)) continue;
      const stem = stemWithoutTestSuffix(body.path);
      // Match same stem or under same parent dir as a covered path.
      const parent = body.path.includes('/')
        ? body.path.slice(0, body.path.lastIndexOf('/'))
        : '';
      const parentHit = [...pathScopeSet].some((p) => {
        const pp = p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : '';
        return pp && pp === parent;
      });
      if (coreStems.has(stem) || parentHit) {
        addBody(body, 'test');
      }
    }
  }

  const maxBodies =
    typeof input.maxBodies === 'number' && Number.isFinite(input.maxBodies)
      ? Math.max(0, Math.floor(input.maxBodies))
      : readMaxBodiesFromEnv();

  const allSelected = [...selected.values()];
  const truncated = allSelected.length > maxBodies;
  const sources = truncated ? allSelected.slice(0, maxBodies) : allSelected;
  const measuredFromBodies = sources.length;
  const coveredPathCount = pathScopeSet.size;
  let mode: ResolveMeasureSourceSetResult['mode'] = 'path-only';
  if (measuredFromBodies >= 8) mode = 'deep';
  else if (measuredFromBodies > 0) mode = 'thin';

  return {
    sources,
    pathScope: [...pathScopeSet],
    coveredPathCount,
    manifestCount,
    siblingTestCount,
    truncated,
    measuredFromBodies,
    mode,
  };
}

function readMaxBodiesFromEnv(): number {
  try {
    const raw = process.env.BITCODE_DEPOSIT_MAX_MEASURE_BODIES;
    if (raw == null || raw === '') return 80;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 1) return 80;
    return Math.floor(n);
  } catch {
    return 80;
  }
}
