#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v36-pricing-liquidity-fee-quote.json';
const REQUIRED_QUOTE_STATES = [
  'quote_ready',
  'underpayment_fail_closed',
  'overpayment_fail_closed',
  'stale_quote_fail_closed',
  'unsupported_network_fail_closed',
];
const REQUIRED_LIQUIDITY_BANDS = ['thin', 'balanced', 'deep'];
const REQUIRED_FIELD_IDS = [
  'quoteId',
  'quoteState',
  'assetPackId',
  'btdRangeIdentity',
  'btcAmount',
  'measurementWeight',
  'measurementVolume',
  'liquidityBand',
  'wrapperAnalysis',
  'treasuryRoute',
  'depositorRoute',
  'readerRoute',
  'quoteRoot',
  'networkPosture',
  'settlementWindow',
  'failClosedConditions',
  'proofRoots',
  'ledgerDatabaseProjectionRefs',
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
      'Usage: node scripts/check-v36-gate5-exchange-pricing-quote.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V36 Gate 5 ExchangePricingQuote source, generated artifact, tests, docs, package scripts, and workflow wiring.',
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
      branch === 'version/v36' || /^v36\/gate-(?:[5-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V36 Gate 5+ work must occur on version/v36 or v36/gate-5..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'packages/specifying/src/canonical/exchange-pricing-quote.js',
    'packages/specifying/src/index.js',
    'packages/specifying/src/index.d.ts',
    'packages/specifying/test/v36-exchange-pricing-quote.test.js',
    'scripts/generate-v36-exchange-pricing-quote.mjs',
    'scripts/check-v36-gate5-exchange-pricing-quote.mjs',
    'packages/specifying/src/canonical/v21-specifying.js',
    'BITCODE_SPEC_V36.md',
    'BITCODE_SPEC_V36_DELTA.md',
    'BITCODE_SPEC_V36_NOTES.md',
    'BITCODE_SPEC_V36_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'packages/specifying/README.md',
    'apps/uapi/app/exchange/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V36 Gate 5 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v36-exchange-pricing-quote.mjs', '--check']);
    } catch (error) {
      failures.push(`V36 Exchange pricing quote artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['--test', '--test-force-exit', 'packages/specifying/test/v36-exchange-pricing-quote.test.js']);
    } catch (error) {
      failures.push(`V36 Exchange pricing quote package test failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V36 Exchange pricing quote must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v36-pricing-liquidity-fee-quote', 'Exchange pricing artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v36.exchangePricingQuote.v1', 'Exchange pricing schemaId must match.');
    assertCheck(failures, artifact.version === 'V36' && artifact.currentTarget === 'V35', 'Exchange pricing quote must bind V36 over active V35.');
    assertCheck(failures, artifact.passed === true, 'Exchange pricing quote must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-exchange-pricing-quote-metadata',
      'Exchange pricing quote must be source-safe Exchange metadata.',
    );
    assertCheck(failures, includesAll(artifact.requiredQuoteStates, REQUIRED_QUOTE_STATES), 'Exchange pricing quote states must be explicit.');
    assertCheck(failures, includesAll(artifact.coverage.observedQuoteStates, REQUIRED_QUOTE_STATES), 'Exchange pricing coverage must observe every quote state.');
    assertCheck(failures, includesAll(artifact.requiredLiquidityBands, REQUIRED_LIQUIDITY_BANDS), 'Exchange pricing liquidity bands must be explicit.');
    assertCheck(failures, includesAll(artifact.coverage.observedLiquidityBands, REQUIRED_LIQUIDITY_BANDS), 'Exchange pricing coverage must observe every liquidity band.');
    assertCheck(failures, includesAll(artifact.requiredFieldIds, REQUIRED_FIELD_IDS), 'ExchangePricingQuote required fields must be explicit.');
    assertCheck(failures, artifact.coverage.quoteCount === REQUIRED_QUOTE_STATES.length, 'Exchange pricing quote must prove every quote state.');
    assertCheck(failures, artifact.coverage.btcAmountCovered === true, 'BTC amount must be covered.');
    assertCheck(failures, artifact.coverage.measurementWeightVolumeCovered === true, 'Measurement weight and measurement volume must be covered.');
    assertCheck(failures, artifact.coverage.liquidityBandsCovered === true, 'Liquidity bands must be covered.');
    assertCheck(failures, artifact.coverage.wrapperAnalysisCovered === true, 'Wrapper analysis must be covered.');
    assertCheck(
      failures,
      artifact.coverage.wrapperCannotFungibilizeBtdRangeChainOfRecord === true,
      'Wrapper analysis cannot make BTD range cells fungible chain-of-record assets.',
    );
    assertCheck(failures, artifact.coverage.treasuryDepositorReaderRoutesCovered === true, 'Treasury, depositor, and reader routes must be covered.');
    assertCheck(failures, artifact.coverage.quoteRootsCovered === true, 'Exchange pricing rows must include quote roots.');
    assertCheck(failures, artifact.coverage.proofRootsCovered === true, 'Exchange pricing rows must include proof roots.');
    assertCheck(failures, artifact.coverage.eventIdsCovered === true, 'Exchange pricing rows must include event ids.');
    assertCheck(failures, artifact.coverage.ledgerDatabaseProjectionRefsCovered === true, 'Exchange pricing rows must include ledger/database projection refs.');
    assertCheck(failures, artifact.coverage.underpaymentFailsClosed === true, 'Underpayment must fail closed.');
    assertCheck(failures, artifact.coverage.overpaymentFailsClosed === true, 'Overpayment must fail closed.');
    assertCheck(failures, artifact.coverage.staleQuoteFailsClosed === true, 'Stale quote must fail closed.');
    assertCheck(failures, artifact.coverage.unsupportedNetworkPostureFailsClosed === true, 'Unsupported network posture must fail closed.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Exchange pricing quote must not serialize credentials.');
    assertCheck(failures, artifact.coverage.privateWalletMaterialSerialized === false, 'Exchange pricing quote must not serialize private wallet material.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Exchange pricing quote must not expose protected source.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Exchange pricing quote must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.legacySourceRoots === false, 'Exchange pricing quote must not point at _legacy source roots.');
    assertCheck(
      failures,
      artifact.rows.every((row) => /^exchange-pricing-quote:[a-f0-9]{24}$/u.test(row.quoteRoot)),
      'Exchange pricing quotes must have deterministic quote roots.',
    );
    assertCheck(
      failures,
      artifact.rows.every((row) => row.wrapperAnalysis?.canMakeBtdRangeCellsFungibleChainOfRecordAssets === false),
      'Exchange pricing wrappers must preserve non-fungible BTD range chain-of-record assets.',
    );
    assertCheck(
      failures,
      artifact.sourceEvidence.every((entry) => entry.allSourceRootsPresent === true),
      'Exchange pricing source evidence roots must all exist.',
    );
  }

  const spec = read(root, 'BITCODE_SPEC_V36.md');
  const delta = read(root, 'BITCODE_SPEC_V36_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V36_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V36_PARITY_MATRIX.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');
  const rootReadme = read(root, 'README.md');
  const protocolReadme = read(root, 'packages/specifying/README.md');
  const exchangeReadme = read(root, 'apps/uapi/app/exchange/README.md');
  const packageJson = read(root, 'package.json');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  const source = read(root, 'packages/specifying/src/canonical/exchange-pricing-quote.js');
  const index = read(root, 'packages/specifying/src/index.js');
  const typeDefs = read(root, 'packages/specifying/src/index.d.ts');
  const test = read(root, 'packages/specifying/test/v36-exchange-pricing-quote.test.js');

  for (const doc of [spec, delta, notes, parity]) {
    assertCheck(failures, doc.includes(ARTIFACT_PATH), `V36 docs must mention ${ARTIFACT_PATH}.`);
    assertCheck(failures, doc.includes('ExchangePricingQuote'), 'V36 docs must name ExchangePricingQuote.');
    assertCheck(failures, doc.includes('source-safe-exchange-pricing-quote-metadata'), 'V36 docs must name Exchange pricing source safety verdict.');
    assertCheck(
      failures,
      doc.includes('measurement weight, measurement volume, liquidity band, wrapper analysis'),
      'V36 docs must state pricing measurement/liquidity/wrapper basis.',
    );
    assertCheck(
      failures,
      doc.includes('wrapper analysis cannot make BTD range cells fungible chain-of-record assets'),
      'V36 docs must state wrapper non-fungibility boundary.',
    );
    assertCheck(
      failures,
      doc.includes('underpayment, overpayment, stale quote, or unsupported network posture fails closed'),
      'V36 docs must state pricing fail-closed conditions.',
    );
  }

  assertCheck(failures, parity.includes('| Pricing quote | Gate 5 |') && parity.includes('| closed |'), 'V36 parity must close the Gate 5 matrix row.');
  assertCheck(failures, parity.includes('## Gate 5 Parity') && parity.includes('closed'), 'V36 parity must mark Gate 5 closed.');
  assertCheck(
    failures,
    /Current working gate: V36 Gate (?:[6-9]|10) /u.test(roadmap),
    'Roadmap must advance current working gate to V36 Gate 6 or later.',
  );
  assertCheck(failures, roadmap.includes('V36 Gate 5 closure anchor'), 'Roadmap must include V36 Gate 5 closure anchor.');

  for (const doc of [rootReadme, protocolReadme, exchangeReadme]) {
    assertCheck(failures, doc.includes('ExchangePricingQuote'), 'README docs must mention ExchangePricingQuote.');
    assertCheck(failures, doc.includes('source-safe-exchange-pricing-quote-metadata'), 'README docs must mention source-safe Exchange pricing metadata.');
    assertCheck(failures, doc.includes('underpayment, overpayment, stale quote, or unsupported network posture fails closed'), 'README docs must mention pricing fail-closed posture.');
  }

  assertCheck(failures, source.includes('EXCHANGE_PRICING_QUOTE_SOURCE_SAFETY_VERDICT'), 'Pricing quote source must export source-safety verdict.');
  assertCheck(failures, source.includes('wrapper analysis cannot make BTD range cells fungible chain-of-record assets'), 'Pricing quote source must encode wrapper boundary.');
  assertCheck(failures, source.includes('underpayment_fail_closed') && source.includes('overpayment_fail_closed'), 'Pricing quote source must encode payment mismatch closures.');
  assertCheck(failures, source.includes('stale_quote_fail_closed') && source.includes('unsupported_network_fail_closed'), 'Pricing quote source must encode stale quote and network closures.');
  assertCheck(failures, index.includes('buildExchangePricingQuote'), 'Package index must export buildExchangePricingQuote.');
  assertCheck(failures, typeDefs.includes('buildExchangePricingQuote'), 'Package type definitions must export buildExchangePricingQuote.');
  assertCheck(failures, test.includes('fails closed for payment mismatch, stale quotes, and unsupported network posture'), 'Pricing quote package test must cover fail-closed posture.');

  assertCheck(failures, packageJson.includes('"generate:v36-exchange-pricing-quote"'), 'package.json must include pricing quote generator script.');
  assertCheck(failures, packageJson.includes('"check:v36-exchange-pricing-quote"'), 'package.json must include pricing quote artifact check script.');
  assertCheck(failures, packageJson.includes('"check:v36-gate5"'), 'package.json must include check:v36-gate5.');
  assertCheck(failures, workflow.includes('check-v36-gate5-exchange-pricing-quote.mjs'), 'Gate workflow must run Gate 5 checker.');
  assertCheck(failures, workflow.includes('test/v36-exchange-pricing-quote.test.js'), 'Gate workflow must run Gate 5 package test.');
  assertCheck(failures, canonWorkflow.includes('check-v36-gate5-exchange-pricing-quote.mjs'), 'Canon workflow must run Gate 5 checker when present.');

  if (failures.length > 0) {
    process.stderr.write(`V36 Gate 5 Exchange pricing quote check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V36 Gate 5 Exchange pricing quote check passed.\n');
}

main();
