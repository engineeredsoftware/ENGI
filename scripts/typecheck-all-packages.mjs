/**
 * Run `pnpm run typecheck` in every workspace package that has the script.
 * Exits non-zero if any package fails. Prints a concise pass/fail summary.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function walkPackageJson(dir, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    if (['node_modules', 'dist', '.git', 'coverage', '.next', 'storybook-static', '.turbo'].includes(entry.name)) {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkPackageJson(full, acc);
    } else if (entry.name === 'package.json') {
      acc.push(full);
    }
  }
  return acc;
}

const targets = [];
for (const pkgPath of walkPackageJson(repoRoot)) {
  let pkg;
  try {
    pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  } catch {
    continue;
  }
  if (!pkg?.name || pkg.name === 'bitcode-monorepo') continue;
  if (!pkg.scripts?.typecheck) continue;
  targets.push({ name: pkg.name, dir: path.dirname(pkgPath) });
}

targets.sort((a, b) => a.name.localeCompare(b.name));

const results = [];
const started = Date.now();

for (const target of targets) {
  const t0 = Date.now();
  const run = spawnSync('pnpm', ['run', 'typecheck'], {
    cwd: target.dir,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
    env: process.env,
  });
  const combined = `${run.stdout || ''}${run.stderr || ''}`;
  const errorLines = combined.split('\n').filter((line) => /error TS\d+|error TS\d{4}/.test(line));
  const ok = run.status === 0 && errorLines.length === 0;
  results.push({
    name: target.name,
    ok,
    status: run.status,
    ms: Date.now() - t0,
    errorCount: errorLines.length,
    errors: errorLines.slice(0, 20),
  });
  process.stdout.write(`${ok ? 'OK  ' : 'FAIL'} ${target.name}${errorLines.length ? ` (${errorLines.length} errors)` : ''}\n`);
}

const failed = results.filter((r) => !r.ok);
const summary = {
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.length,
  durationMs: Date.now() - started,
  failures: failed,
};

const outPath = path.join(repoRoot, '.proofs', 'typecheck-all-report.json');
try {
  if (!existsSync(path.dirname(outPath))) {
    // best-effort; report is optional
  }
  writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`);
} catch {
  // ignore write failures
}

process.stdout.write(
  `\nTypecheck all: total=${summary.total} passed=${summary.passed} failed=${summary.failed} durationMs=${summary.durationMs}\n`,
);

if (failed.length) {
  process.stdout.write('\nFailures:\n');
  for (const f of failed) {
    process.stdout.write(`\n--- ${f.name} ---\n`);
    for (const line of f.errors.length ? f.errors : [`exit ${f.status}`]) {
      process.stdout.write(`${line}\n`);
    }
  }
  process.exit(1);
}
