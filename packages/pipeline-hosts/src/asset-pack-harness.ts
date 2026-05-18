import { createHash } from 'node:crypto';

import {
  buildAssetPackPipelineHarnessManifest,
  VERCEL_SANDBOX_HOST_CAPABILITIES,
} from './manifest';
import type {
  PipelineDepositReference,
  PipelineHarnessCommand,
  PipelineHarnessMode,
  PipelineHarnessPlan,
  PipelineNetworkPolicy,
  PipelineReadRequest,
  PipelineSandboxSource,
  PipelineSourceRevision,
  VercelSandboxRuntime,
} from './types';

const HARNESS_DIRECTORY = '.bitcode/pipeline-harness';
const MANIFEST_PATH = `${HARNESS_DIRECTORY}/manifest.json`;
const HOST_SMOKE_RUNNER_PATH = `${HARNESS_DIRECTORY}/run-host-smoke.mjs`;
const LIVE_PIPELINE_RUNNER_PATH = `${HARNESS_DIRECTORY}/run-live-asset-pack-pipeline.ts`;
const SOURCE_OVERLAY_PATCH_PATH = `${HARNESS_DIRECTORY}/source-overlay.patch`;
const EVIDENCE_PATH = `${HARNESS_DIRECTORY}/evidence.json`;
const TELEMETRY_PATH = `${HARNESS_DIRECTORY}/telemetry.jsonl`;
const TSCONFIG_PATHS_REGISTER_PATH = `${HARNESS_DIRECTORY}/node_modules/tsconfig-paths/register`;
const PIPELINE_STDOUT_PATH = `${HARNESS_DIRECTORY}/pipeline.stdout.log`;
const PIPELINE_STDERR_PATH = `${HARNESS_DIRECTORY}/pipeline.stderr.log`;
const PIPELINE_EXIT_CODE_PATH = `${HARNESS_DIRECTORY}/pipeline.exit-code`;
const SANDBOX_WORKING_DIRECTORY = '/vercel/sandbox' as const;
const DEFAULT_LONG_TIMEOUT_MS = 45 * 60 * 1000;
const SANDBOX_PNPM_VERSION = '10.33.0';

export interface BuildAssetPackSandboxHarnessOptions {
  mode?: PipelineHarnessMode;
  read: PipelineReadRequest;
  readNeed?: unknown;
  deposit: PipelineDepositReference;
  sourceRevision: PipelineSourceRevision;
  source?: PipelineSandboxSource;
  assumeRepositoryPresent?: boolean;
  runtime?: VercelSandboxRuntime;
  timeoutMs?: number;
  networkPolicy?: PipelineNetworkPolicy;
  commandEnvironment?: Record<string, string>;
  installDependencies?: boolean;
  sourceOverlayPatch?: Buffer | string;
}

export function buildAssetPackSandboxHarness(
  options: BuildAssetPackSandboxHarnessOptions
): PipelineHarnessPlan {
  const mode = options.mode ?? 'host_smoke';
  if (mode === 'asset_pack_pipeline' && !options.source && !options.assumeRepositoryPresent) {
    throw new Error(
      'asset_pack_pipeline harness mode requires a sandbox source or assumeRepositoryPresent=true.'
    );
  }

  const sourceOverlayPatch = normalizeSourceOverlayPatch(options.sourceOverlayPatch);
  const sourceOverlay = sourceOverlayPatch
    ? {
        path: SOURCE_OVERLAY_PATCH_PATH,
        patchRoot: SANDBOX_WORKING_DIRECTORY,
        admissibility: 'qa-only-not-source-revision-evidence' as const,
      }
    : undefined;
  const commandEnvironment = {
    BITCODE_PIPELINE_HARNESS_MANIFEST: `${SANDBOX_WORKING_DIRECTORY}/${MANIFEST_PATH}`,
    BITCODE_PIPELINE_HARNESS_ARTIFACT_DIR: `${SANDBOX_WORKING_DIRECTORY}/${HARNESS_DIRECTORY}`,
    BITCODE_PIPELINE_HARNESS_MODE: mode,
    ...(sourceOverlay ? { BITCODE_PIPELINE_SOURCE_OVERLAY_APPLIED: '1' } : {}),
    ...options.commandEnvironment,
  };
  const deposit = normalizeDepositReferenceEvidence({
    deposit: options.deposit,
    sourceRevision: options.sourceRevision,
    read: options.read,
  });

  const manifest = buildAssetPackPipelineHarnessManifest({
    mode,
    read: options.read,
    readNeed: options.readNeed,
    requireAcceptedReadNeed: true,
    deposit,
    sourceRevision: options.sourceRevision,
    sourceOverlay,
    commandEnvironment,
  });

  const commands = buildCommands(
    mode,
    commandEnvironment,
    options.installDependencies ?? true,
    sourceOverlayPatch !== null
  );

  return {
    capabilities: VERCEL_SANDBOX_HOST_CAPABILITIES,
    createOptions: {
      runtime: options.runtime ?? VERCEL_SANDBOX_HOST_CAPABILITIES.defaultRuntime,
      timeout: options.timeoutMs ?? DEFAULT_LONG_TIMEOUT_MS,
      networkPolicy: options.networkPolicy ?? 'allow-all',
      source: options.source,
    },
    manifest,
    files: [
      {
        path: MANIFEST_PATH,
        content: Buffer.from(JSON.stringify(manifest, null, 2)),
        mode: 0o644,
      },
      {
        path: HOST_SMOKE_RUNNER_PATH,
        content: Buffer.from(createHostSmokeRunner()),
        mode: 0o755,
      },
      {
        path: LIVE_PIPELINE_RUNNER_PATH,
        content: Buffer.from(createLiveAssetPackPipelineRunner()),
        mode: 0o755,
      },
      ...(sourceOverlayPatch
        ? [
            {
              path: SOURCE_OVERLAY_PATCH_PATH,
              content: sourceOverlayPatch,
              mode: 0o644,
            },
          ]
        : []),
    ],
    sourceOverlay,
    commands,
    artifactPaths: {
      evidence: EVIDENCE_PATH,
      telemetry: TELEMETRY_PATH,
    },
  };
}

function normalizeDepositReferenceEvidence({
  deposit,
  sourceRevision,
  read,
}: {
  deposit: PipelineDepositReference;
  sourceRevision: PipelineSourceRevision;
  read: PipelineReadRequest;
}): PipelineDepositReference {
  const basis = {
    depositId: deposit.id,
    assetId: deposit.assetId,
    readId: read.id,
    repositoryFullName: sourceRevision.repositoryFullName,
    branch: sourceRevision.branch,
    commit: sourceRevision.commit,
  };
  const hasProof = deposit.hasWalletOrAttestationProof === true;
  const hasMeasurement = deposit.hasAssetMeasurementEvidence === true;

  return {
    ...deposit,
    proofRoot:
      deposit.proofRoot ||
      (hasProof ? evidenceRoot('deposit-proof', basis) : deposit.proofRoot),
    measurementRoot:
      deposit.measurementRoot ||
      (hasMeasurement ? evidenceRoot('deposit-measurement', basis) : deposit.measurementRoot),
    reconciliationReadbackRoot:
      deposit.reconciliationReadbackRoot ||
      (hasProof && hasMeasurement
        ? evidenceRoot('deposit-reconciliation-readback', basis)
        : deposit.reconciliationReadbackRoot),
  };
}

function evidenceRoot(kind: string, basis: Record<string, unknown>): string {
  return `sha256:${createHash('sha256')
    .update(JSON.stringify({ kind, ...basis }))
    .digest('hex')}`;
}

