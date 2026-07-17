/**
 * Local DEPOSIT pipeline debug pass — LLM call-by-call.
 *
 * Abort target (advance only after current call accepted in
 * `.qa/BITCODE_V48_CANONICAL_PROMOTION_ACCEPTANCE.md` §1):
 *   Setup → clone-vcs PTRR agent → Plan → prepare_concise_context
 *   → structured_output
 *   (reason + judge accepted; marker at PCC structured_output)
 *
 * Forces the real Setup clone agent (BITCODE_DEBUG_FORCE_CLONE_PTRR) so host
 * short-circuits do not skip Plan→Try→Retry→Refine + clone-repository tool.
 *
 * Usage (monorepo root):
 *   pnpm --filter @bitcode/pipeline-hosts run qa:deposit:debug-first-llm
 *   # or:
 *   node --import tsx packages/pipeline-hosts/src/dev/run-local-deposit-pipeline-debug.ts
 *
 * Always uses Anthropic Haiku unless BITCODE_LLM_MODEL is overridden.
 * Writes call ledger under .tmp/llm-call-debug/<runId>/ and prints verbatim
 * over-the-wire prompts/completions for the stopped call.
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
  process.env.BITCODE_DEPOSIT_DEBUG_WORK_DIR ||
  join(monorepoRoot, '.tmp/local-deposit-debug');
rmSync(workRoot, { recursive: true, force: true });
mkdirSync(workRoot, { recursive: true });
// Fresh LLM call ledger each pass (stable correlation id reuses one dir).
const llmCallDebugRoot = join(monorepoRoot, '.tmp/llm-call-debug');
rmSync(llmCallDebugRoot, { recursive: true, force: true });
mkdirSync(llmCallDebugRoot, { recursive: true });

const repoUrl =
  process.env.BITCODE_READ_REPO_URL ||
  process.env.BITCODE_DEPOSIT_REPO_URL ||
  'https://github.com/sindresorhus/is-plain-obj.git';
const workspaceDir = join(workRoot, 'workspace');
const hostDir = join(workRoot, '.proofs/pipeline-host');
mkdirSync(hostDir, { recursive: true });

console.log('[deposit-debug] cloning', repoUrl);
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
    id: 'local-deposit-debug-read-stub',
    prompt: `Deposit measured AssetPack options for ${fullName}.`,
  },
  deposit: {
    id: 'local-deposit-debug',
    hasWalletOrAttestationProof: true,
    hasAssetMeasurementEvidence: false,
  },
  depositSteering: {
    obfuscations:
      process.env.BITCODE_DEPOSIT_OBFUSCATIONS ||
      'Redact secrets, API keys, and private credentials. Prefer public API surface only.',
    impermissibleSources: ['**/.env*', '**/secrets/**', '**/*credential*'],
    demandContext: ['library-api', 'type-safety'],
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

