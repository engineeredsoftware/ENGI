import { createHash } from 'crypto';
import { assertNonEmptyString } from './constants';
import {
  DEPLOYMENT_HOST_CAPABILITY_IDS,
  ENVIRONMENT_LANE_CONTRACT_IDS,
  type DeploymentHostCapabilityId,
  type EnvironmentLaneContractId,
} from './deployment-host-capability-catalog';
import type { BtdProtocolTelemetrySourceSafety } from './telemetry';

export const DEPLOYMENT_STORAGE_CARRIER_IDS = [
  'ledger_derived_state',
  'canonical_database_projection',
  'protected_assetpack_object_storage',
  'source_safe_assetpack_preview_storage',
  'generated_proof_artifacts',
  'audit_log_stream',
  'rollback_material',
  'encrypted_backups',
] as const;

export type DeploymentStorageCarrierId = (typeof DEPLOYMENT_STORAGE_CARRIER_IDS)[number];

export type DeploymentStorageClass =
  | 'ledger_derived_state'
  | 'canonical_database_projection'
  | 'object_storage'
  | 'proof_artifact'
  | 'audit_log'
  | 'rollback_material'
  | 'backup';

export type DeploymentStorageDurabilityPosture =
  | 'append_only_replayable'
  | 'durable_projection'
  | 'encrypted_durable_object'
  | 'source_safe_durable_object'
  | 'generated_replayable_artifact'
  | 'append_only_log'
  | 'operator_controlled_rollback'
  | 'encrypted_backup';

export type DeploymentStorageDisclosurePolicy =
  | 'ledger_commitment_only'
  | 'database_projection_only'
  | 'protected_source_locked_until_settlement'
  | 'source_safe_preview_only'
  | 'source_safe_proof_only'
  | 'operator_audit_only'
  | 'operator_rollback_only'
  | 'encrypted_recovery_only';

export type DeploymentStorageVisibility =
  | 'source_safe_roots_only'
  | 'blocked_before_settlement'
  | 'operator_source_safe_only'
  | 'reader_unlocked_after_settlement'
  | 'internal_recovery_only';

export type DeploymentStorageRootKind =
  | 'ledger'
  | 'database_projection'
  | 'object_storage'
  | 'proof'
  | 'audit_log'
  | 'rollback';

export type DeploymentStorageDriftKind =
  | 'ledger_database_projection_drift'
  | 'database_object_storage_projection_drift'
  | 'unpaid_source_visibility_attempt';

export const DEPLOYMENT_STORAGE_DRIFT_REPAIR_FIXTURE_IDS = [
  'ledger-database-projection-drift',
  'database-object-storage-projection-drift',
  'unpaid-protected-assetpack-access-attempt',
] as const;

export type DeploymentStorageDriftRepairFixtureId =
  (typeof DEPLOYMENT_STORAGE_DRIFT_REPAIR_FIXTURE_IDS)[number];

export interface DeploymentStorageCarrierInput {
  carrierId: DeploymentStorageCarrierId;
  storageClass: DeploymentStorageClass;
  ownerHostId: DeploymentHostCapabilityId;
  storageOwnerPackage: string;
  supportedLaneIds: readonly EnvironmentLaneContractId[];
  durabilityPosture: DeploymentStorageDurabilityPosture;
  disclosurePolicy: DeploymentStorageDisclosurePolicy;
  storesProtectedSourcePayload: boolean;
  preSettlementVisibility: DeploymentStorageVisibility;
  postSettlementVisibility: DeploymentStorageVisibility;
  retentionClass: string;
  encryptionPosture: string;
  backupPosture: string;
  rollbackMaterialPosture: string;
  requiredRoots: readonly DeploymentStorageRootKind[];
  driftDetection: string;
  repairCommand: string;
  repairPosture: string;
  validationCommand: string;
  proofRootBasis: readonly string[];
}

export interface DeploymentStorageCarrier extends DeploymentStorageCarrierInput {
  kind: 'bitcode.deployment_storage_posture.carrier';
  supportedLaneIds: EnvironmentLaneContractId[];
  requiredRoots: DeploymentStorageRootKind[];
  proofRootBasis: string[];
  carrierRoot: string;
  sourceSafety: BtdProtocolTelemetrySourceSafety;
}

