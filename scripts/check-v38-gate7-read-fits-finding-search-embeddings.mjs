#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.proofs/v38/read-fits-finding-search-embeddings.json';

const REQUIRED_PHASE_IDS = [
  'ReadFitsFindingSynthesis.admit',
  'ReadFitsFindingSynthesis.prepare',
  'ReadFitsFindingSynthesis.discovery',
  'ReadFitsFindingSynthesis.implementation',
  'ReadFitsFindingSynthesis.validate',
  'ReadFitsFindingSynthesis.preview',
  'ReadFitsFindingSynthesis.settle',
];

const REQUIRED_SEARCH_CHANNEL_IDS = [
  'lexical',
  'symbolic',
  'path',
  'metadata',
  'measurement',
  'embedding-vector',
  'provider-specific',
];

const REQUIRED_RECEIPT_FIELDS = [
  'phaseIds',
  'agentIds',
  'ptrrStepIds',
  'failsafeSequenceIds',
  'thricifiedGenerationIds',
  'toolIds',
  'searchChannelIds',
  'providerIds',
  'thresholdPosture',
  'queryPlanRoot',
  'queryRoot',
  'rankingRoot',
  'searchedAssetCount',
  'candidateCounts',
  'selectedFitProvenanceRoot',
  'embeddingPolicy',
  'sourceSafety',
  'roots',
];

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOi', 'JIUzI1Ni'].join(''),
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
      'Usage: node scripts/check-v38-gate7-read-fits-finding-search-embeddings.mjs [--skip-branch-check] [--skip-package-tests] [--repo-root <path>]',
      '',
      'Checks V38 Gate 7 ReadFitsFindingSynthesis depository search, embeddings, source-safe receipt, docs, and workflow wiring.',
      'Use --skip-package-tests only in lightweight workflow posture jobs that do not install pnpm dependencies.',
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
    pointer === 'V37',
    `BITCODE_SPEC.txt must remain V37 during V38 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v38' || /^v38\/gate-(?:[7-9]|10|11)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V38 Gate 7+ work must occur on version/v38 or v38/gate-7..11-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    '.proofs/v38/inference-surface-inventory.json',
    '.proofs/v38/ptrr-failsafe-thricified-stack.json',
    '.proofs/v38/prompt-benchmark-report.json',
    '.proofs/v38/disclosure-boundary-report.json',
    '.proofs/v38/read-need-comprehension-inference-hardening.json',
    'scripts/specifying/src/canonical/read-fits-finding-search-embeddings.js',
    'scripts/specifying/test/v38-read-fits-finding-search-embeddings.test.js',
    'scripts/generate-v38-read-fits-finding-search-embeddings.mjs',
    'scripts/check-v38-gate7-read-fits-finding-search-embeddings.mjs',
    'packages/asset-packs-pipelines/syntheses/domain/src/depository-search.ts',
    'packages/asset-packs-pipelines/syntheses/domain/src/embedding-config.ts',
    'packages/asset-packs-pipelines/syntheses/read/src/reading-pipeline-contract.ts',
    'packages/asset-packs-pipelines/syntheses/domain/src/__tests__/depository-search.test.ts',
    'packages/asset-packs-pipelines/syntheses/domain/src/__tests__/embedding-config.test.ts',
    'packages/asset-packs-pipelines/syntheses/domain/src/__tests__/reading-pipeline-contract.test.ts',
    'apps/uapi/lib/search.ts',
    'apps/uapi/app/ (removed cockpit tree) ProductDepositReadWorkbench.tsx',
    '.specifications/BITCODE_SPEC_V38.md',
    '.specifications/BITCODE_SPEC_V38_DELTA.md',
    '.specifications/BITCODE_SPEC_V38_NOTES.md',
    '.specifications/BITCODE_SPEC_V38_PARITY_MATRIX.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'scripts/specifying/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V38 Gate 7 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v38-read-fits-finding-search-embeddings.mjs', '--check']);
    } catch (error) {
      failures.push(`V38 ReadFitsFindingSynthesis artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', [
        '--test',
        '--test-force-exit',
        'scripts/specifying/test/v38-read-fits-finding-search-embeddings.test.js',
      ]);
    } catch (error) {
      failures.push(`V38 ReadFitsFindingSynthesis protocol test failed: ${error.stderr || error.message}`);
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
        'src/__tests__/depository-search.test.ts',
        'src/__tests__/embedding-config.test.ts',
        'src/__tests__/reading-pipeline-contract.test.ts',
        '--runInBand',
        '--forceExit',
      ]);
    } catch (error) {
      failures.push(`ReadFitsFindingSynthesis package tests failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V38 Gate 7 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v38-read-fits-finding-search-embeddings', 'Gate 7 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v38.readFitsFindingSearchEmbeddings.v1', 'Gate 7 schemaId must match.');
    assertCheck(failures, artifact.version === 'V38' && artifact.currentTarget === 'V37', 'Gate 7 artifact must bind V38 over active V37.');
    assertCheck(failures, artifact.passed === true, 'Gate 7 artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-read-fits-finding-search-embeddings-metadata',
      'Gate 7 artifact must be source-safe metadata.',
    );
    assertCheck(failures, includesAll(artifact.requiredPhaseIds, REQUIRED_PHASE_IDS), 'Gate 7 artifact must cover all ReadFitsFindingSynthesis phases.');
    assertCheck(failures, includesAll(artifact.searchChannelIds, REQUIRED_SEARCH_CHANNEL_IDS), 'Gate 7 artifact must cover all search channels.');
    assertCheck(failures, includesAll(artifact.requiredReceiptFields, REQUIRED_RECEIPT_FIELDS), 'Gate 7 artifact must cover all receipt fields.');
    assertCheck(failures, artifact.coverage.phaseCount === 7, 'Gate 7 phase count must be 7.');
    assertCheck(failures, artifact.coverage.ptrrAgentCount === 8, 'Gate 7 PTRR agent count must be 8.');
    assertCheck(failures, artifact.coverage.ptrrStepCount === 32, 'Gate 7 PTRR step count must be 32.');
    assertCheck(failures, artifact.coverage.failsafeSequenceCount === 96, 'Gate 7 Failsafe sequence count must be 96.');
    assertCheck(failures, artifact.coverage.thricifiedGenerationCount === 96, 'Gate 7 ThricifiedGeneration count must be 96.');
    assertCheck(failures, artifact.coverage.providerCallSlotCount === 288, 'Gate 7 provider-call slot count must be 288.');
    assertCheck(failures, artifact.coverage.toolCount === 4, 'Gate 7 tool count must be 4.');
    assertCheck(failures, artifact.coverage.searchChannelCount === 7, 'Gate 7 search channel count must be 7.');
    assertCheck(failures, artifact.coverage.defaultMaxSelectedCandidates === 12, 'Gate 7 must allow broad above-threshold candidate carryforward.');
    assertCheck(failures, artifact.coverage.embeddingModel === 'text-embedding-3-small', 'Gate 7 must preserve the active embedding model.');
    assertCheck(failures, artifact.coverage.embeddingDimensions === 1536, 'Gate 7 must preserve 1536 embedding dimensions.');
    assertCheck(failures, artifact.coverage.vectorDistanceMetric === 'cosine', 'Gate 7 must preserve cosine matching.');
    assertCheck(failures, artifact.coverage.vectorMatchRpc === 'match_deliverable_vectors', 'Gate 7 must preserve vector match RPC.');
    assertCheck(failures, artifact.coverage.failedPredicateIds.length === 0, 'Gate 7 artifact must have no failed predicates.');
    assertCheck(failures, artifact.coverage.manyFitsDiscoveryCovered === true, 'Gate 7 must cover many-fit discovery.');
    assertCheck(failures, artifact.coverage.acceptedNeedRequiredForFindingFits === true, 'Gate 7 must require accepted Need.');
    assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Gate 7 artifact must be metadata-only.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Protected source must not be visible.');
    assertCheck(failures, artifact.coverage.rawProviderResponseVisible === false, 'Raw provider response must not be visible.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Unpaid AssetPack source must not be visible.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Credentials must not be serialized.');
    assertCheck(failures, artifact.coverage.legacySourceRoots === false, 'Gate 7 artifact must not point at _legacy roots.');
  }

  const spec = read(root, '.specifications/BITCODE_SPEC_V38.md');
  const delta = read(root, '.specifications/BITCODE_SPEC_V38_DELTA.md');
  const notes = read(root, '.specifications/BITCODE_SPEC_V38_NOTES.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V38_PARITY_MATRIX.md');
  const roadmap = read(root, '.specifications/SPECIFICATIONS_ROADMAP.md');
  const readme = read(root, 'README.md');
  const protocolReadme = read(root, 'scripts/specifying/README.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  const index = read(root, 'scripts/specifying/src/index.js');
  const typeDefs = read(root, 'scripts/specifying/src/index.d.ts');

  assertCheck(failures, spec.includes('V38ReadFitsFindingSearchEmbeddings'), 'V38 spec must name the Gate 7 report.');
  assertCheck(failures, delta.includes('Gate 7: ReadFitsFindingSynthesis Depository Search And Embeddings'), 'V38 delta must include Gate 7.');
  assertCheck(failures, notes.includes('V38ReadFitsFindingSearchEmbeddings'), 'V38 notes must name the Gate 7 report.');
  assertCheck(failures, parity.includes('| ReadFitsFindingSynthesis depository search and embeddings | Gate 7 |') && parity.includes('| closed |'), 'V38 parity must close the Gate 7 row.');
  assertCheck(failures, roadmap.includes('V38 Gate 7 closure anchor'), 'Roadmap must include the Gate 7 closure anchor.');
  assertCheck(failures, readme.includes('check:v38-gate7'), 'README must document the Gate 7 check.');
  assertCheck(failures, protocolReadme.includes('v38-read-fits-finding-search-embeddings'), 'Protocol README must document the Gate 7 artifact.');
  assertCheck(failures, packageJson.includes('check:v38-gate7') && packageJson.includes('generate:v38-read-fits-finding-search-embeddings'), 'package.json must expose Gate 7 scripts.');
  assertCheck(failures, gateWorkflow.includes('check:v38-gate7') && gateWorkflow.includes('v38-read-fits-finding-search-embeddings.test.js'), 'Gate workflow must run Gate 7 checks/tests.');
  assertCheck(failures, canonWorkflow.includes('check:v38-gate7'), 'Canon workflow must run Gate 7 check.');
  assertCheck(failures, index.includes('buildV38ReadFitsFindingSearchEmbeddings'), 'Protocol JS index must export Gate 7 builder.');
  assertCheck(failures, typeDefs.includes('buildV38ReadFitsFindingSearchEmbeddings'), 'Protocol type index must export Gate 7 builder.');

  if (failures.length) {
    process.stderr.write('V38 Gate 7 ReadFitsFindingSynthesis depository search and embeddings check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V38 Gate 7 ReadFitsFindingSynthesis search embeddings ok phases=7 ptrrSteps=32 channels=7 thricified=96\n');
}

main();
