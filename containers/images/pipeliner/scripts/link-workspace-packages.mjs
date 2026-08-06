#!/usr/bin/env node
/**
 * Link every workspace package name into root node_modules so Node/tsx can
 * resolve `@bitcode/*` when loading monorepo .ts via absolute file paths.
 *
 * Why: pnpm isolates deps per package. Consumers get `packages/foo/node_modules/@bitcode/bar`,
 * but a file under `packages/bar/src/*.ts` that imports `@bitcode/bar` (or any peer
 * package only linked under a sibling) fails under sandbox `tsx` file:// loads.
 * Root `node_modules/@bitcode/<name>` → package dir is the standard fix for
 * "run the monorepo tree as a Node graph" without a bundler.
 *
 * Safe to re-run. Does not change package.json dependencies.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function resolveMonorepoRoot() {
  if (process.env.BITCODE_MONOREPO_ROOT) {
    return path.resolve(process.env.BITCODE_MONOREPO_ROOT);
  }
  // Prefer cwd when the monorepo is already the working directory (Docker).
  if (fs.existsSync(path.join(process.cwd(), 'packages'))) {
    return process.cwd();
  }
  // scripts/ lives at containers/images/pipeliner/scripts → monorepo root.
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
}

const monorepoRoot = resolveMonorepoRoot();

const packagesRoot = path.join(monorepoRoot, 'packages');
const linkRoot = path.join(monorepoRoot, 'node_modules', '@bitcode');

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

function ensureSymlink(linkPath, targetPath) {
  fs.mkdirSync(path.dirname(linkPath), { recursive: true });
  try {
    const existing = fs.lstatSync(linkPath);
    if (existing.isSymbolicLink() || existing.isDirectory() || existing.isFile()) {
      fs.rmSync(linkPath, { recursive: true, force: true });
    }
  } catch {
    // missing — fine
  }
  fs.symlinkSync(targetPath, linkPath, 'dir');
}

const pkgFiles = walkPackageJsons(packagesRoot);
const linked = [];
const skipped = [];

for (const pkgFile of pkgFiles) {
  let name;
  try {
    name = JSON.parse(fs.readFileSync(pkgFile, 'utf8')).name;
  } catch {
    skipped.push(pkgFile);
    continue;
  }
  if (typeof name !== 'string' || !name.startsWith('@bitcode/')) {
    skipped.push(name || pkgFile);
    continue;
  }
  const short = name.slice('@bitcode/'.length);
  if (!short || short.includes('/')) {
    // Nested scopes not used; skip odd names.
    skipped.push(name);
    continue;
  }
  const packageDir = path.dirname(pkgFile);
  const relTarget = path.relative(linkRoot, packageDir);
  const linkPath = path.join(linkRoot, short);
  ensureSymlink(linkPath, relTarget);
  linked.push({ name, from: linkPath, to: packageDir });
}

// Self-link each package into its own node_modules so in-package
// `import '… from @bitcode/self'` resolves without walking to root.
for (const { name, to: packageDir } of linked) {
  const short = name.slice('@bitcode/'.length);
  const selfLinkDir = path.join(packageDir, 'node_modules', '@bitcode');
  const selfLink = path.join(selfLinkDir, short);
  try {
    ensureSymlink(selfLink, path.relative(selfLinkDir, packageDir));
  } catch (error) {
    console.warn(`[link-workspace-packages] self-link failed for ${name}:`, error.message);
  }
}

console.log(
  `[link-workspace-packages] linked ${linked.length} @bitcode packages under ${linkRoot}`,
);
if (process.env.BITCODE_LINK_WORKSPACE_VERBOSE === '1') {
  for (const row of linked) {
    console.log(`  ${row.name} -> ${row.to}`);
  }
}
