#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v36-exchange-rights-transfer-review.json';
const REQUIRED_PREVIEW_STATES = ['owner_read', 'licensed_read', 'blocked_transfer'];
const REQUIRED_FIELD_IDS = [
  'previewId',
  'previewState',
  'assetPackId',
  'btdRangeIdentity',
  'currentOwnerPrincipal',
  'requestedBuyerPrincipal',
  'rightsScope',
  'settlementUnlockCondition',
  'disclosureLimit',
  'sourceVisibility',
  'authorityPosture',
  'proofRoots',
  'ledgerDatabaseProjectionRefs',
  'failClosedConditions',
];
const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
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
      'Usage: node scripts/check-v36-gate4-exchange-rights-transfer-review.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V36 Gate 4 ExchangeRightsTransferPreview source, generated artifact, tests, docs, package scripts, and workflow wiring.',
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
    pointer === 'V35',
    `BITCODE_SPEC.txt must remain V35 during V36 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v36' || /^v36\/gate-(?:[4-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V36 Gate 4+ work must occur on version/v36 or v36/gate-4..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'packages/specifying/src/canonical/exchange-rights-transfer-review.js',
    'packages/specifying/src/index.js',
    'packages/specifying/src/index.d.ts',
    'packages/specifying/test/v36-exchange-rights-transfer-review.test.js',
    'scripts/generate-v36-exchange-rights-transfer-review.mjs',
    'scripts/check-v36-gate4-exchange-rights-transfer-review.mjs',
    'packages/specifying/src/canonical/v21-specifying.js',
    'BITCODE_SPEC_V36.md',
    'BITCODE_SPEC_V36_DELTA.md',
    'BITCODE_SPEC_V36_NOTES.md',
    'BITCODE_SPEC_V36_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'packages/specifying/README.md',
    'uapi/app/exchange/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V36 Gate 4 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v36-exchange-rights-transfer-review.mjs', '--check']);
    } catch (error) {
      failures.push(`V36 Exchange rights-transfer review artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['--test', '--test-force-exit', 'packages/specifying/test/v36-exchange-rights-transfer-review.test.js']);
    } catch (error) {
      failures.push(`V36 Exchange rights-transfer review package test failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V36 Exchange rights-transfer review must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v36-exchange-rights-transfer-review', 'Exchange rights-transfer artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v36.exchangeRightsTransferReview.v1', 'Exchange rights-transfer schemaId must match.');
    assertCheck(failures, artifact.version === 'V36' && artifact.currentTarget === 'V35', 'Exchange rights-transfer review must bind V36 over active V35.');
    assertCheck(failures, artifact.passed === true, 'Exchange rights-transfer review must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-exchange-rights-transfer-review-metadata',
      'Exchange rights-transfer review must be source-safe Exchange metadata.',
    );
    assertCheck(failures, includesAll(artifact.requiredPreviewStates, REQUIRED_PREVIEW_STATES), 'Exchange rights-transfer review must enumerate every preview state.');
    assertCheck(failures, includesAll(artifact.coverage.observedPreviewStates, REQUIRED_PREVIEW_STATES), 'Exchange rights-transfer coverage must observe every preview state.');
    assertCheck(failures, includesAll(artifact.requiredFieldIds, REQUIRED_FIELD_IDS), 'ExchangeRightsTransferPreview required fields must be explicit.');
    assertCheck(failures, artifact.coverage.previewCount === REQUIRED_PREVIEW_STATES.length, 'Exchange rights-transfer review must prove three preview states.');
    assertCheck(failures, artifact.coverage.ownerReadRepresented === true, 'Owner-read preview must be represented.');
    assertCheck(failures, artifact.coverage.licensedReadRepresented === true, 'Licensed-read preview must be represented.');
    assertCheck(failures, artifact.coverage.blockedTransferRepresented === true, 'Blocked transfer preview must be represented.');
    assertCheck(failures, artifact.coverage.btdRangeIdentityCovered === true, 'BTD range identity, current owner, buyer, and rights scope must be covered.');
    assertCheck(failures, artifact.coverage.settlementUnlockConditionsCovered === true, 'Settlement unlock conditions must be covered.');
    assertCheck(failures, artifact.coverage.disclosureLimitsCovered === true, 'Disclosure limits must be covered.');
    assertCheck(
      failures,
      artifact.coverage.assetPackSourceHiddenUntilPaidSettlementAndRightsTransferComplete === true,
      'AssetPack source must stay hidden until paid settlement and rights transfer complete.',
    );
    assertCheck(failures, artifact.coverage.proofRootsCovered === true, 'Exchange rights-transfer rows must include proof roots.');
    assertCheck(failures, artifact.coverage.eventIdsCovered === true, 'Exchange rights-transfer rows must include event ids.');
    assertCheck(failures, artifact.coverage.ledgerDatabaseProjectionRefsCovered === true, 'Exchange rights-transfer rows must include ledger/database projection refs.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Exchange rights-transfer review must not serialize credentials.');
    assertCheck(failures, artifact.coverage.privateWalletMaterialSerialized === false, 'Exchange rights-transfer review must not serialize private wallet material.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Exchange rights-transfer review must not expose protected source.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Exchange rights-transfer review must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.legacySourceRoots === false, 'Exchange rights-transfer review must not point at _legacy source roots.');
    assertCheck(
      failures,
      artifact.rows.every((row) => /^exchange-rights-transfer-preview:[a-f0-9]{24}$/u.test(row.previewRoot)),
      'Exchange rights-transfer previews must have deterministic preview roots.',
    );
    assertCheck(
      failures,
      artifact.sourceEvidence.every((entry) => entry.allSourceRootsPresent === true),
      'Exchange rights-transfer source evidence roots must all exist.',
    );
  }

  const spec = read(root, 'BITCODE_SPEC_V36.md');
  const delta = read(root, 'BITCODE_SPEC_V36_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V36_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V36_PARITY_MATRIX.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');
  const rootReadme = read(root, 'README.md');
  const protocolReadme = read(root, 'packages/specifying/README.md');
  const exchangeReadme = read(root, 'uapi/app/exchange/README.md');
  const packageJson = read(root, 'package.json');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  const source = read(root, 'packages/specifying/src/canonical/exchange-rights-transfer-review.js');
  const index = read(root, 'packages/specifying/src/index.js');
  const typeDefs = read(root, 'packages/specifying/src/index.d.ts');
  const test = read(root, 'packages/specifying/test/v36-exchange-rights-transfer-review.test.js');
  const specifying = read(root, 'packages/specifying/src/canonical/v21-specifying.js');

  for (const doc of [spec, delta, notes, parity]) {
    assertCheck(failures, doc.includes(ARTIFACT_PATH), `V36 docs must mention ${ARTIFACT_PATH}.`);
    assertCheck(failures, doc.includes('ExchangeRightsTransferPreview'), 'V36 docs must name ExchangeRightsTransferPreview.');
    assertCheck(failures, doc.includes('source-safe-exchange-rights-transfer-review-metadata'), 'V36 docs must name Exchange rights-transfer source safety verdict.');
    assertCheck(failures, doc.includes('AssetPack source is hidden until paid settlement and rights transfer are complete'), 'V36 docs must state rights-transfer source-disclosure boundary.');
    assertCheck(failures, doc.includes('owner-read, licensed-read, and blocked transfer'), 'V36 docs must state preview state distinctions.');
  }

  assertCheck(failures, parity.includes('| Rights-transfer review | Gate 4 |') && parity.includes('| closed |'), 'V36 parity must close the Gate 4 matrix row.');
  assertCheck(failures, parity.includes('## Gate 4 Parity') && parity.includes('closed'), 'V36 parity must mark Gate 4 closed.');
  assertCheck(
    failures,
    /Current working gate: V36 Gate (?:5|6|7|8|9|10)\b/u.test(roadmap),
    'Roadmap must advance past V36 Gate 4 after this gate closes.',
  );
  assertCheck(failures, roadmap.includes('V36 Gate 4 closure anchor'), 'Roadmap must include a V36 Gate 4 closure anchor.');
  assertCheck(failures, rootReadme.includes('ExchangeRightsTransferPreview'), 'Root README must mention ExchangeRightsTransferPreview.');
  assertCheck(failures, protocolReadme.includes('buildExchangeRightsTransferReview'), 'Protocol README must mention buildExchangeRightsTransferReview.');
  assertCheck(failures, exchangeReadme.includes('ExchangeRightsTransferPreview'), 'Exchange README must mention ExchangeRightsTransferPreview.');
  assertCheck(failures, packageJson.includes('"generate:v36-exchange-rights-transfer-review"'), 'package.json must expose the Gate 4 generator.');
  assertCheck(failures, packageJson.includes('"check:v36-exchange-rights-transfer-review"'), 'package.json must expose the Gate 4 artifact check.');
  assertCheck(failures, packageJson.includes('"check:v36-gate4"'), 'package.json must expose check:v36-gate4.');
  assertCheck(failures, workflow.includes('check-v36-gate4-exchange-rights-transfer-review.mjs'), 'Gate workflow must run the V36 Gate 4 checker.');
  assertCheck(failures, workflow.includes('v36-exchange-rights-transfer-review.test.js'), 'Gate workflow must run the focused V36 Exchange rights-transfer test.');
  assertCheck(failures, canonWorkflow.includes('check-v36-gate4-exchange-rights-transfer-review.mjs'), 'Canon workflow must run the V36 Gate 4 checker when V36 is present.');
  assertCheck(failures, specifying.includes(ARTIFACT_PATH), 'Spec-family profile must include the Exchange rights-transfer artifact path.');

  for (const phrase of [
    'buildExchangeRightsTransferReview',
    'ExchangeRightsTransferPreview',
    'EXCHANGE_RIGHTS_TRANSFER_PREVIEW_STATES',
    'EXCHANGE_RIGHTS_TRANSFER_PREVIEW_ROWS',
    'owner_read',
    'licensed_read',
    'blocked_transfer',
    'assetpack_source_hidden_until_paid_settlement_and_rights_transfer_complete',
  ]) {
    assertCheck(failures, source.includes(phrase), `Gate 4 source must include ${phrase}.`);
  }

  for (const phrase of ['buildExchangeRightsTransferReview', 'owner_read', 'licensed_read', 'blocked_transfer']) {
    assertCheck(failures, test.includes(phrase), `Gate 4 test must include ${phrase}.`);
  }

  assertCheck(failures, index.includes('buildExchangeRightsTransferReview'), 'Protocol index must export buildExchangeRightsTransferReview.');
  assertCheck(failures, typeDefs.includes('buildExchangeRightsTransferReview'), 'Protocol type declarations must export buildExchangeRightsTransferReview.');

  if (failures.length > 0) {
    process.stderr.write('V36 Gate 4 Exchange rights-transfer review check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V36 Gate 4 Exchange rights-transfer review ok previews=${artifact?.rows.length || 0}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
}
