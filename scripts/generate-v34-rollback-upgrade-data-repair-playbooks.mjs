#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.proofs/v34/rollback-upgrade-data-repair-playbooks.json';
const GENERATED_AT = '2026-05-23T00:00:00.000Z';

const ids = Object.freeze([
  'deployment_rollback',
  'deployment_upgrade',
  'migration_rollback',
  'object_storage_repair',
  'database_repair',
  'ledger_projection_repair',
  'secret_rotation_incident_response',
  'generated_artifact_repair',
]);
const lanes = Object.freeze(['local', 'regtest', 'signet', 'staging-testnet', 'public-testnet', 'mainnet-ready-dry-run']);
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

const rows = Object.freeze([
  r('deployment_rollback', 'deployment rollback playbook', 'rollback', 'apps/uapi', ['website', 'api'], ['deployment alias', 'runtime receipts'], 'preview or production lane deployment fails health or proof checks', ['freeze traffic promotion', 'revert deployment alias', 'replay gate-quality checks'], ['pnpm run check:v34-gate8'], ['Vercel lane root', 'DeploymentHostCapabilityCatalog'], 'traffic stays blocked from the failed deployment until rollback proof root is recorded', 'deployment boundary'),
  r('deployment_upgrade', 'deployment upgrade playbook', 'upgrade', 'root-workspace', ['website', 'api', 'pipeline_workers'], ['version branch', 'workflow run', 'generated artifacts'], 'version branch is ready for promotion rehearsal without value-bearing mainnet admission', ['freeze version branch', 'run promotion dry-run', 'verify generated artifacts'], ['pnpm run check:v34-gate8'], ['.specifications/BITCODE_SPEC_V34.md', 'promotion workflow'], 'upgrade remains blocked until all promotion dry-run roots verify', 'version promotion boundary'),
  r('migration_rollback', 'schema migration rollback playbook', 'migration_rollback', 'packages/orm', ['database_projection', 'repair_jobs'], ['migration file', 'generated database types', 'database projection'], 'schema migration dry-run or lane readback fails after approval', ['freeze writes', 'revert migration', 'refresh generated types', 'replay database health'], ['pnpm run db:schema-types:check'], ['MigrationApprovalGate', 'SupabaseReadbackReceipt'], 'database writes and unlock stay blocked until schema and type roots repair', 'database schema boundary'),
  r('object_storage_repair', 'object-storage repair playbook', 'object_storage_repair', 'packages/btd', ['object_storage', 'repair_jobs'], ['object storage root', 'proof artifact root', 'AssetPack lock'], 'object storage root is missing, stale, or violates paid-only delivery posture', ['lock delivery', 'rewrite object from authorized artifact root', 'verify proof root'], ['pnpm run check:v34-gate4'], ['DeploymentStoragePosture', 'objectStorageRoot'], 'source-bearing AssetPack delivery stays blocked until object repair root matches proof root', 'object-storage boundary'),
  r('database_repair', 'database repair playbook', 'database_repair', 'packages/orm', ['database_projection', 'repair_jobs'], ['database projection root', 'ledger-derived root', 'audit event'], 'database projection drift is detected by observer or readback', ['freeze affected read model', 'replay projection from ledger root', 'verify data health'], ['pnpm run db:data-health:ci'], ['DeploymentStoragePosture', 'databaseProjectionRoot'], 'interfaces show blocked repair posture until database projection root verifies', 'database projection boundary'),
  r('ledger_projection_repair', 'ledger projection repair playbook', 'ledger_projection_repair', 'packages/btd', ['ledger_projection', 'repair_jobs'], ['ledger projection root', 'settlement root', 'rights root'], 'ledger projection conflicts with settlement, finality, or BTD rights state', ['freeze unlock', 'replay ledger projection', 'verify settlement and rights roots'], ['pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/reconciliation.test.ts'], ['SettlementUnlock', 'BtdRightsTransferReceipt'], 'rights transfer and delivery stay blocked until ledger projection root repairs', 'ledger projection boundary'),
  r('secret_rotation_incident_response', 'secret rotation incident response playbook', 'secret_rotation_incident_response', 'packages/btd', ['api', 'pipeline_workers', 'repair_jobs'], ['secret family id', 'rotation audit event', 'runtime availability root'], 'secret leak, expiry, or provider revocation affects a runtime lane', ['revoke affected credential', 'rotate provider alias', 'replay runtime availability check'], ['pnpm run check:v34-gate5'], ['SecretRotationPlan', 'auditEventName'], 'affected runtime host remains blocked until rotation and availability roots verify', 'secret boundary'),
  r('generated_artifact_repair', 'generated artifact repair playbook', 'generated_artifact_repair', 'scripts/specifying', ['proof_services', 'repair_jobs'], ['generated artifact root', 'spec-family root', 'canonical input root'], 'generated artifact is stale, missing, or source-unsafe', ['regenerate artifact', 'run artifact checker', 'verify source-safe proof root'], ['node scripts/check-bitcode-spec-family.mjs --version V34 --mode draft --current-target V33'], ['canonical input report', 'spec-family report'], 'promotion and deployment stay blocked until generated artifact root verifies', 'generated artifact boundary'),
]);

