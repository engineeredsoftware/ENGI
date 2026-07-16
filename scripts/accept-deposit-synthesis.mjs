#!/usr/bin/env node
/**
 * Deposit synthesis acceptance (seller spine):
 *   permitted source → obfuscations → measured options (+ inspectable patch)
 *
 * Paths:
 *   A (default) — LocalHost monorepo runner (run-local-deposit-pipeline)
 *   B           — Pipeliner Docker image (when Docker is available)
 *
 * Usage (monorepo root):
 *   node scripts/accept-deposit-synthesis.mjs
 *   node scripts/accept-deposit-synthesis.mjs --path=a
 *   node scripts/accept-deposit-synthesis.mjs --path=b
 *   node scripts/accept-deposit-synthesis.mjs --path=a,b
 *   pnpm run accept:deposit-synthesis
 *
 * Env (Path A):
 *   BITCODE_DEPOSIT_REPO_URL, BITCODE_DEPOSIT_OBFUSCATIONS, BITCODE_DEPOSIT_WORK_DIR
 *   BITCODE_ASSET_PACK_REAL_INFERENCE=1, LLM keys, BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS
 *
 * Env (Path B):
 *   BITCODE_PIPELINER_IMAGE (default pipeliner:local)
 *   Same LLM / REAL_INFERENCE env as A
 *
 * Exit 0 only when accepted options have full absolute catalog + patch surface.
 */

import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
  cpSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const monorepoRoot = resolve(__dirname, '..');

