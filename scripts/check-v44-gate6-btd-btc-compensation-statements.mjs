#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V44_BTD_BTC_COMPENSATION_STATEMENTS_ARTIFACT_PATH,
  buildV44BtdBtcCompensationStatements,
} from '../packages/protocol/src/canonical/v44-btd-btc-compensation-statements.js';

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
      'Usage: node scripts/check-v44-gate6-btd-btc-compensation-statements.mjs [--skip-branch-check] [--skip-uapi-tests] [--skip-package-tests] [--repo-root <path>]',
      '',
      'V44 Gate 6 BTD/BTC compensation statements check: validates BTD range state, BTC settlement observations, source-to-shares contributor allocation, depositor earning summaries, treasury routes, reconciliation, repair state, Packs readback, tests, workflows, and generated artifact freshness.',
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
    V44_BTD_BTC_COMPENSATION_STATEMENTS_ARTIFACT_PATH,
    'packages/asset-packs-pipelines/domain/src/btd-btc-compensation-statements.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/btd-btc-compensation-statements.test.ts',
    'packages/asset-packs-pipelines/domain/src/asset-pack-settlement-rights-delivery.ts',
    'packages/btd/src/source-to-shares.ts',
    'packages/btd/src/settlement.ts',
    'packages/btd/src/receipts.ts',
    'packages/btd/src/reconciliation.ts',
    'uapi/components/bitcode/activity/pack-activity-model.ts',
    'uapi/app/packs/PacksPageClient.tsx',
    'uapi/tests/packActivityModel.test.ts',
    'uapi/tests/packsPageClient.test.tsx',
    'packages/protocol/src/canonical/v44-btd-btc-compensation-statements.js',
    'packages/protocol/test/v44-btd-btc-compensation-statements.test.js',
    'scripts/generate-v44-btd-btc-compensation-statements.mjs',
    'scripts/check-v44-gate6-btd-btc-compensation-statements.mjs',
    'BITCODE_SPEC_V44.md',
    'BITCODE_SPEC_V44_DELTA.md',
    'BITCODE_SPEC_V44_NOTES.md',
    'BITCODE_SPEC_V44_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'packages/protocol/README.md',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    'package.json',
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V44 Gate 6 file: ${relativePath}`);
  }

  const artifact = buildV44BtdBtcCompensationStatements({ repoRoot: root });
  assertCheck(failures, artifact.passed, `V44 BTD/BTC compensation statements predicates failed: ${artifact.coverage.failedPredicateIds.join(', ')}`);
  assertCheck(failures, artifact.coverage.btdBtcCompensationStatementsImplemented === true, 'BTD/BTC compensation statements must be implemented.');
  assertCheck(failures, artifact.coverage.btdRangeStateImplemented === true, 'BTD range state must be implemented.');
  assertCheck(failures, artifact.coverage.btcSettlementObservationImplemented === true, 'BTC settlement observations must be implemented.');
  assertCheck(failures, artifact.coverage.sourceToSharesContributorStatementsImplemented === true, 'Source-to-shares contributor statements must be implemented.');
  assertCheck(failures, artifact.coverage.depositorEarningSummariesImplemented === true, 'Depositor earning summaries must be implemented.');
  assertCheck(failures, artifact.coverage.treasuryRoutesImplemented === true, 'Treasury routes must be implemented.');
  assertCheck(failures, artifact.coverage.reconciliationStatementImplemented === true, 'Reconciliation statements must be implemented.');
  assertCheck(failures, artifact.coverage.repairStatementImplemented === true, 'Repair statements must be implemented.');
  assertCheck(failures, artifact.coverage.packsAccountingReadbackImplemented === true, '/packs accounting readback must be implemented.');
  assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Artifact must be source-safe metadata only.');
  assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Artifact must not expose protected source.');
  assertCheck(failures, artifact.coverage.rawSourceTextVisible === false, 'Artifact must not expose raw source text.');
  assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Artifact must not expose unpaid AssetPack source.');
  assertCheck(failures, artifact.coverage.rawPromptVisible === false, 'Artifact must not expose raw prompts.');
  assertCheck(failures, artifact.coverage.rawProviderResponseVisible === false, 'Artifact must not expose raw provider responses.');
  assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Artifact must not expose wallet private material.');
  assertCheck(failures, artifact.coverage.settlementPrivatePayloadVisible === false, 'Artifact must not expose private settlement payloads.');
  assertCheck(failures, artifact.coverage.valueBearingMainnetAdmitted === false, 'Artifact must not admit value-bearing mainnet operation.');

  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
  assertCheck(
    failures,
    exists(root, V44_BTD_BTC_COMPENSATION_STATEMENTS_ARTIFACT_PATH) &&
      read(root, V44_BTD_BTC_COMPENSATION_STATEMENTS_ARTIFACT_PATH) === serialized,
    `${V44_BTD_BTC_COMPENSATION_STATEMENTS_ARTIFACT_PATH} must be generated and current.`,
  );

  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  assertCheck(failures, packageJson.includes('"generate:v44-btd-btc-compensation-statements"'), 'package.json must expose generate:v44-btd-btc-compensation-statements.');
  assertCheck(failures, packageJson.includes('"check:v44-btd-btc-compensation-statements"'), 'package.json must expose check:v44-btd-btc-compensation-statements.');
  assertCheck(failures, packageJson.includes('"check:v44-gate6"'), 'package.json must expose check:v44-gate6.');
  assertCheck(failures, gateWorkflow.includes('check-v44-gate6-btd-btc-compensation-statements.mjs'), 'Gate workflow must run V44 Gate 6 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v44-gate6-btd-btc-compensation-statements.mjs'), 'Canon workflow must run V44 Gate 6 checker.');

  try {
    run(root, 'node', ['scripts/generate-v44-btd-btc-compensation-statements.mjs', '--check']);
  } catch {
    failures.push('V44 BTD/BTC compensation statements artifact must be fresh.');
  }

  if (!args.skipPackageTests) {
    try {
      run(root, 'pnpm', ['--dir', 'packages/protocol', 'exec', 'node', '--test', '--test-force-exit', 'test/v44-btd-btc-compensation-statements.test.js']);
    } catch {
      failures.push('packages/protocol/test/v44-btd-btc-compensation-statements.test.js must pass.');
    }

    try {
      run(root, 'pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'test', '--', 'btd-btc-compensation-statements.test.ts', '--runInBand']);
    } catch {
      failures.push('packages/pipelines/asset-pack BTD/BTC compensation statement tests must pass.');
    }
  }

  if (!args.skipUapiTests) {
    try {
      run(root, 'pnpm', ['--dir', 'uapi', 'exec', 'jest', 'packActivityModel.test.ts', 'packsPageClient.test.tsx', '--runInBand']);
    } catch {
      failures.push('uapi Packs activity model/page tests must pass.');
    }
  }

  if (failures.length > 0) {
    process.stderr.write('V44 Gate 6 BTD/BTC compensation statements check failed:\n');
    for (const failure of failures.filter(Boolean)) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V44 Gate 6 BTD/BTC compensation statements check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
