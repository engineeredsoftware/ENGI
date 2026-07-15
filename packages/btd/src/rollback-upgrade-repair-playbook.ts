import { createHash } from 'crypto';
import { assertNonEmptyString } from './constants';
import {
  DEPLOYMENT_HOST_CAPABILITY_IDS,
  ENVIRONMENT_LANE_CONTRACT_IDS,
  type DeploymentHostCapabilityId,
  type EnvironmentLaneContractId,
} from './deployment-host-capability-catalog';
import type { BtdProtocolTelemetrySourceSafety } from './telemetry';

export const ROLLBACK_UPGRADE_REPAIR_PLAYBOOK_IDS = [
  'deployment_rollback',
  'deployment_upgrade',
  'migration_rollback',
  'object_storage_repair',
  'database_repair',
  'ledger_projection_repair',
  'secret_rotation_incident_response',
  'generated_artifact_repair',
] as const;

export type RollbackUpgradeRepairPlaybookId =
  (typeof ROLLBACK_UPGRADE_REPAIR_PLAYBOOK_IDS)[number];

export type RollbackUpgradeRepairPlaybookClass =
  | 'rollback'
  | 'upgrade'
  | 'migration_rollback'
  | 'object_storage_repair'
  | 'database_repair'
  | 'ledger_projection_repair'
  | 'secret_rotation_incident_response'
  | 'generated_artifact_repair';

export interface RollbackUpgradeRepairPlaybookInput {
  playbookId: RollbackUpgradeRepairPlaybookId;
  label: string;
  playbookClass: RollbackUpgradeRepairPlaybookClass;
  ownerPackage: string;
  requiredHostIds: readonly DeploymentHostCapabilityId[];
  supportedLaneIds: readonly EnvironmentLaneContractId[];
  stateCarriers: readonly string[];
  entryCondition: string;
  operatorApproval: string;
  commandSequence: readonly string[];
  verificationCommands: readonly string[];
  proofRootBasis: readonly string[];
  failClosedResult: string;
  recoveryBoundary: string;
  auditEventName: string;
}

export interface RollbackUpgradeRepairPlaybook extends RollbackUpgradeRepairPlaybookInput {
  kind: 'bitcode.rollback_upgrade_repair_playbook';
  requiredHostIds: DeploymentHostCapabilityId[];
  supportedLaneIds: EnvironmentLaneContractId[];
  stateCarriers: string[];
  commandSequence: string[];
  verificationCommands: string[];
  proofRootBasis: string[];
  playbookRoot: string;
  sourceSafety: BtdProtocolTelemetrySourceSafety;
}

export interface RollbackUpgradeRepairPlaybookSetInput {
  playbooks?: readonly RollbackUpgradeRepairPlaybookInput[];
  requiredPlaybookIds?: readonly RollbackUpgradeRepairPlaybookId[];
}

export interface RollbackUpgradeRepairPlaybookSet {
  kind: 'bitcode.rollback_upgrade_repair_playbook_set';
  schemaId: 'bitcode.rollbackUpgradeRepairPlaybookSet.v1';
  playbookSetRoot: string;
  playbookCount: number;
  requiredPlaybookIds: RollbackUpgradeRepairPlaybookId[];
  observedPlaybookIds: RollbackUpgradeRepairPlaybookId[];
  missingPlaybookIds: RollbackUpgradeRepairPlaybookId[];
  playbooks: RollbackUpgradeRepairPlaybook[];
  rollbackCovered: true;
  upgradeCovered: true;
  migrationRollbackCovered: true;
  objectStorageRepairCovered: true;
  databaseRepairCovered: true;
  ledgerProjectionRepairCovered: true;
  secretRotationIncidentResponseCovered: true;
  generatedArtifactRepairCovered: true;
  operatorApprovalsCovered: true;
  commandsCovered: true;
  verificationCovered: true;
  proofRootsCovered: true;
  failClosedResultsCovered: true;
  noSerializedSecretValues: true;
  valueBearingMainnetBlocked: true;
  sourceSafety: BtdProtocolTelemetrySourceSafety;
}

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

