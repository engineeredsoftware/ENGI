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
      'Usage: node scripts/check-v30-gate6-source-to-shares-proof-cleanup.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V30 Gate 6 source-to-shares proof cleanup, package proof ownership, API route boundary, tests, docs, and workflow readiness.',
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
      branch === 'version/v30' || /^v30\/gate-6-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V30 Gate 6 work must occur on version/v30 or v30/gate-6-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  for (const relativePath of [
    'packages/btd/src/source-to-shares.ts',
    'packages/btd/src/api-boundaries.ts',
    'packages/btd/src/index.ts',
    'packages/btd/__tests__/source-to-shares.test.ts',
    'packages/api/src/routes/btd-crypto.ts',
    'packages/api/src/routes/__tests__/btd-crypto.test.ts',
    'apps/uapi/app/api/btd/source-to-shares-proof/route.ts',
    'packages/btd/README.md',
    'apps/uapi/app/terminal/README.md',
    'BITCODE_SPEC_V30.md',
    'BITCODE_SPEC_V30_DELTA.md',
    'BITCODE_SPEC_V30_NOTES.md',
    'BITCODE_SPEC_V30_PARITY_MATRIX.md',
  ]) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V30 Gate 6 file: ${relativePath}`);
  }

  const sourceToShares = read(root, 'packages/btd/src/source-to-shares.ts');
  const btdBoundary = read(root, 'packages/btd/src/api-boundaries.ts');
  const btdIndex = read(root, 'packages/btd/src/index.ts');
  const btdTest = read(root, 'packages/btd/__tests__/source-to-shares.test.ts');
  const apiRoute = read(root, 'packages/api/src/routes/btd-crypto.ts');
  const apiTest = read(root, 'packages/api/src/routes/__tests__/btd-crypto.test.ts');
  const uapiRoute = read(root, 'apps/uapi/app/api/btd/source-to-shares-proof/route.ts');
  const btdReadme = read(root, 'packages/btd/README.md');
  const terminalReadme = read(root, 'apps/uapi/app/terminal/README.md');
  const spec = read(root, 'BITCODE_SPEC_V30.md');
  const delta = read(root, 'BITCODE_SPEC_V30_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V30_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V30_PARITY_MATRIX.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');

  for (const symbol of [
    'SourceToSharesProof',
    'buildSourceToSharesProof',
    'assertSourceToSharesSettlementAdmissible',
    'sourceToSharesProofToSettlementConservationCheck',
    'noOverpayment',
    'noUnderpayment',
    'zeroCellRefitTail',
    'ancestryEvidence',
    'largest_remainder',
    'settlementAdmissible',
    '.bitcode/v30-settlement-source-to-shares-proof.json',
  ]) {
    assertCheck(failures, sourceToShares.includes(symbol), `BTD source-to-shares primitive is missing ${symbol}.`);
  }

  for (const testEvidence of [
    'binds measurements, fit deposits, BTD range slices, fee quote, and exact BTC allocation',
    'no-underpayment and no-overpayment invariants',
    'zero-cell refit tail posture',
    'ancestry evidence',
    'Duplicate source-to-shares fit deposit',
    'only accepts admitted fit deposits',
  ]) {
    assertCheck(failures, btdTest.includes(testEvidence), `BTD source-to-shares tests must cover ${testEvidence}.`);
  }

  for (const boundaryEvidence of [
    'BtdSourceToSharesProofInput',
    'BtdSourceToSharesProofSettlement',
    'buildBtdSourceToSharesProofSettlement',
    'terminal-btd-source-to-shares-proof',
    'settlement_finalization',
  ]) {
    assertCheck(failures, btdBoundary.includes(boundaryEvidence), `BTD API boundary must include ${boundaryEvidence}.`);
  }
  assertCheck(failures, btdIndex.includes("export * from './source-to-shares'"), 'BTD package index must export source-to-shares primitives.');

  for (const apiEvidence of [
    'buildPostBtdSourceToSharesProofRoute',
    '/btd/source-to-shares-proof',
  ]) {
    assertCheck(failures, apiRoute.includes(apiEvidence), `BTD API route must include ${apiEvidence}.`);
    assertCheck(failures, apiTest.includes(apiEvidence), `BTD API tests must cover ${apiEvidence}.`);
  }
  assertCheck(
    failures,
    apiRoute.includes('postBtdSourceToSharesProof'),
    'BTD API route must export postBtdSourceToSharesProof.',
  );
  assertCheck(
    failures,
    uapiRoute.includes('postBtdSourceToSharesProof'),
    'Next route must expose postBtdSourceToSharesProof.',
  );

  assertCheck(
    failures,
    btdReadme.includes('source-to-shares proof cleanup') &&
      btdReadme.includes('no-overpayment/no-underpayment'),
    'BTD README must document source-to-shares proof ownership.',
  );
  assertCheck(
    failures,
    terminalReadme.includes('Source-to-shares settlement evidence') &&
      terminalReadme.includes('no-overpayment and no-underpayment'),
    'Terminal README must document source-to-shares proof consumption.',
  );
  assertCheck(
    failures,
    spec.includes('Gate 6 source-to-shares precision') &&
      spec.includes('no-overpayment and no-underpayment'),
    'V30 SPEC must define Gate 6 source-to-shares proof precision.',
  );
  assertCheck(
    failures,
    delta.includes('Gate 6 implementation centers') &&
      delta.includes('SettlementConservationCheck'),
    'V30 DELTA must include Gate 6 implementation evidence.',
  );
  assertCheck(
    failures,
    notes.includes('Gate 6 source-to-shares cleanup notes'),
    'V30 NOTES must include Gate 6 implementation notes.',
  );
  assertCheck(
    failures,
    parity.includes('## Gate 6 Parity') && parity.includes('Gate 6 accepted boundaries'),
    'V30 PARITY must include Gate 6 parity and accepted boundaries.',
  );
  assertCheck(failures, packageJson.includes('"check:v30-gate6"'), 'package.json must expose check:v30-gate6.');
  assertCheck(
    failures,
    gateWorkflow.includes('check-v30-gate6-source-to-shares-proof-cleanup.mjs'),
    'Gate workflow must run the V30 Gate 6 checker.',
  );

  if (failures.length) {
    process.stderr.write('V30 Gate 6 source-to-shares proof cleanup check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exit(1);
  }

  process.stdout.write('V30 Gate 6 source-to-shares proof cleanup check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