// --- Debug abort marker (advance only after §1 acceptance) ---
// Target: first LLM *after* Plan completes — Try · PCC · reason.
// Proves Plan failsafe triple (PCC → CS → Stitch pass-through or stitch LLM)
// finished; stitch is often zero-LLM when CS SO is schema-valid.
// FORCE_CLONE_PTRR skips host clone/env/workspace short-circuits so the real
// factoryPTRRAgent (Plan→Try→Retry→Refine) + clone tool path runs.
// Note: BITCODE_DEBUG_STOP_AFTER_FIRST_REASON is the hard-stop *flag* name;
// the generation pin is BITCODE_DEBUG_STOP_GENERATION.
const debugEnv: Record<string, string> = {
  BITCODE_LLM_CALL_DEBUG: '1',
  BITCODE_DEBUG_FORCE_CLONE_PTRR: '1',
  BITCODE_DEBUG_STOP_AFTER_FIRST_REASON: '1',
  BITCODE_DEBUG_STOP_PHASE: process.env.BITCODE_DEBUG_STOP_PHASE || 'setup',
  BITCODE_DEBUG_STOP_STEP: process.env.BITCODE_DEBUG_STOP_STEP || 'try',
  BITCODE_DEBUG_STOP_FAILSAFE:
    process.env.BITCODE_DEBUG_STOP_FAILSAFE || 'prepare_concise_context',
  BITCODE_DEBUG_STOP_GENERATION:
    process.env.BITCODE_DEBUG_STOP_GENERATION || 'reason',
  // PCC selection uses selection/seq-N (not gen-0)
  BITCODE_DEBUG_STOP_REQUIRE_GEN0:
    process.env.BITCODE_DEBUG_STOP_REQUIRE_GEN0 || '0',
  // Prefer clone agent for the stop filter (override via env if needed)
  BITCODE_DEBUG_STOP_AGENT_FILTER:
    process.env.BITCODE_DEBUG_STOP_AGENT_FILTER || 'clone-vcs',
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

writeFileSync(
  join(workRoot, 'DEBUG_PASS.md'),
  [
    '# Deposit pipeline debug pass',
    '',
    '## Abort marker (this pass)',
    '',
    '```',
    'phase: setup',
    'agent: clone-vcs (asset-pack-clone-vcs-repository-agent)',
    'step: try  (fence after Plan complete)',
    'failsafe: prepare_concise_context',
    'generation: reason',
    'BITCODE_DEBUG_FORCE_CLONE_PTRR=1',
    '```',
    '',
    'PTRR order under test: Plan → Try → Retry → Refine.',
    'This stop fences Plan completion (PCC+CS+Stitch). After §1 accepts Plan close,',
    'continue progressive Try validation (judge / SO / tools).',
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

console.log('[deposit-debug] config', {
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

console.log('[deposit-debug] exit', run.status, { debugStop });
if (stderr) {
  console.log('[deposit-debug] stderr tail:\n', stderr.split(/\r?\n/).slice(-50).join('\n'));
}
if (stdout) {
  console.log('[deposit-debug] stdout tail:\n', stdout.split(/\r?\n/).slice(-40).join('\n'));
}

// Summarize llm-call-debug dir + emit verbatim over-the-wire prompts/completions
const debugRoot = join(monorepoRoot, '.tmp/llm-call-debug');
let debugDirs: string[] = [];
try {
  debugDirs = readdirSync(debugRoot)
    .filter((d) => existsSync(join(debugRoot, d, 'ledger.jsonl')))
    .sort();
} catch {
  /* none */
}

type CallDump = {
  file: string;
  kind?: string;
  phase?: string;
  agentName?: string;
  step?: string;
  failsafe?: string;
  sequence?: string;
  model?: string;
  provider?: string;
  systemPrompt?: string;
  userPrompt?: string;
  combinedPrompt?: string;
  content?: string;
  extra?: unknown;
};

function loadLatestRunCallFiles(runDir: string): CallDump[] {
  const files = readdirSync(runDir)
    .filter((f) => f.endsWith('.json') && f !== 'debug-summary.json')
    .sort();
  const out: CallDump[] = [];
  for (const f of files) {
    try {
      const raw = JSON.parse(readFileSync(join(runDir, f), 'utf8'));
      out.push({
        file: join(runDir, f),
        kind: raw.kind,
        phase: raw.phase,
        agentName: raw.agentName,
        step: raw.step,
        failsafe: raw.failsafe,
        sequence: raw.sequence,
        model: raw.model,
        provider: raw.provider,
        systemPrompt: raw.systemPrompt,
        userPrompt: raw.userPrompt,
        combinedPrompt: raw.combinedPrompt,
        content: raw.content,
        extra: raw.extra,
      });
    } catch {
      /* skip */
    }
  }
  return out;
}

function printVerbatimWireReport(calls: CallDump[], reportPath: string) {
  const lines: string[] = [
    '# Verbatim LLM wire report (over-the-wire prompts + completions)',
    '',
    `Generated: ${new Date().toISOString()}`,
    `Calls: ${calls.length}`,
    '',
  ];
  for (const c of calls) {
    lines.push('---');
    lines.push(`## ${c.kind || '?'} | ${c.agentName || '?'} | ${c.step || '?'} | ${c.failsafe || '?'} | ${c.sequence || '?'}`);
    lines.push('');
    lines.push(`- file: \`${c.file}\``);
    lines.push(`- phase: ${c.phase || ''}`);
    lines.push(`- provider/model: ${c.provider || ''} / ${c.model || ''}`);
    lines.push('');
    if (c.systemPrompt != null && String(c.systemPrompt).length) {
      lines.push('### systemPrompt (verbatim)');
      lines.push('```');
      lines.push(String(c.systemPrompt));
      lines.push('```');
      lines.push('');
    }
    if (c.userPrompt != null && String(c.userPrompt).length) {
      lines.push('### userPrompt (verbatim)');
      lines.push('```');
      lines.push(String(c.userPrompt));
      lines.push('```');
      lines.push('');
    }
    if (
      c.combinedPrompt != null &&
      String(c.combinedPrompt).length &&
      String(c.combinedPrompt) !== String(c.systemPrompt) &&
      String(c.combinedPrompt) !== String(c.userPrompt)
    ) {
      lines.push('### combinedPrompt (verbatim)');
      lines.push('```');
      lines.push(String(c.combinedPrompt));
      lines.push('```');
      lines.push('');
    }
    if (c.content != null && String(c.content).length) {
      lines.push('### completion content (verbatim)');
      lines.push('```');
      lines.push(String(c.content));
      lines.push('```');
      lines.push('');
    }
    if (c.extra != null) {
      lines.push('### extra (debug)');
      lines.push('```json');
      lines.push(JSON.stringify(c.extra, null, 2));
      lines.push('```');
      lines.push('');
    }
  }
  writeFileSync(reportPath, lines.join('\n'), 'utf8');
  // Console: full verbatim for the last request+response pair (or abort)
  const interesting = calls.filter((c) =>
    ['request', 'response', 'abort', 'error'].includes(String(c.kind || '')),
  );
  console.log('\n========== VERBATIM WIRE (last calls) ==========\n');
  for (const c of interesting.slice(-4)) {
    console.log(`--- ${c.kind} ${c.agentName}/${c.step}/${c.failsafe}/${c.sequence} ---`);
    if (c.systemPrompt) {
      console.log('[systemPrompt]');
      console.log(c.systemPrompt);
    }
    if (c.userPrompt) {
      console.log('[userPrompt]');
      console.log(c.userPrompt);
    }
    if (c.content) {
      console.log('[completion]');
      console.log(c.content);
    }
    console.log('');
  }
  console.log(`Full verbatim report: ${reportPath}\n`);
}

let latestRunDir: string | null = null;
let latestCalls: CallDump[] = [];
if (debugDirs.length) {
  latestRunDir = join(debugRoot, debugDirs[debugDirs.length - 1]!);
  latestCalls = loadLatestRunCallFiles(latestRunDir);
  const reportPath = join(workRoot, 'VERBATIM_WIRE_REPORT.md');
  printVerbatimWireReport(latestCalls, reportPath);
  if (latestRunDir) {
    try {
      writeFileSync(
        join(latestRunDir, 'VERBATIM_WIRE_REPORT.md'),
        readFileSync(reportPath, 'utf8'),
      );
    } catch {
      /* ignore */
    }
  }
}

const summary = {
  ok: debugStop,
  exitCode: run.status,
  debugStop,
  workRoot,
  llmCallDebugRoot: debugRoot,
  llmCallDebugRuns: debugDirs,
  latestRunDir,
  callCount: latestCalls.length,
  forceClonePtrr: true,
  expectedAbort:
    'Setup → clone-vcs → Try → prepare_concise_context → reason (Plan complete fence)',
  ptrrOrder: 'Plan → Try → Retry → Refine',
  stopGeneration: env.BITCODE_DEBUG_STOP_GENERATION,
  stopFailsafe: env.BITCODE_DEBUG_STOP_FAILSAFE,
  stopStep: env.BITCODE_DEBUG_STOP_STEP,
};

writeFileSync(join(workRoot, 'debug-summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));

// Success for this pass: hard stop after first Try PCC reason (Plan finished).
// Exit may be non-zero because of the intentional throw.
if (debugStop) process.exit(0);
process.exit(run.status === 0 ? 0 : 1);
