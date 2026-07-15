#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v36-exchange-dispute-repair-revenue-route.json';
const REQUIRED_INCIDENT_CLASSES = [
  'stale_owner',
  'cancelled_order_replay',
  'underpayment',
  'overpayment',
  'projection_drift',
  'source_leakage',
  'delivery_mismatch',
];
const REQUIRED_REVENUE_ROUTE_STATES = [
  'exact_settlement_conserved',
  'overpayment_refund_conserved',
  'underpayment_blocked_conserved',
  'projection_repair_conserved',
];
const REQUIRED_DISPUTE_FIELD_IDS = [
  'disputeCaseId',
  'incidentClass',
  'disputeReason',
  'affectedOrder',
  'affectedSettlement',
  'affectedProjection',
  'repairCommand',
  'verificationCommand',
  'runbook',
  'proofRoot',
  'escalationPath',
  'eventIds',
];
const REQUIRED_REVENUE_FIELD_IDS = [
  'revenueRouteId',
  'routeState',
  'treasuryAccount',
  'depositorAccount',
  'readerAccount',
  'feeAccount',
  'btcRoute',
  'btdRightRoute',
  'sourceToSharesRoute',
  'conservationProof',
  'proofRoot',
  'eventIds',
];
const REQUIRED_DOC_PHRASES = [
  'stale owner, cancelled order replay, underpayment, overpayment, projection drift, source leakage, and delivery mismatch',
  'depositor, reader, treasury, fee, BTC route, BTD right route, and conservation proof',
  'runbooks and repair commands are source-safe and proof-rooted',
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
      'Usage: node scripts/check-v36-gate7-exchange-dispute-repair-revenue-route.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V36 Gate 7 ExchangeDisputeRepairCase and ExchangeRevenueRoute source, generated artifact, tests, docs, package scripts, and workflow wiring.',
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
    pointer === 'V35',
    `BITCODE_SPEC.txt must remain V35 during V36 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v36' || /^v36\/gate-(?:[7-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V36 Gate 7+ work must occur on version/v36 or v36/gate-7..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'scripts/specifying/src/canonical/exchange-dispute-repair-revenue-route.js',
    'scripts/specifying/src/index.js',
    'scripts/specifying/src/index.d.ts',
    'scripts/specifying/test/v36-exchange-dispute-repair-revenue-route.test.js',
    'scripts/generate-v36-exchange-dispute-repair-revenue-route.mjs',
    'scripts/check-v36-gate7-exchange-dispute-repair-revenue-route.mjs',
    '.specifications/BITCODE_SPEC_V36.md',
    '.specifications/BITCODE_SPEC_V36_DELTA.md',
    '.specifications/BITCODE_SPEC_V36_NOTES.md',
    '.specifications/BITCODE_SPEC_V36_PARITY_MATRIX.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'scripts/specifying/README.md',
    'apps/uapi/app/exchange/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V36 Gate 7 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v36-exchange-dispute-repair-revenue-route.mjs', '--check']);
    } catch (error) {
      failures.push(`V36 Exchange dispute repair revenue route artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['--test', '--test-force-exit', 'scripts/specifying/test/v36-exchange-dispute-repair-revenue-route.test.js']);
    } catch (error) {
      failures.push(`V36 Exchange dispute repair revenue route package test failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V36 Exchange dispute repair revenue route must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v36-exchange-dispute-repair-revenue-route', 'Exchange dispute/revenue artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v36.exchangeDisputeRepairRevenueRoute.v1', 'Exchange dispute/revenue schemaId must match.');
    assertCheck(failures, artifact.version === 'V36' && artifact.currentTarget === 'V35', 'Exchange dispute/revenue must bind V36 over active V35.');
    assertCheck(failures, artifact.passed === true, 'Exchange dispute repair revenue route must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-exchange-dispute-repair-revenue-route-metadata',
      'Exchange dispute repair revenue route must be source-safe Exchange metadata.',
    );
    assertCheck(failures, includesAll(artifact.requiredIncidentClasses, REQUIRED_INCIDENT_CLASSES), 'Exchange dispute incident classes must be explicit.');
    assertCheck(failures, includesAll(artifact.coverage.observedIncidentClasses, REQUIRED_INCIDENT_CLASSES), 'Exchange dispute coverage must observe every incident class.');
    assertCheck(failures, includesAll(artifact.requiredRevenueRouteStates, REQUIRED_REVENUE_ROUTE_STATES), 'Exchange revenue route states must be explicit.');
    assertCheck(failures, includesAll(artifact.coverage.observedRevenueRouteStates, REQUIRED_REVENUE_ROUTE_STATES), 'Exchange revenue route coverage must observe every route state.');
    assertCheck(failures, includesAll(artifact.disputeCaseRequiredFieldIds, REQUIRED_DISPUTE_FIELD_IDS), 'ExchangeDisputeRepairCase required fields must be explicit.');
    assertCheck(failures, includesAll(artifact.revenueRouteRequiredFieldIds, REQUIRED_REVENUE_FIELD_IDS), 'ExchangeRevenueRoute required fields must be explicit.');
    assertCheck(failures, artifact.coverage.staleOwnerCovered === true, 'Stale owner dispute must be covered.');
    assertCheck(failures, artifact.coverage.cancelledOrderReplayCovered === true, 'Cancelled order replay dispute must be covered.');
    assertCheck(failures, artifact.coverage.underpaymentCovered === true, 'Underpayment dispute must be covered.');
    assertCheck(failures, artifact.coverage.overpaymentCovered === true, 'Overpayment dispute must be covered.');
    assertCheck(failures, artifact.coverage.projectionDriftCovered === true, 'Projection drift dispute must be covered.');
    assertCheck(failures, artifact.coverage.sourceLeakageCovered === true, 'Source leakage dispute must be covered.');
    assertCheck(failures, artifact.coverage.deliveryMismatchCovered === true, 'Delivery mismatch dispute must be covered.');
    assertCheck(failures, artifact.coverage.repairCommandsSourceSafe === true, 'Repair commands must be source-safe.');
    assertCheck(failures, artifact.coverage.verificationCommandsSourceSafe === true, 'Verification commands must be source-safe.');
    assertCheck(failures, artifact.coverage.runbooksProofRootedSourceSafe === true, 'Runbooks must be source-safe and proof-rooted.');
    assertCheck(failures, artifact.coverage.escalationPathsCovered === true, 'Escalation paths must be covered.');
    assertCheck(failures, artifact.coverage.disputeProofRootsCovered === true, 'Exchange dispute rows must include proof roots.');
    assertCheck(failures, artifact.coverage.disputeEventIdsCovered === true, 'Exchange dispute rows must include event ids.');
    assertCheck(failures, artifact.coverage.depositorReaderTreasuryFeeRoutesCovered === true, 'Depositor reader treasury and fee routes must be covered.');
    assertCheck(failures, artifact.coverage.btcRouteCovered === true, 'BTC route must be covered.');
    assertCheck(failures, artifact.coverage.btdRightRouteCovered === true, 'BTD right route must be covered.');
    assertCheck(failures, artifact.coverage.sourceToSharesRouteCovered === true, 'Source-to-shares route must be covered.');
    assertCheck(failures, artifact.coverage.conservationProofCovered === true, 'Conservation proof must be covered.');
    assertCheck(failures, artifact.coverage.revenueProofRootsCovered === true, 'Exchange revenue rows must include proof roots.');
    assertCheck(failures, artifact.coverage.revenueEventIdsCovered === true, 'Exchange revenue rows must include event ids.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Exchange dispute/revenue must not serialize credentials.');
    assertCheck(failures, artifact.coverage.privateWalletMaterialSerialized === false, 'Exchange dispute/revenue must not serialize private wallet material.');
    assertCheck(failures, artifact.coverage.privatePaymentCredentialsSerialized === false, 'Exchange dispute/revenue must not serialize private payment credentials.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Exchange dispute/revenue must not expose protected source.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Exchange dispute/revenue must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.legacySourceRoots === false, 'Exchange dispute/revenue must not point at _legacy source roots.');
    assertCheck(
      failures,
      artifact.disputeCases.every((row) => /^exchange-dispute-repair-case:[a-f0-9]{24}$/u.test(row.disputeCaseRoot)),
      'Exchange dispute repair cases must have deterministic roots.',
    );
    assertCheck(
      failures,
      artifact.revenueRoutes.every((row) => /^exchange-revenue-route:[a-f0-9]{24}$/u.test(row.revenueRouteRoot)),
      'Exchange revenue routes must have deterministic roots.',
    );
    assertCheck(
      failures,
      artifact.revenueRoutes.every((row) => row.conservationProof.btcDebitsEqualCredits === true),
      'Exchange revenue route BTC debits and credits must conserve.',
    );
    assertCheck(
      failures,
      artifact.sourceEvidence.every((entry) => entry.allSourceRootsPresent === true),
      'Exchange dispute/revenue source evidence roots must all exist.',
    );
  }

  const docs = [
    read(root, '.specifications/BITCODE_SPEC_V36.md'),
    read(root, '.specifications/BITCODE_SPEC_V36_DELTA.md'),
    read(root, '.specifications/BITCODE_SPEC_V36_NOTES.md'),
    read(root, '.specifications/BITCODE_SPEC_V36_PARITY_MATRIX.md'),
  ];
  const roadmap = read(root, '.specifications/SPECIFICATIONS_ROADMAP.md');
  const rootReadme = read(root, 'README.md');
  const protocolReadme = read(root, 'scripts/specifying/README.md');
  const exchangeReadme = read(root, 'apps/uapi/app/exchange/README.md');
  const packageJson = read(root, 'package.json');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  const source = read(root, 'scripts/specifying/src/canonical/exchange-dispute-repair-revenue-route.js');
  const index = read(root, 'scripts/specifying/src/index.js');
  const typeDefs = read(root, 'scripts/specifying/src/index.d.ts');
  const test = read(root, 'scripts/specifying/test/v36-exchange-dispute-repair-revenue-route.test.js');

  for (const doc of docs) {
    assertCheck(failures, doc.includes(ARTIFACT_PATH), `V36 docs must mention ${ARTIFACT_PATH}.`);
    assertCheck(failures, doc.includes('ExchangeDisputeRepairCase'), 'V36 docs must name ExchangeDisputeRepairCase.');
    assertCheck(failures, doc.includes('ExchangeRevenueRoute'), 'V36 docs must name ExchangeRevenueRoute.');
    assertCheck(failures, doc.includes('source-safe-exchange-dispute-repair-revenue-route-metadata'), 'V36 docs must name Exchange dispute/revenue source safety verdict.');
    for (const phrase of REQUIRED_DOC_PHRASES) {
      assertCheck(failures, doc.includes(phrase), `V36 docs must state: ${phrase}.`);
    }
  }

  for (const doc of [rootReadme, protocolReadme, exchangeReadme]) {
    assertCheck(failures, doc.includes('ExchangeDisputeRepairCase'), 'README docs must mention ExchangeDisputeRepairCase.');
    assertCheck(failures, doc.includes('ExchangeRevenueRoute'), 'README docs must mention ExchangeRevenueRoute.');
    assertCheck(failures, doc.includes('source-safe-exchange-dispute-repair-revenue-route-metadata'), 'README docs must mention source-safe Exchange dispute/revenue metadata.');
    for (const phrase of REQUIRED_DOC_PHRASES) {
      assertCheck(failures, doc.includes(phrase), `README docs must state: ${phrase}.`);
    }
  }

  assertCheck(failures, docs[3].includes('| Dispute repair revenue routes | Gate 7 |') && docs[3].includes('| closed |'), 'V36 parity must close the Gate 7 matrix row.');
  assertCheck(failures, docs[3].includes('## Gate 7 Parity') && docs[3].includes('closed'), 'V36 parity must mark Gate 7 closed.');
  assertCheck(
    failures,
    /Current working gate: V36 Gate (?:8|9|10)\b/u.test(roadmap),
    'Roadmap must advance current working gate to V36 Gate 8 or later.',
  );
  assertCheck(failures, roadmap.includes('V36 Gate 7 closure anchor'), 'Roadmap must include V36 Gate 7 closure anchor.');
  assertCheck(failures, source.includes('EXCHANGE_DISPUTE_REPAIR_REVENUE_ROUTE_SOURCE_SAFETY_VERDICT'), 'Dispute/revenue source must export source-safety verdict.');
  assertCheck(failures, source.includes('ExchangeDisputeRepairCase'), 'Dispute/revenue source must build ExchangeDisputeRepairCase rows.');
  assertCheck(failures, source.includes('ExchangeRevenueRoute'), 'Dispute/revenue source must build ExchangeRevenueRoute rows.');
  assertCheck(failures, index.includes("from './canonical/exchange-dispute-repair-revenue-route.js'"), 'Protocol index must export Exchange dispute/revenue source.');
  assertCheck(failures, typeDefs.includes('EXCHANGE_DISPUTE_REPAIR_REVENUE_ROUTE_ARTIFACT_PATH'), 'Protocol type definitions must export Exchange dispute/revenue artifact path.');
  assertCheck(failures, typeDefs.includes('buildExchangeDisputeRepairRevenueRoute'), 'Protocol type definitions must export Exchange dispute/revenue builder.');
  assertCheck(failures, test.includes('buildExchangeDisputeRepairRevenueRoute'), 'Gate 7 package test must exercise Exchange dispute/revenue builder.');
  assertCheck(failures, packageJson.includes('"generate:v36-exchange-dispute-repair-revenue-route"'), 'package.json must expose V36 dispute/revenue generation script.');
  assertCheck(failures, packageJson.includes('"check:v36-exchange-dispute-repair-revenue-route"'), 'package.json must expose V36 dispute/revenue artifact check script.');
  assertCheck(failures, packageJson.includes('"check:v36-gate7"'), 'package.json must expose V36 Gate 7 checker.');
  assertCheck(failures, workflow.includes('check-v36-gate7-exchange-dispute-repair-revenue-route.mjs'), 'Gate workflow must run the V36 Gate 7 checker.');
  assertCheck(failures, workflow.includes('test/v36-exchange-dispute-repair-revenue-route.test.js'), 'Gate workflow must run the V36 Gate 7 package test.');
  assertCheck(failures, canonWorkflow.includes('check-v36-gate7-exchange-dispute-repair-revenue-route.mjs'), 'Canon workflow must run the V36 Gate 7 checker when present.');

  if (failures.length > 0) {
    process.stderr.write(`V36 Gate 7 Exchange dispute repair revenue route check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V36 Gate 7 Exchange dispute repair revenue route check passed.\n');
}

main();
