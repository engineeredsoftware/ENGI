import {
  buildAssetPackSandboxHostPlan,
  loadVercelSandboxFactory,
  VercelSandboxPipelineHost,
  type PipelineHostMode,
} from '..';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const TRUSTED_SANDBOX_ENV_KEYS = [
  'OPENAI_API_KEY',
  'OPENAI_BASE_URL',
  'SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_SECRET_KEY',
  'SUPABASE_ADMIN_KEY',
  'SUPABASE_ANON_KEY',
  'SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'BITCODE_PIPELINE_USER_ID',
  'BITCODE_PIPELINE_DEPOSITOR_WALLET_ID',
  'BITCODE_PIPELINE_READER_WALLET_ID',
  'BITCODE_PIPELINE_WALLET_SESSION_ID',
  'BITCODE_PIPELINE_BTC_FEE_SATS',
  'BITCODE_PIPELINE_BTC_NETWORK',
  'BITCODE_LLM_PROVIDER',
  'BITCODE_LLM_MODEL',
  'BITCODE_ASSET_PACK_REAL_INFERENCE',
  'BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE',
  'BITCODE_ASSET_PACK_SETUP_PLAN_USE_PTRR',
  'BITCODE_ASSET_PACK_COMPREHEND_READ_USE_PTRR',
  'BITCODE_ASSET_PACK_DANGER_WALL_USE_PTRR',
  'BITCODE_ASSET_PACK_DISCOVERY_USE_PTRR',
  'BITCODE_ASSET_PACK_SYNTHESIS_USE_PTRR',
  'BITCODE_ASSET_PACK_VALIDATION_USE_PTRR',
  'BITCODE_ASSET_PACK_READY_TO_INSTRUCT_USE_PTRR',
  'BITCODE_ASSET_PACK_VALIDATION_READY_TO_FINISH_USE_PTRR',
  'BITCODE_ASSET_PACK_FINISH_DELIVER_USE_PTRR',
  'BITCODE_VCS_ALLOW_ENV_TOKEN_FALLBACK',
  'BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS',
] as const;

const REDACTED_OUTPUT_ENV_KEYS = [
  ...TRUSTED_SANDBOX_ENV_KEYS,
  'BITCODE_SANDBOX_SOURCE_GIT_PASSWORD',
  'GITHUB_TOKEN',
  'GITHUB_PAT',
  'GH_TOKEN',
  'VERCEL_OIDC_TOKEN',
  'VERCEL_TOKEN',
] as const;

function loadLocalEnvFiles(): void {
  const roots = [process.cwd(), resolve(process.cwd(), '..'), resolve(process.cwd(), '../..')];
  const seen = new Set<string>();

  for (const root of roots) {
    loadLocalEnvFile(resolve(root, 'uapi/.env.local'), seen, false);
    loadLocalEnvFile(resolve(root, '.env.local'), seen, true);
  }
}

function loadLocalEnvFile(path: string, seen: Set<string>, override: boolean): void {
  if (seen.has(path)) return;
  seen.add(path);
  if (!existsSync(path)) return;
  const body = readFileSync(path, 'utf8');
  for (const line of body.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(trimmed);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (!override && process.env[key] !== undefined) continue;
    process.env[key] = rawValue.trim().replace(/^(['"])(.*)\1$/, '$2');
  }
}

function requireHostOptIn(): void {
  if (process.env.BITCODE_RUN_VERCEL_SANDBOX_HOST !== '1') {
    throw new Error(
      'Set BITCODE_RUN_VERCEL_SANDBOX_HOST=1 before creating a live Vercel Sandbox.'
    );
  }
}

function requireVercelAuth(): void {
  if (!process.env.VERCEL_OIDC_TOKEN && !process.env.VERCEL_TOKEN) {
    throw new Error(
      'Missing Vercel Sandbox auth. Run `vercel link && vercel env pull`, or provide VERCEL_TOKEN with VERCEL_TEAM_ID and VERCEL_PROJECT_ID.'
    );
  }
  if (process.env.VERCEL_TOKEN && (!process.env.VERCEL_TEAM_ID || !process.env.VERCEL_PROJECT_ID)) {
    throw new Error(
      'VERCEL_TOKEN sandbox auth also requires VERCEL_TEAM_ID and VERCEL_PROJECT_ID.'
    );
  }
}

function selectedCommandEnvironment(): Record<string, string> {
  const keys = [
    ...TRUSTED_SANDBOX_ENV_KEYS,
    ...(process.env.BITCODE_SANDBOX_ENV_KEYS || '')
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean),
  ];

  const env: Record<string, string> = {};
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === 'string') {
      env[key] = value;
    }
  }

  if (process.env.BITCODE_PIPELINE_STREAM_TO_DATABASE === '1') {
    env.BITCODE_PIPELINE_STREAM_TO_DATABASE = '1';
    if (process.env.BITCODE_PIPELINE_STRUCTURED_DB === '1') {
      env.BITCODE_PIPELINE_STRUCTURED_DB = '1';
    }
    assertDatabaseStreamingEnvironment(env);
  }

  normalizeModelEnvironment(env);

  return env;
}