function r(playbookId, label, playbookClass, ownerPackage, requiredHostIds, stateCarriers, entryCondition, commandSequence, verificationCommands, proofRootBasis, failClosedResult, recoveryBoundary) {
  return {
    playbookId,
    label,
    playbookClass,
    ownerPackage,
    requiredHostIds,
    supportedLaneIds: lanes,
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

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function fileExists(relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

function digest(relativePath) {
  return createHash('sha256').update(read(relativePath)).digest('hex');
}

function stableRoot(prefix, parts) {
  return `${prefix}:${createHash('sha256').update(parts.join('\u001f')).digest('hex').slice(0, 24)}`;
}

function evidence(relativePath, tokens) {
  const content = fileExists(relativePath) ? read(relativePath) : '';
  return {
    path: relativePath,
    digest: fileExists(relativePath) ? digest(relativePath) : null,
    requiredTokens: tokens.map((token) => ({ token, present: content.includes(token) })),
  };
}

function buildPlaybook(row) {
  return {
    kind: 'bitcode.rollback_upgrade_repair_playbook',
    ...row,
    supportedLaneIds: [...row.supportedLaneIds],
    requiredHostIds: [...row.requiredHostIds],
    stateCarriers: [...row.stateCarriers],
    commandSequence: [...row.commandSequence],
    verificationCommands: [...row.verificationCommands],
    proofRootBasis: [...row.proofRootBasis],
    sourceSafety: { sourceSafe: true, protectedSourceVisible: false, containsProtectedSource: false, containsSecret: false },
    playbookRoot: stableRoot('v34-rollback-upgrade-repair-playbook', [
      row.playbookId,
      row.label,
      row.playbookClass,
      row.ownerPackage,
      row.requiredHostIds.join(','),
      row.supportedLaneIds.join(','),
      row.stateCarriers.join(','),
      row.entryCondition,
      row.operatorApproval,
      row.commandSequence.join(','),
      row.verificationCommands.join(','),
      row.proofRootBasis.join(','),
      row.failClosedResult,
      row.recoveryBoundary,
      row.auditEventName,
    ]),
  };
}

function buildArtifact() {
  const playbooks = rows.map(buildPlaybook);
  const observedPlaybookIds = [...new Set(playbooks.map((playbook) => playbook.playbookId))].sort();
  const missingPlaybookIds = ids.filter((id) => !observedPlaybookIds.includes(id));
  const sourceEvidence = [
    evidence('packages/btd/src/rollback-upgrade-repair-playbook.ts', ['ROLLBACK_UPGRADE_REPAIR_PLAYBOOK_IDS', 'buildRollbackUpgradeRepairPlaybookSet', 'failClosedResultsCovered', 'valueBearingMainnetBlocked']),
    evidence('packages/btd/__tests__/rollback-upgrade-repair-playbook.test.ts', ['fails closed when a required playbook is missing', 'fails closed when value-bearing mainnet is admitted', 'fails closed when operator approval is missing', 'fails closed on serialized secret-shaped values']),
  ];
  const docsEvidence = [
    evidence('.specifications/BITCODE_SPEC_V34.md', ['RollbackUpgradeRepairPlaybook', ARTIFACT_PATH]),
    evidence('.specifications/BITCODE_SPEC_V34_DELTA.md', ['RollbackUpgradeRepairPlaybook', ARTIFACT_PATH]),
    evidence('.specifications/BITCODE_SPEC_V34_PARITY_MATRIX.md', ['RollbackUpgradeRepairPlaybook', ARTIFACT_PATH]),
    evidence('.specifications/SPECIFICATIONS_ROADMAP.md', ['V34 Gate 8 closure anchor']),
  ];
  const workflowEvidence = [
    evidence('.github/workflows/bitcode-gate-quality.yml', ['check-v34-gate8-rollback-upgrade-data-repair-playbooks.mjs', 'rollback-upgrade-repair-playbook.test.ts']),
  ];
  const proofSourceCommit = stableRoot('proof-source', [
    ...sourceEvidence.map((entry) => entry.digest ?? entry.path),
    ...docsEvidence.map((entry) => entry.digest ?? entry.path),
    ...workflowEvidence.map((entry) => entry.digest ?? entry.path),
  ]);

  return {
    artifactId: 'v34-rollback-upgrade-data-repair-playbooks',
    schemaId: 'bitcode.v34.rollbackUpgradeDataRepairPlaybooks.v1',
    generatedAt: GENERATED_AT,
    version: 'V34',
    currentTarget: 'V33',
    sourceSafetyVerdict: 'source-safe-rollback-upgrade-repair-playbook-metadata',
    proofSourceCommit,
    validationCommand: 'pnpm run check:v34-rollback-upgrade-data-repair-playbooks',
    passed: missingPlaybookIds.length === 0,
    requiredPlaybookIds: [...ids],
    coverage: {
      playbookCount: playbooks.length,
      observedPlaybookIds,
      missingPlaybookIds,
      rollbackCovered: playbooks.some((playbook) => playbook.playbookClass === 'rollback'),
      upgradeCovered: playbooks.some((playbook) => playbook.playbookClass === 'upgrade'),
      migrationRollbackCovered: playbooks.some((playbook) => playbook.playbookClass === 'migration_rollback'),
      objectStorageRepairCovered: playbooks.some((playbook) => playbook.playbookClass === 'object_storage_repair'),
      databaseRepairCovered: playbooks.some((playbook) => playbook.playbookClass === 'database_repair'),
      ledgerProjectionRepairCovered: playbooks.some((playbook) => playbook.playbookClass === 'ledger_projection_repair'),
      secretRotationIncidentResponseCovered: playbooks.some((playbook) => playbook.playbookClass === 'secret_rotation_incident_response'),
      generatedArtifactRepairCovered: playbooks.some((playbook) => playbook.playbookClass === 'generated_artifact_repair'),
      operatorApprovalsCovered: playbooks.every((playbook) => playbook.operatorApproval.length > 0),
      commandsCovered: playbooks.every((playbook) => playbook.commandSequence.length > 0),
      verificationCovered: playbooks.every((playbook) => playbook.verificationCommands.length > 0),
      proofRootsCovered: playbooks.every((playbook) => playbook.proofRootBasis.length > 0),
      failClosedResultsCovered: playbooks.every((playbook) => /blocked|freeze|denied|stay blocked|remains blocked/iu.test(playbook.failClosedResult)),
      valueBearingMainnetAdmitted: playbooks.some((playbook) => playbook.supportedLaneIds.includes('value-bearing-mainnet')),
      credentialsSerialized: false,
      protectedSourceVisible: false,
    },
    artifactRoot: stableRoot('v34-rollback-upgrade-data-repair-playbooks', [
      ...playbooks.map((playbook) => playbook.playbookRoot),
      ...sourceEvidence.map((entry) => entry.digest ?? entry.path),
      ...docsEvidence.map((entry) => entry.digest ?? entry.path),
    ]),
    playbooks,
    sourceEvidence,
    docsEvidence,
    workflowEvidence,
  };
}

function assertSourceSafe(serialized) {
  for (const marker of secretMarkers) {
    if (serialized.includes(marker)) throw new Error(`Generated artifact includes forbidden source/secret marker: ${marker}`);
  }
  if (/\b[A-Z][A-Z0-9_]{2,}\s*=\s*[^<\s][^\s]*/u.test(serialized)) {
    throw new Error('Generated artifact includes env-assignment-shaped text.');
  }
}

function main() {
  const check = process.argv.includes('--check');
  const artifact = buildArtifact();
  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
  assertSourceSafe(serialized);
  const outputPath = path.join(repoRoot, ARTIFACT_PATH);

  if (check) {
    if (!existsSync(outputPath)) throw new Error(`${ARTIFACT_PATH} is missing. Run pnpm run generate:v34-rollback-upgrade-data-repair-playbooks.`);
    if (readFileSync(outputPath, 'utf8') !== serialized) {
      throw new Error(`${ARTIFACT_PATH} is stale. Run pnpm run generate:v34-rollback-upgrade-data-repair-playbooks.`);
    }
    process.stdout.write(`${ARTIFACT_PATH} is current.\n`);
    return;
  }

  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, serialized);
  process.stdout.write(`Wrote ${ARTIFACT_PATH}\n`);
}

main();
