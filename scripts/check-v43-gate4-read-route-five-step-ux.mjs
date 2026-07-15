#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V43_READ_ROUTE_FIVE_STEP_UX_ARTIFACT_PATH,
  buildV43ReadRouteFiveStepUx,
} from '../scripts/specifying/src/canonical/v43-read-route-five-step-ux.js';

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
      'Usage: node scripts/check-v43-gate4-read-route-five-step-ux.mjs [--skip-branch-check] [--skip-uapi-tests] [--repo-root <path>]',
      '',
      'Checks V43 Gate 4 /read route extraction, five-step Reading UX, source-safe preview boundaries, generated artifact, docs, workflows, and tests.',
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
  const pointer = read(root, 'specifications/BITCODE_SPEC.txt').trim();

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
    V43_READ_ROUTE_FIVE_STEP_UX_ARTIFACT_PATH,
    'apps/uapi/app/read/read-route-model.ts',
    'apps/uapi/app/read/page.tsx',
    'apps/uapi/app/read/ReadPageClient.tsx',
    'apps/uapi/app/ (removed cockpit tree) terminal-routes.ts',
    'apps/uapi/app/ (removed cockpit tree) ProductDepositReadWorkbench.tsx',
    'apps/uapi/app/ (removed cockpit tree) terminal-enterprise-reading-ux-state.ts',
    'apps/uapi/components/bitcode/layout/nav.tsx',
    'apps/uapi/components/bitcode/layout/workspace-surface.ts',
    'apps/uapi/components/bitcode/layout/bitcode-public-copy.ts',
    'apps/uapi/components/bitcode/layout/bitcode-public-explainers.ts',
    'apps/uapi/components/bitcode/layout/footer.tsx',
    'apps/uapi/tests/readRouteModel.test.ts',
    'apps/uapi/tests/readPageClient.test.tsx',
    'scripts/specifying/src/canonical/v43-read-route-five-step-ux.js',
    'scripts/specifying/test/v43-read-route-five-step-ux.test.js',
    'scripts/generate-v43-read-route-five-step-ux.mjs',
    'scripts/check-v43-gate4-read-route-five-step-ux.mjs',
    'specifications/BITCODE_SPEC_V43.md',
    'specifications/BITCODE_SPEC_V43_DELTA.md',
    'specifications/BITCODE_SPEC_V43_NOTES.md',
    'specifications/BITCODE_SPEC_V43_PARITY_MATRIX.md',
    'specifications/SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'scripts/specifying/README.md',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    'package.json',
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V43 Gate 4 file: ${relativePath}`);
  }

  const artifact = buildV43ReadRouteFiveStepUx({ repoRoot: root });
  assertCheck(failures, artifact.passed, `V43 read route predicates failed: ${artifact.coverage.failedPredicateIds.join(', ')}`);
  assertCheck(failures, artifact.coverage.readRouteImplemented === true, 'Read route must be implemented.');
  assertCheck(failures, artifact.coverage.fiveStepUxImplemented === true, 'Five-step Reading UX must be implemented.');
  assertCheck(failures, artifact.coverage.acceptedNeedRequiredBeforeFindingFits === true, 'Accepted Need must gate Finding Fits.');
  assertCheck(failures, artifact.coverage.sourceSafePreviewBeforeSettlement === true, 'AssetPack preview must be source-safe before settlement.');
  assertCheck(failures, artifact.coverage.deliveryRequiresPaidReadRights === true, 'Delivery must require paid read rights.');
  assertCheck(failures, artifact.coverage.executionStreamRetained === true, 'Execution stream must be retained.');
  assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Artifact must be source-safe metadata only.');
  assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Artifact must not expose protected source.');
  assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Artifact must not expose unpaid AssetPack source.');
  assertCheck(failures, artifact.coverage.rawPromptVisible === false, 'Artifact must not expose raw prompts.');
  assertCheck(failures, artifact.coverage.interpolatedPromptVisible === false, 'Artifact must not expose interpolated prompts.');
  assertCheck(failures, artifact.coverage.rawProviderResponseVisible === false, 'Artifact must not expose raw provider responses.');

  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
  assertCheck(
    failures,
    exists(root, V43_READ_ROUTE_FIVE_STEP_UX_ARTIFACT_PATH) &&
      read(root, V43_READ_ROUTE_FIVE_STEP_UX_ARTIFACT_PATH) === serialized,
    `${V43_READ_ROUTE_FIVE_STEP_UX_ARTIFACT_PATH} must be generated and current.`,
  );

  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  assertCheck(failures, packageJson.includes('"generate:v43-read-route-five-step-ux"'), 'package.json must expose generate:v43-read-route-five-step-ux.');
  assertCheck(failures, packageJson.includes('"check:v43-read-route-five-step-ux"'), 'package.json must expose check:v43-read-route-five-step-ux.');
  assertCheck(failures, packageJson.includes('"check:v43-gate4"'), 'package.json must expose check:v43-gate4.');
  assertCheck(failures, gateWorkflow.includes('check-v43-gate4-read-route-five-step-ux.mjs'), 'Gate workflow must run V43 Gate 4 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v43-gate4-read-route-five-step-ux.mjs'), 'Canon workflow must run V43 Gate 4 checker.');

  if (!args.skipUapiTests) {
    try {
      run(root, 'pnpm', ['--dir', 'apps/uapi', 'exec', 'jest', 'readRouteModel.test.ts', 'readPageClient.test.tsx', '--runInBand']);
    } catch {
      failures.push('uapi readRouteModel.test.ts and readPageClient.test.tsx must pass.');
    }
  }

  if (failures.length > 0) {
    process.stderr.write('V43 Gate 4 read route five-step UX check failed:\n');
    for (const failure of failures.filter(Boolean)) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V43 Gate 4 read route five-step UX check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
