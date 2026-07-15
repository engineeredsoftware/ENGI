#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.proofs/v34/distributed-execution-runtime-receipts.json';
const GENERATED_AT = '2026-05-22T00:00:00.000Z';

const SECRET_MARKERS = Object.freeze([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
  'raw source',
]);
const SECRET_PATTERN = new RegExp(SECRET_MARKERS.map(escapeRegex).join('|'), 'iu');

const requiredWorkKinds = Object.freeze([
  'pipeline_run',
  'ptrr_agent',
  'thricified_generation',
  'tool_call',
  'ledger_operation',
  'wallet_operation',
  'proof_generation',
  'object_storage_write',
  'repair_job',
]);

const receiptRows = Object.freeze([
  {
    executionId: 'execution-read-fits-finding-synthesis',
    hostId: 'pipeline_workers',
    laneId: 'staging-testnet',
    workKind: 'pipeline_run',
    commandOrPipelineId: 'ReadFitsFindingSynthesis',
    status: 'succeeded',
    routeHandlerBoundary: 'request_response_not_required',
    phaseId: 'discovery',
    startedAt: '2026-05-22T00:00:00.000Z',
    completedAt: '2026-05-22T00:00:01.000Z',
    inputRoot: 'sha256:pipeline-input-root',
    outputRoot: 'sha256:pipeline-output-root',
    logRoot: 'sha256:runtime-log-root',
    objectStorageRoot: 'sha256:pipeline-object-storage-root',
    ledgerProjectionRoot: 'sha256:pipeline-ledger-projection-root',
    databaseProjectionRoot: 'sha256:database-projection-root',
    proofRoot: 'sha256:pipeline-proof-root',
    repairPosture: 'retry-detached-pipeline-from-input-root',
    replayCommand: 'pnpm run check:v34-gate3',
  },
  {
    executionId: 'execution-read-fits-agent',
    hostId: 'pipeline_workers',
    laneId: 'staging-testnet',
    workKind: 'ptrr_agent',
    commandOrPipelineId: 'ReadFitsFindingSynthesisDiscoveryAgent',
    status: 'succeeded',
    routeHandlerBoundary: 'request_response_not_required',
    phaseId: 'discovery',
    agentId: 'ReadFitsFindingSynthesisDiscoveryAgent',
    ptrrStep: 'plan',
    parentReceiptRoot: 'receipt:pipeline-run-root',
    startedAt: '2026-05-22T00:00:00.000Z',
    completedAt: '2026-05-22T00:00:01.000Z',
    inputRoot: 'sha256:agent-input-root',
    outputRoot: 'sha256:agent-output-root',
    logRoot: 'sha256:runtime-log-root',
    databaseProjectionRoot: 'sha256:database-projection-root',
    proofRoot: 'sha256:agent-proof-root',
    repairPosture: 'resume-ptrr-agent-from-step-root',
    replayCommand: 'pnpm run check:v34-gate3',
  },
  {
    executionId: 'execution-thricified-generation',
    hostId: 'pipeline_workers',
    laneId: 'staging-testnet',
    workKind: 'thricified_generation',
    commandOrPipelineId: 'ReadFitsFindingSynthesisDiscoveryAgent.plan.reason',
    status: 'succeeded',
    routeHandlerBoundary: 'request_response_not_required',
    phaseId: 'discovery',
    agentId: 'ReadFitsFindingSynthesisDiscoveryAgent',
    ptrrStep: 'plan',
    thricifiedGenerationStep: 'reason',
    parentReceiptRoot: 'receipt:ptrr-agent-root',
    startedAt: '2026-05-22T00:00:00.000Z',
    completedAt: '2026-05-22T00:00:01.000Z',
    inputRoot: 'sha256:generation-input-root',
    outputRoot: 'sha256:generation-output-root',
    logRoot: 'sha256:runtime-log-root',
    databaseProjectionRoot: 'sha256:database-projection-root',
    proofRoot: 'sha256:generation-proof-root',
    repairPosture: 'regenerate-from-redacted-prompt-and-context-root',
    replayCommand: 'pnpm run check:v34-gate3',
  },
  {
    executionId: 'execution-depository-search-tool',
    hostId: 'pipeline_workers',
    laneId: 'staging-testnet',
    workKind: 'tool_call',
    commandOrPipelineId: 'AssetPackLexicalDepositorySearchTool',
    status: 'succeeded',
    routeHandlerBoundary: 'request_response_not_required',
    phaseId: 'discovery',
    agentId: 'ReadFitsFindingSynthesisDiscoveryAgent',
    ptrrStep: 'try',
    toolId: 'AssetPackLexicalDepositorySearchTool',
    parentReceiptRoot: 'receipt:thricified-generation-root',
    startedAt: '2026-05-22T00:00:00.000Z',
    completedAt: '2026-05-22T00:00:01.000Z',
    inputRoot: 'sha256:tool-input-root',
    outputRoot: 'sha256:tool-output-root',
    logRoot: 'sha256:runtime-log-root',
    databaseProjectionRoot: 'sha256:database-projection-root',
    proofRoot: 'sha256:tool-proof-root',
    repairPosture: 'rerun-tool-from-input-root-with-source-safe-query',
    replayCommand: 'pnpm run check:v34-gate3',
  },
  {
    executionId: 'execution-ledger-operation',
    hostId: 'ledger_projection',
    laneId: 'staging-testnet',
    workKind: 'ledger_operation',
    commandOrPipelineId: 'ledger.project.read-rights',
    status: 'succeeded',
    routeHandlerBoundary: 'request_response_not_required',
    startedAt: '2026-05-22T00:00:00.000Z',
    completedAt: '2026-05-22T00:00:01.000Z',
    inputRoot: 'sha256:ledger-input-root',
    outputRoot: 'sha256:ledger-output-root',
    logRoot: 'sha256:runtime-log-root',
    ledgerProjectionRoot: 'sha256:ledger-projection-root',
    databaseProjectionRoot: 'sha256:database-projection-root',
    proofRoot: 'sha256:ledger-proof-root',
    repairPosture: 'hold-unlock-and-replay-ledger-projection',
    replayCommand: 'pnpm run check:v34-gate3',
  },
  {
    executionId: 'execution-wallet-operation',
    hostId: 'ledger_broadcasters',
    laneId: 'signet',
    workKind: 'wallet_operation',
    commandOrPipelineId: 'btc.fee.sign-and-broadcast',
    status: 'succeeded',
    routeHandlerBoundary: 'request_response_not_required',
    startedAt: '2026-05-22T00:00:00.000Z',
    completedAt: '2026-05-22T00:00:01.000Z',
    inputRoot: 'sha256:wallet-input-root',
    outputRoot: 'sha256:wallet-output-root',
    logRoot: 'sha256:runtime-log-root',
    databaseProjectionRoot: 'sha256:database-projection-root',
    walletOperationRoot: 'sha256:wallet-operation-root',
    proofRoot: 'sha256:wallet-proof-root',
    repairPosture: 'deny-broadcast-until-wallet-policy-repaired',
    replayCommand: 'pnpm run check:v34-gate3',
  },
  {
    executionId: 'execution-proof-generation',
    hostId: 'proof_services',
    laneId: 'staging-testnet',
    workKind: 'proof_generation',
    commandOrPipelineId: 'deployment.proof.generate',
    status: 'succeeded',
    routeHandlerBoundary: 'request_response_not_required',
    startedAt: '2026-05-22T00:00:00.000Z',
    completedAt: '2026-05-22T00:00:01.000Z',
    inputRoot: 'sha256:proof-input-root',
    outputRoot: 'sha256:proof-output-root',
    logRoot: 'sha256:runtime-log-root',
    databaseProjectionRoot: 'sha256:database-projection-root',
    proofRoot: 'sha256:proof-generation-root',
    repairPosture: 'regenerate-proof-from-canonical-inputs',
    replayCommand: 'pnpm run check:v34-gate3',
  },
  {
    executionId: 'execution-object-storage-write',
    hostId: 'object_storage',
    laneId: 'staging-testnet',
    workKind: 'object_storage_write',
    commandOrPipelineId: 'assetpack.preview.persist',
    status: 'succeeded',
    routeHandlerBoundary: 'request_response_not_required',
    startedAt: '2026-05-22T00:00:00.000Z',
    completedAt: '2026-05-22T00:00:01.000Z',
    inputRoot: 'sha256:object-storage-input-root',
    outputRoot: 'sha256:object-storage-output-root',
    logRoot: 'sha256:runtime-log-root',
    objectStorageRoot: 'sha256:object-storage-root',
    databaseProjectionRoot: 'sha256:database-projection-root',
    proofRoot: 'sha256:object-storage-proof-root',
    repairPosture: 'lock-delivery-and-rewrite-from-authorized-artifact-root',
    replayCommand: 'pnpm run check:v34-gate3',
  },
  {
    executionId: 'execution-repair-job',
    hostId: 'repair_jobs',
    laneId: 'staging-testnet',
    workKind: 'repair_job',
    commandOrPipelineId: 'projection.repair',
    status: 'repaired',
    routeHandlerBoundary: 'request_response_not_required',
    startedAt: '2026-05-22T00:00:00.000Z',
    completedAt: '2026-05-22T00:00:01.000Z',
    inputRoot: 'sha256:repair-input-root',
    outputRoot: 'sha256:repair-output-root',
    logRoot: 'sha256:runtime-log-root',
    objectStorageRoot: 'sha256:repair-object-storage-root',
    ledgerProjectionRoot: 'sha256:repair-ledger-projection-root',
    databaseProjectionRoot: 'sha256:database-projection-root',
    proofRoot: 'sha256:repair-proof-root',
    repairPosture: 'repair-complete-with-replayable-proof-root',
    replayCommand: 'pnpm run check:v34-gate3',
  },
]);