export interface DeploymentStorageDriftRepairFixtureInput {
  fixtureId: DeploymentStorageDriftRepairFixtureId;
  driftKind: DeploymentStorageDriftKind;
  affectedCarrierIds: readonly DeploymentStorageCarrierId[];
  detectionRoot: string;
  blocksUnlock: boolean;
  blocksSourceVisibility: boolean;
  repairCommand: string;
  repairPosture: string;
  expectedFinalPosture: string;
  validationCommand: string;
  proofRootBasis: readonly string[];
}

export interface DeploymentStorageDriftRepairFixture extends DeploymentStorageDriftRepairFixtureInput {
  kind: 'bitcode.deployment_storage_posture.drift_repair_fixture';
  affectedCarrierIds: DeploymentStorageCarrierId[];
  proofRootBasis: string[];
  fixtureRoot: string;
  sourceSafety: BtdProtocolTelemetrySourceSafety;
}

export interface DeploymentStoragePostureInput {
  carriers?: readonly DeploymentStorageCarrierInput[];
  driftRepairFixtures?: readonly DeploymentStorageDriftRepairFixtureInput[];
  requiredCarrierIds?: readonly DeploymentStorageCarrierId[];
}

export interface DeploymentStoragePosture {
  kind: 'bitcode.deployment_storage_posture';
  schemaId: 'bitcode.deploymentStoragePosture.v1';
  postureRoot: string;
  carrierCount: number;
  requiredCarrierIds: DeploymentStorageCarrierId[];
  observedCarrierIds: DeploymentStorageCarrierId[];
  missingCarrierIds: DeploymentStorageCarrierId[];
  carriers: DeploymentStorageCarrier[];
  driftRepairFixtures: DeploymentStorageDriftRepairFixture[];
  sourceBearingAssetPackLockedBeforeSettlement: true;
  ledgerDatabaseProjectionDriftRepairable: true;
  objectStorageProjectionDriftRepairable: true;
  backupsCovered: true;
  retentionCovered: true;
  encryptionCovered: true;
  rollbackMaterialCovered: true;
  auditLogsCovered: true;
  sourceSafety: BtdProtocolTelemetrySourceSafety;
}

export const DEPLOYMENT_STORAGE_REQUIRED_CARRIER_FIELDS = [
  'storageOwnerPackage',
  'supportedLaneIds',
  'durabilityPosture',
  'disclosurePolicy',
  'preSettlementVisibility',
  'postSettlementVisibility',
  'retentionClass',
  'encryptionPosture',
  'backupPosture',
  'rollbackMaterialPosture',
  'requiredRoots',
  'driftDetection',
  'repairCommand',
  'repairPosture',
  'validationCommand',
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
];