const REQUIRED_ABSOLUTE_KINDS = [
  'function-count',
  'type-count',
  'file-span',
  'symbolic-richness',
  'modularity',
  'correctness-estimate',
  'objectives-fidelity',
  'computational-usage',
];

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(trimmed);
    if (!match) continue;
    const [, key, raw] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = raw.trim().replace(/^(['"])(.*)\1$/, '$2');
  }
}

loadEnvFile(join(monorepoRoot, 'apps/uapi/.env.local'));
loadEnvFile(join(monorepoRoot, '.env.local'));

function parsePaths(argv) {
  const arg = argv.find((a) => a.startsWith('--path='));
  const raw = arg ? arg.slice('--path='.length) : 'a';
  const set = new Set(
    raw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
  if (set.has('all')) return new Set(['a', 'b']);
  return set.size ? set : new Set(['a']);
}

function resolveAbsolutesList(opt) {
  if (Array.isArray(opt?.measurements?.absolutes)) return opt.measurements.absolutes;
  if (Array.isArray(opt?.absolutes)) return opt.absolutes;
  if (Array.isArray(opt?.absoluteMeasurements)) return opt.absoluteMeasurements;
  return [];
}

function resolvePatchSurface(opt) {
  const patch = opt?.patch || opt?.assetPackPatch || null;
  const fileChanges =
    opt?.fileChanges ||
    patch?.fileChanges ||
    opt?.measurements?.fileChanges ||
    null;
  const paths = Array.isArray(fileChanges?.paths)
    ? fileChanges.paths
    : Array.isArray(fileChanges)
      ? fileChanges.map((c) => c?.path).filter(Boolean)
      : Array.isArray(patch?.files)
        ? patch.files.map((f) => f?.path || f).filter(Boolean)
        : [];
  const ops = Array.isArray(fileChanges)
    ? fileChanges.filter((c) => c && (c.op || c.path))
    : Array.isArray(patch?.fileChanges)
      ? patch.fileChanges
      : [];
  const patchSummary =
    (typeof patch?.patchSummary === 'string' && patch.patchSummary) ||
    (typeof opt?.patchSummary === 'string' && opt.patchSummary) ||
    null;
  const hasPatchBlob = Boolean(
    patch &&
      (typeof patch === 'string' ||
        patch.diff ||
        patch.unifiedDiff ||
        patch.patchText ||
        patch.content),
  );
  return {
    hasFileChanges: paths.length > 0 || ops.length > 0,
    hasPatchSummary: Boolean(patchSummary && patchSummary.trim()),
    hasPatchBlob,
    pathCount: paths.length || ops.length,
    paths: paths.slice(0, 20),
    patchSummary: patchSummary ? patchSummary.slice(0, 240) : null,
  };
}

function extractOptions(evidence) {
  if (!evidence || typeof evidence !== 'object') return [];
  const out = evidence.output || {};
  const candidates = [
    evidence.depositOptions,
    out.depositOptions,
    out.options,
    out.selectionEnvelope?.options,
    out.assetPackOptions,
    out.synthesizedOptions,
    out.candidates,
  ].find((x) => Array.isArray(x) && x.length > 0);
  return candidates || [];
}

function evaluateEvidence(evidence, runExitCode) {
  const options = extractOptions(evidence);
  const reports = options.map((opt, i) => {
    const absList = resolveAbsolutesList(opt);
    const byKind = Object.fromEntries(
      absList
        .filter((row) => row && typeof row.measurementKind === 'string')
        .map((row) => [
          row.measurementKind,
          {
            magnitude: row.magnitude,
            volume: row.volume,
            unit: row.unit,
            label: row.label,
          },
        ]),
    );
    const missingKinds = REQUIRED_ABSOLUTE_KINDS.filter((k) => !(k in byKind));
    const patch = resolvePatchSurface(opt);
    return {
      index: i,
      id: opt.optionId || opt.assetPackId || opt.id || `option-${i}`,
      title: opt.title || opt.label || null,
      kind: opt.kind || null,
      absoluteKeys: Object.keys(byKind),
      missingKinds,
      hasFullAbsoluteCatalog: missingKinds.length === 0,
      patchInspectable: patch.hasFileChanges || patch.hasPatchSummary || patch.hasPatchBlob,
      patch,
      absolutes: byKind,
    };
  });

  const fullCatalog =
    options.length > 0 && reports.every((o) => o.hasFullAbsoluteCatalog);
  const allPatchesInspectable =
    options.length > 0 && reports.every((o) => o.patchInspectable);
  const resultState = evidence?.resultState ?? null;
  const worthy =
    resultState === 'worthy_deposit_candidates' ||
    (Array.isArray(evidence?.depositOptions) && evidence.depositOptions.length > 0);

  const ok =
    options.length > 0 &&
    fullCatalog &&
    allPatchesInspectable &&
    (runExitCode === 0 || worthy);

  return {
    ok,
    exitCode: runExitCode,
    resultState,
    optionCount: options.length,
    fullAbsoluteCatalog: fullCatalog,
    allPatchesInspectable,
    options: reports,
  };
}

function dockerAvailable() {
  const r = spawnSync('docker', ['info'], { encoding: 'utf8' });
  return r.status === 0;
}

function runPathA() {
  console.log('\n=== Path A: LocalHost deposit synthesis ===\n');
  const workRoot =
    process.env.BITCODE_DEPOSIT_WORK_DIR ||
    join(monorepoRoot, '.tmp/accept-deposit-a');
  process.env.BITCODE_DEPOSIT_WORK_DIR = workRoot;
  process.env.BITCODE_ASSET_PACK_REAL_INFERENCE =
    process.env.BITCODE_ASSET_PACK_REAL_INFERENCE || '1';
  process.env.BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS =
    process.env.BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS || '1200000';

  const script = join(
    monorepoRoot,
    'packages/pipeline-hosts/src/dev/run-local-deposit-pipeline.ts',
  );
  const tsxCli = join(
    monorepoRoot,
    'packages/pipeline-hosts/node_modules/tsx/dist/cli.mjs',
  );
  if (!existsSync(tsxCli)) {
    console.error('[accept] tsx missing; run pnpm install at monorepo root');
    return { path: 'a', ok: false, error: 'tsx_missing' };
  }

  const run = spawnSync(process.execPath, [tsxCli, script], {
    cwd: monorepoRoot,
    env: process.env,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });

  const evidencePath = join(workRoot, '.proofs/pipeline-host/evidence.json');
  let evidence = null;
  if (existsSync(evidencePath)) {
    evidence = JSON.parse(readFileSync(evidencePath, 'utf8'));
  }

  const evaluation = evaluateEvidence(evidence, run.status ?? 1);
  const reportPath = join(workRoot, 'acceptance-report.json');
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        path: 'a',
        evaluation,
        workRoot,
        evidencePath: existsSync(evidencePath) ? evidencePath : null,
        stdoutTail: (run.stdout || '').split(/\r?\n/).slice(-30),
        stderrTail: (run.stderr || '').split(/\r?\n/).slice(-30),
      },
      null,
      2,
    ),
  );

  console.log(JSON.stringify({ path: 'a', ...evaluation, reportPath }, null, 2));
  return { path: 'a', ...evaluation, workRoot, reportPath };
}

