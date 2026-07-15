#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT = '.bitcode/v32-ledger-btd-settlement-failure-state-coverage.json';

const REQUIRED_BTC_PHASES = [
  'blocked',
  'quoted',
  'psbt_ready',
  'signed',
  'broadcast',
  'confirmed',
  'replaced',
  'reorged',
  'failed',
];

const REQUIRED_DRIFTS = [
  'missing_database_projection',
  'ledger_root_mismatch',
  'ledger_finality_mismatch',
  'database_orphan_projection',
  'missing_object_storage_artifact',
  'object_storage_root_mismatch',
  'staging_testnet_readback_blocked',
  'settlement_conservation_drift',
];

const REQUIRED_REPAIR_ACTIONS = [
  'retry_database_readback',
  'retry_object_storage_write',
  'retry_staging_testnet_readback',
  'project_ledger_fact',
  'update_finality_state',
  'quarantine_database_projection',
  'quarantine_object_storage_artifact',
  'pause_settlement_unlock',
  'recover_delivery',
];

const REQUIRED_READBACK_KEYS = [
  'semanticMeasurement',
  'measureMintReceipt',
  'assetPackRange',
  'btdCell',
  'ownershipEvent',
  'readLicense',
  'mintReceipt',
  'btcFeeTransaction',
  'ledgerAnchor',
  'terminalJournal',
  'cryptoTelemetry',
];

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
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
  return execFileSync(command, args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
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
      'Usage: node scripts/check-v32-gate5-ledger-btd-settlement-failure-states.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V32 Gate 5 ledger, BTD, settlement, projection, and delivery failure-state coverage.',
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

  assertCheck(failures, pointer === 'V31', `BITCODE_SPEC.txt must remain V31 during V32 gate work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v32' || /^v32\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V32 work must occur on version/v32 or v32/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT,
    'scripts/generate-v32-ledger-btd-settlement-failure-states.mjs',
    'scripts/check-v32-gate5-ledger-btd-settlement-failure-states.mjs',
    'packages/btd/__tests__/v32-ledger-btd-settlement-failure-states.test.ts',
    'packages/btd/src/btc-fee-operation.ts',
    'packages/btd/src/bitcoin-fees.ts',
    'packages/btd/src/receipts.ts',
    'packages/btd/src/reconciliation.ts',
    'packages/btd/src/source-to-shares.ts',
    'packages/btd/src/settlement.ts',
    'specifications/BITCODE_SPEC_V32.md',
    'specifications/BITCODE_SPEC_V32_DELTA.md',
    'specifications/BITCODE_SPEC_V32_NOTES.md',
    'specifications/BITCODE_SPEC_V32_PARITY_MATRIX.md',
    'specifications/SPECIFICATIONS_ROADMAP.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    'scripts/v32-proof-coverage-matrix.mjs',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V32 Gate 5 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'pnpm', ['run', 'check:v32-ledger-btd-settlement-failure-states']);
    } catch (error) {
      failures.push(`V32 Gate 5 artifact check failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT) ? read(root, ARTIFACT) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V32 Gate 5 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v32-ledger-btd-settlement-failure-state-coverage', 'Gate 5 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v32.ledgerBtdSettlementFailureStateCoverage.v1', 'Gate 5 schemaId must match.');
    assertCheck(failures, artifact.version === 'V32' && artifact.currentTarget === 'V31', 'Gate 5 artifact must bind V32 over active V31.');
    assertCheck(failures, artifact.passed === true, 'Gate 5 artifact must pass.');
    assertCheck(failures, artifact.sourceSafetyVerdict === 'source-safe-economic-proof-metadata', 'Gate 5 artifact must be source-safe economic proof metadata.');
    assertCheck(
      failures,
      includesAll(artifact.surfaceCoverage.map((entry) => entry.surfaceId), [
        'protocol-btd',
        'ledger',
        'database',
        'object-storage',
        'settlement-disclosure-delivery',
      ]),
      'Gate 5 artifact must cover protocol-btd, ledger, database, object-storage, and settlement-disclosure-delivery surfaces.',
    );
    assertCheck(failures, includesAll(artifact.btcFeeCoverage.phases, REQUIRED_BTC_PHASES), 'Gate 5 artifact must cover every BTC fee operation phase.');
    assertCheck(
      failures,
      includesAll(artifact.btdReceiptCoverage.receiptTypes, [
        'btd.asset_pack_mint_receipt',
        'btd.read_receipt',
        'btd.rights_transfer_receipt',
      ]),
      'Gate 5 artifact must cover BTD mint/read/rights-transfer receipts.',
    );
    assertCheck(failures, includesAll(artifact.reconciliationCoverage.driftKinds, REQUIRED_DRIFTS), 'Gate 5 artifact must cover every projection drift kind.');
    assertCheck(failures, includesAll(artifact.reconciliationCoverage.repairActionKinds, REQUIRED_REPAIR_ACTIONS), 'Gate 5 artifact must cover every projection repair action kind.');
    assertCheck(failures, artifact.reconciliationCoverage.secretValuesStored === false, 'Gate 5 artifact must record that projection readbacks store no secret values.');
    assertCheck(
      failures,
      includesAll(artifact.settlementUnlockCoverage.requiredReadbackKeys, REQUIRED_READBACK_KEYS),
      'Gate 5 artifact must cover every settlement readback key.',
    );
    assertCheck(
      failures,
      artifact.sourceEvidence.every((entry) => entry.requiredTokens.every((token) => token.present === true)),
      'Gate 5 source evidence tokens must all be present.',
    );
  }

  const spec = read(root, 'specifications/BITCODE_SPEC_V32.md');
  const delta = read(root, 'specifications/BITCODE_SPEC_V32_DELTA.md');
  const notes = read(root, 'specifications/BITCODE_SPEC_V32_NOTES.md');
  const parity = read(root, 'specifications/BITCODE_SPEC_V32_PARITY_MATRIX.md');
  const roadmap = read(root, 'specifications/SPECIFICATIONS_ROADMAP.md');
  const packageJson = read(root, 'package.json');
  const workflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const matrix = read(root, 'scripts/v32-proof-coverage-matrix.mjs');
  const test = read(root, 'packages/btd/__tests__/v32-ledger-btd-settlement-failure-states.test.ts');
  const specFamily = `${spec}\n${delta}\n${notes}\n${parity}`;

  for (const phrase of [
    ARTIFACT,
    'Ledger BTD Settlement Failure-State Coverage',
    'BTC fee quote',
    'BTD rights-transfer',
    'source-to-shares',
    'object-storage',
    'paid unlock',
    'projection drift',
  ]) {
    assertCheck(failures, specFamily.includes(phrase), `V32 spec family must describe Gate 5 phrase: ${phrase}.`);
  }

  assertCheck(failures, /Current working gate: V32 Gate (?:[5-9]|10)\b/u.test(roadmap), 'Roadmap must track V32 Gate 5 or later as the current working gate.');
  assertCheck(failures, packageJson.includes('"generate:v32-ledger-btd-settlement-failure-states"'), 'package.json must expose generate:v32-ledger-btd-settlement-failure-states.');
  assertCheck(failures, packageJson.includes('"check:v32-ledger-btd-settlement-failure-states"'), 'package.json must expose check:v32-ledger-btd-settlement-failure-states.');
  assertCheck(failures, packageJson.includes('"check:v32-gate5"'), 'package.json must expose check:v32-gate5.');
  assertCheck(
    failures,
    workflow.includes('check-v32-gate5-ledger-btd-settlement-failure-states.mjs') &&
      workflow.includes('v32-ledger-btd-settlement-failure-states.test.ts'),
    'Gate quality workflow must run the V32 Gate 5 checker and focused BTD settlement failure-state test.',
  );
  assertCheck(
    failures,
    matrix.includes('v32-ledger-btd-settlement-failure-state-coverage.json') &&
      matrix.includes('v32-ledger-btd-settlement-failure-states.test.ts'),
    'V32 proof coverage matrix must reference the Gate 5 artifact and focused test.',
  );
  for (const phrase of [
    'fails closed with actionable BTC blocked-readiness receipts',
    'source-safe until paid finality',
    'source-to-shares conservation',
    'projection repair states',
    'settlement readback and PR delivery agree',
  ]) {
    assertCheck(failures, test.includes(phrase), `V32 Gate 5 test must assert: ${phrase}.`);
  }

  if (failures.length > 0) {
    process.stderr.write('V32 Gate 5 ledger BTD settlement failure-state check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V32 Gate 5 ledger BTD settlement failure-state coverage ok artifact=${ARTIFACT}\n`);
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
