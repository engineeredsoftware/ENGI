#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildV33ChatGptAppActionContractsArtifact } from './generate-v33-chatgpt-app-action-contracts.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT = '.bitcode/v33-chatgpt-app-action-contracts.json';

const REQUIRED_ACTION_IDS = [
  'bitcode_request_read',
  'bitcode_review_read_need',
  'bitcode_request_finding_fits',
  'bitcode_review_asset_pack_preview',
  'bitcode_quote_asset_pack_fee',
  'bitcode_settle_asset_pack',
  'bitcode_deliver_asset_pack',
];

const REQUIRED_FLOW_OBJECTS = [
  'read_request',
  'read_need',
  'finding_fits_result',
  'asset_pack_preview',
  'btc_fee_quote',
  'settlement_unlock',
  'asset_pack_delivery',
];

const REQUIRED_DENIED_STATES = [
  'SCHEMA_VALIDATION_FAILED',
  'MISSING_READER_SESSION',
  'READ_NEED_REQUIRED',
  'FINDING_FITS_REQUIRED',
  'ASSET_PACK_PREVIEW_REQUIRED',
  'FEE_QUOTE_REQUIRED',
  'SETTLEMENT_REQUIRED',
  'READ_LICENSE_REQUIRED',
  'ORGANIZATION_AUTHORITY_REQUIRED',
  'CONFIRMATION_REQUIRED',
];

