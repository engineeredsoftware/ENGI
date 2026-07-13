#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v36-exchange-intent-order-contracts.json';

const REQUIRED_ACTION_KINDS = ['buy', 'sell', 'bid', 'ask', 'cancel', 'accept', 'settle', 'history'];
const REQUIRED_TRANSITION_IDS = [
  'exchange.order.transition.buy.requested',
  'exchange.order.transition.sell.requested',
  'exchange.order.transition.bid.opened',
  'exchange.order.transition.ask.opened',
  'exchange.order.transition.cancel.requested',
  'exchange.order.transition.accept.requested',
  'exchange.order.transition.settle.requested',
  'exchange.order.transition.history.reviewed',
];
const REQUIRED_INTENT_FIELDS = [
  'intentId',
  'actionKind',
  'actorPrincipal',
  'organizationRole',
  'walletPosture',
  'authorityProof',
  'idempotencyKey',
  'policyDecision',
  'targetOrder',
  'targetBtdRange',
  'sourceSafePreview',
  'failClosedResult',
];
const REQUIRED_ORDER_FIELDS = [
  'orderId',
  'orderKind',
  'assetPackId',
  'btdRangeId',
  'rightsScope',
  'currentOwnerPrincipal',
  'orderState',
  'transitionId',
  'historyRoot',
  'ledgerJournalRef',
  'databaseProjectionRef',
  'repairPosture',
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
      'Usage: node scripts/check-v36-gate3-exchange-intent-order-contracts.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V36 Gate 3 ExchangeIntent and ExchangeOrder source, generated artifact, tests, docs, package scripts, and workflow wiring.',
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
      branch === 'version/v36' || /^v36\/gate-(?:[3-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V36 Gate 3+ work must occur on version/v36 or v36/gate-3..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'packages/specifying/src/canonical/exchange-intent-order-contracts.js',
    'packages/specifying/src/index.js',
    'packages/specifying/src/index.d.ts',
    'packages/specifying/test/v36-exchange-intent-order-contracts.test.js',
    'scripts/generate-v36-exchange-intent-order-contracts.mjs',
    'scripts/check-v36-gate3-exchange-intent-order-contracts.mjs',
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
    assertCheck(failures, fileExists(root, relativePath), `Missing V36 Gate 3 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v36-exchange-intent-order-contracts.mjs', '--check']);
    } catch (error) {
      failures.push(`V36 Exchange intent/order artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['--test', '--test-force-exit', 'packages/specifying/test/v36-exchange-intent-order-contracts.test.js']);
    } catch (error) {
      failures.push(`V36 Exchange intent/order package test failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V36 Exchange intent/order contracts must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v36-exchange-intent-order-contracts', 'Exchange intent/order artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v36.exchangeIntentOrderContracts.v1', 'Exchange intent/order schemaId must match.');
    assertCheck(failures, artifact.version === 'V36' && artifact.currentTarget === 'V35', 'Exchange intent/order contracts must bind V36 over active V35.');
    assertCheck(failures, artifact.passed === true, 'Exchange intent/order contracts must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-exchange-intent-order-contract-metadata',
      'Exchange intent/order contracts must be source-safe Exchange metadata.',
    );
    assertCheck(failures, includesAll(artifact.requiredActionKinds, REQUIRED_ACTION_KINDS), 'Exchange intent/order contracts must enumerate every action kind.');
    assertCheck(failures, includesAll(artifact.coverage.observedActionKinds, REQUIRED_ACTION_KINDS), 'Exchange intent/order coverage must observe every action kind.');
    assertCheck(failures, includesAll(artifact.requiredTransitionIds, REQUIRED_TRANSITION_IDS), 'Exchange intent/order contracts must enumerate every transition id.');
    assertCheck(failures, includesAll(artifact.coverage.observedTransitionIds, REQUIRED_TRANSITION_IDS), 'Exchange intent/order coverage must observe every transition id.');
    assertCheck(failures, includesAll(artifact.requiredIntentFieldIds, REQUIRED_INTENT_FIELDS), 'ExchangeIntent required fields must be explicit.');
    assertCheck(failures, includesAll(artifact.requiredOrderFieldIds, REQUIRED_ORDER_FIELDS), 'ExchangeOrder required fields must be explicit.');
    assertCheck(failures, artifact.coverage.transitionCount === REQUIRED_ACTION_KINDS.length, 'Exchange intent/order contracts must prove eight transitions.');
    assertCheck(failures, artifact.coverage.exchangeIntentContractCovered === true, 'ExchangeIntent must be covered by every row.');
    assertCheck(failures, artifact.coverage.exchangeOrderContractCovered === true, 'ExchangeOrder must be covered by every row.');
    assertCheck(failures, artifact.coverage.actorOrganizationRoleWalletPostureCovered === true, 'Each transition must name actor, organization role, and wallet posture.');
    assertCheck(failures, artifact.coverage.authorityProofsCovered === true, 'Each transition must name authority proof.');
    assertCheck(failures, artifact.coverage.idempotencyKeysCovered === true, 'Each transition must name idempotency key.');
    assertCheck(failures, artifact.coverage.policyDecisionsCovered === true, 'Each transition must name policy decision.');
    assertCheck(failures, artifact.coverage.failClosedResultsCovered === true, 'Each transition must name fail-closed result.');
    assertCheck(failures, artifact.coverage.proofRootsCovered === true, 'Exchange intent/order rows must include proof roots.');
    assertCheck(failures, artifact.coverage.eventIdsCovered === true, 'Exchange intent/order rows must include event ids.');
    assertCheck(
      failures,
      artifact.coverage.orderHistoryReplayableWithoutPrivateWalletMaterialOrSecrets === true,
      'Order history must be replayable without private wallet material or secrets.',
    );
    assertCheck(
      failures,
      artifact.coverage.ledgerDatabaseProjectionRefsCovered === true,
      'Exchange intent/order rows must include ledger/database projection refs.',
    );
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Exchange intent/order contracts must not serialize credentials.');
    assertCheck(failures, artifact.coverage.privateWalletMaterialSerialized === false, 'Exchange intent/order contracts must not serialize private wallet material.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Exchange intent/order contracts must not expose protected source.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Exchange intent/order contracts must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.legacySourceRoots === false, 'Exchange intent/order contracts must not point at _legacy source roots.');
    assertCheck(
      failures,
      artifact.rows.every((row) => /^exchange-order-transition:[a-f0-9]{24}$/u.test(row.transitionRoot)),
      'Exchange order transitions must have deterministic transition roots.',
    );
    assertCheck(
      failures,
      artifact.rows.every((row) => /^exchange-intent:[a-f0-9]{24}$/u.test(row.intentRoot)),
      'Exchange intents must have deterministic intent roots.',
    );
    assertCheck(
      failures,
      artifact.rows.every((row) => /^exchange-order:[a-f0-9]{24}$/u.test(row.orderRoot)),
      'Exchange orders must have deterministic order roots.',
    );
    assertCheck(
      failures,
      artifact.sourceEvidence.every((entry) => entry.allSourceRootsPresent === true),
      'Exchange intent/order source evidence roots must all exist.',
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
  const source = read(root, 'packages/specifying/src/canonical/exchange-intent-order-contracts.js');
  const index = read(root, 'packages/specifying/src/index.js');
  const typeDefs = read(root, 'packages/specifying/src/index.d.ts');
  const test = read(root, 'packages/specifying/test/v36-exchange-intent-order-contracts.test.js');
  const specifying = read(root, 'packages/specifying/src/canonical/v21-specifying.js');

  for (const doc of [spec, delta, notes, parity]) {
    assertCheck(failures, doc.includes(ARTIFACT_PATH), `V36 docs must mention ${ARTIFACT_PATH}.`);
    assertCheck(failures, doc.includes('ExchangeIntent'), 'V36 docs must name ExchangeIntent.');
    assertCheck(failures, doc.includes('ExchangeOrder'), 'V36 docs must name ExchangeOrder.');
    assertCheck(failures, doc.includes('source-safe-exchange-intent-order-contract-metadata'), 'V36 docs must name Exchange intent/order source safety verdict.');
    assertCheck(failures, doc.includes('order history is replayable without private wallet material or secrets'), 'V36 docs must state source-safe order-history replay.');
  }

  assertCheck(failures, parity.includes('| Exchange intent and order contracts | Gate 3 |') && parity.includes('| closed |'), 'V36 parity must close the Gate 3 matrix row.');
  assertCheck(failures, parity.includes('## Gate 3 Parity') && parity.includes('closed'), 'V36 parity must mark Gate 3 closed.');
  assertCheck(
    failures,
    /Current working gate: V36 Gate (?:4|5|6|7|8|9|10)\b/u.test(roadmap),
    'Roadmap must advance past V36 Gate 3 after this gate closes.',
  );
  assertCheck(failures, roadmap.includes('V36 Gate 3 closure anchor'), 'Roadmap must include a V36 Gate 3 closure anchor.');
  assertCheck(failures, rootReadme.includes('ExchangeIntent') && rootReadme.includes('ExchangeOrder'), 'Root README must mention ExchangeIntent and ExchangeOrder.');
  assertCheck(failures, protocolReadme.includes('buildExchangeIntentOrderContracts'), 'Protocol README must mention buildExchangeIntentOrderContracts.');
  assertCheck(failures, exchangeReadme.includes('ExchangeIntent') && exchangeReadme.includes('ExchangeOrder'), 'Exchange README must mention ExchangeIntent and ExchangeOrder.');
  assertCheck(failures, packageJson.includes('"generate:v36-exchange-intent-order-contracts"'), 'package.json must expose the Gate 3 generator.');
  assertCheck(failures, packageJson.includes('"check:v36-exchange-intent-order-contracts"'), 'package.json must expose the Gate 3 artifact check.');
  assertCheck(failures, packageJson.includes('"check:v36-gate3"'), 'package.json must expose check:v36-gate3.');
  assertCheck(failures, workflow.includes('check-v36-gate3-exchange-intent-order-contracts.mjs'), 'Gate workflow must run the V36 Gate 3 checker.');
  assertCheck(failures, workflow.includes('v36-exchange-intent-order-contracts.test.js'), 'Gate workflow must run the focused V36 Exchange intent/order test.');
  assertCheck(failures, canonWorkflow.includes('check-v36-gate3-exchange-intent-order-contracts.mjs'), 'Canon workflow must run the V36 Gate 3 checker when V36 is present.');
  assertCheck(failures, specifying.includes(ARTIFACT_PATH), 'Spec-family profile must include the Exchange intent/order artifact path.');

  for (const phrase of [
    'buildExchangeIntentOrderContracts',
    'EXCHANGE_INTENT_ACTION_KINDS',
    'EXCHANGE_ORDER_TRANSITION_IDS',
    'EXCHANGE_INTENT_ORDER_ROWS',
    'ExchangeIntent',
    'ExchangeOrder',
    'authorityProof',
    'idempotencyKey',
    'policyDecision',
    'failClosedResult',
    'order_history_replayable_without_private_wallet_material_or_secrets',
  ]) {
    assertCheck(failures, source.includes(phrase), `Gate 3 source must include ${phrase}.`);
  }

  for (const actionKind of REQUIRED_ACTION_KINDS) {
    assertCheck(failures, source.includes(`'${actionKind}'`), `Gate 3 source must include action kind ${actionKind}.`);
  }

  for (const phrase of ['buildExchangeIntentOrderContracts', 'EXCHANGE_INTENT_ACTION_KINDS', 'cancel', 'accept', 'settle', 'history']) {
    assertCheck(failures, test.includes(phrase), `Gate 3 test must include ${phrase}.`);
  }

  assertCheck(failures, index.includes('buildExchangeIntentOrderContracts'), 'Protocol index must export buildExchangeIntentOrderContracts.');
  assertCheck(failures, typeDefs.includes('buildExchangeIntentOrderContracts'), 'Protocol type declarations must export buildExchangeIntentOrderContracts.');

  if (failures.length > 0) {
    process.stderr.write('V36 Gate 3 Exchange intent/order contracts check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V36 Gate 3 Exchange intent/order contracts ok transitions=${artifact?.rows.length || 0}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
}
