#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT = '.proofs/v34/deployment-storage-posture.json';

const REQUIRED_CARRIER_IDS = [
  'ledger_derived_state',
  'canonical_database_projection',
  'protected_assetpack_object_storage',
  'source_safe_assetpack_preview_storage',
  'generated_proof_artifacts',
  'audit_log_stream',
  'rollback_material',
  'encrypted_backups',
];

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
  'raw source',
  'source contents',
];

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function fileExists(root, relativePath) {
  return existsSync(path.join(root, relativePath));
}

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function run(root, command, args) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function includesAll(values, requiredValues) {
  return requiredValues.every((value) => values.includes(value));
}

function parseArgs(argv) {
  const args = {
    skipBranchCheck: false,
    repoRoot: defaultRepoRoot,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }

  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v34-gate4-deployment-storage-posture.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V34 Gate 4 Ledger Database Object Storage Deployment Posture source, generated artifact, tests, docs, package scripts, and workflow wiring.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const root = args.repoRoot;
  const failures = [];
  const pointer = read(root, '.specifications/BITCODE_SPEC.txt').trim();

  assertCheck(
    failures,
    pointer === 'V33',
    `BITCODE_SPEC.txt must remain V33 during V34 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v34' || /^v34\/gate-(?:[4-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V34 Gate 4+ work must occur on version/v34 or v34/gate-4..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT,
    'packages/btd/src/deployment-storage-posture.ts',
    'packages/btd/src/index.ts',
    'packages/btd/package.json',
    'packages/btd/__tests__/deployment-storage-posture.test.ts',
    'scripts/generate-v34-deployment-storage-posture.mjs',
    'scripts/check-v34-gate4-deployment-storage-posture.mjs',
    '.specifications/BITCODE_SPEC_V34.md',
    '.specifications/BITCODE_SPEC_V34_DELTA.md',
    '.specifications/BITCODE_SPEC_V34_NOTES.md',
    '.specifications/BITCODE_SPEC_V34_PARITY_MATRIX.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    'scripts/specifying/src/canonical/v21-specifying.js',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V34 Gate 4 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', ['run', 'check:v34-deployment-storage-posture']);
    } catch (error) {
      failures.push(`V34 Gate 4 artifact check failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT) ? read(root, ARTIFACT) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V34 storage posture artifact must not contain secret/source marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v34-deployment-storage-posture', 'Artifact id must match Gate 4 storage posture.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v34.deploymentStoragePosture.v1', 'Artifact schema id must match.');
    assertCheck(failures, artifact.version === 'V34' && artifact.currentTarget === 'V33', 'Artifact must bind V34 over active V33.');
    assertCheck(failures, artifact.passed === true, 'Artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-deployment-storage-posture-metadata',
      'Artifact must be source-safe deployment storage metadata.',
    );
    assertCheck(failures, includesAll(artifact.requiredCarrierIds, REQUIRED_CARRIER_IDS), 'Artifact must enumerate every required storage carrier.');
    assertCheck(failures, includesAll(artifact.coverage.observedCarrierIds, REQUIRED_CARRIER_IDS), 'Artifact coverage must observe every carrier.');
    assertCheck(failures, artifact.coverage.carrierCount === 8, 'Artifact must prove eight storage carrier rows.');
    assertCheck(failures, artifact.coverage.ledgerDerivedStateCovered === true, 'Ledger-derived state must be covered.');
    assertCheck(failures, artifact.coverage.databaseProjectionCovered === true, 'Database projection must be covered.');
    assertCheck(failures, artifact.coverage.objectStorageCovered === true, 'Object storage must be covered.');
    assertCheck(failures, artifact.coverage.proofArtifactsCovered === true, 'Proof artifacts must be covered.');
    assertCheck(failures, artifact.coverage.auditLogsCovered === true, 'Audit logs must be covered.');
    assertCheck(failures, artifact.coverage.rollbackMaterialCovered === true, 'Rollback material must be covered.');
    assertCheck(failures, artifact.coverage.backupsCovered === true, 'Backups must be covered.');
    assertCheck(failures, artifact.coverage.retentionCovered === true, 'Retention posture must be covered.');
    assertCheck(failures, artifact.coverage.encryptionCovered === true, 'Encryption posture must be covered.');
    assertCheck(failures, artifact.coverage.repairCommandsCovered === true, 'Repair commands must be covered.');
    assertCheck(
      failures,
      artifact.coverage.sourceBearingAssetPackLockedBeforeSettlement === true,
      'Source-bearing AssetPack storage must remain locked before settlement.',
    );
    assertCheck(
      failures,
      artifact.coverage.ledgerDatabaseProjectionDriftRepairable === true,
      'Ledger/database projection drift must be repairable.',
    );
    assertCheck(
      failures,
      artifact.coverage.objectStorageProjectionDriftRepairable === true,
      'Object-storage projection drift must be repairable.',
    );
    assertCheck(failures, artifact.coverage.valueBearingMainnetAdmitted === false, 'Storage posture must not admit value-bearing mainnet.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Artifact must not serialize credentials.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Artifact must not expose protected source.');
    assertCheck(
      failures,
      artifact.carriers.every((carrier) => /^v34-deployment-storage-carrier:[a-f0-9]{24}$/u.test(carrier.carrierRoot)),
      'Storage carrier rows must have deterministic carrier roots.',
    );
    assertCheck(
      failures,
      artifact.driftRepairFixtures.every((fixture) => /^v34-deployment-storage-drift-repair-fixture:[a-f0-9]{24}$/u.test(fixture.fixtureRoot)),
      'Storage drift repair fixtures must have deterministic fixture roots.',
    );
    assertCheck(
      failures,
      artifact.sourceEvidence.every((entry) => entry.requiredTokens.every((token) => token.present === true)),
      'Source evidence tokens must all be present.',
    );
    assertCheck(
      failures,
      artifact.testEvidence.every((entry) => entry.requiredTokens.every((token) => token.present === true)),
      'Test evidence tokens must all be present.',
    );
  }

  const spec = read(root, '.specifications/BITCODE_SPEC_V34.md');
  const delta = read(root, '.specifications/BITCODE_SPEC_V34_DELTA.md');
  const notes = read(root, '.specifications/BITCODE_SPEC_V34_NOTES.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V34_PARITY_MATRIX.md');
  const roadmap = read(root, '.specifications/SPECIFICATIONS_ROADMAP.md');
  const packageJson = read(root, 'package.json');
  const btdPackageJson = read(root, 'packages/btd/package.json');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const source = read(root, 'packages/btd/src/deployment-storage-posture.ts');
  const test = read(root, 'packages/btd/__tests__/deployment-storage-posture.test.ts');
  const specifying = read(root, 'scripts/specifying/src/canonical/v21-specifying.js');

  for (const doc of [spec, delta, notes, parity]) {
    assertCheck(failures, doc.includes(ARTIFACT), `V34 docs must mention ${ARTIFACT}.`);
    assertCheck(failures, doc.includes('DeploymentStoragePosture'), 'V34 docs must name DeploymentStoragePosture.');
    assertCheck(failures, doc.includes('ledger-derived state'), 'V34 docs must name ledger-derived state.');
    assertCheck(failures, doc.includes('database projection'), 'V34 docs must name database projection.');
    assertCheck(failures, doc.includes('object storage'), 'V34 docs must name object storage.');
    assertCheck(failures, doc.includes('rollback material'), 'V34 docs must name rollback material.');
    assertCheck(failures, doc.includes('source-bearing AssetPack storage remains locked before settlement'), 'V34 docs must name the source lock invariant.');
  }

  assertCheck(
    failures,
    /Current working gate: V34 Gate (?:[5-9]|10)\b/u.test(roadmap),
    'Roadmap must advance past V34 Gate 4 after this gate closes.',
  );
  assertCheck(failures, packageJson.includes('"generate:v34-deployment-storage-posture"'), 'package.json must expose the Gate 4 generator.');
  assertCheck(failures, packageJson.includes('"check:v34-deployment-storage-posture"'), 'package.json must expose the Gate 4 artifact check.');
  assertCheck(failures, packageJson.includes('"check:v34-gate4"'), 'package.json must expose check:v34-gate4.');
  assertCheck(failures, btdPackageJson.includes('"./deployment-storage-posture"'), '@bitcode/btd must export deployment-storage-posture.');
  assertCheck(failures, workflow.includes('check-v34-gate4-deployment-storage-posture.mjs'), 'Gate workflow must run the V34 Gate 4 checker.');
  assertCheck(failures, workflow.includes('deployment-storage-posture.test.ts'), 'Gate workflow must run the focused deployment storage posture test.');
  assertCheck(failures, specifying.includes(ARTIFACT), 'Spec-family profile must include the Gate 4 artifact path.');

  for (const phrase of [
    'DeploymentStoragePosture',
    'DEPLOYMENT_STORAGE_CARRIER_IDS',
    'protected_source_locked_until_settlement',
    'ledger_database_projection_drift',
    'database_object_storage_projection_drift',
    'unpaid_source_visibility_attempt',
    'value-bearing-mainnet',
  ]) {
    assertCheck(failures, source.includes(phrase), `Gate 4 source must include ${phrase}.`);
  }

  for (const phrase of [
    'catalogs ledger-derived state, database projections, object storage, proofs, audit logs, rollback material, and backups',
    'requires durability, disclosure, retention, encryption, backup, rollback, root, repair, validation, and proof fields for each storage carrier',
    'keeps source-bearing AssetPack storage locked before settlement',
    'proves ledger/database and object-storage projection drift repair fixtures',
    'fails closed when a required deployment storage carrier is missing',
    'fails closed when source-bearing AssetPack storage becomes visible before settlement',
    'fails closed when storage posture admits value-bearing mainnet before future canon',
    'fails closed on secret-shaped or non-disclosable source storage text',
  ]) {
    assertCheck(failures, test.includes(phrase), `Gate 4 test must assert: ${phrase}.`);
  }

  if (failures.length) {
    process.stderr.write('V34 Gate 4 Ledger Database Object Storage Deployment Posture check failed:\n');
    for (const failure of failures) {
      process.stderr.write(`- ${failure}\n`);
    }
    process.exit(1);
  }

  process.stdout.write(`V34 Gate 4 Ledger Database Object Storage Deployment Posture ok ${ARTIFACT}\n`);
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
