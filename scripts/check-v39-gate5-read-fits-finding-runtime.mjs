#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v39-read-fits-finding-runtime.json';

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
      'Usage: node scripts/check-v39-gate5-read-fits-finding-runtime.mjs [--skip-branch-check] [--skip-package-tests] [--repo-root <path>]',
      '',
      'Checks V39 Gate 5 ReadFitsFinding runtime, many-candidate ranking, source-safe replay, repair posture, docs, workflow wiring, and proof artifact.',
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
      branch === 'version/v39' || /^v39\/gate-(?:5|[6-9]|10|11)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V39 Gate 5+ work must occur on version/v39 or v39/gate-5..11-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'packages/asset-packs-pipelines/domain/src/read-fits-finding-runtime.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/read-fits-finding-runtime.test.ts',
    'packages/asset-packs-pipelines/domain/src/depository-search.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/depository-search.test.ts',
    'packages/asset-packs-pipelines/domain/src/depository-supply-index.ts',
    'packages/asset-packs-pipelines/domain/src/embedding-config.ts',
    'packages/asset-packs-pipelines/domain/src/reading-pipeline-contract.ts',
    'packages/asset-packs-pipelines/domain/src/index.ts',
    'packages/asset-packs-pipelines/domain/package.json',
    'packages/asset-packs-pipelines/domain/README.md',
    'scripts/specifying/src/canonical/v39-read-fits-finding-runtime.js',
    'scripts/specifying/test/v39-read-fits-finding-runtime.test.js',
    'scripts/generate-v39-read-fits-finding-runtime.mjs',
    'scripts/check-v39-gate5-read-fits-finding-runtime.mjs',
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
    assertCheck(failures, fileExists(root, relativePath), `Missing V39 Gate 5 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v39-read-fits-finding-runtime.mjs', '--check']);
    } catch (error) {
      failures.push(`V39 ReadFitsFinding runtime artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', [
        '--test',
        '--test-force-exit',
        'scripts/specifying/test/v39-read-fits-finding-runtime.test.js',
      ]);
    } catch (error) {
      failures.push(`V39 ReadFitsFinding runtime protocol test failed: ${error.stderr || error.message}`);
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
        'src/__tests__/read-fits-finding-runtime.test.ts',
        'src/__tests__/depository-search.test.ts',
        'src/__tests__/embedding-config.test.ts',
        'src/__tests__/reading-pipeline-contract.test.ts',
        '--runInBand',
        '--forceExit',
      ]);
    } catch (error) {
      failures.push(`V39 ReadFitsFinding runtime package tests failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V39 Gate 5 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v39-read-fits-finding-runtime', 'Gate 5 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v39.readFitsFindingRuntime.v1', 'Gate 5 schemaId must match.');
    assertCheck(failures, artifact.version === 'V39' && artifact.currentTarget === 'V38', 'Gate 5 artifact must bind V39 over active V38.');
    assertCheck(failures, artifact.passed === true, 'Gate 5 artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-read-fits-finding-runtime-metadata',
      'Gate 5 artifact must declare source-safe ReadFitsFinding runtime metadata.',
    );
    assertCheck(failures, artifact.coverage.rowCount === 9, 'Gate 5 must cover nine ReadFitsFinding runtime rows.');
    assertCheck(failures, artifact.coverage.phaseCount === 7, 'Gate 5 must cover seven ReadFitsFinding phases.');
    assertCheck(failures, artifact.coverage.ptrrAgentCount === 8, 'Gate 5 must cover eight PTRR agents.');
    assertCheck(failures, artifact.coverage.ptrrStepCount === 32, 'Gate 5 must cover thirty-two PTRR steps.');
    assertCheck(failures, artifact.coverage.failsafeSequenceCount === 96, 'Gate 5 must cover ninety-six Failsafe sequences.');
    assertCheck(failures, artifact.coverage.thricifiedGenerationCount === 96, 'Gate 5 must cover ninety-six ThricifiedGeneration receipts.');
    assertCheck(failures, artifact.coverage.searchChannelCount === 7, 'Gate 5 must cover seven search channels.');
    assertCheck(failures, artifact.coverage.defaultMaxSelectedCandidates === 12, 'Gate 5 must carry many above-threshold candidates.');
    assertCheck(failures, artifact.coverage.embeddingModel === 'text-embedding-3-small', 'Gate 5 must preserve active embedding model.');
    assertCheck(failures, artifact.coverage.embeddingDimensions === 1536, 'Gate 5 must preserve active embedding dimensions.');
    assertCheck(failures, artifact.coverage.vectorDistanceMetric === 'cosine', 'Gate 5 must preserve cosine vector distance.');
    assertCheck(failures, artifact.coverage.vectorMatchRpc === 'match_deliverable_vectors', 'Gate 5 must preserve vector match RPC.');
    assertCheck(failures, artifact.coverage.acceptedNeedRequired === true, 'Gate 5 must require accepted Need admission.');
    assertCheck(failures, artifact.coverage.manyFitsDiscoveryCovered === true, 'Gate 5 must cover many-fit discovery.');
    assertCheck(failures, artifact.coverage.replayReceiptCovered === true, 'Gate 5 must cover replay receipts.');
    assertCheck(failures, artifact.coverage.repairPostureCovered === true, 'Gate 5 must cover repair posture.');
    assertCheck(
      failures,
      includesAll(artifact.coverage.runtimeRecordKinds, ['accepted_need_admission', 'candidate_ranking', 'selected_fit_provenance', 'replay_receipt']),
      'Gate 5 artifact must include the required runtime record kinds.',
    );
    assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Gate 5 must remain source-safe metadata only.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Gate 5 artifact must not expose protected source.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Gate 5 artifact must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Gate 5 artifact must not serialize credentials.');
    assertCheck(failures, artifact.coverage.legacySourceRoots === false, 'Gate 5 must not rely on legacy source roots.');
    assertCheck(failures, Array.isArray(artifact.coverage.failedPredicateIds) && artifact.coverage.failedPredicateIds.length === 0, 'Gate 5 predicates must all pass.');
  }

  const spec = read(root, 'BITCODE_SPEC_V39.md');
  const parity = read(root, 'BITCODE_SPEC_V39_PARITY_MATRIX.md');
  const readme = read(root, 'packages/asset-packs-pipelines/domain/README.md');
  assertCheck(failures, spec.includes('ReadFitsFindingReplayReceipt'), 'V39 spec must name ReadFitsFindingReplayReceipt.');
  assertCheck(failures, spec.includes('v39-read-fits-finding-runtime'), 'V39 spec must name the Gate 5 artifact.');
  assertCheck(failures, parity.includes('Gate 5 Parity'), 'V39 parity matrix must include Gate 5 parity.');
  assertCheck(failures, readme.includes('ReadFitsFinding Runtime'), 'AssetPack README must document ReadFitsFinding Runtime.');

  if (failures.length > 0) {
    process.stderr.write(`V39 Gate 5 ReadFitsFinding runtime check failed:\n- ${failures.join('\n- ')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V39 Gate 5 ReadFitsFinding runtime ok artifact=${artifact.artifactRoot}\n`);
}

main();