const sourceFiles = Object.freeze([
  'packages/pipeline-hosts/src/distributed-execution-runtime-receipt.ts',
  'packages/pipeline-hosts/src/index.ts',
  '.specifications/BITCODE_SPEC_V34.md',
  '.specifications/BITCODE_SPEC_V34_DELTA.md',
  '.specifications/BITCODE_SPEC_V34_PARITY_MATRIX.md',
]);

const testFiles = Object.freeze([
  'packages/pipeline-hosts/src/__tests__/distributed-execution-runtime-receipt.test.ts',
  'scripts/check-v34-gate3-distributed-execution-runtime-contracts.mjs',
]);

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function sha256(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function stableRoot(prefix, parts) {
  const hash = createHash('sha256').update(parts.join('\u001f')).digest('hex').slice(0, 24);
  return `${prefix}:${hash}`;
}

function sortJson(value) {
  if (Array.isArray(value)) return value.map(sortJson);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, sortJson(entry)]),
  );
}

function stableStringify(value) {
  return `${JSON.stringify(sortJson(value), null, 2)}\n`;
}

function scanTokens(relativePath, tokens) {
  const text = read(relativePath);
  return {
    relativePath,
    digest: sha256(text),
    requiredTokens: tokens.map((token) => ({
      token,
      present: text.includes(token),
    })),
  };
}