const REQUIRED_PROOF_ROOT_FIELDS = [
  'actionId',
  'inputSchemaId',
  'outputSchemaId',
  'authPolicyId',
  'requestRoot',
  'responseRoot',
  'sourceSafeRendererId',
  'writeAdmission',
];

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
];

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

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v33-gate4-chatgpt-app-action-contracts.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V33 Gate 4 ChatGPT App action contracts, source-safe rendering, denial repair posture, docs, tests, artifact freshness, and workflow wiring.',
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
      branch === 'version/v33' || /^v33\/gate-(?:[4-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V33 Gate 4+ work must occur on version/v33 or v33/gate-4..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT,
    'packages/btd/src/chatgpt-app-action-contract.ts',
    'packages/btd/__tests__/chatgpt-app-action-contract.test.ts',
    'packages/external-apps/chatgpt/src/tools.ts',
    'packages/external-apps/chatgpt/src/__tests__/chatgpt-action-contract.test.ts',
    'packages/external-apps/chatgpt/src/__tests__/tools.test.ts',
    'scripts/generate-v33-chatgpt-app-action-contracts.mjs',
    'scripts/check-v33-gate4-chatgpt-app-action-contracts.mjs',
    'BITCODE_SPEC_V33.md',
    'BITCODE_SPEC_V33_DELTA.md',
    'BITCODE_SPEC_V33_NOTES.md',
    'BITCODE_SPEC_V33_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    'packages/specifying/src/canonical/v21-specifying.js',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V33 Gate 4 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', ['run', 'check:v33-chatgpt-app-action-contracts']);
      const artifact = JSON.parse(read(root, ARTIFACT));
      const expected = buildV33ChatGptAppActionContractsArtifact();
      assertCheck(
        failures,
        stableStringify(artifact) === stableStringify(expected),
        'V33 Gate 4 artifact must be generated from the current generator.',
      );
    } catch (error) {
      failures.push(`V33 Gate 4 artifact generation failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT) ? read(root, ARTIFACT) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V33 Gate 4 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v33-chatgpt-app-action-contracts', 'Gate 4 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v33.chatGptAppActionContracts.v1', 'Gate 4 schemaId must match.');
    assertCheck(failures, artifact.version === 'V33' && artifact.currentTarget === 'V32', 'Gate 4 artifact must bind V33 over active V32.');
    assertCheck(failures, artifact.passed === true, 'Gate 4 artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-chatgpt-app-action-contract-metadata',
      'Gate 4 artifact must be source-safe ChatGPT App metadata.',
    );
    assertCheck(failures, includesAll(artifact.requiredActionIds, REQUIRED_ACTION_IDS), 'Gate 4 artifact must enumerate all ChatGPT action ids.');
    assertCheck(failures, includesAll(artifact.requiredFlowObjects, REQUIRED_FLOW_OBJECTS), 'Gate 4 artifact must enumerate all Reading flow objects.');
    assertCheck(failures, includesAll(artifact.requiredDeniedStates, REQUIRED_DENIED_STATES), 'Gate 4 artifact must enumerate denied states.');
    assertCheck(failures, includesAll(artifact.requiredProofRootFields, REQUIRED_PROOF_ROOT_FIELDS), 'Gate 4 artifact must enumerate proof-root fields.');
    assertCheck(failures, artifact.coverage.deniedStateCoverage === true, 'Gate 4 denied-state coverage must pass.');
    assertCheck(failures, artifact.coverage.proofRootCoverage === true, 'Gate 4 proof-root coverage must pass.');
    assertCheck(failures, artifact.coverage.sourceSafeRendererCoverage === true, 'Gate 4 source-safe renderer coverage must pass.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Gate 4 must keep locked contents invisible.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Gate 4 artifact must not serialize credentials.');
    assertCheck(
      failures,
      artifact.contracts.every((contract) =>
        contract.requiredPermissions.includes('chatgpt.reading.invoke') &&
        contract.deniedStates.includes('SCHEMA_VALIDATION_FAILED') &&
        contract.sourceSafeRendererId.startsWith('chatgpt.sourceSafeRenderer.'),
      ),
      'Gate 4 contracts must require chatgpt.reading.invoke, schema denials, and source-safe renderers.',
    );
    assertCheck(
      failures,
      artifact.sourceEvidence.every((entry) => entry.requiredTokens.every((token) => token.present === true)),
      'Gate 4 source evidence tokens must all be present.',
    );
    assertCheck(
      failures,
      artifact.testEvidence.every((entry) => entry.requiredTokens.every((token) => token.present === true)),
      'Gate 4 test evidence tokens must all be present.',
    );
  }

  const spec = read(root, 'BITCODE_SPEC_V33.md');
  const delta = read(root, 'BITCODE_SPEC_V33_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V33_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V33_PARITY_MATRIX.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');
  const packageJson = read(root, 'package.json');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const btdSource = read(root, 'packages/btd/src/chatgpt-app-action-contract.ts');
  const chatgptSource = read(root, 'packages/external-apps/chatgpt/src/tools.ts');
  const btdTest = read(root, 'packages/btd/__tests__/chatgpt-app-action-contract.test.ts');
  const chatgptTest = read(root, 'packages/external-apps/chatgpt/src/__tests__/chatgpt-action-contract.test.ts');
  const specifying = read(root, 'packages/specifying/src/canonical/v21-specifying.js');

  for (const doc of [spec, delta, notes, parity]) {
    assertCheck(failures, doc.includes(ARTIFACT), `V33 docs must mention ${ARTIFACT}.`);
    assertCheck(failures, doc.includes('ChatGptAppActionContract'), 'V33 docs must name ChatGptAppActionContract.');
    assertCheck(failures, doc.includes('bitcode_request_finding_fits'), 'V33 docs must name the Finding Fits ChatGPT action.');
    assertCheck(failures, doc.includes('READ_LICENSE_REQUIRED'), 'V33 docs must name read-license denial.');
  }

  assertCheck(
    failures,
    /Current working gate: V33 Gate (?:[4-9]|10)\b/u.test(roadmap),
    'Roadmap must track V33 Gate 4 or later as the current working gate.',
  );
  assertCheck(failures, packageJson.includes('"generate:v33-chatgpt-app-action-contracts"'), 'package.json must expose the Gate 4 generator.');
  assertCheck(failures, packageJson.includes('"check:v33-chatgpt-app-action-contracts"'), 'package.json must expose the Gate 4 artifact check.');
  assertCheck(failures, packageJson.includes('"check:v33-gate4"'), 'package.json must expose check:v33-gate4.');
  assertCheck(failures, workflow.includes('check-v33-gate4-chatgpt-app-action-contracts.mjs'), 'Gate workflow must run the V33 Gate 4 checker.');
  assertCheck(failures, workflow.includes('chatgpt-action-contract.test.ts'), 'Gate workflow must run ChatGPT action contract tests.');
  assertCheck(failures, specifying.includes(ARTIFACT), 'Spec-family profile must include the Gate 4 artifact path.');

  for (const phrase of [
    'buildBtdChatGptAppActionContractRegistry',
    'renderBtdChatGptAppSourceSafeResponse',
    'bitcode_request_finding_fits',
    'bitcode_deliver_asset_pack',
    'READ_LICENSE_REQUIRED',
  ]) {
    assertCheck(failures, btdSource.includes(phrase), `Gate 4 BTD source must include ${phrase}.`);
  }
  for (const phrase of [
    'buildBtdChatGptAppActionContractRegistry',
    'renderBtdChatGptAppSourceSafeResponse',
    'getChatGptReadingActionTools',
    'source-safe-action',
  ]) {
    assertCheck(failures, chatgptSource.includes(phrase), `Gate 4 ChatGPT source must include ${phrase}.`);
  }
  for (const phrase of [
    'publishes package-owned contracts for the full Reading action sequence',
    'renders source-safe accepted responses with proof-root projection',
    'renders readable denied responses with repair actions',
  ]) {
    assertCheck(failures, btdTest.includes(phrase), `Gate 4 BTD test must assert: ${phrase}.`);
  }
  for (const phrase of [
    'registers every package-owned Reading action contract as a ChatGPT App tool',
    'requires schema-valid arguments before executing package-owned actions',
    'renders denied states with readable repair actions for ChatGPT App responses',
  ]) {
    assertCheck(failures, chatgptTest.includes(phrase), `Gate 4 ChatGPT test must assert: ${phrase}.`);
  }

  if (failures.length) {
    process.stderr.write('V33 Gate 4 ChatGPT App action contract check failed:\n');
    for (const failure of failures) {
      process.stderr.write(`- ${failure}\n`);
    }
    process.exit(1);
  }

  process.stdout.write(`V33 Gate 4 ChatGPT App action contracts ok artifact=${ARTIFACT}\n`);
}

function stableStringify(value) {
  return JSON.stringify(sortJson(value));
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

main();
