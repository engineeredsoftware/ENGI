#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V47_LANDING_PUBLIC_LAUNCH_MESSAGING_ARTIFACT_PATH,
  buildV47LandingPublicLaunchMessaging,
} from '../scripts/specifying/src/canonical/v47-landing-public-launch-messaging.js';

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
      'Usage: node scripts/check-v47-gate8-landing-public-launch-messaging.mjs [--skip-branch-check] [--skip-package-tests] [--skip-uapi-tests] [--repo-root <path>]',
      '',
      'Checks V47 Gate 8 landing/public launch messaging, generated artifact freshness, V46 claim-boundary preservation, workflows, and focused tests.',
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
    V47_LANDING_PUBLIC_LAUNCH_MESSAGING_ARTIFACT_PATH,
    'scripts/specifying/src/canonical/v47-landing-public-launch-messaging.js',
    'scripts/specifying/test/v47-landing-public-launch-messaging.test.js',
    'scripts/generate-v47-landing-public-launch-messaging.mjs',
    'scripts/check-v47-gate8-landing-public-launch-messaging.mjs',
    '.specifications/BITCODE_SPEC_V47.md',
    '.specifications/BITCODE_SPEC_V47_DELTA.md',
    '.specifications/BITCODE_SPEC_V47_NOTES.md',
    '.specifications/BITCODE_SPEC_V47_PARITY_MATRIX.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    'apps/uapi/components/bitcode/layout/bitcode-public-copy.ts',
    'apps/uapi/app/(root)/components/MarketingLandingPage.tsx',
    'apps/uapi/app/(root)/components/landing/MarketingLandingTestnetSection.tsx',
    'apps/uapi/app/docs/bitcode-docs-content.ts',
    'apps/uapi/tests/marketingLandingPage.test.tsx',
    'scripts/specifying/src/index.js',
    'scripts/specifying/src/index.d.ts',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    'package.json',
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V47 Gate 8 file: ${relativePath}`);
  }

  const artifact = buildV47LandingPublicLaunchMessaging({ repoRoot: root });
  assertCheck(failures, artifact.passed, `V47 landing/public launch messaging predicates failed: ${artifact.coverage.failedPredicateIds.join(', ')}`);
  assertCheck(failures, artifact.coverage.testnetMeaningComplete === true, 'Testnet meaning messaging must be complete.');
  assertCheck(failures, artifact.coverage.coreFlowMessagingComplete === true, 'Core flow messaging must be complete.');
  assertCheck(failures, artifact.coverage.proofBackedTrustComplete === true, 'Proof-backed trust messaging must be complete.');
  assertCheck(
    failures,
    artifact.coverage.sourceSafePositioningComplete === true,
    'Source-safe IP exchange positioning must be complete.',
  );
  assertCheck(failures, artifact.coverage.docsTestnetCardComplete === true, 'Public docs testnet card must be complete.');
  assertCheck(
    failures,
    artifact.coverage.v46ClaimBoundariesPreserved === true,
    'Promoted V46 claim boundaries must remain preserved.',
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
    exists(root, V47_LANDING_PUBLIC_LAUNCH_MESSAGING_ARTIFACT_PATH) &&
      read(root, V47_LANDING_PUBLIC_LAUNCH_MESSAGING_ARTIFACT_PATH) === serialized,
    `${V47_LANDING_PUBLIC_LAUNCH_MESSAGING_ARTIFACT_PATH} must be generated and current.`,
  );

  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  assertCheck(failures, packageJson.includes('"generate:v47-landing-public-launch-messaging"'), 'package.json must expose generate:v47-landing-public-launch-messaging.');
  assertCheck(failures, packageJson.includes('"check:v47-landing-public-launch-messaging"'), 'package.json must expose check:v47-landing-public-launch-messaging.');
  assertCheck(failures, packageJson.includes('"check:v47-gate8"'), 'package.json must expose check:v47-gate8.');
  assertCheck(failures, gateWorkflow.includes('check-v47-gate8-landing-public-launch-messaging.mjs'), 'Gate workflow must run V47 Gate 8 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v47-gate8-landing-public-launch-messaging.mjs'), 'Canon workflow must run V47 Gate 8 checker.');

  if (!args.skipPackageTests) {
    try {
      run(root, 'pnpm', [
        '--dir',
        'scripts/specifying',
        'exec',
        'node',
        '--test',
        '--test-force-exit',
        'test/v47-landing-public-launch-messaging.test.js',
      ]);
    } catch {
      failures.push('scripts/specifying test/v47-landing-public-launch-messaging.test.js must pass.');
    }
  }

  if (!args.skipUapiTests) {
    try {
      run(root, 'pnpm', [
        '--dir',
        'apps/uapi',
        'exec',
        'jest',
        '--runTestsByPath',
        'tests/marketingLandingPage.test.tsx',
        'tests/publicDocsPageContent.test.tsx',
        '--runInBand',
      ]);
    } catch {
      failures.push('uapi marketingLandingPage.test.tsx and publicDocsPageContent.test.tsx must pass.');
    }
  }

  if (failures.length > 0) {
    process.stderr.write('V47 Gate 8 landing/public launch messaging check failed:\n');
    for (const failure of failures.filter(Boolean)) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V47 Gate 8 landing/public launch messaging check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