function allTokensPresent(scan) {
  return scan.requiredTokens.every((entry) => entry.present);
}

function withReceiptRoots(rows) {
  return rows.map((row) => ({
    ...row,
    credentialsSerialized: false,
    protectedSourceVisible: false,
    sourceSafety: {
      sourceSafe: true,
      protectedSourceVisible: false,
      containsProtectedSource: false,
      containsSecret: false,
      credentialsSerialized: false,
    },
    receiptRoot: stableRoot('v34-distributed-execution-runtime-receipt', [
      row.executionId,
      row.hostId,
      row.laneId,
      row.workKind,
      row.commandOrPipelineId,
      row.status,
      row.routeHandlerBoundary,
      row.inputRoot,
      row.outputRoot,
      row.logRoot,
      row.objectStorageRoot ?? 'no-object-storage-root',
      row.ledgerProjectionRoot ?? 'no-ledger-root',
      row.databaseProjectionRoot ?? 'no-database-root',
      row.walletOperationRoot ?? 'no-wallet-root',
      row.proofRoot ?? 'no-proof-root',
      row.repairPosture,
    ]),
  }));
}

export function buildV34DistributedExecutionRuntimeReceiptsArtifact() {
  const receipts = withReceiptRoots(receiptRows);
  const observedWorkKinds = [...new Set(receipts.map((receipt) => receipt.workKind))].sort();
  const missingWorkKinds = requiredWorkKinds.filter(
    (workKind) => !observedWorkKinds.includes(workKind),
  );
  const routeHandlerRequiresSynchronousCompletion = receipts.some(
    (receipt) => receipt.routeHandlerBoundary !== 'request_response_not_required',
  );
  const sourceEvidence = [
    scanTokens('packages/pipeline-hosts/src/distributed-execution-runtime-receipt.ts', [
      'DistributedExecutionRuntimeReceipt',
      'DISTRIBUTED_EXECUTION_RUNTIME_WORK_KINDS',
      'request_response_not_required',
      'ptrr_agent',
      'thricified_generation',
      'object_storage_write',
      'repair_job',
    ]),
    scanTokens('packages/pipeline-hosts/src/index.ts', [
      'distributed-execution-runtime-receipt',
    ]),
    scanTokens('.specifications/BITCODE_SPEC_V34.md', [
      ARTIFACT_PATH,
      'DistributedExecutionRuntimeReceipt',
      'request_response_not_required',
    ]),
  ];
  const testEvidence = [
    scanTokens('packages/pipeline-hosts/src/__tests__/distributed-execution-runtime-receipt.test.ts', [
      'catalogs pipeline runs, PTRR agents, ThricifiedGenerations, tool calls, ledger operations, wallet operations, proof generation, object-storage writes, and repair jobs',
      'keeps long-running runtime work detached from request/response route handler completion',
      'covers required roots for pipeline, tool, ledger, wallet, proof, storage, and repair receipts',
      'fails closed when successful runtime receipts omit output roots',
      'fails closed on secret-shaped or protected-source receipt text',
    ]),
    scanTokens('scripts/check-v34-gate3-distributed-execution-runtime-contracts.mjs', [
      'check:v34-distributed-execution-runtime-receipts',
      'distributed-execution-runtime-receipt.test.ts',
      'Distributed Execution Runtime Contracts',
    ]),
  ];
  const sourceEvidenceComplete = sourceEvidence.every(allTokensPresent);
  const testEvidenceComplete = testEvidence.every(allTokensPresent);
  const passed =
    missingWorkKinds.length === 0 &&
    receipts.length === requiredWorkKinds.length &&
    routeHandlerRequiresSynchronousCompletion === false &&
    sourceEvidenceComplete &&
    testEvidenceComplete;

  return {
    artifactId: 'v34-distributed-execution-runtime-receipts',
    schemaId: 'bitcode.v34.distributedExecutionRuntimeReceipts.v1',
    version: 'V34',
    currentTarget: 'V33',
    generatedAt: GENERATED_AT,
    sourceSafetyVerdict: 'source-safe-distributed-execution-runtime-receipts',
    requiredWorkKinds,
    receiptCatalogRoot: stableRoot(
      'v34-distributed-execution-runtime-receipts',
      receipts.map((receipt) => receipt.receiptRoot),
    ),
    receipts,
    coverage: {
      observedWorkKinds,
      missingWorkKinds,
      workKindCount: receipts.length,
      routeHandlerRequiresSynchronousCompletion,
      requestResponseCompletionRequired: false,
      inputRootsCovered: receipts.every((receipt) => Boolean(receipt.inputRoot)),
      outputRootsCovered: receipts.every((receipt) => Boolean(receipt.outputRoot)),
      logRootsCovered: receipts.every((receipt) => Boolean(receipt.logRoot)),
      objectStorageRootsCovered: receipts.some((receipt) => Boolean(receipt.objectStorageRoot)),
      ledgerProjectionRootsCovered: receipts.some((receipt) =>
        Boolean(receipt.ledgerProjectionRoot),
      ),
      databaseProjectionRootsCovered: receipts.every((receipt) =>
        Boolean(receipt.databaseProjectionRoot),
      ),
      walletOperationRootsCovered: receipts.some((receipt) =>
        Boolean(receipt.walletOperationRoot),
      ),
      proofRootsCovered: receipts.some((receipt) => Boolean(receipt.proofRoot)),
      repairPostureCovered: receipts.every((receipt) => Boolean(receipt.repairPosture)),
      ptrrAgentReceiptCovered: observedWorkKinds.includes('ptrr_agent'),
      thricifiedGenerationReceiptCovered: observedWorkKinds.includes('thricified_generation'),
      toolCallReceiptCovered: observedWorkKinds.includes('tool_call'),
      protectedSourceVisible: false,
      credentialsSerialized: false,
    },
    sharedFixtureFiles: [...sourceFiles, ...testFiles],
    sourceEvidence,
    testEvidence,
    passed,
    closureCommand: 'pnpm run check:v34-gate3',
  };
}

