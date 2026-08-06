/**
 * Deterministic source-safe material identity extraction.
 * Host-authoritative — models never invent composition shares or tag sets.
 *
 * Thoroughness goals:
 * - languages: full LANGUAGE_EXT_MAP + basename map + content-size weighting
 * - runtimes: multi-signal scoring (path/content/ext/framework/deps)
 * - frameworks: package-name + pattern fingerprints
 * - architecture: ARCHITECTURE_EVIDENCE catalogue
 * - dependencies: declare all discovered deps, measure project usage (refs/files)
 */

import type {
  DataPackMaterialIdentity,
  MaterialComposition,
  MaterialIdentityHonesty,
  MaterialInventory,
  MaterialInventoryItem,
  MaterialTagSet,
  MeasureMaterialIdentityInput,
} from './types';
import {
  API_STYLES,
  ARCHITECTURE_EVIDENCE,
  ARCHITECTURAL_PATTERNS,
  CAPABILITY_EVIDENCE,
  CHANGE_INTENTS,
  CONCURRENCY_MODELS,
  DATA_ARCHITECTURES,
  DEPENDENCY_CLASS_RULES,
  FRAMEWORK_FINGERPRINTS,
  LANGUAGE_BASENAME_MAP,
  LANGUAGE_EXT_MAP,
  PURPOSE_CLASSES,
  RUNTIME_EVIDENCE,
  RUNTIME_TARGETS,
  type ApiStyle,
  type ArchitecturalPattern,
  type CapabilityTag,
  type ChangeIntent,
  type ConcurrencyModel,
  type DataArchitecture,
  type DependencyClass,
  type PurposeClass,
  type RuntimeTarget,
} from './vocabularies';

/** Buyer-facing inventories: show top N by usage; totalCount preserves honesty. */
const INVENTORY_DISPLAY_CAP = 40;
/** Hard ceiling on dep discovery (DoS guard). */
const DEP_DISCOVERY_CAP = 500;
const TOP_LANGS = 12;
const MAX_SOURCE_CHARS = 80_000;
const MAX_RUNTIMES = 10;
const MAX_PATTERNS = 12;
const MAX_CAPABILITIES = 20;

type DepScope = NonNullable<MaterialInventoryItem['scope']>;

type DeclaredDep = {
  name: string;
  scope: DepScope;
  declared: boolean;
};

type UsageStats = {
  referenceCount: number;
  fileHitCount: number;
};

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return Number(n.toFixed(4));
}

function extOf(path: string): string {
  const base = path.split('/').pop() || path;
  // multi-dot: take final extension
  const dot = base.lastIndexOf('.');
  if (dot <= 0) return '';
  return base.slice(dot + 1).toLowerCase();
}

function basenameOf(path: string): string {
  return (path.split('/').pop() || path).toLowerCase();
}

function languageOf(path: string): string | null {
  const base = basenameOf(path);
  if (LANGUAGE_BASENAME_MAP[base]) return LANGUAGE_BASENAME_MAP[base];
  // multi-part basenames like docker-compose.yml already handled via ext/yaml
  const ext = extOf(path);
  if (!ext) {
    // Dockerfile without extension
    if (/^dockerfile/i.test(base)) return 'dockerfile';
    if (/^makefile/i.test(base)) return 'make';
    return null;
  }
  return LANGUAGE_EXT_MAP[ext] || ext;
}

function normalizeShares(counts: Record<string, number>): Record<string, number> {
  const total = Object.values(counts).reduce((s, v) => s + v, 0);
  if (total <= 0) return {};
  const shares: Record<string, number> = {};
  for (const [k, v] of Object.entries(counts)) {
    shares[k] = clamp01(v / total);
  }
  return shares;
}

function primaryOf(shares: Record<string, number>): string | null {
  let best: string | null = null;
  let bestV = -1;
  for (const [k, v] of Object.entries(shares)) {
    if (v > bestV) {
      best = k;
      bestV = v;
    }
  }
  return best;
}

function herfindahl(shares: Record<string, number>): number {
  return clamp01(Object.values(shares).reduce((s, v) => s + v * v, 0));
}

function collectPaths(input: MeasureMaterialIdentityInput): string[] {
  const paths = new Set<string>();
  for (const p of input.coveredSourcePaths || []) {
    if (p) paths.add(String(p));
  }
  for (const c of input.fileChanges || []) {
    if (c?.path) paths.add(String(c.path));
  }
  for (const s of input.sources || []) {
    if (s?.path) paths.add(String(s.path));
  }
  return [...paths];
}

function blobFromSources(input: MeasureMaterialIdentityInput): string {
  const parts: string[] = [];
  if (input.title) parts.push(String(input.title));
  if (input.summary) parts.push(String(input.summary));
  for (const s of input.sources || []) {
    const c = String(s.content || '').slice(0, MAX_SOURCE_CHARS);
    parts.push(c);
  }
  return parts.join('\n');
}

// ---------------------------------------------------------------------------
// Dependency parsing (multi-ecosystem)
// ---------------------------------------------------------------------------

function parsePackageJsonDeps(content: string): DeclaredDep[] {
  try {
    const j = JSON.parse(content) as Record<string, unknown>;
    const out: DeclaredDep[] = [];
    const blocks: Array<[string, DepScope]> = [
      ['dependencies', 'direct'],
      ['devDependencies', 'dev'],
      ['peerDependencies', 'peer'],
      ['optionalDependencies', 'optional'],
    ];
    for (const [key, scope] of blocks) {
      const block = j[key];
      if (block && typeof block === 'object' && !Array.isArray(block)) {
        for (const name of Object.keys(block as Record<string, unknown>)) {
          out.push({ name, scope, declared: true });
        }
      }
    }
    return out;
  } catch {
    return [];
  }
}

