#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v36-exchange-activity-book.json';

const REQUIRED_ACTIVITY_KINDS = [
  'listing',
  'bid',
  'ask',
  'cancellation',
  'acceptance',
  'settlement',
  'repair',
  'revenue_route',
  'history_entry',
];

const REQUIRED_FILTER_IDS = [
  'activity_kind',
  'activity_state',
  'asset_pack_id',
  'btd_range_id',
  'principal_id',
  'settlement_state',
  'repair_state',
  'source_safety_class',
  'event_id',
];

const REQUIRED_DETAIL_SECTION_IDS = [
  'source_safe_summary',
  'range_and_assetpack',
  'principal_posture',
  'ledger_database_projection',
  'proof_roots',
  'telemetry_events',
  'redaction_posture',
  'repair_and_revenue_posture',
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
      'Usage: node scripts/check-v36-gate2-exchange-activity-book-market-master-detail.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V36 Gate 2 ExchangeActivityBook source, generated artifact, tests, specs, docs, package scripts, and workflow wiring.',
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
      branch === 'version/v36' || /^v36\/gate-(?:[2-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V36 Gate 2+ work must occur on version/v36 or v36/gate-2..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'packages/specifying/src/canonical/exchange-activity-book.js',
    'packages/specifying/src/index.js',
    'packages/specifying/src/index.d.ts',
    'packages/specifying/test/v36-exchange-activity-book.test.js',
    'scripts/generate-v36-exchange-activity-book.mjs',
    'scripts/check-v36-gate2-exchange-activity-book-market-master-detail.mjs',
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
    assertCheck(failures, fileExists(root, relativePath), `Missing V36 Gate 2 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v36-exchange-activity-book.mjs', '--check']);
    } catch (error) {
      failures.push(`V36 Exchange activity book artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['--test', '--test-force-exit', 'packages/specifying/test/v36-exchange-activity-book.test.js']);
    } catch (error) {
      failures.push(`V36 Exchange activity book package test failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V36 Exchange activity book must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v36-exchange-activity-book', 'Exchange activity book artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v36.exchangeActivityBook.v1', 'Exchange activity book schemaId must match.');
    assertCheck(failures, artifact.version === 'V36' && artifact.currentTarget === 'V35', 'Exchange activity book must bind V36 over active V35.');
    assertCheck(failures, artifact.passed === true, 'Exchange activity book must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-exchange-activity-book-metadata',
      'Exchange activity book must be source-safe Exchange market metadata.',
    );
    assertCheck(failures, includesAll(artifact.requiredActivityKinds, REQUIRED_ACTIVITY_KINDS), 'Exchange activity book must enumerate every activity kind.');
    assertCheck(failures, includesAll(artifact.coverage.observedActivityKinds, REQUIRED_ACTIVITY_KINDS), 'Exchange activity book coverage must observe every activity kind.');
    assertCheck(failures, includesAll(artifact.requiredFilterIds, REQUIRED_FILTER_IDS), 'Exchange activity book must enumerate every filter id.');
    assertCheck(
      failures,
      includesAll(artifact.requiredDetailSectionIds, REQUIRED_DETAIL_SECTION_IDS),
      'Exchange activity book must enumerate every detail section id.',
    );
    assertCheck(failures, artifact.coverage.activityRowCount === REQUIRED_ACTIVITY_KINDS.length, 'Exchange activity book must prove nine activity rows.');
    assertCheck(failures, artifact.coverage.listingRowsRepresented === true, 'Exchange activity book must represent listing rows.');
    assertCheck(failures, artifact.coverage.bidRowsRepresented === true, 'Exchange activity book must represent bid rows.');
    assertCheck(failures, artifact.coverage.askRowsRepresented === true, 'Exchange activity book must represent ask rows.');
    assertCheck(failures, artifact.coverage.cancellationRowsRepresented === true, 'Exchange activity book must represent cancellation rows.');
    assertCheck(failures, artifact.coverage.acceptanceRowsRepresented === true, 'Exchange activity book must represent acceptance rows.');
    assertCheck(failures, artifact.coverage.settlementRowsRepresented === true, 'Exchange activity book must represent settlement rows.');
    assertCheck(failures, artifact.coverage.repairRowsRepresented === true, 'Exchange activity book must represent repair rows.');
    assertCheck(failures, artifact.coverage.revenueRouteRowsRepresented === true, 'Exchange activity book must represent revenue route rows.');
    assertCheck(failures, artifact.coverage.historyRowsRepresented === true, 'Exchange activity book must represent history rows.');
    assertCheck(failures, artifact.coverage.proofRootsCovered === true, 'Exchange activity book rows must include proof roots.');
    assertCheck(failures, artifact.coverage.eventIdsCovered === true, 'Exchange activity book rows must include event ids.');
    assertCheck(failures, artifact.coverage.detailPayloadsCovered === true, 'Exchange activity book rows must include detail payloads.');
    assertCheck(
      failures,
      artifact.coverage.ledgerDatabaseProjectionRefsCovered === true,
      'Exchange activity book rows must include ledger/database projection refs.',
    );
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Exchange activity book must not serialize credentials.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Exchange activity book must not expose protected source.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Exchange activity book must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.legacySourceRoots === false, 'Exchange activity book must not point at _legacy source roots.');
    assertCheck(
      failures,
      artifact.rows.every((row) => /^exchange-activity-row:[a-f0-9]{24}$/u.test(row.rowRoot)),
      'Exchange activity rows must have deterministic row roots.',
    );
    assertCheck(
      failures,
      artifact.rows.every((row) => /^exchange-activity-detail:[a-f0-9]{24}$/u.test(row.detailRoot)),
      'Exchange activity rows must have deterministic detail roots.',
    );
    assertCheck(
      failures,
      artifact.sourceEvidence.every((entry) => entry.allSourceRootsPresent === true),
      'Exchange activity source evidence roots must all exist.',
    );
    assertCheck(
      failures,
      artifact.rows.every((row) => Array.isArray(row.redactionPosture?.forbiddenPayloadClasses)
        && row.redactionPosture.forbiddenPayloadClasses.includes('protected_source_payloads')
        && row.redactionPosture.forbiddenPayloadClasses.includes('unpaid_assetpack_source')),
      'Exchange activity rows must forbid protected source and unpaid AssetPack source.',
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
  const source = read(root, 'packages/specifying/src/canonical/exchange-activity-book.js');
  const index = read(root, 'packages/specifying/src/index.js');
  const typeDefs = read(root, 'packages/specifying/src/index.d.ts');
  const test = read(root, 'packages/specifying/test/v36-exchange-activity-book.test.js');
  const specifying = read(root, 'packages/specifying/src/canonical/v21-specifying.js');

  for (const doc of [spec, delta, notes, parity]) {
    assertCheck(failures, doc.includes(ARTIFACT_PATH), `V36 docs must mention ${ARTIFACT_PATH}.`);
    assertCheck(failures, doc.includes('ExchangeActivityBook'), 'V36 docs must name ExchangeActivityBook.');
    assertCheck(failures, doc.includes('source-safe-exchange-activity-book-metadata'), 'V36 docs must name Exchange activity book source safety verdict.');
    assertCheck(failures, doc.includes('activity detail never exposes protected source'), 'V36 docs must state activity detail source-safety.');
  }

  assertCheck(failures, parity.includes('| Exchange activity book | Gate 2 |') && parity.includes('| closed |'), 'V36 parity must close the Gate 2 matrix row.');
  assertCheck(failures, parity.includes('## Gate 2 Parity') && parity.includes('closed'), 'V36 parity must mark Gate 2 closed.');
  assertCheck(
    failures,
    /Current working gate: V36 Gate (?:3|4|5|6|7|8|9|10)\b/u.test(roadmap),
    'Roadmap must advance past V36 Gate 2 after this gate closes.',
  );
  assertCheck(failures, roadmap.includes('V36 Gate 2 closure anchor'), 'Roadmap must include a V36 Gate 2 closure anchor.');
  assertCheck(failures, rootReadme.includes('ExchangeActivityBook'), 'Root README must mention ExchangeActivityBook.');
  assertCheck(failures, protocolReadme.includes('buildExchangeActivityBook'), 'Protocol README must mention buildExchangeActivityBook.');
  assertCheck(failures, exchangeReadme.includes('ExchangeActivityBook'), 'Exchange README must mention ExchangeActivityBook.');
  assertCheck(failures, packageJson.includes('"generate:v36-exchange-activity-book"'), 'package.json must expose the Gate 2 generator.');
  assertCheck(failures, packageJson.includes('"check:v36-exchange-activity-book"'), 'package.json must expose the Gate 2 artifact check.');
  assertCheck(failures, packageJson.includes('"check:v36-gate2"'), 'package.json must expose check:v36-gate2.');
  assertCheck(failures, workflow.includes('check-v36-gate2-exchange-activity-book-market-master-detail.mjs'), 'Gate workflow must run the V36 Gate 2 checker.');
  assertCheck(failures, workflow.includes('v36-exchange-activity-book.test.js'), 'Gate workflow must run the focused V36 Exchange activity book test.');
  assertCheck(failures, canonWorkflow.includes('check-v36-gate2-exchange-activity-book-market-master-detail.mjs'), 'Canon workflow must run the V36 Gate 2 checker when V36 is present.');
  assertCheck(failures, specifying.includes(ARTIFACT_PATH), 'Spec-family profile must include the Exchange activity book artifact path.');

  for (const phrase of [
    'buildExchangeActivityBook',
    'EXCHANGE_ACTIVITY_KINDS',
    'EXCHANGE_ACTIVITY_FILTER_IDS',
    'EXCHANGE_ACTIVITY_DETAIL_SECTION_IDS',
    'EXCHANGE_ACTIVITY_ROWS',
    'listing',
    'bid',
    'ask',
    'cancellation',
    'acceptance',
    'settlement',
    'repair',
    'revenue_route',
    'history_entry',
  ]) {
    assertCheck(failures, source.includes(phrase), `Gate 2 source must include ${phrase}.`);
  }

  for (const phrase of ['buildExchangeActivityBook', 'EXCHANGE_ACTIVITY_KINDS', 'settlement', 'repair', 'revenue_route']) {
    assertCheck(failures, test.includes(phrase), `Gate 2 test must include ${phrase}.`);
  }

  assertCheck(failures, index.includes('buildExchangeActivityBook'), 'Protocol index must export buildExchangeActivityBook.');
  assertCheck(failures, typeDefs.includes('buildExchangeActivityBook'), 'Protocol type declarations must export buildExchangeActivityBook.');

  if (failures.length > 0) {
    process.stderr.write('V36 Gate 2 Exchange activity book check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V36 Gate 2 Exchange activity book ok rows=${artifact?.rows.length || 0}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
}
