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
      'Usage: node scripts/check-v31-gate3-profile-account-state.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V31 Gate 3 Profile/account state typing, hydration, repair routes, UI projection, tests, docs, and workflow coverage.',
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
      branch === 'version/v31' || /^v31\/gate-(?:3|4|5|6|7|8|9|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V31 Gate 3+ work must occur on version/v31 or v31/gate-3+ branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  for (const relativePath of [
    'packages/api/src/routes/auxillaries-contract.ts',
    'packages/api/src/routes/auxillaries.ts',
    'packages/api/src/routes/__tests__/auxillaries-contract.test.ts',
    'apps/uapi/app/auxillaries/components/AuxillariesProfilePane.tsx',
    'apps/uapi/app/auxillaries/components/AuxillariesSurface.tsx',
    'apps/uapi/app/auxillaries/auxillary-onboarding-contract.ts',
    'apps/uapi/tests/userDataRoute.test.ts',
    'apps/uapi/tests/profileStep.test.tsx',
    'packages/api/README.md',
    'packages/orm/README.md',
    'apps/uapi/app/auxillaries/README.md',
    'specifications/BITCODE_SPEC_V31.md',
    'specifications/BITCODE_SPEC_V31_DELTA.md',
    'specifications/BITCODE_SPEC_V31_NOTES.md',
    'specifications/BITCODE_SPEC_V31_PARITY_MATRIX.md',
    'specifications/SPECIFICATIONS_ROADMAP.md',
  ]) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V31 Gate 3 file: ${relativePath}`);
  }

  const contract = read(root, 'packages/api/src/routes/auxillaries-contract.ts');
  const route = read(root, 'packages/api/src/routes/auxillaries.ts');
  const contractTest = read(root, 'packages/api/src/routes/__tests__/auxillaries-contract.test.ts');
  const dataRouteTest = read(root, 'apps/uapi/tests/userDataRoute.test.ts');
  const profilePane = read(root, 'apps/uapi/app/auxillaries/components/AuxillariesProfilePane.tsx');
  const surface = read(root, 'apps/uapi/app/auxillaries/components/AuxillariesSurface.tsx');
  const bridge = read(root, 'apps/uapi/app/auxillaries/auxillary-onboarding-contract.ts');
  const profileTest = read(root, 'apps/uapi/tests/profileStep.test.tsx');
  const apiReadme = read(root, 'packages/api/README.md');
  const ormReadme = read(root, 'packages/orm/README.md');
  const auxReadme = read(root, 'apps/uapi/app/auxillaries/README.md');
  const spec = read(root, 'specifications/BITCODE_SPEC_V31.md');
  const delta = read(root, 'specifications/BITCODE_SPEC_V31_DELTA.md');
  const notes = read(root, 'specifications/BITCODE_SPEC_V31_NOTES.md');
  const parity = read(root, 'specifications/BITCODE_SPEC_V31_PARITY_MATRIX.md');
  const roadmap = read(root, 'specifications/SPECIFICATIONS_ROADMAP.md');
  const packageJson = read(root, 'package.json');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const jestConfig = read(root, 'apps/uapi/jest.config.cjs');

  for (const symbol of [
    'AuxillariesAccountIdentity',
    'AuxillariesProfileCompletenessIssue',
    'AuxillariesProfileRepairRoute',
    'AuxillariesPreferencePosture',
    'AuxillariesNotificationPosture',
    'AuxillariesDataSharingPosture',
    'buildAuxillariesPreferencePosture',
    'buildAuxillariesNotificationPosture',
    'buildAuxillariesDataSharingPosture',
  ]) {
    assertCheck(failures, contract.includes(symbol), `Auxillaries contract must own ${symbol}.`);
    assertCheck(failures, bridge.includes(symbol), `Auxillaries UI bridge must expose ${symbol}.`);
  }

  for (const phrase of [
    'profileCompleteness: {',
    'issues:',
    'repairRoutes:',
    'walletBinding',
    'modelPreferencesConfigured',
    'templatePreferencesConfigured',
    'notificationPosture',
    'dataSharingPosture',
    'stableProofRoot',
  ]) {
    assertCheck(failures, contract.includes(phrase), `Profile state contract must include ${phrase}.`);
  }

  assertCheck(failures, route.includes("from('user_template_preferences')"), 'Auxillaries data route must hydrate template preferences.');
  assertCheck(failures, route.includes("from('notifications')"), 'Auxillaries data route must hydrate notification posture.');
  assertCheck(failures, route.includes('notificationRows'), 'Auxillaries data route must pass notification rows into the contract builder.');
  assertCheck(failures, route.includes('templatePreferences'), 'Auxillaries data route must pass template preferences into the contract builder.');
  assertCheck(failures, surface.includes('useUserData'), 'Auxillaries surface must read aggregate profile state.');
  assertCheck(failures, surface.includes('profileState={'), 'Auxillaries surface must pass profileState into the Profile pane.');
  assertCheck(failures, profilePane.includes('data-testid="auxillaries-profile-readiness"'), 'Profile pane must render a profile readiness section.');
  assertCheck(failures, profilePane.includes('profileReadinessIssues'), 'Profile pane must render package-owned completeness issues.');
  assertCheck(failures, !profilePane.includes('access_token'), 'Profile pane must not render provider token fields.');

  for (const proofPhrase of [
    'accountIdentity',
    'preferences.model_missing',
    'preferences.templates_missing',
    'notificationPosture',
    'dataSharingPosture',
    'templatePreferences',
    'notificationRows',
  ]) {
    assertCheck(
      failures,
      contractTest.includes(proofPhrase) || dataRouteTest.includes(proofPhrase) || profileTest.includes(proofPhrase),
      `Gate 3 tests must cover ${proofPhrase}.`,
    );
  }

  assertCheck(failures, dataRouteTest.includes("table === 'user_template_preferences'"), 'User data route test must mock template preferences.');
  assertCheck(failures, dataRouteTest.includes("table === 'notifications'"), 'User data route test must mock notifications.');
  assertCheck(failures, profileTest.includes('auxillaries-profile-readiness'), 'Profile pane test must assert readiness UI.');
  assertCheck(failures, jestConfig.includes('<rootDir>/tests/profileStep.test.tsx'), 'UAPI Jest config must include the Profile pane test.');

  for (const docPhrase of [
    'account identity',
    'notification posture',
    'data-sharing posture',
    'repair routes',
  ]) {
    assertCheck(
      failures,
      spec.includes(docPhrase) || delta.includes(docPhrase) || notes.includes(docPhrase) || apiReadme.includes(docPhrase) || ormReadme.includes(docPhrase) || auxReadme.includes(docPhrase),
      `V31 Gate 3 docs/spec must describe ${docPhrase}.`,
    );
  }

  assertCheck(
    failures,
    /Current working gate: V31 Gate (?:3|4|5|6|7|8|9|10)\b/u.test(roadmap),
    'Roadmap must track V31 Gate 3 or a later V31 gate as current working gate.',
  );
  assertCheck(failures, delta.includes('Gate 3 implementation centers'), 'V31 DELTA must name Gate 3 implementation centers.');
  assertCheck(failures, notes.includes('Gate 3 closure note'), 'V31 NOTES must include the Gate 3 closure note.');
  assertCheck(failures, parity.includes('AuxillariesAccountIdentity'), 'V31 PARITY must cite Gate 3 typed account identity evidence.');
  assertCheck(failures, !/\|\s*Profile\/account state is typed\s*\|[^|]*\|\s*pending\s*\|/u.test(parity), 'Gate 3 profile/account parity must not remain pending.');
  assertCheck(failures, packageJson.includes('"check:v31-gate3"'), 'package.json must expose check:v31-gate3.');
  assertCheck(failures, workflow.includes('check-v31-gate3-profile-account-state.mjs'), 'Gate workflow must run the V31 Gate 3 checker.');
  assertCheck(failures, workflow.includes('tests/profileStep.test.tsx'), 'Gate workflow must run the Profile pane test.');

  if (failures.length) {
    process.stderr.write('V31 Gate 3 Profile/account state check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exit(1);
  }

  process.stdout.write(`V31 Gate 3 Profile/account state check passed pointer=${pointer}\n`);
}

main();
