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
      'Usage: node scripts/check-v30-gate7-bridge-readiness-research-boundaries.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V30 Gate 7 bridge-readiness research boundaries, package posture ownership, non-chain-of-record policy, tests, docs, and workflow readiness.',
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
    pointer === 'V29',
    `BITCODE_SPEC.txt must remain V29 during V30 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v30' || /^v30\/gate-7-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V30 Gate 7 work must occur on version/v30 or v30/gate-7-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  for (const relativePath of [
    'packages/btd/src/bridge-readiness.ts',
    'packages/btd/src/api-boundaries.ts',
    'packages/btd/src/index.ts',
    'packages/btd/__tests__/bridge-readiness.test.ts',
    'packages/api/src/routes/btd-crypto.ts',
    'packages/api/src/routes/__tests__/btd-crypto.test.ts',
    'apps/uapi/app/api/btd/bridge-readiness-research/route.ts',
    'packages/btd/README.md',
    'apps/uapi/app/terminal/README.md',
    'BITCODE_SPEC_V30.md',
    'BITCODE_SPEC_V30_DELTA.md',
    'BITCODE_SPEC_V30_NOTES.md',
    'BITCODE_SPEC_V30_PARITY_MATRIX.md',
  ]) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V30 Gate 7 file: ${relativePath}`);
  }

  const bridgeReadiness = read(root, 'packages/btd/src/bridge-readiness.ts');
  const btdBoundary = read(root, 'packages/btd/src/api-boundaries.ts');
  const btdIndex = read(root, 'packages/btd/src/index.ts');
  const btdTest = read(root, 'packages/btd/__tests__/bridge-readiness.test.ts');
  const apiRoute = read(root, 'packages/api/src/routes/btd-crypto.ts');
  const apiTest = read(root, 'packages/api/src/routes/__tests__/btd-crypto.test.ts');
  const uapiRoute = read(root, 'apps/uapi/app/api/btd/bridge-readiness-research/route.ts');
  const btdReadme = read(root, 'packages/btd/README.md');
  const terminalReadme = read(root, 'apps/uapi/app/terminal/README.md');
  const spec = read(root, 'BITCODE_SPEC_V30.md');
  const delta = read(root, 'BITCODE_SPEC_V30_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V30_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V30_PARITY_MATRIX.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');

  for (const symbol of [
    'BridgeReadinessResearchPosture',
    'BridgeReadinessResearchRecord',
    'BRIDGE_READINESS_RESEARCH_PATHS',
    'buildBridgeReadinessResearchPosture',
    'assertNoBridgeChainOfRecordAdmission',
    'bridgeReadinessPostureToPolicySummary',
    'bitcoin_taproot_anchor',
    'bitvm_execution_bridge',
    'bsc_opbnb_distribution',
    'binance_web3_wallet_distribution',
    'future_distribution_path',
    'no_bridge_chain_of_record',
    'bitcoin_btd_registry',
  ]) {
    assertCheck(failures, bridgeReadiness.includes(symbol), `Bridge-readiness primitive is missing ${symbol}.`);
  }

  for (const testEvidence of [
    'Taproot, BitVM, BSC/opBNB, Binance Web3 Wallet, and future paths',
    'keeps policy summaries source-safe and non-authoritative',
    'fails closed if a path attempts chain-of-record admission',
    'secret-looking research text',
    'requires every record to keep non-admission proof posture',
  ]) {
    assertCheck(failures, btdTest.includes(testEvidence), `Bridge-readiness tests must cover ${testEvidence}.`);
  }

  for (const boundaryEvidence of [
    'BtdBridgeReadinessResearchInput',
    'BtdBridgeReadinessResearchSettlement',
    'buildBtdBridgeReadinessResearchSettlement',
    'terminal-btd-bridge-readiness-research',
    'proof_admission',
  ]) {
    assertCheck(failures, btdBoundary.includes(boundaryEvidence), `BTD API boundary must include ${boundaryEvidence}.`);
  }
  assertCheck(failures, btdIndex.includes("export * from './bridge-readiness'"), 'BTD package index must export bridge-readiness primitives.');

  for (const apiEvidence of [
    'buildPostBtdBridgeReadinessResearchRoute',
    '/btd/bridge-readiness-research',
  ]) {
    assertCheck(failures, apiRoute.includes(apiEvidence), `BTD API route must include ${apiEvidence}.`);
    assertCheck(failures, apiTest.includes(apiEvidence), `BTD API tests must cover ${apiEvidence}.`);
  }
  assertCheck(
    failures,
    apiRoute.includes('postBtdBridgeReadinessResearch'),
    'BTD API route must export postBtdBridgeReadinessResearch.',
  );
  assertCheck(
    failures,
    uapiRoute.includes('postBtdBridgeReadinessResearch'),
    'Next route must expose postBtdBridgeReadinessResearch.',
  );

  assertCheck(
    failures,
    btdReadme.includes('bridge-readiness research boundaries') &&
      btdReadme.includes('research-only'),
    'BTD README must document bridge-readiness research boundaries.',
  );
  assertCheck(
    failures,
    terminalReadme.includes('Bridge-readiness research evidence') &&
      terminalReadme.includes('no_bridge_chain_of_record'),
    'Terminal README must document bridge-readiness research consumption.',
  );
  assertCheck(
    failures,
    spec.includes('Gate 7 bridge-readiness research boundaries') &&
      spec.includes('no_bridge_chain_of_record'),
    'V30 SPEC must define Gate 7 bridge-readiness boundaries.',
  );
  assertCheck(
    failures,
    delta.includes('Gate 7 implementation centers') &&
      delta.includes('/btd/bridge-readiness-research'),
    'V30 DELTA must include Gate 7 implementation evidence.',
  );
  assertCheck(
    failures,
    notes.includes('Gate 7 bridge-readiness research notes'),
    'V30 NOTES must include Gate 7 implementation notes.',
  );
  assertCheck(
    failures,
    parity.includes('## Gate 7 Parity') && parity.includes('Gate 7 accepted boundaries'),
    'V30 PARITY must include Gate 7 parity and accepted boundaries.',
  );
  assertCheck(failures, packageJson.includes('"check:v30-gate7"'), 'package.json must expose check:v30-gate7.');
  assertCheck(
    failures,
    gateWorkflow.includes('check-v30-gate7-bridge-readiness-research-boundaries.mjs'),
    'Gate workflow must run the V30 Gate 7 checker.',
  );

  if (failures.length) {
    process.stderr.write('V30 Gate 7 bridge-readiness research boundaries check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exit(1);
  }

  process.stdout.write('V30 Gate 7 bridge-readiness research boundaries check passed.\n');
}

main();
