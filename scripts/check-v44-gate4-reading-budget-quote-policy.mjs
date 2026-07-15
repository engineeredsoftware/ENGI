#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V44_READING_BUDGET_QUOTE_POLICY_ARTIFACT_PATH,
  buildV44ReadingBudgetQuotePolicy,
} from '../scripts/specifying/src/canonical/v44-reading-budget-quote-policy.js';

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

function run(root, command, args) {
  execFileSync(command, args, { cwd: root, stdio: 'pipe', encoding: 'utf8' });
}

function parseArgs(argv) {
  const args = {
    repoRoot: defaultRepoRoot,
    skipBranchCheck: false,
    skipUapiTests: false,
    skipPackageTests: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--skip-uapi-tests') args.skipUapiTests = true;
    else if (arg === '--skip-package-tests') args.skipPackageTests = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }
  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v44-gate4-reading-budget-quote-policy.mjs [--skip-branch-check] [--skip-uapi-tests] [--skip-package-tests] [--repo-root <path>]',
      '',
      'V44 Gate 4 Reading budget quote policy check: validates Reading budget envelopes, approval thresholds, quote expiry, deterministic share-to-fee policy, buyer authorization, BTC/BTD settlement readiness, source-safe pre-purchase review, route UI, tests, workflows, and generated artifact freshness.',
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

  assertCheck(failures, pointer === 'V43', `BITCODE_SPEC.txt must remain V43 during V44 gate work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v44' || /^v44\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V44 work must occur on version/v44 or v44/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  for (const relativePath of [
    V44_READING_BUDGET_QUOTE_POLICY_ARTIFACT_PATH,
    'apps/uapi/app/read/read-route-model.ts',
    'apps/uapi/app/read/ReadPageClient.tsx',
    'apps/uapi/tests/readRouteModel.test.ts',
    'packages/btd/src/source-to-shares.ts',
    'packages/btd/src/btc-fee-operation.ts',
    'scripts/specifying/src/canonical/v44-reading-budget-quote-policy.js',
    'scripts/specifying/test/v44-reading-budget-quote-policy.test.js',
    'scripts/generate-v44-reading-budget-quote-policy.mjs',
    'scripts/check-v44-gate4-reading-budget-quote-policy.mjs',
    'BITCODE_SPEC_V44.md',
    'BITCODE_SPEC_V44_DELTA.md',
    'BITCODE_SPEC_V44_NOTES.md',
    'BITCODE_SPEC_V44_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'scripts/specifying/README.md',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    'package.json',
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V44 Gate 4 file: ${relativePath}`);
  }

  const artifact = buildV44ReadingBudgetQuotePolicy({ repoRoot: root });
  assertCheck(failures, artifact.passed, `V44 Reading budget quote policy predicates failed: ${artifact.coverage.failedPredicateIds.join(', ')}`);
  assertCheck(failures, artifact.coverage.budgetEnvelopeImplemented === true, 'Budget envelopes must be implemented.');
  assertCheck(failures, artifact.coverage.approvalThresholdImplemented === true, 'Approval thresholds must be implemented.');
  assertCheck(failures, artifact.coverage.quoteExpiryImplemented === true, 'Quote expiry must be implemented.');
  assertCheck(failures, artifact.coverage.deterministicShareToFeeImplemented === true, 'Deterministic share-to-fee policy must be implemented.');
  assertCheck(failures, artifact.coverage.buyerAuthorizationImplemented === true, 'Buyer authorization must be implemented.');
  assertCheck(failures, artifact.coverage.walletAuthorityImplemented === true, 'Wallet authority must be implemented.');
  assertCheck(failures, artifact.coverage.btcBtdSettlementReadinessImplemented === true, 'BTC/BTD settlement readiness must be implemented.');
  assertCheck(failures, artifact.coverage.sourceSafePrePurchaseReviewImplemented === true, 'Source-safe pre-purchase review must be implemented.');
  assertCheck(failures, artifact.coverage.readRouteUiImplemented === true, '/read procurement UI must be implemented.');
  assertCheck(failures, artifact.coverage.noSourceLeakTestsImplemented === true, 'No-source-leak tests must be implemented.');
  assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Artifact must be source-safe metadata only.');
  assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Artifact must not expose protected source.');
  assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Artifact must not expose unpaid AssetPack source.');
  assertCheck(failures, artifact.coverage.rawPromptVisible === false, 'Artifact must not expose raw prompts.');
  assertCheck(failures, artifact.coverage.rawProviderResponseVisible === false, 'Artifact must not expose raw provider responses.');
  assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Artifact must not expose wallet private material.');
  assertCheck(failures, artifact.coverage.settlementPrivatePayloadVisible === false, 'Artifact must not expose private settlement payloads.');
  assertCheck(failures, artifact.coverage.valueBearingMainnetAdmitted === false, 'Artifact must not admit value-bearing mainnet operation.');

  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
  assertCheck(
    failures,
    exists(root, V44_READING_BUDGET_QUOTE_POLICY_ARTIFACT_PATH) &&
      read(root, V44_READING_BUDGET_QUOTE_POLICY_ARTIFACT_PATH) === serialized,
    `${V44_READING_BUDGET_QUOTE_POLICY_ARTIFACT_PATH} must be generated and current.`,
  );

  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  assertCheck(failures, packageJson.includes('"generate:v44-reading-budget-quote-policy"'), 'package.json must expose generate:v44-reading-budget-quote-policy.');
  assertCheck(failures, packageJson.includes('"check:v44-reading-budget-quote-policy"'), 'package.json must expose check:v44-reading-budget-quote-policy.');
  assertCheck(failures, packageJson.includes('"check:v44-gate4"'), 'package.json must expose check:v44-gate4.');
  assertCheck(failures, gateWorkflow.includes('check-v44-gate4-reading-budget-quote-policy.mjs'), 'Gate workflow must run V44 Gate 4 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v44-gate4-reading-budget-quote-policy.mjs'), 'Canon workflow must run V44 Gate 4 checker.');

  try {
    run(root, 'node', ['scripts/generate-v44-reading-budget-quote-policy.mjs', '--check']);
  } catch {
    failures.push('V44 Reading budget quote policy artifact must be fresh.');
  }

  if (!args.skipPackageTests) {
    try {
      run(root, 'pnpm', ['--dir', 'scripts/specifying', 'exec', 'node', '--test', '--test-force-exit', 'test/v44-reading-budget-quote-policy.test.js']);
    } catch {
      failures.push('scripts/specifying/test/v44-reading-budget-quote-policy.test.js must pass.');
    }
  }

  if (!args.skipUapiTests) {
    try {
      run(root, 'pnpm', ['--dir', 'apps/uapi', 'exec', 'jest', 'readRouteModel.test.ts', '--runInBand']);
    } catch {
      failures.push('uapi readRouteModel.test.ts must pass.');
    }
  }

  if (failures.length > 0) {
    process.stderr.write('V44 Gate 4 Reading budget quote policy check failed:\n');
    for (const failure of failures.filter(Boolean)) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V44 Gate 4 Reading budget quote policy check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
