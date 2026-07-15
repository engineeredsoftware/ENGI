#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v34-runtime-observers-broadcasters-repair-jobs.json';
const GENERATED_AT = '2026-05-23T00:00:00.000Z';

const requiredJobIds = Object.freeze([
  'settlement_observer',
  'ledger_broadcaster',
  'finality_watcher',
  'database_projection_repair',
  'object_storage_repair',
  'generated_proof_job',
  'queue_consumer',
]);

const nonValueLanes = Object.freeze([
  'local',
  'regtest',
  'signet',
  'staging-testnet',
  'public-testnet',
  'mainnet-ready-dry-run',
]);

const secretMarkers = Object.freeze([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
  '-----BEGIN PRIVATE KEY-----',
  'wallet seed',
  'mnemonic',
  'raw source',
  'source contents',
]);

const jobRows = Object.freeze([
  {
    jobId: 'settlement_observer',
    label: 'settlement observer job',
    jobClass: 'settlement_observer',
    ownerPackage: 'packages/btd',
    requiredHostIds: ['runtime_observers', 'ledger_projection', 'database_projection'],
    supportedLaneIds: nonValueLanes,
    observerId: 'observer.settlement.finality_projection',
    broadcasterId: 'broadcaster.ledger.rights_transfer',
    repairJobId: 'repair.settlement_projection_drift',
    trigger: 'settlement record pending finality or database projection drift',
    queueName: 'settlement-observer-queue',
    runtimeReceiptPolicy: 'requires ledger_operation receipt with ledger and database projection roots',
    receiptWorkKinds: ['ledger_operation', 'repair_job'],
    validationCommand: 'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/reconciliation.test.ts',
    replayCommand: 'pnpm run check:v34-runtime-observers-broadcasters-repair-jobs',
    repairCommand: 'replay settlement observer from settlement root and hold unlock until projection root matches ledger root',
    driftDetectionPolicy: 'compare settlement finality root, BTD rights root, and database projection root before unlock',
    unsafeDriftPosture: 'blocks_unlock_until_repaired',
    unlockBlockingPolicy: 'reader source unlock is denied until observer emits repaired or final receipt roots',
    auditEventName: 'runtime_observer.settlement_observer',
    proofRootBasis: ['BtcFeeQuote', 'SettlementUnlock', 'BtdRightsTransferReceipt', 'ledger database reconciliation'],
  },
  {
    jobId: 'ledger_broadcaster',
    label: 'ledger broadcaster job',
    jobClass: 'ledger_broadcaster',
    ownerPackage: 'packages/btd',
    requiredHostIds: ['ledger_broadcasters', 'ledger_projection'],
    supportedLaneIds: nonValueLanes,
    observerId: 'observer.wallet.policy',
    broadcasterId: 'broadcaster.bitcoin.psbt',
    repairJobId: 'repair.ledger_broadcast_blocker',
    trigger: 'settlement payment prepared for non-value broadcast rehearsal',
    queueName: 'ledger-broadcast-queue',
    runtimeReceiptPolicy: 'requires wallet_operation receipt with wallet operation root and broadcaster proof root',
    receiptWorkKinds: ['wallet_operation', 'ledger_operation', 'repair_job'],
    validationCommand: 'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/btc-fee-operation.test.ts',
    replayCommand: 'pnpm run check:v34-runtime-observers-broadcasters-repair-jobs',
    repairCommand: 'deny broadcast, refresh wallet policy root, and replay broadcaster dry-run receipt',
    driftDetectionPolicy: 'compare wallet policy, fee quote root, PSBT posture, and lane admission before broadcast',
    unsafeDriftPosture: 'blocks_broadcast_until_repaired',
    unlockBlockingPolicy: 'broadcast and downstream unlock are denied until fee and wallet roots match lane policy',
    auditEventName: 'runtime_observer.ledger_broadcaster',
    proofRootBasis: ['BtcFeeQuote', 'wallet_operation', 'ledger_projection', 'EnvironmentLaneContract'],
  },
  {
    jobId: 'finality_watcher',
    label: 'Bitcoin finality watcher job',
    jobClass: 'finality_watcher',
    ownerPackage: 'packages/btd',
    requiredHostIds: ['runtime_observers', 'ledger_projection'],
    supportedLaneIds: nonValueLanes,
    observerId: 'observer.bitcoin.finality',
    broadcasterId: 'broadcaster.finality.projection',
    repairJobId: 'repair.finality_reorg_projection',
    trigger: 'transaction finality changed, delayed, or conflicts with projected settlement state',
    queueName: 'finality-watch-queue',
    runtimeReceiptPolicy: 'requires ledger_operation receipt with finality state and proof root',
    receiptWorkKinds: ['ledger_operation', 'repair_job'],
    validationCommand: 'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/testnet-mainnet-readiness-rehearsal.test.ts',
    replayCommand: 'pnpm run check:v34-runtime-observers-broadcasters-repair-jobs',
    repairCommand: 'recompute finality projection from transaction root and preserve blocked unlock until stable',
    driftDetectionPolicy: 'compare observed finality state, settlement state, and rights transfer projection root',
    unsafeDriftPosture: 'blocks_unlock_until_repaired',
    unlockBlockingPolicy: 'rights transfer and AssetPack delivery stay blocked when finality is stale or contradictory',
    auditEventName: 'runtime_observer.finality_watcher',
    proofRootBasis: ['SettlementUnlock', 'BtdReadReceipt', 'BtdRightsTransferReceipt', 'finalityState'],
  },
  {
    jobId: 'database_projection_repair',
    label: 'database projection repair job',
    jobClass: 'database_projection_repair',
    ownerPackage: 'packages/orm',
    requiredHostIds: ['database_projection', 'repair_jobs'],
    supportedLaneIds: nonValueLanes,
    observerId: 'observer.database.projection_drift',
    broadcasterId: 'broadcaster.database.repair_event',
    repairJobId: 'repair.database_projection',
    trigger: 'canonical database projection root differs from ledger-derived or object-storage root',
    queueName: 'database-projection-repair-queue',
    runtimeReceiptPolicy: 'requires repair_job receipt with database projection root and repair proof root',
    receiptWorkKinds: ['repair_job', 'ledger_operation'],
    validationCommand: 'pnpm run db:data-health:ci',
    replayCommand: 'pnpm run check:v34-runtime-observers-broadcasters-repair-jobs',
    repairCommand: 'replay projection from ledger and object roots, then emit repaired database root',
    driftDetectionPolicy: 'compare canonical database projection root against ledger-derived and object-storage roots',
    unsafeDriftPosture: 'blocks_projection_until_repaired',
    unlockBlockingPolicy: 'interface read models and source unlock stay blocked when database projection drift is unrepaired',
    auditEventName: 'runtime_observer.database_projection_repair',
    proofRootBasis: ['DeploymentStoragePosture', 'SupabaseReadbackReceipt', 'databaseProjectionRoot'],
  },
  {
    jobId: 'object_storage_repair',
    label: 'object-storage repair job',
    jobClass: 'object_storage_repair',
    ownerPackage: 'packages/btd',
    requiredHostIds: ['object_storage', 'repair_jobs'],
    supportedLaneIds: nonValueLanes,
    observerId: 'observer.object_storage.materialization',
    broadcasterId: 'broadcaster.object_storage.repair_event',
    repairJobId: 'repair.object_storage_materialization',
    trigger: 'preview, proof, rollback, or source-bearing AssetPack object root is missing or stale',
    queueName: 'object-storage-repair-queue',
    runtimeReceiptPolicy: 'requires object_storage_write or repair_job receipt with object storage and proof roots',
    receiptWorkKinds: ['object_storage_write', 'repair_job'],
    validationCommand: 'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/deployment-storage-posture.test.ts',
    replayCommand: 'pnpm run check:v34-runtime-observers-broadcasters-repair-jobs',
    repairCommand: 'rewrite object from authorized artifact root while preserving paid-only source visibility',
    driftDetectionPolicy: 'compare object storage root, proof artifact root, and source-bearing AssetPack lock state',
    unsafeDriftPosture: 'blocks_delivery_until_repaired',
    unlockBlockingPolicy: 'AssetPack source delivery stays blocked when object storage root is absent, stale, or source-unsafe',
    auditEventName: 'runtime_observer.object_storage_repair',
    proofRootBasis: ['DeploymentStoragePosture', 'AssetPackPreview', 'objectStorageRoot'],
  },
  {
    jobId: 'generated_proof_job',
    label: 'generated proof job',
    jobClass: 'generated_proof_job',
    ownerPackage: 'scripts/specifying',
    requiredHostIds: ['proof_services', 'repair_jobs'],
    supportedLaneIds: nonValueLanes,
    observerId: 'observer.generated_proof.freshness',
    broadcasterId: 'broadcaster.proof_artifact.ready',
    repairJobId: 'repair.generated_proof_artifact',
    trigger: 'generated proof artifact root is stale, missing, or out of canonical-input alignment',
    queueName: 'generated-proof-job-queue',
    runtimeReceiptPolicy: 'requires proof_generation receipt and repair_job receipt when generated artifact drift is repaired',
    receiptWorkKinds: ['proof_generation', 'repair_job'],
    validationCommand: 'node scripts/check-bitcode-spec-family.mjs --version V34 --mode draft --current-target V33',
    replayCommand: 'pnpm run check:v34-runtime-observers-broadcasters-repair-jobs',
    repairCommand: 'regenerate source-safe proof artifact from canonical inputs and record proof root',
    driftDetectionPolicy: 'compare generated artifact root with canonical input root and spec-family root',
    unsafeDriftPosture: 'blocks_projection_until_repaired',
    unlockBlockingPolicy: 'promotion and deployment admission stay blocked when proof artifacts are stale',
    auditEventName: 'runtime_observer.generated_proof_job',
    proofRootBasis: ['BITCODE_SPEC_V34.md', 'v34-canonical-input-report', 'v34-spec-family-report'],
  },
  {
    jobId: 'queue_consumer',
    label: 'distributed queue consumer job',
    jobClass: 'queue_consumer',
    ownerPackage: 'packages/pipeline-hosts',
    requiredHostIds: ['pipeline_workers', 'runtime_observers', 'repair_jobs'],
    supportedLaneIds: nonValueLanes,
    observerId: 'observer.queue.consumer_liveness',
    broadcasterId: 'broadcaster.queue.dead_letter_repair',
    repairJobId: 'repair.queue_consumer_replay',
    trigger: 'detached pipeline, observer, broadcaster, or repair job queued work is delayed or dead-lettered',
    queueName: 'deployment-runtime-work-queue',
    runtimeReceiptPolicy: 'requires tool_call or repair_job receipt with input, output, log, and proof roots',
    receiptWorkKinds: ['tool_call', 'repair_job'],
    validationCommand: 'pnpm --filter @bitcode/pipeline-hosts exec jest --config jest.config.cjs --runTestsByPath src/__tests__/distributed-execution-runtime-receipt.test.ts --runInBand',
    replayCommand: 'pnpm run check:v34-runtime-observers-broadcasters-repair-jobs',
    repairCommand: 'replay queued work from source-safe input root and preserve original execution root lineage',
    driftDetectionPolicy: 'compare queue input root, receipt completion root, dead-letter root, and repair root',
    unsafeDriftPosture: 'blocks_projection_until_repaired',
    unlockBlockingPolicy: 'dependent read models, proof generation, and delivery remain blocked when queue work is unrepaired',
    auditEventName: 'runtime_observer.queue_consumer',
    proofRootBasis: ['DistributedExecutionRuntimeReceipt', 'request_response_not_required', 'repair_job'],
  },
]);

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function fileExists(relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

function stableRoot(prefix, parts) {
  const hash = createHash('sha256').update(parts.join('\u001f')).digest('hex').slice(0, 24);
  return `${prefix}:${hash}`;
}

function sourceDigest(relativePath) {
  return createHash('sha256').update(read(relativePath)).digest('hex');
}

function buildTokenEvidence(relativePath, tokens) {
  const content = fileExists(relativePath) ? read(relativePath) : '';
  return {
    path: relativePath,
    digest: fileExists(relativePath) ? sourceDigest(relativePath) : null,
    requiredTokens: tokens.map((token) => ({ token, present: content.includes(token) })),
  };
}

function buildJob(row) {
  return {
    kind: 'bitcode.runtime_observer_repair_job',
    ...row,
    supportedLaneIds: [...row.supportedLaneIds],
    requiredHostIds: [...row.requiredHostIds],
    receiptWorkKinds: [...row.receiptWorkKinds],
    proofRootBasis: [...row.proofRootBasis],
    sourceSafety: {
      sourceSafe: true,
      protectedSourceVisible: false,
      containsProtectedSource: false,
      containsSecret: false,
    },
    jobRoot: stableRoot('v34-runtime-observer-repair-job', [
      row.jobId,
      row.label,
      row.jobClass,
      row.ownerPackage,
      row.requiredHostIds.join(','),
      row.supportedLaneIds.join(','),
      row.observerId,
      row.broadcasterId,
      row.repairJobId,
      row.trigger,
      row.queueName,
      row.runtimeReceiptPolicy,
      row.receiptWorkKinds.join(','),
      row.validationCommand,
      row.replayCommand,
      row.repairCommand,
      row.driftDetectionPolicy,
      row.unsafeDriftPosture,
      row.unlockBlockingPolicy,
      row.auditEventName,
      row.proofRootBasis.join(','),
    ]),
  };
}

function buildArtifact() {
  const jobs = jobRows.map(buildJob);
  const observedJobIds = [...new Set(jobs.map((job) => job.jobId))].sort();
  const missingJobIds = requiredJobIds.filter((jobId) => !observedJobIds.includes(jobId));
  const sourceEvidence = [
    buildTokenEvidence('packages/btd/src/runtime-observer-repair-job.ts', [
      'RUNTIME_OBSERVER_REPAIR_JOB_IDS',
      'buildRuntimeObserverRepairJobSet',
      'unsafeDriftBlocksUnlock',
      'valueBearingMainnetBlocked',
      'noSerializedSecretValues',
    ]),
    buildTokenEvidence('packages/btd/__tests__/runtime-observer-repair-job.test.ts', [
      'fails closed when a required job is missing',
      'fails closed when value-bearing mainnet is admitted',
      'fails closed when unsafe drift does not block a boundary',
      'fails closed on serialized secret-shaped values',
    ]),
  ];
  const docsEvidence = [
    buildTokenEvidence('BITCODE_SPEC_V34.md', ['RuntimeObserverRepairJob', ARTIFACT_PATH]),
    buildTokenEvidence('BITCODE_SPEC_V34_DELTA.md', ['RuntimeObserverRepairJob', ARTIFACT_PATH]),
    buildTokenEvidence('BITCODE_SPEC_V34_PARITY_MATRIX.md', ['RuntimeObserverRepairJob', ARTIFACT_PATH]),
    buildTokenEvidence('SPECIFICATIONS_ROADMAP.md', ['V34 Gate 7 closure anchor']),
  ];
  const workflowEvidence = [
    buildTokenEvidence('.github/workflows/bitcode-gate-quality.yml', [
      'check-v34-gate7-runtime-observers-broadcasters-repair-jobs.mjs',
      'runtime-observer-repair-job.test.ts',
    ]),
  ];
  const proofSourceCommit = stableRoot('proof-source', [
    ...sourceEvidence.map((entry) => entry.digest ?? entry.path),
    ...docsEvidence.map((entry) => entry.digest ?? entry.path),
    ...workflowEvidence.map((entry) => entry.digest ?? entry.path),
  ]);

  return {
    artifactId: 'v34-runtime-observers-broadcasters-repair-jobs',
    schemaId: 'bitcode.v34.runtimeObserversBroadcastersRepairJobs.v1',
    generatedAt: GENERATED_AT,
    version: 'V34',
    currentTarget: 'V33',
    sourceSafetyVerdict: 'source-safe-runtime-observer-repair-job-metadata',
    proofSourceCommit,
    validationCommand: 'pnpm run check:v34-runtime-observers-broadcasters-repair-jobs',
    passed: missingJobIds.length === 0,
    requiredJobIds: [...requiredJobIds],
    coverage: {
      jobCount: jobs.length,
      observedJobIds,
      missingJobIds,
      settlementObserversCovered: jobs.some((job) => job.jobClass === 'settlement_observer'),
      ledgerBroadcastersCovered: jobs.some((job) => job.jobClass === 'ledger_broadcaster'),
      finalityWatchersCovered: jobs.some((job) => job.jobClass === 'finality_watcher'),
      databaseProjectionRepairCovered: jobs.some((job) => job.jobClass === 'database_projection_repair'),
      objectStorageRepairCovered: jobs.some((job) => job.jobClass === 'object_storage_repair'),
      generatedProofJobsCovered: jobs.some((job) => job.jobClass === 'generated_proof_job'),
      queueConsumersCovered: jobs.some((job) => job.jobClass === 'queue_consumer'),
      runtimeReceiptsCovered: jobs.every((job) => job.receiptWorkKinds.length > 0),
      laneContractsCovered: jobs.every((job) => job.supportedLaneIds.every((laneId) => laneId !== 'value-bearing-mainnet')),
      replayCommandsCovered: jobs.every((job) => job.replayCommand.length > 0),
      repairCommandsCovered: jobs.every((job) => job.repairCommand.length > 0),
      unsafeDriftBlocksUnlock: jobs.every((job) => job.unsafeDriftPosture.startsWith('blocks_')),
      proofRootsCovered: jobs.every((job) => job.proofRootBasis.length > 0),
      valueBearingMainnetAdmitted: jobs.some((job) => job.supportedLaneIds.includes('value-bearing-mainnet')),
      credentialsSerialized: false,
      protectedSourceVisible: false,
    },
    artifactRoot: stableRoot('v34-runtime-observers-broadcasters-repair-jobs', [
      ...jobs.map((job) => job.jobRoot),
      ...sourceEvidence.map((entry) => entry.digest ?? entry.path),
      ...docsEvidence.map((entry) => entry.digest ?? entry.path),
    ]),
    jobs,
    sourceEvidence,
    docsEvidence,
    workflowEvidence,
  };
}

function assertSourceSafe(serialized) {
  for (const marker of secretMarkers) {
    if (serialized.includes(marker)) {
      throw new Error(`Generated artifact includes forbidden source/secret marker: ${marker}`);
    }
  }
  if (/\b[A-Z][A-Z0-9_]{2,}\s*=\s*[^<\s][^\s]*/u.test(serialized)) {
    throw new Error('Generated artifact includes env-assignment-shaped text.');
  }
}

function writeArtifact(artifact) {
  const outputPath = path.join(repoRoot, ARTIFACT_PATH);
  mkdirSync(path.dirname(outputPath), { recursive: true });
  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
  assertSourceSafe(serialized);
  writeFileSync(outputPath, serialized);
}

function main() {
  const check = process.argv.includes('--check');
  const artifact = buildArtifact();
  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
  assertSourceSafe(serialized);

  if (check) {
    const existingPath = path.join(repoRoot, ARTIFACT_PATH);
    if (!existsSync(existingPath)) {
      throw new Error(`${ARTIFACT_PATH} is missing. Run pnpm run generate:v34-runtime-observers-broadcasters-repair-jobs.`);
    }
    const existing = readFileSync(existingPath, 'utf8');
    if (existing !== serialized) {
      throw new Error(`${ARTIFACT_PATH} is stale. Run pnpm run generate:v34-runtime-observers-broadcasters-repair-jobs.`);
    }
    process.stdout.write(`${ARTIFACT_PATH} is current.\n`);
    return;
  }

  writeArtifact(artifact);
  process.stdout.write(`Wrote ${ARTIFACT_PATH}\n`);
}

main();
