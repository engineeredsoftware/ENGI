#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v39-depository-supply-indexing.json';

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
      'Usage: node scripts/check-v39-gate2-depository-supply-indexing.mjs [--skip-branch-check] [--skip-package-tests] [--repo-root <path>]',
      '',
      'Checks V39 Gate 2 Depository supply indexing, source-safe search documents, vector projections, rights boundaries, repair posture, docs, and proof artifact.',
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
      branch === 'version/v39' || /^v39\/gate-(?:2|[3-9]|10|11)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V39 Gate 2+ work must occur on version/v39 or v39/gate-2..11-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'packages/asset-packs-pipelines/domain/src/depository-supply-index.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/depository-supply-index.test.ts',
    'packages/asset-packs-pipelines/domain/src/depository-search.ts',
    'packages/asset-packs-pipelines/domain/src/embedding-config.ts',
    'packages/asset-packs-pipelines/domain/src/index.ts',
    'packages/asset-packs-pipelines/domain/package.json',
    'packages/asset-packs-pipelines/domain/README.md',
    'scripts/specifying/src/canonical/v39-depository-supply-indexing.js',
    'scripts/specifying/test/v39-depository-supply-indexing.test.js',
    'scripts/generate-v39-depository-supply-indexing.mjs',
    'scripts/check-v39-gate2-depository-supply-indexing.mjs',
    'BITCODE_SPEC_V39.md',
    'BITCODE_SPEC_V39_DELTA.md',
    'BITCODE_SPEC_V39_NOTES.md',
    'BITCODE_SPEC_V39_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V39 Gate 2 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v39-depository-supply-indexing.mjs', '--check']);
    } catch (error) {
      failures.push(`V39 Depository supply indexing artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', [
        '--test',
        '--test-force-exit',
        'scripts/specifying/test/v39-depository-supply-indexing.test.js',
      ]);
    } catch (error) {
      failures.push(`V39 Depository supply indexing protocol test failed: ${error.stderr || error.message}`);
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
        'src/__tests__/depository-supply-index.test.ts',
        'src/__tests__/depository-search.test.ts',
        '--runInBand',
        '--forceExit',
      ]);
    } catch (error) {
      failures.push(`Depository supply package tests failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V39 Gate 2 artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v39-depository-supply-indexing', 'Gate 2 artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v39.depositorySupplyIndexing.v1', 'Gate 2 schemaId must match.');
    assertCheck(failures, artifact.version === 'V39' && artifact.currentTarget === 'V38', 'Gate 2 artifact must bind V39 over active V38.');
    assertCheck(failures, artifact.passed === true, 'Gate 2 artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-depository-supply-indexing-metadata',
      'Gate 2 artifact must declare source-safe Depository supply metadata.',
    );
    assertCheck(failures, artifact.coverage.rowCount === 7, 'Gate 2 must cover seven Depository supply rows.');
    assertCheck(failures, artifact.coverage.embeddingModel === 'text-embedding-3-small', 'Gate 2 must preserve active embedding model.');
    assertCheck(failures, artifact.coverage.embeddingDimensions === 1536, 'Gate 2 must preserve active embedding dimensions.');
    assertCheck(failures, artifact.coverage.vectorMatchRpc === 'match_deliverable_vectors', 'Gate 2 must preserve vector match RPC.');
    assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Gate 2 must remain source-safe metadata only.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Gate 2 artifact must not expose protected source.');
    assertCheck(failures, artifact.coverage.findingFitsHandoffCovered === true, 'Gate 2 must cover Finding Fits handoff.');
    assertCheck(failures, artifact.coverage.rightsBoundaryCovered === true, 'Gate 2 must cover depositor/reader rights boundary.');
    assertCheck(failures, artifact.coverage.repairActionsCovered === true, 'Gate 2 must cover repair actions.');
    assertCheck(failures, artifact.coverage.legacySourceRoots === false, 'Gate 2 must not rely on legacy source roots.');
    assertCheck(failures, Array.isArray(artifact.coverage.failedPredicateIds) && artifact.coverage.failedPredicateIds.length === 0, 'Gate 2 predicates must all pass.');
  }

  const spec = read(root, 'BITCODE_SPEC_V39.md');
  const parity = read(root, 'BITCODE_SPEC_V39_PARITY_MATRIX.md');
  const readme = read(root, 'packages/asset-packs-pipelines/domain/README.md');
  assertCheck(failures, spec.includes('DepositorySupplyIndex'), 'V39 spec must name DepositorySupplyIndex.');
  assertCheck(failures, spec.includes('source-safe search documents'), 'V39 spec must describe source-safe search documents.');
  assertCheck(failures, parity.includes('Gate 2 Parity'), 'V39 parity matrix must include Gate 2 parity.');
  assertCheck(failures, readme.includes('Depository Supply Index'), 'AssetPack README must document Depository Supply Index.');

  if (failures.length > 0) {
    process.stderr.write(`V39 Gate 2 Depository supply indexing check failed:\n- ${failures.join('\n- ')}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V39 Gate 2 Depository supply indexing ok artifact=${artifact.artifactRoot}\n`);
}

main();
