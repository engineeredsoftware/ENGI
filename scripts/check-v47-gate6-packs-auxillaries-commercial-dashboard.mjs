#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V47_PACKS_AUXILLARIES_DASHBOARD_ARTIFACT_PATH,
  buildV47PacksAuxillariesCommercialDashboard,
} from '../packages/specifying/src/canonical/v47-packs-auxillaries-commercial-dashboard.js';

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

function run(root, command, args) {
  execFileSync(command, args, { cwd: root, stdio: 'pipe', encoding: 'utf8' });
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function parseArgs(argv) {
  const args = {
    repoRoot: defaultRepoRoot,
    skipBranchCheck: false,
    skipPackageTests: false,
    skipUapiTests: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--skip-package-tests') args.skipPackageTests = true;
    else if (arg === '--skip-uapi-tests') args.skipUapiTests = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }
  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v47-gate6-packs-auxillaries-commercial-dashboard.mjs [--skip-branch-check] [--skip-package-tests] [--skip-uapi-tests] [--repo-root <path>]',
      '',
      'Checks V47 Gate 6 packs/auxillaries commercial dashboard completion, generated artifact freshness, master-detail and repair surfaces, Auxillaries launch readiness, workflows, and focused tests.',
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

  assertCheck(failures, pointer === 'V46', `BITCODE_SPEC.txt must remain V46 during V47 gate work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v47' || /^v47\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V47 work must occur on version/v47 or v47/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  for (const relativePath of [
    V47_PACKS_AUXILLARIES_DASHBOARD_ARTIFACT_PATH,
    'packages/specifying/src/canonical/v47-packs-auxillaries-commercial-dashboard.js',
    'packages/specifying/test/v47-packs-auxillaries-commercial-dashboard.test.js',
    'scripts/generate-v47-packs-auxillaries-commercial-dashboard.mjs',
    'scripts/check-v47-gate6-packs-auxillaries-commercial-dashboard.mjs',
    'BITCODE_SPEC_V47.md',
    'BITCODE_SPEC_V47_DELTA.md',
    'BITCODE_SPEC_V47_NOTES.md',
    'BITCODE_SPEC_V47_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'uapi/app/packs/PacksPageClient.tsx',
    'uapi/components/bitcode/activity/pack-activity-model.ts',
    'uapi/app/api/packs/activity/route.ts',
    'uapi/app/auxillaries/page.tsx',
    'uapi/app/auxillaries/components/auxillary-pane-meta.ts',
    'uapi/app/auxillaries/components/organization/OrganizationSettings.tsx',
    'uapi/app/auxillaries/components/organization/BTDTreasuryManagement.tsx',
    'uapi/app/auxillaries/components/AuxillariesWalletPane.tsx',
    'uapi/tests/packActivityModel.test.ts',
    'uapi/tests/packsPageClient.test.tsx',
    'uapi/tests/auxillariesWalletPane.test.tsx',
    'uapi/tests/auxillariesWorkspacePanels.test.tsx',
    'packages/specifying/src/index.js',
    'packages/specifying/src/index.d.ts',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    'package.json',
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V47 Gate 6 file: ${relativePath}`);
  }

  const artifact = buildV47PacksAuxillariesCommercialDashboard({ repoRoot: root });
  assertCheck(failures, artifact.passed, `V47 packs/auxillaries dashboard predicates failed: ${artifact.coverage.failedPredicateIds.join(', ')}`);
  assertCheck(failures, artifact.coverage.masterDetailComplete === true, 'PackActivity master-detail must be complete.');
  assertCheck(failures, artifact.coverage.searchAndFiltersComplete === true, 'Search and filters must be complete.');
  assertCheck(failures, artifact.coverage.historiesReadbackComplete === true, 'Histories readback must be complete.');
  assertCheck(failures, artifact.coverage.rightsStateTrackingComplete === true, 'BTD rights state tracking must be complete.');
  assertCheck(failures, artifact.coverage.repairSurfaceComplete === true, 'Repair surface must be complete.');
  assertCheck(
    failures,
    artifact.coverage.auxillariesLaunchReadinessComplete === true,
    'Auxillaries launch readiness must be complete.',
  );
  assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Artifact must be source-safe metadata only.');
  assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Artifact must not expose protected source.');
  assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Artifact must not expose unpaid AssetPack source.');
  assertCheck(failures, artifact.coverage.rawProviderResponseVisible === false, 'Artifact must not expose raw provider responses.');
  assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Artifact must not expose wallet private material.');
  assertCheck(failures, artifact.coverage.valueBearingMainnetEnabled === false, 'Value-bearing mainnet must remain disabled.');

  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
  assertCheck(
    failures,
    exists(root, V47_PACKS_AUXILLARIES_DASHBOARD_ARTIFACT_PATH) &&
      read(root, V47_PACKS_AUXILLARIES_DASHBOARD_ARTIFACT_PATH) === serialized,
    `${V47_PACKS_AUXILLARIES_DASHBOARD_ARTIFACT_PATH} must be generated and current.`,
  );

  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  assertCheck(failures, packageJson.includes('"generate:v47-packs-auxillaries-commercial-dashboard"'), 'package.json must expose generate:v47-packs-auxillaries-commercial-dashboard.');
  assertCheck(failures, packageJson.includes('"check:v47-packs-auxillaries-commercial-dashboard"'), 'package.json must expose check:v47-packs-auxillaries-commercial-dashboard.');
  assertCheck(failures, packageJson.includes('"check:v47-gate6"'), 'package.json must expose check:v47-gate6.');
  assertCheck(failures, gateWorkflow.includes('check-v47-gate6-packs-auxillaries-commercial-dashboard.mjs'), 'Gate workflow must run V47 Gate 6 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v47-gate6-packs-auxillaries-commercial-dashboard.mjs'), 'Canon workflow must run V47 Gate 6 checker.');

  if (!args.skipPackageTests) {
    try {
      run(root, 'pnpm', [
        '--dir',
        'packages/specifying',
        'exec',
        'node',
        '--test',
        '--test-force-exit',
        'test/v47-packs-auxillaries-commercial-dashboard.test.js',
      ]);
    } catch {
      failures.push('packages/specifying test/v47-packs-auxillaries-commercial-dashboard.test.js must pass.');
    }
  }

  if (!args.skipUapiTests) {
    try {
      run(root, 'pnpm', [
        '--dir',
        'uapi',
        'exec',
        'jest',
        '--runTestsByPath',
        'tests/packActivityModel.test.ts',
        'tests/packsPageClient.test.tsx',
        'tests/auxillariesWalletPane.test.tsx',
        'tests/auxillariesWorkspacePanels.test.tsx',
        '--runInBand',
      ]);
    } catch {
      failures.push('uapi packs and auxillaries tests must pass.');
    }
  }

  if (failures.length > 0) {
    process.stderr.write('V47 Gate 6 packs/auxillaries commercial dashboard check failed:\n');
    for (const failure of failures.filter(Boolean)) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V47 Gate 6 packs/auxillaries commercial dashboard check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
