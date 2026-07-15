#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v36-exchange-rehearsal.json';
const REQUIRED_REHEARSAL_IDS = [
  'local_exchange_rehearsal',
  'staging_testnet_exchange_rehearsal',
  'ledger_database_synchronization_rehearsal',
  'source_safe_screenshot_log_rehearsal',
  'value_bearing_mainnet_blocked_rehearsal',
];
const REQUIRED_FLOW_IDS = ['list', 'bid', 'ask', 'cancel', 'accept', 'settle', 'repair', 'history'];
const REQUIRED_DOC_PHRASES = [
  'local and staging-testnet rehearsals exercise list, bid, ask, cancel, accept, settle, repair, and history flows',
  'rehearsal logs/screenshots are source-safe',
  'ledger/database synchronization and value-bearing mainnet blocking are visible',
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
      'Usage: node scripts/check-v36-gate9-exchange-rehearsal.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V36 Gate 9 ExchangeRehearsal source, generated artifact, tests, specs, docs, and workflow wiring.',
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
      branch === 'version/v36' || /^v36\/gate-(?:9|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V36 Gate 9+ work must occur on version/v36 or v36/gate-9..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'scripts/specifying/src/canonical/exchange-rehearsal.js',
    'scripts/specifying/src/index.js',
    'scripts/specifying/src/index.d.ts',
    'scripts/specifying/test/v36-exchange-rehearsal.test.js',
    'scripts/generate-v36-exchange-rehearsal.mjs',
    'scripts/check-v36-gate9-exchange-rehearsal.mjs',
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
    assertCheck(failures, fileExists(root, relativePath), `Missing V36 Gate 9 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v36-exchange-rehearsal.mjs', '--check']);
    } catch (error) {
      failures.push(`V36 Exchange rehearsal artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['--test', '--test-force-exit', 'scripts/specifying/test/v36-exchange-rehearsal.test.js']);
    } catch (error) {
      failures.push(`V36 Exchange rehearsal package test failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V36 Exchange rehearsal must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v36-exchange-rehearsal', 'Exchange rehearsal artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v36.exchangeRehearsal.v1', 'Exchange rehearsal schemaId must match.');
    assertCheck(failures, artifact.version === 'V36' && artifact.currentTarget === 'V35', 'Exchange rehearsal must bind V36 over active V35.');
    assertCheck(failures, artifact.passed === true, 'Exchange rehearsal report must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-exchange-rehearsal-metadata',
      'Exchange rehearsal report must be source-safe rehearsal metadata.',
    );
    assertCheck(failures, includesAll(artifact.coverage.observedRehearsalIds, REQUIRED_REHEARSAL_IDS), 'Exchange rehearsal must cover every required rehearsal.');
    assertCheck(failures, includesAll(artifact.coverage.observedFlowIds, REQUIRED_FLOW_IDS), 'Exchange rehearsal must cover every required Exchange flow.');
    assertCheck(failures, artifact.coverage.localRehearsalCovered === true, 'Exchange rehearsal must cover local lane with all flows.');
    assertCheck(failures, artifact.coverage.stagingTestnetRehearsalCovered === true, 'Exchange rehearsal must cover staging-testnet lane with all flows.');
    assertCheck(failures, artifact.coverage.ledgerDatabaseSynchronizationVisible === true, 'Exchange rehearsal must make ledger/database synchronization visible.');
    assertCheck(failures, artifact.coverage.sourceSafeLogsCovered === true, 'Exchange rehearsal must cover source-safe screenshot/log roots.');
    assertCheck(failures, artifact.coverage.valueBearingMainnetVisibleAndBlocked === true, 'Exchange rehearsal must visibly block value-bearing mainnet.');
    for (const flowId of REQUIRED_FLOW_IDS) {
      assertCheck(failures, artifact.coverage[`${flowId}FlowCovered`] === true, `Exchange rehearsal must cover flow ${flowId}.`);
    }
    assertCheck(failures, artifact.coverage.missingSourceRoots.length === 0, 'Exchange rehearsal must have no missing source roots.');
    assertCheck(failures, artifact.coverage.rowsMissingFlowIds.length === 0, 'Exchange rehearsal rows must have flow ids.');
    assertCheck(failures, artifact.coverage.rowsMissingProofRoots.length === 0, 'Exchange rehearsal rows must have proof roots.');
    assertCheck(failures, artifact.coverage.rowsMissingLedgerDatabaseSync.length === 0, 'Exchange rehearsal rows must have ledger/database synchronization checks.');
    assertCheck(failures, artifact.coverage.rowsMissingSourceSafeLogs.length === 0, 'Exchange rehearsal rows must have source-safe screenshot/log roots.');
    assertCheck(failures, artifact.coverage.rowsMissingValidationCommands.length === 0, 'Exchange rehearsal rows must have validation commands.');
    assertCheck(failures, artifact.coverage.valueBearingUnblockedRows.length === 0, 'Exchange rehearsal must keep value-bearing mainnet blocked.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Exchange rehearsal must not serialize credentials.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Exchange rehearsal must not expose source-bearing material.');
    assertCheck(failures, artifact.coverage.rawProtectedPromptVisible === false, 'Exchange rehearsal must not expose raw protected prompts.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Exchange rehearsal must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Exchange rehearsal must not expose wallet private material.');
    assertCheck(
      failures,
      artifact.rows.every((row) => /^exchange-rehearsal-row:[a-f0-9]{24}$/u.test(row.rehearsalRoot)),
      'Exchange rehearsal rows must have deterministic row roots.',
    );
    assertCheck(
      failures,
      artifact.rows.every((row) => row.allowedPayloadFields.includes('flowIds') && row.allowedPayloadFields.includes('proofRoots') && row.allowedPayloadFields.includes('screenshotOrLogRoots')),
      'Exchange rehearsal rows must expose flow ids, proof roots, and screenshot/log roots as allowed fields.',
    );
    assertCheck(
      failures,
      artifact.sourceEvidence.every((entry) => entry.allSourceRootsPresent === true),
      'Exchange rehearsal source evidence must be present.',
    );
  }

  const spec = read(root, 'specifications/BITCODE_SPEC_V36.md');
  const delta = read(root, 'specifications/BITCODE_SPEC_V36_DELTA.md');
  const notes = read(root, 'specifications/BITCODE_SPEC_V36_NOTES.md');
  const parity = read(root, 'specifications/BITCODE_SPEC_V36_PARITY_MATRIX.md');
  const roadmap = read(root, 'specifications/SPECIFICATIONS_ROADMAP.md');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  const rootPackage = read(root, 'package.json');
  const protocolIndex = read(root, 'scripts/specifying/src/index.js');
  const protocolDts = read(root, 'scripts/specifying/src/index.d.ts');
  const protocolReadme = read(root, 'scripts/specifying/README.md');
  const rootReadme = read(root, 'README.md');
  const exchangeReadme = read(root, 'apps/uapi/app/exchange/README.md');

  for (const doc of [spec, delta, notes, parity, roadmap, protocolReadme, rootReadme, exchangeReadme]) {
    assertCheck(failures, doc.includes('ExchangeRehearsal'), 'Docs/specs must name ExchangeRehearsal.');
    assertCheck(failures, doc.includes(ARTIFACT_PATH), `Docs/specs must mention ${ARTIFACT_PATH}.`);
    assertCheck(failures, doc.includes('source-safe-exchange-rehearsal-metadata'), 'Docs/specs must mention source-safe Exchange rehearsal metadata.');
    for (const phrase of REQUIRED_DOC_PHRASES) {
      assertCheck(failures, doc.includes(phrase), `Docs/specs must state: ${phrase}.`);
    }
  }

  assertCheck(failures, spec.includes('## V36 Gate 9 ExchangeRehearsal canon'), 'V36 spec must define the Gate 9 ExchangeRehearsal canon.');
  assertCheck(failures, delta.includes('Gate 9') && delta.includes('pnpm run check:v36-gate9'), 'V36 delta must close Gate 9 checker acceptance.');
  assertCheck(failures, notes.includes('Gate 9 closure'), 'V36 notes must record Gate 9 closure.');
  assertCheck(failures, parity.includes('| Local staging rehearsal | Gate 9 |') && parity.includes('| closed |'), 'V36 parity must close the Gate 9 matrix row.');
  assertCheck(failures, parity.includes('## Gate 9 Parity') && parity.includes('ExchangeRehearsal'), 'V36 parity must include Gate 9 parity details.');
  assertCheck(failures, roadmap.includes('V36 Gate 9 closure anchor'), 'Roadmap must include V36 Gate 9 closure anchor.');
  assertCheck(failures, /Current working gate: V36 Gate 10\b/u.test(roadmap), 'Roadmap must advance current working gate to V36 Gate 10.');
  assertCheck(failures, rootPackage.includes('"generate:v36-exchange-rehearsal"'), 'package.json must expose V36 Exchange rehearsal generation script.');
  assertCheck(failures, rootPackage.includes('"check:v36-exchange-rehearsal"'), 'package.json must expose V36 Exchange rehearsal artifact check script.');
  assertCheck(failures, rootPackage.includes('"check:v36-gate9"'), 'package.json must expose V36 Gate 9 checker.');
  assertCheck(failures, protocolIndex.includes('buildExchangeRehearsal'), 'Protocol package must export Exchange rehearsal builder.');
  assertCheck(failures, protocolDts.includes('buildExchangeRehearsal'), 'Protocol package d.ts must export Exchange rehearsal builder.');
  assertCheck(failures, workflow.includes('check-v36-gate9-exchange-rehearsal.mjs'), 'Gate quality workflow must run Gate 9 checker when present.');
  assertCheck(failures, workflow.includes('v36-exchange-rehearsal.test.js'), 'Gate quality workflow must run Gate 9 package test.');
  assertCheck(failures, canonWorkflow.includes('check-v36-gate9-exchange-rehearsal.mjs'), 'Canon workflow must run Gate 9 checker when present.');

  if (failures.length > 0) {
    process.stderr.write(`V36 Gate 9 Exchange rehearsal check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V36 Gate 9 Exchange rehearsal check passed: ${artifact?.artifactRoot || 'artifact pending'}\n`);
}

main();
