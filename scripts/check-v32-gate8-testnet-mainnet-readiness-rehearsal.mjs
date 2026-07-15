#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT = '.proofs/v32/testnet-mainnet-readiness-rehearsal.json';

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJ', 'hbGci', 'OiJI', 'UzI1', 'NiIsInR5cCI6IkpXVCJ9'].join(''),
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
      'Usage: node scripts/check-v32-gate8-testnet-mainnet-readiness-rehearsal.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V32 Gate 8 testnet/mainnet readiness rehearsal records, source-safe secret presence, and production-mainnet block posture.',
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

  assertCheck(failures, pointer === 'V31', `BITCODE_SPEC.txt must remain V31 during V32 gate work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v32' || /^v32\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V32 work must occur on version/v32 or v32/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT,
    'scripts/generate-v32-testnet-mainnet-readiness-rehearsal.mjs',
    'scripts/check-v32-gate8-testnet-mainnet-readiness-rehearsal.mjs',
    'packages/btd/src/testnet-mainnet-readiness-rehearsal.ts',
    'packages/btd/__tests__/v32-testnet-mainnet-readiness-rehearsal.test.ts',
    'packages/btd/README.md',
    '.specifications/BITCODE_SPEC_V32.md',
    '.specifications/BITCODE_SPEC_V32_DELTA.md',
    '.specifications/BITCODE_SPEC_V32_NOTES.md',
    '.specifications/BITCODE_SPEC_V32_PARITY_MATRIX.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    'scripts/v32-proof-coverage-matrix.mjs',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V32 Gate 8 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', ['run', 'check:v32-testnet-mainnet-readiness-rehearsal']);
    } catch (error) {
      failures.push(`V32 Gate 8 artifact check failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT) ? read(root, ARTIFACT) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V32 Gate 8 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    const laneIds = artifact.lanes.map((lane) => lane.laneId);
    const production = artifact.lanes.find((lane) => lane.laneId === 'production-mainnet');
    const staging = artifact.lanes.find((lane) => lane.laneId === 'staging-testnet');
    const offline = artifact.lanes.find((lane) => lane.laneId === 'offline-disabled');

    assertCheck(failures, artifact.artifactId === 'v32-testnet-mainnet-readiness-rehearsal', 'Gate 8 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v32.testnetMainnetReadinessRehearsal.v1', 'Gate 8 schemaId must match.');
    assertCheck(failures, artifact.version === 'V32' && artifact.currentTarget === 'V31', 'Gate 8 artifact must bind V32 over active V31.');
    assertCheck(failures, artifact.passed === true, 'Gate 8 artifact must pass.');
    assertCheck(failures, artifact.sourceSafetyVerdict === 'source-safe-readiness-metadata-secret-presence-only', 'Gate 8 artifact must be source-safe readiness metadata.');
    assertCheck(failures, laneIds.join(',') === 'local,staging-testnet,production-mainnet,offline-disabled', 'Gate 8 artifact must enumerate local, staging-testnet, production-mainnet, and offline-disabled lanes.');
    assertCheck(failures, staging?.projectRef === 'tkpyosihuouusyaxtbau', 'Gate 8 staging-testnet lane must bind the staging project reference.');
    assertCheck(failures, production?.projectRef === 'rinalyjfecxnmyczrpzo', 'Gate 8 production-mainnet lane must bind the production project reference.');
    assertCheck(failures, production?.state === 'blocked', 'Gate 8 production-mainnet lane must be blocked.');
    assertCheck(failures, production?.valueBearingSettlementAdmitted === false, 'Gate 8 must not admit production-mainnet value-bearing settlement.');
    assertCheck(failures, production?.blockers?.includes('production-mainnet-value-bearing-not-admitted-in-v32'), 'Gate 8 production-mainnet lane must name the value-bearing blocker.');
    assertCheck(failures, offline?.state === 'disabled', 'Gate 8 offline lane must be disabled.');
    assertCheck(failures, artifact.proofCoverage.secretValuesSerialized === false, 'Gate 8 artifact must not serialize secret values.');
    assertCheck(failures, artifact.proofCoverage.protectedSourceSerialized === false, 'Gate 8 artifact must not serialize protected source.');
    assertCheck(failures, artifact.proofCoverage.rawProviderPayloadsSerialized === false, 'Gate 8 artifact must not serialize raw provider payloads.');
    assertCheck(
      failures,
      artifact.sourceEvidence.every((entry) => entry.requiredTokens.every((token) => token.present === true)) &&
        artifact.testEvidence.every((entry) => entry.requiredTokens.every((token) => token.present === true)),
      'Gate 8 source and test evidence tokens must all be present.',
    );
  }

  const spec = read(root, '.specifications/BITCODE_SPEC_V32.md');
  const delta = read(root, '.specifications/BITCODE_SPEC_V32_DELTA.md');
  const notes = read(root, '.specifications/BITCODE_SPEC_V32_NOTES.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V32_PARITY_MATRIX.md');
  const roadmap = read(root, '.specifications/SPECIFICATIONS_ROADMAP.md');
  const packageJson = read(root, 'package.json');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const matrix = read(root, 'scripts/v32-proof-coverage-matrix.mjs');
  const source = read(root, 'packages/btd/src/testnet-mainnet-readiness-rehearsal.ts');
  const test = read(root, 'packages/btd/__tests__/v32-testnet-mainnet-readiness-rehearsal.test.ts');

  for (const doc of [spec, delta, notes, parity]) {
    assertCheck(failures, doc.includes(ARTIFACT), `V32 docs must mention ${ARTIFACT}.`);
    assertCheck(failures, doc.includes('secret-presence-only'), 'V32 docs must name secret-presence-only readiness handling.');
    assertCheck(failures, doc.includes('production-mainnet'), 'V32 docs must name production-mainnet readiness posture.');
  }

  assertCheck(failures, /Current working gate: V32 Gate (?:[8-9]|10)\b/u.test(roadmap), 'Roadmap must track V32 Gate 8 or later as the current working gate.');
  assertCheck(failures, packageJson.includes('"generate:v32-testnet-mainnet-readiness-rehearsal"'), 'package.json must expose the Gate 8 generator.');
  assertCheck(failures, packageJson.includes('"check:v32-gate8"'), 'package.json must expose check:v32-gate8.');
  assertCheck(
    failures,
    workflow.includes('check-v32-gate8-testnet-mainnet-readiness-rehearsal.mjs') &&
      workflow.includes('v32-testnet-mainnet-readiness-rehearsal.test.ts'),
    'Gate quality workflow must run the Gate 8 checker and focused BTD test.',
  );
  assertCheck(failures, matrix.includes(ARTIFACT), 'V32 proof coverage matrix must reference the Gate 8 artifact.');
  assertCheck(failures, source.includes('buildV32TestnetMainnetReadinessRehearsal'), 'BTD source must export the Gate 8 readiness builder.');
  assertCheck(failures, test.includes('keeps production-mainnet value-bearing settlement blocked in V32'), 'BTD focused test must prove production-mainnet block posture.');

  if (failures.length) {
    process.stderr.write('V32 Gate 8 testnet/mainnet readiness rehearsal check failed:\n');
    for (const failure of failures) {
      process.stderr.write(`- ${failure}\n`);
    }
    process.exit(1);
  }

  process.stdout.write(`V32 Gate 8 testnet/mainnet readiness rehearsal ok artifact=${ARTIFACT}\n`);
}

main();
