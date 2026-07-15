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
      'Usage: node scripts/check-v29-gate7-organization-permission-authority.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V29 Gate 7 organization permission and interface authority closure.',
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
    `BITCODE_SPEC.txt must remain V28 during V29 Gate 7 work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v29' || /^v29\/gate-7-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V29 Gate 7 work must occur on version/v29 or v29/gate-7-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    'specifications/BITCODE_SPEC_V29.md',
    'specifications/BITCODE_SPEC_V29_DELTA.md',
    'specifications/BITCODE_SPEC_V29_NOTES.md',
    'specifications/BITCODE_SPEC_V29_PARITY_MATRIX.md',
    'scripts/check-v29-gate7-organization-permission-authority.mjs',
    'packages/btd/src/authority.ts',
    'packages/btd/src/index.ts',
    'packages/btd/__tests__/btd.test.ts',
    'packages/api/src/routes/btd-crypto.ts',
    'packages/api/src/routes/__tests__/btd-crypto.test.ts',
    'apps/uapi/app/api/btd/organization-interface-authority/route.ts',
    'apps/mcp/src/auth/middleware.ts',
    'apps/mcp/src/types/index.ts',
    'apps/mcp/src/__tests__/unit/auth.test.ts',
    'apps/chatgpt/src/tools.ts',
    'apps/chatgpt/src/__tests__/tools.test.ts',
    'apps/chatgpt/package.json',
    'packages/pipeline-hosts/src/asset-pack-host-plan.ts',
    'packages/pipeline-hosts/src/__tests__/asset-pack-host-plan.test.ts',
    'apps/uapi/app/ (removed cockpit tree) terminal-organization-authority.ts',
    'apps/uapi/app/ (removed cockpit tree) TerminalTransactionOrganizationAuthorityCard.tsx',
    'apps/uapi/app/ (removed cockpit tree) terminal-transaction-detail-snapshot.ts',
    'apps/uapi/app/ (removed cockpit tree) terminal-transaction-read-model.ts',
    'apps/uapi/app/ (removed cockpit tree) terminal-transaction-query.ts',
    'apps/uapi/app/ (removed cockpit tree) README.md',
    'apps/uapi/tests/terminalOrganizationAuthority.test.ts',
    'apps/uapi/tests/terminalTransactionDetailCards.test.tsx',
    'apps/uapi/tests/terminalTransactionDetailSnapshot.test.ts',
    '.github/workflows/bitcode-gate-quality.yml',
    'package.json',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing Gate 7 file: ${relativePath}`);
  }

  const spec = read(root, 'specifications/BITCODE_SPEC_V29.md');
  const delta = read(root, 'specifications/BITCODE_SPEC_V29_DELTA.md');
  const notes = read(root, 'specifications/BITCODE_SPEC_V29_NOTES.md');
  const parity = read(root, 'specifications/BITCODE_SPEC_V29_PARITY_MATRIX.md');
  const btdAuthority = read(root, 'packages/btd/src/authority.ts');
  const btdIndex = read(root, 'packages/btd/src/index.ts');
  const btdTest = read(root, 'packages/btd/__tests__/btd.test.ts');
  const apiRoute = read(root, 'packages/api/src/routes/btd-crypto.ts');
  const apiTest = read(root, 'packages/api/src/routes/__tests__/btd-crypto.test.ts');
  const uapiRoute = read(root, 'apps/uapi/app/api/btd/organization-interface-authority/route.ts');
  const mcpAuth = read(root, 'apps/mcp/src/auth/middleware.ts');
  const mcpTypes = read(root, 'apps/mcp/src/types/index.ts');
  const mcpTest = read(root, 'apps/mcp/src/__tests__/unit/auth.test.ts');
  const chatgptTools = read(root, 'apps/chatgpt/src/tools.ts');
  const chatgptTest = read(root, 'apps/chatgpt/src/__tests__/tools.test.ts');
  const chatgptPackage = read(root, 'apps/chatgpt/package.json');
  const harness = read(root, 'packages/pipeline-hosts/src/asset-pack-host-plan.ts');
  const harnessTest = read(root, 'packages/pipeline-hosts/src/__tests__/asset-pack-host-plan.test.ts');
  const terminalProjection = read(root, 'apps/uapi/app/ (removed cockpit tree) terminal-organization-authority.ts');
  const terminalCard = read(root, 'apps/uapi/app/ (removed cockpit tree) TerminalTransactionOrganizationAuthorityCard.tsx');
  const terminalSnapshot = read(root, 'apps/uapi/app/ (removed cockpit tree) terminal-transaction-detail-snapshot.ts');
  const terminalReadModel = read(root, 'apps/uapi/app/ (removed cockpit tree) terminal-transaction-read-model.ts');
  const terminalQuery = read(root, 'apps/uapi/app/ (removed cockpit tree) terminal-transaction-query.ts');
  const terminalReadme = read(root, 'apps/uapi/app/ (removed cockpit tree) README.md');
  const terminalTest = read(root, 'apps/uapi/tests/terminalOrganizationAuthority.test.ts');
  const terminalCardTest = read(root, 'apps/uapi/tests/terminalTransactionDetailCards.test.tsx');
  const terminalSnapshotTest = read(root, 'apps/uapi/tests/terminalTransactionDetailSnapshot.test.ts');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');

  assertCheck(failures, spec.includes('V29 organization interface authority canon'), 'V29 SPEC must define organization interface authority canon.');
  assertCheck(failures, delta.includes('Gate 7: Organization Permissions And Interface Authority') && delta.includes('organizationAuthority'), 'V29 DELTA must define Gate 7 closure acceptance.');
  assertCheck(failures, notes.includes('Gate 7 working notes'), 'V29 NOTES must carry Gate 7 working notes.');
  assertCheck(failures, parity.includes('## Gate 7 Parity'), 'V29 PARITY must include Gate 7 parity.');
  assertCheck(failures, parity.includes('Gate 7 completion condition'), 'V29 PARITY must include Gate 7 completion condition.');

  for (const symbol of [
    'BtdOrganizationInterfaceAuthorityDecision',
    'BtdOrganizationPermissionAction',
    'BtdOrganizationRegistryAuthoritySummary',
    'summarizeBtdOrganizationRegistryAuthority',
    'evaluateBtdOrganizationInterfaceAuthority',
    'sourceVisibilityWhenAllowed',
    'requiresRegistryReadAccess',
    'requiresSettledPayment',
    'requiresExplicitConfirmation',
    'terminal',
    'api',
    'mcp',
    'chatgpt_app',
    'deliver_asset_pack',
    'administer_organization',
    'authorityRoot',
  ]) {
    assertCheck(failures, btdAuthority.includes(symbol), `BTD authority primitive is missing ${symbol}.`);
  }

  assertCheck(
    failures,
    btdIndex.includes("export * from './authority'") &&
      btdTest.includes('organization interface authority') &&
      btdTest.includes('activeReadLicenseCount') &&
      btdTest.includes('protected_source_allowed') &&
      btdTest.includes('settlement_required') &&
      btdTest.includes('interface_action_not_authorized'),
    'BTD package exports/tests must prove Gate 7 holdings, license usage, paid delivery, unpaid denial, and unsupported interface denial.',
  );
  assertCheck(
    failures,
      apiRoute.includes('buildBtdOrganizationInterfaceAuthorityDecision') &&
      apiRoute.includes('/btd/organization-interface-authority') &&
      apiTest.includes('organization interface authority') &&
      apiTest.includes('registry_read_access_required') &&
      uapiRoute.includes('postBtdOrganizationInterfaceAuthority'),
    'API and UAPI routes/tests must expose JSON-safe organization authority decisions.',
  );
  assertCheck(
    failures,
    mcpAuth.includes('requiredInterfaceAuthority') &&
      mcpAuth.includes('validateRequiredInterfaceAuthority') &&
      mcpAuth.includes('evaluateBtdOrganizationInterfaceAuthority') &&
      mcpTypes.includes('interfaceAuthority') &&
      mcpTest.includes('interface authority') &&
      mcpTest.includes('INSUFFICIENT_INTERFACE_AUTHORITY'),
    'MCP auth must support required interface authority and focused tests.',
  );
  assertCheck(
    failures,
    chatgptPackage.includes('"@bitcode/btd"') &&
      chatgptTools.includes('CHATGPT_APP_ORGANIZATION_AUTHORITY_VALIDATOR') &&
      chatgptTools.includes('assertChatGptAppOrganizationAuthority') &&
      chatgptTools.includes('organizationAuthority') &&
      chatgptTest.includes('organizationAuthority') &&
      chatgptTest.includes('organization authority is unpaid'),
    'ChatGPT App write carriers/tests must require organization authority evidence.',
  );
  assertCheck(
    failures,
    harness.includes('organizationAuthority') &&
      harness.includes('evaluateBtdOrganizationInterfaceAuthority') &&
      harness.includes("execution.store('asset-pack/settlement', 'organizationAuthority'") &&
      harness.includes('organizationAuthorityDecision') &&
      harnessTest.includes('organizationAuthority'),
    'Sandbox harness must persist and test organization authority evidence.',
  );
  assertCheck(
    failures,
    terminalProjection.includes('buildTerminalOrganizationAuthorityProjection') &&
      terminalProjection.includes('authorityRoot') &&
      terminalCard.includes('Organization authority') &&
      terminalSnapshot.includes('organizationAuthority') &&
      terminalReadModel.includes("'authority'") &&
      terminalQuery.includes("'authority'") &&
      terminalTest.includes('authority proof roots') &&
      terminalCardTest.includes('Organization authority') &&
      terminalSnapshotTest.includes('organizationAuthority') &&
      terminalReadme.includes('Organization Authority section'),
    'product projection/card/read-model/docs/tests must expose authority detail.',
  );
  assertCheck(
    failures,
    packageJson.includes('"check:v29-gate7"') &&
      gateWorkflow.includes('check-v29-gate7-organization-permission-authority.mjs') &&
      gateWorkflow.includes('terminalOrganizationAuthority.test.ts') &&
      gateWorkflow.includes('packages/chatgptapp') &&
      gateWorkflow.includes('apps/mcp'),
    'Package scripts and gate-quality workflow must invoke Gate 7 checker and focused tests.',
  );

  if (failures.length) {
    process.stderr.write('V29 Gate 7 check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exit(1);
  }

  process.stdout.write('V29 Gate 7 organization permission and interface authority check passed.\n');
}

main();
