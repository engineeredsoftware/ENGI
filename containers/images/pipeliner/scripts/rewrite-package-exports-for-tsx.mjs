#!/usr/bin/env node
// Point package.json "main" / "exports" at loadable TypeScript sources when the
// declared .js or dist targets are missing from the image tree.
//
// Runtime failures this fixes:
//   Cannot find module .../Execution.js
//   Cannot find module .../dist/index.js
//
// Causes:
// - packages declare default: ./src/Foo.js but only Foo.ts is shipped (.js gitignored)
// - packages declare main: dist/index.js but Docker .dockerignore excludes dist trees
//
// Sandbox runs the monorepo via tsx without a prior tsc emit of every package.
// Use line comments only (no block comments) so globs like dist exclusions cannot
// accidentally terminate a comment mid-file.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function resolveMonorepoRoot() {
  if (process.env.BITCODE_MONOREPO_ROOT) {
    return path.resolve(process.env.BITCODE_MONOREPO_ROOT);
  }
  if (fs.existsSync(path.join(process.cwd(), 'packages'))) {
    return process.cwd();
  }
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
}

const monorepoRoot = resolveMonorepoRoot();
const packagesRoot = path.join(monorepoRoot, 'packages');

function walkPackageJsons(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const pkgJson = path.join(full, 'package.json');
      if (fs.existsSync(pkgJson)) out.push(pkgJson);
      walkPackageJsons(full, out);
    }
  }
  return out;
}

function fileExists(packageDir, rel) {
  const clean = String(rel).replace(/^\.\//, '');
  return fs.existsSync(path.join(packageDir, clean));
}

/**
 * Resolve a declared entry to an on-disk path prefering tsx-loadable .ts sources.
 */
function rewriteEntryPath(packageDir, value) {
  if (typeof value !== 'string') return { value, changed: false };
  if (value === './package.json' || value.endsWith('/package.json')) {
    return { value, changed: false };
  }

  // Already present on disk — keep (works for host checkouts that have dist).
  if (fileExists(packageDir, value)) {
    return { value, changed: false };
  }

  const candidates = [];

  // src/Foo.js → src/Foo.ts
  if (value.endsWith('.js')) {
    candidates.push(value.replace(/\.js$/, '.ts'));
  }

  // dist/index.js → src/index.ts (and bare dist/foo → src/foo.ts)
  if (value.includes('/dist/') || value.startsWith('dist/') || value.startsWith('./dist/')) {
    const asSrc = value.replace(/(^\.?\/?)dist\//, '$1src/');
    candidates.push(asSrc);
    if (asSrc.endsWith('.js')) candidates.push(asSrc.replace(/\.js$/, '.ts'));
    if (!asSrc.endsWith('.ts') && !asSrc.endsWith('.js')) {
      candidates.push(`${asSrc}.ts`);
      candidates.push(`${asSrc}/index.ts`);
    }
  }

  // bare dist → src
  if (value === 'dist' || value === './dist') {
    candidates.push('./src/index.ts', 'src/index.ts');
  }

  // main: dist/index.js already covered; also try index.ts at package root src
  if (value.endsWith('index.js')) {
    candidates.push(value.replace(/index\.js$/, 'index.ts'));
    candidates.push('./src/index.ts', 'src/index.ts');
  }

  // types: dist/index.d.ts → src/index.ts
  if (value.endsWith('.d.ts')) {
    const asTs = value.replace(/\.d\.ts$/, '.ts').replace(/(^\.?\/?)dist\//, '$1src/');
    candidates.push(asTs);
    candidates.push('./src/index.ts', 'src/index.ts');
  }

  for (const candidate of candidates) {
    if (fileExists(packageDir, candidate)) {
      const normalized = candidate.startsWith('.') ? candidate : `./${candidate}`;
      return { value: normalized, changed: normalized !== value };
    }
  }

  return { value, changed: false };
}

function rewriteNode(packageDir, node) {
  let changed = 0;
  if (typeof node === 'string') {
    const r = rewriteEntryPath(packageDir, node);
    return { value: r.value, changed: r.changed ? 1 : 0 };
  }
  if (Array.isArray(node)) {
    const next = node.map((item) => {
      const r = rewriteNode(packageDir, item);
      changed += r.changed;
      return r.value;
    });
    return { value: next, changed };
  }
  if (node && typeof node === 'object') {
    const next = {};
    for (const [key, val] of Object.entries(node)) {
      const r = rewriteNode(packageDir, val);
      next[key] = r.value;
      changed += r.changed;
    }
    return { value: next, changed };
  }
  return { value: node, changed: 0 };
}

let filesTouched = 0;
let pathsRewritten = 0;

for (const pkgFile of walkPackageJsons(packagesRoot)) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
  } catch {
    continue;
  }
  const packageDir = path.dirname(pkgFile);
  let fileChanged = 0;

  if (typeof data.main === 'string') {
    const r = rewriteEntryPath(packageDir, data.main);
    if (r.changed) {
      data.main = r.value;
      fileChanged += 1;
    }
  }
  if (typeof data.module === 'string') {
    const r = rewriteEntryPath(packageDir, data.module);
    if (r.changed) {
      data.module = r.value;
      fileChanged += 1;
    }
  }
  if (typeof data.types === 'string') {
    const r = rewriteEntryPath(packageDir, data.types);
    if (r.changed) {
      data.types = r.value;
      fileChanged += 1;
    }
  }
  if (data.exports != null) {
    const r = rewriteNode(packageDir, data.exports);
    if (r.changed) {
      data.exports = r.value;
      fileChanged += r.changed;
    }
  }

  if (fileChanged > 0) {
    fs.writeFileSync(pkgFile, `${JSON.stringify(data, null, 2)}\n`);
    filesTouched += 1;
    pathsRewritten += fileChanged;
    console.log(`  fixed ${path.relative(monorepoRoot, pkgFile)} (${fileChanged} path(s))`);
  }
}

console.log(
  `[rewrite-package-exports-for-tsx] rewrote ${pathsRewritten} path(s) in ${filesTouched} package.json file(s)`,
);
