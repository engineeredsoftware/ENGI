#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

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
    repoRoot,
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
      'Usage: node scripts/check-v29-gate3-wallet-signer-btc-operations.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V29 Gate 3 wallet signer session and BTC fee operation closure.',
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
  const pointer = read(root, 'specifications/BITCODE_SPEC.txt').trim();

  assertCheck(
    failures,
    pointer === 'V28',
    `BITCODE_SPEC.txt must remain V28 during V29 Gate 3 work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v29' || /^v29\/gate-3-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V29 Gate 3 work must occur on version/v29 or v29/gate-3-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    'specifications/BITCODE_SPEC_V29.md',
    'specifications/BITCODE_SPEC_V29_DELTA.md',
    'specifications/BITCODE_SPEC_V29_NOTES.md',
    'specifications/BITCODE_SPEC_V29_PARITY_MATRIX.md',
    'packages/btd/src/btc-fee-operation.ts',
    'packages/btd/src/index.ts',
    'packages/btd/__tests__/btc-fee-operation.test.ts',
    'packages/api/src/routes/btd-crypto.ts',
    'apps/uapi/app/terminal/terminal-transaction-query.ts',
    'apps/uapi/app/terminal/terminal-transaction-read-model.ts',
    'apps/uapi/app/terminal/terminal-wallet-btc-operation.ts',
    'apps/uapi/app/terminal/TerminalTransactionWalletBtcCard.tsx',
    'apps/uapi/app/terminal/TerminalTransactionDetailSurface.tsx',
    'apps/uapi/tests/terminalWalletBtcOperation.test.ts',
    'apps/uapi/tests/terminalTransactionReadModel.test.ts',
    'apps/uapi/app/terminal/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing Gate 3 file: ${relativePath}`);
  }

  const spec = read(root, 'specifications/BITCODE_SPEC_V29.md');
  const delta = read(root, 'specifications/BITCODE_SPEC_V29_DELTA.md');
  const notes = read(root, 'specifications/BITCODE_SPEC_V29_NOTES.md');
  const parity = read(root, 'specifications/BITCODE_SPEC_V29_PARITY_MATRIX.md');
  const btdOperation = read(root, 'packages/btd/src/btc-fee-operation.ts');
  const btdIndex = read(root, 'packages/btd/src/index.ts');
  const btdTest = read(root, 'packages/btd/__tests__/btc-fee-operation.test.ts');
  const apiRoute = read(root, 'packages/api/src/routes/btd-crypto.ts');
  const query = read(root, 'apps/uapi/app/terminal/terminal-transaction-query.ts');
  const readModel = read(root, 'apps/uapi/app/terminal/terminal-transaction-read-model.ts');
  const terminalOperation = read(root, 'apps/uapi/app/terminal/terminal-wallet-btc-operation.ts');
  const terminalCard = read(root, 'apps/uapi/app/terminal/TerminalTransactionWalletBtcCard.tsx');
  const detailSurface = read(root, 'apps/uapi/app/terminal/TerminalTransactionDetailSurface.tsx');
  const terminalTest = read(root, 'apps/uapi/tests/terminalWalletBtcOperation.test.ts');
  const readModelTest = read(root, 'apps/uapi/tests/terminalTransactionReadModel.test.ts');
  const terminalReadme = read(root, 'apps/uapi/app/terminal/README.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');

  assertCheck(failures, spec.includes('V29 Wallet/BTC operation canon'), 'V29 SPEC must define the Wallet/BTC operation canon.');
  assertCheck(failures, delta.includes('BtcFeeOperationPosture'), 'V29 DELTA must list Gate 3 operation posture acceptance.');
  assertCheck(failures, notes.includes('Gate 3 working notes'), 'V29 NOTES must carry Gate 3 working notes.');
  assertCheck(failures, parity.includes('## Gate 3 Parity'), 'V29 PARITY must include Gate 3 parity.');
  assertCheck(failures, parity.includes('Gate 3 completion condition'), 'V29 PARITY must include Gate 3 completion condition.');

  for (const symbol of [
    'BtcFeeQuote',
    'WalletSignerSessionRecovery',
    'BtcFeeBlockedReadinessReceipt',
    'BtcFeeOperationPosture',
    'buildBtcFeeQuote',
    'advanceBtcFeeQuote',
    'buildWalletSignerSessionRecovery',
    'buildBtcFeeOperationPosture',
    'server_custody_rejected',
    'fee-quote-not-accepted',
  ]) {
    assertCheck(failures, btdOperation.includes(symbol), `BTD operation primitive is missing ${symbol}.`);
  }
  assertCheck(failures, btdIndex.includes("export * from './btc-fee-operation'"), 'BTD package must export BTC fee operation primitives.');
  assertCheck(
    failures,
    btdTest.includes('BTC fee quote lifecycle') &&
      btdTest.includes('wallet signer recovery') &&
      btdTest.includes('blocked-readiness') &&
      btdTest.includes('confirmed settlement posture'),
    'BTD tests must cover quote lifecycle, signer recovery, blocked readiness, and confirmed posture.',
  );
  assertCheck(
    failures,
    apiRoute.includes('operationPosture') &&
      apiRoute.includes('normalizeBtcFeeQuote') &&
      apiRoute.includes('buildBtcFeeOperationPosture'),
    'BTC fee route must serialize operation posture and normalize quote carriers.',
  );
  assertCheck(
    failures,
    query.includes("'wallet-btc'") &&
      readModel.includes("'wallet-btc'") &&
      readModel.includes('Wallet/BTC') &&
      readModel.includes('No wallet signer session, BTC fee quote, PSBT, or finality readback is attached yet.'),
    'Terminal query/read model must expose the Wallet/BTC detail section and empty blocker.',
  );
  assertCheck(
    failures,
    terminalOperation.includes('buildTerminalWalletBtcOperationProjection') &&
      terminalOperation.includes('Server custody') &&
      terminalOperation.includes('Replacement transaction must be reconciled'),
    'Terminal Wallet/BTC projection must expose state, custody, and replacement blockers.',
  );
  assertCheck(
    failures,
    terminalCard.includes('TerminalTransactionWalletBtcCard') &&
      terminalCard.includes('Blocked readiness') &&
      terminalCard.includes('Wallet and BTC payload'),
    'Terminal Wallet/BTC card must render readable blockers and raw audit payload.',
  );
  assertCheck(
    failures,
    detailSurface.includes('TerminalTransactionWalletBtcCard') &&
      detailSurface.includes("detailSection === 'wallet-btc'"),
    'Detail surface must render the Wallet/BTC section.',
  );
  assertCheck(
    failures,
    terminalTest.includes('confirmed BTC fee settlement') &&
      terminalTest.includes('replacement') &&
      terminalTest.includes('missing quote readiness'),
    'Terminal Wallet/BTC tests must cover confirmed and blocked states.',
  );
  assertCheck(
    failures,
    readModelTest.includes("'wallet-btc'") && readModelTest.includes("factFamily: 'wallet'"),
    'Read-model tests must include the Wallet/BTC section.',
  );
  assertCheck(
    failures,
    terminalReadme.includes('Wallet/BTC') && terminalReadme.includes('quote root'),
    'Terminal README must document the Wallet/BTC section.',
  );
  assertCheck(failures, packageJson.includes('"check:v29-gate3"'), 'package.json must expose check:v29-gate3.');
  assertCheck(
    failures,
    gateWorkflow.includes('check-v29-gate3-wallet-signer-btc-operations.mjs'),
    'Gate quality workflow must run the Gate 3 checker.',
  );
  assertCheck(
    failures,
    gateWorkflow.includes('tests/terminalWalletBtcOperation.test.ts') &&
      gateWorkflow.includes('__tests__/btc-fee-operation.test.ts'),
    'Gate quality workflow must run the Gate 3 focused tests.',
  );

  const versionedSource = execFileSync(
    'find',
    ['packages/btd/src', 'apps/uapi/app/terminal', '-name', '*v29*', '-print'],
    {
      cwd: root,
      encoding: 'utf8',
    },
  ).trim();
  assertCheck(
    failures,
    versionedSource.length === 0,
    `Gate 3 source identifiers must remain unversioned. Found:\n${versionedSource}`,
  );

  if (failures.length > 0) {
    process.stderr.write('V29 Gate 3 wallet signer/BTC operation check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V29 Gate 3 wallet signer/BTC operation ok pointer=${pointer}\n`);
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
