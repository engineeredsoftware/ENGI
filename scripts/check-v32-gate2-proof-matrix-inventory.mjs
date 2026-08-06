#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V32_COVERAGE_STATUSES,
  V32_PROOF_COVERAGE_MATRIX_ARTIFACT,
  V32_REQUIRED_PROOF_SURFACE_IDS,
  V32_SOURCE_SAFETY_CLASSES,
  buildV32ProofCoverageMatrix,
  stableStringify
} from './v32-proof-coverage-matrix.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');

const SECRET_MARKERS = Object.freeze([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_')
]);

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

const SECRET_PATTERN = new RegExp(SECRET_MARKERS.map(escapeRegex).join('|'), 'u');

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function fileExists(root, relativePath) {
  return existsSync(path.join(root, relativePath));
}

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function parseArgs(argv) {
  const args = {
    skipBranchCheck: false,
    repoRoot: defaultRepoRoot
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
      'Usage: node scripts/check-v32-gate2-proof-matrix-inventory.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V32 Gate 2 proof/test coverage matrix inventory, source-safety classes, planned gaps, docs, package scripts, and workflow wiring.'
    ].join('\n')
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
    pointer === 'V31',
    `BITCODE_SPEC.txt must remain V31 during V32 gate work. Observed ${pointer || 'empty'}.`
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v32' || /^v32\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V32 work must occur on version/v32 or v32/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`
    );
  }

  const requiredFiles = [
    V32_PROOF_COVERAGE_MATRIX_ARTIFACT,
    'scripts/v32-proof-coverage-matrix.mjs',
    'scripts/generate-v32-proof-coverage-matrix.mjs',
    'scripts/check-v32-gate2-proof-matrix-inventory.mjs',
    '.specifications/BITCODE_SPEC_V32.md',
    '.specifications/BITCODE_SPEC_V32_DELTA.md',
    '.specifications/BITCODE_SPEC_V32_NOTES.md',
    '.specifications/BITCODE_SPEC_V32_PARITY_MATRIX.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml'
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V32 Gate 2 file: ${relativePath}`);
  }

  const expectedArtifact = stableStringify(buildV32ProofCoverageMatrix());
  const actualArtifact = fileExists(root, V32_PROOF_COVERAGE_MATRIX_ARTIFACT)
    ? read(root, V32_PROOF_COVERAGE_MATRIX_ARTIFACT)
    : '';

  assertCheck(
    failures,
    actualArtifact === expectedArtifact,
    `${V32_PROOF_COVERAGE_MATRIX_ARTIFACT} must match the deterministic generator output. Run pnpm run generate:v32-proof-coverage-matrix.`
  );

  let matrix = null;
  try {
    matrix = JSON.parse(actualArtifact || '{}');
  } catch (error) {
    failures.push(`${V32_PROOF_COVERAGE_MATRIX_ARTIFACT} must be valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (matrix) {
    assertCheck(failures, matrix.artifactId === 'v32-proof-coverage-matrix', 'Matrix artifactId must be v32-proof-coverage-matrix.');
    assertCheck(failures, matrix.schemaId === 'bitcode.v32.proofCoverageMatrix.v1', 'Matrix schemaId must be bitcode.v32.proofCoverageMatrix.v1.');
    assertCheck(failures, matrix.version === 'V32', 'Matrix version must be V32.');
    assertCheck(failures, matrix.currentTarget === 'V31', 'Matrix currentTarget must be V31.');
    assertCheck(failures, matrix.verdict === 'draft-inventory-complete', 'Matrix verdict must be draft-inventory-complete.');
    assertCheck(failures, matrix.command === 'pnpm run generate:v32-proof-coverage-matrix', 'Matrix command must name the generator script.');
    assertCheck(failures, Array.isArray(matrix.blockers) && matrix.blockers.length === 0, 'Top-level matrix blockers must be empty for Gate 2 closure.');

    const rowBySurface = new Map((matrix.rows || []).map((row) => [row.surfaceId, row]));
    for (const surfaceId of V32_REQUIRED_PROOF_SURFACE_IDS) {
      assertCheck(failures, rowBySurface.has(surfaceId), `Matrix missing required surface row: ${surfaceId}.`);
    }

    assertCheck(
      failures,
      Array.isArray(matrix.rows) && matrix.rows.length >= V32_REQUIRED_PROOF_SURFACE_IDS.length,
      'Matrix must include at least every required proof/test surface.'
    );

    for (const row of matrix.rows || []) {
      for (const field of [
        'surfaceId',
        'promotedBehavior',
        'owner',
        'fixture',
        'replayCommand',
        'expectedArtifact',
        'sourceSafetyClass',
        'coverageStatus',
        'plannedGate',
        'requiredContexts',
        'failureModes',
        'repairPosture'
      ]) {
        assertCheck(failures, row[field] !== undefined && row[field] !== '', `Row ${row.surfaceId || 'unknown'} missing ${field}.`);
      }
      assertCheck(
        failures,
        V32_SOURCE_SAFETY_CLASSES.includes(row.sourceSafetyClass),
        `Row ${row.surfaceId} uses unsupported sourceSafetyClass ${row.sourceSafetyClass}.`
      );
      assertCheck(
        failures,
        V32_COVERAGE_STATUSES.includes(row.coverageStatus),
        `Row ${row.surfaceId} uses unsupported coverageStatus ${row.coverageStatus}.`
      );
      assertCheck(
        failures,
        String(row.expectedArtifact || '').startsWith('.proofs/v32/'),
        `Row ${row.surfaceId} expectedArtifact must be a V32 .proofs/v32/ artifact path.`
      );
      assertCheck(
        failures,
        Array.isArray(row.requiredContexts) && row.requiredContexts.length > 0,
        `Row ${row.surfaceId} must name required contexts.`
      );
      assertCheck(
        failures,
        Array.isArray(row.failureModes) && row.failureModes.length > 0,
        `Row ${row.surfaceId} must name failure modes.`
      );
      if (row.coverageStatus === 'planned-gap') {
        assertCheck(
          failures,
          Array.isArray(row.blockers) && row.blockers.length > 0,
          `Planned-gap row ${row.surfaceId} must name blockers instead of hiding missing coverage.`
        );
      }
    }

    assertCheck(
      failures,
      (matrix.rows || []).some((row) => row.coverageStatus === 'planned-gap'),
      'Matrix must include at least one explicit planned-gap row so missing proof coverage is visible.'
    );
    assertCheck(
      failures,
      (matrix.rows || []).some((row) => row.sourceSafetyClass === 'protected-source-locked'),
      'Matrix must represent protected-source-locked surfaces.'
    );
    assertCheck(
      failures,
      (matrix.rows || []).some((row) => row.sourceSafetyClass === 'secret-presence-only'),
      'Matrix must represent secret-presence-only surfaces.'
    );
    assertCheck(
      failures,
      !SECRET_PATTERN.test(actualArtifact),
      `${V32_PROOF_COVERAGE_MATRIX_ARTIFACT} must not contain secret-like values or secret env var names.`
    );
  }

  const spec = read(root, '.specifications/BITCODE_SPEC_V32.md');
  const delta = read(root, '.specifications/BITCODE_SPEC_V32_DELTA.md');
  const notes = read(root, '.specifications/BITCODE_SPEC_V32_NOTES.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V32_PARITY_MATRIX.md');
  const roadmap = read(root, '.specifications/SPECIFICATIONS_ROADMAP.md');
  const packageJson = read(root, 'package.json');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');

  for (const surfaceId of V32_REQUIRED_PROOF_SURFACE_IDS) {
    assertCheck(
      failures,
      spec.includes(surfaceId) || delta.includes(surfaceId) || notes.includes(surfaceId) || parity.includes(surfaceId),
      `V32 spec family must mention required proof surface ${surfaceId}.`
    );
  }

  for (const phrase of [
    V32_PROOF_COVERAGE_MATRIX_ARTIFACT,
    'owner package/interface',
    'fixture',
    'replay command',
    'source-safety class',
    'failure mode',
    'planned-gap',
    'protected-source-locked',
    'secret-presence-only'
  ]) {
    assertCheck(
      failures,
      spec.includes(phrase) || delta.includes(phrase) || notes.includes(phrase) || parity.includes(phrase),
      `V32 spec family must describe Gate 2 proof matrix phrase: ${phrase}.`
    );
  }

  assertCheck(
    failures,
    /Current working gate: V32 Gate (?:[2-9]|10)\b/u.test(roadmap),
    'Roadmap must track V32 Gate 2 or later as the current working gate.'
  );
  assertCheck(failures, packageJson.includes('"generate:v32-proof-coverage-matrix"'), 'package.json must expose generate:v32-proof-coverage-matrix.');
  assertCheck(failures, packageJson.includes('"check:v32-gate2"'), 'package.json must expose check:v32-gate2.');
  assertCheck(
    failures,
    workflow.includes('check-v32-gate2-proof-matrix-inventory.mjs'),
    'Gate quality workflow must run the V32 Gate 2 checker.'
  );

  if (failures.length > 0) {
    process.stderr.write('V32 Gate 2 proof matrix inventory check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V32 Gate 2 proof matrix inventory ok surfaces=${V32_REQUIRED_PROOF_SURFACE_IDS.length} artifact=${V32_PROOF_COVERAGE_MATRIX_ARTIFACT}\n`);
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