export function buildDeploymentStorageCarrierRows(): DeploymentStorageCarrierInput[] {
  return [
    {
      carrierId: 'ledger_derived_state',
      storageClass: 'ledger_derived_state',
      ownerHostId: 'ledger_projection',
      storageOwnerPackage: 'packages/btd',
      supportedLaneIds: NON_VALUE_LANES,
      durabilityPosture: 'append_only_replayable',
      disclosurePolicy: 'ledger_commitment_only',
      storesProtectedSourcePayload: false,
      preSettlementVisibility: 'source_safe_roots_only',
      postSettlementVisibility: 'source_safe_roots_only',
      retentionClass: 'testnet-and-mainnet-dry-run-audit-retained',
      encryptionPosture: 'hash-chained source-safe roots with provider encryption at rest',
      backupPosture: 'replay from ledger roots, database projection roots, and proof artifacts',
      rollbackMaterialPosture: 'rollback uses prior ledger projection root and replay command',
      requiredRoots: ['ledger', 'proof', 'audit_log'],
      driftDetection: 'compare-ledger-root-to-database-projection-root-before-unlock',
      repairCommand: 'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/reconciliation.test.ts',
      repairPosture: 'hold AssetPack unlock and replay ledger projection from committed ledger root',
      validationCommand: 'pnpm run check:v34-gate4',
      proofRootBasis: ['BtdAssetPackMintReceipt', 'BtdReadReceipt', 'BtdRightsTransferReceipt'],
    },
    {
      carrierId: 'canonical_database_projection',
      storageClass: 'canonical_database_projection',
      ownerHostId: 'database_projection',
      storageOwnerPackage: 'packages/supabase',
      supportedLaneIds: NON_VALUE_LANES,
      durabilityPosture: 'durable_projection',
      disclosurePolicy: 'database_projection_only',
      storesProtectedSourcePayload: false,
      preSettlementVisibility: 'source_safe_roots_only',
      postSettlementVisibility: 'source_safe_roots_only',
      retentionClass: 'lane-retained-postgres-projection-with-point-in-time-restore',
      encryptionPosture: 'provider encrypted at rest; service access only through server-side policy',
      backupPosture: 'Supabase point-in-time restore plus deterministic projection replay',
      rollbackMaterialPosture: 'migration rollback requires prior schema root and projection repair root',
      requiredRoots: ['database_projection', 'ledger', 'proof', 'audit_log'],
      driftDetection: 'compare-database-projection-root-to-ledger-root-and-object-storage-root',
      repairCommand: 'pnpm run db:data-health:ci && pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/reconciliation.test.ts',
      repairPosture: 'block paid unlock until projection repair writes a new database projection root',
      validationCommand: 'pnpm run check:v34-gate4',
      proofRootBasis: ['ledger database reconciliation', 'DeploymentStoragePosture'],
    },
    {
      carrierId: 'protected_assetpack_object_storage',
      storageClass: 'object_storage',
      ownerHostId: 'object_storage',
      storageOwnerPackage: 'packages/pipeline-hosts',
      supportedLaneIds: NON_VALUE_LANES,
      durabilityPosture: 'encrypted_durable_object',
      disclosurePolicy: 'protected_source_locked_until_settlement',
      storesProtectedSourcePayload: true,
      preSettlementVisibility: 'blocked_before_settlement',
      postSettlementVisibility: 'reader_unlocked_after_settlement',
      retentionClass: 'rights-retained-until-read-license-expiry-or-operator-deletion',
      encryptionPosture: 'encrypted at rest with lane-scoped object key policy and no tracked key material',
      backupPosture: 'encrypted protected-object backup with proof-rooted restore command',
      rollbackMaterialPosture: 'rollback material may reference encrypted object root but never exposes payload',
      requiredRoots: ['object_storage', 'proof', 'audit_log', 'rollback'],
      driftDetection: 'deny source visibility unless paid settlement root and object root both verify',
      repairCommand: 'pnpm run check:v34-gate4',
      repairPosture: 'lock delivery and rewrite from authorized encrypted artifact root after operator approval',
      validationCommand: 'pnpm run check:v34-gate4',
      proofRootBasis: ['AssetPackPreview', 'SettlementUnlock', 'object-storage receipt root'],
    },
    {
      carrierId: 'source_safe_assetpack_preview_storage',
      storageClass: 'object_storage',
      ownerHostId: 'object_storage',
      storageOwnerPackage: 'packages/pipeline-hosts',
      supportedLaneIds: NON_VALUE_LANES,
      durabilityPosture: 'source_safe_durable_object',
      disclosurePolicy: 'source_safe_preview_only',
      storesProtectedSourcePayload: false,
      preSettlementVisibility: 'source_safe_roots_only',
      postSettlementVisibility: 'source_safe_roots_only',
      retentionClass: 'read-preview-retained-for-transaction-history',
      encryptionPosture: 'provider encrypted at rest; payload limited to measurements and roots',
      backupPosture: 'preview object can be regenerated from runtime receipt roots',
      rollbackMaterialPosture: 'preview rollback rewrites source-safe measurements from receipt output root',
      requiredRoots: ['object_storage', 'database_projection', 'proof'],
      driftDetection: 'compare-preview-object-root-to-database-preview-root',
      repairCommand: 'pnpm --filter @bitcode/asset-packs-pipelines-domain exec jest --config jest.config.cjs --runTestsByPath src/__tests__/asset-pack-disclosure.test.ts --runInBand',
      repairPosture: 'withhold preview update until source-safe projection is regenerated',
      validationCommand: 'pnpm run check:v34-gate4',
      proofRootBasis: ['AssetPackPreview', 'ReadFitsFindingSynthesis', 'InterfaceTelemetryProofHook'],
    },
    {
      carrierId: 'generated_proof_artifacts',
      storageClass: 'proof_artifact',
      ownerHostId: 'proof_services',
      storageOwnerPackage: 'scripts/specifying',
      supportedLaneIds: NON_VALUE_LANES,
      durabilityPosture: 'generated_replayable_artifact',
      disclosurePolicy: 'source_safe_proof_only',
      storesProtectedSourcePayload: false,
      preSettlementVisibility: 'source_safe_roots_only',
      postSettlementVisibility: 'source_safe_roots_only',
      retentionClass: 'repository-retained-generated-proof-artifact',
      encryptionPosture: 'source-safe generated JSON with secret scanning before commit',
      backupPosture: 'recreate from canonical inputs and deterministic generator scripts',
      rollbackMaterialPosture: 'rollback restores prior generated artifact root before promotion',
      requiredRoots: ['proof', 'audit_log'],
      driftDetection: 'generated-artifact-check-compares-current-output-to-tracked-artifact',
      repairCommand: 'pnpm run check:spec-quality && pnpm run check:v34-gate4',
      repairPosture: 'regenerate proof artifact from canonical source and re-run promotion checks',
      validationCommand: 'pnpm run check:v34-gate4',
      proofRootBasis: ['.specifications/BITCODE_SPEC_V34.md', '.specifications/BITCODE_SPEC_V34_PARITY_MATRIX.md'],
    },
    {
      carrierId: 'audit_log_stream',
      storageClass: 'audit_log',
      ownerHostId: 'runtime_observers',
      storageOwnerPackage: 'packages/observability',
      supportedLaneIds: NON_VALUE_LANES,
      durabilityPosture: 'append_only_log',
      disclosurePolicy: 'operator_audit_only',
      storesProtectedSourcePayload: false,
      preSettlementVisibility: 'operator_source_safe_only',
      postSettlementVisibility: 'operator_source_safe_only',
      retentionClass: 'lane-audit-log-retention-with-operator-export',
      encryptionPosture: 'provider encrypted at rest with redacted structured events',
      backupPosture: 'audit log export stores roots and redacted event envelopes',
      rollbackMaterialPosture: 'audit rollback is append-only correction event, not deletion',
      requiredRoots: ['audit_log', 'proof'],
      driftDetection: 'runtime receipt log root must match audit event stream root',
      repairCommand: 'pnpm run check:v34-gate3 && pnpm run check:v34-gate4',
      repairPosture: 'mark execution blocked and append repair event before replay',
      validationCommand: 'pnpm run check:v34-gate4',
      proofRootBasis: ['DistributedExecutionRuntimeReceipt', 'InterfaceTelemetryProofHook'],
    },
    {
      carrierId: 'rollback_material',
      storageClass: 'rollback_material',
      ownerHostId: 'repair_jobs',
      storageOwnerPackage: 'packages/btd',
      supportedLaneIds: NON_VALUE_LANES,
      durabilityPosture: 'operator_controlled_rollback',
      disclosurePolicy: 'operator_rollback_only',
      storesProtectedSourcePayload: true,
      preSettlementVisibility: 'blocked_before_settlement',
      postSettlementVisibility: 'internal_recovery_only',
      retentionClass: 'operator-retained-until-deployment-successor-proof',
      encryptionPosture: 'encrypted at rest; rollback bundle references roots instead of payload text',
      backupPosture: 'rollback bundle copied to encrypted backup carrier with proof root',
      rollbackMaterialPosture: 'required for migration, projection, and object-storage repair',
      requiredRoots: ['rollback', 'object_storage', 'database_projection', 'ledger', 'proof'],
      driftDetection: 'rollback gap blocks deployment promotion and paid unlock',
      repairCommand: 'pnpm run check:v34-gate4',
      repairPosture: 'block traffic promotion until rollback bundle root and verification command pass',
      validationCommand: 'pnpm run check:v34-gate4',
      proofRootBasis: ['RollbackUpgradeRepairPlaybook', 'DeploymentStoragePosture'],
    },
    {
      carrierId: 'encrypted_backups',
      storageClass: 'backup',
      ownerHostId: 'object_storage',
      storageOwnerPackage: 'packages/pipeline-hosts',
      supportedLaneIds: NON_VALUE_LANES,
      durabilityPosture: 'encrypted_backup',
      disclosurePolicy: 'encrypted_recovery_only',
      storesProtectedSourcePayload: true,
      preSettlementVisibility: 'blocked_before_settlement',
      postSettlementVisibility: 'internal_recovery_only',
      retentionClass: 'lane-scoped-backup-retention-with-manual-deletion-proof',
      encryptionPosture: 'encrypted backup carrier with no tracked key values',
      backupPosture: 'required backup root for protected objects, projections, proofs, and rollback bundles',
      rollbackMaterialPosture: 'backup restore is admissible only through repair job receipt',
      requiredRoots: ['object_storage', 'database_projection', 'ledger', 'proof', 'audit_log', 'rollback'],
      driftDetection: 'backup root must match carrier roots before promotion readiness',
      repairCommand: 'pnpm run check:v34-gate4',
      repairPosture: 'deny restore visibility until backup proof root and repair job receipt verify',
      validationCommand: 'pnpm run check:v34-gate4',
      proofRootBasis: ['DeploymentReadinessRehearsal', 'DeploymentStoragePosture'],
    },
  ];
}

