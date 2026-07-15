#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildV33ApiSchemaCompatibilityMatrixArtifact } from './generate-v33-api-schema-compatibility-matrix.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT = '.bitcode/v33-api-schema-compatibility-matrix.json';

const REQUIRED_CONSUMER_SURFACES = ['public_api', 'mcp_api', 'chatgpt_app', 'terminal_handoff', 'package_consumer'];
const REQUIRED_EXAMPLE_POSTURES = ['success', 'denied', 'blocked', 'stale', 'deferred'];
const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOi', 'JIUzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
];

function parseArgs(argv) {
  const args = { skipBranchCheck: false, repoRoot: defaultRepoRoot, help: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }
  return args;
}

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

function includesAll(values, required) {
  return required.every((value) => values.includes(value));
}

function sortJson(value) {
  if (Array.isArray(value)) return value.map(sortJson);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, sortJson(entry)]),
  );
}

function stableStringify(value) {
  return `${JSON.stringify(sortJson(value), null, 2)}\n`;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v33-gate7-api-schema-compatibility-matrix.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V33 Gate 7 API schema examples, compatibility matrix source, tests, docs, generated artifact, and workflow wiring.',
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
    pointer === 'V32',
    `BITCODE_SPEC.txt must remain V32 during V33 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v33' || /^v33\/gate-(?:[7-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V33 Gate 7+ work must occur on version/v33 or v33/gate-7..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT,
    'packages/btd/src/api-schema-compatibility-matrix.ts',
    'packages/btd/__tests__/api-schema-compatibility-matrix.test.ts',
    'packages/btd/src/index.ts',
    'packages/btd/package.json',
    'packages/api/src/routes/__tests__/btd-crypto.test.ts',
    'apps/mcp/src/__tests__/unit/pipeline-ingress-contract.test.ts',
    'apps/chatgpt/src/__tests__/tools.test.ts',
    'apps/uapi/tests/terminalOrganizationAuthority.test.ts',
    'scripts/generate-v33-api-schema-compatibility-matrix.mjs',
    'scripts/check-v33-gate7-api-schema-compatibility-matrix.mjs',
    '.specifications/BITCODE_SPEC_V33.md',
    '.specifications/BITCODE_SPEC_V33_DELTA.md',
    '.specifications/BITCODE_SPEC_V33_NOTES.md',
    '.specifications/BITCODE_SPEC_V33_PARITY_MATRIX.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    'scripts/specifying/src/canonical/v21-specifying.js',
  ];
  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V33 Gate 7 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', ['run', 'check:v33-api-schema-compatibility-matrix']);
      const artifact = JSON.parse(read(root, ARTIFACT));
      const expected = buildV33ApiSchemaCompatibilityMatrixArtifact();
      assertCheck(
        failures,
        stableStringify(artifact) === stableStringify(expected),
        'V33 Gate 7 artifact must be generated from the current generator.',
      );
    } catch (error) {
      failures.push(`V33 Gate 7 artifact generation failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT) ? read(root, ARTIFACT) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V33 Gate 7 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v33-api-schema-compatibility-matrix', 'Gate 7 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v33.apiSchemaCompatibilityMatrix.v1', 'Gate 7 schemaId must match.');
    assertCheck(failures, artifact.version === 'V33' && artifact.currentTarget === 'V32', 'Gate 7 artifact must bind V33 over active V32.');
    assertCheck(failures, artifact.passed === true, 'Gate 7 artifact must pass.');
    assertCheck(failures, includesAll(artifact.requiredConsumerSurfaces, REQUIRED_CONSUMER_SURFACES), 'Gate 7 must enumerate required consumer surfaces.');
    assertCheck(failures, includesAll(artifact.requiredExamplePostures, REQUIRED_EXAMPLE_POSTURES), 'Gate 7 must enumerate required example postures.');
    assertCheck(failures, artifact.missingConsumerSurfaces.length === 0, 'Gate 7 artifact must not miss consumer surfaces.');
    assertCheck(failures, artifact.missingExamplePostures.length === 0, 'Gate 7 artifact must not miss example postures.');
    assertCheck(failures, artifact.versionedPaths.length === 0, 'Gate 7 must not record versioned or gate-prefixed interface paths.');
    assertCheck(failures, artifact.coverage.schemaIdsRecorded === true, 'Gate 7 must record schema ids.');
    assertCheck(failures, artifact.coverage.consumerSurfacesRecorded === true, 'Gate 7 must record consumer surfaces.');
    assertCheck(failures, artifact.coverage.examplesRecorded === true, 'Gate 7 must record examples.');
    assertCheck(failures, artifact.coverage.breakingChangePolicyRecorded === true, 'Gate 7 must record breaking-change policy.');
    assertCheck(failures, artifact.coverage.compatibilityStatusRecorded === true, 'Gate 7 must record compatibility status.');
    assertCheck(failures, artifact.coverage.fixturePathsRecorded === true, 'Gate 7 must record fixture paths.');
    assertCheck(failures, artifact.coverage.validationCommandsRecorded === true, 'Gate 7 must record validation commands.');
    assertCheck(failures, artifact.coverage.successDeniedBlockedStaleDeferredExamples === true, 'Gate 7 must cover success, denied, blocked, stale, and deferred examples.');
    assertCheck(failures, artifact.coverage.versionlessPathDiscipline === true, 'Gate 7 must enforce versionless path discipline.');
    assertCheck(failures, artifact.coverage.protectedSourceSerialized === false, 'Gate 7 artifact must not serialize protected source.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Gate 7 artifact must not serialize credentials.');
  }

  const btdSource = read(root, 'packages/btd/src/api-schema-compatibility-matrix.ts');
  const btdTest = read(root, 'packages/btd/__tests__/api-schema-compatibility-matrix.test.ts');
  const apiTest = read(root, 'packages/api/src/routes/__tests__/btd-crypto.test.ts');
  const mcpTest = read(root, 'apps/mcp/src/__tests__/unit/pipeline-ingress-contract.test.ts');
  const chatgptTest = read(root, 'apps/chatgpt/src/__tests__/tools.test.ts');
  const terminalTest = read(root, 'apps/uapi/tests/terminalOrganizationAuthority.test.ts');
  const specs = [
    read(root, '.specifications/BITCODE_SPEC_V33.md'),
    read(root, '.specifications/BITCODE_SPEC_V33_DELTA.md'),
    read(root, '.specifications/BITCODE_SPEC_V33_NOTES.md'),
    read(root, '.specifications/BITCODE_SPEC_V33_PARITY_MATRIX.md'),
    read(root, '.specifications/SPECIFICATIONS_ROADMAP.md'),
  ].join('\n');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const packageJson = read(root, 'package.json');
  const protocolSpecifying = read(root, 'scripts/specifying/src/canonical/v21-specifying.js');

  assertCheck(failures, btdSource.includes('buildBtdApiSchemaCompatibilityMatrix'), 'BTD source must build APISchemaCompatibilityMatrix.');
  assertCheck(failures, btdSource.includes('BTD_API_SCHEMA_COMPATIBILITY_EXAMPLE_POSTURES'), 'BTD source must define required example postures.');
  assertCheck(failures, btdSource.includes('assertVersionlessPath'), 'BTD source must enforce versionless path discipline.');
  assertCheck(failures, btdTest.includes('records package-owned success, denied, blocked, stale, and deferred examples'), 'BTD tests must cover all required example postures.');
  assertCheck(failures, btdTest.includes('enforces versionless paths and gate-neutral source identifiers'), 'BTD tests must cover versionless discipline.');
  assertCheck(failures, apiTest.includes('shares the package-owned API schema compatibility matrix for versionless public routes'), 'API tests must share Gate 7 matrix.');
  assertCheck(failures, mcpTest.includes('shares the package-owned API schema compatibility matrix for MCP tool calls'), 'MCP tests must share Gate 7 matrix.');
  assertCheck(failures, chatgptTest.includes('shares the package-owned API schema compatibility matrix for ChatGPT App blocked delivery'), 'ChatGPT App tests must share Gate 7 matrix.');
  assertCheck(failures, terminalTest.includes('shares the package-owned API schema compatibility matrix for product handoff rows'), 'product tests must share Gate 7 matrix.');
  assertCheck(failures, specs.includes('V33 Gate 7 API Schemas Examples And Compatibility Matrix'), 'Spec/roadmap must describe Gate 7 as current work.');
  assertCheck(failures, packageJson.includes('check:v33-gate7'), 'package.json must expose check:v33-gate7.');
  assertCheck(failures, workflow.includes('check-v33-gate7-api-schema-compatibility-matrix.mjs'), 'Gate workflow must run Gate 7 checker.');
  assertCheck(failures, workflow.includes('__tests__/api-schema-compatibility-matrix.test.ts'), 'Gate workflow must run Gate 7 BTD test.');
  assertCheck(failures, protocolSpecifying.includes(ARTIFACT), 'Protocol specifying must include Gate 7 generated artifact.');

  if (failures.length) {
    process.stderr.write(`V33 Gate 7 check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exit(1);
  }

  process.stdout.write('V33 Gate 7 API schema compatibility matrix check passed.\n');
}

main();
