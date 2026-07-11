#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V47_SELLER_BUYER_STATE_MACHINE_LAW_ARTIFACT_PATH,
  buildV47SellerBuyerStateMachineLaw,
} from '../packages/protocol/src/canonical/v47-seller-buyer-state-machine-law.js';

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
      'Usage: node scripts/check-v47-gate3-seller-buyer-state-machine-law.mjs [--skip-branch-check] [--skip-package-tests] [--skip-uapi-tests] [--repo-root <path>]',
      '',
      'Checks V47 Gate 3 seller/buyer state-machine law, source-safe generated artifact freshness, route/protocol bindings, scripts, workflows, and focused tests.',
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
    V47_SELLER_BUYER_STATE_MACHINE_LAW_ARTIFACT_PATH,
    'packages/protocol/src/canonical/v47-seller-buyer-state-machine-law.js',
    'packages/protocol/test/v47-seller-buyer-state-machine-law.test.js',
    'scripts/generate-v47-seller-buyer-state-machine-law.mjs',
    'scripts/check-v47-gate3-seller-buyer-state-machine-law.mjs',
    'BITCODE_SPEC_V47.md',
    'BITCODE_SPEC_V47_DELTA.md',
    'BITCODE_SPEC_V47_NOTES.md',
    'BITCODE_SPEC_V47_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'uapi/app/deposit/deposit-route-model.ts',
    'uapi/app/read/read-route-model.ts',
    'uapi/components/bitcode/activity/pack-activity-model.ts',
    'packages/btd/src/receipts.ts',
    'packages/btd/src/settlement.ts',
    'packages/btd/src/source-to-shares.ts',
    'packages/btd/src/semantic-volume.ts',
    'packages/protocol/src/index.js',
    'packages/protocol/src/index.d.ts',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    'package.json',
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V47 Gate 3 file: ${relativePath}`);
  }

  const artifact = buildV47SellerBuyerStateMachineLaw({ repoRoot: root });
  assertCheck(failures, artifact.passed, `V47 seller/buyer state-machine predicates failed: ${artifact.coverage.failedPredicateIds.join(', ')}`);
  assertCheck(failures, artifact.coverage.sellerStateMachineBound === true, 'Seller state machine must be bound.');
  assertCheck(failures, artifact.coverage.buyerStateMachineBound === true, 'Buyer state machine must be bound.');
  assertCheck(failures, artifact.coverage.measurementBeforePrice === true, 'Measurement-before-price guard must be present.');
  assertCheck(failures, artifact.coverage.proofBeforeStateTransition === true, 'Proof-before-state-transition guard must be present.');
  assertCheck(failures, artifact.coverage.acceptedNeedBeforeFindingFits === true, 'Accepted Need must precede Finding Fits.');
  assertCheck(failures, artifact.coverage.finalityBeforeBtdRights === true, 'BTC finality must precede BTD rights.');
  assertCheck(failures, artifact.coverage.btdRightsBeforeSourceDelivery === true, 'BTD rights must precede source delivery.');
  assertCheck(failures, artifact.coverage.packsHistoryProjectionAfterEachTransition === true, '/packs history projection must be bound.');
  assertCheck(failures, artifact.coverage.repairFailClosed === true, 'Missing evidence must fail closed into repair.');
  assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Artifact must be source-safe metadata only.');
  assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Artifact must not expose protected source.');
  assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Artifact must not expose unpaid AssetPack source.');
  assertCheck(failures, artifact.coverage.rawProviderResponseVisible === false, 'Artifact must not expose raw provider responses.');
  assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Artifact must not expose wallet private material.');
  assertCheck(failures, artifact.coverage.valueBearingMainnetEnabled === false, 'Value-bearing mainnet must remain disabled.');

  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
  assertCheck(
    failures,
    exists(root, V47_SELLER_BUYER_STATE_MACHINE_LAW_ARTIFACT_PATH) &&
      read(root, V47_SELLER_BUYER_STATE_MACHINE_LAW_ARTIFACT_PATH) === serialized,
    `${V47_SELLER_BUYER_STATE_MACHINE_LAW_ARTIFACT_PATH} must be generated and current.`,
  );

  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  assertCheck(failures, packageJson.includes('"generate:v47-seller-buyer-state-machine-law"'), 'package.json must expose generate:v47-seller-buyer-state-machine-law.');
  assertCheck(failures, packageJson.includes('"check:v47-seller-buyer-state-machine-law"'), 'package.json must expose check:v47-seller-buyer-state-machine-law.');
  assertCheck(failures, packageJson.includes('"check:v47-gate3"'), 'package.json must expose check:v47-gate3.');
  assertCheck(failures, gateWorkflow.includes('check-v47-gate3-seller-buyer-state-machine-law.mjs'), 'Gate workflow must run V47 Gate 3 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v47-gate3-seller-buyer-state-machine-law.mjs'), 'Canon workflow must run V47 Gate 3 checker.');

  if (!args.skipPackageTests) {
    try {
      run(root, 'pnpm', [
        '--dir',
        'packages/protocol',
        'exec',
        'node',
        '--test',
        '--test-force-exit',
        'test/v47-seller-buyer-state-machine-law.test.js',
      ]);
    } catch {
      failures.push('packages/protocol test/v47-seller-buyer-state-machine-law.test.js must pass.');
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
        'tests/depositRouteModel.test.ts',
        'tests/readRouteModel.test.ts',
        'tests/packsPageClient.test.tsx',
        '--runInBand',
      ]);
    } catch {
      failures.push('uapi depositRouteModel.test.ts, readRouteModel.test.ts, and packsPageClient.test.tsx must pass.');
    }
  }

  if (failures.length > 0) {
    process.stderr.write('V47 Gate 3 seller/buyer state-machine law check failed:\n');
    for (const failure of failures.filter(Boolean)) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V47 Gate 3 seller/buyer state-machine law check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
