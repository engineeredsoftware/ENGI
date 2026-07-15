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
      'Usage: node scripts/check-v31-gate2-auxillaries-package-route-contracts.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V31 Gate 2 Auxillaries package-owned route contracts, source-safe serializers, tests, docs, and commercial runtime boundaries.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function gitTrackedFiles(root, pathspecs) {
  const output = execFileSync('git', ['ls-files', ...pathspecs], {
    cwd: root,
    encoding: 'utf8',
  }).trim();
  return output ? output.split('\n') : [];
}

function findStandaloneDemonstrationImports(root) {
  const importPattern =
    /(?:from\s+|import\s*\(|require\s*\()\s*['"][^'"]*(?:@bitcode\/protocol-demonstration|protocol-demonstration\/src)/u;
  return gitTrackedFiles(root, ['packages', 'apps/uapi/app', 'apps/uapi/components', 'apps/uapi/lib'])
    .filter((filePath) => /\.(?:mjs|cjs|js|jsx|ts|tsx)$/u.test(filePath))
    .filter((filePath) => !filePath.includes('__tests__') && !filePath.includes('/test/'))
    .filter((filePath) => importPattern.test(read(root, filePath)));
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
      branch === 'version/v31' || /^v31\/gate-(?:2|3|4|5|6|7|8|9|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V31 Gate 2+ work must occur on version/v31 or v31/gate-2..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  for (const relativePath of [
    'packages/api/src/routes/auxillaries-contract.ts',
    'packages/api/src/routes/auxillaries.ts',
    'packages/api/src/routes/__tests__/auxillaries-contract.test.ts',
    'packages/api/README.md',
    'packages/orm/README.md',
    'packages/btd/README.md',
    'apps/uapi/app/auxillaries/README.md',
    'apps/uapi/app/auxillaries/auxillary-onboarding-contract.ts',
    'BITCODE_SPEC_V31.md',
    'BITCODE_SPEC_V31_DELTA.md',
    'BITCODE_SPEC_V31_NOTES.md',
    'BITCODE_SPEC_V31_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
  ]) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V31 Gate 2 file: ${relativePath}`);
  }

  const contract = read(root, 'packages/api/src/routes/auxillaries-contract.ts');
  const route = read(root, 'packages/api/src/routes/auxillaries.ts');
  const test = read(root, 'packages/api/src/routes/__tests__/auxillaries-contract.test.ts');
  const apiReadme = read(root, 'packages/api/README.md');
  const ormReadme = read(root, 'packages/orm/README.md');
  const btdReadme = read(root, 'packages/btd/README.md');
  const auxReadme = read(root, 'apps/uapi/app/auxillaries/README.md');
  const bridge = read(root, 'apps/uapi/app/auxillaries/auxillary-onboarding-contract.ts');
  const spec = read(root, 'BITCODE_SPEC_V31.md');
  const delta = read(root, 'BITCODE_SPEC_V31_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V31_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V31_PARITY_MATRIX.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');
  const packageJson = read(root, 'package.json');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');

  for (const symbol of [
    'AuxillariesProfileState',
    'AuxillariesConnectionReadiness',
    'AuxillariesInterfaceAdmission',
    'AuxillariesWalletBtdPaneState',
    'OrganizationPolicyAuthority',
    'AuxillariesReadinessDiagnostic',
    'AuxillariesRecoveryRun',
    'AuxillariesContractSnapshot',
    'buildAuxillariesContractSnapshot',
    'buildAuxillariesProfileState',
    'buildAuxillariesConnectionReadiness',
    'buildAuxillariesInterfaceAdmissions',
    'buildAuxillariesWalletBtdPaneState',
    'buildOrganizationPolicyAuthority',
    'buildAuxillariesReadinessDiagnostics',
    'buildAuxillariesRecoveryRun',
    'toAuxillariesJsonSafe',
    'assertAuxillariesJsonSafe',
    'validateAuxillariesContractSnapshot',
    'parseAuxillariesContractSnapshot',
  ]) {
    assertCheck(failures, contract.includes(symbol), `Auxillaries contract must own ${symbol}.`);
  }

  for (const phrase of [
    'provider tokens',
    'wallet secrets',
    'private prompts',
    'protected source',
    'service keys',
  ]) {
    assertCheck(
      failures,
      spec.includes(phrase) || delta.includes(phrase) || notes.includes(phrase),
      `V31 spec family must retain source-safety requirement for ${phrase}.`,
    );
  }

  assertCheck(failures, contract.includes('SENSITIVE_KEY_PATTERN'), 'Auxillaries contract must define a sensitive-key redaction pattern.');
  assertCheck(failures, contract.includes('PROTECTED_SOURCE_KEY_PATTERN'), 'Auxillaries contract must define a protected-source redaction pattern.');
  assertCheck(failures, route.includes("from '@bitcode/orm'"), 'Auxillaries route must import ORM profile helpers from the package root.');
  assertCheck(failures, !route.includes("@bitcode/orm/src/profile-contract"), 'Auxillaries route must not deep-import ORM profile helpers.');
  assertCheck(failures, route.includes('buildAuxillaryDataPayloadFromUnknown'), 'Mock Auxillaries route data must pass through the package contract builder.');
  assertCheck(failures, route.includes('buildAuxillaryDataPayload({'), 'Live Auxillaries route data must pass through the package contract builder.');
  assertCheck(failures, bridge.includes('AuxillariesContractSnapshot'), 'Auxillaries UI bridge must re-export the package-owned contract types.');

  for (const proofPhrase of [
    'ghp_secret',
    'service-role-secret',
    'wallet-secret',
    'private prompt body',
    'protected-source',
    'parseAuxillariesContractSnapshot',
    'validateAuxillariesContractSnapshot',
    'assertAuxillariesJsonSafe',
    'connects.github.connect_provider',
  ]) {
    assertCheck(failures, test.includes(proofPhrase), `Auxillaries contract tests must cover ${proofPhrase}.`);
  }

  const demonstrationImportViolations = findStandaloneDemonstrationImports(root);
  assertCheck(
    failures,
    demonstrationImportViolations.length === 0,
    `Commercial runtime source must not import protocol-demonstration/src or @bitcode/protocol-demonstration: ${demonstrationImportViolations.join(', ')}`,
  );

  assertCheck(failures, apiReadme.includes('Auxillaries route contracts'), 'API README must document Auxillaries route contract ownership.');
  assertCheck(failures, apiReadme.includes('buildAuxillariesContractSnapshot'), 'API README must name the Auxillaries snapshot builder.');
  assertCheck(failures, ormReadme.includes('Profile Contracts'), 'ORM README must retain profile contract ownership.');
  assertCheck(failures, btdReadme.includes('Auxillaries'), 'BTD README must name Auxillaries as an accepted BTD consumer.');
  assertCheck(failures, auxReadme.includes('AuxillariesContractSnapshot'), 'Auxillaries README must document the package-owned contract snapshot.');
  assertCheck(failures, auxReadme.includes('must not rederive'), 'Auxillaries README must forbid UI policy rederivation.');

  assertCheck(
    failures,
    /Current working gate: V31 Gate (?:2|3|4|5|6|7|8|9|10)\b/u.test(roadmap),
    'Roadmap must track V31 Gate 2 or a later V31 gate after Gate 2 closure.',
  );
  assertCheck(failures, delta.includes('Gate 2 implementation centers'), 'V31 DELTA must name Gate 2 implementation centers.');
  assertCheck(failures, notes.includes('Gate 2 closure note'), 'V31 NOTES must include the Gate 2 closure note.');
  assertCheck(failures, parity.includes('packages/api/src/routes/auxillaries-contract.ts'), 'V31 PARITY must cite the Auxillaries contract implementation.');
  assertCheck(failures, parity.includes('packages/api/src/routes/__tests__/auxillaries-contract.test.ts'), 'V31 PARITY must cite Auxillaries contract tests.');
  assertCheck(failures, !/\|\s*Package-owned Auxillaries contracts exist\s*\|[^|]*\|\s*pending\s*\|/u.test(parity), 'Gate 2 package contract parity must not remain pending.');
  assertCheck(failures, !/\|\s*JSON-safe serializers redact secrets and protected source\s*\|[^|]*\|\s*pending\s*\|/u.test(parity), 'Gate 2 source-safety parity must not remain pending.');

  assertCheck(failures, packageJson.includes('"check:v31-gate2"'), 'package.json must expose check:v31-gate2.');
  assertCheck(failures, workflow.includes('check-v31-gate2-auxillaries-package-route-contracts.mjs'), 'Gate workflow must run the V31 Gate 2 checker.');

  if (failures.length) {
    process.stderr.write('V31 Gate 2 Auxillaries package route contract check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exit(1);
  }

  process.stdout.write(`V31 Gate 2 Auxillaries package route contract check passed pointer=${pointer}\n`);
}

main();