function parsePackageLockDeps(content: string): DeclaredDep[] {
  try {
    const j = JSON.parse(content) as { packages?: Record<string, unknown>; dependencies?: Record<string, unknown> };
    const out: DeclaredDep[] = [];
    if (j.packages && typeof j.packages === 'object') {
      for (const key of Object.keys(j.packages)) {
        if (!key || key === '') continue; // root
        // "node_modules/foo" or "node_modules/@scope/pkg"
        const name = key.replace(/^node_modules\//, '');
        if (!name || name.includes('node_modules/')) continue; // nested path noise
        out.push({ name, scope: 'transitive', declared: true });
      }
    } else if (j.dependencies && typeof j.dependencies === 'object') {
      for (const name of Object.keys(j.dependencies)) {
        out.push({ name, scope: 'transitive', declared: true });
      }
    }
    return out;
  } catch {
    return [];
  }
}

function parsePythonReqs(content: string): DeclaredDep[] {
  return content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && !l.startsWith('-'))
    .map((l) => l.split(/[=<>!~\[]/)[0]?.trim() || '')
    .filter(Boolean)
    .map((name) => ({ name, scope: 'direct' as const, declared: true }));
}

function parseCargoDeps(content: string): DeclaredDep[] {
  const out: DeclaredDep[] = [];
  let scope: DepScope = 'direct';
  let inDeps = false;
  for (const line of content.split(/\r?\n/)) {
    if (/^\s*\[dependencies\]/.test(line)) {
      inDeps = true;
      scope = 'direct';
      continue;
    }
    if (/^\s*\[dev-dependencies\]/.test(line)) {
      inDeps = true;
      scope = 'dev';
      continue;
    }
    if (/^\s*\[/.test(line)) {
      inDeps = false;
      continue;
    }
    if (inDeps) {
      const m = line.match(/^\s*([A-Za-z0-9_-]+)\s*=/);
      if (m?.[1]) out.push({ name: m[1], scope, declared: true });
    }
  }
  return out;
}

function parseGoMod(content: string): DeclaredDep[] {
  const out: DeclaredDep[] = [];
  let inRequire = false;
  for (const line of content.split(/\r?\n/)) {
    if (/^\s*require\s*\(/.test(line)) {
      inRequire = true;
      continue;
    }
    if (inRequire && /\)/.test(line)) {
      inRequire = false;
      continue;
    }
    const single = line.match(/^\s*require\s+([a-z0-9./_-]+)\s+v/i);
    if (single?.[1]) {
      out.push({ name: single[1], scope: 'direct', declared: true });
      continue;
    }
    if (inRequire) {
      const m = line.match(/^\s*([a-z0-9./_-]+)\s+v\d/i);
      if (m?.[1]) out.push({ name: m[1], scope: 'direct', declared: true });
    }
  }
  return out;
}

function parseGemfile(content: string): DeclaredDep[] {
  const out: DeclaredDep[] = [];
  for (const m of content.matchAll(/gem\s+['"]([^'"]+)['"]/g)) {
    if (m[1]) out.push({ name: m[1], scope: 'direct', declared: true });
  }
  return out;
}

function parseComposerJson(content: string): DeclaredDep[] {
  try {
    const j = JSON.parse(content) as Record<string, unknown>;
    const out: DeclaredDep[] = [];
    for (const [key, scope] of [
      ['require', 'direct'],
      ['require-dev', 'dev'],
    ] as const) {
      const block = j[key];
      if (block && typeof block === 'object' && !Array.isArray(block)) {
        for (const name of Object.keys(block as Record<string, unknown>)) {
          if (name === 'php') continue;
          out.push({ name, scope, declared: true });
        }
      }
    }
    return out;
  } catch {
    return [];
  }
}

function parsePomXml(content: string): DeclaredDep[] {
  const out: DeclaredDep[] = [];
  for (const m of content.matchAll(/<artifactId>\s*([^<]+)\s*<\/artifactId>/g)) {
    const name = m[1]?.trim();
    if (name && !['maven-compiler-plugin', 'maven-surefire-plugin'].includes(name)) {
      out.push({ name, scope: 'direct', declared: true });
    }
  }
  return out;
}

function parseGradleDeps(content: string): DeclaredDep[] {
  const out: DeclaredDep[] = [];
  // implementation "group:artifact:version" or 'group:artifact'
  for (const m of content.matchAll(
    /(?:implementation|api|compileOnly|runtimeOnly|testImplementation|compile)\s*[\(\s]*['"]([^:'"]+):([^:'"]+)/g,
  )) {
    if (m[2]) out.push({ name: m[2], scope: 'direct', declared: true });
  }
  return out;
}

function parsePyproject(content: string): DeclaredDep[] {
  const out: DeclaredDep[] = [];
  // poetry / pep621 rough: name = "x" or "pkg>=1"
  let inProjectDeps = false;
  let inToolPoetry = false;
  for (const line of content.split(/\r?\n/)) {
    if (/^\s*\[project\.optional-dependencies/i.test(line) || /^\s*dependencies\s*=\s*\[/.test(line)) {
      inProjectDeps = true;
      continue;
    }
    if (/^\s*\[tool\.poetry\.dependencies\]/i.test(line)) {
      inToolPoetry = true;
      continue;
    }
    if (/^\s*\[/.test(line)) {
      inProjectDeps = false;
      inToolPoetry = false;
      continue;
    }
    if (inToolPoetry) {
      const m = line.match(/^\s*([A-Za-z0-9_.-]+)\s*=/);
      if (m?.[1] && m[1] !== 'python') out.push({ name: m[1], scope: 'direct', declared: true });
    }
    if (inProjectDeps || /^\s*["'][A-Za-z0-9_.-]+/.test(line)) {
      const m = line.match(/["']([A-Za-z0-9_.-]+)(?:[<>=!~\[]|["'])/);
      if (m?.[1] && !['name', 'version', 'description', 'readme', 'requires-python'].includes(m[1])) {
        out.push({ name: m[1], scope: 'direct', declared: true });
      }
    }
  }
  return out;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Count how often a dependency is referenced in project source (not manifests).
 * Measures real pack usage intensity for buyers.
 */
function measureDepUsage(
  depName: string,
  sources: Array<{ path: string; content: string }>,
): UsageStats {
  const name = depName.trim();
  if (!name) return { referenceCount: 0, fileHitCount: 0 };
  // Build match needles: full name, unscoped, last path segment for go modules
  const needles = new Set<string>([name.toLowerCase()]);
  if (name.startsWith('@')) {
    const parts = name.split('/');
    if (parts[1]) needles.add(parts[1].toLowerCase());
  } else if (name.includes('/')) {
    // go module path
    needles.add(name.split('/').slice(-1)[0]!.toLowerCase());
    needles.add(name.split('/').slice(0, 3).join('/').toLowerCase());
  }

  let referenceCount = 0;
  let fileHitCount = 0;
  for (const s of sources) {
    const base = basenameOf(s.path);
    // Skip pure lock/manifest files for usage (declaration ≠ use)
    if (
      /^(package(-lock)?\.json|yarn\.lock|pnpm-lock\.yaml|go\.sum|cargo\.lock|composer\.lock|poetry\.lock)$/i.test(
        base,
      )
    ) {
      continue;
    }
    const content = String(s.content || '');
    if (!content) continue;
    const lower = content.toLowerCase();
    let fileHits = 0;
    for (const needle of needles) {
      if (needle.length < 2) continue;
      // import / require / use / from forms
      const patterns = [
        new RegExp(`from\\s+['"]${escapeRegExp(needle)}(?:['"/]|$)`, 'gi'),
        new RegExp(`import\\s+['"]${escapeRegExp(needle)}(?:['"/]|$)`, 'gi'),
        new RegExp(`require\\s*\\(\\s*['"]${escapeRegExp(needle)}(?:['"/]|$)`, 'gi'),
        new RegExp(`\\buse\\s+${escapeRegExp(needle.replace(/\//g, '::'))}\\b`, 'gi'),
        new RegExp(`import\\s+${escapeRegExp(needle.split('/').pop() || needle)}\\b`, 'gi'),
        // bare occurrence as package token (weaker)
        new RegExp(`['"]${escapeRegExp(needle)}['"]`, 'gi'),
      ];
      for (const p of patterns) {
        const matches = lower.match(p);
        if (matches) fileHits += matches.length;
      }
      // go-style: "module/path/v2"
      if (name.includes('/') && lower.includes(needle)) {
        fileHits += 1;
      }
    }
    if (fileHits > 0) {
      fileHitCount += 1;
      referenceCount += fileHits;
    }
  }
  return { referenceCount, fileHitCount };
}

function classifyDep(name: string): DependencyClass {
  const lower = name.toLowerCase();
  // Prefer framework fingerprint packageNames
  for (const fw of FRAMEWORK_FINGERPRINTS) {
    if (fw.packageNames?.some((p) => p.toLowerCase() === lower || lower.startsWith(p.toLowerCase() + '/'))) {
      return fw.class || 'framework';
    }
  }
  for (const rule of DEPENDENCY_CLASS_RULES) {
    if (rule.patterns.some((p) => p.test(lower))) return rule.class;
  }
  return 'other';
}

function emptyClassCounts(): Record<DependencyClass, number> {
  return {
    framework: 0,
    utility: 0,
    'cloud-sdk': 0,
    data: 0,
    test: 0,
    ui: 0,
    build: 0,
    security: 0,
    observability: 0,
    messaging: 0,
    ml: 0,
    other: 0,
  };
}

function extractImportsFromContent(content: string): string[] {
  const names: string[] = [];
  // JS/TS ESM + CJS
  for (const m of content.matchAll(/(?:from|import)\s+['"](@?[\w./@-]+)['"]/g)) {
    names.push(m[1] || '');
  }
  for (const m of content.matchAll(/require\s*\(\s*['"](@?[\w./@-]+)['"]\s*\)/g)) {
    names.push(m[1] || '');
  }
  // Python
  for (const m of content.matchAll(/^\s*(?:from|import)\s+([a-zA-Z0-9_.]+)/gm)) {
    const mod = (m[1] || '').split('.')[0];
    if (mod) names.push(mod);
  }
  // Go
  for (const m of content.matchAll(/^\s*"([a-z0-9./_-]+)"\s*$/gm)) {
    if (m[1] && m[1].includes('.')) names.push(m[1]);
  }
  // Rust use
  for (const m of content.matchAll(/^\s*use\s+([a-zA-Z0-9_]+)::/gm)) {
    if (m[1]) names.push(m[1]);
  }
  // Java/Kotlin import
  for (const m of content.matchAll(/^\s*import\s+([a-zA-Z0-9_.]+)/gm)) {
    const parts = (m[1] || '').split('.');
    if (parts.length >= 2) names.push(parts.slice(0, 2).join('.'));
  }
  // PHP use
  for (const m of content.matchAll(/^\s*use\s+([A-Za-z0-9_\\]+)/gm)) {
    if (m[1]) names.push(m[1].replace(/\\/g, '/'));
  }
  // Ruby require
  for (const m of content.matchAll(/require(?:_relative)?\s+['"]([^'"]+)['"]/g)) {
    if (m[1]) names.push(m[1]);
  }
  return names
    .map((raw) => {
      if (!raw || raw.startsWith('.') || raw.startsWith('/') || raw.startsWith('node:')) return '';
      if (raw.startsWith('@')) return raw.split('/').slice(0, 2).join('/');
      // strip version suffixes
      return raw.split('/')[0] || '';
    })
    .filter((n) => n.length > 1 && n.length < 96);
}

function extractAllDeps(
  sources: Array<{ path: string; content: string }>,
): { declared: Map<string, DeclaredDep>; importOnly: Set<string> } {
  const declared = new Map<string, DeclaredDep>();
  const importOnly = new Set<string>();

  const addDeclared = (d: DeclaredDep) => {
    const key = d.name.trim();
    if (!key || declared.size >= DEP_DISCOVERY_CAP) return;
    const prev = declared.get(key);
    // Prefer more specific scope (direct > peer > optional > dev > transitive)
    const rank: Record<DepScope, number> = {
      direct: 5,
      peer: 4,
      optional: 3,
      dev: 2,
      transitive: 1,
      unknown: 0,
    };
    if (!prev || rank[d.scope] > rank[prev.scope]) {
      declared.set(key, { ...d, name: key });
    }
  };

  for (const s of sources) {
    const base = basenameOf(s.path);
    const content = String(s.content || '');
    if (base === 'package.json') parsePackageJsonDeps(content).forEach(addDeclared);
    else if (base === 'package-lock.json' || base === 'npm-shrinkwrap.json')
      parsePackageLockDeps(content).forEach(addDeclared);
    else if (base === 'requirements.txt' || base.endsWith('.in'))
      parsePythonReqs(content).forEach(addDeclared);
    else if (base === 'pyproject.toml') parsePyproject(content).forEach(addDeclared);
    else if (base === 'cargo.toml') parseCargoDeps(content).forEach(addDeclared);
    else if (base === 'go.mod') parseGoMod(content).forEach(addDeclared);
    else if (base === 'gemfile') parseGemfile(content).forEach(addDeclared);
    else if (base === 'composer.json') parseComposerJson(content).forEach(addDeclared);
    else if (base === 'pom.xml') parsePomXml(content).forEach(addDeclared);
    else if (base.endsWith('.gradle') || base.endsWith('.gradle.kts'))
      parseGradleDeps(content).forEach(addDeclared);

    for (const n of extractImportsFromContent(content)) {
      if (!declared.has(n)) importOnly.add(n);
    }
  }
  return { declared, importOnly };
}

// ---------------------------------------------------------------------------
// Frameworks / runtimes / patterns
// ---------------------------------------------------------------------------

function detectFrameworks(
  blob: string,
  depNames: string[],
  sources: Array<{ path: string; content: string }>,
): MaterialInventoryItem[] {
  const depSet = new Set(depNames.map((d) => d.toLowerCase()));
  const hay = `${blob}\n${depNames.join('\n')}`;
  const items: MaterialInventoryItem[] = [];

  for (const fw of FRAMEWORK_FINGERPRINTS) {
    let hit = false;
    let evidence = 'fingerprint';
    if (fw.packageNames?.length) {
      for (const pkg of fw.packageNames) {
        if (depSet.has(pkg.toLowerCase()) || [...depSet].some((d) => d === pkg.toLowerCase() || d.startsWith(pkg.toLowerCase() + '/'))) {
          hit = true;
          evidence = 'package';
          break;
        }
      }
    }
    if (!hit && fw.patterns.some((p) => p.test(hay))) {
      hit = true;
      evidence = 'pattern';
    }
    if (!hit) continue;

    const usage = measureDepUsage(fw.packageNames?.[0] || fw.id, sources);
    // Also score pattern hits lightly
    const patternBoost = fw.patterns.reduce((s, p) => s + ((hay.match(p) || []).length), 0);
    items.push({
      id: fw.id,
      label: fw.label,
      class: fw.class || 'framework',
      evidence,
      declared: evidence === 'package',
      fileHitCount: usage.fileHitCount,
      referenceCount: usage.referenceCount + patternBoost,
      scope: evidence === 'package' ? 'direct' : 'unknown',
    });
  }

  // Sort by usage intensity then id
  items.sort(
    (a, b) =>
      (b.referenceCount || 0) - (a.referenceCount || 0) ||
      (b.fileHitCount || 0) - (a.fileHitCount || 0) ||
      a.id.localeCompare(b.id),
  );
  return items.slice(0, INVENTORY_DISPLAY_CAP);
}

/**
 * Multi-signal runtime detection with scoring.
 * Combines: framework hints, path/basename/content evidence, language extensions.
 */
function detectRuntimes(
  frameworks: MaterialInventoryItem[],
  paths: string[],
  blob: string,
  depNames: string[],
): RuntimeTarget[] {
  const scores = new Map<RuntimeTarget, number>();
  const bump = (r: RuntimeTarget, n: number) => {
    if (!RUNTIME_TARGETS.includes(r)) return;
    scores.set(r, (scores.get(r) || 0) + n);
  };

  // 1) Framework → runtime hints
  for (const fw of frameworks) {
    const spec = FRAMEWORK_FINGERPRINTS.find((f) => f.id === fw.id);
    const weight = 2 + Math.min(3, Math.floor((fw.referenceCount || 0) / 3));
    for (const r of spec?.runtimeHints || []) bump(r, weight);
  }

  // 2) Catalogue RUNTIME_EVIDENCE
  const basenames = paths.map(basenameOf);
  const pathBlob = paths.join('\n');
  for (const row of RUNTIME_EVIDENCE) {
    let hit = 0;
    const w = row.weight ?? 1;
    if (row.pathPatterns?.some((p) => paths.some((path) => p.test(path)) || p.test(pathBlob))) {
      hit += w;
    }
    if (row.basenamePatterns?.some((p) => basenames.some((b) => p.test(b)))) {
      hit += w;
    }
    if (row.contentPatterns?.some((p) => p.test(blob))) {
      hit += w;
    }
    if (row.extHints?.length) {
      const extHit = paths.some((path) => {
        const ext = extOf(path);
        return row.extHints!.includes(ext);
      });
      if (extHit) hit += w;
    }
    if (hit > 0) bump(row.runtime, hit);
  }

  // 3) Language-extension soft signals (never sole evidence if frameworks disagree)
  const langs = new Set(paths.map(languageOf).filter(Boolean) as string[]);
  if (langs.has('typescript') || langs.has('javascript')) {
    if (/document\.|window\.|HTMLElement|localStorage/i.test(blob)) bump('browser', 2);
    if (/process\.env|require\(|from ['"]node:|__dirname|module\.exports/i.test(blob)) bump('node', 2);
    if (depNames.some((d) => /^(next|express|fastify|@nestjs)/i.test(d))) bump('node', 2);
  }
  if (langs.has('python')) bump('python', 2);
  if (langs.has('go')) bump('go', 2);
  if (langs.has('rust')) bump('rust', 2);
  if (langs.has('java') || langs.has('kotlin') || langs.has('scala')) bump('jvm', 2);
  if (langs.has('csharp') || langs.has('fsharp')) bump('dotnet', 2);
  if (langs.has('swift') || langs.has('objective-c')) bump('ios', 2);
  if (langs.has('dart')) {
    bump('dart-vm', 1);
    if (/package:flutter/i.test(blob)) bump('flutter', 3);
  }
  if (langs.has('ruby')) bump('ruby', 2);
  if (langs.has('php')) bump('php', 2);
  if (langs.has('elixir')) bump('elixir-beam', 2);
  if (langs.has('erlang')) bump('erlang-beam', 2);
  if (langs.has('haskell')) bump('haskell-rts', 2);
  if (langs.has('lua')) bump('lua', 1);
  if (langs.has('r')) bump('r', 1);
  if (langs.has('julia')) bump('julia', 1);
  if (langs.has('solidity') || langs.has('vyper')) {
    // chain contracts are not a classic "runtime" in RUNTIME_TARGETS; leave node/foundry via frameworks
  }
  if (langs.has('dockerfile') || paths.some((p) => /Dockerfile/i.test(p))) bump('docker', 2);
  if (paths.some((p) => /kustomization|Chart\.yaml|deployment\.ya?ml/i.test(p))) bump('kubernetes', 2);

  // 4) Dep-name runtime cues
  for (const d of depNames) {
    const l = d.toLowerCase();
    if (l === 'electron') bump('electron', 3);
    if (l.includes('tauri')) bump('tauri', 3);
    if (l === 'react-native' || l.startsWith('react-native/')) bump('react-native', 3);
    if (l.includes('cloudflare') || l.includes('wrangler')) bump('cloudflare-workers', 2);
    if (l.includes('aws-lambda') || l.includes('@aws-sdk')) bump('aws-lambda', 1);
  }

  if (scores.size === 0) {
    return ['unspecified'];
  }

  // Drop unspecified if anything else scored
  scores.delete('unspecified');

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([r]) => r)
    .filter((r) => RUNTIME_TARGETS.includes(r))
    .slice(0, MAX_RUNTIMES);
}

function detectPurposes(
  paths: string[],
  frameworks: MaterialInventoryItem[],
  blob: string,
  runtimes: RuntimeTarget[],
): { tags: PurposeClass[]; primary: PurposeClass } {
  const scores = new Map<PurposeClass, number>();
  const bump = (p: PurposeClass, n = 1) => {
    if (!PURPOSE_CLASSES.includes(p)) return;
    scores.set(p, (scores.get(p) || 0) + n);
  };

  for (const fw of frameworks) {
    const spec = FRAMEWORK_FINGERPRINTS.find((f) => f.id === fw.id);
    for (const h of spec?.purposeHints || []) bump(h, 2 + Math.min(2, Math.floor((fw.referenceCount || 0) / 5)));
  }
  for (const r of runtimes) {
    if (r === 'ios' || r === 'macos') bump('mobile-ios', 2);
    if (r === 'android') bump('mobile-android', 2);
    if (r === 'react-native' || r === 'flutter') bump('mobile-cross', 3);
    if (r === 'electron' || r === 'tauri' || r === 'dotnet-maui') bump('desktop-app', 3);
    if (r === 'kubernetes' || r === 'docker') bump('infra-iac', 1);
    if (r === 'aws-lambda' || r === 'cloudflare-workers' || r === 'vercel-edge') bump('system-backend', 1);
    if (r === 'unity' || r === 'unreal') bump('game', 3);
    if (r === 'browser' && !runtimes.includes('node')) bump('frontend-spa', 1);
  }

  if (paths.some((p) => /\.(swift|m|mm)$/i.test(p) || /ios\//i.test(p))) bump('mobile-ios', 2);
  if (paths.some((p) => /android/i.test(p) || p.endsWith('.kt'))) bump('mobile-android', 2);
  if (paths.some((p) => /\.tf$/i.test(p) || /terraform|helm|k8s|kubernetes/i.test(p)))
    bump('infra-iac', 2);
  if (paths.some((p) => /pipeline|etl|airflow|dbt/i.test(p))) bump('data-pipeline', 2);
  if (/train|torch|tensorflow|model\.py/i.test(blob)) bump('ml-training', 2);
  if (/inferenc|serving|onnx/i.test(blob)) bump('ml-inference', 1);
  if (/mlops|feature.?store|model.?registry/i.test(blob)) bump('ml-ops', 2);
  if (paths.some((p) => /cli|bin\/|cmd\//i.test(p))) {
    bump('cli-tool', 2);
    bump('developer-tooling', 1);
  }
  if (paths.every((p) => /\.(md|txt|rst|adoc)$/i.test(p)) && paths.length > 0) bump('docs-only', 3);
  if (
    paths.some((p) => /test|spec|__tests__/i.test(p)) &&
    paths.filter((p) => /test|spec/i.test(p)).length / Math.max(1, paths.length) > 0.6
  ) {
    bump('test-harness', 2);
  }
  if (/\.sol\b|solidity|hardhat|foundry|ethers/i.test(blob)) bump('blockchain-smart-contract', 3);
  if (/design.system|storybook|tokens\.json/i.test(blob)) bump('design-system', 2);
  if (/sast|cve|vulnerability|semgrep|trivy/i.test(blob)) bump('security-tooling', 2);
  if (/prometheus|grafana|opentelemetry|datadog/i.test(blob)) bump('observability-tooling', 1);
  if (/express|fastify|nestjs|flask|django|spring|chi|gin|axum|ktor/i.test(blob))
    bump('system-backend', 1);
  if (/react|next|vue|angular|svelte|remix|nuxt/i.test(blob)) {
    bump('full-stack-web', 1);
    if (!/api\/|server\/|backend/i.test(blob)) bump('frontend-spa', 1);
  }
  if (/library|sdk|package exports/i.test(blob) || paths.some((p) => /src\/index\.(ts|js)$/i.test(p)))
    bump('library-sdk', 1);

  if (scores.size === 0) return { tags: ['unspecified'], primary: 'unspecified' };
  const ordered = [...scores.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const tags = ordered
    .map(([k]) => k)
    .filter((k) => PURPOSE_CLASSES.includes(k))
    .slice(0, 5) as PurposeClass[];
  return { tags: tags.length ? tags : ['unspecified'], primary: tags[0] || 'unspecified' };
}

function detectPatterns(blob: string, paths: string[]): ArchitecturalPattern[] {
  const scores = new Map<ArchitecturalPattern, number>();
  const pathBlob = paths.join('\n');
  for (const row of ARCHITECTURE_EVIDENCE) {
    let hit = 0;
    const w = row.weight ?? 1;
    if (row.contentPatterns?.some((p) => p.test(blob))) hit += w;
    if (row.pathPatterns?.some((p) => paths.some((path) => p.test(path)) || p.test(pathBlob)))
      hit += w;
    if (hit > 0) scores.set(row.pattern, (scores.get(row.pattern) || 0) + hit);
  }
  if (scores.size === 0) return ['unspecified'];
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([p]) => p)
    .filter((p) => ARCHITECTURAL_PATTERNS.includes(p))
    .slice(0, MAX_PATTERNS);
}

function detectApiStyles(blob: string, paths: string[]): ApiStyle[] {
  const found = new Set<ApiStyle>();
  if (/graphql|gql`|apollo|yoga/i.test(blob) || paths.some((p) => /\.graphql$/i.test(p)))
    found.add('graphql');
  if (/\bgrpc\b|@grpc\//i.test(blob) || paths.some((p) => /\.proto$/i.test(p))) found.add('grpc');
  if (/websocket|socket\.io|\bws\b/i.test(blob)) found.add('websocket');
  if (/text\/event-stream|EventSource|ServerSentEvent|\bsse\b/i.test(blob)) found.add('sse');
  if (/router\.(get|post|put|delete)|app\.(get|post)|@Get\(|@Post\(|express\.Router|\bREST\b|OpenAPI/i.test(blob))
    found.add('rest');
  if (/commander|yargs|click\.command|cobra\.Command|argparse|clap::/i.test(blob)) found.add('cli');
  if (/\btrpc\b|@trpc\//i.test(blob)) found.add('trpc');
  if (/json-rpc|jsonrpc/i.test(blob)) found.add('json-rpc');
  if (/\bSOAP\b|wsdl/i.test(blob)) found.add('soap');
  if (/\bOData\b/i.test(blob)) found.add('odata');
  if (/rpc\(/i.test(blob)) found.add('rpc');
  if (/webhook/i.test(blob)) {
    found.add('webhook-consumer');
    found.add('webhook-producer');
  }
  if (/\bmqtt\b/i.test(blob)) found.add('mqtt');
  if (/\bamqp\b|rabbitmq/i.test(blob)) found.add('amqp');
  if (found.size === 0) found.add(paths.some((p) => /cli|bin\//i.test(p)) ? 'cli' : 'unspecified');
  return [...found].filter((s) => API_STYLES.includes(s)).slice(0, 6);
}

function detectDataArch(blob: string, paths: string[]): DataArchitecture[] {
  const found = new Set<DataArchitecture>();
  if (
    /prisma|typeorm|sequelize|sqlalchemy|knex|drizzle|\.sql\b|postgres|mysql|sqlite|sqlserver/i.test(
      blob,
    ) ||
    paths.some((p) => /\.sql$/i.test(p))
  )
    found.add('sql-centric');
  if (/mongoose|mongodb|document.?store|firestore|dynamodb/i.test(blob)) found.add('document');
  if (/kafka|event.?store|event.?log|kinesis|pulsar/i.test(blob)) found.add('event-log');
  if (/redis|memcached|kv.?store|key.?value/i.test(blob)) found.add('kv-cache');
  if (/neo4j|graph.?db|cypher|dgraph/i.test(blob)) found.add('graph');
  if (/csv|parquet|batch.?job|etl|arrow/i.test(blob)) found.add('file-batch');
  if (/elasticsearch|opensearch|solr|meilisearch|typesense/i.test(blob)) found.add('search-index');
  if (/timeseries|influx|prometheus|timescale/i.test(blob)) found.add('time-series');
  if (/clickhouse|bigquery|snowflake|redshift|duckdb|columnar/i.test(blob)) found.add('columnar');
  if (/s3|gcs|azure.?blob|minio|object.?storage/i.test(blob)) found.add('object-storage');
  if (found.size > 2) found.add('multi-model');
  if (found.size === 0) found.add('unspecified');
  return [...found].filter((d) => DATA_ARCHITECTURES.includes(d)).slice(0, 6);
}

function detectConcurrency(blob: string): ConcurrencyModel[] {
  const found = new Set<ConcurrencyModel>();
  if (/async\s+def|async\s+function|Promise\.|await\s+|asyncio/i.test(blob)) found.add('async');
  if (/worker|queue|bullmq|sidekiq|celery|sqs|resque/i.test(blob)) found.add('worker-queue');
  if (/actor|akka|orleans/i.test(blob)) found.add('actor');
  if (/rxjs|Observable|reactive|Project Reactor|Mono\.|Flux\./i.test(blob)) found.add('reactive');
  if (/goroutine|chan\s+|select\s*\{/i.test(blob) || /\bcsp\b/i.test(blob)) found.add('csp-channels');
  if (/Thread|pthread|std::thread|threading\./i.test(blob)) found.add('threads');
  if (/coroutine|kotlinx\.coroutines|launch\s*\{/i.test(blob)) found.add('coroutines');
  if (/cuda|gpu|OpenCL/i.test(blob)) found.add('gpu-parallel');
  if (found.size === 0) found.add('sync-dominant');
  return [...found].filter((c) => CONCURRENCY_MODELS.includes(c)).slice(0, 5);
}

function detectChangeIntent(
  input: MeasureMaterialIdentityInput,
  blob: string,
): ChangeIntent[] {
  const ops = (input.fileChanges || []).map((c) => String(c.op || '').toLowerCase());
  const paths = collectPaths(input);
  const found = new Set<ChangeIntent>();
  const text = `${input.title || ''} ${input.summary || ''} ${blob.slice(0, 4000)}`;
  if (/fix|bug|hotfix|patch/i.test(text)) found.add('bug-fix');
  if (/refactor|cleanup|rename/i.test(text)) found.add('refactor');
  if (/security|harden|cve|auth/i.test(text)) found.add('hardening');
  if (/doc|readme|guide/i.test(text) || paths.every((p) => /\.md$/i.test(p))) found.add('docs');
  if (paths.every((p) => /test|spec/i.test(p))) found.add('test-only');
  if (paths.every((p) => /config|\.ya?ml$|\.env|toml$/i.test(p))) found.add('config');
  if (/dependabot|bump|upgrade dep|package\.json/i.test(text)) found.add('dependency-bump');
  if (/perf|performance|optimi[sz]e|latency/i.test(text)) found.add('performance');
  if (/migrat/i.test(text)) found.add('migration');
  if (/feat|feature|add\b|implement/i.test(text) || ops.includes('add') || ops.includes('create'))
    found.add('feature-add');
  if (found.size === 0) found.add('unspecified');
  return [...found].filter((c) => CHANGE_INTENTS.includes(c)).slice(0, 4);
}

function detectCapabilities(blob: string): CapabilityTag[] {
  const tags: CapabilityTag[] = [];
  for (const row of CAPABILITY_EVIDENCE) {
    if (row.patterns.some((p) => p.test(blob))) tags.push(row.tag);
  }
  return tags.slice(0, MAX_CAPABILITIES);
}

// ---------------------------------------------------------------------------
// Scoring helpers for companion scalars
// ---------------------------------------------------------------------------

function contractHits(paths: string[], blob: string): number {
  let n = 0;
  for (const p of paths) {
    if (/\.(proto|graphql|gql|openapi|swagger)$/i.test(p) || /openapi|swagger/i.test(p)) n += 1;
  }
  if (/openapi|swagger|json.?schema|protobuf|GraphQLSchema|AsyncAPI/i.test(blob)) n += 2;
  return n;
}

function typeSafetyScore(paths: string[], blob: string): number {
  const typed = paths.filter((p) =>
    /\.(ts|tsx|pyi|kt|swift|rs|java|cs|fs)$/i.test(p),
  ).length;
  const total = Math.max(
    1,
    paths.filter((p) =>
      /\.(ts|tsx|js|jsx|py|rb|go|rs|java|kt|swift|cs|php)$/i.test(p),
    ).length,
  );
  let score = typed / total;
  if (/strict|noImplicitAny|mypy|pyright|tsc --strict|eslint.*type/i.test(blob)) score += 0.15;
  return clamp01(score);
}

function observabilityScore(blob: string): number {
  let hits = 0;
  for (const p of [
    /opentelemetry/i,
    /prometheus/i,
    /sentry/i,
    /datadog/i,
    /logger\./i,
    /metrics\./i,
    /span\./i,
    /trace\./i,
    /pino|winston/i,
  ]) {
    if (p.test(blob)) hits += 1;
  }
  return clamp01(hits / 6);
}

function generatedMass(paths: string[], blob: string): number {
  let gen = 0;
  for (const p of paths) {
    if (/generated|gen\/|\.g\.|\.pb\.|node_modules|__generated__|\.gen\./i.test(p)) gen += 1;
  }
  if (/AUTO-GENERATED|Code generated by|DO NOT EDIT/i.test(blob)) gen += 3;
  return clamp01(gen / Math.max(3, paths.length * 0.2));
}

function testAsSpecScore(paths: string[], blob: string): number {
  const tests = paths.filter((p) => /test|spec|__tests__/i.test(p)).length;
  const ratio = tests / Math.max(1, paths.length);
  let strength = ratio;
  if (/expect\(|assert |should\(|describe\(|it\(|@Test/i.test(blob)) strength += 0.2;
  if (/property.?based|fuzz|snapshot/i.test(blob)) strength += 0.15;
  return clamp01(strength);
}

function portabilityScore(blob: string, paths: string[]): number {
  let penalties = 0;
  if (/C:\\\\|\/Users\/|\/home\/[a-z]/i.test(blob)) penalties += 0.35;
  if (/localhost:\d+|127\.0\.0\.1/i.test(blob)) penalties += 0.1;
  if (paths.some((p) => p.includes('node_modules'))) penalties += 0.1;
  if (/process\.env|os\.environ|ENV\[/i.test(blob)) penalties += 0.05;
  return clamp01(1 - penalties);
}

function copyleftRisk(blob: string, depNames: string[]): number {
  let risk = 0;
  if (/\bGPL\b|\bAGPL\b|\bLGPL\b/i.test(blob)) risk += 0.5;
  if (/\bMPL\b|\bSSPL\b/i.test(blob)) risk += 0.25;
  for (const n of depNames) {
    if (/^gpl|agpl|busybox|readline/i.test(n)) risk += 0.15;
  }
  return clamp01(risk);
}

function externalServiceCoupling(blob: string, frameworks: MaterialInventoryItem[]): number {
  const cloud = frameworks.filter((f) =>
    ['aws-sdk', 'azure-sdk', 'gcp-sdk', 'stripe', 'kubernetes', 'auth0', 'clerk', 'sentry'].includes(
      f.id,
    ),
  ).length;
  let hits = cloud;
  for (const p of [
    /\.amazonaws\.com/i,
    /api\.stripe\.com/i,
    /googleapis/i,
    /azure\./i,
    /sentry\.io/i,
    /openai\.com/i,
    /api\.github\.com/i,
  ]) {
    if (p.test(blob)) hits += 1;
  }
  return clamp01(hits / 8);
}

function composition(
  kind: string,
  label: string,
  shares: Record<string, number>,
  honesty: MaterialIdentityHonesty,
): MaterialComposition {
  const entries = Object.entries(shares).sort((a, b) => b[1] - a[1]);
  const top = entries.slice(0, TOP_LANGS);
  const rest = entries.slice(TOP_LANGS);
  const out: Record<string, number> = {};
  for (const [k, v] of top) out[k] = v;
  if (rest.length) {
    out.other = clamp01(rest.reduce((s, [, v]) => s + v, 0));
  }
  return {
    kind,
    label,
    shares: out,
    primary: primaryOf(out),
    honesty,
  };
}

function tagSet(
  kind: string,
  label: string,
  tags: string[],
  primary: string | null,
  honesty: MaterialIdentityHonesty,
): MaterialTagSet {
  return { kind, label, tags, primary, honesty };
}

function inventory(
  kind: string,
  label: string,
  items: MaterialInventoryItem[],
  honesty: MaterialIdentityHonesty,
  totalCount?: number,
): MaterialInventory {
  return {
    kind,
    label,
    items: items.slice(0, INVENTORY_DISPLAY_CAP),
    totalCount: totalCount ?? items.length,
    honesty,
  };
}

/**
 * Build full dependency inventory with usage shares.
 * Lists every discovered dep (capped for display by usage rank).
 */
function buildDependencyInventory(
  declared: Map<string, DeclaredDep>,
  importOnly: Set<string>,
  sources: Array<{ path: string; content: string }>,
  honesty: MaterialIdentityHonesty,
): { inventory: MaterialInventory; classShares: Record<string, number>; allNames: string[] } {
  const allNames = new Set<string>([...declared.keys(), ...importOnly]);
  const items: MaterialInventoryItem[] = [];
  let totalRefs = 0;

  for (const name of allNames) {
    if (items.length >= DEP_DISCOVERY_CAP) break;
    const decl = declared.get(name);
    const usage = measureDepUsage(name, sources);
    totalRefs += usage.referenceCount;
    items.push({
      id: name,
      label: name,
      class: classifyDep(name),
      evidence: decl ? 'manifest' : 'import',
      declared: Boolean(decl?.declared),
      scope: decl?.scope || (importOnly.has(name) ? 'unknown' : 'unknown'),
      fileHitCount: usage.fileHitCount,
      referenceCount: usage.referenceCount,
      usageShare: 0, // filled below
    });
  }

  // Usage share relative to this pack's reference mass (or equal if zero refs)
  const refMass = totalRefs > 0 ? totalRefs : items.length || 1;
  for (const item of items) {
    const mass =
      totalRefs > 0
        ? item.referenceCount || 0
        : item.declared
          ? 1
          : 0.5;
    item.usageShare = clamp01(mass / refMass);
  }

  items.sort(
    (a, b) =>
      (b.usageShare || 0) - (a.usageShare || 0) ||
      (b.referenceCount || 0) - (a.referenceCount || 0) ||
      a.id.localeCompare(b.id),
  );

  const classes = emptyClassCounts();
  for (const item of items) {
    const cls = (item.class as DependencyClass) || 'other';
    // Weight class by usage share so class mix reflects project usage not just counts
    classes[cls] = (classes[cls] || 0) + (item.usageShare || 0) + 0.01;
  }

  return {
    inventory: inventory(
      'dependencies',
      'Dependencies (by project usage)',
      items,
      honesty,
      allNames.size,
    ),
    classShares: normalizeShares(classes as unknown as Record<string, number>),
    allNames: [...allNames].sort(),
  };
}

/**
 * Measure full material identity from paths + optional source samples.
 */
export function measureDataPackMaterialIdentity(
  input: MeasureMaterialIdentityInput,
): DataPackMaterialIdentity {
  const paths = collectPaths(input);
  const sources = (input.sources || []).map((s) => ({
    path: String(s.path || ''),
    content: String(s.content || ''),
  }));
  const blob = blobFromSources(input);
  const hasEvidence = paths.length > 0 || blob.length > 20;
  const honesty: MaterialIdentityHonesty = hasEvidence
    ? sources.some((s) => s.content.length > 0)
      ? 'measured'
      : 'classified'
    : 'insufficient_evidence';

  // Language mix: path counts + content-size boost
  const langCounts: Record<string, number> = {};
  for (const p of paths) {
    const lang = languageOf(p);
    if (!lang) continue;
    langCounts[lang] = (langCounts[lang] || 0) + 1;
  }
  for (const s of sources) {
    const lang = languageOf(s.path);
    if (!lang) continue;
    const boost = Math.min(8, Math.max(1, Math.ceil(s.content.length / 1500)));
    langCounts[lang] = (langCounts[lang] || 0) + boost;
  }
  const langShares = normalizeShares(langCounts);
  const langConcentration = herfindahl(langShares);

  const { declared, importOnly } = extractAllDeps(sources);
  // Path-only imports when no sources content
  if (sources.length === 0 && blob) {
    for (const n of extractImportsFromContent(blob)) importOnly.add(n);
  }

  const {
    inventory: depInventory,
    classShares: depClassShares,
    allNames: uniqueDeps,
  } = buildDependencyInventory(declared, importOnly, sources, honesty);

  const frameworks = detectFrameworks(blob, uniqueDeps, sources);
  // Attach usageShare to frameworks relative to each other
  const fwRef = frameworks.reduce((s, f) => s + (f.referenceCount || 0), 0) || 1;
  for (const f of frameworks) {
    f.usageShare = clamp01((f.referenceCount || 0) / fwRef);
  }

  const runtimes = detectRuntimes(frameworks, paths, blob, uniqueDeps);
  const purposes = detectPurposes(paths, frameworks, blob, runtimes);
  const patterns = detectPatterns(blob, paths);
  const apiStyles = detectApiStyles(blob, paths);
  const dataArch = detectDataArch(blob, paths);
  const concurrency = detectConcurrency(blob);
  const changeIntents = detectChangeIntent(input, blob);
  const capabilities = detectCapabilities(blob);

  const compositions: MaterialComposition[] = [
    composition('language-mix', 'Language mix', langShares, honesty),
    composition('dependency-class-mix', 'Dependency class mix (usage-weighted)', depClassShares, honesty),
  ];

  const inventories: MaterialInventory[] = [
    inventory('frameworks', 'Frameworks & platforms', frameworks, honesty, frameworks.length),
    depInventory,
  ];

  const tagSets: MaterialTagSet[] = [
    tagSet('purpose', 'System purpose', purposes.tags, purposes.primary, honesty),
    tagSet(
      'architectural-patterns',
      'Architectural patterns',
      patterns,
      patterns[0] || null,
      honesty,
    ),
    tagSet('api-styles', 'API styles', apiStyles, apiStyles[0] || null, honesty),
    tagSet('data-architecture', 'Data architecture', dataArch, dataArch[0] || null, honesty),
    tagSet('concurrency-model', 'Concurrency model', concurrency, concurrency[0] || null, honesty),
    tagSet('change-intent', 'Change intent', changeIntents, changeIntents[0] || null, honesty),
    tagSet('capabilities', 'Capabilities', capabilities, capabilities[0] || null, honesty),
    tagSet('runtimes', 'Runtime targets', runtimes, runtimes[0] || null, honesty),
  ];

  const purposeClear = purposes.primary !== 'unspecified' ? 0.85 : 0.15;
  const patternClear =
    patterns[0] !== 'unspecified' ? clamp01(0.35 + patterns.length * 0.08) : 0.1;
  const apiClear = apiStyles[0] !== 'unspecified' ? clamp01(0.45 + apiStyles.length * 0.1) : 0.1;
  const dataClear = dataArch[0] !== 'unspecified' ? clamp01(0.45 + dataArch.length * 0.1) : 0.1;
  const concClear =
    concurrency[0] !== 'sync-dominant' || concurrency.length > 1
      ? clamp01(0.4 + concurrency.length * 0.12)
      : 0.3;
  const intentClear =
    changeIntents[0] !== 'unspecified' ? clamp01(0.5 + changeIntents.length * 0.12) : 0.2;

  const contracts = contractHits(paths, blob);
  const classBalance =
    Object.keys(depClassShares).length > 1
      ? clamp01(1 - herfindahl(depClassShares))
      : uniqueDeps.length > 0
        ? 0.2
        : 0;

  const scalarVolumes: Record<string, number> = {
    'language-concentration': langConcentration,
    'framework-surface': clamp01(frameworks.length / 8),
    'purpose-clarity': purposeClear,
    'dependency-class-balance': classBalance,
    'external-service-coupling': externalServiceCoupling(blob, frameworks),
    'contract-surface': clamp01(contracts / 5),
    'type-safety-pressure': typeSafetyScore(paths, blob),
    'observability-surface': observabilityScore(blob),
    'generated-code-mass': generatedMass(paths, blob),
    'test-as-spec': testAsSpecScore(paths, blob),
    portability: portabilityScore(blob, paths),
    'architectural-pattern-density': patternClear,
    'capability-surface': clamp01(capabilities.length / 10),
    'copyleft-risk-mass': copyleftRisk(blob, uniqueDeps),
    'change-intent-clarity': intentClear,
    'data-architecture-clarity': dataClear,
    'concurrency-model-clarity': concClear,
    'api-style-clarity': apiClear,
    'substitution-density':
      typeof input.substitutionDensity === 'number' && Number.isFinite(input.substitutionDensity)
        ? clamp01(input.substitutionDensity)
        : 0,
  };

  const corpusTokens = buildCorpusTokens({
    compositions,
    inventories,
    tagSets,
    scalarVolumes,
  });

  return {
    schema: 'bitcode.data-pack.material-identity',
    version: 1,
    compositions,
    inventories,
    tagSets,
    scalarVolumes,
    corpusTokens,
    honesty,
    measuredAt: new Date().toISOString(),
  };
}

export function buildCorpusTokens(parts: {
  compositions: MaterialComposition[];
  inventories: MaterialInventory[];
  tagSets: MaterialTagSet[];
  scalarVolumes: Record<string, number>;
}): string[] {
  const tokens = new Set<string>();
  for (const c of parts.compositions) {
    tokens.add(`composition:${c.kind}`);
    if (c.primary) tokens.add(`${c.kind}:${c.primary}`);
    for (const [k, v] of Object.entries(c.shares)) {
      if (v >= 0.05) tokens.add(`${c.kind}:${k}`);
      if (v >= 0.2) tokens.add(`${c.kind}:${k}:major`);
    }
  }
  for (const inv of parts.inventories) {
    // Index top usage deps + all frameworks
    const ranked = [...inv.items].sort(
      (a, b) => (b.usageShare || 0) - (a.usageShare || 0) || a.id.localeCompare(b.id),
    );
    const limit = inv.kind === 'dependencies' ? 30 : ranked.length;
    for (const item of ranked.slice(0, limit)) {
      tokens.add(`${inv.kind}:${item.id}`);
      tokens.add(item.id);
      if (item.class) tokens.add(`dep-class:${item.class}`);
      if ((item.usageShare || 0) >= 0.1) tokens.add(`dep-used:${item.id}`);
    }
  }
  for (const ts of parts.tagSets) {
    for (const t of ts.tags) {
      tokens.add(`${ts.kind}:${t}`);
      tokens.add(t);
    }
    if (ts.primary) tokens.add(`${ts.kind}-primary:${ts.primary}`);
  }
  for (const [k, v] of Object.entries(parts.scalarVolumes)) {
    if (v > 0) tokens.add(`absolute:${k}`);
    if (v >= 0.5) tokens.add(`${k}:high`);
  }
  return [...tokens].sort();
}

export function emptyMaterialIdentity(): DataPackMaterialIdentity {
  return measureDataPackMaterialIdentity({});
}

export function listMaterialIdentityScalarKinds(): string[] {
  return [
    'language-concentration',
    'framework-surface',
    'purpose-clarity',
    'dependency-class-balance',
    'external-service-coupling',
    'contract-surface',
    'type-safety-pressure',
    'observability-surface',
    'generated-code-mass',
    'test-as-spec',
    'portability',
    'architectural-pattern-density',
    'capability-surface',
    'copyleft-risk-mass',
    'change-intent-clarity',
    'data-architecture-clarity',
    'concurrency-model-clarity',
    'api-style-clarity',
    'substitution-density',
  ];
}
