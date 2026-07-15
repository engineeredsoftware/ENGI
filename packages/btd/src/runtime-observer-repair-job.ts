import { createHash } from 'crypto';
import { assertNonEmptyString } from './constants';
import {
  DEPLOYMENT_HOST_CAPABILITY_IDS,
  ENVIRONMENT_LANE_CONTRACT_IDS,
  type DeploymentHostCapabilityId,
  type EnvironmentLaneContractId,
} from './deployment-host-capability-catalog';
import type { BtdProtocolTelemetrySourceSafety } from './telemetry';

export const RUNTIME_OBSERVER_REPAIR_JOB_IDS = [
  'settlement_observer',
  'ledger_broadcaster',
  'finality_watcher',
  'database_projection_repair',
  'object_storage_repair',
  'generated_proof_job',
  'queue_consumer',
] as const;

export type RuntimeObserverRepairJobId = (typeof RUNTIME_OBSERVER_REPAIR_JOB_IDS)[number];

export type RuntimeObserverRepairJobClass =
  | 'settlement_observer'
  | 'ledger_broadcaster'
  | 'finality_watcher'
  | 'database_projection_repair'
  | 'object_storage_repair'
  | 'generated_proof_job'
  | 'queue_consumer';

export type RuntimeObserverReceiptWorkKind =
  | 'ledger_operation'
  | 'wallet_operation'
  | 'proof_generation'
  | 'object_storage_write'
  | 'repair_job'
  | 'tool_call';

export type RuntimeObserverDriftPosture =
  | 'blocks_unlock_until_repaired'
  | 'blocks_delivery_until_repaired'
  | 'blocks_broadcast_until_repaired'
  | 'blocks_projection_until_repaired';

export interface RuntimeObserverRepairJobInput {
  jobId: RuntimeObserverRepairJobId;
  label: string;
  jobClass: RuntimeObserverRepairJobClass;
  ownerPackage: string;
  requiredHostIds: readonly DeploymentHostCapabilityId[];
  supportedLaneIds: readonly EnvironmentLaneContractId[];
  observerId: string;
  broadcasterId: string;
  repairJobId: string;
  trigger: string;
  queueName: string;
  runtimeReceiptPolicy: string;
  receiptWorkKinds: readonly RuntimeObserverReceiptWorkKind[];
  validationCommand: string;
  replayCommand: string;
  repairCommand: string;
  driftDetectionPolicy: string;
  unsafeDriftPosture: RuntimeObserverDriftPosture;
  unlockBlockingPolicy: string;
  auditEventName: string;
  proofRootBasis: readonly string[];
}

export interface RuntimeObserverRepairJob extends RuntimeObserverRepairJobInput {
  kind: 'bitcode.runtime_observer_repair_job';
  requiredHostIds: DeploymentHostCapabilityId[];
  supportedLaneIds: EnvironmentLaneContractId[];
  receiptWorkKinds: RuntimeObserverReceiptWorkKind[];
  proofRootBasis: string[];
  jobRoot: string;
  sourceSafety: BtdProtocolTelemetrySourceSafety;
}

export interface RuntimeObserverRepairJobSetInput {
  jobs?: readonly RuntimeObserverRepairJobInput[];
  requiredJobIds?: readonly RuntimeObserverRepairJobId[];
}

export interface RuntimeObserverRepairJobSet {
  kind: 'bitcode.runtime_observer_repair_job_set';
  schemaId: 'bitcode.runtimeObserverRepairJobSet.v1';
  jobSetRoot: string;
  jobCount: number;
  requiredJobIds: RuntimeObserverRepairJobId[];
  observedJobIds: RuntimeObserverRepairJobId[];
  missingJobIds: RuntimeObserverRepairJobId[];
  jobs: RuntimeObserverRepairJob[];
  settlementObserversCovered: true;
  ledgerBroadcastersCovered: true;
  finalityWatchersCovered: true;
  databaseProjectionRepairCovered: true;
  objectStorageRepairCovered: true;
  generatedProofJobsCovered: true;
  queueConsumersCovered: true;
  runtimeReceiptsCovered: true;
  laneContractsCovered: true;
  replayCommandsCovered: true;
  repairCommandsCovered: true;
  unsafeDriftBlocksUnlock: true;
  proofRootsCovered: true;
  noSerializedSecretValues: true;
  valueBearingMainnetBlocked: true;
  sourceSafety: BtdProtocolTelemetrySourceSafety;
}

