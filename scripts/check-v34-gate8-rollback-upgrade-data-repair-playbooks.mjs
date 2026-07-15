#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT = '.bitcode/v34-rollback-upgrade-data-repair-playbooks.json';
const REQUIRED_PLAYBOOK_IDS = [
  'deployment_rollback',
  'deployment_upgrade',
  'migration_rollback',
  'object_storage_repair',
  'database_repair',
  'ledger_projection_repair',
  'secret_rotation_incident_response',
  'generated_artifact_repair',
];
const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
  '-----BEGIN PRIVATE KEY-----',
  'wallet seed',
  'mnemonic',
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
  return execFileSync(command, args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function includesAll(values, requiredValues) {
  return requiredValues.every((value) => values.includes(value));
}

function parseArgs(argv) {
  const args = { skipBranchCheck: false, repoRoot: defaultRepoRoot };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write('Usage: node scripts/check-v34-gate8-rollback-upgrade-data-repair-playbooks.mjs [--skip-branch-check] [--repo-root <path>]\n');
    return;
  }

  const root = args.repoRoot;
  const failures = [];
  const pointer = read(root, '.specifications/BITCODE_SPEC.txt').trim();
  assertCheck(failures, pointer === 'V33', `BITCODE_SPEC.txt must remain V33 during V34 gate work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v34' || /^v34\/gate-(?:8|9|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V34 Gate 8+ work must occur on version/v34 or v34/gate-8..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT,
    'packages/btd/src/rollback-upgrade-repair-playbook.ts',
    'packages/btd/src/index.ts',
    'packages/btd/package.json',
    'packages/btd/__tests__/rollback-upgrade-repair-playbook.test.ts',
    'scripts/generate-v34-rollback-upgrade-data-repair-playbooks.mjs',
    'scripts/check-v34-gate8-rollback-upgrade-data-repair-playbooks.mjs',
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
    assertCheck(failures, fileExists(root, relativePath), `Missing V34 Gate 8 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', ['run', 'check:v34-rollback-upgrade-data-repair-playbooks']);
    } catch (error) {
      failures.push(`V34 Gate 8 artifact check failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT) ? read(root, ARTIFACT) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V34 rollback playbook artifact must not contain secret/source marker ${marker}.`);
  }
  assertCheck(failures, !/\b[A-Z][A-Z0-9_]{2,}\s*=\s*[^<\s][^\s]*/u.test(serializedArtifact), 'V34 rollback playbook artifact must not contain env-assignment-shaped values.');

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v34-rollback-upgrade-data-repair-playbooks', 'Artifact id must match Gate 8 rollback playbooks.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v34.rollbackUpgradeDataRepairPlaybooks.v1', 'Artifact schema id must match.');
    assertCheck(failures, artifact.version === 'V34' && artifact.currentTarget === 'V33', 'Artifact must bind V34 over active V33.');
    assertCheck(failures, artifact.passed === true, 'Artifact must pass.');
    assertCheck(failures, artifact.sourceSafetyVerdict === 'source-safe-rollback-upgrade-repair-playbook-metadata', 'Artifact must be source-safe rollback upgrade repair metadata.');
    assertCheck(failures, includesAll(artifact.requiredPlaybookIds, REQUIRED_PLAYBOOK_IDS), 'Artifact must enumerate every required playbook.');
    assertCheck(failures, includesAll(artifact.coverage.observedPlaybookIds, REQUIRED_PLAYBOOK_IDS), 'Artifact coverage must observe every playbook.');
    assertCheck(failures, artifact.coverage.playbookCount === 8, 'Artifact must prove eight playbooks.');
    assertCheck(failures, artifact.coverage.rollbackCovered === true, 'Rollback playbook must be covered.');
    assertCheck(failures, artifact.coverage.upgradeCovered === true, 'Upgrade playbook must be covered.');
    assertCheck(failures, artifact.coverage.migrationRollbackCovered === true, 'Migration rollback playbook must be covered.');
    assertCheck(failures, artifact.coverage.objectStorageRepairCovered === true, 'Object-storage repair playbook must be covered.');
    assertCheck(failures, artifact.coverage.databaseRepairCovered === true, 'Database repair playbook must be covered.');
    assertCheck(failures, artifact.coverage.ledgerProjectionRepairCovered === true, 'Ledger projection repair playbook must be covered.');
    assertCheck(failures, artifact.coverage.secretRotationIncidentResponseCovered === true, 'Secret rotation incident response playbook must be covered.');
    assertCheck(failures, artifact.coverage.generatedArtifactRepairCovered === true, 'Generated artifact repair playbook must be covered.');
    assertCheck(failures, artifact.coverage.operatorApprovalsCovered === true, 'Operator approvals must be covered.');
    assertCheck(failures, artifact.coverage.commandsCovered === true, 'Commands must be covered.');
    assertCheck(failures, artifact.coverage.verificationCovered === true, 'Verification must be covered.');
    assertCheck(failures, artifact.coverage.proofRootsCovered === true, 'Proof roots must be covered.');
    assertCheck(failures, artifact.coverage.failClosedResultsCovered === true, 'Fail-closed results must be covered.');
    assertCheck(failures, artifact.coverage.valueBearingMainnetAdmitted === false, 'Playbooks must not admit value-bearing mainnet.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Artifact must not serialize credentials.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Artifact must not expose protected source.');
    assertCheck(failures, artifact.playbooks.every((playbook) => /^v34-rollback-upgrade-repair-playbook:[a-f0-9]{24}$/u.test(playbook.playbookRoot)), 'Playbook rows must have deterministic roots.');
    assertCheck(failures, artifact.sourceEvidence.every((entry) => entry.requiredTokens.every((token) => token.present === true)), 'Source evidence tokens must all be present.');
    assertCheck(failures, artifact.docsEvidence.every((entry) => entry.requiredTokens.every((token) => token.present === true)), 'Docs evidence tokens must all be present.');
    assertCheck(failures, artifact.workflowEvidence.every((entry) => entry.requiredTokens.every((token) => token.present === true)), 'Workflow evidence tokens must all be present.');
  }

  const spec = read(root, '.specifications/BITCODE_SPEC_V34.md');
  const delta = read(root, '.specifications/BITCODE_SPEC_V34_DELTA.md');
  const notes = read(root, '.specifications/BITCODE_SPEC_V34_NOTES.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V34_PARITY_MATRIX.md');
  const roadmap = read(root, '.specifications/SPECIFICATIONS_ROADMAP.md');
  const packageJson = read(root, 'package.json');
  const btdPackageJson = read(root, 'packages/btd/package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const source = read(root, 'packages/btd/src/rollback-upgrade-repair-playbook.ts');
  const test = read(root, 'packages/btd/__tests__/rollback-upgrade-repair-playbook.test.ts');
  const specifying = read(root, 'scripts/specifying/src/canonical/v21-specifying.js');
  const requiredTerms = ['RollbackUpgradeRepairPlaybook', ARTIFACT, 'rollback', 'upgrade', 'migration rollback', 'object-storage repair', 'database repair', 'ledger projection repair', 'secret rotation incident response', 'generated artifact repair', 'operator approval', 'fail-closed'];
  for (const doc of [spec, delta, notes, parity]) {
    for (const term of requiredTerms) assertCheck(failures, doc.includes(term), `V34 docs must mention ${term}.`);
  }
  assertCheck(
    failures,
    /Current working gate: V34 Gate (?:9|10)\b/u.test(roadmap),
    'Roadmap must keep Gate 8 closed while advancing current working gate to V34 Gate 9 or later.',
  );
  assertCheck(failures, roadmap.includes('V34 Gate 8 closure anchor'), 'Roadmap must mark Gate 8 as closed.');
  assertCheck(failures, packageJson.includes('generate:v34-rollback-upgrade-data-repair-playbooks'), 'Root package scripts must include Gate 8 generator.');
  assertCheck(failures, packageJson.includes('check:v34-rollback-upgrade-data-repair-playbooks'), 'Root package scripts must include Gate 8 artifact check.');
  assertCheck(failures, packageJson.includes('check:v34-gate8'), 'Root package scripts must include Gate 8 checker.');
  assertCheck(failures, btdPackageJson.includes('./rollback-upgrade-repair-playbook'), 'BTD package exports must expose rollback-upgrade-repair-playbook.');
  assertCheck(failures, gateWorkflow.includes('check-v34-gate8-rollback-upgrade-data-repair-playbooks.mjs'), 'Gate quality workflow must run Gate 8 checker.');
  assertCheck(failures, gateWorkflow.includes('rollback-upgrade-repair-playbook.test.ts'), 'Gate quality workflow must run Gate 8 focused test.');
  assertCheck(failures, specifying.includes(ARTIFACT), 'Canonical generated-artifact allowlist must include Gate 8 artifact.');
  assertCheck(failures, source.includes('ROLLBACK_UPGRADE_REPAIR_PLAYBOOK_IDS'), 'Source must own required playbook ids.');
  assertCheck(failures, source.includes('buildRollbackUpgradeRepairPlaybookSet'), 'Source must expose buildRollbackUpgradeRepairPlaybookSet.');
  assertCheck(failures, test.includes('fails closed when a required playbook is missing'), 'Tests must prove missing playbook fail-closed posture.');
  assertCheck(failures, test.includes('fails closed when operator approval is missing'), 'Tests must prove operator approval fail-closed posture.');
  assertCheck(failures, test.includes('fails closed on serialized secret-shaped values'), 'Tests must prove secret-shaped values fail closed.');

  if (failures.length > 0) {
    process.stderr.write(`V34 Gate 8 Rollback Upgrade Data Repair Playbooks check failed:\n- ${failures.join('\n- ')}\n`);
    process.exit(1);
  }
  process.stdout.write('V34 Gate 8 Rollback Upgrade Data Repair Playbooks check passed.\n');
}

main();