function assertDatabaseStreamingEnvironment(env: Record<string, string>): void {
  const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const key = selectSupabaseAdminKey(env);
  if (!isUsableSupabaseUrl(url) || !key) {
    throw new Error(
      'BITCODE_PIPELINE_STREAM_TO_DATABASE=1 requires a non-placeholder Supabase URL and an admin-capable Supabase key.'
    );
  }

  const restHost = normalizeSupabaseHost(readUrlHostname(url));
  const dbHost = normalizeSupabaseHost(readUrlHostname(process.env.SUPABASE_DB_URL || process.env.DATABASE_URL));
  if (restHost && dbHost && restHost !== dbHost) {
    throw new Error(
      `BITCODE_PIPELINE_STREAM_TO_DATABASE=1 requires matching Supabase REST and DB readback hosts: ${restHost} != ${dbHost}.`
    );
  }
}

function isUsableSupabaseUrl(value: string | undefined): boolean {
  if (!value) return false;
  try {
    const host = new URL(value).hostname;
    return Boolean(host && host !== 'your-project.supabase.co' && !host.includes('<'));
  } catch {
    return false;
  }
}

function readUrlHostname(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).hostname || null;
  } catch {
    return null;
  }
}

function normalizeSupabaseHost(host: string | null): string | null {
  if (!host) return null;
  return host.startsWith('db.') ? host.slice(3) : host;
}

function isUsableSecretValue(value: string | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 16 && !value.includes('<');
}

