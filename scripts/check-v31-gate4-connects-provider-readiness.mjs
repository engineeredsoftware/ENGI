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
      'Usage: node scripts/check-v31-gate4-connects-provider-readiness.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V31 Gate 4 Connects provider readiness, recovery roots, source-safe routes, UI projection, tests, docs, and workflow coverage.',
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
      branch === 'version/v31' || /^v31\/gate-(?:4|5|6|7|8|9|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V31 Gate 4+ work must occur on version/v31 or v31/gate-4+ branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  for (const relativePath of [
    'packages/api/src/routes/auxillaries-contract.ts',
    'apps/uapi/app/api/vcs/[provider]/connection/route.ts',
    'apps/uapi/app/api/vcs/_shared.ts',
    'apps/uapi/app/api/auxillaries/connections/github/route.ts',
    'apps/uapi/app/auxillaries/components/AuxillariesExternalsPane.tsx',
    'apps/uapi/hooks/useUserData.ts',
    'apps/uapi/tests/api/vcsRoutes.test.ts',
    'apps/uapi/tests/api/auxillariesGithubConnectionRoute.test.ts',
    'apps/uapi/tests/auxillariesExternalsPane.test.tsx',
    'packages/api/src/routes/__tests__/auxillaries-contract.test.ts',
    '.specifications/BITCODE_SPEC_V31.md',
    '.specifications/BITCODE_SPEC_V31_DELTA.md',
    '.specifications/BITCODE_SPEC_V31_NOTES.md',
    '.specifications/BITCODE_SPEC_V31_PARITY_MATRIX.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
  ]) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V31 Gate 4 file: ${relativePath}`);
  }

  const contract = read(root, 'packages/api/src/routes/auxillaries-contract.ts');
  const vcsRoute = read(root, 'apps/uapi/app/api/vcs/[provider]/connection/route.ts');
  const vcsShared = read(root, 'apps/uapi/app/api/vcs/_shared.ts');
  const githubRoute = read(root, 'apps/uapi/app/api/auxillaries/connections/github/route.ts');
  const externalsPane = read(root, 'apps/uapi/app/auxillaries/components/AuxillariesExternalsPane.tsx');
  const useUserData = read(root, 'apps/uapi/hooks/useUserData.ts');
  const contractTest = read(root, 'packages/api/src/routes/__tests__/auxillaries-contract.test.ts');
  const vcsRouteTest = read(root, 'apps/uapi/tests/api/vcsRoutes.test.ts');
  const githubRouteTest = read(root, 'apps/uapi/tests/api/auxillariesGithubConnectionRoute.test.ts');
  const externalsTest = read(root, 'apps/uapi/tests/auxillariesExternalsPane.test.tsx');
  const spec = read(root, '.specifications/BITCODE_SPEC_V31.md');
  const delta = read(root, '.specifications/BITCODE_SPEC_V31_DELTA.md');
  const notes = read(root, '.specifications/BITCODE_SPEC_V31_NOTES.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V31_PARITY_MATRIX.md');
  const roadmap = read(root, '.specifications/SPECIFICATIONS_ROADMAP.md');
  const apiReadme = read(root, 'packages/api/README.md');
  const auxReadme = read(root, 'apps/uapi/app/auxillaries/README.md');
  const packageJson = read(root, 'package.json');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');

  for (const symbol of [
    'AuxillariesProviderTokenPresenceClass',
    'AuxillariesProviderScopesClass',
    'AuxillariesProviderReadbackStatus',
    'providerId',
    'providerName',
    'tokenPresenceClass',
    'scopesClass',
    'lastReadbackStatus',
    'blocker',
    'repairAction',
    'providerReadinessRoot',
  ]) {
    assertCheck(failures, contract.includes(symbol), `Auxillaries connection readiness must own ${symbol}.`);
  }

  for (const routePhrase of [
    'providerReadiness',
    'buildAuxillariesConnectionReadiness',
    'buildAuxillariesRecoveryRun',
    'beforeReadinessRoot',
    'afterReadinessRoot',
  ]) {
    assertCheck(
      failures,
      vcsRoute.includes(routePhrase) || githubRoute.includes(routePhrase),
      `Provider routes must emit ${routePhrase}.`,
    );
  }

  for (const sharedPhrase of [
    'tokenPresenceClass',
    'scopesClass',
    'lastReadbackStatus',
    'hasConnectionTokenEvidence',
    'readConnectionScopes',
    'sanitizeConnectionMetadata',
  ]) {
    assertCheck(failures, vcsShared.includes(sharedPhrase), `VCS shared status must classify ${sharedPhrase}.`);
  }

  for (const uiPhrase of [
    'connectionReadiness',
    'recoveryRuns',
    'auxillaries-provider-readiness',
    'Provider readiness',
    'Latest recovery',
    'providerReadinessRoot',
  ]) {
    assertCheck(
      failures,
      externalsPane.includes(uiPhrase) || useUserData.includes(uiPhrase),
      `Externals UI/read model must project ${uiPhrase}.`,
    );
  }

  for (const testPhrase of [
    'tokenPresenceClass',
    'scopesClass',
    'lastReadbackStatus',
    'providerReadinessRoot',
    'beforeReadinessRoot',
    'afterReadinessRoot',
    'gho_new_secret',
    'auxillaries-provider-readiness',
  ]) {
    assertCheck(
      failures,
      contractTest.includes(testPhrase) ||
        vcsRouteTest.includes(testPhrase) ||
        githubRouteTest.includes(testPhrase) ||
        externalsTest.includes(testPhrase),
      `Gate 4 tests must cover ${testPhrase}.`,
    );
  }

  assertCheck(failures, githubRouteTest.includes('not.toContain'), 'GitHub connection route test must assert response redaction.');
  assertCheck(failures, contractTest.includes('provider-token'), 'Package contract test must use a provider-token fixture.');
  assertCheck(failures, !externalsPane.includes('access_token'), 'Externals pane must not render raw provider token fields.');

  for (const docPhrase of [
    'provider id/name',
    'token presence class',
    'scopes class',
    'before/after readiness roots',
    'source-safe provider connection posture',
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
      `V31 Gate 4 docs/spec must describe ${docPhrase}.`,
    );
  }

  assertCheck(
    failures,
    /Current working gate: V31 Gate (?:4|5|6|7|8|9|10)\b/u.test(roadmap),
    'Roadmap must track V31 Gate 4 or a later V31 gate as current working gate.',
  );
  assertCheck(failures, delta.includes('Gate 4 implementation centers'), 'V31 DELTA must name Gate 4 implementation centers.');
  assertCheck(failures, notes.includes('Gate 4 closure note'), 'V31 NOTES must include the Gate 4 closure note.');
  assertCheck(failures, !/\|\s*Provider readiness is source-safe\s*\|[^|]*\|\s*pending\s*\|/u.test(parity), 'Gate 4 provider-readiness parity must not remain pending.');
  assertCheck(failures, !/\|\s*Recovery runs record before\/after readiness roots\s*\|[^|]*\|\s*pending\s*\|/u.test(parity), 'Gate 4 recovery parity must not remain pending.');
  assertCheck(failures, packageJson.includes('"check:v31-gate4"'), 'package.json must expose check:v31-gate4.');
  assertCheck(failures, workflow.includes('check-v31-gate4-connects-provider-readiness.mjs'), 'Gate workflow must run the V31 Gate 4 checker.');
  assertCheck(failures, workflow.includes('auxillariesGithubConnectionRoute.test.ts'), 'Gate workflow must run the GitHub connection recovery route test.');

  if (failures.length) {
    process.stderr.write('V31 Gate 4 Connects provider readiness check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exit(1);
  }

  process.stdout.write(`V31 Gate 4 Connects provider readiness check passed pointer=${pointer}\n`);
}

main();