const PLAYBOOK_CLASSES: RollbackUpgradeRepairPlaybookClass[] = [
  'rollback',
  'upgrade',
  'migration_rollback',
  'object_storage_repair',
  'database_repair',
  'ledger_projection_repair',
  'secret_rotation_incident_response',
  'generated_artifact_repair',
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

export function buildRollbackUpgradeRepairPlaybookRows(): RollbackUpgradeRepairPlaybookInput[] {
  return [
    row('deployment_rollback', 'deployment rollback playbook', 'rollback', 'apps/uapi', ['website', 'api'], ['deployment alias', 'runtime receipts'], 'preview or production lane deployment fails health or proof checks', ['freeze traffic promotion', 'revert deployment alias', 'replay gate-quality checks'], ['pnpm run check:v34-gate8'], ['Vercel lane root', 'DeploymentHostCapabilityCatalog'], 'traffic stays blocked from the failed deployment until rollback proof root is recorded', 'deployment boundary'),
    row('deployment_upgrade', 'deployment upgrade playbook', 'upgrade', 'root-workspace', ['website', 'api', 'pipeline_workers'], ['version branch', 'workflow run', 'generated artifacts'], 'version branch is ready for promotion rehearsal without value-bearing mainnet admission', ['freeze version branch', 'run promotion dry-run', 'verify generated artifacts'], ['pnpm run check:v34-gate8'], ['specifications/BITCODE_SPEC_V34.md', 'promotion workflow'], 'upgrade remains blocked until all promotion dry-run roots verify', 'version promotion boundary'),
    row('migration_rollback', 'schema migration rollback playbook', 'migration_rollback', 'packages/orm', ['database_projection', 'repair_jobs'], ['migration file', 'generated database types', 'database projection'], 'schema migration dry-run or lane readback fails after approval', ['freeze writes', 'revert migration', 'refresh generated types', 'replay database health'], ['pnpm run db:schema-types:check'], ['MigrationApprovalGate', 'SupabaseReadbackReceipt'], 'database writes and unlock stay blocked until schema and type roots repair', 'database schema boundary'),
    row('object_storage_repair', 'object-storage repair playbook', 'object_storage_repair', 'packages/btd', ['object_storage', 'repair_jobs'], ['object storage root', 'proof artifact root', 'AssetPack lock'], 'object storage root is missing, stale, or violates paid-only delivery posture', ['lock delivery', 'rewrite object from authorized artifact root', 'verify proof root'], ['pnpm run check:v34-gate4'], ['DeploymentStoragePosture', 'objectStorageRoot'], 'source-bearing AssetPack delivery stays blocked until object repair root matches proof root', 'object-storage boundary'),
    row('database_repair', 'database repair playbook', 'database_repair', 'packages/orm', ['database_projection', 'repair_jobs'], ['database projection root', 'ledger-derived root', 'audit event'], 'database projection drift is detected by observer or readback', ['freeze affected read model', 'replay projection from ledger root', 'verify data health'], ['pnpm run db:data-health:ci'], ['DeploymentStoragePosture', 'databaseProjectionRoot'], 'interfaces show blocked repair posture until database projection root verifies', 'database projection boundary'),
    row('ledger_projection_repair', 'ledger projection repair playbook', 'ledger_projection_repair', 'packages/btd', ['ledger_projection', 'repair_jobs'], ['ledger projection root', 'settlement root', 'rights root'], 'ledger projection conflicts with settlement, finality, or BTD rights state', ['freeze unlock', 'replay ledger projection', 'verify settlement and rights roots'], ['pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/reconciliation.test.ts'], ['SettlementUnlock', 'BtdRightsTransferReceipt'], 'rights transfer and delivery stay blocked until ledger projection root repairs', 'ledger projection boundary'),
    row('secret_rotation_incident_response', 'secret rotation incident response playbook', 'secret_rotation_incident_response', 'packages/btd', ['api', 'pipeline_workers', 'repair_jobs'], ['secret family id', 'rotation audit event', 'runtime availability root'], 'secret leak, expiry, or provider revocation affects a runtime lane', ['revoke affected credential', 'rotate provider alias', 'replay runtime availability check'], ['pnpm run check:v34-gate5'], ['SecretRotationPlan', 'auditEventName'], 'affected runtime host remains blocked until rotation and availability roots verify', 'secret boundary'),
    row('generated_artifact_repair', 'generated artifact repair playbook', 'generated_artifact_repair', 'scripts/specifying', ['proof_services', 'repair_jobs'], ['generated artifact root', 'spec-family root', 'canonical input root'], 'generated artifact is stale, missing, or source-unsafe', ['regenerate artifact', 'run artifact checker', 'verify source-safe proof root'], ['node scripts/check-bitcode-spec-family.mjs --version V34 --mode draft --current-target V33'], ['canonical input report', 'spec-family report'], 'promotion and deployment stay blocked until generated artifact root verifies', 'generated artifact boundary'),
  ];
}

export function buildRollbackUpgradeRepairPlaybook(
  input: RollbackUpgradeRepairPlaybookInput,
): RollbackUpgradeRepairPlaybook {
  const playbookId = assertPlaybookId(input.playbookId);
  const playbookClass = assertPlaybookClass(input.playbookClass);
  const requiredHostIds = input.requiredHostIds.map(assertDeploymentHostCapabilityId);
  const supportedLaneIds = input.supportedLaneIds.map(assertEnvironmentLaneContractId);
  const playbook = {
    kind: 'bitcode.rollback_upgrade_repair_playbook' as const,
    playbookId,
    label: assertSourceSafeString(input.label, 'label'),
    playbookClass,
    ownerPackage: assertSourceSafeString(input.ownerPackage, 'ownerPackage'),
    requiredHostIds,
    supportedLaneIds,
    stateCarriers: input.stateCarriers.map((carrier) => assertSourceSafeString(carrier, 'stateCarriers')),
    entryCondition: assertSourceSafeString(input.entryCondition, 'entryCondition'),
    operatorApproval: assertSourceSafeString(input.operatorApproval, 'operatorApproval'),
    commandSequence: input.commandSequence.map((command) => assertSourceSafeString(command, 'commandSequence')),
    verificationCommands: input.verificationCommands.map((command) => assertSourceSafeString(command, 'verificationCommands')),
    proofRootBasis: input.proofRootBasis.map((basis) => assertSourceSafeString(basis, 'proofRootBasis')),
    failClosedResult: assertSourceSafeString(input.failClosedResult, 'failClosedResult'),
    recoveryBoundary: assertSourceSafeString(input.recoveryBoundary, 'recoveryBoundary'),
    auditEventName: assertSourceSafeString(input.auditEventName, 'auditEventName'),
    sourceSafety: SOURCE_SAFETY,
  };

  assertPlaybookInvariants(playbook);

  return {
    ...playbook,
    playbookRoot: stableRoot('v34-rollback-upgrade-repair-playbook', [
      playbook.playbookId,
      playbook.label,
      playbook.playbookClass,
      playbook.ownerPackage,
      playbook.requiredHostIds.join(','),
      playbook.supportedLaneIds.join(','),
      playbook.stateCarriers.join(','),
      playbook.entryCondition,
      playbook.operatorApproval,
      playbook.commandSequence.join(','),
      playbook.verificationCommands.join(','),
      playbook.proofRootBasis.join(','),
      playbook.failClosedResult,
      playbook.recoveryBoundary,
      playbook.auditEventName,
    ]),
  };
}

export function buildRollbackUpgradeRepairPlaybookSet(
  input: RollbackUpgradeRepairPlaybookSetInput = {},
): RollbackUpgradeRepairPlaybookSet {
  const requiredPlaybookIds = [
    ...(input.requiredPlaybookIds ?? ROLLBACK_UPGRADE_REPAIR_PLAYBOOK_IDS),
  ];
  const playbooks = (input.playbooks ?? buildRollbackUpgradeRepairPlaybookRows()).map(
    buildRollbackUpgradeRepairPlaybook,
  );
  const observedPlaybookIds = Array.from(new Set(playbooks.map((playbook) => playbook.playbookId))).sort();
  const missingPlaybookIds = requiredPlaybookIds.filter(
    (playbookId) => !observedPlaybookIds.includes(playbookId),
  );
  const duplicatePlaybookIds = findDuplicates(playbooks.map((playbook) => playbook.playbookId));

  if (missingPlaybookIds.length) {
    throw new Error(`Rollback upgrade repair playbooks missing required playbooks: ${missingPlaybookIds.join(', ')}.`);
  }
  if (duplicatePlaybookIds.length) {
    throw new Error(`Rollback upgrade repair playbooks contain duplicate playbook ids: ${duplicatePlaybookIds.join(', ')}.`);
  }

  const hasClass = (playbookClass: RollbackUpgradeRepairPlaybookClass) =>
    playbooks.some((playbook) => playbook.playbookClass === playbookClass);
  const allHaveApprovals = playbooks.every((playbook) => playbook.operatorApproval.length > 0);
  const allHaveCommands = playbooks.every((playbook) => playbook.commandSequence.length > 0);
  const allHaveVerification = playbooks.every((playbook) => playbook.verificationCommands.length > 0);
  const allHaveProofRoots = playbooks.every((playbook) => playbook.proofRootBasis.length > 0);
  const allFailClosed = playbooks.every((playbook) => /blocked|freeze|denied|stay blocked|remains blocked/iu.test(playbook.failClosedResult));
  const valueBearingMainnetBlocked = playbooks.every((playbook) =>
    playbook.supportedLaneIds.every((laneId) => laneId !== 'value-bearing-mainnet'),
  );

  if (!hasClass('rollback')) throw new Error('Rollback playbook is required.');
  if (!hasClass('upgrade')) throw new Error('Upgrade playbook is required.');
  if (!hasClass('migration_rollback')) throw new Error('Migration rollback playbook is required.');
  if (!hasClass('object_storage_repair')) throw new Error('Object-storage repair playbook is required.');
  if (!hasClass('database_repair')) throw new Error('Database repair playbook is required.');
  if (!hasClass('ledger_projection_repair')) throw new Error('Ledger projection repair playbook is required.');
  if (!hasClass('secret_rotation_incident_response')) throw new Error('Secret rotation incident response playbook is required.');
  if (!hasClass('generated_artifact_repair')) throw new Error('Generated artifact repair playbook is required.');
  if (!allHaveApprovals) throw new Error('Rollback upgrade repair playbooks require operator approval.');
  if (!allHaveCommands) throw new Error('Rollback upgrade repair playbooks require command sequences.');
  if (!allHaveVerification) throw new Error('Rollback upgrade repair playbooks require verification commands.');
  if (!allHaveProofRoots) throw new Error('Rollback upgrade repair playbooks require proof roots.');
  if (!allFailClosed) throw new Error('Rollback upgrade repair playbooks require fail-closed results.');
  if (!valueBearingMainnetBlocked) throw new Error('Rollback upgrade repair playbooks must not admit value-bearing mainnet.');

  return {
    kind: 'bitcode.rollback_upgrade_repair_playbook_set',
    schemaId: 'bitcode.rollbackUpgradeRepairPlaybookSet.v1',
    playbookSetRoot: stableRoot('v34-rollback-upgrade-repair-playbook-set', [
      ...playbooks.map((playbook) => playbook.playbookRoot),
      requiredPlaybookIds.join(','),
    ]),
    playbookCount: playbooks.length,
    requiredPlaybookIds,
    observedPlaybookIds,
    missingPlaybookIds,
    playbooks,
    rollbackCovered: true,
    upgradeCovered: true,
    migrationRollbackCovered: true,
    objectStorageRepairCovered: true,
    databaseRepairCovered: true,
    ledgerProjectionRepairCovered: true,
    secretRotationIncidentResponseCovered: true,
    generatedArtifactRepairCovered: true,
    operatorApprovalsCovered: true,
    commandsCovered: true,
    verificationCovered: true,
    proofRootsCovered: true,
    failClosedResultsCovered: true,
    noSerializedSecretValues: true,
    valueBearingMainnetBlocked: true,
    sourceSafety: SOURCE_SAFETY,
  };
}

function row(
  playbookId: RollbackUpgradeRepairPlaybookId,
  label: string,
  playbookClass: RollbackUpgradeRepairPlaybookClass,
  ownerPackage: string,
  requiredHostIds: DeploymentHostCapabilityId[],
  stateCarriers: string[],
  entryCondition: string,
  commandSequence: string[],
  verificationCommands: string[],
  proofRootBasis: string[],
  failClosedResult: string,
  recoveryBoundary: string,
): RollbackUpgradeRepairPlaybookInput {
  return {
    playbookId,
    label,
    playbookClass,
    ownerPackage,
    requiredHostIds,
    supportedLaneIds: NON_VALUE_LANES,
    stateCarriers,
    entryCondition,
    operatorApproval: 'maintainer operator approval and source-safe audit event required before execution',
    commandSequence,
    verificationCommands,
    proofRootBasis,
    failClosedResult,
    recoveryBoundary,
    auditEventName: `rollback_upgrade_repair.${playbookId}`,
  };
}

function assertPlaybookInvariants(
  playbook: Omit<RollbackUpgradeRepairPlaybook, 'playbookRoot'>,
): void {
  if (playbook.supportedLaneIds.includes('value-bearing-mainnet')) {
    throw new Error('Rollback upgrade repair playbooks must not admit value-bearing mainnet.');
  }
  if (!/approval/iu.test(playbook.operatorApproval)) {
    throw new Error('Rollback upgrade repair playbooks require operator approval.');
  }
  if (playbook.commandSequence.length === 0) {
    throw new Error('Rollback upgrade repair playbooks require command sequences.');
  }
  if (playbook.verificationCommands.length === 0) {
    throw new Error('Rollback upgrade repair playbooks require verification commands.');
  }
  if (playbook.proofRootBasis.length === 0) {
    throw new Error('Rollback upgrade repair playbooks require proof roots.');
  }
  if (!/blocked|freeze|denied|stay blocked|remains blocked/iu.test(playbook.failClosedResult)) {
    throw new Error('Rollback upgrade repair playbooks require fail-closed result text.');
  }
}

function assertPlaybookId(playbookId: string): RollbackUpgradeRepairPlaybookId {
  if (!ROLLBACK_UPGRADE_REPAIR_PLAYBOOK_IDS.includes(playbookId as RollbackUpgradeRepairPlaybookId)) {
    throw new Error(`Unsupported rollback upgrade repair playbook id: ${playbookId}.`);
  }
  return playbookId as RollbackUpgradeRepairPlaybookId;
}

function assertPlaybookClass(playbookClass: string): RollbackUpgradeRepairPlaybookClass {
  if (!PLAYBOOK_CLASSES.includes(playbookClass as RollbackUpgradeRepairPlaybookClass)) {
    throw new Error(`Unsupported rollback upgrade repair playbook class: ${playbookClass}.`);
  }
  return playbookClass as RollbackUpgradeRepairPlaybookClass;
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
      throw new Error(`${label} must be source-safe rollback upgrade repair metadata.`);
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
