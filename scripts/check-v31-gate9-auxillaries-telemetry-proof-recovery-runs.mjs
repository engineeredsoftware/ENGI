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
      'Usage: node scripts/check-v31-gate9-auxillaries-telemetry-proof-recovery-runs.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V31 Gate 9 source-safe Auxillaries telemetry proof hooks, recovery-run evidence/telemetry roots, API/client/UI readback, tests, docs, and workflow coverage.',
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
      branch === 'version/v31' || /^v31\/gate-(?:9|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V31 Gate 9+ work must occur on version/v31 or v31/gate-9+ branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  for (const relativePath of [
    'packages/api/src/routes/auxillaries-contract.ts',
    'packages/api/src/routes/__tests__/auxillaries-contract.test.ts',
    'apps/uapi/hooks/useUserData.ts',
    'apps/uapi/hooks/useUserData.js',
    'apps/uapi/app/auxillaries/components/AuxillariesExternalsPane.tsx',
    'apps/uapi/tests/userDataRoute.test.ts',
    'apps/uapi/tests/auxillariesExternalsPane.test.tsx',
    'specifications/BITCODE_SPEC_V31.md',
    'specifications/BITCODE_SPEC_V31_DELTA.md',
    'specifications/BITCODE_SPEC_V31_NOTES.md',
    'specifications/BITCODE_SPEC_V31_PARITY_MATRIX.md',
    'specifications/SPECIFICATIONS_ROADMAP.md',
    'packages/api/README.md',
    'apps/uapi/app/auxillaries/README.md',
  ]) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V31 Gate 9 file: ${relativePath}`);
  }

  const contract = read(root, 'packages/api/src/routes/auxillaries-contract.ts');
  const contractTest = read(root, 'packages/api/src/routes/__tests__/auxillaries-contract.test.ts');
  const userDataTs = read(root, 'apps/uapi/hooks/useUserData.ts');
  const userDataJs = read(root, 'apps/uapi/hooks/useUserData.js');
  const externalsPane = read(root, 'apps/uapi/app/auxillaries/components/AuxillariesExternalsPane.tsx');
  const userDataRouteTest = read(root, 'apps/uapi/tests/userDataRoute.test.ts');
  const externalsPaneTest = read(root, 'apps/uapi/tests/auxillariesExternalsPane.test.tsx');
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
    'AuxillariesTelemetrySubject',
    'AuxillariesTelemetryProofHook',
    'buildAuxillariesTelemetryProofHooks',
    'buildAuxillariesTelemetryProofHook',
    'telemetryProofHooks',
    'theoremId',
    'replayStepId',
    'evidenceRoot',
    'telemetryRoot',
    'blockerId',
    'repairOutcome',
    'sourceSafetyClass',
    'profile',
    'account',
    'provider_connection',
    'interface_admission',
    'wallet',
    'btd_pane',
    'organization_authority',
    'policy_decision',
    'readiness_diagnostic',
    'recovery_run',
  ]) {
    assertCheck(failures, contract.includes(contractPhrase), `Auxillaries contract must carry ${contractPhrase}.`);
  }

  for (const recoveryPhrase of [
    'BuildAuxillariesRecoveryRunInput',
    'beforeReadinessRoot',
    'afterReadinessRoot',
    'executionId',
    'retryPolicy',
    'startedAt',
    'completedAt',
    'evidenceRoot',
    'telemetryRoot',
    'recoveryRoot',
  ]) {
    assertCheck(failures, contract.includes(recoveryPhrase), `Recovery-run contract must include ${recoveryPhrase}.`);
  }

  for (const testPhrase of [
    'telemetrySubjects',
    'provider_connection',
    'interface_admission',
    'readiness_diagnostic',
    'recovery_run',
    'auxillaries.recovery_run.execution_evidence',
    'theoremId',
    'replayStepId',
    'evidenceRoot',
    'telemetryRoot',
    'proofRoot',
    'source_safe',
  ]) {
    assertCheck(failures, contractTest.includes(testPhrase), `Gate 9 package tests must cover ${testPhrase}.`);
  }

  for (const hookPhrase of ['telemetryProofHooks', 'Array.isArray(data?.telemetryProofHooks)']) {
    assertCheck(failures, userDataTs.includes(hookPhrase), `TypeScript user data hook must expose ${hookPhrase}.`);
    assertCheck(failures, userDataJs.includes(hookPhrase), `JavaScript user data hook must expose ${hookPhrase}.`);
  }

  for (const uiPhrase of [
    'auxillaries-telemetry-proof-hooks',
    'Telemetry proof hooks',
    'theoremId',
    'replayStepId',
    'evidenceRoot',
    'telemetryRoot',
    'repairOutcome',
    'sourceSafetyClass',
  ]) {
    assertCheck(failures, externalsPane.includes(uiPhrase), `Externals pane must render ${uiPhrase}.`);
  }

  for (const routeTestPhrase of [
    'telemetryProofHooks',
    'AuxillariesTelemetryProofHook',
    'provider_connection',
    'auxillaries.provider_connection.source_safe_readback',
    'provider-connection-github',
  ]) {
    assertCheck(failures, userDataRouteTest.includes(routeTestPhrase), `Auxillaries data route tests must cover ${routeTestPhrase}.`);
  }

  for (const uiTestPhrase of [
    'auxillaries-telemetry-proof-hooks',
    'TelemetryProofHook',
    'Latest subject: provider connection',
    'auxillaries.provider_connection.source_safe_readback',
  ]) {
    assertCheck(failures, externalsPaneTest.includes(uiTestPhrase), `Externals pane tests must cover ${uiTestPhrase}.`);
  }

  for (const docPhrase of [
    'Gate 9',
    'AuxillariesTelemetryProofHook',
    'telemetry subjects',
    'theorem id',
    'replay step id',
    'evidence root',
    'telemetry root',
    'repair outcome',
    'recovery runs',
    'source-safe',
    'credentials',
    'protected source',
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
      `V31 Gate 9 docs/spec must describe ${docPhrase}.`,
    );
  }

  assertCheck(
    failures,
    /Current working gate: V31 Gate (?:9|10)\b/u.test(roadmap),
    'Roadmap must track V31 Gate 9 or a later V31 gate as current working gate.',
  );
  assertCheck(failures, packageJson.includes('"check:v31-gate9"'), 'package.json must expose check:v31-gate9.');
  assertCheck(
    failures,
    workflow.includes('check-v31-gate9-auxillaries-telemetry-proof-recovery-runs.mjs'),
    'Gate quality workflow must run the V31 Gate 9 checker.',
  );

  if (failures.length) {
    process.stderr.write('V31 Gate 9 Auxillaries telemetry/recovery closure check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exit(1);
  }

  process.stdout.write('V31 Gate 9 Auxillaries telemetry/recovery closure check passed.\n');
}

main();
