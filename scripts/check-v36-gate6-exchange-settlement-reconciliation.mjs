#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v36-exchange-settlement-reconciliation.json';
const REQUIRED_RECEIPT_STATES = [
  'payment_observed_pending_finality',
  'finalized_rights_transferred',
  'database_projection_repaired',
  'object_storage_repaired',
  'delivery_blocked_pending_repair',
];
const REQUIRED_FIELD_IDS = [
  'settlementReceiptId',
  'paymentObservation',
  'finalityState',
  'rightsTransferReceipt',
  'ledgerRoot',
  'databaseProjectionRoot',
  'objectStorageRoot',
  'deliveryState',
  'repairId',
  'observerJobs',
  'reconciliationDecision',
  'proofRoots',
  'eventIds',
];
const REQUIRED_DOC_PHRASES = [
  'payment observation, finality state, rights transfer receipt, ledger root, database projection root, object storage root, delivery state, and repair id',
  'observers and repair jobs reconcile database projections to ledger truth',
  'settlement finality and delivery are auditable',
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
    else if (arg === '--repair-id') index += 1;
    else throw new Error(`Unknown argument ${arg}`);
  }

  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v36-gate6-exchange-settlement-reconciliation.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V36 Gate 6 ExchangeSettlementReceipt source, generated artifact, tests, docs, package scripts, and workflow wiring.',
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
    pointer === 'V35',
    `BITCODE_SPEC.txt must remain V35 during V36 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v36' || /^v36\/gate-(?:[6-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V36 Gate 6+ work must occur on version/v36 or v36/gate-6..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'scripts/specifying/src/canonical/exchange-settlement-reconciliation.js',
    'scripts/specifying/src/index.js',
    'scripts/specifying/src/index.d.ts',
    'scripts/specifying/test/v36-exchange-settlement-reconciliation.test.js',
    'scripts/generate-v36-exchange-settlement-reconciliation.mjs',
    'scripts/check-v36-gate6-exchange-settlement-reconciliation.mjs',
    'specifications/BITCODE_SPEC_V36.md',
    'specifications/BITCODE_SPEC_V36_DELTA.md',
    'specifications/BITCODE_SPEC_V36_NOTES.md',
    'specifications/BITCODE_SPEC_V36_PARITY_MATRIX.md',
    'specifications/SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'scripts/specifying/README.md',
    'apps/uapi/app/exchange/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V36 Gate 6 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v36-exchange-settlement-reconciliation.mjs', '--check']);
    } catch (error) {
      failures.push(`V36 Exchange settlement reconciliation artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['--test', '--test-force-exit', 'scripts/specifying/test/v36-exchange-settlement-reconciliation.test.js']);
    } catch (error) {
      failures.push(`V36 Exchange settlement reconciliation package test failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V36 Exchange settlement reconciliation must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v36-exchange-settlement-reconciliation', 'Exchange settlement artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v36.exchangeSettlementReconciliation.v1', 'Exchange settlement schemaId must match.');
    assertCheck(failures, artifact.version === 'V36' && artifact.currentTarget === 'V35', 'Exchange settlement reconciliation must bind V36 over active V35.');
    assertCheck(failures, artifact.passed === true, 'Exchange settlement reconciliation must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-exchange-settlement-reconciliation-metadata',
      'Exchange settlement reconciliation must be source-safe Exchange metadata.',
    );
    assertCheck(failures, includesAll(artifact.requiredReceiptStates, REQUIRED_RECEIPT_STATES), 'Exchange settlement receipt states must be explicit.');
    assertCheck(failures, includesAll(artifact.coverage.observedReceiptStates, REQUIRED_RECEIPT_STATES), 'Exchange settlement coverage must observe every receipt state.');
    assertCheck(failures, includesAll(artifact.requiredFieldIds, REQUIRED_FIELD_IDS), 'ExchangeSettlementReceipt required fields must be explicit.');
    assertCheck(failures, artifact.coverage.paymentObservationCovered === true, 'Payment observation must be covered.');
    assertCheck(failures, artifact.coverage.finalityStateCovered === true, 'Finality state must be covered.');
    assertCheck(failures, artifact.coverage.rightsTransferReceiptCovered === true, 'Rights transfer receipt must be covered.');
    assertCheck(failures, artifact.coverage.ledgerDatabaseObjectStorageRootsCovered === true, 'Ledger/database/object storage roots must be covered.');
    assertCheck(failures, artifact.coverage.deliveryStateCovered === true, 'Delivery state must be covered.');
    assertCheck(failures, artifact.coverage.repairIdCovered === true, 'Repair id must be covered.');
    assertCheck(failures, artifact.coverage.observersRepairJobsCovered === true, 'Observers and repair jobs must be covered.');
    assertCheck(failures, artifact.coverage.databaseProjectionsReconcileToLedgerTruth === true, 'Database projections must reconcile to ledger truth.');
    assertCheck(failures, artifact.coverage.settlementFinalityAuditable === true, 'Settlement finality must be auditable.');
    assertCheck(failures, artifact.coverage.deliveryAuditable === true, 'Delivery must be auditable.');
    assertCheck(failures, artifact.coverage.proofRootsCovered === true, 'Exchange settlement rows must include proof roots.');
    assertCheck(failures, artifact.coverage.eventIdsCovered === true, 'Exchange settlement rows must include event ids.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Exchange settlement reconciliation must not serialize credentials.');
    assertCheck(failures, artifact.coverage.privateWalletMaterialSerialized === false, 'Exchange settlement reconciliation must not serialize private wallet material.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Exchange settlement reconciliation must not expose protected source.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Exchange settlement reconciliation must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.legacySourceRoots === false, 'Exchange settlement reconciliation must not point at _legacy source roots.');
    assertCheck(
      failures,
      artifact.rows.every((row) => /^exchange-settlement-receipt:[a-f0-9]{24}$/u.test(row.settlementReceiptRoot)),
      'Exchange settlement receipts must have deterministic receipt roots.',
    );
    assertCheck(
      failures,
      artifact.sourceEvidence.every((entry) => entry.allSourceRootsPresent === true),
      'Exchange settlement source evidence roots must all exist.',
    );
  }

  const docs = [
    read(root, 'specifications/BITCODE_SPEC_V36.md'),
    read(root, 'specifications/BITCODE_SPEC_V36_DELTA.md'),
    read(root, 'specifications/BITCODE_SPEC_V36_NOTES.md'),
    read(root, 'specifications/BITCODE_SPEC_V36_PARITY_MATRIX.md'),
  ];
  const roadmap = read(root, 'specifications/SPECIFICATIONS_ROADMAP.md');
  const rootReadme = read(root, 'README.md');
  const protocolReadme = read(root, 'scripts/specifying/README.md');
  const exchangeReadme = read(root, 'apps/uapi/app/exchange/README.md');
  const packageJson = read(root, 'package.json');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  const source = read(root, 'scripts/specifying/src/canonical/exchange-settlement-reconciliation.js');
  const index = read(root, 'scripts/specifying/src/index.js');
  const typeDefs = read(root, 'scripts/specifying/src/index.d.ts');
  const test = read(root, 'scripts/specifying/test/v36-exchange-settlement-reconciliation.test.js');

  for (const doc of docs) {
    assertCheck(failures, doc.includes(ARTIFACT_PATH), `V36 docs must mention ${ARTIFACT_PATH}.`);
    assertCheck(failures, doc.includes('ExchangeSettlementReceipt'), 'V36 docs must name ExchangeSettlementReceipt.');
    assertCheck(failures, doc.includes('source-safe-exchange-settlement-reconciliation-metadata'), 'V36 docs must name Exchange settlement source safety verdict.');
    for (const phrase of REQUIRED_DOC_PHRASES) {
      assertCheck(failures, doc.includes(phrase), `V36 docs must state: ${phrase}.`);
    }
  }

  for (const doc of [rootReadme, protocolReadme, exchangeReadme]) {
    assertCheck(failures, doc.includes('ExchangeSettlementReceipt'), 'README docs must mention ExchangeSettlementReceipt.');
    assertCheck(failures, doc.includes('source-safe-exchange-settlement-reconciliation-metadata'), 'README docs must mention source-safe Exchange settlement metadata.');
    for (const phrase of REQUIRED_DOC_PHRASES) {
      assertCheck(failures, doc.includes(phrase), `README docs must state: ${phrase}.`);
    }
  }

  assertCheck(failures, docs[3].includes('| Settlement reconciliation | Gate 6 |') && docs[3].includes('| closed |'), 'V36 parity must close the Gate 6 matrix row.');
  assertCheck(failures, docs[3].includes('## Gate 6 Parity') && docs[3].includes('closed'), 'V36 parity must mark Gate 6 closed.');
  assertCheck(
    failures,
    /Current working gate: V36 Gate (?:7|8|9|10)\b/u.test(roadmap),
    'Roadmap must advance current working gate to V36 Gate 7 or later.',
  );
  assertCheck(failures, roadmap.includes('V36 Gate 6 closure anchor'), 'Roadmap must include V36 Gate 6 closure anchor.');
  assertCheck(failures, source.includes('EXCHANGE_SETTLEMENT_RECONCILIATION_SOURCE_SAFETY_VERDICT'), 'Settlement source must export source-safety verdict.');
  assertCheck(failures, source.includes('database_projection_reconciles_to_ledger_truth'), 'Settlement source must encode projection reconciliation.');
  assertCheck(failures, source.includes('settlement finality and delivery are auditable'), 'Settlement source must encode auditable finality and delivery.');
  assertCheck(failures, index.includes('buildExchangeSettlementReconciliation'), 'Package index must export buildExchangeSettlementReconciliation.');
  assertCheck(failures, typeDefs.includes('buildExchangeSettlementReconciliation'), 'Package type definitions must export buildExchangeSettlementReconciliation.');
  assertCheck(failures, test.includes('reconciles projections to ledger truth and audits delivery finality'), 'Settlement package test must cover reconciliation and auditability.');
  assertCheck(failures, packageJson.includes('"generate:v36-exchange-settlement-reconciliation"'), 'package.json must include settlement generator script.');
  assertCheck(failures, packageJson.includes('"check:v36-exchange-settlement-reconciliation"'), 'package.json must include settlement artifact check script.');
  assertCheck(failures, packageJson.includes('"check:v36-gate6"'), 'package.json must include check:v36-gate6.');
  assertCheck(failures, workflow.includes('check-v36-gate6-exchange-settlement-reconciliation.mjs'), 'Gate workflow must run Gate 6 checker.');
  assertCheck(failures, workflow.includes('test/v36-exchange-settlement-reconciliation.test.js'), 'Gate workflow must run Gate 6 package test.');
  assertCheck(failures, canonWorkflow.includes('check-v36-gate6-exchange-settlement-reconciliation.mjs'), 'Canon workflow must run Gate 6 checker when present.');

  if (failures.length > 0) {
    process.stderr.write(`V36 Gate 6 Exchange settlement reconciliation check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V36 Gate 6 Exchange settlement reconciliation check passed.\n');
}

main();
