#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v39-assetpack-preview-quote-boundary.json';

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

function includesAll(values, requiredValues) {
  return requiredValues.every((value) => values.includes(value));
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
      'Usage: node scripts/check-v39-gate6-assetpack-preview-quote-boundary.mjs [--skip-branch-check] [--skip-package-tests] [--repo-root <path>]',
      '',
      'Checks V39 Gate 6 AssetPack preview, deterministic quote, settlement instructions, delivery lock, disclosure boundary, docs, workflow wiring, and proof artifact.',
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
      branch === 'version/v39' || /^v39\/gate-(?:6|[7-9]|10|11)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V39 Gate 6+ work must occur on version/v39 or v39/gate-6..11-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'packages/asset-packs-pipelines/domain/src/asset-pack-preview-boundary.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/asset-pack-preview-boundary.test.ts',
    'packages/asset-packs-pipelines/domain/src/asset-pack-disclosure.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/asset-pack-disclosure.test.ts',
    'packages/asset-packs-pipelines/domain/src/read-need.ts',
    'packages/asset-packs-pipelines/domain/src/postprocess.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/postprocess.test.ts',
    'packages/asset-packs-pipelines/domain/src/index.ts',
    'packages/asset-packs-pipelines/domain/package.json',
    'packages/asset-packs-pipelines/domain/README.md',
    'packages/specifying/src/canonical/v39-assetpack-preview-quote-boundary.js',
    'packages/specifying/test/v39-assetpack-preview-quote-boundary.test.js',
    'scripts/generate-v39-assetpack-preview-quote-boundary.mjs',
    'scripts/check-v39-gate6-assetpack-preview-quote-boundary.mjs',
    'BITCODE_SPEC_V39.md',
    'BITCODE_SPEC_V39_DELTA.md',
    'BITCODE_SPEC_V39_NOTES.md',
    'BITCODE_SPEC_V39_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'packages/specifying/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V39 Gate 6 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v39-assetpack-preview-quote-boundary.mjs', '--check']);
    } catch (error) {
      failures.push(`V39 AssetPack preview quote boundary artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', [
        '--test',
        '--test-force-exit',
        'packages/specifying/test/v39-assetpack-preview-quote-boundary.test.js',
      ]);
    } catch (error) {
      failures.push(`V39 AssetPack preview quote boundary protocol test failed: ${error.stderr || error.message}`);
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
        'src/__tests__/asset-pack-preview-boundary.test.ts',
        'src/__tests__/asset-pack-disclosure.test.ts',
        'src/__tests__/postprocess.test.ts',
        'src/__tests__/read-need.test.ts',
        '--runInBand',
        '--forceExit',
      ]);
    } catch (error) {
      failures.push(`V39 AssetPack preview quote boundary package tests failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V39 Gate 6 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v39-assetpack-preview-quote-boundary', 'Gate 6 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v39.assetPackPreviewQuoteBoundary.v1', 'Gate 6 schemaId must match.');
    assertCheck(failures, artifact.version === 'V39' && artifact.currentTarget === 'V38', 'Gate 6 artifact must bind V39 over active V38.');
    assertCheck(failures, artifact.passed === true, 'Gate 6 artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-assetpack-preview-quote-boundary',
      'Gate 6 artifact must declare source-safe AssetPack preview quote boundary.',
    );
    assertCheck(failures, artifact.coverage.rowCount === 9, 'Gate 6 must cover nine preview boundary rows.');
    assertCheck(failures, artifact.coverage.runtimeType === 'AssetPackPreviewBoundary', 'Gate 6 must cover AssetPackPreviewBoundary.');
    assertCheck(failures, artifact.coverage.quoteType === 'AssetPackPreviewQuoteReceipt', 'Gate 6 must cover AssetPackPreviewQuoteReceipt.');
    assertCheck(failures, artifact.coverage.disclosureType === 'AssetPackDisclosureReview', 'Gate 6 must cover AssetPackDisclosureReview.');
    assertCheck(failures, artifact.coverage.settlementType === 'AssetPackPreviewSettlementInstructions', 'Gate 6 must cover settlement instructions.');
    assertCheck(failures, artifact.coverage.deliveryType === 'AssetPackPreviewDeliveryPosture', 'Gate 6 must cover delivery posture.');
    assertCheck(failures, artifact.coverage.shareToFeeFormula === 'sum(measurement.weight * measurement.volume * admitted_fit_quality)', 'Gate 6 must preserve deterministic share-to-fee formula.');
    assertCheck(failures, artifact.coverage.satsPerWeightedVolume === 1000, 'Gate 6 must preserve sats-per-weighted-volume.');
    assertCheck(failures, artifact.coverage.minimumSats === 546, 'Gate 6 must preserve minimum sats.');
    assertCheck(failures, artifact.coverage.dustFloorSats === 546, 'Gate 6 must preserve dust floor sats.');
    assertCheck(failures, artifact.coverage.btcFeeOperation === 'reader_wallet_authorized_before_broadcast', 'Gate 6 must require reader wallet authorization before broadcast.');
    assertCheck(failures, includesAll(artifact.coverage.storageRecordKinds, ['source_safe_preview', 'deterministic_btc_quote', 'disclosure_review', 'settlement_instructions', 'delivery_posture', 'replay_receipt']), 'Gate 6 storage record kinds are incomplete.');
    assertCheck(failures, artifact.coverage.requiredReadbacksBeforeUnlock.includes('btd_rights_transfer_receipt'), 'Gate 6 must require BTD rights transfer readback before unlock.');
    assertCheck(failures, artifact.coverage.withheldBeforeSettlement.includes('source-bearing manifest entries'), 'Gate 6 must withhold source-bearing manifest entries.');
    assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Gate 6 must remain source-safe metadata only.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Gate 6 artifact must not expose protected source.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Gate 6 artifact must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Gate 6 artifact must not expose private wallet material.');
    assertCheck(failures, artifact.coverage.settlementPrivatePayloadVisible === false, 'Gate 6 artifact must not expose private settlement payloads.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Gate 6 artifact must not serialize credentials.');
    assertCheck(failures, artifact.coverage.quoteDeterminismCovered === true, 'Gate 6 must cover quote determinism.');
    assertCheck(failures, artifact.coverage.disclosureLeakScanCovered === true, 'Gate 6 must cover disclosure leak scanning.');
    assertCheck(failures, artifact.coverage.settlementInstructionsCovered === true, 'Gate 6 must cover settlement instructions.');
    assertCheck(failures, artifact.coverage.deliveryPostureCovered === true, 'Gate 6 must cover delivery posture.');
    assertCheck(failures, artifact.coverage.replayReceiptCovered === true, 'Gate 6 must cover replay receipts.');
    assertCheck(failures, Array.isArray(artifact.coverage.failedPredicateIds) && artifact.coverage.failedPredicateIds.length === 0, 'Gate 6 predicates must all pass.');
  }

  const spec = read(root, 'BITCODE_SPEC_V39.md');
  const parity = read(root, 'BITCODE_SPEC_V39_PARITY_MATRIX.md');
  const readme = read(root, 'packages/asset-packs-pipelines/domain/README.md');
  assertCheck(failures, spec.includes('AssetPackPreviewBoundary'), 'V39 spec must name AssetPackPreviewBoundary.');
  assertCheck(failures, spec.includes('v39-assetpack-preview-quote-boundary'), 'V39 spec must name the Gate 6 artifact.');
  assertCheck(failures, parity.includes('Gate 6 Parity'), 'V39 parity matrix must include Gate 6 parity.');
  assertCheck(failures, readme.includes('AssetPack Preview Boundary'), 'AssetPack README must document AssetPack Preview Boundary.');

  if (failures.length > 0) {
    process.stderr.write(`V39 Gate 6 AssetPack preview quote boundary check failed:\n- ${failures.join('\n- ')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V39 Gate 6 AssetPack preview quote boundary ok artifact=${artifact.artifactRoot}\n`);
}

main();