export function buildDeploymentStorageDriftRepairFixtures(): DeploymentStorageDriftRepairFixtureInput[] {
  return [
    {
      fixtureId: 'ledger-database-projection-drift',
      driftKind: 'ledger_database_projection_drift',
      affectedCarrierIds: ['ledger_derived_state', 'canonical_database_projection'],
      detectionRoot: 'sha256:ledger-database-projection-drift-root',
      blocksUnlock: true,
      blocksSourceVisibility: true,
      repairCommand: 'pnpm run db:data-health:ci && pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/reconciliation.test.ts',
      repairPosture: 'repair database projection from ledger root before AssetPack unlock',
      expectedFinalPosture: 'ledger and database projection roots agree before unlock resumes',
      validationCommand: 'pnpm run check:v34-gate4',
      proofRootBasis: ['ledgerProjectionRoot', 'databaseProjectionRoot', 'repairJobReceiptRoot'],
    },
    {
      fixtureId: 'database-object-storage-projection-drift',
      driftKind: 'database_object_storage_projection_drift',
      affectedCarrierIds: [
        'canonical_database_projection',
        'protected_assetpack_object_storage',
        'source_safe_assetpack_preview_storage',
      ],
      detectionRoot: 'sha256:database-object-storage-projection-drift-root',
      blocksUnlock: true,
      blocksSourceVisibility: true,
      repairCommand: 'pnpm run check:v34-gate4',
      repairPosture: 'repair object root projection or rewrite authorized object before source visibility',
      expectedFinalPosture: 'database projection and object storage roots agree before delivery resumes',
      validationCommand: 'pnpm run check:v34-gate4',
      proofRootBasis: ['databaseProjectionRoot', 'objectStorageRoot', 'repairJobReceiptRoot'],
    },
    {
      fixtureId: 'unpaid-protected-assetpack-access-attempt',
      driftKind: 'unpaid_source_visibility_attempt',
      affectedCarrierIds: ['protected_assetpack_object_storage', 'rollback_material', 'encrypted_backups'],
      detectionRoot: 'sha256:unpaid-protected-assetpack-access-attempt-root',
      blocksUnlock: true,
      blocksSourceVisibility: true,
      repairCommand: 'pnpm run check:v34-gate4',
      repairPosture: 'deny response, append audit event, and require paid settlement root before retry',
      expectedFinalPosture: 'protected AssetPack payload remains hidden before settlement',
      validationCommand: 'pnpm run check:v34-gate4',
      proofRootBasis: ['SettlementUnlock', 'InterfaceAuthorizationPolicy', 'DeploymentStoragePosture'],
    },
  ];
}