function supabaseJwtRole(value: string | undefined): string | null {
  if (!value) return null;
  const [, payload] = value.split('.');
  if (!payload) return null;

  try {
    return JSON.parse(Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')).role || null;
  } catch {
    return null;
  }
}

function isUsableSupabaseAdminKey(value: string | undefined): boolean {
  return isUsableSecretValue(value) && supabaseJwtRole(value) !== 'anon';
}

function selectSupabaseAdminKey(env: Record<string, string>): string | undefined {
  return [
    env.SUPABASE_SECRET_KEY,
    env.SUPABASE_ADMIN_KEY,
    env.SUPABASE_SERVICE_ROLE_KEY,
  ].find(isUsableSupabaseAdminKey);
}

function normalizeModelEnvironment(env: Record<string, string>): void {
  const provider = env.BITCODE_LLM_PROVIDER?.trim().toLowerCase();
  if (provider && !hasModelProviderCredential(provider, env)) {
    delete env.BITCODE_LLM_PROVIDER;
    delete env.BITCODE_LLM_MODEL;
  }

  if (!env.BITCODE_LLM_PROVIDER && env.OPENAI_API_KEY) {
    env.BITCODE_LLM_PROVIDER = 'openai';
  }
}

function hasModelProviderCredential(provider: string, env: Record<string, string>): boolean {
  switch (provider) {
    case 'openai':
      return Boolean(env.OPENAI_API_KEY);
    case 'anthropic':
      return Boolean(env.ANTHROPIC_API_KEY);
    case 'google':
      return Boolean(env.GOOGLE_GENERATIVE_AI_API_KEY || env.GEMINI_API_KEY || env.GOOGLE_API_KEY);
    default:
      return true;
  }
}

function sourceCredentials(): { username?: string; password?: string } {
  const explicitUsername = process.env.BITCODE_SANDBOX_SOURCE_GIT_USERNAME;
  const explicitPassword = process.env.BITCODE_SANDBOX_SOURCE_GIT_PASSWORD;
  const token =
    explicitPassword ||
    process.env.GITHUB_TOKEN ||
    process.env.GITHUB_PAT ||
    process.env.GH_TOKEN;
  if (!token) return {};
  return {
    username: explicitUsername || 'x-access-token',
    password: token,
  };
}

function findRepositoryRoot(): string {
  let current = process.cwd();
  while (current !== dirname(current)) {
    if (existsSync(resolve(current, '.git')) && existsSync(resolve(current, 'pnpm-workspace.yaml'))) {
      return current;
    }
    current = dirname(current);
  }
  throw new Error('Unable to locate ENGI repository root for local source overlay generation.');
}

function localSourceOverlayPatch(): Buffer | undefined {
  if (process.env.BITCODE_SANDBOX_APPLY_LOCAL_PATCH !== '1') return undefined;
  const root = findRepositoryRoot();
  const baseRevision = process.env.BITCODE_SANDBOX_SOURCE_REVISION || 'HEAD';
  const chunks: Buffer[] = [];
  const trackedPatch = execFileSync('git', ['diff', '--binary', baseRevision], {
    cwd: root,
    maxBuffer: 64 * 1024 * 1024,
  });
  if (trackedPatch.length > 0) {
    chunks.push(trackedPatch);
  }

  for (const path of untrackedSourcePaths(root)) {
    const patch = diffUntrackedSourcePath(root, path);
    if (patch.length > 0) {
      chunks.push(patch);
    }
  }

  const patch = Buffer.concat(chunks.flatMap((chunk) => [chunk, Buffer.from('\n')]));
  return patch.length > 0 && patch.toString('utf8').trim().length > 0 ? patch : undefined;
}

function untrackedSourcePaths(root: string): string[] {
  const output = execFileSync('git', ['ls-files', '--others', '--exclude-standard', '-z'], {
    cwd: root,
    maxBuffer: 16 * 1024 * 1024,
  });
  return output
    .toString('utf8')
    .split('\0')
    .map((path) => path.trim())
    .filter(Boolean);
}

function diffUntrackedSourcePath(root: string, path: string): Buffer {
  try {
    return execFileSync('git', ['diff', '--binary', '--no-index', '--', '/dev/null', path], {
      cwd: root,
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (error) {
    const stdout = (error as { stdout?: Buffer }).stdout;
    if (Buffer.isBuffer(stdout)) {
      return stdout;
    }
    throw error;
  }
}

function redactKnownSecrets(text: string): string {
  let redacted = text;
  for (const key of REDACTED_OUTPUT_ENV_KEYS) {
    const value = process.env[key];
    if (typeof value !== 'string' || value.length < 8) continue;
    redacted = redacted.split(value).join('[redacted]');
  }
  return redacted;
}

function summarizeEvidence(evidence: unknown): Record<string, unknown> | null {
  if (!evidence || typeof evidence !== 'object' || Array.isArray(evidence)) return null;
  const record = evidence as Record<string, unknown>;
  const error = record.error && typeof record.error === 'object'
    ? record.error as Record<string, unknown>
    : null;
  const events = Array.isArray(record.events) ? record.events : [];

  return {
    schema: record.schema,
    hostMode: record.hostMode,
    resultState: record.resultState,
    pipelineResultState: record.pipelineResultState,
    sourceOverlay: record.manifest && typeof record.manifest === 'object'
      ? (record.manifest as Record<string, unknown>).sourceOverlay ?? null
      : null,
    resultReasons: Array.isArray(record.resultReasons)
      ? record.resultReasons.map((reason) => redactKnownSecrets(String(reason)))
      : [],
    error: error
      ? {
          name: error.name,
          message: redactKnownSecrets(String(error.message || '')),
        }
      : null,
    outputKeys: record.output && typeof record.output === 'object'
      ? Object.keys(record.output as Record<string, unknown>)
      : [],
    eventTypes: events
      .map((event) => event && typeof event === 'object'
        ? (event as Record<string, unknown>).type
        : null)
      .filter(Boolean),
  };
}

function persistLocalArtifacts(result: {
  sandboxId?: string;
  artifacts: { evidence: unknown | null; telemetry: string | null };
}): string | null {
  const outputRoot =
    process.env.BITCODE_PIPELINE_HOST_LOCAL_ARTIFACT_DIR ||
    resolve(findRepositoryRoot(), '.bitcode/pipeline-host-runs');
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const sandboxId = result.sandboxId || 'unknown-sandbox';
  const dir = resolve(outputRoot, `${stamp}-${sandboxId}`);
  mkdirSync(dir, { recursive: true });

  if (result.artifacts.evidence !== null) {
    writeFileSync(resolve(dir, 'evidence.json'), JSON.stringify(result.artifacts.evidence, null, 2));
  }
  if (result.artifacts.telemetry !== null) {
    writeFileSync(resolve(dir, 'telemetry.jsonl'), result.artifacts.telemetry);
  }
  writeFileSync(
    resolve(dir, 'summary.json'),
    JSON.stringify({
      sandboxId,
      evidencePresent: result.artifacts.evidence !== null,
      telemetryPresent: result.artifacts.telemetry !== null,
      telemetryLineCount: result.artifacts.telemetry
        ? result.artifacts.telemetry.split(/\r?\n/).filter(Boolean).length
        : 0,
    }, null, 2)
  );
  return dir;
}

async function main(): Promise<void> {
  loadLocalEnvFiles();
  requireHostOptIn();
  requireVercelAuth();

  const mode = (process.env.BITCODE_SANDBOX_MODE || 'host_smoke') as PipelineHostMode;
  const repositoryFullName =
    process.env.BITCODE_SANDBOX_REPOSITORY || 'engineeredsoftware/ENGI';
  const branch = process.env.BITCODE_SANDBOX_SOURCE_BRANCH || 'main';
  const commit = process.env.BITCODE_SANDBOX_SOURCE_COMMIT || 'unknown';
  const sourceUrl = process.env.BITCODE_SANDBOX_SOURCE_GIT_URL;
  const credentials = sourceCredentials();

  const plan = buildAssetPackSandboxHostPlan({
    mode,
    read: {
      id: process.env.BITCODE_SANDBOX_READ_ID || 'manual-read-fit-qa',
      prompt:
        process.env.BITCODE_SANDBOX_READ_PROMPT ||
        'Read the deposited repository revision and determine whether it contains a complete non-mock Terminal path through Deposit, Read/Fit, AssetPack evidence, proof/finality readback, and Supabase/ledger reconciliation.',
    },
    deposit: {
      id: process.env.BITCODE_SANDBOX_DEPOSIT_ID || 'manual-deposit-qa',
      assetId: process.env.BITCODE_SANDBOX_DEPOSIT_ASSET_ID || null,
      hasWalletOrAttestationProof: process.env.BITCODE_SANDBOX_DEPOSIT_HAS_PROOF === '1',
      hasAssetMeasurementEvidence: process.env.BITCODE_SANDBOX_DEPOSIT_HAS_MEASUREMENT === '1',
      proofRoot: process.env.BITCODE_SANDBOX_DEPOSIT_PROOF_ROOT || null,
      measurementRoot: process.env.BITCODE_SANDBOX_DEPOSIT_MEASUREMENT_ROOT || null,
      reconciliationReadbackRoot:
        process.env.BITCODE_SANDBOX_DEPOSIT_RECONCILIATION_READBACK_ROOT || null,
    },
    sourceRevision: {
      repositoryFullName,
      branch,
      commit,
    },
    source: sourceUrl
      ? {
          type: 'git',
          url: sourceUrl,
          revision: process.env.BITCODE_SANDBOX_SOURCE_REVISION || commit,
          depth: Number(process.env.BITCODE_SANDBOX_SOURCE_DEPTH || 1),
          ...credentials,
        }
      : undefined,
    commandEnvironment: selectedCommandEnvironment(),
    assumeRepositoryPresent: process.env.BITCODE_SANDBOX_ASSUME_REPOSITORY_PRESENT === '1',
    installDependencies: process.env.BITCODE_SANDBOX_SKIP_INSTALL !== '1',
    sourceOverlayPatch: localSourceOverlayPatch(),
  });

  const sandboxFactory = await loadVercelSandboxFactory();
  const host = new VercelSandboxPipelineHost({
    sandboxFactory,
    stopAfterRun: process.env.BITCODE_SANDBOX_LEAVE_RUNNING !== '1',
    sandboxCreateTimeoutMs: Number(process.env.BITCODE_SANDBOX_CREATE_TIMEOUT_MS || 180_000),
    onEvent: (event) => {
      process.stderr.write(`[host:${event.type}] ${redactKnownSecrets(JSON.stringify(event))}\n`);
    },
  });
  const result = await host.runHostPlan(plan);
  const localArtifactDir = persistLocalArtifacts(result);

  process.stdout.write(
    JSON.stringify(
      {
        outcome: result.outcome,
        sandboxId: result.sandboxId,
        stopped: result.stopped,
        localArtifactDir,
        commandCount: result.commands.length,
        sourceOverlayApplied: Boolean(plan.sourceOverlay),
        commandExitCodes: result.commands.map((command) => ({
          label: command.label,
          exitCode: command.exitCode,
        })),
        commands: result.commands.map((command) => ({
          label: command.label,
          exitCode: command.exitCode,
          stdoutTail: redactKnownSecrets(command.stdout.slice(-1200)),
          stderrTail: redactKnownSecrets(command.stderr.slice(-1200)),
        })),
        evidencePresent: result.artifacts.evidence !== null,
        telemetryPresent: result.artifacts.telemetry !== null,
        evidence: summarizeEvidence(result.artifacts.evidence),
        telemetryLineCount: result.artifacts.telemetry
          ? result.artifacts.telemetry.split(/\r?\n/).filter(Boolean).length
          : 0,
      },
      null,
      2
    ) + '\n'
  );

  if (result.outcome !== 'completed') {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  process.stderr.write(`${error?.message || String(error)}\n`);
  process.exitCode = 1;
});
