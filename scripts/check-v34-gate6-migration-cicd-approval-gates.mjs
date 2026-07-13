#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT = '.bitcode/v34-migration-cicd-approval-gates.json';

const REQUIRED_GATE_IDS = [
  'schema_migration_approval',
  'generated_type_refresh',
  'route_scan_approval',
  'build_test_gate',
  'generated_artifact_freshness',
  'vercel_lane_check',
  'supabase_lane_check',
  'promotion_commit_approval',
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
      'Usage: node scripts/check-v34-gate6-migration-cicd-approval-gates.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V34 Gate 6 Migration CI/CD Deployment Approval Gates source, generated artifact, tests, docs, package scripts, workflow wiring, and promotion-aware CI posture.',
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
  const pointer = read(root, 'BITCODE_SPEC.txt').trim();

  assertCheck(
    failures,
    pointer === 'V33',
    `BITCODE_SPEC.txt must remain V33 during V34 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v34' || /^v34\/gate-(?:[6-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V34 Gate 6+ work must occur on version/v34 or v34/gate-6..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT,
    'packages/btd/src/migration-approval-gate.ts',
    'packages/btd/src/index.ts',
    'packages/btd/package.json',
    'packages/btd/__tests__/migration-approval-gate.test.ts',
    'scripts/generate-v34-migration-cicd-approval-gates.mjs',
    'scripts/check-v34-gate6-migration-cicd-approval-gates.mjs',
    'BITCODE_SPEC_V34.md',
    'BITCODE_SPEC_V34_DELTA.md',
    'BITCODE_SPEC_V34_NOTES.md',
    'BITCODE_SPEC_V34_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    '.github/workflows/v33-canon-promotion.yml',
    'packages/specifying/src/canonical/v21-specifying.js',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V34 Gate 6 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', ['run', 'check:v34-migration-cicd-approval-gates']);
    } catch (error) {
      failures.push(`V34 Gate 6 artifact check failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT) ? read(root, ARTIFACT) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V34 migration approval artifact must not contain secret/source marker ${marker}.`);
  }
  assertCheck(
    failures,
    !/\b[A-Z][A-Z0-9_]{2,}\s*=\s*[^<\s][^\s]*/u.test(serializedArtifact),
    'V34 migration approval artifact must not contain env-assignment-shaped values.',
  );

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v34-migration-cicd-approval-gates', 'Artifact id must match Gate 6 migration CI/CD approval gates.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v34.migrationCicdApprovalGates.v1', 'Artifact schema id must match.');
    assertCheck(failures, artifact.version === 'V34' && artifact.currentTarget === 'V33', 'Artifact must bind V34 over active V33.');
    assertCheck(failures, artifact.passed === true, 'Artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-migration-cicd-approval-gate-metadata',
      'Artifact must be source-safe migration CI/CD approval gate metadata.',
    );
    assertCheck(failures, includesAll(artifact.requiredGateIds, REQUIRED_GATE_IDS), 'Artifact must enumerate every required approval gate.');
    assertCheck(failures, includesAll(artifact.coverage.observedGateIds, REQUIRED_GATE_IDS), 'Artifact coverage must observe every gate.');
    assertCheck(failures, artifact.coverage.gateCount === 8, 'Artifact must prove eight approval gates.');
    assertCheck(failures, artifact.coverage.schemaMigrationApprovalCovered === true, 'Schema migration approvals must be covered.');
    assertCheck(failures, artifact.coverage.generatedTypeRefreshCovered === true, 'Generated type refresh must be covered.');
    assertCheck(failures, artifact.coverage.routeScansCovered === true, 'Route scans must be covered.');
    assertCheck(failures, artifact.coverage.buildTestGatesCovered === true, 'Build/test gates must be covered.');
    assertCheck(failures, artifact.coverage.generatedArtifactFreshnessCovered === true, 'Generated artifact freshness must be covered.');
    assertCheck(failures, artifact.coverage.vercelLaneChecksCovered === true, 'Vercel lane checks must be covered.');
    assertCheck(failures, artifact.coverage.supabaseLaneChecksCovered === true, 'Supabase lane checks must be covered.');
    assertCheck(failures, artifact.coverage.promotionCommitsCovered === true, 'Promotion commits must be covered.');
    assertCheck(failures, artifact.coverage.reviewerApprovalCovered === true, 'Reviewer approval posture must be covered.');
    assertCheck(failures, artifact.coverage.rollbackPlansCovered === true, 'Rollback plans must be covered.');
    assertCheck(failures, artifact.coverage.dryRunsCovered === true, 'Dry-runs must be covered.');
    assertCheck(failures, artifact.coverage.proofRootsCovered === true, 'Proof roots must be covered.');
    assertCheck(failures, artifact.coverage.valueBearingMainnetAdmitted === false, 'Approval gates must not admit value-bearing mainnet.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Artifact must not serialize credentials.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Artifact must not expose protected source.');
    assertCheck(
      failures,
      artifact.gates.every((gate) => /^v34-migration-approval-gate:[a-f0-9]{24}$/u.test(gate.gateRoot)),
      'Approval gate rows must have deterministic roots.',
    );
    assertCheck(
      failures,
      artifact.gates.every((gate) => gate.supportedLaneIds.every((laneId) => laneId !== 'value-bearing-mainnet')),
      'Approval gate rows must exclude value-bearing-mainnet from supported lanes.',
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

  const spec = read(root, 'BITCODE_SPEC_V34.md');
  const delta = read(root, 'BITCODE_SPEC_V34_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V34_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V34_PARITY_MATRIX.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');
  const packageJson = read(root, 'package.json');
  const btdPackageJson = read(root, 'packages/btd/package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  const promotionWorkflow = read(root, '.github/workflows/v33-canon-promotion.yml');
  const source = read(root, 'packages/btd/src/migration-approval-gate.ts');
  const test = read(root, 'packages/btd/__tests__/migration-approval-gate.test.ts');
  const specifying = read(root, 'packages/specifying/src/canonical/v21-specifying.js');

  for (const doc of [spec, delta, notes, parity]) {
    assertCheck(failures, doc.includes(ARTIFACT), `V34 docs must mention ${ARTIFACT}.`);
    assertCheck(failures, doc.includes('MigrationApprovalGate'), 'V34 docs must name MigrationApprovalGate.');
    assertCheck(failures, doc.includes('schema migration approval'), 'V34 docs must name schema migration approval.');
    assertCheck(failures, doc.includes('generated type refresh'), 'V34 docs must name generated type refresh.');
    assertCheck(failures, doc.includes('route scans'), 'V34 docs must name route scans.');
    assertCheck(failures, doc.includes('build/test gates'), 'V34 docs must name build/test gates.');
    assertCheck(failures, doc.includes('generated artifact freshness'), 'V34 docs must name generated artifact freshness.');
    assertCheck(failures, doc.includes('Vercel'), 'V34 docs must name Vercel lane checks.');
    assertCheck(failures, doc.includes('Supabase'), 'V34 docs must name Supabase lane checks.');
    assertCheck(failures, doc.includes('promotion commit'), 'V34 docs must name promotion commit checks.');
    assertCheck(failures, doc.includes('reviewer approval'), 'V34 docs must name reviewer approval posture.');
    assertCheck(failures, doc.includes('rollback'), 'V34 docs must name rollback posture.');
    assertCheck(failures, doc.includes('no secret values'), 'V34 docs must state no secret values are serialized.');
  }

  assertCheck(
    failures,
    /Current working gate: V34 Gate (?:7|8|9|10)\b/u.test(roadmap),
    'Roadmap must advance current working gate to V34 Gate 7 or later after Gate 6 closure.',
  );
  assertCheck(
    failures,
    roadmap.includes('V34 Gate 6 closure anchor'),
    'Roadmap must mark Gate 6 as closed.',
  );
  assertCheck(failures, packageJson.includes('generate:v34-migration-cicd-approval-gates'), 'Root package scripts must include Gate 6 generator.');
  assertCheck(failures, packageJson.includes('check:v34-migration-cicd-approval-gates'), 'Root package scripts must include Gate 6 artifact check.');
  assertCheck(failures, packageJson.includes('check:v34-gate6'), 'Root package scripts must include Gate 6 checker.');
  assertCheck(failures, btdPackageJson.includes('./migration-approval-gate'), 'BTD package exports must expose migration-approval-gate.');
  assertCheck(failures, gateWorkflow.includes('check-v34-gate6-migration-cicd-approval-gates.mjs'), 'Gate quality workflow must run Gate 6 checker.');
  assertCheck(failures, gateWorkflow.includes('migration-approval-gate.test.ts'), 'Gate quality workflow must run Gate 6 focused test.');
  assertCheck(failures, canonWorkflow.includes('BITCODE_SPEC_V34.md'), 'Canon quality workflow must remain aware of V34 draft posture.');
  assertCheck(failures, promotionWorkflow.includes('draft-target V34') || promotionWorkflow.includes('BITCODE_SPEC_V34.md'), 'Promotion workflow must remain version-aware for V34 draft posture.');
  assertCheck(failures, specifying.includes(ARTIFACT), 'Canonical generated-artifact allowlist must include Gate 6 artifact.');
  assertCheck(failures, source.includes('MIGRATION_APPROVAL_GATE_IDS'), 'Source must own required migration approval gate ids.');
  assertCheck(failures, source.includes('buildMigrationApprovalGateSet'), 'Source must expose buildMigrationApprovalGateSet.');
  assertCheck(failures, source.includes('noSerializedSecretValues'), 'Source must prove noSerializedSecretValues.');
  assertCheck(failures, source.includes('valueBearingMainnetBlocked'), 'Source must prove valueBearingMainnetBlocked.');
  assertCheck(failures, test.includes('fails closed when reviewer approval evidence is missing'), 'Tests must prove reviewer approval fail-closed posture.');
  assertCheck(failures, test.includes('fails closed when rollback plan is missing'), 'Tests must prove rollback fail-closed posture.');
  assertCheck(failures, test.includes('fails closed on serialized secret-shaped values'), 'Tests must prove secret-shaped values fail closed.');

  if (failures.length > 0) {
    process.stderr.write('V34 Gate 6 Migration CI/CD Deployment Approval Gates check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exit(1);
  }

  process.stdout.write('V34 Gate 6 Migration CI/CD Deployment Approval Gates check passed.\n');
}

main();