export function buildDeploymentStorageCarrier(
  input: DeploymentStorageCarrierInput,
): DeploymentStorageCarrier {
  const carrier: DeploymentStorageCarrier = {
    ...input,
    kind: 'bitcode.deployment_storage_posture.carrier',
    carrierId: assertDeploymentStorageCarrierId(input.carrierId),
    ownerHostId: assertDeploymentHostCapabilityId(input.ownerHostId),
    storageOwnerPackage: assertNonEmptyString(input.storageOwnerPackage, 'storageOwnerPackage'),
    supportedLaneIds: normalizeLaneIds(input.supportedLaneIds),
    retentionClass: assertSafeNonEmptyString(input.retentionClass, 'retentionClass'),
    encryptionPosture: assertSafeNonEmptyString(input.encryptionPosture, 'encryptionPosture'),
    backupPosture: assertSafeNonEmptyString(input.backupPosture, 'backupPosture'),
    rollbackMaterialPosture: assertSafeNonEmptyString(
      input.rollbackMaterialPosture,
      'rollbackMaterialPosture',
    ),
    requiredRoots: normalizeRequiredRoots(input.requiredRoots),
    driftDetection: assertSafeNonEmptyString(input.driftDetection, 'driftDetection'),
    repairCommand: assertSafeNonEmptyString(input.repairCommand, 'repairCommand'),
    repairPosture: assertSafeNonEmptyString(input.repairPosture, 'repairPosture'),
    validationCommand: assertSafeNonEmptyString(input.validationCommand, 'validationCommand'),
    proofRootBasis: normalizeStringArray(input.proofRootBasis, 'proofRootBasis'),
    carrierRoot: '',
    sourceSafety: SOURCE_SAFETY,
  };

  assertNoValueBearingMainnet(carrier.supportedLaneIds);
  assertProtectedPayloadBoundary(carrier);
  assertSafeObject(carrier, `deployment storage carrier ${carrier.carrierId}`);

  return {
    ...carrier,
    carrierRoot: stableRoot('deployment-storage-carrier', [
      carrier.carrierId,
      carrier.storageClass,
      carrier.ownerHostId,
      carrier.storageOwnerPackage,
      carrier.supportedLaneIds.join(','),
      carrier.durabilityPosture,
      carrier.disclosurePolicy,
      String(carrier.storesProtectedSourcePayload),
      carrier.preSettlementVisibility,
      carrier.postSettlementVisibility,
      carrier.retentionClass,
      carrier.encryptionPosture,
      carrier.backupPosture,
      carrier.rollbackMaterialPosture,
      carrier.requiredRoots.join(','),
      carrier.driftDetection,
      carrier.repairCommand,
      carrier.repairPosture,
      carrier.validationCommand,
      carrier.proofRootBasis.join(','),
    ]),
  };
}

