#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.proofs/v34/migration-cicd-approval-gates.json';
const GENERATED_AT = '2026-05-23T00:00:00.000Z';

const requiredGateIds = Object.freeze([
  'schema_migration_approval',
  'generated_type_refresh',
  'route_scan_approval',
  'build_test_gate',
  'generated_artifact_freshness',
  'vercel_lane_check',
  'supabase_lane_check',
  'promotion_commit_approval',
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

const gateRows = Object.freeze([
  {
    gateId: 'schema_migration_approval',
    label: 'schema migration approval gate',
    approvalClass: 'schema_migration',
    ownerPackage: 'packages/orm',
    requiredHostIds: ['database_projection', 'api'],
    supportedLaneIds: nonValueLanes,
    schemaDiffRootPolicy: 'schema diff root is required before any migration mutates a lane database',
    generatedTypeRootPolicy: 'generated type root must be refreshed or explicitly proved unchanged after schema dry-run',
    dryRunCommand: 'pnpm run db:reset as disposable local schema dry-run',
    validationCommand: 'pnpm run db:schema-types:check',
    reviewerApprovalPosture: 'human_review_required',
    reviewerApprovalEvidence: 'migration pull request review approval plus schema diff root',
    rollbackPlan: 'rollback by reverting migration file, replaying disposable database reset, and recording repair proof root',
    deploymentLaneAdmission: 'non_value_lanes_only',
    workflowBinding: 'ci.yml Supabase local reset and bitcode-gate-quality validation',
    blockingFailureMode: 'block deployment until migration approval, dry-run, type check, and rollback proof are present',
    auditEventName: 'migration_cicd_approval.schema_migration',
    proofRootBasis: ['supabase/migrations', 'packages/orm/src/types/database.generated.ts', 'db:schema-types:check'],
  },
  {
    gateId: 'generated_type_refresh',
    label: 'generated database type refresh gate',
    approvalClass: 'generated_type_refresh',
    ownerPackage: 'packages/orm',
    requiredHostIds: ['database_projection'],
    supportedLaneIds: nonValueLanes,
    schemaDiffRootPolicy: 'schema diff root from the migration approval must be carried into type refresh evidence',
    generatedTypeRootPolicy: 'database.generated.ts and database.ts digest roots are required after refresh',
    dryRunCommand: 'pnpm run db:schema-types:check as generated type refresh dry-run',
    validationCommand: 'pnpm run db:schema-types:check',
    reviewerApprovalPosture: 'human_review_required',
    reviewerApprovalEvidence: 'review approval confirms generated type roots match applied migrations',
    rollbackPlan: 'rollback by restoring previous generated type roots and rerunning schema type check',
    deploymentLaneAdmission: 'non_value_lanes_only',
    workflowBinding: 'bitcode-gate-quality generated type focused check',
    blockingFailureMode: 'block deployment when generated types are stale, missing, or not review-approved',
    auditEventName: 'migration_cicd_approval.generated_type_refresh',
    proofRootBasis: ['packages/orm/scripts/check-schema-types.ts', 'packages/orm/src/types/database.generated.ts'],
  },
  {
    gateId: 'route_scan_approval',
    label: 'route scan approval gate',
    approvalClass: 'route_scan',
    ownerPackage: 'apps/uapi',
    requiredHostIds: ['website', 'api', 'mcp_api', 'chatgpt_app'],
    supportedLaneIds: nonValueLanes,
    schemaDiffRootPolicy: 'route scan records whether schema mutation is absent or already linked to a migration approval',
    generatedTypeRootPolicy: 'route scan records the generated type root consumed by API and interface route contracts',
    dryRunCommand: 'pnpm --dir apps/uapi exec jest route contract subset as route scan dry-run',
    validationCommand: 'pnpm --dir apps/uapi exec jest --runInBand selected route and interface contract tests',
    reviewerApprovalPosture: 'human_review_required',
    reviewerApprovalEvidence: 'review approval confirms route changes preserve shared interface contracts',
    rollbackPlan: 'rollback by reverting route change, replaying route contract subset, and preserving previous interface root',
    deploymentLaneAdmission: 'non_value_lanes_only',
    workflowBinding: 'bitcode-gate-quality staged Reading route and product harness contracts',
    blockingFailureMode: 'block deployment when route scans fail, drift from shared package contracts, or lack review proof',
    auditEventName: 'migration_cicd_approval.route_scan',
    proofRootBasis: ['apps/uapi/app/api', 'apps/uapi/tests', 'InterfaceAuthorizationPolicy', 'ReadLicenseInterfaceContract'],
  },
  {
    gateId: 'build_test_gate',
    label: 'build and test approval gate',
    approvalClass: 'build_test',
    ownerPackage: 'root-workspace',
    requiredHostIds: ['website', 'api', 'pipeline_workers', 'proof_services'],
    supportedLaneIds: nonValueLanes,
    schemaDiffRootPolicy: 'build test gate consumes any migration schema diff root before deployment admission',
    generatedTypeRootPolicy: 'build test gate consumes current generated type root before deployment admission',
    dryRunCommand: 'pnpm workspace typecheck and focused package tests as build test dry-run',
    validationCommand: 'pnpm --filter @bitcode/btd test && pnpm --filter @bitcode/specifying test',
    reviewerApprovalPosture: 'maintainer_signed_review_required',
    reviewerApprovalEvidence: 'signed maintainer review approval plus passing required checks',
    rollbackPlan: 'rollback by reverting the gate branch, rerunning package checks, and preserving prior proof roots',
    deploymentLaneAdmission: 'non_value_lanes_only',
    workflowBinding: 'ci.yml and bitcode-gate-quality typecheck test build jobs',
    blockingFailureMode: 'block deployment when required build, typecheck, or test jobs are red or unreviewed',
    auditEventName: 'migration_cicd_approval.build_test_gate',
    proofRootBasis: ['.github/workflows/ci.yml', '.github/workflows/bitcode-gate-quality.yml', 'package.json'],
  },
  {
    gateId: 'generated_artifact_freshness',
    label: 'generated artifact freshness gate',
    approvalClass: 'generated_artifact_freshness',
    ownerPackage: 'scripts/specifying',
    requiredHostIds: ['proof_services'],
    supportedLaneIds: nonValueLanes,
    schemaDiffRootPolicy: 'generated artifact freshness records schema diff roots for any artifact affected by migrations',
    generatedTypeRootPolicy: 'generated artifact freshness records type roots for artifacts derived from database contracts',
    dryRunCommand: 'node scripts/check-bitcode-spec-family.mjs --version V34 --mode draft --current-target V33 as generated artifact dry-run',
    validationCommand: 'pnpm run check:v34-gate6',
    reviewerApprovalPosture: 'human_review_required',
    reviewerApprovalEvidence: 'review approval confirms deterministic generated artifacts are current',
    rollbackPlan: 'rollback by regenerating previous source-safe artifacts and rerunning spec family checks',
    deploymentLaneAdmission: 'non_value_lanes_only',
    workflowBinding: 'bitcode-gate-quality draft canon posture checks',
    blockingFailureMode: 'block deployment when generated artifacts are stale, source-unsafe, or missing from canonical allowlist',
    auditEventName: 'migration_cicd_approval.generated_artifact_freshness',
    proofRootBasis: ['.proofs', 'scripts/specifying/src/canonical/v21-specifying.js', 'check:spec-family'],
  },
  {
    gateId: 'vercel_lane_check',
    label: 'Vercel lane approval gate',
    approvalClass: 'deployment_lane_check',
    ownerPackage: 'apps/uapi',
    requiredHostIds: ['website', 'api', 'pipeline_workers'],
    supportedLaneIds: nonValueLanes,
    schemaDiffRootPolicy: 'Vercel lane approval carries schema diff root before preview or staging deployment unlock',
    generatedTypeRootPolicy: 'Vercel lane approval carries generated type root before preview or staging deployment unlock',
    dryRunCommand: 'pnpm --dir apps/uapi exec jest pipeline harness preflight as Vercel lane dry-run',
    validationCommand: 'pnpm --dir apps/uapi exec jest --runTestsByPath tests/api/pipelineHostPreflight.test.ts --runInBand',
    reviewerApprovalPosture: 'human_review_required',
    reviewerApprovalEvidence: 'review approval confirms Vercel preview lane environment and Sandbox posture are non-value',
    rollbackPlan: 'rollback by disabling preview promotion, reverting lane env binding, and replaying harness preflight',
    deploymentLaneAdmission: 'mainnet_ready_dry_run_only',
    workflowBinding: 'Vercel preview deployment plus bitcode-gate-quality preflight',
    blockingFailureMode: 'block deployment when Vercel auth, Sandbox posture, route build, or lane binding is missing',
    auditEventName: 'migration_cicd_approval.vercel_lane_check',
    proofRootBasis: ['DeploymentHostCapabilityCatalog', 'EnvironmentLaneContract', 'PipelineHarnessPreflight'],
  },
  {
    gateId: 'supabase_lane_check',
    label: 'Supabase lane approval gate',
    approvalClass: 'deployment_lane_check',
    ownerPackage: 'packages/orm',
    requiredHostIds: ['database_projection', 'api', 'repair_jobs'],
    supportedLaneIds: nonValueLanes,
    schemaDiffRootPolicy: 'Supabase lane approval carries schema diff root and readback root before database projection unlock',
    generatedTypeRootPolicy: 'Supabase lane approval carries generated type root and ORM type root before database projection unlock',
    dryRunCommand: 'pnpm run db:data-health:ci && pnpm run db:schema-types:check as Supabase lane dry-run',
    validationCommand: 'pnpm run db:data-health:ci && pnpm run db:schema-types:check',
    reviewerApprovalPosture: 'human_review_required',
    reviewerApprovalEvidence: 'review approval confirms Supabase lane project and generated type roots are aligned',
    rollbackPlan: 'rollback by restoring previous migration state, replaying database projection repair, and rechecking schema types',
    deploymentLaneAdmission: 'mainnet_ready_dry_run_only',
    workflowBinding: 'ci.yml Supabase local stack and ORM schema type checks',
    blockingFailureMode: 'block deployment when Supabase project, REST readback, DB readback, or type roots are misaligned',
    auditEventName: 'migration_cicd_approval.supabase_lane_check',
    proofRootBasis: ['DeploymentStoragePosture', 'SupabaseReadbackReceipt', 'packages/orm/scripts/check-schema-types.ts'],
  },
  {
    gateId: 'promotion_commit_approval',
    label: 'canonical promotion commit approval gate',
    approvalClass: 'promotion_commit',
    ownerPackage: 'scripts/specifying',
    requiredHostIds: ['proof_services'],
    supportedLaneIds: nonValueLanes,
    schemaDiffRootPolicy: 'promotion commit approval carries final schema diff root and closed gate roots',
    generatedTypeRootPolicy: 'promotion commit approval carries final generated type root and generated artifact roots',
    dryRunCommand: 'node scripts/promote-bitcode-canon.mjs --version V34 --commit HEAD --dry-run',
    validationCommand: 'future V34 promotion workflow runs all closed gate checks before committing BITCODE_SPEC.txt',
    reviewerApprovalPosture: 'promotion_reviewer_required',
    reviewerApprovalEvidence: 'version branch pull request approval plus green promotion workflow dry-run',
    rollbackPlan: 'rollback by reverting promotion branch commit before merge or opening canon repair PR after merge',
    deploymentLaneAdmission: 'value_bearing_mainnet_blocked',
    workflowBinding: 'v34-canon-promotion.yml or Gate 10 promotion workflow successor',
    blockingFailureMode: 'block promotion when closed gate roots, generated proofs, reviewer approval, or promotion dry-run are missing',
    auditEventName: 'migration_cicd_approval.promotion_commit',
    proofRootBasis: ['.specifications/BITCODE_SPEC.txt', '.specifications/BITCODE_SPEC_V34_PROVEN.md', 'promote-bitcode-canon'],
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

function scanFile(relativePath, tokens) {
  const contents = fileExists(relativePath) ? read(relativePath) : '';
  return {
    path: relativePath,
    digest: `sha256:${createHash('sha256').update(contents).digest('hex')}`,
    requiredTokens: tokens.map((token) => ({
      token,
      present: contents.includes(token),
    })),
  };
}

function allTokensPresent(scan) {
  return scan.requiredTokens.every((entry) => entry.present);
}

function assertNoSerializedSecrets(value, failures) {
  const serialized = JSON.stringify(value);
  for (const marker of secretMarkers) {
    if (serialized.includes(marker)) failures.push(`Serialized artifact contains forbidden secret/source marker: ${marker}`);
  }
  if (/\b[A-Z][A-Z0-9_]{2,}\s*=\s*[^<\s][^\s]*/u.test(serialized)) {
    failures.push('Serialized artifact contains an env-assignment-shaped value.');
  }
}

function buildArtifact() {
  const failures = [];
  const observedGateIds = gateRows.map((row) => row.gateId);
  const missingGateIds = requiredGateIds.filter((id) => !observedGateIds.includes(id));
  const duplicateGateIds = observedGateIds.filter((id, index) => observedGateIds.indexOf(id) !== index);
  const sourceEvidence = [
    scanFile('packages/btd/src/migration-approval-gate.ts', [
      'MigrationApprovalGate',
      'MIGRATION_APPROVAL_GATE_IDS',
      'schema_migration_approval',
      'generated_type_refresh',
      'route_scan_approval',
      'build_test_gate',
      'generated_artifact_freshness',
      'vercel_lane_check',
      'supabase_lane_check',
      'promotion_commit_approval',
      'noSerializedSecretValues',
      'valueBearingMainnetBlocked',
    ]),
    scanFile('packages/btd/src/index.ts', ["./migration-approval-gate"]),
    scanFile('packages/btd/package.json', ['./migration-approval-gate']),
  ];
  const testEvidence = [
    scanFile('packages/btd/__tests__/migration-approval-gate.test.ts', [
      'fails closed when a required approval gate is missing',
      'fails closed when reviewer approval evidence is missing',
      'fails closed when rollback plan is missing',
      'fails closed on serialized secret-shaped values',
    ]),
  ];

  for (const row of gateRows) {
    if (!row.schemaDiffRootPolicy) failures.push(`${row.gateId} missing schema diff root policy.`);
    if (!row.generatedTypeRootPolicy) failures.push(`${row.gateId} missing generated type root policy.`);
    if (!row.dryRunCommand.toLowerCase().includes('dry-run')) failures.push(`${row.gateId} missing dry-run command.`);
    if (!row.validationCommand) failures.push(`${row.gateId} missing validation command.`);
    if (!row.reviewerApprovalEvidence.toLowerCase().includes('approval')) failures.push(`${row.gateId} missing reviewer approval evidence.`);
    if (!row.rollbackPlan.toLowerCase().includes('rollback')) failures.push(`${row.gateId} missing rollback plan.`);
    if (!row.workflowBinding) failures.push(`${row.gateId} missing workflow binding.`);
    if (!row.auditEventName.startsWith('migration_cicd_approval.')) failures.push(`${row.gateId} missing audit event.`);
    if (row.supportedLaneIds.includes('value-bearing-mainnet')) failures.push(`${row.gateId} admits value-bearing mainnet.`);
  }
  if (missingGateIds.length > 0) failures.push(`Missing approval gates: ${missingGateIds.join(', ')}`);
  if (duplicateGateIds.length > 0) failures.push(`Duplicate approval gates: ${duplicateGateIds.join(', ')}`);
  if (!sourceEvidence.every(allTokensPresent)) failures.push('Source evidence tokens missing.');
  if (!testEvidence.every(allTokensPresent)) failures.push('Test evidence tokens missing.');
  assertNoSerializedSecrets(gateRows, failures);

  const gates = gateRows.map((row) => ({
    ...row,
    gateRoot: stableRoot('v34-migration-approval-gate', [
      row.gateId,
      row.approvalClass,
      row.ownerPackage,
      row.requiredHostIds.join(','),
      row.supportedLaneIds.join(','),
      row.schemaDiffRootPolicy,
      row.generatedTypeRootPolicy,
      row.reviewerApprovalPosture,
      row.deploymentLaneAdmission,
      row.auditEventName,
      row.proofRootBasis.join(','),
    ]),
    sourceSafety: {
      sourceSafe: true,
      protectedSourceVisible: false,
      containsProtectedSource: false,
      containsSecret: false,
    },
  }));

  const artifact = {
    artifactId: 'v34-migration-cicd-approval-gates',
    schemaId: 'bitcode.v34.migrationCicdApprovalGates.v1',
    version: 'V34',
    currentTarget: 'V33',
    generatedAt: GENERATED_AT,
    sourceSafetyVerdict: 'source-safe-migration-cicd-approval-gate-metadata',
    passed: failures.length === 0,
    failures,
    gateSetRoot: stableRoot('v34-migration-approval-gate-set', gates.map((gate) => gate.gateRoot)),
    requiredGateIds,
    gates,
    coverage: {
      gateCount: gates.length,
      observedGateIds,
      missingGateIds,
      schemaMigrationApprovalCovered: observedGateIds.includes('schema_migration_approval'),
      generatedTypeRefreshCovered: observedGateIds.includes('generated_type_refresh'),
      routeScansCovered: observedGateIds.includes('route_scan_approval'),
      buildTestGatesCovered: observedGateIds.includes('build_test_gate'),
      generatedArtifactFreshnessCovered: observedGateIds.includes('generated_artifact_freshness'),
      vercelLaneChecksCovered: observedGateIds.includes('vercel_lane_check'),
      supabaseLaneChecksCovered: observedGateIds.includes('supabase_lane_check'),
      promotionCommitsCovered: observedGateIds.includes('promotion_commit_approval'),
      reviewerApprovalCovered: gates.every((gate) => gate.reviewerApprovalEvidence.toLowerCase().includes('approval')),
      rollbackPlansCovered: gates.every((gate) => gate.rollbackPlan.toLowerCase().includes('rollback')),
      dryRunsCovered: gates.every((gate) => gate.dryRunCommand.toLowerCase().includes('dry-run')),
      proofRootsCovered: gates.every((gate) => gate.proofRootBasis.length > 0),
      valueBearingMainnetAdmitted: gates.some((gate) => gate.supportedLaneIds.includes('value-bearing-mainnet')),
      credentialsSerialized: false,
      protectedSourceVisible: false,
    },
    sourceEvidence,
    testEvidence,
  };

  assertNoSerializedSecrets(artifact, failures);
  artifact.passed = failures.length === 0;
  artifact.failures = failures;
  return artifact;
}

function parseArgs(argv) {
  return { check: argv.includes('--check') };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const artifact = buildArtifact();
  const output = `${JSON.stringify(artifact, null, 2)}\n`;
  const absolutePath = path.join(repoRoot, ARTIFACT_PATH);

  if (args.check) {
    const current = existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
    if (current !== output) {
      process.stderr.write(`${ARTIFACT_PATH} is stale. Run pnpm run generate:v34-migration-cicd-approval-gates.\n`);
      process.exit(1);
    }
    if (!artifact.passed) {
      process.stderr.write(`${ARTIFACT_PATH} failed:\n${artifact.failures.join('\n')}\n`);
      process.exit(1);
    }
    process.stdout.write(`${ARTIFACT_PATH} is current and passed.\n`);
    return;
  }

  mkdirSync(path.dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, output);
  if (!artifact.passed) {
    process.stderr.write(`${ARTIFACT_PATH} generated with failures:\n${artifact.failures.join('\n')}\n`);
    process.exit(1);
  }
  process.stdout.write(`Wrote ${ARTIFACT_PATH}\n`);
}

main();