function runPathB() {
  console.log('\n=== Path B: Pipeliner Docker deposit synthesis ===\n');
  if (!dockerAvailable()) {
    console.log('[accept] Docker not available; skip Path B');
    return { path: 'b', ok: false, skipped: true, reason: 'docker_unavailable' };
  }

  const image = process.env.BITCODE_PIPELINER_IMAGE || 'pipeliner:local';
  const workRoot =
    process.env.BITCODE_DEPOSIT_DOCKER_WORK_DIR ||
    join(monorepoRoot, '.tmp/accept-deposit-b');
  rmSync(workRoot, { recursive: true, force: true });
  mkdirSync(join(workRoot, 'artifacts'), { recursive: true });

  // Materialize runners into image package dist
  const mat = spawnSync(
    'pnpm',
    ['--filter', '@bitcode/pipeline-image', 'run', 'materialize'],
    { cwd: monorepoRoot, encoding: 'utf8' },
  );
  if (mat.status !== 0) {
    console.error(mat.stderr || mat.stdout);
    return { path: 'b', ok: false, error: 'materialize_failed' };
  }

  // Ensure local image exists (build if missing)
  const inspect = spawnSync('docker', ['image', 'inspect', image], {
    encoding: 'utf8',
  });
  if (inspect.status !== 0) {
    console.log('[accept] building', image, '(this may take several minutes)');
    const build = spawnSync(
      'docker',
      [
        'build',
        '-f',
        'containers/images/pipeliner/Dockerfile',
        '-t',
        image,
        '.',
      ],
      { cwd: monorepoRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
    );
    writeFileSync(join(workRoot, 'docker-build.stdout.log'), build.stdout || '');
    writeFileSync(join(workRoot, 'docker-build.stderr.log'), build.stderr || '');
    if (build.status !== 0) {
      console.error('[accept] docker build failed');
      return { path: 'b', ok: false, error: 'docker_build_failed' };
    }
  }

  // Public clone on host for SHA, then pass clone env into box (Setup path)
  const repoUrl =
    process.env.BITCODE_DEPOSIT_REPO_URL ||
    'https://github.com/sindresorhus/is-plain-obj.git';
  const cloneDir = join(workRoot, 'probe-clone');
  spawnSync('git', ['clone', '--depth', '1', repoUrl, cloneDir], {
    encoding: 'utf8',
  });
  const commit = (
    spawnSync('git', ['-C', cloneDir, 'rev-parse', 'HEAD'], { encoding: 'utf8' })
      .stdout || ''
  ).trim();
  const branch = (
    spawnSync('git', ['-C', cloneDir, 'rev-parse', '--abbrev-ref', 'HEAD'], {
      encoding: 'utf8',
    }).stdout || ''
  ).trim() || 'main';
  const repoMatch =
    /github\.com[/:]([^/]+)\/([^/.]+)/i.exec(repoUrl) || ['', 'public', 'repo'];
  const fullName = `${repoMatch[1]}/${repoMatch[2]}`;

  const templatePath = join(
    monorepoRoot,
    'containers/images/pipeliner/fixtures/deposit-manifest.template.json',
  );
  const template = JSON.parse(readFileSync(templatePath, 'utf8'));
  template.sourceRevision = {
    repositoryFullName: fullName,
    branch,
    commit,
  };
  if (process.env.BITCODE_DEPOSIT_OBFUSCATIONS) {
    template.depositSteering.obfuscations = process.env.BITCODE_DEPOSIT_OBFUSCATIONS;
  }
  const manifestPath = join(workRoot, 'manifest.json');
  writeFileSync(manifestPath, JSON.stringify(template, null, 2));

  const dockerEnv = [
    '-e',
    'BITCODE_PIPELINE_HOST_MODE=asset_pack_pipeline',
    '-e',
    'BITCODE_MONOREPO_ROOT=/opt/bitcode',
    '-e',
    'BITCODE_PIPELINE_HOST_MANIFEST=/vercel/sandbox/.proofs/pipeline-host/manifest.json',
    '-e',
    'BITCODE_PIPELINE_HOST_ARTIFACT_DIR=/vercel/sandbox/.proofs/pipeline-host',
    '-e',
    'BITCODE_ASSET_PACK_REAL_INFERENCE=1',
    '-e',
    `BITCODE_HOST_CLONE_URL=${repoUrl}`,
    '-e',
    `BITCODE_HOST_CLONE_BRANCH=${branch}`,
    '-e',
    `BITCODE_HOST_CLONE_COMMIT=${commit}`,
    '-e',
    `BITCODE_HOST_CLONE_REPOSITORY=${fullName}`,
    '-e',
    'BITCODE_HOST_CLONE_ROOT=/vercel/sandbox',
    '-e',
    'BITCODE_PIPELINE_STREAM_TO_DATABASE=0',
  ];
  for (const key of [
    'ANTHROPIC_API_KEY',
    'OPENAI_API_KEY',
    'XAI_API_KEY',
    'GOOGLE_API_KEY',
    'BITCODE_LLM_PROVIDER',
    'BITCODE_LLM_MODEL',
    'BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE',
  ]) {
    if (process.env[key]) {
      dockerEnv.push('-e', `${key}=${process.env[key]}`);
    }
  }

  // Seed manifest into mounted artifacts dir
  mkdirSync(join(workRoot, 'artifacts'), { recursive: true });
  cpSync(manifestPath, join(workRoot, 'artifacts', 'manifest.json'));

  const run = spawnSync(
    'docker',
    [
      'run',
      '--rm',
      ...dockerEnv,
      '-v',
      `${join(workRoot, 'artifacts')}:/vercel/sandbox/.proofs/pipeline-host`,
      image,
    ],
    {
      cwd: monorepoRoot,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    },
  );
  writeFileSync(join(workRoot, 'docker-run.stdout.log'), run.stdout || '');
  writeFileSync(join(workRoot, 'docker-run.stderr.log'), run.stderr || '');

  const evidencePath = join(workRoot, 'artifacts', 'evidence.json');
  let evidence = null;
  if (existsSync(evidencePath)) {
    evidence = JSON.parse(readFileSync(evidencePath, 'utf8'));
  }
  const evaluation = evaluateEvidence(evidence, run.status ?? 1);
  const reportPath = join(workRoot, 'acceptance-report.json');
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        path: 'b',
        image,
        evaluation,
        workRoot,
        evidencePath: existsSync(evidencePath) ? evidencePath : null,
        stderrTail: (run.stderr || '').split(/\r?\n/).slice(-40),
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ path: 'b', ...evaluation, reportPath }, null, 2));
  return { path: 'b', ...evaluation, workRoot, reportPath };
}

