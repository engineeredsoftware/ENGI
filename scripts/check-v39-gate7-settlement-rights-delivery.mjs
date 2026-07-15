#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v39-settlement-rights-delivery.json';

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJ', 'hbGci', 'Oi', 'JIUzI1Ni'].join(''),
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

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function parseArgs(argv) {
  const args = {
    skipBranchCheck: false,
    skipPackageTests: false,
    repoRoot: defaultRepoRoot,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--skip-package-tests') args.skipPackageTests = true;
    else if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }

  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v39-gate7-settlement-rights-delivery.mjs [--skip-branch-check] [--skip-package-tests] [--repo-root <path>]',
      '',
      'Checks V39 Gate 7 settlement, BTD rights transfer, source-to-shares compensation, delivery unlock, repair, synchronization, docs, workflow wiring, and proof artifact.',
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
    pointer === 'V38',
    `BITCODE_SPEC.txt must remain V38 during V39 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v39' || /^v39\/gate-(?:7|8|9|10|11)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V39 Gate 7+ work must occur on version/v39 or v39/gate-7..11-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'packages/asset-packs-pipelines/domain/src/asset-pack-settlement-rights-delivery.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/asset-pack-settlement-rights-delivery.test.ts',
    'packages/asset-packs-pipelines/domain/src/asset-pack-preview-boundary.ts',
    'packages/asset-packs-pipelines/domain/src/postprocess.ts',
    'packages/asset-packs-pipelines/domain/src/index.ts',
    'packages/asset-packs-pipelines/domain/package.json',
    'packages/asset-packs-pipelines/domain/README.md',
    'packages/btd/src/receipts.ts',
    'packages/btd/src/source-to-shares.ts',
    'packages/btd/src/settlement.ts',
    'packages/btd/src/reconciliation.ts',
    'scripts/specifying/src/canonical/v39-settlement-rights-delivery.js',
    'scripts/specifying/test/v39-settlement-rights-delivery.test.js',
    'scripts/generate-v39-settlement-rights-delivery.mjs',
    'scripts/check-v39-gate7-settlement-rights-delivery.mjs',
    'BITCODE_SPEC_V39.md',
    'BITCODE_SPEC_V39_DELTA.md',
    'BITCODE_SPEC_V39_NOTES.md',
    'BITCODE_SPEC_V39_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'scripts/specifying/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V39 Gate 7 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v39-settlement-rights-delivery.mjs', '--check']);
    } catch (error) {
      failures.push(`V39 settlement rights delivery artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', [
        '--test',
        '--test-force-exit',
        'scripts/specifying/test/v39-settlement-rights-delivery.test.js',
      ]);
    } catch (error) {
      failures.push(`V39 settlement rights delivery protocol test failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0 && !args.skipPackageTests) {
    try {
      run(root, 'pnpm', [
        '--filter',
        '@bitcode/asset-packs-pipelines-domain',
        'exec',
        'jest',
        '--config',
        'jest.config.cjs',
        '--runTestsByPath',
        'src/__tests__/asset-pack-settlement-rights-delivery.test.ts',
        'src/__tests__/asset-pack-preview-boundary.test.ts',
        'src/__tests__/postprocess.test.ts',
        '--runInBand',
        '--forceExit',
      ]);
    } catch (error) {
      failures.push(`V39 settlement rights delivery package tests failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V39 Gate 7 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v39-settlement-rights-delivery', 'Gate 7 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v39.settlementRightsDelivery.v1', 'Gate 7 schemaId must match.');
    assertCheck(failures, artifact.version === 'V39' && artifact.currentTarget === 'V38', 'Gate 7 artifact must bind V39 over active V38.');
    assertCheck(failures, artifact.passed === true, 'Gate 7 artifact must pass.');
    assertCheck(failures, artifact.coverage.rowCount === 9, 'Gate 7 must cover nine settlement rows.');
    assertCheck(failures, artifact.coverage.runtimeType === 'AssetPackSettlementRightsDeliveryBoundary', 'Gate 7 must cover AssetPackSettlementRightsDeliveryBoundary.');
    assertCheck(failures, artifact.coverage.rightsTransferType === 'BtdRightsTransferReceipt', 'Gate 7 must cover BtdRightsTransferReceipt.');
    assertCheck(failures, artifact.coverage.sourceToSharesType === 'SourceToSharesProof', 'Gate 7 must cover SourceToSharesProof.');
    assertCheck(failures, artifact.coverage.reconciliationType === 'LedgerDatabaseReconciliationReport', 'Gate 7 must cover reconciliation.');
    assertCheck(failures, artifact.coverage.deliveryType === 'AssetPackDeliveryUnlockReceipt', 'Gate 7 must cover delivery unlock.');
    assertCheck(failures, artifact.coverage.stagingProjectRef === 'tkpyosihuouusyaxtbau', 'Gate 7 must bind staging-testnet Supabase project ref.');
    assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Gate 7 must remain source-safe metadata only.');
    assertCheck(failures, artifact.coverage.protectedSourcePayloadSerialized === false, 'Gate 7 artifact must not serialize protected source.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Gate 7 artifact must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Gate 7 artifact must not expose private wallet material.');
    assertCheck(failures, artifact.coverage.settlementPrivatePayloadVisible === false, 'Gate 7 artifact must not expose private settlement payloads.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Gate 7 artifact must not serialize credentials.');
    assertCheck(failures, artifact.coverage.confirmedPaymentCovered === true, 'Gate 7 must cover confirmed payment.');
    assertCheck(failures, artifact.coverage.underpaymentBlockedCovered === true, 'Gate 7 must cover underpayment blocking.');
    assertCheck(failures, artifact.coverage.finalityBlockedCovered === true, 'Gate 7 must cover finality blocking.');
    assertCheck(failures, artifact.coverage.reconciliationRepairCovered === true, 'Gate 7 must cover reconciliation repair.');
    assertCheck(failures, artifact.coverage.btdRightsTransferCovered === true, 'Gate 7 must cover BTD rights transfer.');
    assertCheck(failures, artifact.coverage.sourceToSharesCovered === true, 'Gate 7 must cover source-to-shares.');
    assertCheck(failures, Array.isArray(artifact.coverage.failedPredicateIds) && artifact.coverage.failedPredicateIds.length === 0, 'Gate 7 predicates must all pass.');
  }

  const spec = read(root, 'BITCODE_SPEC_V39.md');
  const parity = read(root, 'BITCODE_SPEC_V39_PARITY_MATRIX.md');
  const readme = read(root, 'packages/asset-packs-pipelines/domain/README.md');
  assertCheck(failures, spec.includes('AssetPackSettlementRightsDeliveryBoundary'), 'V39 spec must name AssetPackSettlementRightsDeliveryBoundary.');
  assertCheck(failures, spec.includes('v39-settlement-rights-delivery'), 'V39 spec must name the Gate 7 artifact.');
  assertCheck(failures, parity.includes('Gate 7 Parity'), 'V39 parity matrix must include Gate 7 parity.');
  assertCheck(failures, readme.includes('Settlement Rights Delivery'), 'AssetPack README must document Settlement Rights Delivery.');

  if (failures.length > 0) {
    process.stderr.write(`V39 Gate 7 settlement rights delivery check failed:\n- ${failures.join('\n- ')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V39 Gate 7 settlement rights delivery ok artifact=${artifact.artifactRoot}\n`);
}

main();
