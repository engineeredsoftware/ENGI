#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V47_FEATURE_EXCESS_ALIGNMENT_AUDIT_ARTIFACT_PATH,
  buildV47FeatureExcessAlignmentAudit,
} from '../packages/protocol/src/canonical/v47-feature-excess-alignment-audit.js';

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
      'Usage: node scripts/check-v47-gate2-feature-excess-alignment-audit.mjs [--skip-branch-check] [--skip-uapi-tests] [--repo-root <path>]',
      '',
      'Checks V47 Gate 2 launch-scope discipline, feature excess deferrals, current route entrypoints, generated source-safe audit artifact, docs, and workflow wiring.',
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
    V47_FEATURE_EXCESS_ALIGNMENT_AUDIT_ARTIFACT_PATH,
    'packages/protocol/src/canonical/v47-feature-excess-alignment-audit.js',
    'packages/protocol/test/v47-feature-excess-alignment-audit.test.js',
    'scripts/generate-v47-feature-excess-alignment-audit.mjs',
    'scripts/check-v47-gate2-feature-excess-alignment-audit.mjs',
    'BITCODE_SPEC_V47.md',
    'BITCODE_SPEC_V47_DELTA.md',
    'BITCODE_SPEC_V47_NOTES.md',
    'BITCODE_SPEC_V47_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'uapi/components/bitcode/layout/bitcode-public-copy.ts',
    'uapi/components/bitcode/layout/nav.tsx',
    'uapi/config/features.ts',
    'uapi/app/hero-client.tsx',
    'uapi/app/(root)/components/MarketingPricingSection.tsx',
    'uapi/app/btd/[assetPackId]/page.tsx',
    'uapi/app/exchange/page.tsx',
    'uapi/app/exchange/README.md',
    'uapi/app/terminal/page.tsx',
    'uapi/app/conversations/page.tsx',
    'packages/protocol/src/index.js',
    'packages/protocol/src/index.d.ts',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    'package.json',
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V47 Gate 2 file: ${relativePath}`);
  }

  const artifact = buildV47FeatureExcessAlignmentAudit({ repoRoot: root });
  assertCheck(failures, artifact.passed, `V47 feature excess alignment predicates failed: ${artifact.coverage.failedPredicateIds.join(', ')}`);
  assertCheck(failures, artifact.coverage.websiteLaunchRoutesOnly === true, 'Website launch route policy must be closed.');
  assertCheck(failures, artifact.coverage.publicNavCurrentRoutesOnly === true, 'Public nav must use current V47 routes only.');
  assertCheck(failures, artifact.coverage.launchCtasCurrentRoutesOnly === true, 'Launch CTAs must use current V47 routes only.');
  assertCheck(failures, artifact.coverage.btdDetailCurrentRoutesOnly === true, 'BTD detail CTAs must use current V47 routes only.');
  assertCheck(failures, artifact.coverage.exchangeCompatibilityRedirectOnly === true, '/exchange must remain compatibility redirect only.');
  assertCheck(failures, artifact.coverage.terminalDirectEntryFlaggable === true, '/terminal direct entry must be feature-flaggable.');
  assertCheck(failures, artifact.coverage.conversationsDirectEntryFlaggable === true, '/conversations direct entry must be feature-flaggable.');
  assertCheck(failures, artifact.coverage.nonWebsiteCommercialSurfacesDeferred === true, 'Non-website commercial surfaces must remain deferred.');
  assertCheck(failures, artifact.coverage.valueBearingMainnetEnabled === false, 'Value-bearing mainnet must not be enabled in V47.');
  assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Artifact must be source-safe metadata only.');
  assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Artifact must not expose protected source.');
  assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Artifact must not expose unpaid AssetPack source.');
  assertCheck(failures, artifact.coverage.rawProviderResponseVisible === false, 'Artifact must not expose raw provider responses.');
  assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Artifact must not expose wallet private material.');

  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
  assertCheck(
    failures,
    exists(root, V47_FEATURE_EXCESS_ALIGNMENT_AUDIT_ARTIFACT_PATH) &&
      read(root, V47_FEATURE_EXCESS_ALIGNMENT_AUDIT_ARTIFACT_PATH) === serialized,
    `${V47_FEATURE_EXCESS_ALIGNMENT_AUDIT_ARTIFACT_PATH} must be generated and current.`,
  );

  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  assertCheck(failures, packageJson.includes('"generate:v47-feature-excess-alignment-audit"'), 'package.json must expose generate:v47-feature-excess-alignment-audit.');
  assertCheck(failures, packageJson.includes('"check:v47-feature-excess-alignment-audit"'), 'package.json must expose check:v47-feature-excess-alignment-audit.');
  assertCheck(failures, packageJson.includes('"check:v47-gate2"'), 'package.json must expose check:v47-gate2.');
  assertCheck(failures, gateWorkflow.includes('check-v47-gate2-feature-excess-alignment-audit.mjs'), 'Gate workflow must run V47 Gate 2 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v47-gate2-feature-excess-alignment-audit.mjs'), 'Canon workflow must run V47 Gate 2 checker.');

  if (!args.skipUapiTests) {
    try {
      run(root, 'pnpm', ['--dir', 'uapi', 'exec', 'jest', '--runTestsByPath', 'tests/packsPageClient.test.tsx', 'tests/readPageClient.test.tsx', 'tests/depositPageClient.test.tsx', '--runInBand']);
    } catch {
      failures.push('uapi packsPageClient.test.tsx, readPageClient.test.tsx, and depositPageClient.test.tsx must pass.');
    }
  }

  if (failures.length > 0) {
    process.stderr.write('V47 Gate 2 feature excess alignment audit check failed:\n');
    for (const failure of failures.filter(Boolean)) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V47 Gate 2 feature excess alignment audit check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