const paths = parsePaths(process.argv.slice(2));
const results = [];

if (paths.has('a')) results.push(runPathA());
if (paths.has('b')) results.push(runPathB());

const summary = {
  ok: results.every((r) => r.ok || r.skipped),
  // Path B skip does not fail overall when only A was required; if B requested and skipped, mark soft-fail
  results: results.map((r) => ({
    path: r.path,
    ok: r.ok,
    skipped: r.skipped || false,
    optionCount: r.optionCount,
    resultState: r.resultState,
    fullAbsoluteCatalog: r.fullAbsoluteCatalog,
    allPatchesInspectable: r.allPatchesInspectable,
    reportPath: r.reportPath,
    reason: r.reason || r.error || null,
  })),
};

// Fail if any non-skipped path failed, or if only B was requested and skipped
const hardFail = results.some((r) => !r.skipped && !r.ok);
const bOnlySkipped =
  paths.has('b') &&
  !paths.has('a') &&
  results.every((r) => r.path === 'b' && r.skipped);

console.log('\n=== Acceptance summary ===\n');
console.log(JSON.stringify(summary, null, 2));

const outDir = join(monorepoRoot, '.tmp/accept-deposit-summary');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));

if (hardFail || bOnlySkipped) process.exit(1);
process.exit(0);
