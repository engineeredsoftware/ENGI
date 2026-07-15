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
      'Usage: node scripts/check-v31-gate7-interfaces-pane-admission-cross-surface-contracts.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V31 Gate 7 interface-admission catalog closure, source-safe cross-surface contract fields, deferred product boundaries, tests, docs, and workflow coverage.',
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
    pointer === 'V30',
    `BITCODE_SPEC.txt must remain V30 during V31 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v31' || /^v31\/gate-(?:7|8|9|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V31 Gate 7+ work must occur on version/v31 or v31/gate-7+ branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  for (const relativePath of [
    'packages/api/src/routes/auxillaries-contract.ts',
    'packages/api/src/routes/__tests__/auxillaries-contract.test.ts',
    'apps/uapi/hooks/useUserData.ts',
    'apps/uapi/hooks/useUserData.js',
    'apps/uapi/app/auxillaries/components/AuxillariesInterfacesPane.tsx',
    'apps/uapi/tests/orbitalsInterfacesPane.test.tsx',
    'specifications/BITCODE_SPEC_V31.md',
    'specifications/BITCODE_SPEC_V31_DELTA.md',
    'specifications/BITCODE_SPEC_V31_NOTES.md',
    'specifications/BITCODE_SPEC_V31_PARITY_MATRIX.md',
    'specifications/SPECIFICATIONS_ROADMAP.md',
    'packages/api/README.md',
    'apps/uapi/app/auxillaries/README.md',
  ]) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V31 Gate 7 file: ${relativePath}`);
  }

  const contract = read(root, 'packages/api/src/routes/auxillaries-contract.ts');
  const contractTest = read(root, 'packages/api/src/routes/__tests__/auxillaries-contract.test.ts');
  const interfacesPane = read(root, 'apps/uapi/app/auxillaries/components/AuxillariesInterfacesPane.tsx');
  const interfacesTest = read(root, 'apps/uapi/tests/orbitalsInterfacesPane.test.tsx');
  const useUserData = read(root, 'apps/uapi/hooks/useUserData.ts');
  const useUserDataJs = read(root, 'apps/uapi/hooks/useUserData.js');
  const spec = read(root, 'specifications/BITCODE_SPEC_V31.md');
  const delta = read(root, 'specifications/BITCODE_SPEC_V31_DELTA.md');
  const notes = read(root, 'specifications/BITCODE_SPEC_V31_NOTES.md');
  const parity = read(root, 'specifications/BITCODE_SPEC_V31_PARITY_MATRIX.md');
  const roadmap = read(root, 'specifications/SPECIFICATIONS_ROADMAP.md');
  const apiReadme = read(root, 'packages/api/README.md');
  const auxReadme = read(root, 'apps/uapi/app/auxillaries/README.md');
  const packageJson = read(root, 'package.json');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');

  for (const contractPhrase of [
    'AuxillariesInterfaceAdmission',
    'policyRequirements',
    'policyConstraints',
    'supportedActions',
    'allowedActions',
    'sourceSafetyClass',
    'deferredProductDepth',
    'terminal',
    'api',
    'mcp',
    'chatgpt-app',
    'exchange-hook',
    'conversations-hook',
    'future-interface-hooks',
    'exchange.market_depth_deferred_to_future_version',
    'conversations.product_depth_deferred_to_future_version',
    'future_hooks.interface_contract_unregistered',
    'validateAuxillariesContractSnapshot',
  ]) {
    assertCheck(failures, contract.includes(contractPhrase), `Auxillaries contract must carry ${contractPhrase}.`);
  }

  for (const testPhrase of [
    'payload.interfaceAdmissions.map',
    'policyRequirements',
    'supportedActions',
    'sourceSafetyClass',
    'exchange-hook',
    'conversations-hook',
    'future-interface-hooks',
    'deferredProductDepth',
    'interfaceAdmissionRoot',
    'policyConstraints',
  ]) {
    assertCheck(failures, contractTest.includes(testPhrase), `Gate 7 API tests must cover ${testPhrase}.`);
  }

  for (const uiPhrase of [
    'interfaceAdmissions',
    'InterfaceAdmissionRecord',
    'auxillaries-interface-admission-catalog',
    'Admitted surfaces and source boundaries',
    'Supported',
    'Admitted now',
    'Policy',
    'Blockers',
    'deferredAdmissionCount',
  ]) {
    assertCheck(
      failures,
      interfacesPane.includes(uiPhrase) || useUserData.includes(uiPhrase) || useUserDataJs.includes(uiPhrase),
      `Interfaces pane/read model must project ${uiPhrase}.`,
    );
  }

  for (const testPhrase of [
    'auxillaries-interface-admission-catalog',
    'exchange-hook',
    'wallet_binding_required_for_delivery',
    'exchange.market_depth_deferred_to_future_version',
    '1\\/3 ready',
  ]) {
    assertCheck(failures, interfacesTest.includes(testPhrase), `Interfaces pane tests must cover ${testPhrase}.`);
  }

  for (const docPhrase of [
    'Gate 7',
    'Interface admission',
    'product',
    'API',
    'MCP',
    'ChatGPT App',
    'Exchange',
    'future hooks',
    'policy requirements',
    'supported actions',
    'source-safety',
    'deferred',
    'Conversations',
  ]) {
    assertCheck(
      failures,
      spec.includes(docPhrase) ||
        delta.includes(docPhrase) ||
        notes.includes(docPhrase) ||
        parity.includes(docPhrase) ||
        roadmap.includes(docPhrase) ||
        apiReadme.includes(docPhrase) ||
        auxReadme.includes(docPhrase),
      `V31 Gate 7 docs/spec must describe ${docPhrase}.`,
    );
  }

  assertCheck(
    failures,
    /Current working gate: V31 Gate (?:7|8|9|10)\b/u.test(roadmap),
    'Roadmap must track V31 Gate 7 or a later V31 gate as current working gate.',
  );
  assertCheck(
    failures,
    packageJson.includes('"check:v31-gate7"'),
    'package.json must expose check:v31-gate7.',
  );
  assertCheck(
    failures,
    workflow.includes('check-v31-gate7-interfaces-pane-admission-cross-surface-contracts.mjs'),
    'Gate quality workflow must run the V31 Gate 7 checker.',
  );

  if (failures.length) {
    process.stderr.write('V31 Gate 7 interface-admission closure check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exit(1);
  }

  process.stdout.write('V31 Gate 7 interface-admission closure check passed.\n');
}

main();
