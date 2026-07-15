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
      'Usage: node scripts/check-v30-gate8-protocol-telemetry-proof-hooks.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V30 Gate 8 Protocol/BTD telemetry and proof hooks, source-safety, package/API route boundaries, tests, docs, and workflow readiness.',
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
    pointer === 'V29',
    `BITCODE_SPEC.txt must remain V29 during V30 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v30' || /^v30\/gate-8-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V30 Gate 8 work must occur on version/v30 or v30/gate-8-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  for (const relativePath of [
    'packages/btd/src/telemetry.ts',
    'packages/btd/src/api-boundaries.ts',
    'packages/btd/src/index.ts',
    'packages/btd/__tests__/telemetry.test.ts',
    'packages/api/src/routes/btd-crypto.ts',
    'packages/api/src/routes/__tests__/btd-crypto.test.ts',
    'apps/uapi/app/api/btd/protocol-telemetry/route.ts',
    'packages/btd/README.md',
    'apps/uapi/app/terminal/README.md',
    'specifications/BITCODE_SPEC_V30.md',
    'specifications/BITCODE_SPEC_V30_DELTA.md',
    'specifications/BITCODE_SPEC_V30_NOTES.md',
    'specifications/BITCODE_SPEC_V30_PARITY_MATRIX.md',
  ]) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V30 Gate 8 file: ${relativePath}`);
  }

  const telemetry = read(root, 'packages/btd/src/telemetry.ts');
  const btdBoundary = read(root, 'packages/btd/src/api-boundaries.ts');
  const btdIndex = read(root, 'packages/btd/src/index.ts');
  const btdTest = read(root, 'packages/btd/__tests__/telemetry.test.ts');
  const apiRoute = read(root, 'packages/api/src/routes/btd-crypto.ts');
  const apiTest = read(root, 'packages/api/src/routes/__tests__/btd-crypto.test.ts');
  const uapiRoute = read(root, 'apps/uapi/app/api/btd/protocol-telemetry/route.ts');
  const btdReadme = read(root, 'packages/btd/README.md');
  const terminalReadme = read(root, 'apps/uapi/app/terminal/README.md');
  const spec = read(root, 'specifications/BITCODE_SPEC_V30.md');
  const delta = read(root, 'specifications/BITCODE_SPEC_V30_DELTA.md');
  const notes = read(root, 'specifications/BITCODE_SPEC_V30_NOTES.md');
  const parity = read(root, 'specifications/BITCODE_SPEC_V30_PARITY_MATRIX.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');

  for (const symbol of [
    'BtdProtocolTelemetryEnvelope',
    'BtdProtocolTelemetryRecord',
    'BtdProtocolProofHook',
    'buildBtdProtocolTelemetryEnvelope',
    'buildBtdProtocolTelemetryRecord',
    'buildBtdProtocolProofHook',
    'btd_receipt',
    'btc_fee_state',
    'ledger_projection',
    'source_to_shares_proof',
    'bridge_readiness_posture',
    'sourceSafety',
    'containsProtectedSource: false',
    "compatibleWith: ['V32', 'V35']",
  ]) {
    assertCheck(failures, telemetry.includes(symbol), `BTD telemetry primitive is missing ${symbol}.`);
  }

  for (const testEvidence of [
    'receipts, fees, projections, shares, and bridges',
    'event and subject kind do not match',
    'secret-looking or protected-source telemetry metadata',
    'reference envelope telemetry roots',
    'replayable theorem and witness facts',
  ]) {
    assertCheck(failures, btdTest.includes(testEvidence), `BTD telemetry tests must cover ${testEvidence}.`);
  }

  for (const boundaryEvidence of [
    'BtdProtocolTelemetryBoundaryInput',
    'BtdProtocolTelemetrySettlement',
    'buildBtdProtocolTelemetrySettlement',
    'terminal-btd-protocol-telemetry',
    'proof_admission',
  ]) {
    assertCheck(failures, btdBoundary.includes(boundaryEvidence), `BTD API boundary must include ${boundaryEvidence}.`);
  }
  assertCheck(failures, btdIndex.includes("export * from './telemetry'"), 'BTD package index must export telemetry primitives.');

  for (const apiEvidence of [
    'buildPostBtdProtocolTelemetryRoute',
    '/btd/protocol-telemetry',
  ]) {
    assertCheck(failures, apiRoute.includes(apiEvidence), `BTD API route must include ${apiEvidence}.`);
    assertCheck(failures, apiTest.includes(apiEvidence), `BTD API tests must cover ${apiEvidence}.`);
  }
  assertCheck(
    failures,
    apiRoute.includes('postBtdProtocolTelemetry'),
    'BTD API route must export postBtdProtocolTelemetry.',
  );
  assertCheck(
    failures,
    uapiRoute.includes('postBtdProtocolTelemetry'),
    'Next route must expose postBtdProtocolTelemetry.',
  );

  assertCheck(
    failures,
    btdReadme.includes('Protocol telemetry proof hooks') &&
      btdReadme.includes('BtdProtocolTelemetryEnvelope'),
    'BTD README must document Protocol telemetry proof hooks.',
  );
  assertCheck(
    failures,
    terminalReadme.includes('Protocol telemetry proof hooks') &&
      terminalReadme.includes('/btd/protocol-telemetry'),
    'Terminal README must document Protocol telemetry proof-hook consumption.',
  );
  assertCheck(
    failures,
    spec.includes('Gate 8 Protocol telemetry proof hooks') &&
      spec.includes('BtdProtocolTelemetryEnvelope'),
    'V30 SPEC must define Gate 8 Protocol telemetry proof hooks.',
  );
  assertCheck(
    failures,
    delta.includes('Gate 8 implementation centers') &&
      delta.includes('/btd/protocol-telemetry'),
    'V30 DELTA must include Gate 8 implementation evidence.',
  );
  assertCheck(
    failures,
    notes.includes('Gate 8 Protocol telemetry notes'),
    'V30 NOTES must include Gate 8 implementation notes.',
  );
  assertCheck(
    failures,
    parity.includes('## Gate 8 Parity') && parity.includes('Gate 8 accepted boundaries'),
    'V30 PARITY must include Gate 8 parity and accepted boundaries.',
  );
  assertCheck(failures, packageJson.includes('"check:v30-gate8"'), 'package.json must expose check:v30-gate8.');
  assertCheck(
    failures,
    gateWorkflow.includes('check-v30-gate8-protocol-telemetry-proof-hooks.mjs'),
    'Gate workflow must run the V30 Gate 8 checker.',
  );

  if (failures.length) {
    process.stderr.write('V30 Gate 8 Protocol telemetry proof hooks check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exit(1);
  }

  process.stdout.write('V30 Gate 8 Protocol telemetry proof hooks check passed.\n');
}

main();