export function buildDeploymentStorageDriftRepairFixture(
  input: DeploymentStorageDriftRepairFixtureInput,
): DeploymentStorageDriftRepairFixture {
  const fixture: DeploymentStorageDriftRepairFixture = {
    ...input,
    kind: 'bitcode.deployment_storage_posture.drift_repair_fixture',
    fixtureId: assertDeploymentStorageDriftRepairFixtureId(input.fixtureId),
    affectedCarrierIds: normalizeCarrierIds(input.affectedCarrierIds),
    detectionRoot: assertSafeNonEmptyString(input.detectionRoot, 'detectionRoot'),
    repairCommand: assertSafeNonEmptyString(input.repairCommand, 'repairCommand'),
    repairPosture: assertSafeNonEmptyString(input.repairPosture, 'repairPosture'),
    expectedFinalPosture: assertSafeNonEmptyString(
      input.expectedFinalPosture,
      'expectedFinalPosture',
    ),
    validationCommand: assertSafeNonEmptyString(input.validationCommand, 'validationCommand'),
    proofRootBasis: normalizeStringArray(input.proofRootBasis, 'proofRootBasis'),
    fixtureRoot: '',
    sourceSafety: SOURCE_SAFETY,
  };

  if (!fixture.detectionRoot.startsWith('sha256:')) {
    throw new Error(`${fixture.fixtureId} detectionRoot must be a sha256 root.`);
  }
  if (!fixture.blocksUnlock || !fixture.blocksSourceVisibility) {
    throw new Error(`${fixture.fixtureId} must block unlock and source visibility while drift is unresolved.`);
  }
  assertSafeObject(fixture, `deployment storage drift fixture ${fixture.fixtureId}`);

  return {
    ...fixture,
    fixtureRoot: stableRoot('deployment-storage-drift-repair-fixture', [
      fixture.fixtureId,
      fixture.driftKind,
      fixture.affectedCarrierIds.join(','),
      fixture.detectionRoot,
      String(fixture.blocksUnlock),
      String(fixture.blocksSourceVisibility),
      fixture.repairCommand,
      fixture.repairPosture,
      fixture.expectedFinalPosture,
      fixture.validationCommand,
      fixture.proofRootBasis.join(','),
    ]),
  };
}

