#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v34-deployment-storage-posture.json';
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
  'source contents',
]);
const SECRET_PATTERN = new RegExp(SECRET_MARKERS.map(escapeRegex).join('|'), 'iu');

const requiredCarrierIds = Object.freeze([
  'ledger_derived_state',
  'canonical_database_projection',
  'protected_assetpack_object_storage',
  'source_safe_assetpack_preview_storage',
  'generated_proof_artifacts',
  'audit_log_stream',
  'rollback_material',
  'encrypted_backups',
]);

const nonValueLanes = Object.freeze([
  'local',
  'regtest',
  'signet',
  'staging-testnet',
  'public-testnet',
  'mainnet-ready-dry-run',
]);

const carrierRows = Object.freeze([
  {
    carrierId: 'ledger_derived_state',
    storageClass: 'ledger_derived_state',
    ownerHostId: 'ledger_projection',
    storageOwnerPackage: 'packages/btd',
    supportedLaneIds: nonValueLanes,
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
    supportedLaneIds: nonValueLanes,
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
    supportedLaneIds: nonValueLanes,
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
    supportedLaneIds: nonValueLanes,
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
    supportedLaneIds: nonValueLanes,
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
    proofRootBasis: ['BITCODE_SPEC_V34.md', 'BITCODE_SPEC_V34_PARITY_MATRIX.md'],
  },
  {
    carrierId: 'audit_log_stream',
    storageClass: 'audit_log',
    ownerHostId: 'runtime_observers',
    storageOwnerPackage: 'packages/observability',
    supportedLaneIds: nonValueLanes,
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
    supportedLaneIds: nonValueLanes,
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
    supportedLaneIds: nonValueLanes,
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
]);

const driftRepairFixtures = Object.freeze([
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
]);

const sourceFiles = Object.freeze([
  'packages/btd/src/deployment-storage-posture.ts',
  'packages/btd/src/index.ts',
  'BITCODE_SPEC_V34.md',
  'BITCODE_SPEC_V34_DELTA.md',
  'BITCODE_SPEC_V34_PARITY_MATRIX.md',
]);

const testFiles = Object.freeze([
  'packages/btd/__tests__/deployment-storage-posture.test.ts',
  'scripts/check-v34-gate4-deployment-storage-posture.mjs',
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

function withCarrierRoots(rows) {
  return rows.map((row) => ({
    ...row,
    carrierRoot: stableRoot('v34-deployment-storage-carrier', [
      row.carrierId,
      row.storageClass,
      row.ownerHostId,
      row.storageOwnerPackage,
      row.supportedLaneIds.join(','),
      row.durabilityPosture,
      row.disclosurePolicy,
      String(row.storesProtectedSourcePayload),
      row.preSettlementVisibility,
      row.postSettlementVisibility,
      row.retentionClass,
      row.encryptionPosture,
      row.backupPosture,
      row.rollbackMaterialPosture,
      row.requiredRoots.join(','),
      row.driftDetection,
      row.repairCommand,
      row.repairPosture,
      row.validationCommand,
      row.proofRootBasis.join(','),
    ]),
  }));
}

function withDriftRepairFixtureRoots(fixtures) {
  return fixtures.map((fixture) => ({
    ...fixture,
    fixtureRoot: stableRoot('v34-deployment-storage-drift-repair-fixture', [
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
  }));
}

export function buildV34DeploymentStoragePostureArtifact() {
  const carriers = withCarrierRoots(carrierRows);
  const driftFixtures = withDriftRepairFixtureRoots(driftRepairFixtures);
  const observedCarrierIds = carriers.map((row) => row.carrierId);
  const missingCarrierIds = requiredCarrierIds.filter((carrierId) => !observedCarrierIds.includes(carrierId));
  const protectedCarriers = carriers.filter((row) => row.storesProtectedSourcePayload);
  const sourceEvidence = [
    scanTokens('packages/btd/src/deployment-storage-posture.ts', [
      'DeploymentStoragePosture',
      'DEPLOYMENT_STORAGE_CARRIER_IDS',
      'protected_source_locked_until_settlement',
      'ledger_database_projection_drift',
      'database_object_storage_projection_drift',
      'value-bearing-mainnet',
    ]),
    scanTokens('packages/btd/src/index.ts', ['deployment-storage-posture']),
    scanTokens('BITCODE_SPEC_V34.md', [
      ARTIFACT_PATH,
      'DeploymentStoragePosture',
      'protected source is never an unpaid interface payload',
    ]),
  ];
  const testEvidence = [
    scanTokens('packages/btd/__tests__/deployment-storage-posture.test.ts', [
      'catalogs ledger-derived state, database projections, object storage, proofs, audit logs, rollback material, and backups',
      'keeps source-bearing AssetPack storage locked before settlement',
      'proves ledger/database and object-storage projection drift repair fixtures',
      'fails closed when source-bearing AssetPack storage becomes visible before settlement',
      'fails closed on secret-shaped or non-disclosable source storage text',
    ]),
    scanTokens('scripts/check-v34-gate4-deployment-storage-posture.mjs', [
      'check:v34-deployment-storage-posture',
      'deployment-storage-posture.test.ts',
      'Ledger Database Object Storage Deployment Posture',
    ]),
  ];
  const sourceEvidenceComplete = sourceEvidence.every(allTokensPresent);
  const testEvidenceComplete = testEvidence.every(allTokensPresent);
  const ledgerDatabaseDriftRepair = driftFixtures.find(
    (fixture) => fixture.driftKind === 'ledger_database_projection_drift',
  );
  const objectStorageDriftRepair = driftFixtures.find(
    (fixture) => fixture.driftKind === 'database_object_storage_projection_drift',
  );
  const sourceLocked = protectedCarriers.every(
    (row) => row.preSettlementVisibility === 'blocked_before_settlement',
  );
  const noValueBearingMainnet = carriers.every(
    (row) => !row.supportedLaneIds.includes('value-bearing-mainnet'),
  );
  const passed =
    missingCarrierIds.length === 0 &&
    carriers.length === 8 &&
    sourceLocked &&
    noValueBearingMainnet &&
    Boolean(ledgerDatabaseDriftRepair?.blocksUnlock) &&
    Boolean(objectStorageDriftRepair?.blocksSourceVisibility) &&
    sourceEvidenceComplete &&
    testEvidenceComplete;

  return {
    artifactId: 'v34-deployment-storage-posture',
    schemaId: 'bitcode.v34.deploymentStoragePosture.v1',
    version: 'V34',
    currentTarget: 'V33',
    generatedAt: GENERATED_AT,
    sourceSafetyVerdict: 'source-safe-deployment-storage-posture-metadata',
    requiredCarrierIds,
    postureRoot: stableRoot('v34-deployment-storage-posture', [
      ...carriers.map((row) => row.carrierRoot),
      ...driftFixtures.map((fixture) => fixture.fixtureRoot),
    ]),
    carriers,
    driftRepairFixtures: driftFixtures,
    coverage: {
      observedCarrierIds,
      missingCarrierIds,
      carrierCount: carriers.length,
      ledgerDerivedStateCovered: observedCarrierIds.includes('ledger_derived_state'),
      databaseProjectionCovered: observedCarrierIds.includes('canonical_database_projection'),
      objectStorageCovered:
        observedCarrierIds.includes('protected_assetpack_object_storage') &&
        observedCarrierIds.includes('source_safe_assetpack_preview_storage'),
      proofArtifactsCovered: observedCarrierIds.includes('generated_proof_artifacts'),
      auditLogsCovered: observedCarrierIds.includes('audit_log_stream'),
      rollbackMaterialCovered: observedCarrierIds.includes('rollback_material'),
      backupsCovered: observedCarrierIds.includes('encrypted_backups'),
      retentionCovered: carriers.every((row) => Boolean(row.retentionClass)),
      encryptionCovered: carriers.every((row) => Boolean(row.encryptionPosture)),
      repairCommandsCovered: carriers.every((row) => Boolean(row.repairCommand)),
      protectedSourcePayloadCarrierCount: protectedCarriers.length,
      sourceBearingAssetPackLockedBeforeSettlement: sourceLocked,
      ledgerDatabaseProjectionDriftRepairable: Boolean(ledgerDatabaseDriftRepair?.blocksUnlock),
      objectStorageProjectionDriftRepairable: Boolean(objectStorageDriftRepair?.blocksSourceVisibility),
      valueBearingMainnetAdmitted: !noValueBearingMainnet,
      protectedSourceVisible: false,
      credentialsSerialized: false,
    },
    sharedFixtureFiles: [...sourceFiles, ...testFiles],
    sourceEvidence,
    testEvidence,
    passed,
    closureCommand: 'pnpm run check:v34-gate4',
  };
}

function assertSafeArtifact(artifact, artifactPath) {
  const serialized = stableStringify(artifact);
  if (SECRET_PATTERN.test(serialized)) {
    throw new Error(`${artifactPath} contains a secret-shaped or non-disclosable-source marker.`);
  }
  if (!artifact.passed) {
    throw new Error(`${artifactPath} source or test evidence is incomplete.`);
  }

  return serialized;
}

function writeArtifact(artifact, artifactPath) {
  const serialized = assertSafeArtifact(artifact, artifactPath);
  mkdirSync(path.dirname(path.join(repoRoot, artifactPath)), { recursive: true });
  writeFileSync(path.join(repoRoot, artifactPath), serialized);
  return serialized;
}

function checkArtifact(artifact, artifactPath) {
  const next = assertSafeArtifact(artifact, artifactPath);
  const artifactFile = path.join(repoRoot, artifactPath);
  if (!existsSync(artifactFile)) {
    throw new Error(`${artifactPath} is missing. Run pnpm run generate:v34-deployment-storage-posture.`);
  }
  const current = readFileSync(artifactFile, 'utf8');
  if (current !== next) {
    throw new Error(`${artifactPath} is stale. Run pnpm run generate:v34-deployment-storage-posture.`);
  }
}

function main() {
  const mode = process.argv.includes('--check') ? 'check' : 'write';
  const artifact = buildV34DeploymentStoragePostureArtifact();

  if (mode === 'check') {
    checkArtifact(artifact, ARTIFACT_PATH);
    process.stdout.write(`V34 deployment storage posture artifact ok ${ARTIFACT_PATH}\n`);
    return;
  }

  writeArtifact(artifact, ARTIFACT_PATH);
  process.stdout.write(`Wrote ${ARTIFACT_PATH}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
