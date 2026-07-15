#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V32_ARTIFACT_VOLATILITY_INVENTORY_ARTIFACT,
  V32_DETERMINISTIC_REPLAY_ARTIFACT_PATHS,
  V32_DETERMINISTIC_REPLAY_REPORT_ARTIFACT,
  V32_REPLAY_GENERATED_AT,
  buildV32DeterministicReplayArtifactPackage,
  buildV32SourceSafetyProbeToken,
  validateV32DeterministicReplayArtifactFiles
} from './v32-deterministic-replay-artifacts.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');

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
      'Usage: node scripts/check-v32-gate3-deterministic-replay-artifact-stability.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V32 Gate 3 deterministic replay artifacts, volatility inventory, exact regeneration, failure-mode probes, docs, package scripts, and workflow wiring.'
    ].join('\n')
  );
  process.stdout.write('\n');
}

function readArtifactFiles(root) {
  return Object.fromEntries(
    V32_DETERMINISTIC_REPLAY_ARTIFACT_PATHS
      .filter((relativePath) => fileExists(root, relativePath))
      .map((relativePath) => [relativePath, read(root, relativePath)])
  );
}

function failureModes(result) {
  return new Set(result.failures.map((failure) => failure.failureMode));
}

function expectFailureMode(failures, artifactFiles, mutate, expectedMode, label) {
  const mutatedFiles = mutate({ ...artifactFiles });
  const result = validateV32DeterministicReplayArtifactFiles(mutatedFiles);
  assertCheck(
    failures,
    result.passed === false && failureModes(result).has(expectedMode),
    `${label} must fail closed with ${expectedMode}. Observed ${result.failures.map((failure) => `${failure.failureMode}:${failure.artifactPath}`).join(', ') || 'no failures'}.`
  );
}

