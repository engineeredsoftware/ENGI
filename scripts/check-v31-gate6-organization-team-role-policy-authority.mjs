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
      'Usage: node scripts/check-v31-gate6-organization-team-role-policy-authority.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V31 Gate 6 organization/team/role/policy authority closure, shared Auxillaries/product projection, tests, docs, and workflow coverage.',
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
  const pointer = read(root, '.specifications/BITCODE_SPEC.txt').trim();

  assertCheck(
    failures,
    pointer === 'V30',
    `BITCODE_SPEC.txt must remain V30 during V31 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v31' || /^v31\/gate-(?:6|7|8|9|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V31 Gate 6+ work must occur on version/v31 or v31/gate-6+ branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  for (const relativePath of [
    'packages/btd/src/authority.ts',
    'packages/btd/__tests__/btd.test.ts',
    'packages/api/src/routes/auxillaries-contract.ts',
    'packages/api/src/routes/__tests__/auxillaries-contract.test.ts',
    'apps/uapi/hooks/useUserData.ts',
    'apps/uapi/hooks/useUserData.js',
    'apps/uapi/app/auxillaries/components/AuxillariesSurface.tsx',
    'apps/uapi/app/auxillaries/components/AuxillariesProfilePane.tsx',
    'apps/uapi/app/ (removed cockpit tree) terminal-organization-authority.ts',
    'apps/uapi/app/ (removed cockpit tree) TerminalTransactionOrganizationAuthorityCard.tsx',
    'apps/uapi/tests/profileStep.test.tsx',
    'apps/uapi/tests/terminalOrganizationAuthority.test.ts',
    'apps/uapi/tests/terminalTransactionDetailCards.test.tsx',
    '.specifications/BITCODE_SPEC_V31.md',
    '.specifications/BITCODE_SPEC_V31_DELTA.md',
    '.specifications/BITCODE_SPEC_V31_NOTES.md',
    '.specifications/BITCODE_SPEC_V31_PARITY_MATRIX.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
  ]) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V31 Gate 6 file: ${relativePath}`);
  }

  const authority = read(root, 'packages/btd/src/authority.ts');
  const btdTest = read(root, 'packages/btd/__tests__/btd.test.ts');
  const contract = read(root, 'packages/api/src/routes/auxillaries-contract.ts');
  const contractTest = read(root, 'packages/api/src/routes/__tests__/auxillaries-contract.test.ts');
  const useUserData = read(root, 'apps/uapi/hooks/useUserData.ts');
  const useUserDataJs = read(root, 'apps/uapi/hooks/useUserData.js');
  const auxSurface = read(root, 'apps/uapi/app/auxillaries/components/AuxillariesSurface.tsx');
  const profilePane = read(root, 'apps/uapi/app/auxillaries/components/AuxillariesProfilePane.tsx');
  const terminalProjection = read(root, 'apps/uapi/app/ (removed cockpit tree) terminal-organization-authority.ts');
  const terminalCard = read(root, 'apps/uapi/app/ (removed cockpit tree) TerminalTransactionOrganizationAuthorityCard.tsx');
  const profileTest = read(root, 'apps/uapi/tests/profileStep.test.tsx');
  const terminalTest = read(root, 'apps/uapi/tests/terminalOrganizationAuthority.test.ts');
  const detailCardTest = read(root, 'apps/uapi/tests/terminalTransactionDetailCards.test.tsx');
  const spec = read(root, '.specifications/BITCODE_SPEC_V31.md');
  const delta = read(root, '.specifications/BITCODE_SPEC_V31_DELTA.md');
  const notes = read(root, '.specifications/BITCODE_SPEC_V31_NOTES.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V31_PARITY_MATRIX.md');
  const roadmap = read(root, '.specifications/SPECIFICATIONS_ROADMAP.md');
  const apiReadme = read(root, 'packages/api/README.md');
  const auxReadme = read(root, 'apps/uapi/app/auxillaries/README.md');
  const btdReadme = read(root, 'packages/btd/README.md');
  const terminalReadme = read(root, 'apps/uapi/app/ (removed cockpit tree) README.md');
  const packageJson = read(root, 'package.json');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');

  for (const symbol of [
    'BtdOrganizationPolicyAuthority',
    'BtdOrganizationPolicyMultiSigInput',
    'buildBtdOrganizationPolicyAuthority',
    'organizationId',
    'teamId',
    'memberId',
    'explicitGrantSet',
    'walletBindingState',
    'multiSigPosture',
    'policyDecision',
    'denialReasons',
    'recoveryRoute',
    'protectedSourceAction',
    'settlementAdjacentAction',
    'authorityRoot',
  ]) {
    assertCheck(failures, authority.includes(symbol), `BTD authority package must own ${symbol}.`);
  }

  for (const testPhrase of [
    'allows settlement-adjacent organization policy authority',
    'keeps protected-source organization policy authority failed closed',
    'explicit_permission_grant_required',
    'wallet_binding_missing',
    'policy_missing',
    'interface_not_admitted',
    'multisig_approval_required',
    'sourceVisibility: \'blocked\'',
  ]) {
    assertCheck(failures, btdTest.includes(testPhrase), `BTD Gate 6 tests must cover ${testPhrase}.`);
  }

  for (const contractPhrase of [
    'BtdOrganizationPolicyAuthority',
    'buildBtdOrganizationPolicyAuthority',
    'OrganizationPolicyAuthority = BtdOrganizationPolicyAuthority',
    'organization_permission_grants',
    'organization_policy_confirmed',
    'multi_sig_required_signatures',
    'multi_sig_present_signatures',
    'organizationAuthority',
  ]) {
    assertCheck(failures, contract.includes(contractPhrase), `Auxillaries contract must carry ${contractPhrase}.`);
  }

  for (const uiPhrase of [
    'organizationAuthority',
    'auxillaries-organization-authority',
    'Organization authority',
    'Team/member',
    'Multi-sig',
    'Explicit grants',
    'denialReasons',
    'authorityRoot',
  ]) {
    assertCheck(
      failures,
      useUserData.includes(uiPhrase) ||
        useUserDataJs.includes(uiPhrase) ||
        auxSurface.includes(uiPhrase) ||
        profilePane.includes(uiPhrase),
      `Auxillaries UI/read model must project ${uiPhrase}.`,
    );
  }

  for (const terminalPhrase of [
    'btd_organization_policy_authority',
    'policyAuthorityDecision',
    'policyDecision',
    'denialReasons',
    'multiSigPosture',
    'Policy objects',
    'Role, policy, wallet, multi-sig, settlement, and interface permission',
  ]) {
    assertCheck(
      failures,
      terminalProjection.includes(terminalPhrase) || terminalCard.includes(terminalPhrase),
      `product organization authority projection must handle ${terminalPhrase}.`,
    );
  }

  for (const testPhrase of [
    'organization_policy_confirmed',
    'multi_sig_required_signatures',
    'explicitGrantSet',
    'policyHash',
    'auxillaries-organization-authority',
    'team-platform',
    'settlement:pay_btc_fee',
    'projects package-owned policy authority',
    'multisig_approval_required',
  ]) {
    assertCheck(
      failures,
      contractTest.includes(testPhrase) ||
        profileTest.includes(testPhrase) ||
        terminalTest.includes(testPhrase) ||
        detailCardTest.includes(testPhrase),
      `Gate 6 tests must cover ${testPhrase}.`,
    );
  }

  for (const docPhrase of [
    'BtdOrganizationPolicyAuthority',
    'multi-sig readiness',
    'explicit grants',
    'policy id/hash',
    'denial reasons',
    'recovery route',
    'fail closed',
  ]) {
    assertCheck(
      failures,
      spec.includes(docPhrase) ||
        delta.includes(docPhrase) ||
        notes.includes(docPhrase) ||
        parity.includes(docPhrase) ||
        apiReadme.includes(docPhrase) ||
        auxReadme.includes(docPhrase) ||
        btdReadme.includes(docPhrase) ||
        terminalReadme.includes(docPhrase),
      `V31 Gate 6 docs/spec must describe ${docPhrase}.`,
    );
  }

  assertCheck(
    failures,
    /Current working gate: V31 Gate (?:6|7|8|9|10)\b/u.test(roadmap),
    'Roadmap must track V31 Gate 6 or a later V31 gate as current working gate.',
  );
  assertCheck(failures, delta.includes('Gate 6 implementation centers'), 'V31 DELTA must name Gate 6 implementation centers.');
  assertCheck(failures, notes.includes('Gate 6 closure note'), 'V31 NOTES must include the Gate 6 closure note.');
  assertCheck(failures, !/\|\s*Organization authority is package-owned\s*\|[^|]*\|\s*pending\s*\|/u.test(parity), 'Gate 6 package authority parity must not remain pending.');
  assertCheck(failures, !/\|\s*Protected actions fail closed unless all authority inputs admit them\s*\|[^|]*\|\s*pending\s*\|/u.test(parity), 'Gate 6 fail-closed parity must not remain pending.');
  assertCheck(failures, packageJson.includes('"check:v31-gate6"'), 'package.json must expose check:v31-gate6.');
  assertCheck(failures, workflow.includes('check-v31-gate6-organization-team-role-policy-authority.mjs'), 'Gate workflow must run the V31 Gate 6 checker.');
  assertCheck(failures, workflow.includes('terminalOrganizationAuthority.test.ts'), 'Gate workflow must run product organization authority tests.');
  assertCheck(failures, workflow.includes('profileStep.test.tsx'), 'Gate workflow must run Profile pane tests.');

  if (failures.length) {
    process.stderr.write('V31 Gate 6 Organization Team Role Policy Authority check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exit(1);
  }

  process.stdout.write(`V31 Gate 6 Organization Team Role Policy Authority check passed pointer=${pointer}\n`);
}

main();
