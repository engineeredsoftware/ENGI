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
      'Usage: node scripts/check-v30-gate9-interface-integration-regression-proof.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V30 Gate 9 interface integration regression proof, package-owned BTD contracts, API route admission, interface adapters, tests, docs, and workflow readiness.',
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
      branch === 'version/v30' || /^v30\/gate-9-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V30 Gate 9 work must occur on version/v30 or v30/gate-9-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  for (const relativePath of [
    'packages/btd/src/interface-integration.ts',
    'packages/btd/src/interface-integration-contract.ts',
    'packages/btd/src/api-boundaries.ts',
    'packages/btd/src/index.ts',
    'packages/btd/__tests__/interface-integration.test.ts',
    'packages/api/src/routes/btd-crypto.ts',
    'packages/api/src/routes/__tests__/btd-crypto.test.ts',
    'apps/uapi/app/api/btd/interface-integration-regression/route.ts',
    'apps/uapi/app/terminal/terminal-interface-integration-regression.ts',
    'apps/uapi/app/terminal/terminal-protocol-projection.ts',
    'apps/uapi/tests/terminalInterfaceIntegrationRegression.test.ts',
    'apps/uapi/tests/terminalProtocolProjection.test.ts',
    'apps/chatgpt/src/interface-integration.ts',
    'apps/chatgpt/src/__tests__/tools.test.ts',
    'apps/mcp/src/interface-integration.ts',
    'apps/mcp/src/__tests__/unit/auth.test.ts',
    'packages/btd/README.md',
    'apps/uapi/app/terminal/README.md',
    'apps/chatgpt/README.md',
    'apps/mcp/README.md',
    'specifications/BITCODE_SPEC_V30.md',
    'specifications/BITCODE_SPEC_V30_DELTA.md',
    'specifications/BITCODE_SPEC_V30_NOTES.md',
    'specifications/BITCODE_SPEC_V30_PARITY_MATRIX.md',
  ]) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V30 Gate 9 file: ${relativePath}`);
  }

  const contract = read(root, 'packages/btd/src/interface-integration-contract.ts');
  const integration = read(root, 'packages/btd/src/interface-integration.ts');
  const boundary = read(root, 'packages/btd/src/api-boundaries.ts');
  const index = read(root, 'packages/btd/src/index.ts');
  const btdTest = read(root, 'packages/btd/__tests__/interface-integration.test.ts');
  const apiRoute = read(root, 'packages/api/src/routes/btd-crypto.ts');
  const apiTest = read(root, 'packages/api/src/routes/__tests__/btd-crypto.test.ts');
  const nextRoute = read(root, 'apps/uapi/app/api/btd/interface-integration-regression/route.ts');
  const terminalAdapter = read(root, 'apps/uapi/app/terminal/terminal-interface-integration-regression.ts');
  const terminalProjection = read(root, 'apps/uapi/app/terminal/terminal-protocol-projection.ts');
  const terminalTest = read(root, 'apps/uapi/tests/terminalInterfaceIntegrationRegression.test.ts');
  const terminalProjectionTest = read(root, 'apps/uapi/tests/terminalProtocolProjection.test.ts');
  const chatgptAdapter = read(root, 'apps/chatgpt/src/interface-integration.ts');
  const chatgptTest = read(root, 'apps/chatgpt/src/__tests__/tools.test.ts');
  const mcpAdapter = read(root, 'apps/mcp/src/interface-integration.ts');
  const mcpTest = read(root, 'apps/mcp/src/__tests__/unit/auth.test.ts');
  const btdReadme = read(root, 'packages/btd/README.md');
  const terminalReadme = read(root, 'apps/uapi/app/terminal/README.md');
  const chatgptReadme = read(root, 'apps/chatgpt/README.md');
  const mcpReadme = read(root, 'apps/mcp/README.md');
  const spec = read(root, 'specifications/BITCODE_SPEC_V30.md');
  const delta = read(root, 'specifications/BITCODE_SPEC_V30_DELTA.md');
  const notes = read(root, 'specifications/BITCODE_SPEC_V30_NOTES.md');
  const parity = read(root, 'specifications/BITCODE_SPEC_V30_PARITY_MATRIX.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');

  for (const surface of [
    'terminal',
    'api',
    'mcp',
    'chatgpt_app',
    'auxillaries_hook',
    'exchange_hook',
  ]) {
    assertCheck(failures, contract.includes(surface), `Interface contract must include surface ${surface}.`);
    assertCheck(failures, btdTest.includes(surface), `BTD tests must cover surface ${surface}.`);
  }

  for (const family of [
    'btd_registry',
    'read_access',
    'btd_receipts',
    'btc_fee_operation',
    'ledger_projection',
    'source_to_shares_proof',
    'protocol_telemetry',
    'organization_authority',
    'terminal_journal',
  ]) {
    assertCheck(failures, contract.includes(family), `Interface contract must include object family ${family}.`);
    assertCheck(failures, btdTest.includes(family), `BTD tests must cover object family ${family}.`);
  }

  for (const symbol of [
    'BtdInterfaceIntegrationRegressionProof',
    'BtdInterfaceIntegrationRecordInput',
    'buildBtdInterfaceIntegrationRegressionProof',
    'buildBtdInterfaceIntegrationRecord',
    'sourceSafeLowDetailIntact',
    'transactionCockpitRegression',
    'routeLocalReimplementation',
    'packageOwned',
  ]) {
    assertCheck(failures, integration.includes(symbol), `BTD interface integration primitive is missing ${symbol}.`);
  }

  for (const boundaryEvidence of [
    'BtdInterfaceIntegrationRegressionInput',
    'BtdInterfaceIntegrationRegressionSettlement',
    'buildBtdInterfaceIntegrationRegressionSettlement',
    'terminal-btd-interface-integration-regression',
    'proof_admission',
  ]) {
    assertCheck(failures, boundary.includes(boundaryEvidence), `BTD API boundary must include ${boundaryEvidence}.`);
  }
  assertCheck(failures, index.includes("export * from './interface-integration'"), 'BTD package index must export interface integration primitives.');
  assertCheck(
    failures,
    index.includes("export * from './interface-integration-contract'"),
    'BTD package index must export interface integration contracts.',
  );

  for (const apiEvidence of [
    'buildPostBtdInterfaceIntegrationRegressionRoute',
    '/btd/interface-integration-regression',
    'postBtdInterfaceIntegrationRegression',
  ]) {
    assertCheck(failures, apiRoute.includes(apiEvidence), `BTD API route must include ${apiEvidence}.`);
    assertCheck(failures, apiTest.includes(apiEvidence), `BTD API tests must cover ${apiEvidence}.`);
  }
  assertCheck(
    failures,
    nextRoute.includes('postBtdInterfaceIntegrationRegression'),
    'Next route must expose postBtdInterfaceIntegrationRegression.',
  );

  for (const adapterEvidence of [
    '@bitcode/btd/interface-integration-contract',
    'buildTerminalInterfaceIntegrationRegressionRecords',
    'buildTerminalInterfaceIntegrationRegressionSummary',
  ]) {
    assertCheck(failures, terminalAdapter.includes(adapterEvidence), `Terminal adapter must include ${adapterEvidence}.`);
  }
  assertCheck(
    failures,
    terminalProjection.includes('interfaceIntegrationRegression'),
    'Terminal protocol projection must expose interface integration regression summary.',
  );
  assertCheck(
    failures,
    terminalTest.includes('source-safe low-detail') &&
      terminalProjectionTest.includes('interfaceIntegrationRegression'),
    'Terminal tests must cover low-detail interface integration regression.',
  );

  assertCheck(
    failures,
    chatgptAdapter.includes('@bitcode/btd/interface-integration-contract') &&
      chatgptTest.includes('buildChatGptAppInterfaceIntegrationRecord'),
    'ChatGPT App must expose and test package-owned BTD interface records.',
  );
  assertCheck(
    failures,
    mcpAdapter.includes('@bitcode/btd/interface-integration-contract') &&
      mcpTest.includes('buildMcpInterfaceIntegrationRecord'),
    'MCP server must expose and test package-owned BTD interface records.',
  );

  assertCheck(
    failures,
    btdReadme.includes('Interface integration regression proof') &&
      btdReadme.includes('BtdInterfaceIntegrationRegressionProof'),
    'BTD README must document interface integration regression proof.',
  );
  assertCheck(
    failures,
    terminalReadme.includes('/btd/interface-integration-regression') &&
      terminalReadme.includes('@bitcode/btd/interface-integration-contract'),
    'Terminal README must document interface integration proof consumption.',
  );
  assertCheck(
    failures,
    chatgptReadme.includes('@bitcode/btd/interface-integration-contract'),
    'ChatGPT README must document BTD interface integration contract.',
  );
  assertCheck(
    failures,
    mcpReadme.includes('@bitcode/btd/interface-integration-contract'),
    'MCP README must document BTD interface integration contract.',
  );
  assertCheck(
    failures,
    spec.includes('Gate 9 interface integration regression proof') &&
      spec.includes('BtdInterfaceIntegrationRegressionProof'),
    'V30 SPEC must define Gate 9 interface integration regression proof.',
  );
  assertCheck(
    failures,
    delta.includes('Gate 9 implementation centers') &&
      delta.includes('/btd/interface-integration-regression'),
    'V30 DELTA must include Gate 9 implementation evidence.',
  );
  assertCheck(
    failures,
    notes.includes('Gate 9 interface integration notes'),
    'V30 NOTES must include Gate 9 implementation notes.',
  );
  assertCheck(
    failures,
    parity.includes('## Gate 9 Parity') && parity.includes('Gate 9 accepted boundaries'),
    'V30 PARITY must include Gate 9 parity and accepted boundaries.',
  );
  assertCheck(failures, packageJson.includes('"check:v30-gate9"'), 'package.json must expose check:v30-gate9.');
  assertCheck(
    failures,
    gateWorkflow.includes('check-v30-gate9-interface-integration-regression-proof.mjs'),
    'Gate workflow must run the V30 Gate 9 checker.',
  );
  assertCheck(
    failures,
    gateWorkflow.includes('terminalInterfaceIntegrationRegression.test.ts'),
    'Gate workflow must run Terminal interface integration regression tests.',
  );

  if (failures.length) {
    process.stderr.write('V30 Gate 9 interface integration regression proof check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exit(1);
  }

  process.stdout.write('V30 Gate 9 interface integration regression proof check passed.\n');
}

main();
