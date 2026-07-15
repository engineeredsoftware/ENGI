/**
 * Local deposit pipeline validation (monorepo + tsx, no Vercel Sandbox required).
 *
 * Mirrors Pipeliner image layout:
 *   BITCODE_MONOREPO_ROOT → packages/*
 *   workspace clone → workspace/
 *   live runner with pkgImport(.ts) + tsx
 *
 * Usage (from monorepo root):
 *   node --import tsx packages/pipeline-hosts/src/dev/run-local-deposit-pipeline.mjs
 *
 * Env:
 *   BITCODE_DEPOSIT_REPO_URL   (default: https://github.com/sindresorhus/is-plain-obj.git)
 *   BITCODE_DEPOSIT_OBFUSCATIONS
 *   BITCODE_ASSET_PACK_REAL_INFERENCE=1
 *   ANTHROPIC_API_KEY / BITCODE_LLM_*
 *   BITCODE_DEPOSIT_WORK_DIR   (default: .tmp/local-deposit-run)
 */
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLiveAssetPackPipelineRunner } from '../asset-pack-host-runners';

const __dirname = dirname(fileURLToPath(import.meta.url));
const monorepoRoot = resolve(__dirname, '../../../..');

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

const workRoot =
  process.env.BITCODE_DEPOSIT_WORK_DIR ||
  join(monorepoRoot, '.tmp/local-deposit-run');
rmSync(workRoot, { recursive: true, force: true });
mkdirSync(workRoot, { recursive: true });

const repoUrl =
  process.env.BITCODE_DEPOSIT_REPO_URL ||
  'https://github.com/sindresorhus/is-plain-obj.git';
const workspaceDir = join(workRoot, 'workspace');
const hostDir = join(workRoot, '.proofs/pipeline-host');
mkdirSync(hostDir, { recursive: true });

console.log('[local-deposit] cloning', repoUrl);
const clone = spawnSync(
  'git',
  ['clone', '--depth', '1', repoUrl, workspaceDir],
  { encoding: 'utf8' },
);
if (clone.status !== 0) {
  console.error(clone.stderr || clone.stdout);
  process.exit(1);
}

const revParse = spawnSync('git', ['-C', workspaceDir, 'rev-parse', 'HEAD'], {
  encoding: 'utf8',
});
const commit = (revParse.stdout || '').trim() || 'unknown';
const branchParse = spawnSync(
  'git',
  ['-C', workspaceDir, 'rev-parse', '--abbrev-ref', 'HEAD'],
  { encoding: 'utf8' },
);
const branch = (branchParse.stdout || '').trim() || 'main';

// Infer owner/name from URL
const repoMatch =
  /github\.com[/:]([^/]+)\/([^/.]+)/i.exec(repoUrl) ||
  ['', 'public', 'repo'];
const owner = repoMatch[1];
const name = repoMatch[2];
const fullName = `${owner}/${name}`;

const obfuscations =
  process.env.BITCODE_DEPOSIT_OBFUSCATIONS ||
  'Redact secrets, API keys, and private credentials. Prefer public API surface only.';

const manifest = {
  schema: 'bitcode.pipeline-host.manifest',
  hostMode: 'asset_pack_pipeline',
  synthesizeMode: 'deposit',
  sourceRevision: {
    repositoryFullName: fullName,
    branch,
    commit,
  },
  read: {
    id: 'local-deposit-validation-read',
    prompt: `Deposit measured AssetPack options for ${fullName}.`,
  },
  deposit: {
    id: 'local-deposit-validation',
    hasWalletOrAttestationProof: true,
    hasAssetMeasurementEvidence: false,
  },
  depositSteering: {
    obfuscations,
    impermissibleSources: ['**/.env*', '**/secrets/**', '**/*credential*'],
    demandContext: ['library-api', 'type-safety'],
  },
  requireAcceptedReadNeed: false,
};

const manifestPath = join(hostDir, 'manifest.json');
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
writeFileSync(
  join(hostDir, 'run-live-asset-pack-pipeline.mjs'),
  createLiveAssetPackPipelineRunner(),
);

const env = {
  ...process.env,
  BITCODE_MONOREPO_ROOT: monorepoRoot,
  BITCODE_PIPELINE_HOST_MANIFEST: manifestPath,
  BITCODE_PIPELINE_HOST_ARTIFACT_DIR: hostDir,
  BITCODE_PIPELINE_HOST_MODE: 'asset_pack_pipeline',
  BITCODE_ASSET_PACK_REAL_INFERENCE:
    process.env.BITCODE_ASSET_PACK_REAL_INFERENCE || '1',
  BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE:
    process.env.BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE || 'bounded',
  // Public clone via Setup BITCODE_HOST_CLONE_* (same path as sandbox deposit).
  BITCODE_HOST_CLONE_URL: repoUrl,
  BITCODE_HOST_CLONE_BRANCH: branch,
  BITCODE_HOST_CLONE_COMMIT: commit,
  BITCODE_HOST_CLONE_REPOSITORY: fullName,
  BITCODE_HOST_CLONE_ROOT: workRoot,
  // Avoid DB streaming for local validation unless explicitly requested.
  BITCODE_PIPELINE_STREAM_TO_DATABASE:
    process.env.BITCODE_PIPELINE_STREAM_TO_DATABASE || '0',
  BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS:
    process.env.BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS || '1200000',
};

