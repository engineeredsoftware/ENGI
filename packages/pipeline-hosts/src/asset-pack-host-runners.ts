/**
 * In-box host-smoke and live AssetPack pipeline runner source templates
 * embedded into the Vercel Sandbox host plan.
 */

import { BITCODE_PIPELINE_RESULT_STATES } from '@bitcode/host-generics';
import {
  EVIDENCE_PATH,
  HOST_RUN_DIRECTORY,
  MANIFEST_PATH,
  PIPELINE_EXIT_CODE_PATH,
  PIPELINE_STDERR_PATH,
  PIPELINE_STDOUT_PATH,
  TELEMETRY_PATH,
} from './asset-pack-host-constants';

export function createHostSmokeRunner(): string {
  return `import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { arch, platform, release } from 'node:os';

const manifestPath = process.env.BITCODE_PIPELINE_HOST_MANIFEST || '${MANIFEST_PATH}';
const artifactDir = process.env.BITCODE_PIPELINE_HOST_ARTIFACT_DIR || '${HOST_RUN_DIRECTORY}';
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const startedAt = new Date().toISOString();
const manifestRoot = createHash('sha256').update(JSON.stringify(manifest)).digest('hex');

await mkdir(artifactDir, { recursive: true });

const events = [
  {
    type: 'host-start',
    stage: 'telemetry-readback',
    hostMode: manifest.hostMode,
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
    type: 'host-complete',
    stage: 'telemetry-readback',
    completedAt: new Date().toISOString(),
  },
];

const evidence = {
  schema: 'bitcode.pipeline-host.evidence',
  hostMode: manifest.hostMode,
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

export function createLiveAssetPackPipelineRunner(): string {
  return `import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const monorepoRoot = (process.env.BITCODE_MONOREPO_ROOT || '/opt/bitcode').trim();
/** Absolute file URL into monorepo TypeScript sources (loaded via tsx/ts-node). */
function pkgImport(relPath) {
  return pathToFileURL(path.join(monorepoRoot, relPath)).href;
}

/**
 * Resolve monorepo modules across Pipeliner image layouts:
 * - current: packages/asset-packs-pipelines/syntheses/{domain,deposit,read}
 * - legacy (v48-ee433ddc era): synthesize-*-asset-packs-pipeline + monolithic domain
 * Prefer current paths; fall back so hot-uploaded runners still boot on older images.
 *
 * tsx dynamic import of CJS/TS packages often surfaces exports only on
 * default / module.exports — unwrap so destructuring factories works.
 */
function unwrapModuleNamespace(mod) {
  if (!mod || typeof mod !== 'object') return mod;
  const bags = [];
  if (mod.default && typeof mod.default === 'object') bags.push(mod.default);
  if (mod['module.exports'] && typeof mod['module.exports'] === 'object') {
    bags.push(mod['module.exports']);
  }
  if (bags.length === 0) return mod;
  return Object.assign({}, ...bags, mod);
}

async function importMonorepoModule(label, candidates) {
  const tried = [];
  let lastError = null;
  for (const rel of candidates) {
    const abs = path.join(monorepoRoot, rel);
    tried.push(abs);
    try {
      await access(abs, fsConstants.R_OK);
      const raw = await import(pathToFileURL(abs).href);
      return unwrapModuleNamespace(raw);
    } catch (err) {
      lastError = err;
    }
  }
  const detail = lastError instanceof Error ? lastError.message : String(lastError || 'missing');
  throw new Error(
    'Cannot resolve ' +
      label +
      ' under ' +
      monorepoRoot +
      '. Tried: ' +
      tried.join(' | ') +
      '. Last error: ' +
      detail +
      '. Pipeliner image package layout is outdated relative to the host runner — rebuild/push Pipeliner and set BITCODE_PIPELINE_SANDBOX_IMAGE to the new tag (syntheses/ layout).',
  );
}

const manifestPath = process.env.BITCODE_PIPELINE_HOST_MANIFEST || '${MANIFEST_PATH}';
const artifactDir = process.env.BITCODE_PIPELINE_HOST_ARTIFACT_DIR || '${HOST_RUN_DIRECTORY}';
const runId = process.env.BITCODE_PIPELINE_RUN_ID || randomUUID();
const DEFAULT_USER_ID = '00000000-0000-4000-8000-000000000000';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const startedAt = new Date().toISOString();
const hostMaxRuntimeMs = Number(process.env.BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS || 240000);
const checkpointIntervalMs = Number(process.env.BITCODE_PIPELINE_HOST_CHECKPOINT_INTERVAL_MS || 2000);
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
let readingPipelineObservabilityInventory = null;
let resolveReadingPipelineTelemetryProjectionFn = null;
let summarizeReadingPipelineObservabilityCoverageFn = null;
let buildBtdAssetPackMintReceiptFn = null;
let buildBtdReadReceiptFn = null;
let buildBtdRightsTransferReceiptFn = null;

// Injected from @bitcode/host-generics — single vocabulary, no dual-read aliases.
const PIPELINE_RESULT_STATES = ${JSON.stringify([...BITCODE_PIPELINE_RESULT_STATES])};

function normalizeResultState(candidate) {
  return PIPELINE_RESULT_STATES.includes(candidate) ? candidate : 'blocked_readiness';
}

function requiresPullRequestDelivery(output, input) {
  const template =
    output?.deliveryMechanismTemplate ||
    output?.assetPack?.deliveryMechanismTemplate ||
    input?.deliveryMechanismTemplate;
  return template === 'pull-request';
}

function findPullRequestUrl(output) {
  // Buyer-repo PR only from settle surfaces — not synthesis writtenAssets bags.
  return (
    output?.settleDelivery?.pullRequest?.url ||
    output?.settlePassThrough?.pullRequest?.url ||
    output?.shippable?.prUrl ||
    // deliveryMechanism.prUrl only after settle normalized it onto the result
    (output?.kind === 'settle_delivery' ? output?.deliveryMechanism?.prUrl : null) ||
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
  const llmAudit = event?.namespace === 'llm' && data
    ? {
        promptTemplate: summarizeInspectableValue(data.promptTemplate ?? null),
        interpolatedPrompt: summarizeInspectableValue(data.interpolatedPrompt ?? data.messages ?? null),
        reasoning: summarizeInspectableValue(data.reasoning ?? null),
        judgment: summarizeInspectableValue(data.judgment ?? null),
        rawModelResponse: summarizeInspectableValue(data.rawResponse ?? data.content ?? null),
        parsedTypedOutput: summarizeInspectableValue(data.parsedTypedOutput ?? data.parsed ?? null),
      }
    : null;
  const readingPipelineTelemetry = resolveReadingPipelineTelemetryProjectionFn
    ? resolveReadingPipelineTelemetryProjectionFn({
        ...event,
        data: {
          ...(data || {}),
          telemetryEvent: event,
        },
      })
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
    promptTemplatePresent: Boolean(data?.promptTemplate),
    interpolatedPromptPresent: Boolean(data?.interpolatedPrompt || data?.messages),
    reasoningPresent: Boolean(data?.reasoning),
    judgmentPresent: Boolean(data?.judgment),
    rawModelResponsePresent: Boolean(data?.rawResponse || data?.content),
    parsedTypedOutputPresent: Boolean(data?.parsedTypedOutput || data?.parsed),
    inferenceAudit: llmAudit,
    inspectable: summarizeLlmInspectable(event, event?.data ?? null),
    readingPipelineTelemetry,
    pipelineName: readingPipelineTelemetry?.pipelineName || null,
    phaseId: readingPipelineTelemetry?.phaseId || null,
    agentId: readingPipelineTelemetry?.agentId || null,
    ptrrStepId: readingPipelineTelemetry?.ptrrStepId || null,
    ptrrStepName: readingPipelineTelemetry?.ptrrStepName || null,
    thinkingsGenerationId: readingPipelineTelemetry?.thinkingsGenerationId || null,
    thinkingsFailsafe: readingPipelineTelemetry?.thinkingsFailsafe || null,
    promptTemplateId: readingPipelineTelemetry?.promptTemplateId || null,
    generationPromptIds: readingPipelineTelemetry?.generationPromptIds || null,
    toolId: readingPipelineTelemetry?.toolId || null,
    outputSchema: readingPipelineTelemetry?.outputSchema || null,
    returnType: readingPipelineTelemetry?.returnType || null,
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
      materializationRoot: \`.proofs/source-material/\${assetId}\`,
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

async function withHostTimeout(promise, maxRuntimeMs) {
  if (!Number.isFinite(maxRuntimeMs) || maxRuntimeMs <= 0) return promise;
  let timeout = null;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timeout = setTimeout(() => {
          const timeoutError = new Error(\`AssetPack pipeline exceeded host runtime budget of \${maxRuntimeMs}ms.\`);
          timeoutError.name = 'PipelineHostTimeoutError';
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
    schema: 'bitcode.pipeline-host.evidence',
    checkpoint: true,
    checkpointReason: reason,
    hostMode: manifest?.hostMode || 'asset_pack_pipeline',
    resultState,
    resultReasons: [
      'AssetPack pipeline host checkpoint; final admissibility requires completed finish evidence.',
      reason,
    ],
    runId,
    userId,
    manifestRoot,
    manifest,
    output,
    error,
    execution: execution ? summarizeExecution(execution) : null,
    readingPipelineObservabilityInventory,
    readingPipelineObservabilityCoverage: summarizeReadingPipelineObservabilityCoverageFn
      ? summarizeReadingPipelineObservabilityCoverageFn(events)
      : null,
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
        process.stderr.write(\`[bitcode-host-checkpoint-error] \${checkpointError?.message || String(checkpointError)}\\n\`);
      } catch {}
    });
}

function startHeartbeat() {
  if (heartbeatTimer) return;
  heartbeatTimer = setInterval(() => {
    const phase = execution?.get?.('phase', 'current') || 'initializing';
    const agent = execution?.get?.('agent', 'name') || 'none';
    process.stderr.write(\`[bitcode-host-heartbeat] runId=\${runId} phase=\${phase} agent=\${agent} events=\${events.length}\\n\`);
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
        bitcodePipelineHost: true,
        hostMode: manifest?.hostMode || 'asset_pack_pipeline',
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

  throw new Error('BITCODE_PIPELINE_USER_ID is required for database-backed pipeline host telemetry.');
}

async function insertHostStreamLog(status) {
  if (!supabase) return;
  try {
    await supabase.from('stream_logs').insert({
      stream_id: runId,
      user_id: userId,
      log_type: 'pipeline-host',
      log_data: {
        event: 'pipeline-host-complete',
        status,
        resultState,
        manifestRoot,
        hostMode: manifest?.hostMode || 'asset_pack_pipeline',
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

function hostFromUrl(value) {
  if (!value) return null;
  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

const READBACK_TABLE_NAMES = {
  semanticMeasurement: 'btd_semantic_volume_measurements',
  measureMintReceipt: 'btd_measure_mint_receipts',
  assetPackRange: 'btd_asset_pack_ranges',
  btdCell: 'btd_cells',
  ownershipEvent: 'btd_ownership_events',
  readLicense: 'btd_read_licenses',
  mintReceipt: 'btd_mint_receipts',
  btcFeeTransaction: 'btc_fee_transactions',
  ledgerAnchor: 'btd_asset_pack_ledger_anchors',
  terminalJournal: 'btd_terminal_journal_entries',
  cryptoTelemetry: 'btd_crypto_telemetry_events',
};

function buildProjectionTableReadbacks(readback) {
  return Object.entries(readback || {}).map(([key, present]) => ({
    table: READBACK_TABLE_NAMES[key] || key,
    expectedCount: 1,
    observedCount: present ? 1 : 0,
    synchronized: Boolean(present),
    proofRoot: rootOf({ table: READBACK_TABLE_NAMES[key] || key, present: Boolean(present) }),
  }));
}

function supabaseProjectRefFromHost(host) {
  if (!host) return 'staging-testnet-unresolved';
  const [projectRef] = String(host).split('.');
  return projectRef || 'staging-testnet-unresolved';
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
        ownershipEventId,
        readLicenseId,
        journalEntryIds,
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
    const sourceSafePreviewRoot = rootOf({
      assetPackId,
      sourceSafePreview: output?.sourceSafePreview || output?.assetPackDisclosureReview || null,
      protectedSourceVisible: false,
    });
    const acceptedNeedRoot =
      manifest.readNeed?.measurementRoot ||
      manifest.readNeed?.needRoot ||
      rootOf({ read: manifest.read, sourceRevision: manifest.sourceRevision });
    const settlementConservationRoot = rootOf({
      assetPackId,
      btcFeeSats,
      rangeStart,
      rangeEndExclusive,
      exchangeSequence,
    });
    const ledgerProjectionRoot = rootOf({
      assetPackId,
      ledgerAnchorId,
      btcFeeReceiptId,
      btdMintReceiptId,
      ownershipEventId,
      readLicenseId,
      journalEntryIds,
    });
    const assetPackMintReceipt = buildBtdAssetPackMintReceiptFn({
      mintReceipt: {
        kind: 'btd.asset_pack_mint',
        assetPackId,
        rangeStart,
        rangeEndExclusive,
        tokenCount,
        totalMintedBefore: rangeStart,
        totalMintedAfter: rangeEndExclusive,
        maxSupply,
        sourceManifestRoot,
        measurementReceiptRoot,
        fitReceiptRoot,
        proofRoot,
        settlementJournalRoot,
        dedupeReceiptRoot,
        exchangeReceiptRoot,
        accessPolicyId,
        accessPolicyHash,
        mintedAtExchangeSequence: BigInt(exchangeSequence),
        issuedAt,
      },
      readId: manifest.read?.id || runId,
      depositorWalletId,
      sourceSafePreviewRoot,
      findingFitsResultRoot: fitReceiptRoot,
      settlementConservationRoot,
      ledgerProjectionRoot,
      issuedAt,
    });
    const readReceipt = buildBtdReadReceiptFn({
      assetPackId,
      readId: manifest.read?.id || runId,
      readRequestId: manifest.read?.requestId || manifest.read?.id || runId,
      acceptedNeedRoot,
      findingFitsResultRoot: fitReceiptRoot,
      readerWalletId,
      depositorWalletId,
      rangeStart,
      rangeEndExclusive,
      tokenCount,
      sourceManifestRoot,
      sourceSafePreviewRoot,
      accessPolicyHash,
      disclosureState: 'source_safe_preview',
      readRightState: 'none',
      deliveryAdmissionState: 'blocked',
      ledgerProjectionRoot,
      protectedSourceVisible: false,
      issuedAt,
    });
    const rightsTransferReceipt = null;

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
      receipt: assetPackMintReceipt,
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
        receipt_roots: [measurementReceiptRoot, proofRoot, exchangeReceiptRoot, assetPackMintReceipt.receiptRoot],
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
        receipt_roots: [measurementReceiptRoot, fitReceiptRoot, proofRoot, readReceipt.receiptRoot, rootOf({ readLicenseId, btcFeeReceiptId })],
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
      ownershipEventId,
      readLicenseId,
      journalEntryIds,
      depositorWalletId,
      readerWalletId,
      assetPackMintReceipt,
      readReceipt,
      rightsTransferReceipt,
        btcFee: {
          network: btcNetwork,
          requestedNetwork: requestedBtcNetwork,
          satsPaid: btcFeeSats,
          finalityState: 'prepared',
          serverCustody: false,
        },
        proofRoots: {
          sourceManifestRoot,
          measurementReceiptRoot,
          fitReceiptRoot,
          proofRoot,
          settlementJournalRoot,
          accessPolicyHash,
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
  error = { name: 'SIGTERM', message: 'AssetPack pipeline host received SIGTERM.', stack: null };
  resultState = 'blocked_readiness';
  record({ type: 'pipeline-blocked', stage: 'validation', resultState, error });
  void writeCheckpoint('signal:SIGTERM').finally(() => process.exit(1));
});
process.once('SIGINT', () => {
  error = { name: 'SIGINT', message: 'AssetPack pipeline host received SIGINT.', stack: null };
  resultState = 'blocked_readiness';
  record({ type: 'pipeline-blocked', stage: 'validation', resultState, error });
  void writeCheckpoint('signal:SIGINT').finally(() => process.exit(1));
});

try {
  manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  manifestRoot = createHash('sha256').update(JSON.stringify(manifest)).digest('hex');
  userId = process.env.BITCODE_PIPELINE_USER_ID || manifest.deposit?.userId || DEFAULT_USER_ID;
  const synthesizeMode = manifest.synthesizeMode === 'deposit' ? 'deposit' : 'read';
  const isDepositMode = synthesizeMode === 'deposit';
  const [
    synthDomainExports,
    all3DomainExports,
    depositPipelineExports,
    readPipelineExports,
    pipelinesGenericsExports,
    { applyAssetPackSettlementUnlockToPreview, buildAssetPackSettlementUnlock },
    { buildSupabaseStagingTestnetProjectionReadback, reconcileLedgerDatabaseProjection },
    { evaluateBtdOrganizationInterfaceAuthority },
    btdReceiptBuilders,
  ] = await Promise.all([
    // Absolute .ts paths + multi-layout candidates (tsx loads TypeScript sources).
    importMonorepoModule('asset-packs-pipelines syntheses-domain', [
      'packages/asset-packs-pipelines/syntheses/domain/src/index.ts',
      // Legacy monolithic domain carried preview boundary before the split.
      'packages/asset-packs-pipelines/domain/src/index.ts',
    ]),
    importMonorepoModule('asset-packs-pipelines domain (all-3)', [
      'packages/asset-packs-pipelines/domain/src/index.ts',
    ]),
    importMonorepoModule('asset-packs-pipelines deposit synthesis', [
      'packages/asset-packs-pipelines/syntheses/deposit/src/index.ts',
      'packages/asset-packs-pipelines/synthesize-deposits-asset-packs-pipeline/src/index.ts',
    ]),
    importMonorepoModule('asset-packs-pipelines read synthesis', [
      'packages/asset-packs-pipelines/syntheses/read/src/index.ts',
      'packages/asset-packs-pipelines/synthesize-reads-asset-packs-pipeline/src/index.ts',
    ]),
    importMonorepoModule('pipelines-generics', [
      'packages/pipelines-generics/src/index.ts',
    ]),
    importMonorepoModule('btd settlement', ['packages/btd/src/settlement.ts']),
    importMonorepoModule('btd reconciliation', ['packages/btd/src/reconciliation.ts']),
    importMonorepoModule('btd authority', ['packages/btd/src/authority.ts']),
    importMonorepoModule('btd receipts', ['packages/btd/src/receipts.ts']),
  ]);
  const { enablePipelineStreaming } = pipelinesGenericsExports;
  // Current name + legacy alias from pre-ExecutionPipeline rename images.
  const factoryExecutionPipeline =
    pipelinesGenericsExports.factoryExecutionPipeline ||
    pipelinesGenericsExports.factoryPipelineExecution;
  if (typeof enablePipelineStreaming !== 'function' || typeof factoryExecutionPipeline !== 'function') {
    throw new Error(
      'pipelines-generics missing enablePipelineStreaming / factoryExecutionPipeline (or factoryPipelineExecution). Rebuild Pipeliner image.',
    );
  }
  // Layout law: all-3 domain vs syntheses-domain vs product packages.
  const {
    buildAssetPackPreviewBoundary,
    persistAssetPackPreviewBoundary,
  } = synthDomainExports;
  const {
    buildAssetPackDisclosureReview,
    assertAssetPackDisclosureSourceSafe,
    buildAssetPackSettlementRightsDeliveryBoundary,
    persistAssetPackSettlementRightsDeliveryBoundary,
  } = all3DomainExports;
  const {
    acceptReadNeed,
    buildAssetPackSourceSafePreview,
    buildReadingPipelineObservabilityInventory,
    isAcceptedReadNeed,
    resolveReadingPipelineTelemetryProjection,
    summarizeReadingPipelineObservabilityCoverage,
    synthesizeReadNeedForPipelineInput,
  } = readPipelineExports;
  // Current hierarchy names + legacy factory aliases from pre-rename images.
  const factoryExecutionPipelineSDIVFSynthesizeReadAssetPacks =
    readPipelineExports.factoryExecutionPipelineSDIVFSynthesizeReadAssetPacks ||
    readPipelineExports.factorySynthesizeReadAssetPacksSDIVFPipeline;
  const factoryExecutionPipelineSDIVFSynthesizeDepositAssetPacks =
    depositPipelineExports.factoryExecutionPipelineSDIVFSynthesizeDepositAssetPacks ||
    depositPipelineExports.factorySynthesizeDepositAssetPacksSDIVFPipeline;
  if (typeof factoryExecutionPipelineSDIVFSynthesizeReadAssetPacks !== 'function') {
    throw new Error(
      'Read synthesis factory missing on resolved package (expected factoryExecutionPipelineSDIVFSynthesizeReadAssetPacks or factorySynthesizeReadAssetPacksSDIVFPipeline). Rebuild Pipeliner image.',
    );
  }
  if (typeof factoryExecutionPipelineSDIVFSynthesizeDepositAssetPacks !== 'function') {
    throw new Error(
      'Deposit synthesis factory missing on resolved package (expected factoryExecutionPipelineSDIVFSynthesizeDepositAssetPacks or factorySynthesizeDepositAssetPacksSDIVFPipeline). Rebuild Pipeliner image.',
    );
  }
  buildBtdAssetPackMintReceiptFn = btdReceiptBuilders.buildBtdAssetPackMintReceipt;
  buildBtdReadReceiptFn = btdReceiptBuilders.buildBtdReadReceipt;
  buildBtdRightsTransferReceiptFn = btdReceiptBuilders.buildBtdRightsTransferReceipt;
  readingPipelineObservabilityInventory = buildReadingPipelineObservabilityInventory();
  resolveReadingPipelineTelemetryProjectionFn = resolveReadingPipelineTelemetryProjection;
  summarizeReadingPipelineObservabilityCoverageFn = summarizeReadingPipelineObservabilityCoverage;
  execution = factoryExecutionPipeline(isDepositMode ? 'synthesize_deposit_asset_packs' : 'asset_pack', undefined, {
    pipelineName: isDepositMode ? 'synthesize-deposits-asset-packs-pipeline' : 'asset_pack',
    family: 'asset_pack',
    posture: 'live',
    admittedSurface: isDepositMode ? 'deposit_synthesize' : 'terminal_read_fit',
  });

  execution.store('host', 'manifestRoot', manifestRoot);
  execution.store('host', 'sourceRevision', manifest.sourceRevision);
  execution.store('host', 'runId', runId);
  execution.store('host', 'userId', userId);
  execution.store('pipeline', 'userId', userId);
  execution.store('pipeline', 'synthesizeMode', synthesizeMode);
  execution.store('read', 'request', manifest.read);
  execution.store('deposit', 'reference', manifest.deposit);

  const databaseStreamingRequested = process.env.BITCODE_PIPELINE_STREAM_TO_DATABASE === '1';
  if (databaseStreamingRequested) {
    const { supabaseAdmin } = await importMonorepoModule('supabase', [
      'packages/supabase/src/index.ts',
    ]);
    supabase = supabaseAdmin;
    userId = await resolvePipelineUserId();
    execution.store('host', 'userId', userId);
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

  // Read-mode needs an accepted ReadNeed; deposit synthesis is depositor-driven.
  let readNeed = null;
  if (!isDepositMode) {
    readNeed = isAcceptedReadNeed(manifest.readNeed)
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
  }

  const input = {
    read: manifest.read?.prompt || (isDepositMode ? 'Deposit measured AssetPack options.' : ''),
    definitionOfRead: manifest.read?.prompt || null,
    readNeed,
    acceptedReadNeed: readNeed,
    requireAcceptedReadNeed: isDepositMode ? false : manifest.requireAcceptedReadNeed !== false,
    repository: {
      fullName: manifest.sourceRevision.repositoryFullName,
      branch: manifest.sourceRevision.branch,
      commit: manifest.sourceRevision.commit,
    },
    sourceRevision: manifest.sourceRevision,
    deposit: manifest.deposit,
    depositoryAssets: [buildManifestDepositoryAsset(manifest)],
    writtenAssetType: 'asset_pack',
    // Pull-request / destination delivery is SettleAssetPacks (settlement
    // procedures) — not synthesize-deposits. Deposit Finish only stores options
    // for /deposits review admission. Read-mode still stamps the preprocess
    // written-asset snapshot with the formal PR template default.
    ...(isDepositMode ? {} : { deliveryMechanismTemplate: 'pull-request' }),
    host: manifest,
    synthesizeMode,
    mode: synthesizeMode,
    instructions: (manifest.depositSteering && manifest.depositSteering.obfuscations) || null,
    obfuscations: (manifest.depositSteering && manifest.depositSteering.obfuscations) || null,
    permissibleSources:
      (manifest.depositSteering && manifest.depositSteering.permissibleSources) || [],
    impermissibleSources:
      (manifest.depositSteering && manifest.depositSteering.impermissibleSources) || [],
    demandContext: (manifest.depositSteering && manifest.depositSteering.demandContext) || [],
  };

  record({
    type: 'pipeline-start',
    stage: isDepositMode ? 'deposit-setup' : 'read-comprehension',
    sourceRevision: manifest.sourceRevision,
    synthesizeMode,
  });
  if (manifest.sourceOverlay) {
    record({
      type: 'source-overlay-applied',
      stage: 'validation',
      sourceOverlay: manifest.sourceOverlay,
    });
  }
  // Product law: deposit and read are separate SDIVF pipelines (not Engi DDD).
  const pipelineEntrypoint = isDepositMode
    ? factoryExecutionPipelineSDIVFSynthesizeDepositAssetPacks()
    : factoryExecutionPipelineSDIVFSynthesizeReadAssetPacks();
  const rawOutput = await withHostTimeout(pipelineEntrypoint(input, execution), hostMaxRuntimeMs);
  const postprocessedOutput = findExecutionValueDown(execution, 'postprocessed', 'result');
  output = postprocessedOutput && typeof postprocessedOutput === 'object' && !Array.isArray(postprocessedOutput)
    ? {
        ...(rawOutput && typeof rawOutput === 'object' && !Array.isArray(rawOutput) ? rawOutput : { rawPipelineOutput: rawOutput }),
        ...postprocessedOutput,
      }
    : rawOutput;
  await pipelineStreamer.flushStructuredWrites?.();

  // Deposit synthesis: present measured AssetPack options to the depositor.
  // Skip read-mode fee/preview/settlement (those require ReadNeed + PR delivery).
  if (isDepositMode) {
    const depositOptions =
      findExecutionValueDown(execution, 'implementation', 'options') ||
      findExecutionValueDown(execution, 'implementation', 'assetPacks') ||
      output?.depositOptions ||
      output?.options ||
      output?.selectionEnvelope?.options ||
      [];
    const selectionEnvelope =
      findExecutionValueDown(execution, 'finish', 'selectionEnvelope') ||
      output?.selectionEnvelope ||
      null;
    const optionCount = Array.isArray(depositOptions) ? depositOptions.length : 0;
    // Deposit synthesis presents measured options — never "fit" (fit is post-read only).
    const depositResultState =
      optionCount > 0 ? 'worthy_deposit_candidates' : 'no_worthy_deposit_candidates';
    output = {
      ...(output && typeof output === 'object' && !Array.isArray(output) ? output : {}),
      success: optionCount > 0,
      options: depositOptions,
      depositOptions,
      selectionEnvelope,
      resultState: depositResultState,
    };
    resultState = manifest.sourceOverlay ? 'blocked_readiness' : depositResultState;
    const resultReasons = [
      'Deposit synthesize-asset-packs pipeline entrypoint returned without throwing.',
      optionCount > 0
        ? 'Synthesized ' + optionCount + ' measured AssetPack option(s) for depositor selection.'
        : 'Deposit pipeline completed without measurable AssetPack options.',
      manifest.sourceOverlay
        ? 'Source overlay patch was applied for QA; this run cannot serve as source-revision settlement evidence.'
        : null,
    ].filter(Boolean);
    record({ type: 'pipeline-complete', stage: 'finish', optionCount, synthesizeMode: 'deposit' });
    stopHeartbeat();
    await checkpointInFlight.catch(() => {});
    const readingPipelineObservabilityCoverage = summarizeReadingPipelineObservabilityCoverageFn
      ? summarizeReadingPipelineObservabilityCoverageFn(events)
      : null;
    const evidence = {
      schema: 'bitcode.pipeline-host.evidence',
      hostMode: manifest.hostMode,
      resultState,
      pipelineResultState: resultState,
      resultReasons,
      runId,
      userId,
      manifestRoot,
      manifest,
      output,
      depositOptions,
      selectionEnvelope,
      execution: summarizeExecution(execution),
      readingPipelineObservabilityInventory,
      readingPipelineObservabilityCoverage,
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
    return;
  }

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
  const sourceSafePreview = buildAssetPackSourceSafePreview({
    need: readNeed,
    fitResult,
    assetPackId: output?.assetPack?.assetPackId || output?.assetPackId || null,
    proofRoot: output?.assetPack?.proofRoot || output?.proofRoot || null,
    sourceManifestRoot: output?.assetPack?.sourceManifestRoot || output?.sourceManifestRoot || null,
    pullRequestTarget: pullRequestUrl || null,
  });
  execution.store('asset-pack/preview', 'sourceSafe', sourceSafePreview);
  execution.store('asset-pack/preview', 'feeQuote', sourceSafePreview.feeQuote);
  const sourceSafeDisclosureReview = buildAssetPackDisclosureReview({ preview: sourceSafePreview });
  assertAssetPackDisclosureSourceSafe(sourceSafeDisclosureReview);
  execution.store('asset-pack/preview', 'disclosureReview', sourceSafeDisclosureReview);
  let assetPackPreviewBoundary = output?.assetPackPreviewBoundary || null;
  if (!assetPackPreviewBoundary || assetPackPreviewBoundary.schema !== 'bitcode.asset-pack.preview-boundary') {
    assetPackPreviewBoundary = buildAssetPackPreviewBoundary({
      need: readNeed,
      fitResult,
      sourceSafePreview,
      pullRequestTarget: pullRequestUrl || null,
    });
  }
  persistAssetPackPreviewBoundary(execution, assetPackPreviewBoundary);
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
        ? 'Pipeline produced ' + pipelineResultState + ' evidence; final settlement remains blocked by host readiness constraints.'
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
  const supabaseRestHost = hostFromUrl(
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      process.env.BITCODE_SUPABASE_URL
  );
  const supabaseDatabaseHost = hostFromUrl(process.env.SUPABASE_DB_URL || process.env.DATABASE_URL);
  const stagingTestnetReadback = ledgerSettlement?.readback
    ? buildSupabaseStagingTestnetProjectionReadback({
        readbackId: 'staging-testnet-readback-' + runId,
        lane: 'staging-testnet',
        supabaseProjectRef:
          process.env.BITCODE_SUPABASE_PROJECT_REF ||
          supabaseProjectRefFromHost(supabaseRestHost),
        restHost: supabaseRestHost || 'staging-testnet-unresolved.supabase.co',
        databaseHost: supabaseDatabaseHost || undefined,
        adminCredentialState: supabase ? 'provided_out_of_band' : 'missing',
        tableReadbacks: buildProjectionTableReadbacks(ledgerSettlement.readback),
      })
    : null;
  const ledgerDatabaseReconciliation = ledgerSettlement?.assetPackId
    ? reconcileLedgerDatabaseProjection({
        reconciliationId: 'host-reconciliation-' + runId,
        ledgerFacts: [
          {
            factId: ledgerSettlement.assetPackId,
            ledgerRoot: ledgerSettlement.proofRoots?.proofRoot || rootOf({ assetPackId: ledgerSettlement.assetPackId }),
            finalityState: ledgerSettlement.status === 'settled' ? 'confirmed' : 'failed',
          },
          ...(ledgerSettlement.btcFeeReceiptId
            ? [{
                factId: ledgerSettlement.btcFeeReceiptId,
                ledgerRoot: rootOf({
                  btcFeeReceiptId: ledgerSettlement.btcFeeReceiptId,
                  satsPaid: ledgerSettlement.btcFee?.satsPaid || 0,
                  finalityState: ledgerSettlement.btcFee?.finalityState || 'prepared',
                }),
                finalityState: ledgerSettlement.btcFee?.finalityState || 'prepared',
              }]
            : []),
          ...(ledgerSettlement.ledgerAnchorId
            ? [{
                factId: ledgerSettlement.ledgerAnchorId,
                ledgerRoot: ledgerSettlement.proofRoots?.settlementJournalRoot || ledgerSettlement.ledgerAnchorId,
                finalityState: ledgerSettlement.status === 'settled' ? 'confirmed' : 'failed',
              }]
            : []),
        ],
        databaseFacts: [
          ...(ledgerSettlement.readback?.assetPackRange
            ? [{
                factId: ledgerSettlement.assetPackId,
                projectedLedgerRoot: ledgerSettlement.proofRoots?.proofRoot || rootOf({ assetPackId: ledgerSettlement.assetPackId }),
                projectedFinalityState: ledgerSettlement.status === 'settled' ? 'confirmed' : 'failed',
                projectedObjectStorageRoot: rootOf({
                  artifactPath: '${EVIDENCE_PATH}',
                  assetPackId: ledgerSettlement.assetPackId,
                  manifestRoot,
                }),
              }]
            : []),
          ...(ledgerSettlement.readback?.btcFeeTransaction && ledgerSettlement.btcFeeReceiptId
            ? [{
                factId: ledgerSettlement.btcFeeReceiptId,
                projectedLedgerRoot: rootOf({
                  btcFeeReceiptId: ledgerSettlement.btcFeeReceiptId,
                  satsPaid: ledgerSettlement.btcFee?.satsPaid || 0,
                  finalityState: ledgerSettlement.btcFee?.finalityState || 'prepared',
                }),
                projectedFinalityState: ledgerSettlement.btcFee?.finalityState || 'prepared',
              }]
            : []),
          ...(ledgerSettlement.readback?.ledgerAnchor && ledgerSettlement.ledgerAnchorId
            ? [{
                factId: ledgerSettlement.ledgerAnchorId,
                projectedLedgerRoot: ledgerSettlement.proofRoots?.settlementJournalRoot || ledgerSettlement.ledgerAnchorId,
                projectedFinalityState: ledgerSettlement.status === 'settled' ? 'confirmed' : 'failed',
              }]
            : []),
        ],
        objectStorageArtifacts: [
          {
            factId: ledgerSettlement.assetPackId,
            artifactId: 'pipeline-evidence-' + runId,
            artifactKind: 'pipeline_evidence',
            storageRoot: rootOf({
              artifactPath: '${EVIDENCE_PATH}',
              assetPackId: ledgerSettlement.assetPackId,
              manifestRoot,
            }),
            manifestRoot: manifestRoot ? 'sha256:' + manifestRoot : undefined,
            sourceVisibility: 'proof_public',
            durable: true,
            containsProtectedSource: false,
            encrypted: false,
          },
          {
            factId: 'pipeline-telemetry-' + runId,
            artifactId: 'pipeline-telemetry-' + runId,
            artifactKind: 'pipeline_telemetry',
            storageRoot: rootOf({ artifactPath: '${TELEMETRY_PATH}', runId }),
            manifestRoot: manifestRoot ? 'sha256:' + manifestRoot : undefined,
            sourceVisibility: 'proof_public',
            durable: true,
            containsProtectedSource: false,
            encrypted: false,
          },
          {
            factId: 'source-safe-preview-' + runId,
            artifactId: 'source-safe-preview-' + runId,
            artifactKind: 'asset_pack_source_safe_preview',
            storageRoot:
              ledgerSettlement.assetPackMintReceipt?.sourceSafePreviewRoot ||
              rootOf({ sourceSafePreview, protectedSourceVisible: false }),
            manifestRoot: ledgerSettlement.proofRoots?.sourceManifestRoot,
            sourceVisibility: 'source_safe',
            durable: true,
            containsProtectedSource: false,
            encrypted: false,
          },
        ],
        stagingTestnetReadback,
        settlementConservationChecks: ledgerSettlement.btcFee
          ? [{
              checkId: 'btc-fee-conservation-' + runId,
              expectedDebitSats: Number(ledgerSettlement.btcFee.satsPaid || 0),
              observedDebitSats: ledgerSettlement.readback?.btcFeeTransaction ? Number(ledgerSettlement.btcFee.satsPaid || 0) : 0,
              expectedCreditSats: Number(ledgerSettlement.btcFee.satsPaid || 0),
              observedCreditSats: ledgerSettlement.readback?.btcFeeTransaction ? Number(ledgerSettlement.btcFee.satsPaid || 0) : 0,
              paymentReceiptRoot: ledgerSettlement.btcFeeReceiptId || undefined,
            }]
          : [],
        metaphysicalFacts: [
          {
            factId: 'protected-source-boundary-' + runId,
            factKind: 'private_source_metadata',
            canonicalRoot: ledgerSettlement.proofRoots?.sourceManifestRoot || manifestRoot || rootOf(manifest.sourceRevision || {}),
            receiptRoot: ledgerSettlement.proofRoots?.accessPolicyHash || undefined,
            private: true,
          },
        ],
      })
    : null;
  if (ledgerDatabaseReconciliation) {
    execution.store('asset-pack/settlement', 'ledgerDatabaseReconciliation', ledgerDatabaseReconciliation);
  }
  const settlementUnlock = buildAssetPackSettlementUnlock({
    ledgerSettlement,
    pullRequestTarget: pullRequestUrl || null,
    requirePullRequestDelivery: deliveryRequired,
  });
  const settledSourceSafePreview = applyAssetPackSettlementUnlockToPreview(sourceSafePreview, settlementUnlock);
  const assetPackDisclosureReview = buildAssetPackDisclosureReview({
    preview: settledSourceSafePreview,
    readRightState: settlementUnlock.state,
    sourceAvailable: settlementUnlock.sourceAvailable,
    reason: settlementUnlock.reason,
  });
  assertAssetPackDisclosureSourceSafe(assetPackDisclosureReview);
  const settlementFinalityConfirmed =
    ledgerSettlement?.status === 'settled' && ledgerSettlement?.settlementAdmissible === true;
  const settlementObservedSats =
    Number(ledgerSettlement?.btcFee?.satsPaid || assetPackPreviewBoundary?.quoteReceipt?.sats || 0) ||
    Number(assetPackPreviewBoundary?.quoteReceipt?.sats || 0);
  const assetPackSettlementRightsDeliveryBoundary = assetPackPreviewBoundary
    ? buildAssetPackSettlementRightsDeliveryBoundary({
        previewBoundary: assetPackPreviewBoundary,
        paymentObservation: {
          paymentReceiptId: ledgerSettlement?.btcFeeReceiptId || undefined,
          payerWalletId: readerWalletId,
          payeeWalletId: depositorWalletId,
          btcNetwork: ledgerSettlement?.btcFee?.network || 'testnet',
          expectedSats: assetPackPreviewBoundary.quoteReceipt.sats,
          observedDebitSats: settlementObservedSats,
          observedCreditSats: settlementObservedSats,
          txid:
            ledgerSettlement?.btcFee?.txid ||
            ledgerSettlement?.btcFeeReceiptId ||
            'staging-testnet-' + runId,
        },
        finality: {
          finalityState: settlementFinalityConfirmed ? 'confirmed' : 'prepared',
          confirmations: settlementFinalityConfirmed ? 1 : 0,
          blockHeight: null,
        },
        readerWalletId,
        depositorWalletId,
        orderId: ledgerSettlement?.ownershipEventId || undefined,
        readId: manifest.read?.id || runId,
        readLicenseId: ledgerSettlement?.readLicenseId || undefined,
        ledgerAnchorId: ledgerSettlement?.ledgerAnchorId || undefined,
        pullRequestTarget: pullRequestUrl || null,
      })
    : null;
  if (assetPackSettlementRightsDeliveryBoundary) {
    persistAssetPackSettlementRightsDeliveryBoundary(execution, assetPackSettlementRightsDeliveryBoundary);
  }
  const organizationAuthority = [
    evaluateBtdOrganizationInterfaceAuthority({
      actorId: userId || readerWalletId,
      organizationId: manifest.organizationId || manifest.organization?.id || 'staging-testnet-organization',
      organizationRole: 'admin',
      organizationPermissionGrants: ['asset_pack:deliver'],
      interfaceSurface: 'product',
      action: 'deliver_asset_pack',
      walletId: readerWalletId,
      targetAnchor: pullRequestUrl || null,
      readAccessDecision: settlementUnlock.sourceAvailable
        ? {
            decision: 'licensed_read',
            accessPolicyHash: ledgerSettlement.accessPolicyHash || sourceSafePreview?.accessPolicy?.accessPolicyHash || 'policy-pending',
            reason: settlementUnlock.reason,
          }
        : null,
      settlementState: settlementUnlock.sourceAvailable ? 'settled' : 'pending',
      confirmed: ledgerSettlement.settlementAdmissible === true,
      repairApprovalState: 'not_required',
	    }),
	  ];
  execution.store('asset-pack/preview', 'sourceSafe', settledSourceSafePreview);
  execution.store('asset-pack/preview', 'disclosureReview', assetPackDisclosureReview);
  execution.store('asset-pack/settlement', 'unlock', settlementUnlock);
  execution.store('asset-pack/settlement', 'readLicenseId', settlementUnlock.readLicenseId);
  execution.store('asset-pack/settlement', 'organizationAuthority', organizationAuthority);
  output = {
    ...(output || {}),
    sourceSafePreview: settledSourceSafePreview,
    assetPackPreviewBoundary,
    assetPackDisclosureReview,
    assetPackSettlementRightsDeliveryBoundary,
    assetPackSettlementReplayReceipt: assetPackSettlementRightsDeliveryBoundary?.replayReceipt || null,
    assetPackDeliveryUnlock: assetPackSettlementRightsDeliveryBoundary?.deliveryUnlock || null,
    assetPackLedgerDatabaseStorageReconciliation:
      assetPackSettlementRightsDeliveryBoundary?.reconciliationReport || null,
    organizationAuthority,
    ledgerSettlement: {
      ...ledgerSettlement,
      protectedSourceUnlock: settlementUnlock,
      ledgerDatabaseReconciliation,
    },
  };
  resultReasons.push(ledgerSettlement.reason);
  resultReasons.push(settlementUnlock.reason);
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
    assetPackMintReceiptRoot: ledgerSettlement.assetPackMintReceipt?.receiptRoot || null,
    readReceiptRoot: ledgerSettlement.readReceipt?.receiptRoot || null,
    rightsTransferReceiptRoot: ledgerSettlement.rightsTransferReceipt?.receiptRoot || null,
    reconciliationState: ledgerDatabaseReconciliation?.state || null,
    repairActionCount: ledgerDatabaseReconciliation?.repairActions?.length || 0,
    organizationAuthorityDecision: organizationAuthority[0].decision,
    organizationAuthorityRoot: organizationAuthority[0].proofRoots.authorityRoot,
  });
  const readingPipelineObservabilityCoverage = summarizeReadingPipelineObservabilityCoverageFn
    ? summarizeReadingPipelineObservabilityCoverageFn(events)
    : null;

  const evidence = {
    schema: 'bitcode.pipeline-host.evidence',
    hostMode: manifest.hostMode,
    resultState,
    pipelineResultState,
    resultReasons,
    runId,
    userId,
    manifestRoot,
    manifest,
    output,
    depositOptions: findExecutionValueDown(execution, 'implementation', 'options') || null,
    fitResult,
    depositorySearch,
    sourceSafePreview: settledSourceSafePreview,
    assetPackPreviewBoundary,
    assetPackSettlementRightsDeliveryBoundary,
    assetPackDisclosureReview,
    assetPackSynthesisArtifacts: output?.assetPackSynthesisArtifacts || null,
    writtenAssets: output?.writtenAssets || null,
    deliveryMechanism: output?.deliveryMechanism || null,
    // Synthesis host result: never settleDelivery (settle pipeline exclusive).
    settleDelivery: null,
    ledgerSettlement: output.ledgerSettlement,
    organizationAuthority,
    ledgerDatabaseReconciliation,
    execution: summarizeExecution(execution),
    readingPipelineObservabilityInventory,
    readingPipelineObservabilityCoverage,
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
  if (error.name === 'PipelineHostTimeoutError') {
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

  // Preserve partial deposit options even on timeout so depositor surfaces can
  // still inspect measured packs synthesized before the host budget expired.
  const partialDepositOptions = execution
    ? (findExecutionValueDown(execution, 'implementation', 'options') ||
        findExecutionValueDown(execution, 'implementation', 'assetPacks') ||
        null)
    : null;
  const isDepositHost = manifest?.synthesizeMode === 'deposit';
  const partialDepositComplete =
    isDepositHost &&
    Array.isArray(partialDepositOptions) &&
    partialDepositOptions.length > 0 &&
    partialDepositOptions.every((pack) => {
      const abs = pack?.measurements?.absolutes || pack?.absolutes;
      return Array.isArray(abs) && abs.length >= 8;
    });
  if (Array.isArray(partialDepositOptions) && partialDepositOptions.length > 0) {
    output = {
      ...(output && typeof output === 'object' && !Array.isArray(output) ? output : {}),
      options: partialDepositOptions,
      depositOptions: partialDepositOptions,
      partial: !partialDepositComplete,
      resultState: partialDepositComplete ? 'worthy_deposit_candidates' : 'blocked_readiness',
    };
  }

  // Deposit recovery never claims "fit" — fit is exclusive to post-read depository search.
  const recoveredResultState = partialDepositComplete
    ? 'worthy_deposit_candidates'
    : 'blocked_readiness';
  const evidence = {
    schema: 'bitcode.pipeline-host.evidence',
    hostMode: manifest?.hostMode || 'asset_pack_pipeline',
    resultState: recoveredResultState,
    resultReasons: [
      partialDepositComplete
        ? 'Deposit AssetPack options with full absolute measurements were recovered after host budget pressure.'
        : 'AssetPack pipeline execution did not produce admissible result evidence.',
      error.message,
      Array.isArray(partialDepositOptions) && partialDepositOptions.length > 0
        ? 'Partial deposit options were recovered from implementation store (' +
          partialDepositOptions.length +
          ').'
        : null,
    ].filter(Boolean),
    runId,
    userId,
    manifestRoot,
    manifest,
    output,
    depositOptions: partialDepositOptions,
    error,
    execution: execution ? summarizeExecution(execution) : null,
    readingPipelineObservabilityInventory,
    readingPipelineObservabilityCoverage: summarizeReadingPipelineObservabilityCoverageFn
      ? summarizeReadingPipelineObservabilityCoverageFn(events)
      : null,
    events,
    startedAt,
    completedAt: new Date().toISOString(),
  };

  await updatePipelineRun(partialDepositComplete ? 'completed' : 'failed', {
    output,
    error,
    resultState: recoveredResultState,
    resultReasons: evidence.resultReasons,
  });
  await writeFile(\`\${artifactDir}/evidence.json\`, JSON.stringify(evidence, null, 2));
  process.exitCode = partialDepositComplete ? 0 : 1;
  if (partialDepositComplete) {
    forceExitAfterFinally = true;
  }
} finally {
  stopHeartbeat();
  await checkpointInFlight.catch(() => {});
  await insertHostStreamLog(process.exitCode ? 'failed' : 'completed');
  await writeFile(\`\${artifactDir}/telemetry.jsonl\`, events.map((event) => JSON.stringify(event)).join('\\n') + '\\n');
  if (forceExitAfterFinally) {
    process.exit(process.exitCode ? 1 : 0);
  }
}

}

main().catch((caught) => {
  process.stderr.write(\`\${caught?.message || String(caught)}\\n\`);
  process.exitCode = 1;
});
`;
}
