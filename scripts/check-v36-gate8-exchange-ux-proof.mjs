#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v36-exchange-ux-proof.json';
const REQUIRED_CAPABILITY_IDS = [
  'market_wide_master_detail',
  'market_filters',
  'order_history',
  'rights_transfer_review',
  'pricing_quote',
  'settlement_state',
  'repair_state',
  'terminal_context_handoff',
  'collapsed_status_expanded_detail',
  'telemetry_dashboard_binding',
];
const REQUIRED_DOC_PHRASES = [
  'market-wide master-detail, filters, order history, rights-transfer review, pricing quote, settlement state, and repair state',
  'product can hand off to Exchange without losing transaction context',
  'collapsed UI gives readable status and expanded UI exposes source-safe detail',
  'Exchange telemetry dashboards remain source-safe and proof-rooted',
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
      'Usage: node scripts/check-v36-gate8-exchange-ux-proof.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V36 Gate 8 Exchange UX proof source, generated artifact, route handoff tests, docs, package scripts, and workflow wiring.',
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
      branch === 'version/v36' || /^v36\/gate-(?:[8-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V36 Gate 8+ work must occur on version/v36 or v36/gate-8..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'scripts/specifying/src/canonical/exchange-ux-proof.js',
    'scripts/specifying/src/index.js',
    'scripts/specifying/src/index.d.ts',
    'scripts/specifying/test/v36-exchange-ux-proof.test.js',
    'scripts/generate-v36-exchange-ux-proof.mjs',
    'scripts/check-v36-gate8-exchange-ux-proof.mjs',
    'apps/uapi/app/exchange/ExchangePageClient.tsx',
    'apps/uapi/app/ (removed cockpit tree) TerminalTransactionWorkspace.tsx',
    'apps/uapi/app/ (removed cockpit tree) TerminalTransactionDetailHero.tsx',
    'apps/uapi/app/ (removed cockpit tree) terminal-routes.ts',
    'apps/uapi/tests/exchangePageClient.test.tsx',
    'apps/uapi/tests/exchangeTerminalHandoff.test.ts',
    'apps/uapi/jest.config.cjs',
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
    assertCheck(failures, fileExists(root, relativePath), `Missing V36 Gate 8 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v36-exchange-ux-proof.mjs', '--check']);
    } catch (error) {
      failures.push(`V36 Exchange UX proof artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['--test', '--test-force-exit', 'scripts/specifying/test/v36-exchange-ux-proof.test.js']);
    } catch (error) {
      failures.push(`V36 Exchange UX proof package test failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V36 Exchange UX proof must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v36-exchange-ux-proof', 'Exchange UX artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v36.exchangeUxProof.v1', 'Exchange UX schemaId must match.');
    assertCheck(failures, artifact.version === 'V36' && artifact.currentTarget === 'V35', 'Exchange UX proof must bind V36 over active V35.');
    assertCheck(failures, artifact.passed === true, 'Exchange UX proof must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-exchange-ux-proof-metadata',
      'Exchange UX proof must be source-safe Exchange metadata.',
    );
    assertCheck(failures, includesAll(artifact.requiredCapabilityIds, REQUIRED_CAPABILITY_IDS), 'Exchange UX required capabilities must be explicit.');
    assertCheck(failures, includesAll(artifact.coverage.observedCapabilityIds, REQUIRED_CAPABILITY_IDS), 'Exchange UX coverage must observe every required capability.');
    assertCheck(failures, artifact.coverage.masterDetailCovered === true, 'Exchange master-detail must be covered.');
    assertCheck(failures, artifact.coverage.filtersCovered === true, 'Exchange filters must be covered.');
    assertCheck(failures, artifact.coverage.orderHistoryCovered === true, 'Exchange order history must be covered.');
    assertCheck(failures, artifact.coverage.rightsTransferReviewCovered === true, 'Exchange rights-transfer review must be covered.');
    assertCheck(failures, artifact.coverage.pricingQuoteCovered === true, 'Exchange pricing quote review must be covered.');
    assertCheck(failures, artifact.coverage.settlementStateCovered === true, 'Exchange settlement state must be covered.');
    assertCheck(failures, artifact.coverage.repairStateCovered === true, 'Exchange repair state must be covered.');
    assertCheck(failures, artifact.coverage.terminalHandoffCovered === true, 'product handoff must be covered.');
    assertCheck(failures, artifact.coverage.collapsedStatusExpandedDetailCovered === true, 'Collapsed status and expanded detail must be covered.');
    assertCheck(failures, artifact.coverage.telemetryDashboardBindingCovered === true, 'Telemetry dashboard binding must be covered.');
    assertCheck(failures, artifact.coverage.routeContextPreserved === true, 'Route context must be preserved.');
    assertCheck(failures, artifact.coverage.collapsedUiReadable === true, 'Collapsed UI must be readable.');
    assertCheck(failures, artifact.coverage.expandedDetailSourceSafe === true, 'Expanded detail must be source-safe.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Exchange UX proof must not serialize credentials.');
    assertCheck(failures, artifact.coverage.privateWalletMaterialSerialized === false, 'Exchange UX proof must not serialize private wallet material.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Exchange UX proof must not expose protected source.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Exchange UX proof must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.legacySourceRoots === false, 'Exchange UX proof must not point at _legacy source roots.');
    assertCheck(failures, artifact.coverage.allSourceRootsPresent === true, 'Exchange UX proof source roots must all exist.');
    assertCheck(
      failures,
      artifact.rows.every((row) => /^exchange-ux-capability:[a-f0-9]{24}$/u.test(row.capabilityRoot)),
      'Exchange UX rows must have deterministic roots.',
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
  const source = read(root, 'scripts/specifying/src/canonical/exchange-ux-proof.js');
  const index = read(root, 'scripts/specifying/src/index.js');
  const typeDefs = read(root, 'scripts/specifying/src/index.d.ts');
  const packageTest = read(root, 'scripts/specifying/test/v36-exchange-ux-proof.test.js');
  const exchangePage = read(root, 'apps/uapi/app/exchange/ExchangePageClient.tsx');
  const terminalRoutes = read(root, 'apps/uapi/app/ (removed cockpit tree) terminal-routes.ts');
  const detailHero = read(root, 'apps/uapi/app/ (removed cockpit tree) TerminalTransactionDetailHero.tsx');
  const handoffTest = read(root, 'apps/uapi/tests/exchangeTerminalHandoff.test.ts');
  const exchangePageTest = read(root, 'apps/uapi/tests/exchangePageClient.test.tsx');
  const uapiJestConfig = read(root, 'apps/uapi/jest.config.cjs');

  for (const doc of docs) {
    assertCheck(failures, doc.includes(ARTIFACT_PATH), `V36 docs must mention ${ARTIFACT_PATH}.`);
    assertCheck(failures, doc.includes('ExchangeUxProof'), 'V36 docs must name ExchangeUxProof.');
    assertCheck(failures, doc.includes('source-safe-exchange-ux-proof-metadata'), 'V36 docs must name Exchange UX source safety verdict.');
    for (const phrase of REQUIRED_DOC_PHRASES) {
      assertCheck(failures, doc.includes(phrase), `V36 docs must state: ${phrase}.`);
    }
  }

  for (const doc of [rootReadme, protocolReadme, exchangeReadme]) {
    assertCheck(failures, doc.includes('ExchangeUxProof'), 'README docs must mention ExchangeUxProof.');
    assertCheck(failures, doc.includes('source-safe-exchange-ux-proof-metadata'), 'README docs must mention source-safe Exchange UX metadata.');
    for (const phrase of REQUIRED_DOC_PHRASES) {
      assertCheck(failures, doc.includes(phrase), `README docs must state: ${phrase}.`);
    }
  }

  assertCheck(failures, docs[3].includes('| Exchange UX and product integration | Gate 8 |') && docs[3].includes('| closed |'), 'V36 parity must close the Gate 8 matrix row.');
  assertCheck(failures, docs[3].includes('## Gate 8 Parity') && docs[3].includes('closed'), 'V36 parity must mark Gate 8 closed.');
  assertCheck(
    failures,
    /Current working gate: V36 Gate (?:9|10)\b/u.test(roadmap),
    'Roadmap must advance current working gate to V36 Gate 9 or later.',
  );
  assertCheck(failures, roadmap.includes('V36 Gate 8 closure anchor'), 'Roadmap must include V36 Gate 8 closure anchor.');
  assertCheck(failures, source.includes('EXCHANGE_UX_PROOF_SOURCE_SAFETY_VERDICT'), 'Exchange UX source must export source-safety verdict.');
  assertCheck(failures, source.includes('terminal_context_handoff'), 'Exchange UX source must cover product handoff.');
  assertCheck(failures, index.includes("from './canonical/exchange-ux-proof.js'"), 'Protocol index must export Exchange UX source.');
  assertCheck(failures, typeDefs.includes('EXCHANGE_UX_PROOF_ARTIFACT_PATH'), 'Protocol type definitions must export Exchange UX artifact path.');
  assertCheck(failures, typeDefs.includes('buildExchangeUxProof'), 'Protocol type definitions must export Exchange UX builder.');
  assertCheck(failures, packageTest.includes('buildExchangeUxProof'), 'Gate 8 package test must exercise Exchange UX builder.');
  assertCheck(failures, exchangePage.includes('Read market activity, select an order, and inspect Exchange state'), 'Exchange route must expose the Gate 8 heading.');
  assertCheck(failures, exchangePage.includes('market filters') && exchangePage.includes('proof-rooted state'), 'Exchange hero must expose filters and proof-rooted state.');
  assertCheck(failures, terminalRoutes.includes('EXCHANGE_ROUTE') && terminalRoutes.includes('buildExchangeHref'), 'product routes must build Exchange handoff hrefs.');
  assertCheck(failures, detailHero.includes('Open in Exchange') && detailHero.includes('Return to product'), 'Detail hero must expose Exchange and product handoff links.');
  assertCheck(failures, handoffTest.includes('buildExchangeHref') && handoffTest.includes('transactionDetail=proofs'), 'Handoff test must prove route context preservation.');
  assertCheck(failures, exchangePageTest.includes('market filters') && exchangePageTest.includes('proof-rooted state'), 'Exchange page test must cover Gate 8 header fields.');
  assertCheck(failures, uapiJestConfig.includes('exchangeTerminalHandoff.test.ts'), 'UAPI Jest config must include the Exchange handoff test.');
  assertCheck(failures, packageJson.includes('"generate:v36-exchange-ux-proof"'), 'package.json must expose V36 Exchange UX proof generation script.');
  assertCheck(failures, packageJson.includes('"check:v36-exchange-ux-proof"'), 'package.json must expose V36 Exchange UX proof artifact check script.');
  assertCheck(failures, packageJson.includes('"check:v36-gate8"'), 'package.json must expose V36 Gate 8 checker.');
  assertCheck(failures, workflow.includes('check-v36-gate8-exchange-ux-proof.mjs'), 'Gate workflow must run the V36 Gate 8 checker.');
  assertCheck(failures, workflow.includes('test/v36-exchange-ux-proof.test.js'), 'Gate workflow must run the V36 Gate 8 package test.');
  assertCheck(failures, workflow.includes('exchangeTerminalHandoff.test.ts'), 'Gate workflow must run the Exchange handoff UI test.');
  assertCheck(failures, canonWorkflow.includes('check-v36-gate8-exchange-ux-proof.mjs'), 'Canon workflow must run the V36 Gate 8 checker when present.');

  if (failures.length > 0) {
    process.stderr.write(`V36 Gate 8 Exchange UX proof check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V36 Gate 8 Exchange UX proof check passed.\n');
}

main();
