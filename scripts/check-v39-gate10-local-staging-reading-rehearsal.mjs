#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v39-local-staging-reading-rehearsal.json';

const REQUIRED_ROW_IDS = [
  'lane:local-reading-rehearsal',
  'lane:staging-testnet-reading-rehearsal',
  'stage:request-read',
  'stage:review-synthesized-need',
  'stage:request-finding-fits',
  'stage:review-assetpack-preview',
  'stage:buy-assetpack-settle',
  'search:depository-many-fits',
  'telemetry:rich-stream-readback',
  'sync:ledger-database-storage-reconciliation',
  'delivery:post-settlement-pull-request',
  'boundary:value-bearing-mainnet-blocked',
];

const REQUIRED_LANE_IDS = ['local', 'staging-testnet'];
const REQUIRED_STAGE_IDS = [
  'request-read',
  'review-synthesized-need',
  'request-finding-fits',
  'review-assetpack-preview',
  'buy-assetpack-settle',
];

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
      'Usage: node scripts/check-v39-gate10-local-staging-reading-rehearsal.mjs [--skip-branch-check] [--skip-package-tests] [--repo-root <path>]',
      '',
      'Checks V39 Gate 10 local/staging Reading rehearsal across the five Reading stages, real-inference staging posture, source-safe preview, settlement, telemetry readback, docs, workflows, package tests, and generated proof artifact.',
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
    pointer === 'V38',
    `BITCODE_SPEC.txt must remain V38 during V39 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v39' || /^v39\/gate-(?:10|11)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V39 Gate 10+ work must occur on version/v39 or v39/gate-10..11-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'packages/asset-packs-pipelines/domain/src/reading-local-staging-rehearsal.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/reading-local-staging-rehearsal.test.ts',
    'packages/asset-packs-pipelines/domain/src/index.ts',
    'packages/asset-packs-pipelines/domain/src/postprocess.ts',
    'packages/asset-packs-pipelines/domain/package.json',
    'packages/asset-packs-pipelines/domain/README.md',
    'scripts/specifying/src/canonical/v39-local-staging-reading-rehearsal.js',
    'scripts/specifying/test/v39-local-staging-reading-rehearsal.test.js',
    'scripts/specifying/src/index.js',
    'scripts/specifying/src/index.d.ts',
    'scripts/specifying/README.md',
    'scripts/generate-v39-local-staging-reading-rehearsal.mjs',
    'scripts/check-v39-gate10-local-staging-reading-rehearsal.mjs',
    '.specifications/BITCODE_SPEC_V39.md',
    '.specifications/BITCODE_SPEC_V39_DELTA.md',
    '.specifications/BITCODE_SPEC_V39_NOTES.md',
    '.specifications/BITCODE_SPEC_V39_PARITY_MATRIX.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V39 Gate 10 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v39-local-staging-reading-rehearsal.mjs', '--check']);
    } catch (error) {
      failures.push(`V39 local/staging Reading rehearsal artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', [
        '--test',
        '--test-force-exit',
        'scripts/specifying/test/v39-local-staging-reading-rehearsal.test.js',
      ]);
    } catch (error) {
      failures.push(`V39 local/staging Reading rehearsal protocol test failed: ${error.stderr || error.message}`);
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
        'src/__tests__/reading-local-staging-rehearsal.test.ts',
        'src/__tests__/reading-interface-product-parity.test.ts',
        'src/__tests__/reading-operational-telemetry-repair-readback.test.ts',
        'src/__tests__/postprocess.test.ts',
        '--runInBand',
        '--forceExit',
      ]);
    } catch (error) {
      failures.push(`V39 Gate 10 package tests failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V39 Gate 10 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v39-local-staging-reading-rehearsal', 'Gate 10 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v39.localStagingReadingRehearsal.v1', 'Gate 10 schemaId must match.');
    assertCheck(failures, artifact.version === 'V39' && artifact.currentTarget === 'V38', 'Gate 10 artifact must bind V39 over active V38.');
    assertCheck(failures, artifact.passed === true, 'Gate 10 artifact must pass.');
    assertCheck(failures, includesAll(artifact.rowIds, REQUIRED_ROW_IDS), 'Gate 10 artifact must cover all rehearsal rows.');
    assertCheck(failures, includesAll(artifact.laneIds, REQUIRED_LANE_IDS), 'Gate 10 artifact must cover local and staging-testnet lanes.');
    assertCheck(failures, includesAll(artifact.stageIds, REQUIRED_STAGE_IDS), 'Gate 10 artifact must cover all five Reading stages.');
    assertCheck(failures, artifact.coverage.rowCount === 12, 'Gate 10 row count must be 12.');
    assertCheck(failures, artifact.coverage.laneCount === 2, 'Gate 10 lane count must be 2.');
    assertCheck(failures, artifact.coverage.stageCount === 5, 'Gate 10 stage count must be 5.');
    assertCheck(failures, artifact.coverage.stagingProjectRef === 'tkpyosihuouusyaxtbau', 'Gate 10 must bind staging-testnet Supabase project ref.');
    assertCheck(failures, artifact.coverage.stagingRestHost === 'https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/', 'Gate 10 must bind staging-testnet REST host.');
    assertCheck(failures, artifact.coverage.packageRuntimeType === 'ReadingLocalStagingRehearsal', 'Gate 10 must cover ReadingLocalStagingRehearsal.');
    assertCheck(failures, artifact.coverage.localLaneCovered === true, 'Gate 10 must cover local lane.');
    assertCheck(failures, artifact.coverage.stagingTestnetLaneCovered === true, 'Gate 10 must cover staging-testnet lane.');
    assertCheck(failures, artifact.coverage.fiveStageReadingCovered === true, 'Gate 10 must cover the five Reading stages.');
    assertCheck(failures, artifact.coverage.readNeedComprehensionCovered === true, 'Gate 10 must cover ReadNeedComprehension.');
    assertCheck(failures, artifact.coverage.readFitsFindingCovered === true, 'Gate 10 must cover ReadFitsFinding.');
    assertCheck(failures, artifact.coverage.depositoryManyFitsCovered === true, 'Gate 10 must cover many-fit Depository search.');
    assertCheck(failures, artifact.coverage.sourceSafePreviewCovered === true, 'Gate 10 must cover source-safe preview.');
    assertCheck(failures, artifact.coverage.settlementRightsDeliveryCovered === true, 'Gate 10 must cover settlement rights delivery.');
    assertCheck(failures, artifact.coverage.telemetryStreamingReadbackCovered === true, 'Gate 10 must cover telemetry streaming readback.');
    assertCheck(failures, artifact.coverage.interfaceNoBypassCovered === true, 'Gate 10 must cover interface no-bypass posture.');
    assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Gate 10 artifact must be source-safe metadata only.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Protected source must not be visible.');
    assertCheck(failures, artifact.coverage.protectedSourcePayloadSerialized === false, 'Protected source payload must not be serialized.');
    assertCheck(failures, artifact.coverage.rawPromptTextSerialized === false, 'Raw prompt text must not be serialized.');
    assertCheck(failures, artifact.coverage.rawInterpolatedPromptVisible === false, 'Raw interpolated prompt must not be visible.');
    assertCheck(failures, artifact.coverage.rawProviderResponseVisible === false, 'Raw provider response must not be visible.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Unpaid AssetPack source must not be visible.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Credentials must not be serialized.');
    assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Wallet private material must not be visible.');
    assertCheck(failures, artifact.coverage.privateSettlementPayloadVisible === false, 'Private settlement payloads must not be visible.');
    assertCheck(failures, artifact.coverage.liveLogPayloadSerialized === false, 'Live log payloads must not be serialized.');
    assertCheck(failures, artifact.coverage.valueBearingMainnetAdmitted === false, 'Gate 10 must block value-bearing mainnet.');
    assertCheck(failures, Array.isArray(artifact.coverage.failedPredicateIds) && artifact.coverage.failedPredicateIds.length === 0, 'Gate 10 predicates must all pass.');
  }

  const spec = read(root, '.specifications/BITCODE_SPEC_V39.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V39_PARITY_MATRIX.md');
  const readme = read(root, 'packages/asset-packs-pipelines/domain/README.md');
  assertCheck(failures, spec.includes('ReadingLocalStagingRehearsal'), 'V39 spec must name ReadingLocalStagingRehearsal.');
  assertCheck(failures, spec.includes('v39-local-staging-reading-rehearsal'), 'V39 spec must name the Gate 10 artifact.');
  assertCheck(failures, parity.includes('Gate 10 Parity'), 'V39 parity matrix must include Gate 10 parity.');
  assertCheck(failures, readme.includes('Reading Local/Staging Rehearsal'), 'AssetPack README must document Reading Local/Staging Rehearsal.');

  if (failures.length > 0) {
    process.stderr.write(`V39 Gate 10 local/staging Reading rehearsal check failed:\n- ${failures.join('\n- ')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V39 Gate 10 local/staging Reading rehearsal ok artifact=${artifact.artifactRoot}\n`);
}

main();