export const RUNTIME_OBSERVER_REPAIR_JOB_REQUIRED_FIELDS = [
  'jobClass',
  'ownerPackage',
  'requiredHostIds',
  'supportedLaneIds',
  'observerId',
  'broadcasterId',
  'repairJobId',
  'trigger',
  'queueName',
  'runtimeReceiptPolicy',
  'receiptWorkKinds',
  'validationCommand',
  'replayCommand',
  'repairCommand',
  'driftDetectionPolicy',
  'unsafeDriftPosture',
  'unlockBlockingPolicy',
  'auditEventName',
  'proofRootBasis',
] as const;

const SOURCE_SAFETY: BtdProtocolTelemetrySourceSafety = {
  sourceSafe: true,
  protectedSourceVisible: false,
  containsProtectedSource: false,
  containsSecret: false,
};

const NON_VALUE_LANES: EnvironmentLaneContractId[] = [
  'local',
  'regtest',
  'signet',
  'staging-testnet',
  'public-testnet',
  'mainnet-ready-dry-run',
];

const RECEIPT_WORK_KINDS: RuntimeObserverReceiptWorkKind[] = [
  'ledger_operation',
  'wallet_operation',
  'proof_generation',
  'object_storage_write',
  'repair_job',
  'tool_call',
];

const UNSAFE_DRIFT_POSTURES: RuntimeObserverDriftPosture[] = [
  'blocks_unlock_until_repaired',
  'blocks_delivery_until_repaired',
  'blocks_broadcast_until_repaired',
  'blocks_projection_until_repaired',
];

const SECRET_OR_SOURCE_PATTERNS = [
  new RegExp(`${['sb', 'secret'].join('_')}__`, 'iu'),
  /\bsk-(?:proj|live|test)?[-_A-Za-z0-9]{16,}\b/u,
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/u,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/u,
  /\bprivate\s+key\b/iu,
  /\bwallet\s+seed\b/iu,
  /\bmnemonic\b/iu,
  /\braw\s+source\b/iu,
  /\bsource\s+contents\b/iu,
  /\b[A-Z][A-Z0-9_]{2,}\s*=\s*[^<\s][^\s]*/u,
];

