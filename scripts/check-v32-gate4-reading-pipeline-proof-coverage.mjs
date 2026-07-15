#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const READING_ARTIFACT = '.bitcode/v32-reading-pipeline-proof-coverage.json';

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
      'Usage: node scripts/check-v32-gate4-reading-pipeline-proof-coverage.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V32 Gate 4 Reading pipeline proof coverage artifact, focused tests, docs, package scripts, and workflow wiring.'
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
  const pointer = read(root, 'specifications/BITCODE_SPEC.txt').trim();

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
    READING_ARTIFACT,
    'packages/asset-packs-pipelines/domain/scripts/v32-reading-pipeline-proof-coverage.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/v32-reading-pipeline-proof-coverage.test.ts',
    'packages/asset-packs-pipelines/domain/src/reading-pipeline-contract.ts',
    'packages/asset-packs-pipelines/domain/src/reading-pipeline-observability.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/reading-pipeline-contract.test.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/reading-pipeline-observability.test.ts',
    'scripts/check-v32-gate4-reading-pipeline-proof-coverage.mjs',
    'specifications/BITCODE_SPEC_V32.md',
    'specifications/BITCODE_SPEC_V32_DELTA.md',
    'specifications/BITCODE_SPEC_V32_NOTES.md',
    'specifications/BITCODE_SPEC_V32_PARITY_MATRIX.md',
    'specifications/SPECIFICATIONS_ROADMAP.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml'
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V32 Gate 4 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', ['run', 'check:v32-reading-pipeline-proof-coverage']);
    } catch (error) {
      failures.push(`Reading pipeline proof coverage artifact check failed: ${error.stderr || error.message}`);
    }
  }

  const artifact = fileExists(root, READING_ARTIFACT) ? JSON.parse(read(root, READING_ARTIFACT)) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v32-reading-pipeline-proof-coverage', 'Reading proof artifactId must be v32-reading-pipeline-proof-coverage.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v32.readingPipelineProofCoverage.v1', 'Reading proof schemaId must match V32 Gate 4.');
    assertCheck(failures, artifact.version === 'V32' && artifact.currentTarget === 'V31', 'Reading proof artifact must bind V32 over active V31.');
    assertCheck(failures, artifact.passed === true, 'Reading proof artifact must pass.');
    assertCheck(failures, artifact.sourceSafetyVerdict === 'source-safe-contract-metadata', 'Reading proof artifact must be source-safe contract metadata.');
    assertCheck(failures, artifact.totals?.pipelines === 2, 'Reading proof artifact must cover two Reading pipelines.');
    assertCheck(failures, artifact.totals?.phases === 11, 'Reading proof artifact must cover eleven phases.');
    assertCheck(failures, artifact.totals?.ptrrAgents === 12, 'Reading proof artifact must cover twelve PTRR agents.');
    assertCheck(failures, artifact.totals?.ptrrSteps === 48, 'Reading proof artifact must cover forty-eight PTRR steps.');
    assertCheck(failures, artifact.totals?.thricifiedGenerations === 144, 'Reading proof artifact must cover one hundred forty-four ThricifiedGenerations.');
    assertCheck(failures, artifact.modelStructuredStepCoverage?.length === 20, 'Reading proof artifact must cover twenty model-structured PTRR steps.');
    assertCheck(failures, artifact.toolCoverage?.length === 4, 'Reading proof artifact must cover four Reading tools.');
    assertCheck(
      failures,
      artifact.boundaryCoverage?.every((entry) => entry.passed === true),
      'Reading proof artifact must pass all accepted-Need, plural Finding Fits, source-safe preview, and settlement delivery boundaries.'
    );
  }

  const spec = read(root, 'specifications/BITCODE_SPEC_V32.md');
  const delta = read(root, 'specifications/BITCODE_SPEC_V32_DELTA.md');
  const notes = read(root, 'specifications/BITCODE_SPEC_V32_NOTES.md');
  const parity = read(root, 'specifications/BITCODE_SPEC_V32_PARITY_MATRIX.md');
  const roadmap = read(root, 'specifications/SPECIFICATIONS_ROADMAP.md');
  const packageJson = read(root, 'package.json');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const test = read(root, 'packages/asset-packs-pipelines/domain/src/__tests__/v32-reading-pipeline-proof-coverage.test.ts');

  for (const phrase of [
    READING_ARTIFACT,
    'ReadNeedComprehensionSynthesis',
    'ReadFitsFindingSynthesis',
    'Finding Fits',
    'PTRR agents',
    'ThricifiedGeneration',
    'source-safe preview',
    'AssetPackSourceSafePreview',
    'v32-reading-pipeline-proof-coverage'
  ]) {
    assertCheck(
      failures,
      spec.includes(phrase) || delta.includes(phrase) || notes.includes(phrase) || parity.includes(phrase),
      `V32 spec family must describe Gate 4 phrase: ${phrase}.`
    );
  }

  assertCheck(
    failures,
    /Current working gate: V32 Gate (?:[4-9]|10)\b/u.test(roadmap),
    'Roadmap must track V32 Gate 4 or later as the current working gate.'
  );
  assertCheck(failures, packageJson.includes('"generate:v32-reading-pipeline-proof-coverage"'), 'package.json must expose generate:v32-reading-pipeline-proof-coverage.');
  assertCheck(failures, packageJson.includes('"check:v32-reading-pipeline-proof-coverage"'), 'package.json must expose check:v32-reading-pipeline-proof-coverage.');
  assertCheck(failures, packageJson.includes('"check:v32-gate4"'), 'package.json must expose check:v32-gate4.');
  assertCheck(
    failures,
    workflow.includes('check-v32-gate4-reading-pipeline-proof-coverage.mjs') &&
      workflow.includes('v32-reading-pipeline-proof-coverage.test.ts'),
    'Gate quality workflow must run the V32 Gate 4 checker and focused Reading pipeline proof test.'
  );
  assertCheck(
    failures,
    test.includes('fit/deposits') &&
      test.includes('AssetPackSourceSafePreview') &&
      test.includes('ReadFitsFindingSynthesis.tool.vcs-create-pull-request'),
    'V32 Reading proof test must assert plural fit discovery, source-safe preview, and paid delivery boundary.'
  );

  if (failures.length > 0) {
    process.stderr.write('V32 Gate 4 Reading pipeline proof coverage check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V32 Gate 4 Reading pipeline proof coverage ok artifact=${READING_ARTIFACT}\n`);
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
