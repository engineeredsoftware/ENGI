#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT = '.bitcode/v33-interface-contract-catalog.json';

const REQUIRED_INTERFACE_IDS = [
  'terminal_handoff',
  'public_api',
  'mcp_api',
  'chatgpt_app',
  'package_consumer',
  'exchange_hook',
  'conversations_hook',
];

const REQUIRED_ROW_FIELDS = [
  'ownerPackage',
  'actionId',
  'schemaId',
  'authPolicyId',
  'sourceSafetyClass',
  'exampleFixturePath',
  'validationCommand',
  'compatibilityStatus',
  'failureMode',
  'repairPosture',
  'telemetryProofHookId',
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
  return execFileSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
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
      'Usage: node scripts/check-v33-gate2-interface-contract-catalog.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V33 Gate 2 interface contract catalog source, generated artifact, tests, docs, package scripts, and workflow wiring.',
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
  const pointer = read(root, 'BITCODE_SPEC.txt').trim();

  assertCheck(
    failures,
    pointer === 'V32',
    `BITCODE_SPEC.txt must remain V32 during V33 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v33' || /^v33\/gate-(?:[2-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V33 Gate 2+ work must occur on version/v33 or v33/gate-2..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT,
    'packages/btd/src/interface-contract-catalog.ts',
    'packages/btd/src/index.ts',
    'packages/btd/__tests__/interface-contract-catalog.test.ts',
    'scripts/generate-v33-interface-contract-catalog.mjs',
    'scripts/check-v33-gate2-interface-contract-catalog.mjs',
    'BITCODE_SPEC_V33.md',
    'BITCODE_SPEC_V33_DELTA.md',
    'BITCODE_SPEC_V33_NOTES.md',
    'BITCODE_SPEC_V33_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    'scripts/specifying/src/canonical/v21-specifying.js',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V33 Gate 2 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', ['run', 'check:v33-interface-contract-catalog']);
    } catch (error) {
      failures.push(`V33 Gate 2 artifact check failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT) ? read(root, ARTIFACT) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V33 Gate 2 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v33-interface-contract-catalog', 'Gate 2 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v33.interfaceContractCatalog.v1', 'Gate 2 schemaId must match.');
    assertCheck(failures, artifact.version === 'V33' && artifact.currentTarget === 'V32', 'Gate 2 artifact must bind V33 over active V32.');
    assertCheck(failures, artifact.passed === true, 'Gate 2 artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-interface-contract-catalog-metadata',
      'Gate 2 artifact must be source-safe interface metadata.',
    );
    assertCheck(failures, includesAll(artifact.requiredInterfaceIds, REQUIRED_INTERFACE_IDS), 'Gate 2 artifact must enumerate every required interface.');
    assertCheck(failures, includesAll(artifact.deferredInterfaceIds, ['exchange_hook', 'conversations_hook']), 'Gate 2 artifact must keep Exchange and Conversations deferred.');
    assertCheck(failures, includesAll(artifact.requiredRowFields, REQUIRED_ROW_FIELDS), 'Gate 2 artifact must enumerate required row fields.');
    assertCheck(failures, artifact.coverage.activeContractCount === 5, 'Gate 2 artifact must prove five active contracts.');
    assertCheck(failures, artifact.coverage.deferredBlockedCount === 2, 'Gate 2 artifact must prove two deferred blocked hooks.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Gate 2 artifact must keep protected source invisible.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Gate 2 artifact must not serialize credentials.');
    assertCheck(failures, artifact.coverage.deferredSurfacesHidden === false, 'Gate 2 artifact must not hide deferred interfaces.');
    assertCheck(
      failures,
      artifact.rows.every((row) => REQUIRED_ROW_FIELDS.every((field) => typeof row[field] === 'string' && row[field].length > 0)),
      'Gate 2 rows must populate every required row field.',
    );
    assertCheck(
      failures,
      artifact.rows.filter((row) => row.status === 'deferred_blocked').every((row) => row.compatibilityStatus === 'deferred_not_admitted'),
      'Gate 2 deferred rows must not be compatibility-admitted.',
    );
    assertCheck(
      failures,
      artifact.sourceEvidence.every((entry) => entry.requiredTokens.every((token) => token.present === true)),
      'Gate 2 source evidence tokens must all be present.',
    );
    assertCheck(
      failures,
      artifact.testEvidence.every((entry) => entry.requiredTokens.every((token) => token.present === true)),
      'Gate 2 test evidence tokens must all be present.',
    );
  }

  const spec = read(root, 'BITCODE_SPEC_V33.md');
  const delta = read(root, 'BITCODE_SPEC_V33_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V33_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V33_PARITY_MATRIX.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');
  const packageJson = read(root, 'package.json');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const btdSource = read(root, 'packages/btd/src/interface-contract-catalog.ts');
  const btdTest = read(root, 'packages/btd/__tests__/interface-contract-catalog.test.ts');
  const specifying = read(root, 'scripts/specifying/src/canonical/v21-specifying.js');

  for (const doc of [spec, delta, notes, parity]) {
    assertCheck(failures, doc.includes(ARTIFACT), `V33 docs must mention ${ARTIFACT}.`);
    assertCheck(failures, doc.includes('terminal_handoff'), 'V33 docs must name terminal_handoff.');
    assertCheck(failures, doc.includes('package_consumer'), 'V33 docs must name package_consumer.');
    assertCheck(failures, doc.includes('deferred_not_admitted'), 'V33 docs must name deferred_not_admitted.');
  }

  assertCheck(
    failures,
    /Current working gate: V33 Gate (?:[2-9]|10)\b/u.test(roadmap),
    'Roadmap must track V33 Gate 2 or later as the current working gate.',
  );
  assertCheck(failures, packageJson.includes('"generate:v33-interface-contract-catalog"'), 'package.json must expose the Gate 2 generator.');
  assertCheck(failures, packageJson.includes('"check:v33-interface-contract-catalog"'), 'package.json must expose the Gate 2 artifact check.');
  assertCheck(failures, packageJson.includes('"check:v33-gate2"'), 'package.json must expose check:v33-gate2.');
  assertCheck(failures, workflow.includes('check-v33-gate2-interface-contract-catalog.mjs'), 'Gate workflow must run the V33 Gate 2 checker.');
  assertCheck(failures, workflow.includes('interface-contract-catalog.test.ts'), 'Gate workflow must run the focused interface contract catalog test.');
  assertCheck(failures, specifying.includes(ARTIFACT), 'Spec-family profile must include the Gate 2 artifact path.');

  for (const phrase of [
    'buildBtdInterfaceContractCatalog',
    'BTD_INTERFACE_CONTRACT_CATALOG_INTERFACE_IDS',
    'terminal_handoff',
    'public_api',
    'mcp_api',
    'chatgpt_app',
    'package_consumer',
    'deferred_not_admitted',
  ]) {
    assertCheck(failures, btdSource.includes(phrase), `Gate 2 source must include ${phrase}.`);
  }

  for (const phrase of [
    'catalogs Terminal handoff, public API, MCP API, ChatGPT App, package consumers, and deferred hooks',
    'fails closed when a required interface catalog row is missing',
    'fails closed when deferred hooks are accidentally admitted as compatible active contracts',
    'fails closed on secret-shaped or protected-source catalog text',
  ]) {
    assertCheck(failures, btdTest.includes(phrase), `Gate 2 test must assert: ${phrase}.`);
  }

  if (failures.length) {
    process.stderr.write('V33 Gate 2 interface contract catalog check failed:\n');
    for (const failure of failures) {
      process.stderr.write(`- ${failure}\n`);
    }
    process.exit(1);
  }

  process.stdout.write(`V33 Gate 2 interface contract catalog ok artifact=${ARTIFACT}\n`);
}

main();
