#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V43_PACKS_ACTIVITY_MASTER_DETAIL_ARTIFACT_PATH,
  buildV43PacksActivityMasterDetail,
} from '../packages/specifying/src/canonical/v43-packs-activity-master-detail.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function exists(root, relativePath) {
  return existsSync(path.join(root, relativePath));
}

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function parseArgs(argv) {
  const args = { repoRoot: defaultRepoRoot, skipBranchCheck: false, skipUapiTests: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--skip-uapi-tests') args.skipUapiTests = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }
  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v43-gate3-packs-activity-master-detail.mjs [--skip-branch-check] [--skip-uapi-tests] [--repo-root <path>]',
      '',
      'Checks V43 Gate 3 packs activity master-detail contracts, route/API/UI source, generated artifact, docs, workflows, tests, and source-safe disclosure posture.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function run(root, command, args) {
  execFileSync(command, args, { cwd: root, stdio: 'pipe', encoding: 'utf8' });
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

  assertCheck(failures, pointer === 'V42', `BITCODE_SPEC.txt must remain V42 during V43 gate work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v43' || /^v43\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V43 work must occur on version/v43 or v43/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  for (const relativePath of [
    V43_PACKS_ACTIVITY_MASTER_DETAIL_ARTIFACT_PATH,
    'uapi/components/bitcode/activity/pack-activity-model.ts',
    'uapi/app/api/packs/activity/route.ts',
    'uapi/app/packs/page.tsx',
    'uapi/app/packs/PacksPageClient.tsx',
    'uapi/app/exchange/page.tsx',
    'uapi/tests/packActivityModel.test.ts',
    'packages/specifying/src/canonical/v43-packs-activity-master-detail.js',
    'packages/specifying/test/v43-packs-activity-master-detail.test.js',
    'scripts/generate-v43-packs-activity-master-detail.mjs',
    'scripts/check-v43-gate3-packs-activity-master-detail.mjs',
    'BITCODE_SPEC_V43.md',
    'BITCODE_SPEC_V43_DELTA.md',
    'BITCODE_SPEC_V43_NOTES.md',
    'BITCODE_SPEC_V43_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'packages/specifying/README.md',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    'package.json',
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V43 Gate 3 file: ${relativePath}`);
  }

  const artifact = buildV43PacksActivityMasterDetail({ repoRoot: root });
  assertCheck(failures, artifact.passed, `V43 packs activity predicates failed: ${artifact.coverage.failedPredicateIds.join(', ')}`);
  assertCheck(failures, artifact.coverage.packActivityContractsImplemented === true, 'PackActivity contracts must be implemented.');
  assertCheck(failures, artifact.coverage.packsRouteImplemented === true, 'Packs route must be implemented.');
  assertCheck(failures, artifact.coverage.packsActivityApiImplemented === true, 'Packs activity API must be implemented.');
  assertCheck(failures, artifact.coverage.exchangeRedirectCompatibilityImplemented === true, 'Exchange compatibility redirect must be implemented.');
  assertCheck(failures, artifact.coverage.tableSearchImplemented === true, 'Table search must be implemented.');
  assertCheck(failures, artifact.coverage.columnSortImplemented === true, 'Column sort must be implemented.');
  assertCheck(failures, artifact.coverage.filteringImplemented === true, 'Filtering must be implemented.');
  assertCheck(failures, artifact.coverage.detailProjectionImplemented === true, 'Detail projection must be implemented.');
  assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Artifact must be source-safe metadata only.');
  assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Artifact must not expose protected source.');
  assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Artifact must not expose unpaid AssetPack source.');
  assertCheck(failures, artifact.coverage.rawPromptVisible === false, 'Artifact must not expose raw prompts.');
  assertCheck(failures, artifact.coverage.interpolatedPromptVisible === false, 'Artifact must not expose interpolated prompts.');
  assertCheck(failures, artifact.coverage.rawProviderResponseVisible === false, 'Artifact must not expose raw provider responses.');

  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
  assertCheck(
    failures,
    exists(root, V43_PACKS_ACTIVITY_MASTER_DETAIL_ARTIFACT_PATH) &&
      read(root, V43_PACKS_ACTIVITY_MASTER_DETAIL_ARTIFACT_PATH) === serialized,
    `${V43_PACKS_ACTIVITY_MASTER_DETAIL_ARTIFACT_PATH} must be generated and current.`,
  );

  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  assertCheck(failures, packageJson.includes('"generate:v43-packs-activity-master-detail"'), 'package.json must expose generate:v43-packs-activity-master-detail.');
  assertCheck(failures, packageJson.includes('"check:v43-packs-activity-master-detail"'), 'package.json must expose check:v43-packs-activity-master-detail.');
  assertCheck(failures, packageJson.includes('"check:v43-gate3"'), 'package.json must expose check:v43-gate3.');
  assertCheck(failures, gateWorkflow.includes('check-v43-gate3-packs-activity-master-detail.mjs'), 'Gate workflow must run V43 Gate 3 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v43-gate3-packs-activity-master-detail.mjs'), 'Canon workflow must run V43 Gate 3 checker.');

  if (!args.skipUapiTests) {
    try {
      run(root, 'pnpm', ['--dir', 'uapi', 'exec', 'jest', 'packActivityModel.test.ts', '--runInBand']);
    } catch {
      failures.push('uapi packActivityModel.test.ts must pass.');
    }
  }

  if (failures.length > 0) {
    process.stderr.write('V43 Gate 3 packs activity master-detail check failed:\n');
    for (const failure of failures.filter(Boolean)) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V43 Gate 3 packs activity master-detail check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