function mutateJson(content, mutator) {
  const parsed = JSON.parse(content);
  mutator(parsed);
  return `${JSON.stringify(parsed, null, 2)}\n`;
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
    'scripts/v32-deterministic-replay-artifacts.mjs',
    'scripts/generate-v32-deterministic-replay-artifacts.mjs',
    'scripts/check-v32-gate3-deterministic-replay-artifact-stability.mjs',
    'scripts/v32-proof-coverage-matrix.mjs',
    'scripts/generate-v32-proof-coverage-matrix.mjs',
    'scripts/check-v32-gate2-proof-matrix-inventory.mjs',
    '.specifications/BITCODE_SPEC_V32.md',
    '.specifications/BITCODE_SPEC_V32_DELTA.md',
    '.specifications/BITCODE_SPEC_V32_NOTES.md',
    '.specifications/BITCODE_SPEC_V32_PARITY_MATRIX.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    ...V32_DETERMINISTIC_REPLAY_ARTIFACT_PATHS
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V32 Gate 3 file: ${relativePath}`);
  }

  const expectedFiles = buildV32DeterministicReplayArtifactPackage();
  const artifactFiles = readArtifactFiles(root);
  const validation = validateV32DeterministicReplayArtifactFiles(artifactFiles);
  if (!validation.passed) {
    for (const failure of validation.failures) {
      failures.push(`${failure.failureMode} ${failure.artifactPath}: ${failure.detail}`);
    }
  }

  for (const artifactPath of V32_DETERMINISTIC_REPLAY_ARTIFACT_PATHS) {
    assertCheck(
      failures,
      artifactFiles[artifactPath] === expectedFiles[artifactPath],
      `${artifactPath} must match deterministic V32 Gate 3 generator output. Run pnpm run generate:v32-deterministic-replay-artifacts.`
    );
  }

  const report = artifactFiles[V32_DETERMINISTIC_REPLAY_REPORT_ARTIFACT]
    ? JSON.parse(artifactFiles[V32_DETERMINISTIC_REPLAY_REPORT_ARTIFACT])
    : null;
  const inventory = artifactFiles[V32_ARTIFACT_VOLATILITY_INVENTORY_ARTIFACT]
    ? JSON.parse(artifactFiles[V32_ARTIFACT_VOLATILITY_INVENTORY_ARTIFACT])
    : null;

  if (report) {
    assertCheck(failures, report.artifactId === 'v32-deterministic-replay-report', 'Replay report artifactId must be v32-deterministic-replay-report.');
    assertCheck(failures, report.schemaId === 'bitcode.v32.deterministicReplayReport.v1', 'Replay report schemaId must be bitcode.v32.deterministicReplayReport.v1.');
    assertCheck(failures, report.generatedAt === V32_REPLAY_GENERATED_AT, `Replay report generatedAt must be ${V32_REPLAY_GENERATED_AT}.`);
    assertCheck(failures, report.runCount === 2, 'Replay report must compare exactly two deterministic runs.');
    assertCheck(failures, report.allReplayArtifactsByteEqual === true, 'Replay report must prove byte equality.');
    for (const mode of ['missing-path', 'stale-source-commit', 'malformed-schema', 'source-safety-violation', 'unstable-json-order']) {
      assertCheck(failures, report.failureModeCoverage?.includes(mode), `Replay report must name failure mode ${mode}.`);
    }
  }

  if (inventory) {
    assertCheck(failures, inventory.artifactId === 'v32-artifact-volatility-inventory', 'Volatility inventory artifactId must be v32-artifact-volatility-inventory.');
    assertCheck(failures, inventory.schemaId === 'bitcode.v32.artifactVolatilityInventory.v1', 'Volatility inventory schemaId must be bitcode.v32.artifactVolatilityInventory.v1.');
    assertCheck(failures, inventory.generatedAt === V32_REPLAY_GENERATED_AT, `Volatility inventory generatedAt must be ${V32_REPLAY_GENERATED_AT}.`);
    assertCheck(failures, inventory.passed === true, 'Volatility inventory must pass.');
    assertCheck(failures, inventory.sourceSafetyVerdict === 'source-safe', 'Volatility inventory must report source-safe payloads.');
    assertCheck(failures, inventory.classificationCounts?.['canonical-stable'] >= 1, 'Volatility inventory must contain at least one canonical-stable finding.');
    assertCheck(failures, inventory.classificationCounts?.['context-bound'] >= 1, 'Volatility inventory must contain at least one context-bound finding.');
  }

  if (validation.passed) {
    const staleSourceCommitFiles = {
      ...artifactFiles,
      [V32_DETERMINISTIC_REPLAY_REPORT_ARTIFACT]: mutateJson(
        artifactFiles[V32_DETERMINISTIC_REPLAY_REPORT_ARTIFACT],
        (artifact) => {
          artifact.sourceCommit = 'stale-source-commit';
        }
      )
    };
    expectFailureMode(
      failures,
      artifactFiles,
      (files) => {
        delete files[V32_DETERMINISTIC_REPLAY_REPORT_ARTIFACT];
        return files;
      },
      'missing-path',
      'Missing replay report probe'
    );
    expectFailureMode(
      failures,
      artifactFiles,
      () => staleSourceCommitFiles,
      'stale-source-commit',
      'Stale source commit probe'
    );
    expectFailureMode(
      failures,
      artifactFiles,
      (files) => ({
        ...files,
        [V32_ARTIFACT_VOLATILITY_INVENTORY_ARTIFACT]: '{ not json'
      }),
      'malformed-schema',
      'Malformed volatility inventory probe'
    );
    expectFailureMode(
      failures,
      artifactFiles,
      (files) => ({
        ...files,
        [V32_DETERMINISTIC_REPLAY_REPORT_ARTIFACT]: `${files[V32_DETERMINISTIC_REPLAY_REPORT_ARTIFACT]}${buildV32SourceSafetyProbeToken()}`
      }),
      'source-safety-violation',
      'Source-safety probe'
    );
  }

  const spec = read(root, '.specifications/BITCODE_SPEC_V32.md');
  const delta = read(root, '.specifications/BITCODE_SPEC_V32_DELTA.md');
  const notes = read(root, '.specifications/BITCODE_SPEC_V32_NOTES.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V32_PARITY_MATRIX.md');
  const roadmap = read(root, '.specifications/SPECIFICATIONS_ROADMAP.md');
  const packageJson = read(root, 'package.json');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');

  for (const phrase of [
    V32_DETERMINISTIC_REPLAY_REPORT_ARTIFACT,
    V32_ARTIFACT_VOLATILITY_INVENTORY_ARTIFACT,
    'deterministic replay',
    'stable JSON',
    'missing-path',
    'stale-source-commit',
    'malformed-schema',
    'source-safety-violation',
    'unstable-json-order'
  ]) {
    assertCheck(
      failures,
      spec.includes(phrase) || delta.includes(phrase) || notes.includes(phrase) || parity.includes(phrase),
      `V32 spec family must describe Gate 3 phrase: ${phrase}.`
    );
  }

  assertCheck(
    failures,
    /Current working gate: V32 Gate (?:[3-9]|10)\b/u.test(roadmap),
    'Roadmap must track V32 Gate 3 or later as the current working gate.'
  );
  assertCheck(failures, packageJson.includes('"generate:v32-deterministic-replay-artifacts"'), 'package.json must expose generate:v32-deterministic-replay-artifacts.');
  assertCheck(failures, packageJson.includes('"check:v32-gate3"'), 'package.json must expose check:v32-gate3.');
  assertCheck(
    failures,
    workflow.includes('check-v32-gate3-deterministic-replay-artifact-stability.mjs'),
    'Gate quality workflow must run the V32 Gate 3 checker.'
  );

  if (failures.length > 0) {
    process.stderr.write('V32 Gate 3 deterministic replay artifact stability check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(
    `V32 Gate 3 deterministic replay artifact stability ok artifacts=${V32_DETERMINISTIC_REPLAY_ARTIFACT_PATHS.length} report=${V32_DETERMINISTIC_REPLAY_REPORT_ARTIFACT}\n`
  );
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
