/**
 * Local READ pipeline debug pass — LLM call-by-call.
 *
 * First abort target (move via env after stable):
 *   Setup → first PTRR agent (clone-vcs) → Plan → prepare_concise_context → reason
 *
 * Usage (monorepo root):
 *   pnpm --filter @bitcode/pipeline-hosts run qa:read:debug-first-llm
 *   # or:
 *   node --import tsx packages/pipeline-hosts/src/dev/run-local-read-pipeline-debug.ts
 *
 * Always uses Anthropic Haiku unless BITCODE_LLM_MODEL is overridden.
 * Writes call ledger under .tmp/llm-call-debug/<runId>/ and host evidence under work dir.
 */

import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLiveAssetPackPipelineRunner } from '../asset-pack-host-runners';

const __dirname = dirname(fileURLToPath(import.meta.url));
const monorepoRoot = resolve(__dirname, '../../../..');

function loadEnvFile(path: string) {
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
  process.env.BITCODE_READ_DEBUG_WORK_DIR ||
  join(monorepoRoot, '.tmp/local-read-debug');
rmSync(workRoot, { recursive: true, force: true });
mkdirSync(workRoot, { recursive: true });

const repoUrl =
  process.env.BITCODE_READ_REPO_URL ||
  process.env.BITCODE_DEPOSIT_REPO_URL ||
  'https://github.com/sindresorhus/is-plain-obj.git';
const workspaceDir = join(workRoot, 'workspace');
const hostDir = join(workRoot, '.proofs/pipeline-host');
mkdirSync(hostDir, { recursive: true });

console.log('[read-debug] cloning', repoUrl);
const clone = spawnSync(
  'git',
  ['clone', '--depth', '1', repoUrl, workspaceDir],
  { encoding: 'utf8' },
);
if (clone.status !== 0) {
  console.error(clone.stderr || clone.stdout);
  process.exit(1);
}

const commit = (
  spawnSync('git', ['-C', workspaceDir, 'rev-parse', 'HEAD'], { encoding: 'utf8' })
    .stdout || ''
).trim() || 'unknown';
const branch = (
  spawnSync('git', ['-C', workspaceDir, 'rev-parse', '--abbrev-ref', 'HEAD'], {
    encoding: 'utf8',
  }).stdout || ''
).trim() || 'main';

const repoMatch =
  /github\.com[/:]([^/]+)\/([^/.]+)/i.exec(repoUrl) || ['', 'public', 'repo'];
const fullName = `${repoMatch[1]}/${repoMatch[2]}`;

const expressedNeed =
  process.env.BITCODE_READ_NEED ||
  'Need a source-safe plain-object type guard AssetPack that fits a TypeScript utility library.';

const manifest = {
  schema: 'bitcode.pipeline-host.manifest',
  hostMode: 'asset_pack_pipeline',
  synthesizeMode: 'read',
  sourceRevision: {
    repositoryFullName: fullName,
    branch,
    commit,
  },
  read: {
    id: 'local-read-debug-need',
    prompt: expressedNeed,
  },
  deposit: {
    id: 'local-read-debug-no-deposit',
    hasWalletOrAttestationProof: true,
    hasAssetMeasurementEvidence: false,
  },
  // Read path: Need is primary steering (not deposit obfuscations).
  depositSteering: {
    obfuscations: null,
    impermissibleSources: ['**/.env*', '**/secrets/**'],
    demandContext: [],
  },
  requireAcceptedReadNeed: false,
  deliveryMechanismTemplate: 'pull-request',
};

const manifestPath = join(hostDir, 'manifest.json');
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
writeFileSync(
  join(hostDir, 'run-live-asset-pack-pipeline.mjs'),
  createLiveAssetPackPipelineRunner(),
);

// --- Debug abort marker (move after each stack stabilizes) ---
// Target #1: first Setup Plan → prepare_concise_context → reason (Haiku).
// Clone often adopts BITCODE_HOST_CLONE_* without LLM; first LLM is then the
// first parallel Setup PTRR agent (usually initialize-lsp). No agent filter by
// default = stop on first matching plan/prepare/reason call.
const debugEnv: Record<string, string> = {
  BITCODE_LLM_CALL_DEBUG: '1',
  BITCODE_DEBUG_STOP_AFTER_FIRST_REASON: '1',
  BITCODE_DEBUG_STOP_PHASE: process.env.BITCODE_DEBUG_STOP_PHASE || 'setup',
  BITCODE_DEBUG_STOP_STEP: process.env.BITCODE_DEBUG_STOP_STEP || 'plan',
  BITCODE_DEBUG_STOP_FAILSAFE:
    process.env.BITCODE_DEBUG_STOP_FAILSAFE || 'prepare_concise_context',
  BITCODE_DEBUG_STOP_GENERATION:
    process.env.BITCODE_DEBUG_STOP_GENERATION || 'reason',
  // prepare selection path uses selection/seq-0 (not gen-0)
  BITCODE_DEBUG_STOP_REQUIRE_GEN0:
    process.env.BITCODE_DEBUG_STOP_REQUIRE_GEN0 || '0',
  BITCODE_EXECUTION_DEBUG: 'true',
  BITCODE_LOG_FULL_PROMPTS: '1',
  BITCODE_LOG_TRACES: '1',
  BITCODE_WRITE_RAW_LLM_IO: '1',
  BITCODE_WRITE_PROMPT_IO: '1',
  BITCODE_WRITE_STEP_TRACES: '1',
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  BITCODE_LLM_PROVIDER: process.env.BITCODE_LLM_PROVIDER || 'anthropic',
  BITCODE_LLM_MODEL: process.env.BITCODE_LLM_MODEL || 'claude-haiku-4-5',
  BITCODE_ASSET_PACK_REAL_INFERENCE: '1',
  BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE:
    process.env.BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE || 'bounded',
};
if (process.env.BITCODE_DEBUG_STOP_AGENT_FILTER) {
  debugEnv.BITCODE_DEBUG_STOP_AGENT_FILTER =
    process.env.BITCODE_DEBUG_STOP_AGENT_FILTER;
}

writeFileSync(
  join(workRoot, 'DEBUG_PASS.md'),
  [
    '# Read pipeline debug pass',
    '',
    '## Abort marker (this pass)',
    '',
    '```',
    'phase: setup',
    'agent: (first Setup PTRR agent that issues an LLM call)',
    'step: plan',
    'failsafe: prepare_concise_context',
    'generation: reason',
    '```',
    '',
    'Clone may skip LLM when host checkout is already present.',
    'After this call is correct, move BITCODE_DEBUG_STOP_* to the next stack',
    '(see ABORT_MARKER.md under .tmp/llm-call-debug/<runId>/).',
    '',
    '## Artifacts',
    '',
    `- workRoot: ${workRoot}`,
    `- evidence: ${join(hostDir, 'evidence.json')}`,
    `- llm-call-debug: ${join(monorepoRoot, '.tmp/llm-call-debug')}`,
    `- raw LLM I/O: ~/.proofs/logs/executions/`,
    '',
  ].join('\n'),
);

const env = {
  ...process.env,
  ...debugEnv,
  BITCODE_MONOREPO_ROOT: monorepoRoot,
  BITCODE_PIPELINE_HOST_MANIFEST: manifestPath,
  BITCODE_PIPELINE_HOST_ARTIFACT_DIR: hostDir,
  BITCODE_PIPELINE_HOST_MODE: 'asset_pack_pipeline',
  BITCODE_PIPELINE_STREAM_TO_DATABASE: '0',
  BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS:
    process.env.BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS || '600000',
  BITCODE_HOST_CLONE_URL: repoUrl,
  BITCODE_HOST_CLONE_BRANCH: branch,
  BITCODE_HOST_CLONE_COMMIT: commit,
  BITCODE_HOST_CLONE_REPOSITORY: fullName,
  BITCODE_HOST_CLONE_ROOT: workRoot,
};

console.log('[read-debug] config', {
  fullName,
  branch,
  commit: commit.slice(0, 12),
  provider: env.BITCODE_LLM_PROVIDER,
  model: env.BITCODE_LLM_MODEL,
  stop: {
    agent: env.BITCODE_DEBUG_STOP_AGENT_FILTER || '(first matching)',
    phase: env.BITCODE_DEBUG_STOP_PHASE,
    step: env.BITCODE_DEBUG_STOP_STEP,
    failsafe: env.BITCODE_DEBUG_STOP_FAILSAFE,
    generation: env.BITCODE_DEBUG_STOP_GENERATION,
    requireGen0: env.BITCODE_DEBUG_STOP_REQUIRE_GEN0,
  },
});

const runnerPath = join(hostDir, 'run-live-asset-pack-pipeline.mjs');
const tsxCli = join(
  monorepoRoot,
  'packages/pipeline-hosts/node_modules/tsx/dist/cli.mjs',
);

const run = spawnSync(process.execPath, [tsxCli, runnerPath], {
  cwd: monorepoRoot,
  env,
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});

writeFileSync(join(workRoot, 'pipeline.stdout.log'), run.stdout || '');
writeFileSync(join(workRoot, 'pipeline.stderr.log'), run.stderr || '');
writeFileSync(join(workRoot, 'pipeline.exit-code'), String(run.status ?? 1));

const stdout = run.stdout || '';
const stderr = run.stderr || '';
const combined = `${stdout}\n${stderr}`;
const debugStop =
  combined.includes('__BITCODE_DEBUG_STOP_AFTER_FIRST_REASON__') ||
  combined.includes('debug-stop') ||
  combined.includes('BITCODE_DEBUG_STOP_AFTER_FIRST_REASON');

console.log('[read-debug] exit', run.status, { debugStop });
if (stderr) {
  console.log('[read-debug] stderr tail:\n', stderr.split(/\r?\n/).slice(-50).join('\n'));
}
if (stdout) {
  console.log('[read-debug] stdout tail:\n', stdout.split(/\r?\n/).slice(-40).join('\n'));
}

// Summarize llm-call-debug dir
const debugRoot = join(monorepoRoot, '.tmp/llm-call-debug');
let debugDirs: string[] = [];
try {
  debugDirs = readdirSync(debugRoot).filter((d) =>
    existsSync(join(debugRoot, d, 'ledger.jsonl')),
  );
} catch {
  /* none */
}

const summary = {
  ok: debugStop,
  exitCode: run.status,
  debugStop,
  workRoot,
  llmCallDebugRoot: debugRoot,
  llmCallDebugRuns: debugDirs,
  expectedAbort:
    'Setup → clone-vcs → Plan → prepare_concise_context → reason (first gen)',
};

writeFileSync(join(workRoot, 'debug-summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));

// Success for this pass: we hit the hard stop after the first reason call
// (exit may be non-zero because of the intentional throw).
if (debugStop) process.exit(0);
process.exit(run.status === 0 ? 0 : 1);
