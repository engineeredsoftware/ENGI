#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v40-ledger-storage-sync.json';

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  String.fromCharCode(101, 121, 74, 104, 98, 71, 99, 105, 79, 105, 74, 73, 85, 122, 73, 49, 78, 105),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
  ['PRIVATE', 'KEY'].join('_'),
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

function commandExists(root, command) {
  try {
    execFileSync('sh', ['-lc', `command -v ${command}`], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return true;
  } catch {
    return false;
  }
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function parseArgs(argv) {
  const args = {
    repoRoot: defaultRepoRoot,
    skipBranchCheck: false,
    skipIntegrationTests: false,
    skipPackageTests: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--skip-integration-tests') args.skipIntegrationTests = true;
    else if (arg === '--skip-package-tests') args.skipPackageTests = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }

  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v40-gate8-ledger-storage-sync.mjs [--skip-branch-check] [--skip-package-tests] [--skip-integration-tests] [--repo-root <path>]',
      '',
      'Checks V40 Gate 8 ledger, database, storage, wallet, rights, settlement, repair, and delivery synchronization proof.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function runFocusedTests(root, failures, skipIntegrationTests) {
  const commands = [
    ['node', ['--test', '--test-force-exit', 'scripts/specifying/test/v40-ledger-storage-sync.test.js']],
  ];

  if (commandExists(root, 'pnpm')) {
    commands.push(
      ['pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'exec', 'jest', '--config', 'jest.config.cjs', '--runTestsByPath', 'src/__tests__/asset-pack-settlement-rights-delivery.test.ts', '--runInBand', '--forceExit']],
      ['pnpm', ['--filter', '@bitcode/btd', 'exec', 'jest', '--config', 'jest.config.cjs', '--runTestsByPath', '__tests__/btc-fee-operation.test.ts', '__tests__/reconciliation.test.ts', '__tests__/source-to-shares.test.ts', '--runInBand', '--forceExit']],
    );

    if (!skipIntegrationTests) {
      commands.push(
        ['pnpm', ['--dir', 'apps/uapi', 'exec', 'jest', '--runTestsByPath',
          'tests/bitcodeLedgerStorageSync.test.ts',
          'tests/terminalWalletBtcOperation.test.ts',
          'tests/terminalJournalReconciliation.test.ts',
          'tests/terminalTransactionDetailCards.test.tsx',
          'tests/api/transactionWriteReadinessRoutes.test.ts',
          '--runInBand',
        ]],
      );
    }
  }

  for (const [command, args] of commands) {
    try {
      run(root, command, args);
    } catch (error) {
      failures.push(`Gate 8 focused test failed for ${command} ${args.join(' ')}: ${error.stderr || error.message}`);
      return;
    }
  }
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

  assertCheck(failures, pointer === 'V39', `BITCODE_SPEC.txt must remain V39 during V40 gate work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v40' || /^v40\/gate-(?:8|9|10|11)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V40 Gate 8+ work must occur on version/v40 or v40/gate-8..11-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'scripts/specifying/src/canonical/v40-ledger-storage-sync.js',
    'scripts/specifying/test/v40-ledger-storage-sync.test.js',
    'scripts/generate-v40-ledger-storage-sync.mjs',
    'scripts/check-v40-gate8-ledger-storage-sync.mjs',
    'apps/uapi/app/bitcode-ledger-storage-sync.ts',
    'apps/uapi/tests/bitcodeLedgerStorageSync.test.ts',
    'packages/asset-packs-pipelines/domain/src/asset-pack-settlement-rights-delivery.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/asset-pack-settlement-rights-delivery.test.ts',
    'packages/btd/src/btc-fee-operation.ts',
    'packages/btd/src/wallet.ts',
    'packages/btd/src/reconciliation.ts',
    'BITCODE_SPEC_V40.md',
    'BITCODE_SPEC_V40_DELTA.md',
    'BITCODE_SPEC_V40_NOTES.md',
    'BITCODE_SPEC_V40_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'scripts/specifying/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V40 Gate 8 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v40-ledger-storage-sync.mjs', '--check']);
    } catch (error) {
      failures.push(`V40 ledger/storage sync artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0 && !args.skipPackageTests) {
    runFocusedTests(root, failures, args.skipIntegrationTests);
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V40 Gate 8 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v40-ledger-storage-sync', 'Gate 8 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v40.ledgerStorageSync.v1', 'Gate 8 schemaId must match.');
    assertCheck(failures, artifact.version === 'V40' && artifact.currentTarget === 'V39', 'Gate 8 artifact must bind V40 over active V39.');
    assertCheck(failures, artifact.passed === true, 'Gate 8 artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-ledger-database-storage-wallet-delivery-sync',
      'Gate 8 artifact must declare source-safe synchronization metadata.',
    );
    assertCheck(failures, artifact.coverage.rowCount === 10, 'Gate 8 must cover ten synchronization rows.');
    assertCheck(failures, artifact.coverage.coveredRowCount === 10, 'Gate 8 synchronization rows must all be covered.');
    assertCheck(failures, artifact.coverage.allCriticalSurfacesClosed === true, 'Gate 8 must close all critical synchronization surfaces.');
    assertCheck(failures, artifact.coverage.ledgerDatabaseStorageReconciliationCovered === true, 'Gate 8 must prove ledger/database/storage reconciliation.');
    assertCheck(failures, artifact.coverage.walletNoCustodyCovered === true, 'Gate 8 must prove no-custody wallet authority.');
    assertCheck(failures, artifact.coverage.postSettlementDeliveryUnlockCovered === true, 'Gate 8 must prove post-settlement delivery unlock.');
    assertCheck(failures, artifact.coverage.noForbiddenPayloadsSerialized === true, 'Gate 8 artifact must serialize no forbidden payloads.');
    assertCheck(failures, artifact.requiredReadbacksBeforeUnlock.length === 5, 'Gate 8 must bind five required readbacks before unlock.');
    assertCheck(failures, artifact.sourceSafety.walletPrivateMaterialVisible === false, 'Gate 8 must hide wallet private material.');
    assertCheck(failures, artifact.sourceSafety.unpaidAssetPackSourceVisible === false, 'Gate 8 must hide unpaid AssetPack source.');
    assertCheck(failures, artifact.sourceSafety.privateSettlementPayloadVisible === false, 'Gate 8 must hide private settlement payloads.');
  }

  if (failures.length) {
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exit(1);
  }

  process.stdout.write('V40 Gate 8 ledger/database/storage/wallet/delivery synchronization proof passed.\n');
}

main();