export function buildDeploymentStoragePosture(
  input: DeploymentStoragePostureInput = {},
): DeploymentStoragePosture {
  const requiredCarrierIds = normalizeCarrierIds(
    input.requiredCarrierIds ?? DEPLOYMENT_STORAGE_CARRIER_IDS,
  );
  const carriers = (input.carriers ?? buildDeploymentStorageCarrierRows()).map(
    buildDeploymentStorageCarrier,
  );
  const driftRepairFixtures = (
    input.driftRepairFixtures ?? buildDeploymentStorageDriftRepairFixtures()
  ).map(buildDeploymentStorageDriftRepairFixture);
  const observedCarrierIds = carriers.map((carrier) => carrier.carrierId);
  const duplicateCarrierIds = findDuplicates(observedCarrierIds);
  if (duplicateCarrierIds.length > 0) {
    throw new Error(`DeploymentStoragePosture duplicate carrier ids: ${duplicateCarrierIds.join(', ')}.`);
  }
  const missingCarrierIds = requiredCarrierIds.filter(
    (carrierId) => !observedCarrierIds.includes(carrierId),
  );
  if (missingCarrierIds.length > 0) {
    throw new Error(`DeploymentStoragePosture missing carrier ids: ${missingCarrierIds.join(', ')}.`);
  }

  const sourceBearingAssetPackLockedBeforeSettlement = carriers
    .filter((carrier) => carrier.storesProtectedSourcePayload)
    .every((carrier) => carrier.preSettlementVisibility === 'blocked_before_settlement');
  if (!sourceBearingAssetPackLockedBeforeSettlement) {
    throw new Error('Source-bearing AssetPack storage must remain locked before settlement.');
  }

  const ledgerDatabaseProjectionDriftRepairable = driftRepairFixtures.some(
    (fixture) =>
      fixture.driftKind === 'ledger_database_projection_drift' &&
      fixture.affectedCarrierIds.includes('ledger_derived_state') &&
      fixture.affectedCarrierIds.includes('canonical_database_projection') &&
      fixture.blocksUnlock &&
      fixture.blocksSourceVisibility,
  );
  if (!ledgerDatabaseProjectionDriftRepairable) {
    throw new Error('Ledger/database projection drift must have a blocking repair fixture.');
  }

  const objectStorageProjectionDriftRepairable = driftRepairFixtures.some(
    (fixture) =>
      fixture.driftKind === 'database_object_storage_projection_drift' &&
      fixture.affectedCarrierIds.includes('canonical_database_projection') &&
      fixture.affectedCarrierIds.includes('protected_assetpack_object_storage') &&
      fixture.blocksUnlock &&
      fixture.blocksSourceVisibility,
  );
  if (!objectStorageProjectionDriftRepairable) {
    throw new Error('Object-storage projection drift must have a blocking repair fixture.');
  }

  const posture: DeploymentStoragePosture = {
    kind: 'bitcode.deployment_storage_posture',
    schemaId: 'bitcode.deploymentStoragePosture.v1',
    postureRoot: stableRoot('deployment-storage-posture', [
      ...carriers.map((carrier) => carrier.carrierRoot),
      ...driftRepairFixtures.map((fixture) => fixture.fixtureRoot),
    ]),
    carrierCount: carriers.length,
    requiredCarrierIds,
    observedCarrierIds,
    missingCarrierIds,
    carriers,
    driftRepairFixtures,
    sourceBearingAssetPackLockedBeforeSettlement: true,
    ledgerDatabaseProjectionDriftRepairable: true,
    objectStorageProjectionDriftRepairable: true,
    backupsCovered: carriers.some((carrier) => carrier.storageClass === 'backup') as true,
    retentionCovered: carriers.every((carrier) => Boolean(carrier.retentionClass)) as true,
    encryptionCovered: carriers.every((carrier) => Boolean(carrier.encryptionPosture)) as true,
    rollbackMaterialCovered: carriers.some((carrier) => carrier.storageClass === 'rollback_material') as true,
    auditLogsCovered: carriers.some((carrier) => carrier.storageClass === 'audit_log') as true,
    sourceSafety: SOURCE_SAFETY,
  };

  if (
    !posture.backupsCovered ||
    !posture.retentionCovered ||
    !posture.encryptionCovered ||
    !posture.rollbackMaterialCovered ||
    !posture.auditLogsCovered
  ) {
    throw new Error('DeploymentStoragePosture must cover backups, retention, encryption, rollback material, and audit logs.');
  }
  assertSafeObject(posture, 'deployment storage posture');

  return posture;
}

function assertDeploymentStorageCarrierId(carrierId: string): DeploymentStorageCarrierId {
  if (!DEPLOYMENT_STORAGE_CARRIER_IDS.includes(carrierId as DeploymentStorageCarrierId)) {
    throw new Error(`Unknown deployment storage carrier id: ${carrierId}.`);
  }
  return carrierId as DeploymentStorageCarrierId;
}

