#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildV33InterfaceConsumerUxRegressionProofArtifact } from './generate-v33-interface-consumer-ux-regression-proof.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT = '.bitcode/v33-interface-consumer-ux-regression-proof.json';

const REQUIRED_SURFACES = [
  'public_api',
  'mcp_api',
  'chatgpt_app',
  'terminal_handoff',
  'package_consumer',
];
const REQUIRED_POSTURES = ['success_readable', 'denied_readable', 'blocked_preview'];
const REQUIRED_CAPABILITIES = [
  'action_label',
  'source_safe_summary',
  'proof_roots',
  'repair_steps',
  'fee_rights_preview',
  'denial_readability',
];
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
      'Usage: node scripts/check-v33-gate9-interface-consumer-ux-regression-proof.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V33 Gate 9 interface consumer UX regression proof, source-safe rows, surface tests, docs, generated artifact, and workflow wiring.',
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
      branch === 'version/v33' || /^v33\/gate-(?:9|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V33 Gate 9+ work must occur on version/v33 or v33/gate-9..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT,
    'packages/btd/src/interface-consumer-ux-regression-proof.ts',
    'packages/btd/__tests__/interface-consumer-ux-regression-proof.test.ts',
    'packages/btd/src/index.ts',
    'packages/btd/package.json',
    'packages/api/src/routes/__tests__/btd-crypto.test.ts',
    'apps/mcp/src/__tests__/unit/pipeline-ingress-contract.test.ts',
    'apps/chatgpt/src/__tests__/tools.test.ts',
    'apps/uapi/tests/terminalOrganizationAuthority.test.ts',
    'scripts/generate-v33-interface-consumer-ux-regression-proof.mjs',
    'scripts/check-v33-gate9-interface-consumer-ux-regression-proof.mjs',
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
    assertCheck(failures, fileExists(root, relativePath), `Missing V33 Gate 9 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', ['run', 'check:v33-interface-consumer-ux-regression-proof']);
      const artifact = JSON.parse(read(root, ARTIFACT));
      const expected = buildV33InterfaceConsumerUxRegressionProofArtifact();
      assertCheck(
        failures,
        stableStringify(artifact) === stableStringify(expected),
        'V33 Gate 9 artifact must be generated from the current generator.',
      );
    } catch (error) {
      failures.push(`V33 Gate 9 artifact generation failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT) ? read(root, ARTIFACT) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V33 Gate 9 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v33-interface-consumer-ux-regression-proof', 'Gate 9 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v33.interfaceConsumerUxRegressionProof.v1', 'Gate 9 schemaId must match.');
    assertCheck(failures, artifact.version === 'V33' && artifact.currentTarget === 'V32', 'Gate 9 artifact must bind V33 over active V32.');
    assertCheck(failures, artifact.passed === true, 'Gate 9 artifact must pass.');
    assertCheck(failures, includesAll(artifact.requiredSurfaces, REQUIRED_SURFACES), 'Gate 9 must enumerate required surfaces.');
    assertCheck(failures, includesAll(artifact.requiredPostures, REQUIRED_POSTURES), 'Gate 9 must enumerate required postures.');
    assertCheck(failures, includesAll(artifact.requiredCapabilities, REQUIRED_CAPABILITIES), 'Gate 9 must enumerate required UX capabilities.');
    assertCheck(failures, artifact.missingSurfaces.length === 0, 'Gate 9 artifact must not miss surfaces.');
    assertCheck(failures, artifact.missingPostures.length === 0, 'Gate 9 artifact must not miss postures.');
    assertCheck(failures, artifact.missingCapabilities.length === 0, 'Gate 9 artifact must not miss capabilities.');
    assertCheck(failures, artifact.coverage.actionLabelsReadable === true, 'Gate 9 must make action labels readable.');
    assertCheck(failures, artifact.coverage.sourceSafeSummariesReadable === true, 'Gate 9 must make summaries readable.');
    assertCheck(failures, artifact.coverage.proofRootsReadable === true, 'Gate 9 must make proof roots readable.');
    assertCheck(failures, artifact.coverage.repairStepsReadable === true, 'Gate 9 must make repair steps readable.');
    assertCheck(failures, artifact.coverage.feeRightsPreviewReadable === true, 'Gate 9 must make fee/rights preview readable.');
    assertCheck(failures, artifact.coverage.deniedStatesReadable === true, 'Gate 9 must make denied states readable.');
    assertCheck(failures, artifact.coverage.blockedPreviewsReadable === true, 'Gate 9 must make blocked previews readable.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Gate 9 must not expose protected source.');
    assertCheck(failures, artifact.coverage.promptBodyVisible === false, 'Gate 9 must not expose prompt bodies.');
    assertCheck(failures, artifact.coverage.brittleDemonstrationFixture === false, 'Gate 9 must avoid brittle demonstration-only fixtures.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Gate 9 must not serialize credentials.');
    assertCheck(failures, artifact.coverage.allRowsHaveReadableShape === true, 'Gate 9 rows must have readable shape.');
    assertCheck(failures, artifact.rows.every((row) => typeof row.actionLabel === 'string' && row.actionLabel.length > 0), 'Every Gate 9 row must serialize actionLabel.');
    assertCheck(failures, artifact.rows.every((row) => Array.isArray(row.proofRoots) && row.proofRoots.length > 0), 'Every Gate 9 row must serialize proofRoots.');
    assertCheck(failures, artifact.rows.every((row) => Array.isArray(row.repairSteps) && row.repairSteps.length > 0), 'Every Gate 9 row must serialize repairSteps.');
    assertCheck(failures, artifact.rows.every((row) => row.feeRightsPreview?.protectedSourceVisible === false), 'Every Gate 9 fee/rights preview must keep source locked.');
    assertCheck(failures, artifact.rows.every((row) => /^(?:pnpm|npm|node)\b/u.test(row.replayCommand)), 'Every Gate 9 row must serialize a maintained replay command.');
  }

  const btdSource = read(root, 'packages/btd/src/interface-consumer-ux-regression-proof.ts');
  const btdTest = read(root, 'packages/btd/__tests__/interface-consumer-ux-regression-proof.test.ts');
  const apiTest = read(root, 'packages/api/src/routes/__tests__/btd-crypto.test.ts');
  const mcpTest = read(root, 'apps/mcp/src/__tests__/unit/pipeline-ingress-contract.test.ts');
  const chatgptTest = read(root, 'apps/chatgpt/src/__tests__/tools.test.ts');
  const terminalTest = read(root, 'apps/uapi/tests/terminalOrganizationAuthority.test.ts');
  const specs = [
    read(root, 'BITCODE_SPEC_V33.md'),
    read(root, 'BITCODE_SPEC_V33_DELTA.md'),
    read(root, 'BITCODE_SPEC_V33_NOTES.md'),
    read(root, 'BITCODE_SPEC_V33_PARITY_MATRIX.md'),
    read(root, 'SPECIFICATIONS_ROADMAP.md'),
  ].join('\n');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const packageJson = read(root, 'package.json');
  const protocolSpecifying = read(root, 'scripts/specifying/src/canonical/v21-specifying.js');

  for (const sourcePhrase of [
    'BTD_INTERFACE_CONSUMER_UX_REGRESSION_SURFACES',
    'BTD_INTERFACE_CONSUMER_UX_REGRESSION_REQUIRED_CAPABILITIES',
    'buildBtdInterfaceConsumerUxRegressionProof',
    'getBtdInterfaceConsumerUxRegressionRow',
    'brittleDemonstrationFixture',
  ]) {
    assertCheck(failures, btdSource.includes(sourcePhrase), `Gate 9 BTD source missing ${sourcePhrase}.`);
  }

  for (const testPhrase of [
    'publishes source-safe consumer rows for every required surface, posture, and capability',
    'records readable summaries, proof roots, repair steps, and fee or rights previews',
    'rejects secrets, prompt bodies, protected payloads, and demonstration-only fixtures',
  ]) {
    assertCheck(failures, btdTest.includes(testPhrase), `Gate 9 BTD test missing ${testPhrase}.`);
  }

  assertCheck(failures, apiTest.includes('InterfaceConsumerUxRegressionProof for public API denied states'), 'Gate 9 public API test must consume UX proof.');
  assertCheck(failures, mcpTest.includes('InterfaceConsumerUxRegressionProof for MCP Finding Fits readability'), 'Gate 9 MCP test must consume UX proof.');
  assertCheck(failures, chatgptTest.includes('InterfaceConsumerUxRegressionProof for ChatGPT App blocked delivery'), 'Gate 9 ChatGPT App test must consume UX proof.');
  assertCheck(failures, terminalTest.includes('InterfaceConsumerUxRegressionProof for Terminal handoff readability'), 'Gate 9 Terminal test must consume UX proof.');
  assertCheck(failures, specs.includes('InterfaceConsumerUxRegressionProof'), 'Gate 9 specs must name InterfaceConsumerUxRegressionProof.');
  assertCheck(failures, specs.includes('source-safe summary, proof roots, repair steps, and fee/rights preview'), 'Gate 9 specs must preserve closure acceptance wording.');
  assertCheck(failures, packageJson.includes('generate:v33-interface-consumer-ux-regression-proof'), 'Gate 9 package script missing generator.');
  assertCheck(failures, packageJson.includes('check:v33-gate9'), 'Gate 9 package script missing gate checker.');
  assertCheck(failures, workflow.includes('check-v33-gate9-interface-consumer-ux-regression-proof.mjs'), 'Gate 9 workflow must run checker.');
  assertCheck(failures, workflow.includes('interface-consumer-ux-regression-proof.test.ts'), 'Gate 9 workflow must run BTD test.');
  assertCheck(failures, protocolSpecifying.includes(ARTIFACT), 'Gate 9 generated artifact must be part of canonical generated-artifact inventory.');

  if (failures.length > 0) {
    for (const failure of failures) {
      process.stderr.write(`- ${failure}\n`);
    }
    process.exit(1);
  }

  process.stdout.write('V33 Gate 9 interface consumer UX regression proof checks passed.\n');
}

main();
