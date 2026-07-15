#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
    repoRoot: defaultRepoRoot,
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
      'Usage: node scripts/check-v31-gate5-wallet-btd-pane-readiness.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V31 Gate 5 Wallet/BTD pane readiness, no-custody projection, source-safe read-right summaries, tests, docs, and workflow coverage.',
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

  assertCheck(
    failures,
    pointer === 'V30',
    `BITCODE_SPEC.txt must remain V30 during V31 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v31' || /^v31\/gate-(?:5|6|7|8|9|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V31 Gate 5+ work must occur on version/v31 or v31/gate-5+ branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  for (const relativePath of [
    'packages/btd/src/auxillaries-support.ts',
    'packages/btd/__tests__/btd.test.ts',
    'packages/api/src/routes/auxillaries-contract.ts',
    'packages/api/src/routes/auxillaries.ts',
    'packages/api/src/routes/__tests__/auxillaries-contract.test.ts',
    'apps/uapi/app/auxillaries/components/AuxillariesWalletPane.tsx',
    'apps/uapi/hooks/useUserData.ts',
    'apps/uapi/hooks/useUserData.js',
    'apps/uapi/tests/auxillariesWalletPane.test.tsx',
    'apps/uapi/tests/userDataRoute.test.ts',
    'BITCODE_SPEC_V31.md',
    'BITCODE_SPEC_V31_DELTA.md',
    'BITCODE_SPEC_V31_NOTES.md',
    'BITCODE_SPEC_V31_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
  ]) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V31 Gate 5 file: ${relativePath}`);
  }

  const btdSupport = read(root, 'packages/btd/src/auxillaries-support.ts');
  const btdIndex = read(root, 'packages/btd/src/index.ts');
  const btdTest = read(root, 'packages/btd/__tests__/btd.test.ts');
  const contract = read(root, 'packages/api/src/routes/auxillaries-contract.ts');
  const route = read(root, 'packages/api/src/routes/auxillaries.ts');
  const contractTest = read(root, 'packages/api/src/routes/__tests__/auxillaries-contract.test.ts');
  const walletPane = read(root, 'apps/uapi/app/auxillaries/components/AuxillariesWalletPane.tsx');
  const useUserData = read(root, 'apps/uapi/hooks/useUserData.ts');
  const useUserDataJs = read(root, 'apps/uapi/hooks/useUserData.js');
  const walletPaneTest = read(root, 'apps/uapi/tests/auxillariesWalletPane.test.tsx');
  const userDataRouteTest = read(root, 'apps/uapi/tests/userDataRoute.test.ts');
  const spec = read(root, 'BITCODE_SPEC_V31.md');
  const delta = read(root, 'BITCODE_SPEC_V31_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V31_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V31_PARITY_MATRIX.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');
  const apiReadme = read(root, 'packages/api/README.md');
  const auxReadme = read(root, 'apps/uapi/app/auxillaries/README.md');
  const btdReadme = read(root, 'packages/btd/README.md');
  const packageJson = read(root, 'package.json');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');

  for (const symbol of [
    'BtdWalletBtdSupportProjection',
    'buildBtdWalletBtdSupportProjection',
    'walletCapabilityRoot',
    'noCustody',
    'serverCustody',
    'networkReadiness',
    'ownerReadCount',
    'licensedReadCount',
    'pendingSettlementCount',
    'protectedSourceVisible',
    'settlementBlockers',
    'not_exchange_market_state',
  ]) {
    assertCheck(failures, btdSupport.includes(symbol), `BTD Auxillaries projection must own ${symbol}.`);
  }

  assertCheck(failures, btdIndex.includes("export * from './auxillaries-support'"), 'BTD package entrypoint must export Auxillaries support projection.');

  for (const symbol of [
    'buildBtdWalletBtdSupportProjection',
    'AuxillariesWalletBtdPaneState',
    'walletCapabilityRoot',
    'networkReadiness',
    'btdReadRightSummary',
    'treasuryScope',
    'exchangeMarketState',
    'settlementBlockers',
  ]) {
    assertCheck(failures, contract.includes(symbol), `Auxillaries route contract must carry ${symbol}.`);
  }

  for (const routePhrase of [
    'read_right_state',
    'source_safe_preview_root',
    'readRightState',
    'sourceSafePreviewRoot',
  ]) {
    assertCheck(failures, route.includes(routePhrase), `Auxillaries data route must hydrate ${routePhrase}.`);
  }

  for (const uiPhrase of [
    'walletBtdPaneState',
    'auxillaries-wallet-btd-readiness',
    'Signer posture',
    'Network readiness',
    'BTD range cells',
    'Read-right mix',
    'Settlement readiness',
    'Not Exchange',
    'protected source visibility fixed false',
  ]) {
    assertCheck(
      failures,
      walletPane.includes(uiPhrase) || useUserData.includes(uiPhrase) || useUserDataJs.includes(uiPhrase),
      `Wallet pane/read model must project ${uiPhrase}.`,
    );
  }

  for (const testPhrase of [
    'buildBtdWalletBtdSupportProjection',
    'noCustody',
    'serverCustody',
    'totalRangeCells',
    'ownerReadCount',
    'licensedReadCount',
    'protectedSourceVisible',
    'not_exchange_market_state',
    'auxillaries-wallet-btd-readiness',
    'Not Exchange',
  ]) {
    assertCheck(
      failures,
      btdTest.includes(testPhrase) ||
        contractTest.includes(testPhrase) ||
        walletPaneTest.includes(testPhrase) ||
        userDataRouteTest.includes(testPhrase),
      `Gate 5 tests must cover ${testPhrase}.`,
    );
  }

  for (const docPhrase of [
    'BtdWalletBtdSupportProjection',
    'no-custody signer posture',
    'range/read-right',
    'protected source',
    'not Exchange market state',
  ]) {
    assertCheck(
      failures,
      spec.includes(docPhrase) ||
        delta.includes(docPhrase) ||
        notes.includes(docPhrase) ||
        parity.includes(docPhrase) ||
        apiReadme.includes(docPhrase) ||
        auxReadme.includes(docPhrase) ||
        btdReadme.includes(docPhrase),
      `V31 Gate 5 docs/spec must describe ${docPhrase}.`,
    );
  }

  assertCheck(
    failures,
    /Current working gate: V31 Gate (?:5|6|7|8|9|10)\b/u.test(roadmap),
    'Roadmap must track V31 Gate 5 or a later V31 gate as current working gate.',
  );
  assertCheck(failures, delta.includes('Gate 5 implementation centers'), 'V31 DELTA must name Gate 5 implementation centers.');
  assertCheck(failures, notes.includes('Gate 5 closure note'), 'V31 NOTES must include the Gate 5 closure note.');
  assertCheck(failures, !/\|\s*Wallet panes consume no-custody signer posture\s*\|[^|]*\|\s*pending\s*\|/u.test(parity), 'Gate 5 wallet parity must not remain pending.');
  assertCheck(failures, !/\|\s*BTD panes consume range\/read-right\/treasury summaries\s*\|[^|]*\|\s*pending\s*\|/u.test(parity), 'Gate 5 BTD parity must not remain pending.');
  assertCheck(failures, packageJson.includes('"check:v31-gate5"'), 'package.json must expose check:v31-gate5.');
  assertCheck(failures, workflow.includes('check-v31-gate5-wallet-btd-pane-readiness.mjs'), 'Gate workflow must run the V31 Gate 5 checker.');
  assertCheck(failures, workflow.includes('auxillariesWalletPane.test.tsx'), 'Gate workflow must run the Wallet pane test.');

  if (failures.length) {
    process.stderr.write('V31 Gate 5 Wallet/BTD pane readiness check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exit(1);
  }

  process.stdout.write(`V31 Gate 5 Wallet/BTD pane readiness check passed pointer=${pointer}\n`);
}

main();