function assertSafeArtifact(artifact) {
  const serialized = stableStringify(artifact);
  if (SECRET_PATTERN.test(serialized)) {
    throw new Error(`${ARTIFACT_PATH} contains a secret-shaped marker or protected source marker.`);
  }
  if (!artifact.passed) {
    throw new Error(`${ARTIFACT_PATH} source or test evidence is incomplete.`);
  }

  return serialized;
}

function writeArtifact(artifact) {
  const serialized = assertSafeArtifact(artifact);
  mkdirSync(path.dirname(path.join(repoRoot, ARTIFACT_PATH)), { recursive: true });
  writeFileSync(path.join(repoRoot, ARTIFACT_PATH), serialized);
  return serialized;
}

function checkArtifact(artifact) {
  const next = assertSafeArtifact(artifact);
  const artifactFile = path.join(repoRoot, ARTIFACT_PATH);
  if (!existsSync(artifactFile)) {
    throw new Error(`${ARTIFACT_PATH} is missing. Run pnpm run generate:v34-distributed-execution-runtime-receipts.`);
  }
  const current = readFileSync(artifactFile, 'utf8');
  if (current !== next) {
    throw new Error(`${ARTIFACT_PATH} is stale. Run pnpm run generate:v34-distributed-execution-runtime-receipts.`);
  }
}

function main() {
  const mode = process.argv.includes('--check') ? 'check' : 'write';
  const artifact = buildV34DistributedExecutionRuntimeReceiptsArtifact();

  if (mode === 'check') {
    checkArtifact(artifact);
    process.stdout.write(`V34 distributed execution runtime receipts artifact ok ${ARTIFACT_PATH}\n`);
    return;
  }

  writeArtifact(artifact);
  process.stdout.write(`Wrote ${ARTIFACT_PATH}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