export function buildRuntimeObserverRepairJobRows(): RuntimeObserverRepairJobInput[] {
  return [
    {
      jobId: 'settlement_observer',
      label: 'settlement observer job',
      jobClass: 'settlement_observer',
      ownerPackage: 'packages/btd',
      requiredHostIds: ['runtime_observers', 'ledger_projection', 'database_projection'],
      supportedLaneIds: NON_VALUE_LANES,
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
      supportedLaneIds: NON_VALUE_LANES,
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
      supportedLaneIds: NON_VALUE_LANES,
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
      supportedLaneIds: NON_VALUE_LANES,
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
      supportedLaneIds: NON_VALUE_LANES,
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
      supportedLaneIds: NON_VALUE_LANES,
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
      proofRootBasis: ['specifications/BITCODE_SPEC_V34.md', 'v34-canonical-input-report', 'v34-spec-family-report'],
    },
    {
      jobId: 'queue_consumer',
      label: 'distributed queue consumer job',
      jobClass: 'queue_consumer',
      ownerPackage: 'packages/pipeline-hosts',
      requiredHostIds: ['pipeline_workers', 'runtime_observers', 'repair_jobs'],
      supportedLaneIds: NON_VALUE_LANES,
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
  ];
}

export function buildRuntimeObserverRepairJob(
  input: RuntimeObserverRepairJobInput,
): RuntimeObserverRepairJob {
  const jobId = assertRuntimeObserverRepairJobId(input.jobId);
  const jobClass = assertJobClass(input.jobClass);
  const requiredHostIds = input.requiredHostIds.map(assertDeploymentHostCapabilityId);
  const supportedLaneIds = input.supportedLaneIds.map(assertEnvironmentLaneContractId);
  const receiptWorkKinds = input.receiptWorkKinds.map(assertReceiptWorkKind);
  const unsafeDriftPosture = assertUnsafeDriftPosture(input.unsafeDriftPosture);

  const job = {
    kind: 'bitcode.runtime_observer_repair_job' as const,
    jobId,
    label: assertSourceSafeString(input.label, 'label'),
    jobClass,
    ownerPackage: assertSourceSafeString(input.ownerPackage, 'ownerPackage'),
    requiredHostIds,
    supportedLaneIds,
    observerId: assertSourceSafeString(input.observerId, 'observerId'),
    broadcasterId: assertSourceSafeString(input.broadcasterId, 'broadcasterId'),
    repairJobId: assertSourceSafeString(input.repairJobId, 'repairJobId'),
    trigger: assertSourceSafeString(input.trigger, 'trigger'),
    queueName: assertSourceSafeString(input.queueName, 'queueName'),
    runtimeReceiptPolicy: assertSourceSafeString(input.runtimeReceiptPolicy, 'runtimeReceiptPolicy'),
    receiptWorkKinds,
    validationCommand: assertSourceSafeString(input.validationCommand, 'validationCommand'),
    replayCommand: assertSourceSafeString(input.replayCommand, 'replayCommand'),
    repairCommand: assertSourceSafeString(input.repairCommand, 'repairCommand'),
    driftDetectionPolicy: assertSourceSafeString(input.driftDetectionPolicy, 'driftDetectionPolicy'),
    unsafeDriftPosture,
    unlockBlockingPolicy: assertSourceSafeString(input.unlockBlockingPolicy, 'unlockBlockingPolicy'),
    auditEventName: assertSourceSafeString(input.auditEventName, 'auditEventName'),
    proofRootBasis: input.proofRootBasis.map((basis) => assertSourceSafeString(basis, 'proofRootBasis')),
    sourceSafety: SOURCE_SAFETY,
  };

  assertJobInvariants(job);

  return {
    ...job,
    jobRoot: stableRoot('v34-runtime-observer-repair-job', [
      job.jobId,
      job.label,
      job.jobClass,
      job.ownerPackage,
      job.requiredHostIds.join(','),
      job.supportedLaneIds.join(','),
      job.observerId,
      job.broadcasterId,
      job.repairJobId,
      job.trigger,
      job.queueName,
      job.runtimeReceiptPolicy,
      job.receiptWorkKinds.join(','),
      job.validationCommand,
      job.replayCommand,
      job.repairCommand,
      job.driftDetectionPolicy,
      job.unsafeDriftPosture,
      job.unlockBlockingPolicy,
      job.auditEventName,
      job.proofRootBasis.join(','),
    ]),
  };
}

export function buildRuntimeObserverRepairJobSet(
  input: RuntimeObserverRepairJobSetInput = {},
): RuntimeObserverRepairJobSet {
  const requiredJobIds = [...(input.requiredJobIds ?? RUNTIME_OBSERVER_REPAIR_JOB_IDS)];
  const jobs = (input.jobs ?? buildRuntimeObserverRepairJobRows()).map(buildRuntimeObserverRepairJob);
  const observedJobIds = Array.from(new Set(jobs.map((job) => job.jobId))).sort();
  const missingJobIds = requiredJobIds.filter((jobId) => !observedJobIds.includes(jobId));
  const duplicateJobIds = findDuplicates(jobs.map((job) => job.jobId));

  if (missingJobIds.length) {
    throw new Error(`Runtime observer repair jobs missing required jobs: ${missingJobIds.join(', ')}.`);
  }
  if (duplicateJobIds.length) {
    throw new Error(`Runtime observer repair jobs contain duplicate job ids: ${duplicateJobIds.join(', ')}.`);
  }

  const hasJobClass = (jobClass: RuntimeObserverRepairJobClass) =>
    jobs.some((job) => job.jobClass === jobClass);
  const allHaveRuntimeReceipts = jobs.every((job) => job.receiptWorkKinds.length > 0);
  const allHaveLaneContracts = jobs.every((job) =>
    job.supportedLaneIds.length > 0 &&
    job.supportedLaneIds.every((laneId) => laneId !== 'value-bearing-mainnet'),
  );
  const allHaveReplayCommands = jobs.every((job) => job.replayCommand.length > 0);
  const allHaveRepairCommands = jobs.every((job) => job.repairCommand.length > 0);
  const allBlockUnsafeDrift = jobs.every((job) => job.unsafeDriftPosture.startsWith('blocks_'));
  const allHaveProofRoots = jobs.every((job) => job.proofRootBasis.length > 0);

  if (!hasJobClass('settlement_observer')) throw new Error('Settlement observer job is required.');
  if (!hasJobClass('ledger_broadcaster')) throw new Error('Ledger broadcaster job is required.');
  if (!hasJobClass('finality_watcher')) throw new Error('Finality watcher job is required.');
  if (!hasJobClass('database_projection_repair')) throw new Error('Database projection repair job is required.');
  if (!hasJobClass('object_storage_repair')) throw new Error('Object-storage repair job is required.');
  if (!hasJobClass('generated_proof_job')) throw new Error('Generated proof job is required.');
  if (!hasJobClass('queue_consumer')) throw new Error('Queue consumer job is required.');
  if (!allHaveRuntimeReceipts) throw new Error('Runtime observer repair jobs require runtime receipt work kinds.');
  if (!allHaveLaneContracts) throw new Error('Runtime observer repair jobs must bind only non-value lane contracts.');
  if (!allHaveReplayCommands) throw new Error('Runtime observer repair jobs require replay commands.');
  if (!allHaveRepairCommands) throw new Error('Runtime observer repair jobs require repair commands.');
  if (!allBlockUnsafeDrift) throw new Error('Runtime observer repair jobs must block unsafe drift.');
  if (!allHaveProofRoots) throw new Error('Runtime observer repair jobs require proof roots.');

  return {
    kind: 'bitcode.runtime_observer_repair_job_set',
    schemaId: 'bitcode.runtimeObserverRepairJobSet.v1',
    jobSetRoot: stableRoot('v34-runtime-observer-repair-job-set', [
      ...jobs.map((job) => job.jobRoot),
      requiredJobIds.join(','),
    ]),
    jobCount: jobs.length,
    requiredJobIds,
    observedJobIds,
    missingJobIds,
    jobs,
    settlementObserversCovered: true,
    ledgerBroadcastersCovered: true,
    finalityWatchersCovered: true,
    databaseProjectionRepairCovered: true,
    objectStorageRepairCovered: true,
    generatedProofJobsCovered: true,
    queueConsumersCovered: true,
    runtimeReceiptsCovered: true,
    laneContractsCovered: true,
    replayCommandsCovered: true,
    repairCommandsCovered: true,
    unsafeDriftBlocksUnlock: true,
    proofRootsCovered: true,
    noSerializedSecretValues: true,
    valueBearingMainnetBlocked: true,
    sourceSafety: SOURCE_SAFETY,
  };
}

function assertJobInvariants(
  job: Omit<RuntimeObserverRepairJob, 'jobRoot'>,
): void {
  for (const field of RUNTIME_OBSERVER_REPAIR_JOB_REQUIRED_FIELDS) {
    const value = job[field];
    if (Array.isArray(value)) {
      if (value.length === 0) throw new Error(`${field} must not be empty.`);
      continue;
    }
    assertNonEmptyString(value, field);
  }

  if (job.supportedLaneIds.includes('value-bearing-mainnet')) {
    throw new Error('Runtime observer repair jobs must not admit value-bearing mainnet.');
  }
  if (job.requiredHostIds.length === 0) {
    throw new Error('Runtime observer repair jobs require host capability ids.');
  }
  if (job.receiptWorkKinds.length === 0) {
    throw new Error('Runtime observer repair jobs require receipt work kinds.');
  }
  if (!job.unsafeDriftPosture.startsWith('blocks_')) {
    throw new Error('Unsafe drift must block unlock, delivery, broadcast, or projection until repaired.');
  }
  if (!/repair|replay|regenerate|rewrite|recompute|refresh/iu.test(job.repairCommand)) {
    throw new Error('Runtime observer repair jobs require explicit repair commands.');
  }
  if (!/receipt|root/iu.test(job.runtimeReceiptPolicy)) {
    throw new Error('Runtime observer repair jobs require receipt/root policy.');
  }
}

function assertRuntimeObserverRepairJobId(jobId: string): RuntimeObserverRepairJobId {
  if (!RUNTIME_OBSERVER_REPAIR_JOB_IDS.includes(jobId as RuntimeObserverRepairJobId)) {
    throw new Error(`Unsupported runtime observer repair job id: ${jobId}.`);
  }

  return jobId as RuntimeObserverRepairJobId;
}

function assertJobClass(jobClass: string): RuntimeObserverRepairJobClass {
  if (!RUNTIME_OBSERVER_REPAIR_JOB_IDS.includes(jobClass as RuntimeObserverRepairJobId)) {
    throw new Error(`Unsupported runtime observer repair job class: ${jobClass}.`);
  }

  return jobClass as RuntimeObserverRepairJobClass;
}

function assertReceiptWorkKind(workKind: string): RuntimeObserverReceiptWorkKind {
  if (!RECEIPT_WORK_KINDS.includes(workKind as RuntimeObserverReceiptWorkKind)) {
    throw new Error(`Unsupported runtime observer receipt work kind: ${workKind}.`);
  }

  return workKind as RuntimeObserverReceiptWorkKind;
}

function assertUnsafeDriftPosture(posture: string): RuntimeObserverDriftPosture {
  if (!UNSAFE_DRIFT_POSTURES.includes(posture as RuntimeObserverDriftPosture)) {
    throw new Error(`Unsupported runtime observer drift posture: ${posture}.`);
  }

  return posture as RuntimeObserverDriftPosture;
}

function assertDeploymentHostCapabilityId(hostId: string): DeploymentHostCapabilityId {
  if (!DEPLOYMENT_HOST_CAPABILITY_IDS.includes(hostId as DeploymentHostCapabilityId)) {
    throw new Error(`Unsupported deployment host capability id: ${hostId}.`);
  }

  return hostId as DeploymentHostCapabilityId;
}

function assertEnvironmentLaneContractId(laneId: string): EnvironmentLaneContractId {
  if (!ENVIRONMENT_LANE_CONTRACT_IDS.includes(laneId as EnvironmentLaneContractId)) {
    throw new Error(`Unsupported environment lane contract id: ${laneId}.`);
  }

  return laneId as EnvironmentLaneContractId;
}

function assertSourceSafeString(value: string, label: string): string {
  const normalized = assertNonEmptyString(value, label).trim();
  for (const pattern of SECRET_OR_SOURCE_PATTERNS) {
    if (pattern.test(normalized)) {
      throw new Error(`${label} must be source-safe runtime observer repair metadata.`);
    }
  }

  return normalized;
}

function stableRoot(prefix: string, parts: readonly string[]): string {
  const digest = createHash('sha256').update(parts.join('\u001f')).digest('hex').slice(0, 24);
  return `${prefix}:${digest}`;
}

function findDuplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    else seen.add(value);
  }

  return [...duplicates].sort();
}