function buildCommands(
  mode: PipelineHarnessMode,
  commandEnvironment: Record<string, string>,
  installDependencies: boolean,
  hasSourceOverlayPatch: boolean
): PipelineHarnessCommand[] {
  const commands: PipelineHarnessCommand[] = [
    {
      label: 'runtime-readiness',
      cmd: 'node',
      args: ['--version'],
      required: true,
    },
  ];

  if (mode === 'asset_pack_pipeline') {
    if (hasSourceOverlayPatch) {
      commands.push({
        label: 'apply-source-overlay',
        cmd: 'git',
        args: ['apply', '--whitespace=nowarn', SOURCE_OVERLAY_PATCH_PATH],
        required: true,
      });
    }

    commands.push({
      label: 'package-manager-readiness',
      cmd: 'corepack',
      args: ['prepare', `pnpm@${SANDBOX_PNPM_VERSION}`, '--activate'],
      required: true,
    });

    if (installDependencies) {
      commands.push({
        label: 'workspace-install',
        cmd: 'pnpm',
        args: ['install', '--frozen-lockfile'],
        required: true,
      });
    }

    commands.push({
      label: 'harness-runtime-install',
      cmd: 'npm',
      args: ['install', '--prefix', HARNESS_DIRECTORY, 'tsconfig-paths@4.2.0'],
      required: true,
    });

    const pipelineArgs = [
      'pnpm',
      '--filter',
      '@bitcode/pipeline-hosts',
      'exec',
      'ts-node',
      '--project',
      '../../tsconfig.json',
      '-r',
      `../../${TSCONFIG_PATHS_REGISTER_PATH}`,
      '--transpile-only',
      `../../${LIVE_PIPELINE_RUNNER_PATH}`,
    ];
    const maxWaitMs = Number(commandEnvironment.BITCODE_PIPELINE_HARNESS_MAX_RUNTIME_MS || DEFAULT_LONG_TIMEOUT_MS) + 120000;
    commands.push({
      label: 'asset-pack-pipeline-run',
      cmd: 'sh',
      args: [
        '-lc',
        [
          `${pipelineArgs.map(shellQuote).join(' ')} > ${shellQuote(PIPELINE_STDOUT_PATH)} 2> ${shellQuote(PIPELINE_STDERR_PATH)}`,
          'code=$?',
          `printf "%s" "$code" > ${shellQuote(PIPELINE_EXIT_CODE_PATH)}`,
          'exit "$code"',
        ].join('; '),
      ],
      env: commandEnvironment,
      detached: true,
      exitCodePath: PIPELINE_EXIT_CODE_PATH,
      stdoutPath: PIPELINE_STDOUT_PATH,
      stderrPath: PIPELINE_STDERR_PATH,
      maxWaitMs,
      pollIntervalMs: 2000,
      required: true,
    });

    return commands;
  }

  commands.push({
    label: 'host-smoke-harness-run',
    cmd: 'node',
    args: [HOST_SMOKE_RUNNER_PATH],
    env: commandEnvironment,
    required: true,
  });

  return commands;
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function normalizeSourceOverlayPatch(sourceOverlayPatch?: Buffer | string): Buffer | null {
  if (typeof sourceOverlayPatch === 'string') {
    return sourceOverlayPatch.trim().length > 0 ? Buffer.from(sourceOverlayPatch) : null;
  }
  if (Buffer.isBuffer(sourceOverlayPatch)) {
    return sourceOverlayPatch.length > 0 && sourceOverlayPatch.toString('utf8').trim().length > 0
      ? sourceOverlayPatch
      : null;
  }
  return null;
}

function createHostSmokeRunner(): string {
  return `import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { arch, platform, release } from 'node:os';

const manifestPath = process.env.BITCODE_PIPELINE_HARNESS_MANIFEST || '${MANIFEST_PATH}';
const artifactDir = process.env.BITCODE_PIPELINE_HARNESS_ARTIFACT_DIR || '${HARNESS_DIRECTORY}';
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const startedAt = new Date().toISOString();
const manifestRoot = createHash('sha256').update(JSON.stringify(manifest)).digest('hex');

await mkdir(artifactDir, { recursive: true });

const events = [
  {
    type: 'harness-start',
    stage: 'telemetry-readback',
    harnessMode: manifest.harnessMode,
    sourceRevision: manifest.sourceRevision,
    startedAt,
  },
  {
    type: 'host-runtime-readiness',
    stage: 'telemetry-readback',
    nodeVersion: process.version,
    platform: platform(),
    arch: arch(),
    release: release(),
  },
  {
    type: 'pipeline-boundary',
    stage: 'asset-pack-synthesis',
    resultState: 'blocked_readiness',
    reason: 'Host smoke mode verifies sandbox execution and artifact export only. Run asset_pack_pipeline mode for repository pipeline execution evidence.',
  },
  {
    type: 'harness-complete',
    stage: 'telemetry-readback',
    completedAt: new Date().toISOString(),
  },
];

const evidence = {
  schema: 'bitcode.pipeline-harness.evidence',
  harnessMode: manifest.harnessMode,
  resultState: 'blocked_readiness',
  resultReasons: [
    'Vercel Sandbox host lifecycle completed.',
    'Command output and artifacts were exported before sandbox stop.',
    'AssetPack pipeline execution was not invoked in host_smoke mode.',
  ],
  manifestRoot,
  manifest,
  hostRuntime: {
    nodeVersion: process.version,
    platform: platform(),
    arch: arch(),
    release: release(),
  },
  events,
  createdAt: new Date().toISOString(),
};

await writeFile(\`\${artifactDir}/telemetry.jsonl\`, events.map((event) => JSON.stringify(event)).join('\\n') + '\\n');
await writeFile(\`\${artifactDir}/evidence.json\`, JSON.stringify(evidence, null, 2));
`;
}

function createLiveAssetPackPipelineRunner(): string {
  return `import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';

const manifestPath = process.env.BITCODE_PIPELINE_HARNESS_MANIFEST || '${MANIFEST_PATH}';
const artifactDir = process.env.BITCODE_PIPELINE_HARNESS_ARTIFACT_DIR || '${HARNESS_DIRECTORY}';
const runId = process.env.BITCODE_PIPELINE_RUN_ID || randomUUID();
const DEFAULT_USER_ID = '00000000-0000-4000-8000-000000000000';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const startedAt = new Date().toISOString();
const harnessMaxRuntimeMs = Number(process.env.BITCODE_PIPELINE_HARNESS_MAX_RUNTIME_MS || 240000);
const checkpointIntervalMs = Number(process.env.BITCODE_PIPELINE_HARNESS_CHECKPOINT_INTERVAL_MS || 2000);
let manifest = null;
let manifestRoot = null;
let userId = process.env.BITCODE_PIPELINE_USER_ID || DEFAULT_USER_ID;
const events = [];
let resultState = 'blocked_readiness';
let output = null;
let error = null;
let supabase = null;
let execution = null;
let pipelineRunPersisted = false;
let pipelineRunId = null;
let forceExitAfterFinally = false;
let checkpointTimer = null;
let heartbeatTimer = null;
let checkpointInFlight = Promise.resolve();
let lastCheckpointAt = 0;

function normalizeResultState(candidate) {
  return ['worthy_fit', 'no_worthy_fit', 'blocked_readiness'].includes(candidate)
    ? candidate
    : 'blocked_readiness';
}

function requiresPullRequestDelivery(output, input) {
  const template =
    output?.deliveryMechanismTemplate ||
    output?.assetPack?.deliveryMechanismTemplate ||
    input?.deliveryMechanismTemplate;
  return template === 'pull-request';
}

function findPullRequestUrl(output) {
  return (
    output?.deliveryMechanism?.pullRequest?.url ||
    output?.deliveryMechanism?.prUrl ||
    output?.shippables?.pullRequest?.url ||
    output?.shippable?.prUrl ||
    output?.writtenAssets?.pullRequest?.url ||
    output?.assetPackSynthesisArtifacts?.pullRequest?.url ||
    null
  );
}

function isUsableUuid(value) {
  return UUID_PATTERN.test(String(value || '')) && value !== DEFAULT_USER_ID;
}

function record(event) {
  events.push({
    ...event,
    at: new Date().toISOString(),
    runId,
  });
  scheduleCheckpoint('event');
}

function stageForStreamEvent(event) {
  return event?.executionState?.phase || event?.phase || 'telemetry-readback';
}

const REDACTED_KEY_PATTERN = /(^|[_-])(api[_-]?key|token|secret|password|authorization|credential|service[_-]?role|bearer|cookie)($|[_-])/i;
const SECRET_VALUE_PATTERN = /(sk-[A-Za-z0-9_-]{12,}|eyJ[A-Za-z0-9_-]{20,}\\.[A-Za-z0-9_-]{20,}\\.[A-Za-z0-9_-]{10,}|sbp_[A-Za-z0-9_-]{10,})/g;

function isSensitiveKey(key) {
  if (/^(input|output|total|prompt|completion)Tokens$/i.test(String(key))) return false;
  return REDACTED_KEY_PATTERN.test(String(key));
}

function redactString(value) {
  return String(value).replace(SECRET_VALUE_PATTERN, '[redacted]');
}

function summarizeInspectableValue(value, depth = 0) {
  if (value == null) return value;
  if (typeof value === 'string') {
    const redacted = redactString(value);
    return {
      type: 'string',
      length: redacted.length,
      preview: redacted.length > 1800 ? redacted.slice(0, 1800) + '... [truncated]' : redacted,
    };
  }
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) {
    return {
      type: 'array',
      length: value.length,
      sample: value.slice(0, 8).map((entry) => summarizeInspectableValue(entry, depth + 1)),
    };
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value);
    const sample = {};
    for (const [key, entryValue] of entries.slice(0, depth > 1 ? 10 : 18)) {
      sample[key] = isSensitiveKey(key)
        ? '[redacted]'
        : summarizeInspectableValue(entryValue, depth + 1);
    }
    return {
      type: 'object',
      keys: entries.map(([key]) => key).slice(0, 40),
      sample,
    };
  }
  return String(value);
}

function summarizeLlmInspectable(event, data) {
  if (event?.namespace !== 'llm') return null;
  const key = String(event?.key || '');
  if (!['input', 'messages', 'prompt', 'output', 'parsedOutput', 'response', 'config', 'usage', 'provider', 'model'].includes(key)) {
    return null;
  }
  return summarizeInspectableValue(data ?? event?.data ?? null);
}

function summarizeExecutionNode(node, depth = 0) {
  const namespaces = {};
  for (const namespace of node.getNamespaces()) {
    const values = node.getAll(namespace);
    namespaces[namespace] = values
      ? Array.from(values.entries()).map(([key, value]) => ({
          key,
          value: summarizeInspectableValue(value),
        }))
      : [];
  }
  const children = [];
  if (depth < 8) {
    for (const child of node.children?.values?.() || []) {
      children.push(summarizeExecutionNode(child, depth + 1));
    }
  }
  return {
    id: node.id,
    path: node.getPath?.() || [],
    summary: node.summary(),
    namespaces,
    children,
  };
}

function summarizeStreamEvent(event) {
  const data = event?.data && typeof event.data === 'object' && !Array.isArray(event.data)
    ? event.data
    : null;
  return {
    type: 'pipeline-stream-event',
    stage: stageForStreamEvent(event),
    streamEventType: event?.type || 'status',
    namespace: event?.namespace || null,
    key: event?.key || null,
    executionPath: Array.isArray(event?.executionPath) ? event.executionPath : [],
    executionState: event?.executionState || null,
    message: event?.message || null,
    dataKeys: data ? Object.keys(data).sort() : [],
    tool: data?.tool ? String(data.tool) : null,
    toolOk: typeof data?.ok === 'boolean' ? data.ok : null,
    toolInputPresent: Boolean(data?.input),
    toolOutputPresent: Boolean(data?.output),
    toolErrorPresent: Boolean(data?.error),
    inputMessageCount: Array.isArray(data?.messages) ? data.messages.length : null,
    outputContentLength: typeof data?.content === 'string' ? data.content.length : null,
    parsedOutputPresent: Boolean(data?.parsed),
    inspectable: summarizeLlmInspectable(event, event?.data ?? null),
  };
}

function buildManifestDepositoryAsset(manifest) {
  const assetId = manifest.deposit?.assetId || manifest.deposit?.id || 'manifest-deposit-reference';
  const source = manifest.sourceRevision || {};
  const repositoryFullName = source.repositoryFullName || '';
  const verificationEvidence = {
    proofRoot: manifest.deposit?.proofRoot || null,
    measurementRoot: manifest.deposit?.measurementRoot || null,
    reconciliationReadbackRoot: manifest.deposit?.reconciliationReadbackRoot || null,
  };
  const text = [
    'Deposited repository revision',
    repositoryFullName,
    source.branch,
    source.commit,
    'repository-revision fit-quality-receipt asset-pack-evidence proof-root reconciliation-readback',
    manifest.read?.prompt,
  ].filter(Boolean).join(' ');

  return {
    assetId,
    title: \`Deposited repository revision \${repositoryFullName || assetId}\`,
    summary: text,
    artifactKind: 'repository-revision',
    artifactType: 'repository/revision',
    repositoryFullName,
    sourceBranch: source.branch || null,
    sourceCommit: source.commit || null,
    contentRoot: \`sha256:\${createHash('sha256').update(text).digest('hex')}\`,
    contentUnits: [
      {
        unitId: \`\${assetId}:repository-revision\`,
        unitKind: 'repository-revision',
        text,
      },
    ],
    sourceMaterialBinding: {
      mode: 'source-bound-repository-revision',
      mutableInBranch: false,
      materializationRoot: \`.bitcode/source-material/\${assetId}\`,
    },
    hasWalletOrAttestationProof: manifest.deposit?.hasWalletOrAttestationProof === true,
    hasAssetMeasurementEvidence: manifest.deposit?.hasAssetMeasurementEvidence === true,
    verificationEvidence: Object.values(verificationEvidence).some(Boolean)
      ? verificationEvidence
      : null,
  };
}

function summarizeExecution(execution) {
  const summary = {
    root: execution.summary(),
    namespaces: {},
    tree: summarizeExecutionNode(execution),
  };
  for (const namespace of execution.getNamespaces()) {
    const values = execution.getAll(namespace);
    summary.namespaces[namespace] = values
      ? Array.from(values.entries()).map(([key, value]) => ({ key, value: summarizeInspectableValue(value) }))
      : [];
  }
  return summary;
}

function findExecutionValueDown(node, namespace, key) {
  if (!node) return undefined;
  const value = node.get?.(namespace, key);
  if (value !== undefined) return value;
  for (const child of node.children?.values?.() || []) {
    const childValue = findExecutionValueDown(child, namespace, key);
    if (childValue !== undefined) return childValue;
  }
  return undefined;
}

async function withHarnessTimeout(promise, maxRuntimeMs) {
  if (!Number.isFinite(maxRuntimeMs) || maxRuntimeMs <= 0) return promise;
  let timeout = null;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timeout = setTimeout(() => {
          const timeoutError = new Error(\`AssetPack pipeline exceeded harness runtime budget of \${maxRuntimeMs}ms.\`);
          timeoutError.name = 'PipelineHarnessTimeoutError';
          reject(timeoutError);
        }, maxRuntimeMs);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function checkpointEvidence(reason) {
  return {
    schema: 'bitcode.pipeline-harness.evidence',
    checkpoint: true,
    checkpointReason: reason,
    harnessMode: manifest?.harnessMode || 'asset_pack_pipeline',
    resultState,
    resultReasons: [
      'AssetPack pipeline harness checkpoint; final admissibility requires completed finish evidence.',
      reason,
    ],
    runId,
    userId,
    manifestRoot,
    manifest,
    output,
    error,
    execution: execution ? summarizeExecution(execution) : null,
    events,
    startedAt,
    checkpointAt: new Date().toISOString(),
  };
}

async function writeCheckpoint(reason) {
  if (!manifest) return;
  await mkdir(artifactDir, { recursive: true });
  await writeFile(\`\${artifactDir}/evidence.json\`, JSON.stringify(checkpointEvidence(reason), null, 2));
  await writeFile(\`\${artifactDir}/telemetry.jsonl\`, events.map((event) => JSON.stringify(event)).join('\\n') + '\\n');
}

function scheduleCheckpoint(reason) {
  const now = Date.now();
  if (now - lastCheckpointAt < checkpointIntervalMs) return;
  lastCheckpointAt = now;
  checkpointInFlight = checkpointInFlight
    .catch(() => {})
    .then(() => writeCheckpoint(reason))
    .catch((checkpointError) => {
      try {
        process.stderr.write(\`[bitcode-harness-checkpoint-error] \${checkpointError?.message || String(checkpointError)}\\n\`);
      } catch {}
    });
}

function startHeartbeat() {
  if (heartbeatTimer) return;
  heartbeatTimer = setInterval(() => {
    const phase = execution?.get?.('phase', 'current') || 'initializing';
    const agent = execution?.get?.('agent', 'name') || 'none';
    process.stderr.write(\`[bitcode-harness-heartbeat] runId=\${runId} phase=\${phase} agent=\${agent} events=\${events.length}\\n\`);
    scheduleCheckpoint('heartbeat');
  }, 30000);
  heartbeatTimer.unref?.();
}

function stopHeartbeat() {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  if (checkpointTimer) clearInterval(checkpointTimer);
  heartbeatTimer = null;
  checkpointTimer = null;
}

async function insertPipelineRun() {
  if (!supabase) return null;
  try {
    const { data, error: insertError } = await supabase.from('pipeline_runs').insert({
      user_id: userId,
      pipeline_type: 'asset_pack',
      pipeline_name: 'asset-pack-read-fit',
      status: 'running',
      execution_id: runId,
      correlation_id: runId,
      started_at: startedAt,
      metadata: {
        bitcodePipelineHarness: true,
        harnessMode: manifest?.harnessMode || 'asset_pack_pipeline',
        manifestRoot,
        sourceRevision: manifest?.sourceRevision || null,
      },
      input: {
        read: manifest?.read || null,
        deposit: manifest?.deposit || null,
        sourceRevision: manifest?.sourceRevision || null,
      },
    }).select('id').single();
    if (insertError) {
      const existingId = await findPipelineRunIdByExecutionId();
      if (existingId) {
        pipelineRunId = existingId;
        pipelineRunPersisted = true;
        record({ type: 'pipeline-run-reused', stage: 'telemetry-readback', pipelineRunId });
        return pipelineRunId;
      }
      record({ type: 'pipeline-run-persist-blocked', stage: 'telemetry-readback', error: insertError.message });
      return null;
    }
    pipelineRunId = data?.id || null;
    pipelineRunPersisted = true;
    record({ type: 'pipeline-run-persisted', stage: 'telemetry-readback', pipelineRunId });
    return pipelineRunId;
  } catch (persistError) {
    record({ type: 'pipeline-run-persist-blocked', stage: 'telemetry-readback', error: persistError?.message || String(persistError) });
    return null;
  }
}

async function updatePipelineRun(status, payload) {
  if (!supabase || !pipelineRunPersisted || !pipelineRunId) return;
  try {
    await supabase
      .from('pipeline_runs')
      .update({
        status,
        completed_at: new Date().toISOString(),
        output: payload?.output || null,
        error_data: payload?.error || null,
        artifacts: {
          manifestRoot,
          evidencePath: '${EVIDENCE_PATH}',
          telemetryPath: '${TELEMETRY_PATH}',
        },
        validation: {
          resultState: payload?.resultState || resultState,
          resultReasons: payload?.resultReasons || [],
        },
        duration_ms: Date.now() - Date.parse(startedAt),
        updated_at: new Date().toISOString(),
      })
      .eq('id', pipelineRunId);
  } catch (persistError) {
    record({ type: 'pipeline-run-update-blocked', stage: 'telemetry-readback', error: persistError?.message || String(persistError) });
  }
}

async function findPipelineRunIdByExecutionId() {
  if (!supabase) return null;
  try {
    const { data, error: lookupError } = await supabase
      .from('pipeline_runs')
      .select('id')
      .eq('execution_id', runId)
      .maybeSingle();
    if (lookupError) return null;
    return data?.id || null;
  } catch {
    return null;
  }
}

async function resolvePipelineUserId() {
  if (isUsableUuid(userId)) return userId;
  if (!supabase) return userId;

  try {
    const { data, error: lookupError } = await supabase
      .from('user_connections')
      .select('user_id')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!lookupError && isUsableUuid(data?.user_id)) {
      userId = data.user_id;
      record({ type: 'pipeline-user-resolved', stage: 'telemetry-readback', source: 'user_connections' });
      return userId;
    }
  } catch (lookupError) {
    record({ type: 'pipeline-user-lookup-blocked', stage: 'telemetry-readback', error: lookupError?.message || String(lookupError) });
  }

  throw new Error('BITCODE_PIPELINE_USER_ID is required for database-backed pipeline harness telemetry.');
}

async function insertHarnessStreamLog(status) {
  if (!supabase) return;
  try {
    await supabase.from('stream_logs').insert({
      stream_id: runId,
      user_id: userId,
      log_type: 'pipeline-harness',
      log_data: {
        event: 'pipeline-harness-complete',
        status,
        resultState,
        manifestRoot,
        harnessMode: manifest?.harnessMode || 'asset_pack_pipeline',
      },
    });
  } catch (persistError) {
    record({ type: 'stream-log-persist-blocked', stage: 'telemetry-readback', error: persistError?.message || String(persistError) });
  }
}

function stableJson(value) {
  if (value == null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map((entry) => stableJson(entry)).join(',') + ']';
  return '{' + Object.keys(value).sort().map((key) => JSON.stringify(key) + ':' + stableJson(value[key])).join(',') + '}';
}

function rootOf(value) {
  return 'sha256:' + createHash('sha256').update(stableJson(value)).digest('hex');
}

function positiveIntegerEnv(name, fallback) {
  const parsed = Number(process.env[name] || fallback);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function normalizeBtcLedgerNetwork(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'regtest') return 'regtest';
  if (normalized === 'signet') return 'signet';
  if (normalized === 'mainnet' || normalized === 'bitcoin-mainnet') return 'mainnet';
  if (
    normalized === 'testnet' ||
    normalized === 'testnet3' ||
    normalized === 'testnet4' ||
    normalized === 'testnet-4' ||
    normalized === 'bitcoin-testnet4' ||
    normalized === 'staging-testnet'
  ) {
    return 'testnet';
  }
  return 'testnet';
}

function ledgerWallet(kind, explicit, fallback) {
  const value = String(explicit || '').trim();
  if (value) return value;
  return kind + ':' + fallback;
}

function settlementOwnershipBoundary(fields = {}) {
  const depositorWalletId = fields.depositorWalletId ||
    ledgerWallet('depositor-wallet', process.env.BITCODE_PIPELINE_DEPOSITOR_WALLET_ID, manifest?.deposit?.id || runId);
  const readerWalletId = fields.readerWalletId ||
    ledgerWallet('reader-wallet', process.env.BITCODE_PIPELINE_READER_WALLET_ID, userId || runId);
  const btcFeeSats = fields.btcFeeSats || positiveIntegerEnv('BITCODE_PIPELINE_BTC_FEE_SATS', 546);
  const btcNetwork = normalizeBtcLedgerNetwork(fields.btcNetwork || process.env.BITCODE_PIPELINE_BTC_NETWORK || 'testnet');
  return {
    schema: 'bitcode.asset-pack.settlement-boundary',
    status: fields.status || 'blocked',
    depositorWalletId,
    readerWalletId,
    depositorBoundary: 'depositor owns minted BTD range for deposited source evidence',
    readerBoundary: 'reader pays BTC fee and receives read license for this Read/Fit result',
    serverCustody: false,
    btcFee: {
      payer: 'reader',
      network: btcNetwork,
      satsPaid: btcFeeSats,
      finalityState: fields.btcFeeFinalityState || 'not_prepared',
      serverCustody: false,
    },
  };
}

async function upsertAndReadLedgerRow(table, conflictColumn, conflictValue, row) {
  const { error: upsertError } = await supabase
    .from(table)
    .upsert(row, { onConflict: conflictColumn });
  if (upsertError) {
    throw new Error(table + ' upsert failed: ' + upsertError.message);
  }
  const { data, error: readError } = await supabase
    .from(table)
    .select('*')
    .eq(conflictColumn, conflictValue)
    .maybeSingle();
  if (readError) {
    throw new Error(table + ' readback failed: ' + readError.message);
  }
  if (!data) {
    throw new Error(table + ' readback missing after upsert.');
  }
  return data;
}

async function ledgerRowExists(table, column, value) {
  const { data, error: readError } = await supabase
    .from(table)
    .select(column)
    .eq(column, value)
    .maybeSingle();
  if (readError) {
    throw new Error(table + ' readback failed: ' + readError.message);
  }
  return Boolean(data);
}

async function readLedgerSettlementBack(ids) {
  const checks = {
    semanticMeasurement: await ledgerRowExists('btd_semantic_volume_measurements', 'measurement_id', ids.measurementId),
    measureMintReceipt: await ledgerRowExists('btd_measure_mint_receipts', 'receipt_id', ids.measureMintReceiptId),
    assetPackRange: await ledgerRowExists('btd_asset_pack_ranges', 'asset_pack_id', ids.assetPackId),
    btdCell: await ledgerRowExists('btd_cells', 'token_id', ids.rangeStart),
    ownershipEvent: await ledgerRowExists('btd_ownership_events', 'ownership_event_id', ids.ownershipEventId),
    readLicense: await ledgerRowExists('btd_read_licenses', 'license_id', ids.readLicenseId),
    mintReceipt: await ledgerRowExists('btd_mint_receipts', 'receipt_id', ids.btdMintReceiptId),
    btcFeeTransaction: await ledgerRowExists('btc_fee_transactions', 'receipt_id', ids.btcFeeReceiptId),
    ledgerAnchor: await ledgerRowExists('btd_asset_pack_ledger_anchors', 'anchor_id', ids.ledgerAnchorId),
    cryptoTelemetry: false,
  };

  const { count: journalCount, error: journalError } = await supabase
    .from('btd_terminal_journal_entries')
    .select('journal_entry_id', { count: 'exact', head: true })
    .in('journal_entry_id', ids.journalEntryIds);
  if (journalError) throw new Error('btd_terminal_journal_entries readback failed: ' + journalError.message);
  checks.terminalJournal = journalCount === ids.journalEntryIds.length;

  const { data: telemetry, error: telemetryError } = await supabase
    .from('btd_crypto_telemetry_events')
    .select('event')
    .eq('subject_id', ids.assetPackId)
    .eq('event', 'asset_pack_pipeline_settled')
    .maybeSingle();
  if (telemetryError) throw new Error('btd_crypto_telemetry_events readback failed: ' + telemetryError.message);
  checks.cryptoTelemetry = Boolean(telemetry);

  return checks;
}

async function settleAssetPackLedger(pipelineResultState) {
  if (pipelineResultState !== 'worthy_fit') {
    return {
      status: 'not_applicable',
      settlementAdmissible: false,
      reason: 'Ledger settlement skipped because the fit result was not worthy_fit.',
      ownershipBoundary: settlementOwnershipBoundary({
        status: 'not_applicable',
        btcFeeFinalityState: 'not_applicable',
      }),
    };
  }
  if (manifest?.sourceOverlay) {
    return {
      status: 'blocked',
      settlementAdmissible: false,
      reason: 'Source overlay QA evidence cannot mint BTD, claim BTC fee settlement, or anchor finality.',
      sourceOverlay: manifest.sourceOverlay,
      ownershipBoundary: settlementOwnershipBoundary({
        status: 'blocked',
        btcFeeFinalityState: 'not_prepared',
      }),
    };
  }
  if (!supabase) {
    return {
      status: 'blocked',
      settlementAdmissible: false,
      reason: 'Ledger settlement requires Supabase admin read/write access for row writeback and readback.',
      ownershipBoundary: settlementOwnershipBoundary({
        status: 'blocked',
        btcFeeFinalityState: 'not_prepared',
      }),
    };
  }

  const artifacts =
    output?.assetPackSynthesisArtifacts ||
    output?.writtenAssets ||
    output?.assetPack ||
    output?.summary;
  if (!artifacts) {
    return {
      status: 'blocked',
      settlementAdmissible: false,
      reason: 'Ledger settlement requires synthesized AssetPack artifacts in pipeline output.',
      ownershipBoundary: settlementOwnershipBoundary({
        status: 'blocked',
        btcFeeFinalityState: 'not_prepared',
      }),
    };
  }

  const assetPackId = 'asset-pack-' + runId;
  const measurementId = 'semantic-measurement-' + runId;
  const measureMintReceiptId = 'measure-mint-receipt-' + runId;
  const btdMintReceiptId = 'btd-mint-receipt-' + runId;
  const ledgerAnchorId = 'ledger-anchor-' + runId;
  const btcFeeReceiptId = 'btc-fee-' + runId;
  const ownershipEventId = 'ownership-mint-' + runId;
  const readLicenseId = 'read-license-' + runId;
  const journalEntryIds = [
    'journal-mint-' + runId,
    'journal-btc-fee-' + runId,
    'journal-anchor-' + runId,
    'journal-settlement-' + runId,
  ];
  const depositorWalletId = ledgerWallet('depositor-wallet', process.env.BITCODE_PIPELINE_DEPOSITOR_WALLET_ID, manifest.deposit?.id || assetPackId);
  const readerWalletId = ledgerWallet('reader-wallet', process.env.BITCODE_PIPELINE_READER_WALLET_ID, userId || runId);
  const requestedBtcNetwork = String(process.env.BITCODE_PIPELINE_BTC_NETWORK || 'testnet').trim();
  const btcNetwork = normalizeBtcLedgerNetwork(requestedBtcNetwork);
  const btcFeeSats = positiveIntegerEnv('BITCODE_PIPELINE_BTC_FEE_SATS', 546);

  try {
    const { data: existingRange, error: existingRangeError } = await supabase
      .from('btd_asset_pack_ranges')
      .select('asset_pack_id, range_start, range_end_exclusive, token_count')
      .eq('asset_pack_id', assetPackId)
      .maybeSingle();
    if (existingRangeError) throw new Error('btd_asset_pack_ranges idempotency read failed: ' + existingRangeError.message);
    if (existingRange) {
      const ids = {
        assetPackId,
        measurementId,
        measureMintReceiptId,
        btdMintReceiptId,
        ledgerAnchorId,
        btcFeeReceiptId,
        ownershipEventId,
        readLicenseId,
        journalEntryIds,
        rangeStart: existingRange.range_start,
      };
      const readback = await readLedgerSettlementBack(ids);
      const missing = Object.entries(readback).filter(([, present]) => !present).map(([key]) => key);
      return {
        status: missing.length ? 'blocked' : 'settled',
        settlementAdmissible: missing.length === 0,
        reason: missing.length
          ? 'Existing ledger settlement is missing readback rows: ' + missing.join(', ')
          : 'Existing ledger settlement rows were read back successfully.',
        assetPackId,
        btdRange: {
          start: existingRange.range_start,
          endExclusive: existingRange.range_end_exclusive,
          tokenCount: existingRange.token_count,
        },
        ledgerAnchorId,
        btcFeeReceiptId,
        depositorWalletId,
        readerWalletId,
        ownershipBoundary: settlementOwnershipBoundary({
          status: missing.length ? 'blocked' : 'settled',
          depositorWalletId,
          readerWalletId,
          btcFeeSats,
          btcNetwork,
          btcFeeFinalityState: missing.length ? 'readback_missing' : 'prepared',
        }),
        readback,
      };
    }

    const { data: supply, error: supplyError } = await supabase
      .from('btd_supply_state')
      .select('*')
      .eq('id', 'global')
      .maybeSingle();
    if (supplyError) throw new Error('btd_supply_state read failed: ' + supplyError.message);
    if (!supply) throw new Error('btd_supply_state global row is missing.');

    const tokenCount = 1;
    const rangeStart = Number(supply.total_minted || 0);
    const rangeEndExclusive = rangeStart + tokenCount;
    const maxSupply = Number(supply.max_supply || 21000000);
    if (rangeEndExclusive > maxSupply) {
      throw new Error('BTD supply is exhausted; AssetPack settlement must return blocked readiness.');
    }

    const normalizedBitcodeVolume = positiveIntegerEnv('BITCODE_PIPELINE_BTD_VOLUME', 1000);
    const cumulativeMeasurementBefore = Number(supply.cumulative_admitted_measurement || 0);
    const cumulativeMeasurementAfter = cumulativeMeasurementBefore + normalizedBitcodeVolume;
    const residualMintCreditBefore = Number(supply.residual_mint_credit || 0);
    const residualMintCreditAfter = residualMintCreditBefore;
    const exchangeSequence = Date.now();
    const issuedAt = new Date().toISOString();
    const sourceManifestRoot = manifestRoot || rootOf(manifest);
    const synthesisRoot = rootOf({ assetPackId, artifacts, output });
    const fitReceiptRoot = rootOf({ fitResult: output?.fitResult || output?.fit || null, depositorySearch: output?.depositorySearch || null });
    const measurementReceiptRoot = rootOf({ measurementId, normalizedBitcodeVolume, synthesisRoot });
    const proofRoot = rootOf({ sourceManifestRoot, fitReceiptRoot, synthesisRoot, runId });
    const dedupeReceiptRoot = rootOf({ sourceManifestRoot, readId: manifest.read?.id, depositId: manifest.deposit?.id });
    const settlementJournalRoot = rootOf({ assetPackId, readId: manifest.read?.id, runId, exchangeSequence });
    const exchangeReceiptRoot = rootOf({ assetPackId, rangeStart, rangeEndExclusive, exchangeSequence });
    const accessPolicyId = 'read-fit-access-' + runId;
    const accessPolicyHash = rootOf({
      accessPolicyId,
      readId: manifest.read?.id,
      sourceRevision: manifest.sourceRevision,
      userId,
    });
    const walletSessionId = ledgerWallet('reader-session', process.env.BITCODE_PIPELINE_WALLET_SESSION_ID, runId);

    const measurementReceipt = {
      schema: 'bitcode.btd.semantic-volume-measurement',
      runId,
      assetPackId,
      readId: manifest.read?.id || null,
      sourceRevision: manifest.sourceRevision || null,
      synthesisRoot,
    };
    await upsertAndReadLedgerRow('btd_semantic_volume_measurements', 'measurement_id', measurementId, {
      measurement_id: measurementId,
      asset_pack_id: assetPackId,
      normalized_bitcode_volume: normalizedBitcodeVolume,
      token_count: tokenCount,
      quantization: 1000,
      included_units: [{
        unit_kind: 'asset-pack',
        run_id: runId,
        read_id: manifest.read?.id || null,
        selected_candidate_asset_ids: output?.depositorySearch?.selectedCandidateAssetIds || [],
      }],
      excluded_units: [],
      issued_at: issuedAt,
    });

    await upsertAndReadLedgerRow('btd_measure_mint_receipts', 'receipt_id', measureMintReceiptId, {
      receipt_id: measureMintReceiptId,
      asset_pack_id: assetPackId,
      normalized_bitcode_volume: normalizedBitcodeVolume,
      cumulative_measurement_before: cumulativeMeasurementBefore,
      cumulative_measurement_after: cumulativeMeasurementAfter,
      target_minted_before: rangeStart,
      target_minted_after: rangeEndExclusive,
      residual_mint_credit_before: residualMintCreditBefore,
      residual_mint_credit_after: residualMintCreditAfter,
      token_count: tokenCount,
      range_start: rangeStart,
      range_end_exclusive: rangeEndExclusive,
      zero_cell_reason: null,
      total_minted_before: rangeStart,
      total_minted_after: rangeEndExclusive,
      max_supply: maxSupply,
      proof_root: proofRoot,
      settlement_journal_root: settlementJournalRoot,
      access_policy_hash: accessPolicyHash,
      exchange_sequence: exchangeSequence,
      receipt: {
        ...measurementReceipt,
        measurement_receipt_root: measurementReceiptRoot,
        proof_root: proofRoot,
        settlement_journal_root: settlementJournalRoot,
      },
      issued_at: issuedAt,
    });

    await upsertAndReadLedgerRow('btd_asset_pack_ranges', 'asset_pack_id', assetPackId, {
      asset_pack_id: assetPackId,
      range_start: rangeStart,
      range_end_exclusive: rangeEndExclusive,
      token_count: tokenCount,
      normalized_bitcode_volume: normalizedBitcodeVolume,
      read_id: manifest.read?.id || runId,
      source_manifest_root: sourceManifestRoot,
      measurement_receipt_root: measurementReceiptRoot,
      fit_receipt_root: fitReceiptRoot,
      proof_root: proofRoot,
      dedupe_receipt_root: dedupeReceiptRoot,
      settlement_journal_root: settlementJournalRoot,
      exchange_receipt_root: exchangeReceiptRoot,
      access_policy_id: accessPolicyId,
      access_policy_hash: accessPolicyHash,
      minted_at_exchange_sequence: exchangeSequence,
      issued_at: issuedAt,
    });

    await upsertAndReadLedgerRow('btd_cells', 'token_id', rangeStart, {
      token_id: rangeStart,
      asset_pack_id: assetPackId,
      source_measurement_id: measurementId,
      source_manifest_root: sourceManifestRoot,
      measurement_receipt_root: measurementReceiptRoot,
      proof_root: proofRoot,
      exchange_receipt_root: exchangeReceiptRoot,
      access_policy_id: accessPolicyId,
      access_policy_hash: accessPolicyHash,
    });

    await upsertAndReadLedgerRow('btd_mint_receipts', 'receipt_id', btdMintReceiptId, {
      receipt_id: btdMintReceiptId,
      asset_pack_id: assetPackId,
      receipt: {
        schema: 'bitcode.btd.mint-receipt',
        runId,
        rangeStart,
        rangeEndExclusive,
        tokenCount,
        proofRoot,
        measurementReceiptRoot,
      },
      issued_at: issuedAt,
    });

    await upsertAndReadLedgerRow('btc_fee_transactions', 'receipt_id', btcFeeReceiptId, {
      receipt_id: btcFeeReceiptId,
      fee_purpose: 'asset_pack_read_fit_settlement',
      payer_wallet_id: readerWalletId,
      wallet_session_id: walletSessionId,
      network: btcNetwork,
      wallet_authorization_proof: {
        schema: 'bitcode.wallet.authorization-proof',
        mode: 'staging-testnet-reader-fee-attestation',
        actor: 'reader',
        userId,
        walletId: readerWalletId,
        requestedNetwork: requestedBtcNetwork,
        ledgerNetwork: btcNetwork,
        serverCustody: false,
      },
      txid: null,
      vout: null,
      psbt: null,
      sats_paid: btcFeeSats,
      sats_per_vbyte: null,
      exchange_sequence: exchangeSequence,
      terminal_journal_root: settlementJournalRoot,
      related_asset_pack_id: assetPackId,
      related_order_id: null,
      finality_state: 'prepared',
      confirmations: 0,
      fee_asset: 'BTC',
      server_custody: false,
      receipt: {
        schema: 'bitcode.btc.fee-transaction',
        feePurpose: 'asset_pack_read_fit_settlement',
        payer: 'reader',
        payerWalletId: readerWalletId,
        depositorWalletId,
        requestedNetwork: requestedBtcNetwork,
        ledgerNetwork: btcNetwork,
        serverCustody: false,
        finalityState: 'prepared',
      },
      issued_at: issuedAt,
    });

    await upsertAndReadLedgerRow('btd_asset_pack_ledger_anchors', 'anchor_id', ledgerAnchorId, {
      anchor_id: ledgerAnchorId,
      asset_pack_id: assetPackId,
      chain: 'bitcode-internal-ledger',
      network: btcNetwork,
      txid_or_hash: settlementJournalRoot,
      output_index: null,
      contract_address: null,
      token_id: String(rangeStart),
      commitment_method: 'internal_journal',
      commitment_root: settlementJournalRoot,
      source_manifest_root: sourceManifestRoot,
      proof_root: proofRoot,
      access_policy_hash: accessPolicyHash,
      btd_range_start: rangeStart,
      btd_range_end_exclusive: rangeEndExclusive,
      finality_state: 'confirmed',
      confirmations: 1,
      receipt: {
        schema: 'bitcode.btd.asset-pack-ledger-anchor',
        runId,
        assetPackId,
        requestedNetwork: requestedBtcNetwork,
        ledgerNetwork: btcNetwork,
        sourceManifestRoot,
        settlementJournalRoot,
      },
      issued_at: issuedAt,
    });

    await upsertAndReadLedgerRow('btd_ownership_events', 'ownership_event_id', ownershipEventId, {
      ownership_event_id: ownershipEventId,
      asset_pack_id: assetPackId,
      range_start: rangeStart,
      range_end_exclusive: rangeEndExclusive,
      from_wallet_id: null,
      to_wallet_id: depositorWalletId,
      event_kind: 'mint_allocation',
      source_receipt_id: measureMintReceiptId,
      access_policy_hash: accessPolicyHash,
      ledger_anchor_id: ledgerAnchorId,
      exchange_sequence: exchangeSequence,
      receipt: {
        schema: 'bitcode.btd.ownership-event',
        boundary: 'depositor-owns-minted-btd-reader-pays-read-fee',
        depositorWalletId,
        readerWalletId,
      },
      issued_at: issuedAt,
    });

    await upsertAndReadLedgerRow('btd_read_licenses', 'license_id', readLicenseId, {
      license_id: readLicenseId,
      asset_pack_id: assetPackId,
      wallet_id: readerWalletId,
      access_policy_hash: accessPolicyHash,
      valid_from: issuedAt,
      expires_at: null,
      source_receipt_id: measureMintReceiptId,
      payment_id: btcFeeReceiptId,
      receipt: {
        schema: 'bitcode.btd.read-license',
        actor: 'reader',
        readerWalletId,
        assetPackId,
        btcFeeReceiptId,
      },
      issued_at: issuedAt,
    });

    const journalRows = [
      {
        journal_entry_id: journalEntryIds[0],
        transaction_kind: 'asset_pack_mint',
        actor_id: depositorWalletId,
        pre_state_root: rootOf({ before: 'asset_pack_mint', totalMinted: rangeStart }),
        post_state_root: rootOf({ after: 'asset_pack_mint', totalMinted: rangeEndExclusive }),
        receipt_roots: [measurementReceiptRoot, proofRoot, exchangeReceiptRoot],
        ledger_anchor_ids: [ledgerAnchorId],
        exchange_sequence: exchangeSequence,
        issued_at: issuedAt,
      },
      {
        journal_entry_id: journalEntryIds[1],
        transaction_kind: 'btc_fee_payment',
        actor_id: readerWalletId,
        pre_state_root: rootOf({ before: 'btc_fee_payment', assetPackId }),
        post_state_root: rootOf({ after: 'btc_fee_payment', assetPackId, btcFeeReceiptId }),
        receipt_roots: [rootOf({ btcFeeReceiptId, readerWalletId, btcFeeSats })],
        ledger_anchor_ids: [],
        exchange_sequence: exchangeSequence + 1,
        issued_at: issuedAt,
      },
      {
        journal_entry_id: journalEntryIds[2],
        transaction_kind: 'asset_pack_anchor',
        actor_id: depositorWalletId,
        pre_state_root: rootOf({ before: 'asset_pack_anchor', assetPackId }),
        post_state_root: rootOf({ after: 'asset_pack_anchor', assetPackId, ledgerAnchorId }),
        receipt_roots: [settlementJournalRoot, proofRoot],
        ledger_anchor_ids: [ledgerAnchorId],
        exchange_sequence: exchangeSequence + 2,
        issued_at: issuedAt,
      },
      {
        journal_entry_id: journalEntryIds[3],
        transaction_kind: 'settlement_finalization',
        actor_id: readerWalletId,
        pre_state_root: rootOf({ before: 'settlement_finalization', assetPackId }),
        post_state_root: rootOf({ after: 'settlement_finalization', assetPackId, readLicenseId }),
        receipt_roots: [measurementReceiptRoot, fitReceiptRoot, proofRoot, rootOf({ readLicenseId, btcFeeReceiptId })],
        ledger_anchor_ids: [ledgerAnchorId],
        exchange_sequence: exchangeSequence + 3,
        issued_at: issuedAt,
      },
    ];
    for (const row of journalRows) {
      await upsertAndReadLedgerRow('btd_terminal_journal_entries', 'journal_entry_id', row.journal_entry_id, row);
    }

    await supabase.from('btd_crypto_telemetry_events').insert({
      event: 'asset_pack_pipeline_settled',
      severity: 'info',
      subject_id: assetPackId,
      receipt_root: proofRoot,
      ledger_anchor_id: ledgerAnchorId,
      issued_at: issuedAt,
    });

    const { data: supplyUpdate, error: supplyUpdateError } = await supabase
      .from('btd_supply_state')
      .update({
        total_minted: rangeEndExclusive,
        next_token_id: rangeEndExclusive,
        cumulative_admitted_measurement: cumulativeMeasurementAfter,
        residual_mint_credit: residualMintCreditAfter,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 'global')
      .eq('total_minted', rangeStart)
      .select('id,total_minted')
      .maybeSingle();
    if (supplyUpdateError) throw new Error('btd_supply_state update failed: ' + supplyUpdateError.message);
    if (!supplyUpdate || Number(supplyUpdate.total_minted) !== rangeEndExclusive) {
      throw new Error('btd_supply_state update readback missing after settlement write.');
    }

    const ids = {
      assetPackId,
      measurementId,
      measureMintReceiptId,
      btdMintReceiptId,
      ledgerAnchorId,
      btcFeeReceiptId,
      ownershipEventId,
      readLicenseId,
      journalEntryIds,
      rangeStart,
    };
    const readback = await readLedgerSettlementBack(ids);
    const missing = Object.entries(readback).filter(([, present]) => !present).map(([key]) => key);
    if (missing.length) {
      throw new Error('Ledger settlement readback missing rows: ' + missing.join(', '));
    }

    return {
      status: 'settled',
      settlementAdmissible: true,
      reason: 'BTD range, reader BTC fee, internal ledger anchor, journal, ownership, license, and telemetry rows were written and read back.',
      assetPackId,
      btdRange: {
        start: rangeStart,
        endExclusive: rangeEndExclusive,
        tokenCount,
      },
      ledgerAnchorId,
      btcFeeReceiptId,
      depositorWalletId,
      readerWalletId,
      btcFee: {
        network: btcNetwork,
        requestedNetwork: requestedBtcNetwork,
        satsPaid: btcFeeSats,
        finalityState: 'prepared',
        serverCustody: false,
      },
      ownershipBoundary: settlementOwnershipBoundary({
        status: 'settled',
        depositorWalletId,
        readerWalletId,
        btcFeeSats,
        btcNetwork,
        btcFeeFinalityState: 'prepared',
      }),
      readback,
    };
  } catch (settlementError) {
    const message = settlementError?.message || String(settlementError);
    record({ type: 'ledger-settlement-blocked', stage: 'telemetry-readback', error: message });
    return {
      status: 'blocked',
      settlementAdmissible: false,
      reason: message,
      ownershipBoundary: settlementOwnershipBoundary({
        status: 'blocked',
        btcFeeFinalityState: 'error',
      }),
    };
  }
}

async function main() {
await mkdir(artifactDir, { recursive: true });
startHeartbeat();
process.once('SIGTERM', () => {
  error = { name: 'SIGTERM', message: 'AssetPack pipeline harness received SIGTERM.', stack: null };
  resultState = 'blocked_readiness';
  record({ type: 'pipeline-blocked', stage: 'validation', resultState, error });
  void writeCheckpoint('signal:SIGTERM').finally(() => process.exit(1));
});
process.once('SIGINT', () => {
  error = { name: 'SIGINT', message: 'AssetPack pipeline harness received SIGINT.', stack: null };
  resultState = 'blocked_readiness';
  record({ type: 'pipeline-blocked', stage: 'validation', resultState, error });
  void writeCheckpoint('signal:SIGINT').finally(() => process.exit(1));
});

try {
  manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  manifestRoot = createHash('sha256').update(JSON.stringify(manifest)).digest('hex');
  userId = process.env.BITCODE_PIPELINE_USER_ID || manifest.deposit?.userId || DEFAULT_USER_ID;
  const [{ assetPackPipeline, acceptReadNeed, isAcceptedReadNeed, synthesizeReadNeedForPipelineInput }, { enablePipelineStreaming, factoryPipelineExecution }] = await Promise.all([
    import('../../packages/pipelines/asset-pack/src/index'),
    import('../../packages/pipelines-generics/src/index'),
  ]);
  execution = factoryPipelineExecution('asset_pack', undefined, {
    pipelineName: 'asset_pack',
    family: 'asset_pack',
    posture: 'live',
    admittedSurface: 'terminal_read_fit',
  });

  execution.store('harness', 'manifestRoot', manifestRoot);
  execution.store('harness', 'sourceRevision', manifest.sourceRevision);
  execution.store('harness', 'runId', runId);
  execution.store('harness', 'userId', userId);
  execution.store('pipeline', 'userId', userId);
  execution.store('read', 'request', manifest.read);
  execution.store('deposit', 'reference', manifest.deposit);

  const databaseStreamingRequested = process.env.BITCODE_PIPELINE_STREAM_TO_DATABASE === '1';
  if (databaseStreamingRequested) {
    const { supabaseAdmin } = await import('../../packages/supabase/src/index');
    supabase = supabaseAdmin;
    userId = await resolvePipelineUserId();
    execution.store('harness', 'userId', userId);
    execution.store('pipeline', 'userId', userId);
    pipelineRunId = await insertPipelineRun();
    record({ type: 'database-streaming-enabled', stage: 'telemetry-readback' });
  }
  const pipelineStreamer = enablePipelineStreaming(execution, {
    runId,
    userId,
    pipelineRunId,
    supabase: supabase || undefined,
    streamToDatabase: databaseStreamingRequested && Boolean(supabase),
    structuredToDatabase: databaseStreamingRequested && process.env.BITCODE_PIPELINE_STRUCTURED_DB === '1',
  });
  pipelineStreamer.subscribe((event) => {
    record(summarizeStreamEvent(event));
  });
  if (!databaseStreamingRequested) {
    record({ type: 'artifact-streaming-enabled', stage: 'telemetry-readback' });
  }

  const readNeed = isAcceptedReadNeed(manifest.readNeed)
    ? manifest.readNeed
    : acceptReadNeed(synthesizeReadNeedForPipelineInput({
        read: manifest.read,
        readRequest: manifest.read,
        sourceRevision: manifest.sourceRevision,
        repository: {
          fullName: manifest.sourceRevision.repositoryFullName,
          branch: manifest.sourceRevision.branch,
          commit: manifest.sourceRevision.commit,
        },
      }));
  execution.store('read/need', 'accepted', readNeed);
  execution.store('read/need', 'needId', readNeed.needId);
  execution.store('read/need', 'measurementRoot', readNeed.measurementRoot);
  execution.store('read/need', 'reviewState', readNeed.reviewState);

  const input = {
    read: manifest.read.prompt,
    definitionOfRead: manifest.read.prompt,
    readNeed,
    acceptedReadNeed: readNeed,
    requireAcceptedReadNeed: manifest.requireAcceptedReadNeed !== false,
    repository: {
      fullName: manifest.sourceRevision.repositoryFullName,
      branch: manifest.sourceRevision.branch,
      commit: manifest.sourceRevision.commit,
    },
    sourceRevision: manifest.sourceRevision,
    deposit: manifest.deposit,
    depositoryAssets: [buildManifestDepositoryAsset(manifest)],
    writtenAssetType: 'asset_pack',
    deliveryMechanismTemplate: 'pull-request',
    harness: manifest,
  };

  record({ type: 'pipeline-start', stage: 'read-comprehension', sourceRevision: manifest.sourceRevision });
  if (manifest.sourceOverlay) {
    record({
      type: 'source-overlay-applied',
      stage: 'validation',
      sourceOverlay: manifest.sourceOverlay,
    });
  }
  const rawOutput = await withHarnessTimeout(assetPackPipeline(input, execution), harnessMaxRuntimeMs);
  const postprocessedOutput = findExecutionValueDown(execution, 'postprocessed', 'result');
  output = postprocessedOutput && typeof postprocessedOutput === 'object' && !Array.isArray(postprocessedOutput)
    ? {
        ...(rawOutput && typeof rawOutput === 'object' && !Array.isArray(rawOutput) ? rawOutput : { rawPipelineOutput: rawOutput }),
        ...postprocessedOutput,
      }
    : rawOutput;
  await pipelineStreamer.flushStructuredWrites?.();
  const pipelineResultState = normalizeResultState(
    output?.resultState || output?.fitResult?.resultState || output?.fit?.resultState
  );
  const deliveryRequired = requiresPullRequestDelivery(output, input);
  const pullRequestUrl = findPullRequestUrl(output);
  const deliveryAdmissible = !deliveryRequired || Boolean(pullRequestUrl);
  const settlementResultState =
    pipelineResultState === 'worthy_fit' && !deliveryAdmissible
      ? 'blocked_readiness'
      : pipelineResultState;
  resultState = manifest.sourceOverlay ? 'blocked_readiness' : settlementResultState;
  const fitResult = output?.fitResult || output?.fit || null;
  const depositorySearch = output?.depositorySearch || null;
  const pipelineResultReasons = Array.isArray(fitResult?.resultReasons)
    ? fitResult.resultReasons
    : Array.isArray(depositorySearch?.resultReasons)
      ? depositorySearch.resultReasons
      : [];
  record({ type: 'pipeline-complete', stage: 'finish' });
  stopHeartbeat();
  await checkpointInFlight.catch(() => {});

  const resultReasons = [
    'AssetPack pipeline entrypoint returned without throwing.',
    manifest.sourceOverlay
      ? 'Source overlay patch was applied for QA; this run cannot serve as source-revision settlement evidence.'
      : null,
    pipelineResultState === 'blocked_readiness'
      ? 'Pipeline output did not include an admissible result state; review remains blocked.'
      : pipelineResultState === 'worthy_fit' && !deliveryAdmissible
        ? 'Pipeline found a worthy fit, but required pull-request delivery is missing; settlement remains blocked.'
      : resultState === 'blocked_readiness'
        ? 'Pipeline produced ' + pipelineResultState + ' evidence; final settlement remains blocked by harness readiness constraints.'
      : 'Review SQL must still verify durable telemetry, proof, and ledger readback before settlement.',
    ...pipelineResultReasons,
  ].filter(Boolean);
  record({
    type: 'delivery-readback',
    stage: 'finish',
    required: deliveryRequired,
    admissible: deliveryAdmissible,
    pullRequestUrl: pullRequestUrl || null,
  });

  const ledgerSettlement = await settleAssetPackLedger(settlementResultState);
  output = {
    ...(output || {}),
    ledgerSettlement,
  };
  resultReasons.push(ledgerSettlement.reason);
  if (pipelineResultState === 'worthy_fit' && ledgerSettlement.settlementAdmissible !== true) {
    resultState = 'blocked_readiness';
    resultReasons.push('Settlement remains blocked until ledger writeback and readback are complete.');
  }
  record({
    type: 'ledger-settlement-readback',
    stage: 'telemetry-readback',
    status: ledgerSettlement.status,
    settlementAdmissible: ledgerSettlement.settlementAdmissible,
    assetPackId: ledgerSettlement.assetPackId || null,
  });

  const evidence = {
    schema: 'bitcode.pipeline-harness.evidence',
    harnessMode: manifest.harnessMode,
    resultState,
    pipelineResultState,
    resultReasons,
    runId,
    userId,
    manifestRoot,
    manifest,
    output,
    fitResult,
    depositorySearch,
    assetPackSynthesisArtifacts: output?.assetPackSynthesisArtifacts || null,
    writtenAssets: output?.writtenAssets || null,
    deliveryMechanism: output?.deliveryMechanism || null,
    shippables: output?.shippables || null,
    ledgerSettlement,
    execution: summarizeExecution(execution),
    events,
    startedAt,
    completedAt: new Date().toISOString(),
  };

  await updatePipelineRun('completed', {
    output,
    resultState,
    resultReasons,
  });
  await writeFile(\`\${artifactDir}/evidence.json\`, JSON.stringify(evidence, null, 2));
} catch (caught) {
  error = {
    name: caught?.name || 'Error',
    message: caught?.message || String(caught),
    stack: caught?.stack || null,
  };
  if (error.name === 'PipelineHarnessTimeoutError') {
    forceExitAfterFinally = true;
  }
  record({
    type: 'pipeline-blocked',
    stage: 'validation',
    resultState: 'blocked_readiness',
    error: { name: error.name, message: error.message },
  });
  stopHeartbeat();
  await checkpointInFlight.catch(() => {});

  const evidence = {
    schema: 'bitcode.pipeline-harness.evidence',
    harnessMode: manifest?.harnessMode || 'asset_pack_pipeline',
    resultState: 'blocked_readiness',
    resultReasons: [
      'AssetPack pipeline execution did not produce admissible result evidence.',
      error.message,
    ],
    runId,
    userId,
    manifestRoot,
    manifest,
    output,
    error,
    execution: execution ? summarizeExecution(execution) : null,
    events,
    startedAt,
    completedAt: new Date().toISOString(),
  };

  await updatePipelineRun('failed', {
    output,
    error,
    resultState: 'blocked_readiness',
    resultReasons: evidence.resultReasons,
  });
  await writeFile(\`\${artifactDir}/evidence.json\`, JSON.stringify(evidence, null, 2));
  process.exitCode = 1;
} finally {
  stopHeartbeat();
  await checkpointInFlight.catch(() => {});
  await insertHarnessStreamLog(process.exitCode ? 'failed' : 'completed');
  await writeFile(\`\${artifactDir}/telemetry.jsonl\`, events.map((event) => JSON.stringify(event)).join('\\n') + '\\n');
  if (forceExitAfterFinally) {
    process.exit(1);
  }
}

}

main().catch((caught) => {
  process.stderr.write(\`\${caught?.message || String(caught)}\\n\`);
  process.exitCode = 1;
});
`;
}