function assertDeploymentStorageDriftRepairFixtureId(
  fixtureId: string,
): DeploymentStorageDriftRepairFixtureId {
  if (
    !DEPLOYMENT_STORAGE_DRIFT_REPAIR_FIXTURE_IDS.includes(
      fixtureId as DeploymentStorageDriftRepairFixtureId,
    )
  ) {
    throw new Error(`Unknown deployment storage drift repair fixture id: ${fixtureId}.`);
  }
  return fixtureId as DeploymentStorageDriftRepairFixtureId;
}

function assertDeploymentHostCapabilityId(hostId: string): DeploymentHostCapabilityId {
  if (!DEPLOYMENT_HOST_CAPABILITY_IDS.includes(hostId as DeploymentHostCapabilityId)) {
    throw new Error(`Unknown deployment storage owner host id: ${hostId}.`);
  }
  return hostId as DeploymentHostCapabilityId;
}

function normalizeCarrierIds(
  carrierIds: readonly string[],
): DeploymentStorageCarrierId[] {
  return Array.from(new Set(carrierIds.map(assertDeploymentStorageCarrierId))).sort();
}

function normalizeLaneIds(
  laneIds: readonly EnvironmentLaneContractId[],
): EnvironmentLaneContractId[] {
  const normalized = Array.from(
    new Set(
      laneIds.map((laneId) => {
        if (!ENVIRONMENT_LANE_CONTRACT_IDS.includes(laneId)) {
          throw new Error(`Unknown environment lane contract id for storage posture: ${laneId}.`);
        }
        return laneId;
      }),
    ),
  ).sort();
  if (normalized.length === 0) {
    throw new Error('Deployment storage carrier must support at least one environment lane.');
  }
  return normalized;
}

function normalizeRequiredRoots(
  requiredRoots: readonly DeploymentStorageRootKind[],
): DeploymentStorageRootKind[] {
  const normalized = Array.from(new Set(requiredRoots)).sort();
  if (normalized.length === 0) {
    throw new Error('Deployment storage carrier must require at least one root.');
  }
  return normalized;
}

function normalizeStringArray(values: readonly string[], label: string): string[] {
  const normalized = Array.from(
    new Set(values.map((value) => assertSafeNonEmptyString(value, label))),
  ).sort();
  if (normalized.length === 0) {
    throw new Error(`${label} must contain at least one value.`);
  }
  return normalized;
}

function assertNoValueBearingMainnet(laneIds: readonly EnvironmentLaneContractId[]): void {
  if (laneIds.includes('value-bearing-mainnet')) {
    throw new Error('DeploymentStoragePosture must not admit value-bearing-mainnet before future canon.');
  }
}

function assertProtectedPayloadBoundary(carrier: DeploymentStorageCarrier): void {
  if (!carrier.storesProtectedSourcePayload) return;
  if (carrier.preSettlementVisibility !== 'blocked_before_settlement') {
    throw new Error(`${carrier.carrierId} must block source-bearing payload visibility before settlement.`);
  }
  if (
    carrier.disclosurePolicy !== 'protected_source_locked_until_settlement' &&
    carrier.disclosurePolicy !== 'operator_rollback_only' &&
    carrier.disclosurePolicy !== 'encrypted_recovery_only'
  ) {
    throw new Error(`${carrier.carrierId} must use a locked or encrypted disclosure policy.`);
  }
}

function assertSafeNonEmptyString(value: string, label: string): string {
  const normalized = assertNonEmptyString(value, label);
  for (const pattern of SECRET_OR_SOURCE_PATTERNS) {
    if (pattern.test(normalized)) {
      throw new Error(`${label} must not contain secrets or non-disclosable source.`);
    }
  }
  return normalized;
}

function assertSafeObject(value: unknown, label: string): void {
  const serialized = JSON.stringify(value);
  for (const pattern of SECRET_OR_SOURCE_PATTERNS) {
    if (pattern.test(serialized)) {
      throw new Error(`${label} must not contain secrets or non-disclosable source.`);
    }
  }
}

function findDuplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return Array.from(duplicates).sort();
}

function stableRoot(prefix: string, parts: readonly string[]): string {
  const hash = createHash('sha256').update(parts.join('\u001f')).digest('hex').slice(0, 24);
  return `${prefix}:${hash}`;
}