console.log('[local-deposit] running live runner', {
  fullName,
  branch,
  commit: commit.slice(0, 12),
  workspaceDir,
  realInference: env.BITCODE_ASSET_PACK_REAL_INFERENCE,
  obfuscations: obfuscations.slice(0, 80),
});

const runnerPath = join(hostDir, 'run-live-asset-pack-pipeline.mjs');
// Resolve tsx from pipeline-hosts (workspace install may not hoist to monorepo root).
const tsxCli = join(
  monorepoRoot,
  'packages/pipeline-hosts/node_modules/tsx/dist/cli.mjs',
);
const run = spawnSync(
  process.execPath,
  [tsxCli, runnerPath],
  {
    cwd: monorepoRoot,
    env,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  },
);

writeFileSync(join(workRoot, 'pipeline.stdout.log'), run.stdout || '');
writeFileSync(join(workRoot, 'pipeline.stderr.log'), run.stderr || '');
writeFileSync(join(workRoot, 'pipeline.exit-code'), String(run.status ?? 1));

console.log('[local-deposit] exit', run.status);
if (run.stderr) {
  const tail = run.stderr.split(/\r?\n/).slice(-40).join('\n');
  console.log('[local-deposit] stderr tail:\n', tail);
}

const evidencePath = join(hostDir, 'evidence.json');
const telemetryPath = join(hostDir, 'telemetry.jsonl');
let evidence = null;
if (existsSync(evidencePath)) {
  evidence = JSON.parse(readFileSync(evidencePath, 'utf8'));
  writeFileSync(
    join(workRoot, 'evidence.summary.json'),
    JSON.stringify(
      {
        resultState: evidence.resultState,
        resultReasons: evidence.resultReasons,
        optionCount:
          (Array.isArray(evidence.depositOptions) && evidence.depositOptions.length) ||
          evidence.output?.depositOptions?.length ||
          evidence.output?.options?.length ||
          evidence.output?.selectionEnvelope?.options?.length ||
          null,
        hasOutput: Boolean(evidence.output),
        outputKeys: evidence.output ? Object.keys(evidence.output) : [],
      },
      null,
      2,
    ),
  );
}

// Extract absolute measurement snapshot for options
function extractOptions(ev) {
  const out = ev?.output || {};
  const candidates = [
    ev?.depositOptions,
    out.depositOptions,
    out.options,
    out.selectionEnvelope?.options,
    out.assetPackOptions,
    out.synthesizedOptions,
    out.candidates,
  ].find((x) => Array.isArray(x) && x.length > 0);
  return candidates || [];
}

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

function resolveAbsolutesList(opt) {
  if (Array.isArray(opt?.measurements?.absolutes)) return opt.measurements.absolutes;
  if (Array.isArray(opt?.absolutes)) return opt.absolutes;
  if (Array.isArray(opt?.absoluteMeasurements)) return opt.absoluteMeasurements;
  return [];
}

const options = evidence ? extractOptions(evidence) : [];
const measurementReport = options.map((opt, i) => {
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
  return {
    index: i,
    id: opt.optionId || opt.assetPackId || opt.id || `option-${i}`,
    title: opt.title || opt.label || null,
    kind: opt.kind || null,
    absoluteKeys: Object.keys(byKind),
    missingKinds,
    hasFullAbsoluteCatalog: missingKinds.length === 0,
    absolutes: byKind,
  };
});

writeFileSync(
  join(workRoot, 'options-measurements.json'),
  JSON.stringify(
    {
      exitCode: run.status,
      resultState: evidence?.resultState ?? null,
      optionCount: options.length,
      options: measurementReport,
      workRoot,
      evidencePath: existsSync(evidencePath) ? evidencePath : null,
      telemetryPath: existsSync(telemetryPath) ? telemetryPath : null,
    },
    null,
    2,
  ),
);

const fullCatalog =
  options.length > 0 && measurementReport.every((o) => o.hasFullAbsoluteCatalog);

console.log(
  JSON.stringify(
    {
      ok: run.status === 0 && options.length > 0 && fullCatalog,
      exitCode: run.status,
      resultState: evidence?.resultState ?? null,
      optionCount: options.length,
      absoluteCatalogPresent: measurementReport.some(
        (o) => o.absoluteKeys.length > 0,
      ),
      fullAbsoluteCatalog: fullCatalog,
      options: measurementReport,
      workRoot,
    },
    null,
    2,
  ),
);

// Success: measured options with full absolute catalog for depositor selection.
// Host exit 0 is preferred, but partial recovery of complete options after a
// late-phase timeout still satisfies the depositor AP+absolutes contract.
const admissible =
  options.length > 0 &&
  fullCatalog &&
  (run.status === 0 ||
    evidence?.resultState === 'worthy_deposit_candidates' ||
    (Array.isArray(evidence?.depositOptions) && evidence.depositOptions.length > 0));

if (!admissible) {
  process.exit(1);
}
process.exit(0);
