#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT = '.proofs/v32/interface-contract-regression-suite.json';

const REQUIRED_SURFACES = [
  'terminal',
  'api',
  'mcp',
  'chatgpt_app',
  'auxillaries_hook',
  'exchange_hook',
  'conversations_hook',
];

const REQUIRED_OBJECT_FAMILIES = [
  'btd_registry',
  'read_access',
  'btd_receipts',
  'btc_fee_operation',
  'ledger_projection',
  'source_to_shares_proof',
  'protocol_telemetry',
  'organization_authority',
  'terminal_journal',
];

const REQUIRED_ASSERTIONS = [
  'auth-boundary-asserted',
  'policy-denial-asserted',
  'source-safety-class-asserted',
  'protected-source-nondisclosure-asserted',
];

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
];

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function fileExists(root, relativePath) {
  return existsSync(path.join(root, relativePath));
}

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function run(root, command, args) {
  return execFileSync(command, args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function includesAll(values, requiredValues) {
  return requiredValues.every((value) => values.includes(value));
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
      'Usage: node scripts/check-v32-gate6-interface-contract-regression-suites.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V32 Gate 6 shared interface contract regression artifact, tests, docs, package scripts, and workflow wiring.',
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

  assertCheck(failures, pointer === 'V31', `BITCODE_SPEC.txt must remain V31 during V32 gate work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v32' || /^v32\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V32 work must occur on version/v32 or v32/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT,
    'scripts/generate-v32-interface-contract-regression-suites.mjs',
    'scripts/check-v32-gate6-interface-contract-regression-suites.mjs',
    'packages/btd/src/interface-contract-regression.ts',
    'packages/btd/src/interface-integration-contract.ts',
    'packages/btd/__tests__/v32-interface-contract-regression.test.ts',
    'packages/btd/__tests__/interface-integration.test.ts',
    'packages/api/src/routes/__tests__/btd-crypto.test.ts',
    'apps/uapi/app/ (removed cockpit tree) terminal-interface-integration-regression.ts',
    'apps/uapi/tests/terminalInterfaceIntegrationRegression.test.ts',
    'apps/mcp/src/__tests__/unit/pipeline-ingress-contract.test.ts',
    'apps/chatgpt/src/__tests__/tools.test.ts',
    '.specifications/BITCODE_SPEC_V32.md',
    '.specifications/BITCODE_SPEC_V32_DELTA.md',
    '.specifications/BITCODE_SPEC_V32_NOTES.md',
    '.specifications/BITCODE_SPEC_V32_PARITY_MATRIX.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    'scripts/v32-proof-coverage-matrix.mjs',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V32 Gate 6 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', ['run', 'check:v32-interface-contract-regression-suites']);
    } catch (error) {
      failures.push(`V32 Gate 6 artifact check failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT) ? read(root, ARTIFACT) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V32 Gate 6 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v32-interface-contract-regression-suite', 'Gate 6 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v32.interfaceContractRegressionSuite.v1', 'Gate 6 schemaId must match.');
    assertCheck(failures, artifact.version === 'V32' && artifact.currentTarget === 'V31', 'Gate 6 artifact must bind V32 over active V31.');
    assertCheck(failures, artifact.passed === true, 'Gate 6 artifact must pass.');
    assertCheck(failures, artifact.sourceSafetyVerdict === 'source-safe-interface-contract-proof-metadata', 'Gate 6 artifact must be source-safe contract proof metadata.');
    assertCheck(failures, includesAll(artifact.requiredSurfaces, REQUIRED_SURFACES), 'Gate 6 artifact must enumerate every required interface surface.');
    assertCheck(failures, includesAll(artifact.requiredObjectFamilies, REQUIRED_OBJECT_FAMILIES), 'Gate 6 artifact must enumerate every required object family.');
    assertCheck(failures, includesAll(artifact.requiredAssertions, REQUIRED_ASSERTIONS), 'Gate 6 artifact must enumerate every required boundary assertion.');
    assertCheck(failures, includesAll(artifact.deferredSurfaces, ['exchange_hook', 'conversations_hook']), 'Gate 6 artifact must keep Exchange and Conversations deferred.');
    assertCheck(failures, artifact.coverage.activeContractCount === 5, 'Gate 6 artifact must prove five active interface contracts.');
    assertCheck(failures, artifact.coverage.deferredBlockedCount === 2, 'Gate 6 artifact must prove two deferred blocked contracts.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Gate 6 artifact must keep protected source invisible.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Gate 6 artifact must not serialize credentials.');
    assertCheck(failures, artifact.coverage.routeLocalReimplementation === false, 'Gate 6 artifact must reject route-local reimplementation.');
    assertCheck(
      failures,
      artifact.fixtureRows.every((row) => row.assertions.every((assertion) => REQUIRED_ASSERTIONS.includes(assertion))),
      'Gate 6 fixture rows must contain only known assertions.',
    );
    assertCheck(
      failures,
      artifact.sourceEvidence.every((entry) => entry.requiredTokens.every((token) => token.present === true)),
      'Gate 6 source evidence tokens must all be present.',
    );
    assertCheck(
      failures,
      artifact.testEvidence.every((entry) => entry.requiredTokens.every((token) => token.present === true)),
      'Gate 6 test evidence tokens must all be present.',
    );
  }

  const spec = read(root, '.specifications/BITCODE_SPEC_V32.md');
  const delta = read(root, '.specifications/BITCODE_SPEC_V32_DELTA.md');
  const notes = read(root, '.specifications/BITCODE_SPEC_V32_NOTES.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V32_PARITY_MATRIX.md');
  const roadmap = read(root, '.specifications/SPECIFICATIONS_ROADMAP.md');
  const packageJson = read(root, 'package.json');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const matrix = read(root, 'scripts/v32-proof-coverage-matrix.mjs');
  const btdTest = read(root, 'packages/btd/__tests__/v32-interface-contract-regression.test.ts');

  for (const doc of [spec, delta, notes, parity]) {
    assertCheck(failures, doc.includes(ARTIFACT), `V32 docs must mention ${ARTIFACT}.`);
    assertCheck(failures, doc.includes('conversations_hook'), 'V32 docs must explicitly name the Conversations deferred hook.');
  }

  assertCheck(failures, /Current working gate: V32 Gate (?:[6-9]|10)\b/u.test(roadmap), 'Roadmap must track V32 Gate 6 or later as the current working gate.');
  assertCheck(failures, packageJson.includes('"check:v32-gate6"'), 'package.json must expose check:v32-gate6.');
  assertCheck(failures, packageJson.includes('"generate:v32-interface-contract-regression-suites"'), 'package.json must expose the Gate 6 generator.');
  assertCheck(
    failures,
    workflow.includes('check-v32-gate6-interface-contract-regression-suites.mjs') &&
      workflow.includes('v32-interface-contract-regression.test.ts'),
    'Gate quality workflow must run the V32 Gate 6 checker and focused interface contract test.',
  );
  assertCheck(failures, matrix.includes(ARTIFACT), 'V32 proof coverage matrix must reference the Gate 6 artifact.');

  for (const phrase of [
    'blocked deferred contract rows',
    'authentication, policy denial, source-safety class',
    'fails closed when a required interface fixture is missing',
    'fails closed when deferred hooks are accidentally admitted',
  ]) {
    assertCheck(failures, btdTest.includes(phrase), `V32 Gate 6 test must assert: ${phrase}.`);
  }

  if (failures.length) {
    process.stderr.write('V32 Gate 6 interface contract regression suite check failed:\n');
    for (const failure of failures) {
      process.stderr.write(`- ${failure}\n`);
    }
    process.exit(1);
  }

  process.stdout.write(`V32 Gate 6 interface contract regression suites ok artifact=${ARTIFACT}\n`);
}

main();
